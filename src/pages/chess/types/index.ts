export type GameType = 'bot' | 'online' | 'friend' | 'irl';
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

export enum SoundType {
  MOVE = 'move',
  CAPTURE = 'capture',
  CHECK = 'check',
  CASTLE = 'castle',
  GAMEOVER = 'gameover',
  PROMOTE = 'promote',
}

export enum SquareColor {
  BLACK = '#404040',
  WHITE = '#f5f5f4',
}

export interface History {
  move: [[number, number], [number, number]];
}

export type Forbidden = MoveDirection[] | number[];

export enum MessageType {
  GAMESTART = 'gameFound',
  MOVE = 'move',
}
export interface IMessageData {
  type: MessageType;
  data: unknown;
}

export interface GameFound {
  roomId: string;
  name: string;
  opponent: string;
  color: 'black' | 'white';
}

export interface MoveData {
  from: number;
  to: number;
}

export type MoveDirection =
  | 'up'
  | 'upleft'
  | 'upright'
  | 'down'
  | 'downleft'
  | 'downright'
  | 'left'
  | 'right';
