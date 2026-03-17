#!/usr/bin/env node

/**
 * Poll platform deployment URLs to monitor build completion and record metrics to database
 * Uses HTTP polling to check /api/build-info endpoint for commit SHA
 * This runs after trigger-builds.js in GitHub Actions
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const POLL_INTERVAL_MS = 10000; // 10 seconds
const MAX_WAIT_TIME_MS = 60 * 60 * 1000; // 60 minutes
// TODO: Re-enable 'vercel' and 'netlify' when ready
const PLATFORMS = ['pantheon'];

class BenchmarkRecorder {
  constructor() {
    this.client = null;
    this.runId = null;
  }

  async connect() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL not set');
    }

    this.client = new Client({ connectionString });
    await this.client.connect();
    console.log('✅ Connected to database');
  }

  async disconnect() {
    if (this.client) {
      await this.client.end();
      console.log('Disconnected from database');
    }
  }

  async createBenchmarkRun(notes = null) {
    const result = await this.client.query(
      `INSERT INTO benchmark_runs (run_timestamp, trigger_type, notes)
       VALUES (NOW(), $1, $2)
       RETURNING id`,
      [process.env.GITHUB_EVENT_NAME || 'scheduled', notes]
    );

    this.runId = result.rows[0].id;
    console.log(`✅ Created benchmark run #${this.runId}`);
    return this.runId;
  }

  async recordBuildStart(platform, triggerTime, buildId = null) {
    const result = await this.client.query(
      `INSERT INTO platform_builds
       (run_id, platform, trigger_time, status, build_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [this.runId, platform, triggerTime, 'in_progress', buildId]
    );

    return result.rows[0].id;
  }

  async updateBuildCompletion(buildRecordId, completionTime, status, errorMessage = null, metadata = null) {
    await this.client.query(
      `UPDATE platform_builds
       SET completion_time = $1,
           duration_seconds = EXTRACT(EPOCH FROM ($1 - trigger_time)),
           status = $2,
           error_message = $3,
           metadata = $4
       WHERE id = $5`,
      [completionTime, status, errorMessage, JSON.stringify(metadata), buildRecordId]
    );
  }
}

class HttpPoller {
  constructor(platform, deploymentUrl) {
    this.platform = platform;
    this.deploymentUrl = deploymentUrl;
  }

  /**
   * Fetch URL and return response body
   */
  async fetchUrl(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      protocol.get(url, { timeout: 10000 }, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({ status: res.statusCode, body: data });
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Check if deployment is live with expected commit SHA
   * First tries /api/build-info, falls back to HTML meta tag
   */
  async checkDeployment(expectedCommitSha) {
    try {
      // Try API endpoint first
      const buildInfoUrl = `${this.deploymentUrl}/api/build-info`;
      const response = await this.fetchUrl(buildInfoUrl);

      if (response.status === 200) {
        const buildInfo = JSON.parse(response.body);
        const liveCommitSha = buildInfo.commitSha;

        if (liveCommitSha === expectedCommitSha) {
          return {
            deployed: true,
            method: 'api',
            metadata: buildInfo
          };
        } else {
          return {
            deployed: false,
            liveCommitSha,
            expectedCommitSha,
            method: 'api'
          };
        }
      }
    } catch (error) {
      console.log(`[${this.platform}] API endpoint failed, trying HTML fallback...`);
    }

    // Fallback to HTML meta tag
    try {
      const response = await this.fetchUrl(this.deploymentUrl);

      if (response.status === 200) {
        const match = response.body.match(/name="deployment-sha"\s+content="([^"]+)"/);

        if (match) {
          const liveCommitSha = match[1];

          if (liveCommitSha === expectedCommitSha) {
            return {
              deployed: true,
              method: 'html',
              metadata: { liveCommitSha }
            };
          } else {
            return {
              deployed: false,
              liveCommitSha,
              expectedCommitSha,
              method: 'html'
            };
          }
        }
      }
    } catch (error) {
      console.error(`[${this.platform}] HTML fallback failed:`, error.message);
    }

    // If both methods fail
    return {
      deployed: false,
      error: 'Unable to check deployment status'
    };
  }
}

async function pollUntilDeployed(poller, expectedCommitSha, maxWaitMs) {
  const startTime = Date.now();
  let lastLiveCommitSha = null;

  while (true) {
    const elapsed = Date.now() - startTime;

    if (elapsed > maxWaitMs) {
      console.log(`[${poller.platform}] ⏱️  Timeout after ${elapsed / 1000}s`);
      return {
        status: 'timeout',
        completionTime: new Date(),
        metadata: { timeout: true, lastLiveCommitSha }
      };
    }

    try {
      const checkResult = await poller.checkDeployment(expectedCommitSha);

      if (checkResult.deployed) {
        const duration = (Date.now() - startTime) / 1000;
        const methodDescription = checkResult.method === 'api'
          ? 'detected via /api/build-info endpoint'
          : 'detected via HTML meta tag';
        console.log(`[${poller.platform}] ✅ Deployed in ${duration.toFixed(2)}s (${methodDescription})`);
        return {
          status: 'success',
          completionTime: new Date(),
          metadata: {
            duration,
            method: checkResult.method,
            ...checkResult.metadata
          }
        };
      }

      // Log progress
      if (checkResult.liveCommitSha !== lastLiveCommitSha) {
        console.log(`[${poller.platform}] 🔄 Live SHA: ${checkResult.liveCommitSha?.substring(0, 7) || 'unknown'}, Expected: ${expectedCommitSha.substring(0, 7)}`);
        console.log(`[${poller.platform}] 📊 Full Live SHA: ${checkResult.liveCommitSha || 'unknown'}`);
        console.log(`[${poller.platform}] 📊 Full Expected SHA: ${expectedCommitSha}`);
        lastLiveCommitSha = checkResult.liveCommitSha;
      }

      console.log(`[${poller.platform}] ⏳ Waiting for deployment... (${(elapsed / 1000).toFixed(0)}s elapsed)`);
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

    } catch (error) {
      console.error(`[${poller.platform}] ❌ Error polling:`, error.message);
      return {
        status: 'failure',
        completionTime: new Date(),
        metadata: { error: error.message }
      };
    }
  }
}

async function main() {
  console.log('🔍 Starting deployment monitoring via HTTP polling...\n');

  const recorder = new BenchmarkRecorder();
  const triggerResults = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'trigger-results.json'), 'utf8')
  );

  // Get deployment URLs from environment
  const deploymentUrls = {
    pantheon: process.env.PANTHEON_SITE_URL,
    vercel: process.env.VERCEL_SITE_URL,
    netlify: process.env.NETLIFY_SITE_URL,
  };

  // Validate URLs
  for (const platform of PLATFORMS) {
    if (!deploymentUrls[platform]) {
      console.error(`❌ Missing ${platform.toUpperCase()}_SITE_URL environment variable`);
      process.exit(1);
    }
  }

  try {
    await recorder.connect();
    await recorder.createBenchmarkRun(process.env.RUN_NOTES);

    // Create pollers for each platform
    const pollers = PLATFORMS.map(platform => {
      return new HttpPoller(platform, deploymentUrls[platform]);
    });

    // Poll all platforms in parallel
    const monitoringTasks = triggerResults.map(async (triggerResult) => {
      if (!triggerResult.triggered) {
        console.log(`[${triggerResult.platform}] ⏭️  Skipped (not triggered)`);
        return;
      }

      const platform = triggerResult.platform;
      const poller = pollers.find(p => p.platform === platform);

      if (!poller) {
        console.error(`[${platform}] ❌ No poller available`);
        return;
      }

      // Record build start
      const triggerTime = new Date(triggerResult.timestamp);
      const buildRecordId = await recorder.recordBuildStart(
        platform,
        triggerTime,
        triggerResult.commitHash
      );

      console.log(`[${platform}] 📊 Monitoring deployment for commit ${triggerResult.commitHash.substring(0, 7)}...`);

      // Poll until deployed
      const result = await pollUntilDeployed(
        poller,
        triggerResult.commitHash,
        MAX_WAIT_TIME_MS
      );

      // Record completion
      await recorder.updateBuildCompletion(
        buildRecordId,
        result.completionTime,
        result.status,
        result.metadata?.error || null,
        result.metadata
      );
    });

    await Promise.all(monitoringTasks);

    console.log('\n✨ All deployments monitored and recorded');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await recorder.disconnect();
  }
}

main();
