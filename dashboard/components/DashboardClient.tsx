'use client';

import { Suspense } from 'react';
import { useTimeRange } from '@/hooks/useTimeRange';
import { useDashboardData } from '@/hooks/useDashboardData';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import StatsCards from '@/components/StatsCards';
import BenchmarkChart from '@/components/BenchmarkChart';
import RecentRuns from '@/components/RecentRuns';
import config from '@/config.json';

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { range, start, end, targets, setRange, setCustomRange } = useTimeRange();
  const {
    chartData,
    aggregation,
    runs,
    totalCount,
    totalPages,
    stats,
    loading,
    error,
    page,
    setPage,
  } = useDashboardData(range, start, end);

  if (error) {
    return (
      <>
        <TimeRangeSelector
          range={range}
          onRangeChange={setRange}
          onCustomRangeChange={setCustomRange}
        />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-red-800 dark:text-red-400 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-red-600 dark:text-red-500">
            Unable to fetch benchmark data. Please ensure the database is configured correctly.
          </p>
          <p className="text-sm text-red-500 dark:text-red-600 mt-2">
            Error: {error}
          </p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <TimeRangeSelector
          range={range}
          onRangeChange={setRange}
          onCustomRangeChange={setCustomRange}
        />
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <>
      <TimeRangeSelector
        range={range}
        onRangeChange={setRange}
        onCustomRangeChange={setCustomRange}
      />
      <div className="space-y-8">
        <StatsCards stats={stats} />
        <BenchmarkChart
          data={chartData}
          aggregation={aggregation}
          targets={targets}
          rollingAverageWindow={config.rollingAverageWindow}
        />
        <RecentRuns
          runs={runs}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}

export default function DashboardClient() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
