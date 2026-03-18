import { describe, it, expect } from 'vitest';
import { computeRollingAverage } from '../lib/chartUtils';

describe('computeRollingAverage', () => {
  it('returns empty array for empty input', () => {
    expect(computeRollingAverage([], 3)).toEqual([]);
  });

  it('computes rolling average with window size 1 (identity)', () => {
    expect(computeRollingAverage([10, 20, 30], 1)).toEqual([10, 20, 30]);
  });

  it('computes rolling average with window size 3', () => {
    const result = computeRollingAverage([10, 20, 30, 40, 50], 3);
    expect(result[0]).toBe(10);       // only 1 value: 10
    expect(result[1]).toBe(15);       // avg(10, 20)
    expect(result[2]).toBe(20);       // avg(10, 20, 30)
    expect(result[3]).toBe(30);       // avg(20, 30, 40)
    expect(result[4]).toBe(40);       // avg(30, 40, 50)
  });

  it('handles null values by skipping them', () => {
    const result = computeRollingAverage([10, null, 30], 3);
    expect(result[0]).toBe(10);       // only 10
    expect(result[1]).toBe(10);       // only 10 (null skipped)
    expect(result[2]).toBe(20);       // avg(10, 30) (null skipped)
  });

  it('returns null for all-null window', () => {
    const result = computeRollingAverage([null, null, null], 3);
    expect(result).toEqual([null, null, null]);
  });

  it('handles single element', () => {
    expect(computeRollingAverage([42], 5)).toEqual([42]);
  });

  it('handles window larger than data', () => {
    const result = computeRollingAverage([10, 20], 10);
    expect(result[0]).toBe(10);
    expect(result[1]).toBe(15);
  });
});
