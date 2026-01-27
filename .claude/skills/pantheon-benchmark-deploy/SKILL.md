---
name: pantheon-benchmark-deploy
description: Trigger the GitHub Actions workflow that benchmarks deployment performance across Pantheon, Vercel, and Netlify hosting platforms. Use when the user requests to deploy, run, or trigger the benchmark app or workflow.
---

# Pantheon Benchmark Deploy

## Overview

Trigger the Platform Benchmark GitHub Actions workflow that measures and compares deployment performance across multiple hosting platforms (Pantheon, Vercel, and Netlify).

## When to Use This Skill

Use this skill when the user requests:
- "Deploy the benchmark app"
- "Trigger the benchmark workflow"
- "Run the benchmark"
- "Start a benchmark deployment"
- "Kick off a benchmark run"

## Triggering a Benchmark Run

To trigger the benchmark workflow manually:

1. **Use the provided script**: Execute `scripts/trigger-benchmark.sh` with optional notes:
   ```bash
   bash scripts/trigger-benchmark.sh "Testing new deployment changes"
   ```

   If no notes are provided, default notes will be used.

2. **Prerequisites check**: The script automatically verifies:
   - GitHub CLI (`gh`) is installed
   - User is authenticated with GitHub

3. **Monitoring the run**: After triggering, suggest the user can:
   - View all workflow runs: `gh run list --workflow=benchmark.yml`
   - Watch the latest run in real-time: `gh run watch`

## Alternative: Direct GitHub CLI Usage

If the user prefers direct GitHub CLI commands:

```bash
gh workflow run benchmark.yml --field notes="Your notes here"
```

## What the Workflow Does

The benchmark workflow:
1. Triggers builds on all three platforms simultaneously
2. Polls deployment URLs to measure performance
3. Records metrics to a PostgreSQL database
4. Uploads logs and JSON artifacts for analysis

For detailed workflow information, refer to `references/workflow-details.md`.

## Workflow Schedule

The workflow runs automatically:
- **Daily**: 2:00 AM UTC (6:00 PM PST previous day)
- **Manual**: On-demand via `workflow_dispatch`

## Troubleshooting

**GitHub CLI not installed:**
- Direct user to install from: https://cli.github.com/

**Not authenticated:**
- Run: `gh auth login`

**Workflow not found:**
- Verify the repository context is correct
- Ensure `.github/workflows/benchmark.yml` exists
