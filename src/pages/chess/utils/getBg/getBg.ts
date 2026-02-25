import { SquareColor } from "../../types";

export function getSquareBg(i: number): SquareColor {
  const col = Math.floor(i / 8);
  if (col % 2 === 0) {
    return i % 2 === 0 ? SquareColor.WHITE : SquareColor.BLACK;
  } else {
    return i % 2 === 0 ? SquareColor.BLACK : SquareColor.WHITE;
  }
}