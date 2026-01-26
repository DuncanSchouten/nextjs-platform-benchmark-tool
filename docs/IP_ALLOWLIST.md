# Cloud SQL IP Allowlist Configuration

## Current Configuration

The Cloud SQL instance `benchmark-db` has been configured with the following IP allowlist:

### Allowed IP Addresses

1. **Local Development**: `99.199.18.88/32`
   - Your current local machine IP address
   - For local testing and development

2. **Public Access**: `0.0.0.0/0`
   - Allows connections from any IP address
   - Required for:
     - Pantheon (uses dynamic IPs, no predictable range)
     - GitHub Actions (large IP range: 4.148.0.0/16 - 4.255.128.0/17)

## Security Considerations

Since we're allowing connections from any IP (`0.0.0.0/0`), security relies on:

1. **Strong Password Authentication**
   - Database password: `TempPass123`
   - Only authorized users have access to credentials

2. **Limited to PostgreSQL Port**
   - Only port 5432 is exposed
   - Firewall rules protect other services

3. **Database User Permissions**
   - `postgres` user has full access
   - Consider creating limited-privilege users for production

## Alternative: Cloud SQL Proxy (Recommended for Production)

For better security, consider using [Cloud SQL Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy):

**Advantages:**
- No IP allowlisting required
- Uses IAM authentication
- Encrypted connections
- No public IP exposure needed

**Setup:**
```bash
# Download Cloud SQL Proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.amd64
chmod +x cloud-sql-proxy

# Run proxy
./cloud-sql-proxy --port 5432 nextjs-platform-benchmarking:us-central1:benchmark-db
```

**Connection String with Proxy:**
```
postgresql://postgres:TempPass123@127.0.0.1:5432/benchmarks
```

## Pantheon-Specific Considerations

Pantheon's outbound IP addresses are **dynamic** by default. Options:

1. **Current approach**: Allow all IPs (0.0.0.0/0) ✅ (implemented)
2. **Secure Integration** (Enterprise only): Provides static IP range
3. **Cloud SQL Proxy**: Run proxy on intermediate server with static IP

References:
- [Pantheon Dynamic Outgoing IPs](https://docs.pantheon.io/outgoing-ips)
- [How to Get Static Outbound IP](https://pantheon.io/blog/how-get-static-outbound-ip-pantheon)

## Current Database URL

```
postgresql://postgres:TempPass123@34.55.232.223/benchmarks
```

**Note**: This needs to be set as the `DATABASE_URL` environment variable in:
1. Pantheon dashboard (manual configuration required)
2. GitHub Actions secrets (already configured)
3. Local development environment

## Commands

### View Current Allowlist
```bash
gcloud sql instances describe benchmark-db \
  --project=nextjs-platform-benchmarking \
  --format="value(settings.ipConfiguration.authorizedNetworks)"
```

### Update Allowlist
```bash
gcloud sql instances patch benchmark-db \
  --authorized-networks=COMMA_SEPARATED_IPS \
  --project=nextjs-platform-benchmarking
```

### Test Connection
```bash
psql "postgresql://postgres:TempPass123!@34.55.232.223/benchmarks" -c "SELECT NOW();"
```
