# Repository Transfer Guide

This guide covers moving the project between personal and organization accounts.

## Current Setup (Personal Org)

**Main Repository:** `DuncanSchouten/nextjs-platform-benchmark-tool`

**Platform Repositories:**
- `DuncanSchouten/pantheon-benchmark`
- `DuncanSchouten/vercel-benchmark`
- `DuncanSchouten/netlify-benchmark`

## Initial Setup in Personal Org

### 1. Create Main Repo

```bash
# Already done - just push to it
git remote set-url origin https://github.com/DuncanSchouten/nextjs-platform-benchmark-tool.git
git push -u origin main
```

### 2. Create Platform Repos

```bash
# Create three repos
gh repo create DuncanSchouten/pantheon-benchmark --public
gh repo create DuncanSchouten/vercel-benchmark --public
gh repo create DuncanSchouten/netlify-benchmark --public
```

### 3. Configure GitHub Secrets (Personal)

Go to: https://github.com/DuncanSchouten/nextjs-platform-benchmark-tool/settings/secrets/actions

Add:
- `GCP_PROJECT_ID` - Pantheon's GCP project ID
- `GCP_SERVICE_ACCOUNT_JSON` - Service account JSON
- `DATABASE_URL` - Cloud SQL connection string
- `BENCHMARK_REPO_PAT` - Your personal GitHub token
- `VERCEL_API_TOKEN` - From your Vercel account
- `NETLIFY_API_TOKEN` - From your Netlify account

### 4. Connect Platform Repos

**Pantheon:**
- Use your personal Pantheon account or create test site
- Connect to `DuncanSchouten/pantheon-benchmark`

**Vercel:**
- Import `DuncanSchouten/vercel-benchmark`

**Netlify:**
- Import `DuncanSchouten/netlify-benchmark`

---

## Transferring to Pantheon Systems

When ready to move to the company org, follow these steps:

### Step 1: Transfer Main Repository

**Via GitHub Web UI:**
1. Go to: https://github.com/DuncanSchouten/nextjs-platform-benchmark-tool/settings
2. Scroll to "Danger Zone"
3. Click "Transfer"
4. New owner: `pantheon-systems` (or appropriate org)
5. New name: `nextjs-platform-benchmark-tool`
6. Confirm transfer

**Result:** Repo will be at `pantheon-systems/nextjs-platform-benchmark-tool`

### Step 2: Transfer Platform Repositories

Repeat for each:
- `DuncanSchouten/pantheon-benchmark` → `pantheon-systems/pantheon-benchmark`
- `DuncanSchouten/vercel-benchmark` → `pantheon-systems/vercel-benchmark`
- `DuncanSchouten/netlify-benchmark` → `pantheon-systems/netlify-benchmark`

### Step 3: Update Code References

After transfer, update `scripts/trigger-builds.js`:

```javascript
const PLATFORMS = [
  {
    name: 'pantheon',
    repo: 'pantheon-systems/pantheon-benchmark', // Updated
    method: 'git'
  },
  {
    name: 'vercel',
    repo: 'pantheon-systems/vercel-benchmark', // Updated
    method: 'git'
  },
  {
    name: 'netlify',
    repo: 'pantheon-systems/netlify-benchmark', // Updated
    method: 'git'
  }
];
```

Commit and push:
```bash
git add scripts/trigger-builds.js
git commit -m "Update repo references to pantheon-systems org"
git push origin main
```

### Step 4: Reconfigure GitHub Secrets

**Important:** GitHub Secrets don't transfer!

Go to: https://github.com/pantheon-systems/nextjs-platform-benchmark-tool/settings/secrets/actions

Re-add all secrets:
- `GCP_PROJECT_ID`
- `GCP_SERVICE_ACCOUNT_JSON`
- `DATABASE_URL`
- `BENCHMARK_REPO_PAT` - **Use Pantheon org token, not personal**
- `VERCEL_API_TOKEN`
- `NETLIFY_API_TOKEN`

### Step 5: Reconnect Platform Deployments

**Pantheon:**
- Update site connection to point to `pantheon-systems/pantheon-benchmark`
- Or create new production benchmark site

**Vercel:**
- Go to project settings
- Update Git integration to `pantheon-systems/vercel-benchmark`
- Or reimport from new location

**Netlify:**
- Go to site settings → Build & Deploy
- Update repository to `pantheon-systems/netlify-benchmark`
- Or create new site

### Step 6: Update Local Clone

On your machine:
```bash
cd /path/to/nextjs-platform-benchmark-tool
git remote set-url origin https://github.com/pantheon-systems/nextjs-platform-benchmark-tool.git
git pull origin main
```

### Step 7: Test Transferred Setup

```bash
# Manual test with Pantheon org credentials
export GITHUB_TOKEN="pantheon-org-token"
export GCP_PROJECT_ID="..."
# ... other secrets ...

node scripts/trigger-builds.js
node scripts/poll-and-record.js
```

Verify:
- [ ] Builds trigger on all three platforms
- [ ] Polling finds and tracks builds
- [ ] Data records to database
- [ ] Dashboard shows results

### Step 8: Enable Automated Runs

- [ ] Verify GitHub Actions workflow runs on schedule
- [ ] Monitor first automated run
- [ ] Share dashboard access with Pantheon team

---

## What Changes When Transferring

### ✅ Automatically Updates
- GitHub repository URL
- Issues and PRs
- Git history and commits
- Branch structure
- Releases and tags

### ⚠️ Requires Manual Update
- **GitHub Secrets** - Must be re-added
- **Webhook URLs** - If using any webhooks
- **Deploy keys** - Platform connections
- **Code references** - Repository names in scripts
- **Documentation URLs** - Any hardcoded links
- **Personal Access Tokens** - Use org tokens

### 🔄 Platform Reconnections Needed
- **Pantheon site** - Reconnect to new repo URL
- **Vercel project** - Update Git integration
- **Netlify site** - Update repository link

---

## Rollback Plan (If Transfer Goes Wrong)

If something breaks during transfer:

### Option 1: Transfer Back
1. Transfer repos back to personal org
2. Restore all configurations
3. Fix issues
4. Try transfer again

### Option 2: Fresh Fork
1. Fork from Pantheon org back to personal
2. Work in fork until ready
3. Create PR to Pantheon org

### Option 3: Dual Maintenance
- Keep personal version for testing
- Pantheon version for production
- Sync changes between them

---

## Pre-Transfer Checklist

Before transferring to Pantheon Systems, ensure:

**Technical:**
- [ ] All code is working and tested
- [ ] Database migrations are stable
- [ ] Documentation is complete
- [ ] No personal credentials in code
- [ ] All TODOs are resolved or documented

**Organizational:**
- [ ] Approval to transfer to company org
- [ ] Pantheon org admin access (for transfer)
- [ ] Company GitHub token available
- [ ] Team members know about transfer
- [ ] Documented who has access

**Infrastructure:**
- [ ] Cloud SQL database accessible from Pantheon org
- [ ] GCP service account sharable with org
- [ ] Pantheon production site ready
- [ ] Vercel/Netlify accounts linked to org

---

## Testing Strategy

**In Personal Org (Now):**
1. ✅ Develop and test all features
2. ✅ Verify database schema
3. ✅ Validate API integrations
4. ✅ Run manual benchmarks
5. ✅ Test automated workflow
6. ✅ Build confidence it works

**After Transfer to Pantheon:**
1. ✅ Verify GitHub Actions still work
2. ✅ Confirm platform connections
3. ✅ Test one manual benchmark
4. ✅ Monitor first automated run
5. ✅ Share with team

---

## Timeline Recommendation

**Phase 1: Personal Org (2-4 weeks)**
- Build and test everything
- Prove the concept works
- Get GCP credentials from Pantheon
- Collect some benchmark data
- Validate dashboard is useful

**Phase 2: Transfer (1 day)**
- Transfer all repos
- Update configurations
- Reconnect platforms
- Test end-to-end

**Phase 3: Production (Ongoing)**
- Daily automated runs
- Team access and feedback
- Iterate and improve

---

## Quick Reference Commands

**Check current remote:**
```bash
git remote -v
```

**Change remote to personal:**
```bash
git remote set-url origin https://github.com/DuncanSchouten/nextjs-platform-benchmark-tool.git
```

**Change remote to Pantheon org:**
```bash
git remote set-url origin https://github.com/pantheon-systems/nextjs-platform-benchmark-tool.git
```

**Create platform repos:**
```bash
# Personal
gh repo create DuncanSchouten/pantheon-benchmark --public
gh repo create DuncanSchouten/vercel-benchmark --public
gh repo create DuncanSchouten/netlify-benchmark --public

# Pantheon org (after transfer)
gh repo create pantheon-systems/pantheon-benchmark --public
gh repo create pantheon-systems/vercel-benchmark --public
gh repo create pantheon-systems/netlify-benchmark --public
```

---

## Support During Transfer

If you encounter issues:

1. **GitHub Transfer Issues**
   - Check org membership and permissions
   - Verify 2FA is enabled
   - Contact GitHub support if stuck

2. **Platform Connection Issues**
   - Disconnect and reconnect integrations
   - Clear deploy hooks and re-add
   - Check platform-specific docs

3. **Workflow Issues**
   - Verify all secrets are re-added
   - Check Actions tab for error details
   - Test locally first with org credentials

4. **Database Issues**
   - Verify Cloud SQL allows connections from GitHub Actions IPs
   - Check DATABASE_URL is correct
   - Test connection with psql

---

## Future Considerations

**When tool is in Pantheon org:**

- **Access Control:** Limit who can modify workflows
- **Secret Rotation:** Plan for rotating API tokens
- **Cost Allocation:** Track Cloud SQL and GCP costs
- **Team Training:** Document for other team members
- **Maintenance:** Assign owner for updates

**Benefits of Starting Personal:**
- ✅ Faster iteration without approvals
- ✅ Test with personal accounts first
- ✅ Prove value before company investment
- ✅ Learn platform quirks safely
- ✅ Build confidence in architecture
