'use client';

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

interface RecentRunsProps {
  runs: BenchmarkRun[];
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '-';
  return `${seconds.toFixed(1)}s`;
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failure: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    timeout: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
      {status}
    </span>
  );
}

export default function RecentRuns({ runs, totalCount, page, totalPages, onPageChange }: RecentRunsProps) {
  if (runs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Recent Runs</h2>
        <p className="text-gray-500 dark:text-gray-400">No benchmark runs available for this time range.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Recent Benchmark Runs</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Timestamp</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Type</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Pantheon</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Vercel</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Netlify</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => {
              const buildsByPlatform = run.builds.reduce((acc, build) => {
                acc[build.platform] = build;
                return acc;
              }, {} as Record<string, PlatformBuild>);

              return (
                <tr key={run.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {new Date(run.run_timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {run.trigger_type}
                    </span>
                  </td>
                  {['pantheon', 'vercel', 'netlify'].map((platform) => {
                    const build = buildsByPlatform[platform];

                    if (!build) {
                      return (
                        <td key={platform} className="py-3 px-4 text-center">
                          <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                        </td>
                      );
                    }

                    return (
                      <td key={platform} className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold dark:text-white">
                            {formatDuration(build.duration_seconds)}
                          </span>
                          {getStatusBadge(build.status)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Showing {runs.length} of {totalCount} runs
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
