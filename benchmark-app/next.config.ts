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

    // Fallback: extract from git (works on Pantheon and other platforms)
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
