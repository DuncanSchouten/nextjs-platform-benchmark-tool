'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { computeRollingAverage } from '@/lib/chartUtils';

interface ChartDataPoint {
  bucket: string;
  platform: string;
  avg_duration: number;
  count: number;
}

interface BenchmarkChartProps {
  data: ChartDataPoint[];
  aggregation: 'none' | 'hourly' | 'daily';
  targets: Record<string, number | null>;
  rollingAverageWindow: number;
}

const PLATFORM_COLORS: Record<string, { light: string; dark: string }> = {
  pantheon: { light: '#f59e0b', dark: '#f59e0b' },
  vercel: { light: '#000000', dark: '#e5e7eb' },
  netlify: { light: '#14b8a6', dark: '#14b8a6' },
};

function formatXAxis(value: string, aggregation: 'none' | 'hourly' | 'daily') {
  const date = new Date(value);
  if (aggregation === 'none') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (aggregation === 'hourly') {
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit' })}`;
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatTooltipLabel(value: React.ReactNode) {
  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(String(value)).toLocaleString();
  }
  return String(value);
}

export default function BenchmarkChart({
  data,
  aggregation,
  targets,
  rollingAverageWindow,
}: BenchmarkChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [showRollingAvg, setShowRollingAvg] = useState(true);
  const [showTargets, setShowTargets] = useState(true);

  const { chartPoints, platforms, rollingAvgData } = useMemo(() => {
    if (data.length === 0) return { chartPoints: [], platforms: [], rollingAvgData: {} };

    // Get unique buckets and platforms
    const bucketSet = new Set<string>();
    const platformSet = new Set<string>();
    data.forEach((d) => {
      bucketSet.add(d.bucket);
      platformSet.add(d.platform);
    });

    const buckets = Array.from(bucketSet).sort();
    const platforms = Array.from(platformSet).sort();

    // Build lookup
    const lookup: Record<string, Record<string, number>> = {};
    data.forEach((d) => {
      if (!lookup[d.bucket]) lookup[d.bucket] = {};
      lookup[d.bucket][d.platform] = d.avg_duration;
    });

    // Build chart points
    const chartPoints = buckets.map((bucket) => {
      const point: Record<string, any> = { bucket };
      platforms.forEach((p) => {
        point[p] = lookup[bucket]?.[p] ?? null;
      });
      return point;
    });

    // Compute rolling averages per platform
    const rollingAvgData: Record<string, (number | null)[]> = {};
    platforms.forEach((p) => {
      const values = chartPoints.map((cp) => cp[p] as number | null);
      rollingAvgData[p] = computeRollingAverage(values, rollingAverageWindow);
    });

    // Merge rolling averages into chart points
    chartPoints.forEach((cp, i) => {
      platforms.forEach((p) => {
        cp[`${p}_avg`] = rollingAvgData[p][i];
      });
    });

    return { chartPoints, platforms, rollingAvgData };
  }, [data, rollingAverageWindow]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Build Time Trends</h2>
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
          No benchmark data available for this time range
        </div>
      </div>
    );
  }

  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Build Time Trends</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showRollingAvg}
              onChange={(e) => setShowRollingAvg(e.target.checked)}
              className="rounded"
            />
            Rolling Avg
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showTargets}
              onChange={(e) => setShowTargets(e.target.checked)}
              className="rounded"
            />
            Targets
          </label>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartPoints} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="bucket"
            tickFormatter={(v) => formatXAxis(v, aggregation)}
            tick={{ fill: textColor, fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 12 }}
            label={{
              value: 'Duration (s)',
              angle: -90,
              position: 'insideLeft',
              fill: textColor,
              fontSize: 12,
            }}
          />
          <Tooltip
            labelFormatter={formatTooltipLabel}
            formatter={(value: any, name: any) => {
              const numValue = Number(value);
              const strName = String(name);
              if (strName.endsWith('_avg')) {
                const platform = strName.replace('_avg', '');
                return [`${numValue.toFixed(1)}s`, `${platform} (rolling avg)`];
              }
              return [`${numValue.toFixed(1)}s`, strName];
            }}
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDark ? '#e5e7eb' : '#1f2937',
            }}
          />
          <Legend />

          {/* Main data lines */}
          {platforms.map((platform) => (
            <Line
              key={platform}
              type="monotone"
              dataKey={platform}
              stroke={isDark ? PLATFORM_COLORS[platform]?.dark : PLATFORM_COLORS[platform]?.light}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}

          {/* Rolling average lines */}
          {showRollingAvg &&
            platforms.map((platform) => (
              <Line
                key={`${platform}_avg`}
                type="monotone"
                dataKey={`${platform}_avg`}
                stroke={isDark ? PLATFORM_COLORS[platform]?.dark : PLATFORM_COLORS[platform]?.light}
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                connectNulls
                legendType="none"
              />
            ))}

          {/* Target lines */}
          {showTargets &&
            platforms.map((platform) => {
              const target = targets[platform];
              if (target == null) return null;
              return (
                <ReferenceLine
                  key={`target_${platform}`}
                  y={target}
                  stroke={isDark ? PLATFORM_COLORS[platform]?.dark : PLATFORM_COLORS[platform]?.light}
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: `${platform} target: ${target}s`,
                    position: 'right',
                    fill: textColor,
                    fontSize: 11,
                  }}
                />
              );
            })}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        {aggregation === 'none' && 'Showing individual data points'}
        {aggregation === 'hourly' && 'Data aggregated by hour (average)'}
        {aggregation === 'daily' && 'Data aggregated by day (average)'}
      </div>
    </div>
  );
}
