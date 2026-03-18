import { NextRequest, NextResponse } from 'next/server';
import { getPlatformStatsByDateRange, getDateRangeFromPreset } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get('range') || '7d';
  const customStart = searchParams.get('start');
  const customEnd = searchParams.get('end');

  let start: Date, end: Date;

  if (range === 'custom' && customStart && customEnd) {
    start = new Date(customStart);
    end = new Date(customEnd);
  } else {
    const dateRange = getDateRangeFromPreset(range);
    start = dateRange.start;
    end = dateRange.end;
  }

  try {
    const stats = await getPlatformStatsByDateRange(start, end);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats data' },
      { status: 500 }
    );
  }
}
