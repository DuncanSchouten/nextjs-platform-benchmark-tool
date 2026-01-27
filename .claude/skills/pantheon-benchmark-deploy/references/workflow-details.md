# Platform Benchmark Workflow

## Overview

The Platform Benchmark workflow compares deployment performance across multiple hosting platforms: Pantheon, Vercel, and Netlify.

## Workflow Location

`.github/workflows/benchmark.yml`

## Trigger Methods

1. **Scheduled**: Runs daily at 2:00 AM UTC (6:00 PM PST previous day)
2. **Manual**: Via `workflow_dispatch` with optional notes input

## Workflow Steps

1. **Setup**: Checkout repository, setup Node.js 20, install dependencies (pg, @types/node)
2. **Trigger Builds**: Runs `scripts/trigger-builds.js` to initiate deployments on all platforms
3. **Poll & Record**: Runs `scripts/poll-and-record.js` to:
   - Monitor deployment URLs
   - Measure performance metrics
   - Record results to database
4. **Artifact Upload**: Saves logs and JSON data (30-day retention)

## Environment Variables Required

- `GITHUB_TOKEN`: For triggering builds (uses `BENCHMARK_REPO_PAT` secret)
- `DATABASE_URL`: PostgreSQL connection string for storing metrics
- `PANTHEON_SITE_URL`: Pantheon deployment URL
- `VERCEL_SITE_URL`: Vercel deployment URL
- `NETLIFY_SITE_URL`: Netlify deployment URL
- `RUN_NOTES`: Optional notes from workflow input

## Concurrency

Only one benchmark run can execute at a time (no cancellation of in-progress runs).

## Timeout

90 minutes maximum execution time
