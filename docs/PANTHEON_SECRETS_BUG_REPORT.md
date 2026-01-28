# Bug Report: Runtime Type Secrets Not Accessible via process.env in Next.js

## Summary

`runtime` type secrets configured via Terminus Secrets Manager are not accessible via `process.env.VARIABLE_NAME` in Next.js applications as documented, requiring instead parsing of `process.env.SITE_SECRETS_DEFAULT` as JSON.

## Environment

- **Platform**: Pantheon Next.js hosting
- **Next.js Version**: 16.1.4 (also affects 15.x)
- **Node Version**: 20
- **Terminus Plugin**: `terminus-secrets-manager-plugin`
- **Site UUID**: `22802bca-8349-4972-b735-190767c2a47e`

## Expected Behavior

According to Pantheon documentation:

> "Once set, these environment variables can be read in your Next.js application code using `process.env.VARIABLE_NAME`."

When a secret is set via Terminus:

```bash
terminus secret:site:set <site> DATABASE_URL "postgresql://..." --type=runtime --scope=web
```

The application should be able to access it directly:

```typescript
const connectionString = process.env.DATABASE_URL;
// Should return: "postgresql://..."
```

## Actual Behavior

`runtime` type secrets are **NOT** available in `process.env.VARIABLE_NAME`. Instead:

```typescript
console.log('DATABASE_URL' in process.env);  // false
console.log(process.env.DATABASE_URL);        // undefined
```

All `runtime` type secrets are bundled into a single JSON string at `process.env.SITE_SECRETS_DEFAULT`:

```typescript
console.log(process.env.SITE_SECRETS_DEFAULT);
// {"DATABASE_URL":{"value":"postgresql://...","type":"runtime"},"TEST_SECRET":{"value":"test-value","type":"runtime"}}
```

## Secret Type Behavior Matrix

| Secret Type | Available in `process.env.VAR`? | Available in `SITE_SECRETS_DEFAULT`? | Works as Documented? |
|-------------|----------------------------------|--------------------------------------|----------------------|
| `env`       | ✅ Yes                           | ✅ Yes                                | ✅ Yes               |
| `runtime`   | ❌ No                            | ✅ Yes (JSON)                         | ❌ No                |
| `file`      | ❌ No                            | ✅ Yes (JSON)                         | ❌ No                |

## Impact

**High** - Breaks expected developer workflow and contradicts documentation. Developers following the documented approach will experience:
1. Secrets appearing "not set" despite correct configuration
2. Application failures with "environment variable not set" errors
3. Hours of debugging to discover the undocumented JSON parsing requirement

## Steps to Reproduce

1. Create a Next.js site on Pantheon
2. Set a runtime secret:
   ```bash
   terminus secret:site:set <site> MY_SECRET "test-value" --type=runtime --scope=web
   ```
3. In Next.js application code, try to access:
   ```typescript
   console.log(process.env.MY_SECRET);  // Returns: undefined
   ```
4. Check `SITE_SECRETS_DEFAULT`:
   ```typescript
   console.log(process.env.SITE_SECRETS_DEFAULT);
   // Returns: {"MY_SECRET":{"value":"test-value","type":"runtime"}}
   ```

## Workaround

We developed a helper function to parse secrets from `SITE_SECRETS_DEFAULT`:

```typescript
/**
 * Retrieves a secret from Pantheon's environment
 * Handles both direct process.env access (env type) and
 * SITE_SECRETS_DEFAULT JSON parsing (runtime/file types)
 */
function getSecret(secretName: string): string | undefined {
  // First check if it's directly in process.env (works for 'env' type)
  if (process.env[secretName]) {
    return process.env[secretName];
  }

  // If not, parse Pantheon's SITE_SECRETS_DEFAULT JSON
  if (process.env.SITE_SECRETS_DEFAULT) {
    try {
      const secrets = JSON.parse(process.env.SITE_SECRETS_DEFAULT);
      if (secrets[secretName] && secrets[secretName].value) {
        return secrets[secretName].value;
      }
    } catch (err) {
      console.error('Error parsing SITE_SECRETS_DEFAULT:', err);
    }
  }

  return undefined;
}

// Usage:
const databaseUrl = getSecret('DATABASE_URL');
const apiKey = getSecret('API_KEY');
```

### Example Application Code

**Before (doesn't work with runtime type):**
```typescript
import { Pool } from 'pg';

export function getPool() {
  const connectionString = process.env.DATABASE_URL;  // undefined!

  if (!connectionString) {
    throw new Error('DATABASE_URL not set');  // Always throws
  }

  return new Pool({ connectionString });
}
```

**After (works with runtime type):**
```typescript
import { Pool } from 'pg';

function getSecret(secretName: string): string | undefined {
  if (process.env[secretName]) {
    return process.env[secretName];
  }

  if (process.env.SITE_SECRETS_DEFAULT) {
    try {
      const secrets = JSON.parse(process.env.SITE_SECRETS_DEFAULT);
      return secrets[secretName]?.value;
    } catch (err) {
      console.error('Error parsing SITE_SECRETS_DEFAULT:', err);
    }
  }

  return undefined;
}

export function getPool() {
  const connectionString = getSecret('DATABASE_URL');  // Works!

  if (!connectionString) {
    throw new Error('DATABASE_URL not set');
  }

  return new Pool({ connectionString });
}
```

## Debug Evidence

Full debug logs showing the issue:

```
[DB] getSecret('DATABASE_URL') called
[DB] DATABASE_URL exists: false
[DB] DATABASE_URL value type: undefined
[DB] DATABASE_URL not in process.env, checking SITE_SECRETS_DEFAULT
[DB] SITE_SECRETS_DEFAULT exists, attempting to parse...
[DB] SITE_SECRETS_DEFAULT value: {"DATABASE_URL":{"value":"postgresql://...","type":"runtime"}}
[DB] Successfully parsed JSON, keys: [ 'DATABASE_URL', 'TEST_SECRET' ]
[DB] Found DATABASE_URL in parsed JSON: { value: 'postgresql://...', type: 'runtime' }
[DB] ✅ Returning value for DATABASE_URL (length: 58)
[DB] ✅ Database pool created successfully
```

## Recommended Fixes

### Option 1: Auto-expose runtime secrets (Preferred)
Modify Pantheon's Next.js runtime to automatically expose `runtime` type secrets to `process.env`:

```javascript
// Internal: Before starting Next.js app
if (process.env.SITE_SECRETS_DEFAULT) {
  const secrets = JSON.parse(process.env.SITE_SECRETS_DEFAULT);
  Object.entries(secrets).forEach(([key, data]) => {
    if (data.type === 'runtime') {
      process.env[key] = data.value;
    }
  });
}
```

**Pros:**
- Matches documented behavior
- No developer code changes needed
- Consistent with `env` type behavior

**Cons:**
- None

### Option 2: Update documentation
If the current behavior is intentional, update documentation to:
1. Explain that `runtime` secrets are only in `SITE_SECRETS_DEFAULT` JSON
2. Provide the `getSecret()` helper function
3. Recommend using `env` type for direct `process.env` access
4. Clarify when to use each secret type

### Option 3: Recommend env type
Update documentation and tooling to recommend `env` type for application secrets:

```bash
# Recommended (works as expected):
terminus secret:site:set <site> DATABASE_URL "..." --type=env --scope=web

# Not recommended (requires JSON parsing):
terminus secret:site:set <site> DATABASE_URL "..." --type=runtime --scope=web
```

## Additional Notes

- **`env` type secrets work perfectly** and are available directly in `process.env`
- The `SITE_SECRETS_DEFAULT` JSON structure is undocumented
- This affects all Next.js applications using `runtime` type secrets on Pantheon
- Workaround is tested and working in production

## Related Files

- Implementation: `dashboard/lib/db.ts` (contains working `getSecret()` helper)
- Test site: https://dev-pantheon-next-js-benchmark-site.pantheonsite.io/

## Contact

**Reporter**: Duncan Schouten (duncan.schouten@pantheon.io)
**Date**: 2026-01-28
**Project**: Next.js Platform Benchmark Tool
