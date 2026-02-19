import { NIL } from 'uuid';
import { SquareColor } from '../types';

export function get2Dposition(i: number): [number, number] | null {
  if (i < 0 || i > 63) return null;
  return [Math.floor(i / 8), i % 8];
}

export function get1Dposition(c: [number, number]): number | null {
  if (c[0] < 0 || c[0] > 7 || c[1] < 0 || c[1] > 7) return null;
  return c[0] * 8 + c[1];
}

export function getSquareBg(i: number): SquareColor {
  const col = Math.floor(i / 8);
  if (col % 2 === 0) {
    return i % 2 === 0 ? SquareColor.WHITE : SquareColor.BLACK;
  } else {
    return i % 2 === 0 ? SquareColor.BLACK : SquareColor.WHITE;
  }
}
