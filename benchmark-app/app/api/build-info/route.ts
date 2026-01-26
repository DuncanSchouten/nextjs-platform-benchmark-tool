import { NextResponse } from 'next/server';

export async function GET() {
  // Try platform-specific environment variables first, then fallback to build-time SHA
  const commitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NETLIFY_COMMIT_REF ||
    process.env.COMMIT_SHA ||
    process.env.NEXT_PUBLIC_COMMIT_SHA ||
    'unknown';

  const buildInfo = {
    commitSha,
    buildTime: Date.now(),
    platform: process.env.PLATFORM || 'unknown',
  };

  // Prevent caching - we need fresh data for deployment polling
  return NextResponse.json(buildInfo, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
