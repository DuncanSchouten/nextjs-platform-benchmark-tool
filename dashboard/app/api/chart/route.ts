import { NextRequest, NextResponse } from 'next/server';
import { getChartData, getDateRangeFromPreset, determineAggregation } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get('range') || '7d';
  const customStart = searchParams.get('start');
  const customEnd = searchParams.get('end');

  let start: Date, end: Date, aggregation: 'none' | 'hourly' | 'daily';

  if (range === 'custom' && customStart && customEnd) {
    start = new Date(customStart);
    end = new Date(customEnd);
    aggregation = determineAggregation(start, end);
  } else {
    const dateRange = getDateRangeFromPreset(range);
    start = dateRange.start;
    end = dateRange.end;
    aggregation = dateRange.aggregation;
  }

  try {
    const data = await getChartData(start, end, aggregation);
    return NextResponse.json({ data, aggregation });
  } catch (error) {
    console.error('Chart API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
