'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { RangePreset } from './useTimeRange';
import config from '@/config.json';

interface ChartDataPoint {
  bucket: string;
  platform: string;
  avg_duration: number;
  count: number;
}

interface PlatformBuild {
  platform: 'pantheon' | 'vercel' | 'netlify';
  duration_seconds: number | null;
  status: string;
  error_message: string | null;
}

interface BenchmarkRun {
  id: number;
  run_timestamp: string;
  trigger_type: string;
  notes: string | null;
  builds: PlatformBuild[];
}

interface PlatformStat {
  platform: string;
  totalBuilds: number;
  avgDuration: number;
  successRate: number;
  minDuration: number;
  maxDuration: number;
}

interface ChartResponse {
  data: ChartDataPoint[];
  aggregation: 'none' | 'hourly' | 'daily';
}

interface RunsResponse {
  runs: BenchmarkRun[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function buildQueryString(range: RangePreset, start: string | null, end: string | null) {
  const params = new URLSearchParams();
  params.set('range', range);
  if (range === 'custom' && start && end) {
    params.set('start', start);
    params.set('end', end);
  }
  return params.toString();
}

async function fetchChart(qs: string): Promise<ChartResponse> {
  const res = await fetch(`/api/chart?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch chart data');
  return res.json();
}

async function fetchRuns(qs: string, page: number): Promise<RunsResponse> {
  const res = await fetch(`/api/runs?${qs}&page=${page}&pageSize=${config.pageSize}`);
  if (!res.ok) throw new Error('Failed to fetch runs data');
  return res.json();
}

async function fetchStats(qs: string): Promise<PlatformStat[]> {
  const res = await fetch(`/api/stats?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch stats data');
  return res.json();
}

export function useDashboardData(range: RangePreset, start: string | null, end: string | null) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const qs = buildQueryString(range, start, end);

  const chartQuery = useQuery({
    queryKey: ['chart', range, start, end],
    queryFn: () => fetchChart(qs),
    staleTime: 60_000,
  });

  const runsQuery = useQuery({
    queryKey: ['runs', range, start, end, page],
    queryFn: () => fetchRuns(qs, page),
    staleTime: 60_000,
  });

  const statsQuery = useQuery({
    queryKey: ['stats', range, start, end],
    queryFn: () => fetchStats(qs),
    staleTime: 60_000,
  });

  const setPage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  return {
    chartData: chartQuery.data?.data ?? [],
    aggregation: chartQuery.data?.aggregation ?? 'hourly',
    runs: runsQuery.data?.runs ?? [],
    totalCount: runsQuery.data?.totalCount ?? 0,
    totalPages: runsQuery.data?.totalPages ?? 1,
    stats: statsQuery.data ?? [],
    loading: chartQuery.isLoading || runsQuery.isLoading || statsQuery.isLoading,
    error: chartQuery.error?.message || runsQuery.error?.message || statsQuery.error?.message || null,
    page,
    setPage,
  };
}
