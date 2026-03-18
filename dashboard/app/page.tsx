import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Platform Benchmark Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor Next.js build and deployment performance across platforms
          </p>
        </div>

        <DashboardClient />
      </div>
    </div>
  );
}
