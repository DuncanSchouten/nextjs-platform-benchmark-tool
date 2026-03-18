'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import config from '@/config.json';

export type RangePreset = '24h' | '7d' | '30d' | 'all' | 'custom';

export interface TimeRangeState {
  range: RangePreset;
  start: string | null;
  end: string | null;
}

export interface TargetOverrides {
  [key: string]: number | null;
}

export function useTimeRange() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const range = (searchParams.get('range') as RangePreset) || (config.defaultRange as RangePreset);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const targets: TargetOverrides = {
    pantheon: searchParams.has('target_pantheon')
      ? Number(searchParams.get('target_pantheon'))
      : config.targets.pantheon,
    vercel: searchParams.has('target_vercel')
      ? Number(searchParams.get('target_vercel'))
      : config.targets.vercel,
    netlify: searchParams.has('target_netlify')
      ? Number(searchParams.get('target_netlify'))
      : config.targets.netlify,
  };

  const setRange = useCallback((preset: RangePreset) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', preset);
    params.delete('start');
    params.delete('end');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const setCustomRange = useCallback((newStart: string, newEnd: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', 'custom');
    params.set('start', newStart);
    params.set('end', newEnd);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  return {
    range,
    start,
    end,
    targets,
    setRange,
    setCustomRange,
  };
}
