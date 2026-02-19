import { Figure } from "../classes/figure";

export type GameType = 'bot' | 'online' | 'friend';
export enum Piece {
  KING = 'king',
  QUEEN = 'queen',
  ROOK = 'rook',
  BISHOP = 'bishop',
  KNIGHT = 'knight',
  PAWN = 'pawn',
}
export enum Color {
  BLACK = 'black',
  WHITE = 'white',
}

export enum SquareColor {
  BLACK = '#404040',
  WHITE = '#f5f5f4'
}

export interface Square{
  figure: Figure | null;
  canMove: boolean;
  isPlayer: boolean;
}