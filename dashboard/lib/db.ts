/**
 * Database utilities for the dashboard
 * Connects to PostgreSQL to fetch benchmark data
 */

import { Pool, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected database pool error', err);
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, params);
}

// Type definitions
export interface BenchmarkRun {
  id: number;
  run_timestamp: Date;
  trigger_type: string;
  notes: string | null;
  created_at: Date;
}

export interface PlatformBuild {
  id: number;
  run_id: number;
  platform: 'pantheon' | 'vercel' | 'netlify';
  trigger_time: Date;
  completion_time: Date | null;
  duration_seconds: number | null;
  status: 'success' | 'failure' | 'timeout' | 'in_progress';
  build_id: string | null;
  error_message: string | null;
  metadata: Record<string, any> | null;
  created_at: Date;
}

export interface BenchmarkRunWithBuilds extends BenchmarkRun {
  builds: PlatformBuild[];
}

// Helper functions to fetch data
export async function getLatestRuns(limit: number = 30): Promise<BenchmarkRunWithBuilds[]> {
  const runsResult = await query<BenchmarkRun>(
    `SELECT * FROM benchmark_runs
     ORDER BY run_timestamp DESC
     LIMIT $1`,
    [limit]
  );

  const runs = runsResult.rows;

  if (runs.length === 0) {
    return [];
  }

  const runIds = runs.map(r => r.id);

  const buildsResult = await query<PlatformBuild>(
    `SELECT * FROM platform_builds
     WHERE run_id = ANY($1::int[])
     ORDER BY run_id, platform`,
    [runIds]
  );

  const buildsByRunId = buildsResult.rows.reduce((acc, build) => {
    if (!acc[build.run_id]) {
      acc[build.run_id] = [];
    }
    acc[build.run_id].push(build);
    return acc;
  }, {} as Record<number, PlatformBuild[]>);

  return runs.map(run => ({
    ...run,
    builds: buildsByRunId[run.id] || []
  }));
}

// New interfaces for date-range queries
export interface ChartDataPoint {
  bucket: string;
  platform: string;
  avg_duration: number;
  count: number;
}

export interface PaginatedRuns {
  runs: BenchmarkRunWithBuilds[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DateRangeParams {
  start: Date;
  end: Date;
  aggregation: 'none' | 'hourly' | 'daily';
}

export function getDateRangeFromPreset(preset: string): DateRangeParams {
  const end = new Date();
  let start: Date;
  let aggregation: 'none' | 'hourly' | 'daily';

  switch (preset) {
    case '24h':
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      aggregation = 'none';
      break;
    case '7d':
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      aggregation = 'hourly';
      break;
    case '30d':
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      aggregation = 'daily';
      break;
    case 'all':
      start = new Date('2020-01-01');
      aggregation = 'daily';
      break;
    default:
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      aggregation = 'hourly';
  }

  return { start, end, aggregation };
}

export function determineAggregation(start: Date, end: Date): 'none' | 'hourly' | 'daily' {
  const diffMs = end.getTime() - start.getTime();
  const diffDays = diffMs / (24 * 60 * 60 * 1000);
  if (diffDays <= 1) return 'none';
  if (diffDays <= 7) return 'hourly';
  return 'daily';
}

export async function getChartData(
  start: Date,
  end: Date,
  aggregation: 'none' | 'hourly' | 'daily'
): Promise<ChartDataPoint[]> {
  if (aggregation === 'none') {
    const result = await query<{
      bucket: Date;
      platform: string;
      avg_duration: string;
      count: string;
    }>(
      `SELECT
        br.run_timestamp AS bucket,
        pb.platform,
        pb.duration_seconds::float AS avg_duration,
        1 AS count
      FROM benchmark_runs br
      JOIN platform_builds pb ON pb.run_id = br.id
      WHERE br.run_timestamp >= $1 AND br.run_timestamp <= $2
        AND pb.status = 'success'
        AND pb.duration_seconds IS NOT NULL
      ORDER BY br.run_timestamp ASC`,
      [start, end]
    );

    return result.rows.map(row => ({
      bucket: new Date(row.bucket).toISOString(),
      platform: row.platform,
      avg_duration: parseFloat(String(row.avg_duration)),
      count: parseInt(String(row.count), 10),
    }));
  }

  const truncUnit = aggregation === 'hourly' ? 'hour' : 'day';
  const result = await query<{
    bucket: Date;
    platform: string;
    avg_duration: string;
    count: string;
  }>(
    `SELECT
      date_trunc('${truncUnit}', br.run_timestamp) AS bucket,
      pb.platform,
      AVG(pb.duration_seconds) AS avg_duration,
      COUNT(*) AS count
    FROM benchmark_runs br
    JOIN platform_builds pb ON pb.run_id = br.id
    WHERE br.run_timestamp >= $1 AND br.run_timestamp <= $2
      AND pb.status = 'success'
      AND pb.duration_seconds IS NOT NULL
    GROUP BY bucket, pb.platform
    ORDER BY bucket ASC`,
    [start, end]
  );

  return result.rows.map(row => ({
    bucket: new Date(row.bucket).toISOString(),
    platform: row.platform,
    avg_duration: parseFloat(row.avg_duration),
    count: parseInt(row.count, 10),
  }));
}

export async function getRunsByDateRange(
  start: Date,
  end: Date,
  page: number = 1,
  pageSize: number = 25
): Promise<PaginatedRuns> {
  const offset = (page - 1) * pageSize;

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) FROM benchmark_runs
     WHERE run_timestamp >= $1 AND run_timestamp <= $2`,
    [start, end]
  );
  const totalCount = parseInt(countResult.rows[0].count, 10);

  const runsResult = await query<BenchmarkRun>(
    `SELECT * FROM benchmark_runs
     WHERE run_timestamp >= $1 AND run_timestamp <= $2
     ORDER BY run_timestamp DESC
     LIMIT $3 OFFSET $4`,
    [start, end, pageSize, offset]
  );

  const runs = runsResult.rows;

  if (runs.length === 0) {
    return { runs: [], totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) || 1 };
  }

  const runIds = runs.map(r => r.id);
  const buildsResult = await query<PlatformBuild>(
    `SELECT * FROM platform_builds
     WHERE run_id = ANY($1::int[])
     ORDER BY run_id, platform`,
    [runIds]
  );

  const buildsByRunId = buildsResult.rows.reduce((acc, build) => {
    if (!acc[build.run_id]) {
      acc[build.run_id] = [];
    }
    acc[build.run_id].push(build);
    return acc;
  }, {} as Record<number, PlatformBuild[]>);

  return {
    runs: runs.map(run => ({ ...run, builds: buildsByRunId[run.id] || [] })),
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize) || 1,
  };
}

export async function getPlatformStatsByDateRange(start: Date, end: Date) {
  const result = await query<{
    platform: string;
    total_builds: string;
    avg_duration: string;
    success_rate: string;
    min_duration: string;
    max_duration: string;
  }>(
    `SELECT
      pb.platform,
      COUNT(*) as total_builds,
      AVG(pb.duration_seconds) FILTER (WHERE pb.status != 'timeout') as avg_duration,
      (COUNT(*) FILTER (WHERE pb.status = 'success')::float / COUNT(*)::float * 100) as success_rate,
      MIN(pb.duration_seconds) FILTER (WHERE pb.status != 'timeout') as min_duration,
      MAX(pb.duration_seconds) FILTER (WHERE pb.status != 'timeout') as max_duration
     FROM platform_builds pb
     JOIN benchmark_runs br ON br.id = pb.run_id
     WHERE pb.status != 'in_progress'
       AND br.run_timestamp >= $1 AND br.run_timestamp <= $2
     GROUP BY pb.platform
     ORDER BY pb.platform`,
    [start, end]
  );

  return result.rows.map(row => ({
    platform: row.platform,
    totalBuilds: parseInt(row.total_builds, 10),
    avgDuration: parseFloat(row.avg_duration),
    successRate: parseFloat(row.success_rate),
    minDuration: parseFloat(row.min_duration),
    maxDuration: parseFloat(row.max_duration),
  }));
}

export async function getPlatformStats() {
  const result = await query<{
    platform: string;
    total_builds: string;
    avg_duration: string;
    success_rate: string;
    min_duration: string;
    max_duration: string;
  }>(
    `SELECT
      platform,
      COUNT(*) as total_builds,
      AVG(duration_seconds) FILTER (WHERE status != 'timeout') as avg_duration,
      (COUNT(*) FILTER (WHERE status = 'success')::float / COUNT(*)::float * 100) as success_rate,
      MIN(duration_seconds) FILTER (WHERE status != 'timeout') as min_duration,
      MAX(duration_seconds) FILTER (WHERE status != 'timeout') as max_duration
     FROM platform_builds
     WHERE status != 'in_progress'
     GROUP BY platform
     ORDER BY platform`
  );

  return result.rows.map(row => ({
    platform: row.platform,
    totalBuilds: parseInt(row.total_builds, 10),
    avgDuration: parseFloat(row.avg_duration),
    successRate: parseFloat(row.success_rate),
    minDuration: parseFloat(row.min_duration),
    maxDuration: parseFloat(row.max_duration),
  }));
}
