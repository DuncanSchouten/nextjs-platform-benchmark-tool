import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecentRuns from '../components/RecentRuns';

const mockRuns = [
  {
    id: 1,
    run_timestamp: '2026-03-17T17:00:00Z',
    trigger_type: 'workflow_dispatch',
    notes: null,
    builds: [
      { platform: 'pantheon' as const, duration_seconds: 300, status: 'success', error_message: null },
    ],
  },
  {
    id: 2,
    run_timestamp: '2026-03-17T16:50:00Z',
    trigger_type: 'schedule',
    notes: null,
    builds: [
      { platform: 'pantheon' as const, duration_seconds: 280, status: 'success', error_message: null },
      { platform: 'vercel' as const, duration_seconds: 44, status: 'success', error_message: null },
    ],
  },
];

describe('RecentRuns', () => {
  const defaultProps = {
    runs: mockRuns,
    totalCount: 50,
    page: 1,
    totalPages: 2,
    onPageChange: vi.fn(),
  };

  it('renders the table with runs', () => {
    render(<RecentRuns {...defaultProps} />);

    expect(screen.getByText('Recent Benchmark Runs')).toBeInTheDocument();
    expect(screen.getByText('300.0s')).toBeInTheDocument();
    expect(screen.getByText('280.0s')).toBeInTheDocument();
    expect(screen.getByText('44.0s')).toBeInTheDocument();
  });

  it('shows dash for missing platforms', () => {
    render(<RecentRuns {...defaultProps} />);

    // First run only has pantheon, so vercel and netlify should show dashes
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('renders pagination controls', () => {
    render(<RecentRuns {...defaultProps} />);

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Showing 2 of 50 runs')).toBeInTheDocument();
  });

  it('disables Previous on first page', () => {
    render(<RecentRuns {...defaultProps} page={1} />);
    expect(screen.getByText('Previous')).toBeDisabled();
  });

  it('disables Next on last page', () => {
    render(<RecentRuns {...defaultProps} page={2} totalPages={2} />);
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('calls onPageChange when Next is clicked', () => {
    const onPageChange = vi.fn();
    render(<RecentRuns {...defaultProps} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('shows empty state when no runs', () => {
    render(<RecentRuns runs={[]} totalCount={0} page={1} totalPages={1} onPageChange={vi.fn()} />);
    expect(screen.getByText('No benchmark runs available for this time range.')).toBeInTheDocument();
  });
});
