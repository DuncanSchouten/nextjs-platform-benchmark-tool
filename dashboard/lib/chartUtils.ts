export function computeRollingAverage(
  data: (number | null)[],
  windowSize: number
): (number | null)[] {
  return data.map((_, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1).filter((v): v is number => v !== null);
    if (window.length === 0) return null;
    return window.reduce((a, b) => a + b, 0) / window.length;
  });
}
