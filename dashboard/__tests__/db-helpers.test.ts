import { describe, it, expect } from 'vitest';
import { getDateRangeFromPreset, determineAggregation } from '../lib/db';

describe('getDateRangeFromPreset', () => {
  it('returns 24h range with no aggregation', () => {
    const result = getDateRangeFromPreset('24h');
    const diffMs = result.end.getTime() - result.start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    expect(diffHours).toBeCloseTo(24, 0);
    expect(result.aggregation).toBe('none');
  });

  it('returns 7d range with hourly aggregation', () => {
    const result = getDateRangeFromPreset('7d');
    const diffMs = result.end.getTime() - result.start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    expect(diffDays).toBeCloseTo(7, 0);
    expect(result.aggregation).toBe('hourly');
  });

  it('returns 30d range with daily aggregation', () => {
    const result = getDateRangeFromPreset('30d');
    const diffMs = result.end.getTime() - result.start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    expect(diffDays).toBeCloseTo(30, 0);
    expect(result.aggregation).toBe('daily');
  });

  it('returns all-time range with daily aggregation', () => {
    const result = getDateRangeFromPreset('all');
    expect(result.start.getUTCFullYear()).toBe(2020);
    expect(result.aggregation).toBe('daily');
  });

  it('defaults to 7d for unknown preset', () => {
    const result = getDateRangeFromPreset('unknown');
    const diffMs = result.end.getTime() - result.start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    expect(diffDays).toBeCloseTo(7, 0);
    expect(result.aggregation).toBe('hourly');
  });
});

describe('determineAggregation', () => {
  it('returns none for less than 1 day', () => {
    const end = new Date();
    const start = new Date(end.getTime() - 12 * 60 * 60 * 1000);
    expect(determineAggregation(start, end)).toBe('none');
  });

  it('returns hourly for 1-7 days', () => {
    const end = new Date();
    const start = new Date(end.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(determineAggregation(start, end)).toBe('hourly');
  });

  it('returns daily for more than 7 days', () => {
    const end = new Date();
    const start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000);
    expect(determineAggregation(start, end)).toBe('daily');
  });

  it('returns none for exactly 1 day', () => {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    expect(determineAggregation(start, end)).toBe('none');
  });
});
