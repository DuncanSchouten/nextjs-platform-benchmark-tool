import type { NextConfig } from "next";
import { execSync } from 'child_process';

// Get commit SHA at build time
const getCommitSha = () => {
  try {
    // Try environment variables first (Vercel, Netlify provide these)
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      return process.env.VERCEL_GIT_COMMIT_SHA;
    }
    if (process.env.NETLIFY_COMMIT_REF) {
      return process.env.NETLIFY_COMMIT_REF;
    }
    if (process.env.COMMIT_SHA) {
      return process.env.COMMIT_SHA;
    }

    // Try commit-sha.json file (for Pantheon, created by trigger-builds.js)
    // This file contains the parent commit's SHA, which is what we deployed
    try {
      const fs = require('fs');
      const path = require('path');
      const commitShaPath = path.join(process.cwd(), 'commit-sha.json');
      if (fs.existsSync(commitShaPath)) {
        const data = JSON.parse(fs.readFileSync(commitShaPath, 'utf8'));
        if (data.commitSha) {
          console.log('✅ Using commit SHA from commit-sha.json (parent commit)');
          return data.commitSha;
        }
      }
    } catch (err) {
      console.warn('Could not read commit-sha.json:', err instanceof Error ? err.message : String(err));
    }

    // Also try getting parent commit SHA if we're in a git repo
    // (This handles the case where we're on the "Add commit SHA metadata" commit)
    try {
      const parentSha = execSync('git rev-parse HEAD^').toString().trim();
      if (parentSha && parentSha.length === 40) {
        console.log('✅ Using parent commit SHA from git');
        return parentSha;
      }
    } catch (err) {
      // Git not available or no parent commit
    }

    // Fallback: extract from git (works when .git is available)
    const sha = execSync('git rev-parse HEAD').toString().trim();
    return sha;
  } catch (error) {
    console.warn('Could not determine commit SHA:', error);
    return 'unknown';
  }
};

const commitSha = getCommitSha();
console.log('🔍 Build-time commit SHA:', commitSha);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitSha,
  },
};

export default nextConfig;
