# Cloud SQL Setup Complete

## Instance Details

- **Project ID:** nextjs-platform-benchmarking
- **Instance Name:** benchmark-db
- **Database Name:** benchmarks
- **Region:** us-central1-c
- **Tier:** db-f1-micro
- **IP Address:** 34.55.232.223
- **Connection Name:** nextjs-platform-benchmarking:us-central1:benchmark-db
- **Database Version:** POSTGRES_15

## Database Schema

✅ Migrations completed successfully:
- `benchmark_runs` table created
- `platform_builds` table created
- All indexes created
- Database ready for use

## GitHub Secrets Configuration

You need to configure the following secrets in your GitHub repository:

### 1. DATABASE_URL

For direct connection (current setup):
```
postgresql://postgres:TempPass123@34.55.232.223/benchmarks
```

### 2. BENCHMARK_REPO_PAT

Personal Access Token for pushing to benchmark repos (pantheon-benchmark, vercel-benchmark, netlify-benchmark).

Generate at: https://github.com/settings/tokens

Required scopes:
- `repo` (Full control of private repositories)

### 3. Site URLs

- **PANTHEON_SITE_URL** - URL of your Pantheon deployment
- **VERCEL_SITE_URL** - URL of your Vercel deployment
- **NETLIFY_SITE_URL** - URL of your Netlify deployment

## Production Recommendations

### Use Cloud SQL Proxy in GitHub Actions

For better security, update `.github/workflows/benchmark.yml` to use Cloud SQL Proxy:

```yaml
- name: Setup Cloud SQL Proxy
  run: |
    curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.amd64
    chmod +x cloud-sql-proxy
    ./cloud-sql-proxy nextjs-platform-benchmarking:us-central1:benchmark-db &
    sleep 3

- name: Poll deployment URLs and record metrics
  env:
    DATABASE_URL: postgresql://postgres:TempPass123@localhost/benchmarks
    # ... other env vars
```

### Create Service Account for GitHub Actions

1. Create a service account:
```bash
gcloud iam service-accounts create github-actions-benchmark \
  --display-name="GitHub Actions Benchmark"
```

2. Grant Cloud SQL Client role:
```bash
gcloud projects add-iam-policy-binding nextjs-platform-benchmarking \
  --member="serviceAccount:github-actions-benchmark@nextjs-platform-benchmarking.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

3. Create and download key:
```bash
gcloud iam service-accounts keys create ~/github-actions-key.json \
  --iam-account=github-actions-benchmark@nextjs-platform-benchmarking.iam.gserviceaccount.com
```

4. Add `GCP_SERVICE_ACCOUNT_KEY` secret to GitHub with the contents of `github-actions-key.json`

## Cost Estimate

- **Cloud SQL (db-f1-micro):** ~$20-50/month
- **Storage (10GB HDD):** ~$1.70/month
- **Backups:** Included

**Total:** ~$22-52/month

## Connection Testing

Test the connection locally:
```bash
PGPASSWORD="TempPass123" psql -h 34.55.232.223 -U postgres -d benchmarks -c "SELECT NOW();"
```

Test with connection string:
```bash
psql "postgresql://postgres:TempPass123@34.55.232.223/benchmarks" -c "\dt"
```

## Next Steps

1. ✅ Cloud SQL instance created
2. ✅ Database created
3. ✅ Migrations run
4. ⏭️ Configure GitHub Secrets
5. ⏭️ Update site URLs for deployment tracking
6. ⏭️ Test end-to-end benchmark workflow
