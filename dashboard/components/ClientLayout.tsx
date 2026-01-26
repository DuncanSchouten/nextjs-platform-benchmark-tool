'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <Sidebar />
      <div className="ml-64">
        {children}
      </div>
    </ThemeProvider>
  );
}
