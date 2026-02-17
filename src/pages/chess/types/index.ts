import { Figure } from "../classes/figure";

export type GameType = 'bot' | 'online' | 'friend';
export enum FigureEnum {
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

export type Board = Figure | null;