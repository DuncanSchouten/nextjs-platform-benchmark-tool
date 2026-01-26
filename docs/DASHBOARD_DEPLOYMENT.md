# Dashboard Deployment to Pantheon

## Overview

The dashboard is a Next.js application that displays benchmark results from the Cloud SQL database. It's deployed to Pantheon to provide internal visibility into platform performance.

## Prerequisites

- Pantheon site created for the dashboard
- DATABASE_URL environment variable configured in Pantheon
- Dashboard code pushed to Pantheon git repository

## Deployment Files

### `Procfile`
Tells Pantheon how to start the application:
```
web: npm run start
```

### `project.toml`
Configures the Google Cloud Buildpack for Node.js:
- Sets NODE_ENV=production
- Specifies the nodejs buildpack
- Includes necessary files for the build

### `pantheon.yml`
Pantheon-specific configuration:
- Node.js version: 20
- Build command: `npm run build`
- Start command: `npm run start`
- Port: 3000

## Deployment Steps

### 1. Create Pantheon Site

```bash
# Create a new Pantheon site for the dashboard
terminus site:create benchmark-dashboard "Benchmark Dashboard" "Next.js"
```

### 2. Get Git Remote

```bash
# Get the git remote URL for the dashboard site
terminus connection:info benchmark-dashboard.dev --field=git_url
```

### 3. Configure Environment Variables

Set the DATABASE_URL in Pantheon:

```bash
# Set DATABASE_URL environment variable
terminus env:set benchmark-dashboard.dev DATABASE_URL "postgresql://postgres:TempPass123!@34.55.232.223/benchmarks"
```

### 4. Deploy Dashboard

From the monorepo root:

```bash
# Add Pantheon remote (first time only)
cd dashboard
git init
git remote add pantheon <git-url-from-step-2>

# Deploy
git add -A
git commit -m "Deploy dashboard to Pantheon"
git push pantheon main -f
```

## Build Process

When you push to Pantheon, the build process:

1. **Detects Node.js** - Google Cloud Buildpack recognizes package.json
2. **Installs dependencies** - Runs `npm ci`
3. **Builds Next.js app** - Runs `npm run build`
4. **Starts server** - Uses Procfile command: `npm run start`

## Troubleshooting

### Issue: "Cannot find module '/workspace/index.js'"

**Solution:** Ensure Procfile exists with:
```
web: npm run start
```

### Issue: Build succeeds but app doesn't start

**Solution:** Check that:
- `npm run build` creates `.next` directory
- `npm run start` works locally
- DATABASE_URL is set in Pantheon environment

### Issue: Database connection fails

**Solution:**
- Verify DATABASE_URL is correct in Pantheon
- Check Cloud SQL instance is accessible from Pantheon's IP
- Consider using Cloud SQL Proxy for production

## Environment Variables

Required in Pantheon dashboard environment settings:

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | `postgresql://postgres:PASSWORD@34.55.232.223/benchmarks` |

## Monitoring

After deployment:

1. **Check build logs:**
   ```bash
   terminus build:log:get benchmark-dashboard.dev
   ```

2. **Check application logs:**
   ```bash
   terminus logs:list benchmark-dashboard.dev
   ```

3. **Test the dashboard:**
   Visit: `https://dev-benchmark-dashboard.pantheonsite.io`

## Production Considerations

### Security

1. **Use Cloud SQL Proxy** instead of direct connection:
   - More secure than direct IP access
   - No need to allowlist IPs
   - Better for production environments

2. **Implement Authentication**:
   - Add Google SSO (deferred to Phase 2)
   - Restrict to `@pantheon.io` domain

### Performance

1. **Enable caching** for dashboard queries
2. **Add indexes** to database for common queries (already done)
3. **Use connection pooling** (already configured in lib/db.ts)

## Current Status

- ✅ Dashboard code ready
- ✅ Deployment configuration files created
- ✅ DATABASE_URL available
- ⏭️ Need to push to Pantheon git remote
- ⏭️ Need to set DATABASE_URL in Pantheon environment

## Next Steps

1. Create Pantheon site or get existing git remote
2. Set DATABASE_URL environment variable
3. Push dashboard code to Pantheon
4. Verify deployment and test dashboard
5. Configure custom domain (optional)
