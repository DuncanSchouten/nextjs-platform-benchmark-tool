# GitHub Secrets Configuration

## ✅ Configured Secrets

All required GitHub Actions secrets have been configured for this repository.

### Database Connection

**DATABASE_URL**
- PostgreSQL connection string for Cloud SQL instance
- Format: `postgresql://postgres:<PASSWORD>@34.55.232.223/benchmarks`
- Used by: `poll-and-record.js` for storing benchmark results

### Repository Access

**BENCHMARK_REPO_PAT**
- Personal Access Token with `repo` scope
- Used by: `trigger-builds.js` for pushing to benchmark repos
- Pushes to:
  - pantheon-benchmark
  - vercel-benchmark
  - netlify-benchmark

### Deployment URLs

**PANTHEON_SITE_URL**
- URL: `https://dev-pantheon-next-js-benchmark-site.pantheonsite.io`
- Used by: `poll-and-record.js` to check deployment completion

**VERCEL_SITE_URL**
- URL: `https://vercel-benchmark.vercel.app`
- Used by: `poll-and-record.js` to check deployment completion

**NETLIFY_SITE_URL**
- URL: `https://netlify-nextjs-benchmark-app.netlify.app`
- Used by: `poll-and-record.js` to check deployment completion

## Verification

You can verify the secrets are configured:

```bash
gh secret list
```

Output should show:
```
BENCHMARK_REPO_PAT    2026-01-26T06:36:30Z
DATABASE_URL          2026-01-26T06:35:04Z
NETLIFY_SITE_URL      2026-01-26T06:35:24Z
PANTHEON_SITE_URL     2026-01-26T06:35:12Z
VERCEL_SITE_URL       2026-01-26T06:35:19Z
```

## Workflow Usage

These secrets are used in `.github/workflows/benchmark.yml`:

```yaml
- name: Trigger builds on all platforms
  env:
    GITHUB_TOKEN: ${{ secrets.BENCHMARK_REPO_PAT }}
  run: node scripts/trigger-builds.js

- name: Poll deployment URLs and record metrics
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    PANTHEON_SITE_URL: ${{ secrets.PANTHEON_SITE_URL }}
    VERCEL_SITE_URL: ${{ secrets.VERCEL_SITE_URL }}
    NETLIFY_SITE_URL: ${{ secrets.NETLIFY_SITE_URL }}
  run: node scripts/poll-and-record.js
```

## Running Deployments Locally

When running the deployment script locally (outside of GitHub Actions), you need to provide a `GITHUB_TOKEN` environment variable. The easiest way to do this is using the GitHub CLI:

```bash
# Trigger builds on all platforms with your local GitHub token
GITHUB_TOKEN=$(gh auth token) node scripts/trigger-builds.js
```

**Prerequisites:**
- GitHub CLI (`gh`) must be installed and authenticated
- Run `gh auth status` to verify you're logged in
- Your GitHub account must have write access to the benchmark repositories

**Authentication:**
```bash
# Check if you're authenticated
gh auth status

# If not authenticated, log in
gh auth login

# Verify your token has the required scopes (should include 'repo')
gh auth status
```

The `gh auth token` command retrieves your current GitHub CLI authentication token, which has the necessary permissions to push to the benchmark repositories.

## Security Notes

- **DATABASE_URL**: Contains database password - keep secure
- **BENCHMARK_REPO_PAT**: Has write access to benchmark repos - rotate periodically
- **Site URLs**: Public URLs, but stored as secrets for easy configuration
- **Local GITHUB_TOKEN**: When using `gh auth token`, the token is temporary and tied to your local session

## Next Steps

With secrets configured, you can now:
1. ✅ Trigger builds manually: `gh workflow run benchmark.yml`
2. ✅ Test the complete benchmark workflow
3. ✅ Schedule daily automated benchmarks (already configured via cron)
