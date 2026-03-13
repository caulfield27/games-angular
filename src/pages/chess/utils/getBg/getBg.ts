import { SquareColor } from "../../types";

export function getSquareBg(i: number): string {
  return (i + Math.floor(i / 8)) % 2 ? 'var(--board-white)' : 'var(--board-black)';
}