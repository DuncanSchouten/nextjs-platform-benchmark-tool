'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { FiSun, FiMoon, FiHome } from 'react-icons/fi';

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? (
            <>
              <FiMoon className="w-5 h-5" />
              <span className="text-sm font-medium">Dark Mode</span>
            </>
          ) : (
            <>
              <FiSun className="w-5 h-5" />
              <span className="text-sm font-medium">Light Mode</span>
            </>
          )}
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <a
              href="/"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FiHome className="w-5 h-5" />
              <span>Overview</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
