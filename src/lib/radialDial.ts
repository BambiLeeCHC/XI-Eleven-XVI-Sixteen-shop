/** Even spacing for a radial dial. Count of 6 matches the classic size ring. */
export function ringStep(count: number) {
  if (count <= 0) return 0;
  return 360 / count;
}

export function wrapIndex(index: number, delta: number, count: number) {
  if (count <= 0) return 0;
  return (index + delta + count * 8) % count;
}

export function nextEnabledIndex(
  start: number,
  delta: number,
  enabled: boolean[],
) {
  const count = enabled.length;
  if (count === 0 || !enabled.some(Boolean)) return -1;
  let cursor = wrapIndex(start, delta, count);
  for (let i = 0; i < count; i += 1) {
    if (enabled[cursor]) return cursor;
    cursor = wrapIndex(cursor, delta, count);
  }
  return -1;
}
