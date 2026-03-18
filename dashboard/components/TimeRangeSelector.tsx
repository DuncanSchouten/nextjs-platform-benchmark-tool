'use client';

import { useState } from 'react';
import type { RangePreset } from '@/hooks/useTimeRange';

interface TimeRangeSelectorProps {
  range: RangePreset;
  onRangeChange: (preset: RangePreset) => void;
  onCustomRangeChange: (start: string, end: string) => void;
}

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: 'all', label: 'All' },
];

export default function TimeRangeSelector({
  range,
  onRangeChange,
  onCustomRangeChange,
}: TimeRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(range === 'custom');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  function handlePresetClick(preset: RangePreset) {
    setShowCustom(false);
    onRangeChange(preset);
  }

  function handleCustomToggle() {
    setShowCustom(!showCustom);
  }

  function handleApplyCustom() {
    if (customStart && customEnd) {
      onCustomRangeChange(customStart, customEnd);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">
          Time Range:
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              range === preset.value && !showCustom
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={handleCustomToggle}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            range === 'custom' || showCustom
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <div className="flex items-center gap-3 mt-3">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
          <span className="text-gray-500 dark:text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
          <button
            onClick={handleApplyCustom}
            disabled={!customStart || !customEnd}
            className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
