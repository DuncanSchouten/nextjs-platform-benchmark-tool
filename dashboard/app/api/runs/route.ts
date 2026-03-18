import { NextRequest, NextResponse } from 'next/server';
import { getRunsByDateRange, getDateRangeFromPreset } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get('range') || '7d';
  const customStart = searchParams.get('start');
  const customEnd = searchParams.get('end');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);

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
    const result = await getRunsByDateRange(start, end, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Runs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch runs data' },
      { status: 500 }
    );
  }
}
