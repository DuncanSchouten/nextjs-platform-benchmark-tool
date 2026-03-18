import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimeRangeSelector from '../components/TimeRangeSelector';

describe('TimeRangeSelector', () => {
  const defaultProps = {
    range: '7d' as const,
    onRangeChange: vi.fn(),
    onCustomRangeChange: vi.fn(),
  };

  it('renders all preset buttons', () => {
    render(<TimeRangeSelector {...defaultProps} />);
    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('30d')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('calls onRangeChange when a preset is clicked', () => {
    const onRangeChange = vi.fn();
    render(<TimeRangeSelector {...defaultProps} onRangeChange={onRangeChange} />);

    fireEvent.click(screen.getByText('24h'));
    expect(onRangeChange).toHaveBeenCalledWith('24h');

    fireEvent.click(screen.getByText('30d'));
    expect(onRangeChange).toHaveBeenCalledWith('30d');
  });

  it('shows custom date inputs when Custom is clicked', () => {
    render(<TimeRangeSelector {...defaultProps} />);

    expect(screen.queryByText('Apply')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Custom'));

    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('to')).toBeInTheDocument();
  });

  it('hides custom date inputs when a preset is clicked after custom', () => {
    render(<TimeRangeSelector {...defaultProps} />);

    fireEvent.click(screen.getByText('Custom'));
    expect(screen.getByText('Apply')).toBeInTheDocument();

    fireEvent.click(screen.getByText('7d'));
    expect(screen.queryByText('Apply')).not.toBeInTheDocument();
  });

  it('Apply button is disabled when dates are empty', () => {
    render(<TimeRangeSelector {...defaultProps} />);

    fireEvent.click(screen.getByText('Custom'));

    const applyButton = screen.getByText('Apply');
    expect(applyButton).toBeDisabled();
  });
});
