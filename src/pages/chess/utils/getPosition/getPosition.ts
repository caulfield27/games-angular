export function get2Dposition(i: number): [number, number] | null {
  if (i < 0 || i > 63) return null;
  return [Math.floor(i / 8), i % 8];
}

export function get1Dposition(c: [number, number]): number | null {
  if (c[0] < 0 || c[0] > 7 || c[1] < 0 || c[1] > 7) return null;
  return c[0] * 8 + c[1];
}
