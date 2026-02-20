import { Piece, Color } from '../types';

export const COLLS = 8;
export const ROWS = 8;

export const PIECE_IMAGE_PATH: Record<string, string> = {
  [Piece.KING + Color.WHITE]: '/chess/wk.svg',
  [Piece.KING + Color.BLACK]: '/chess/bk.svg',
  [Piece.QUEEN + Color.WHITE]: '/chess/wq.svg',
  [Piece.QUEEN + Color.BLACK]: '/chess/bq.svg',
  [Piece.BISHOP + Color.WHITE]: '/chess/wb.svg',
  [Piece.BISHOP + Color.BLACK]: '/chess/bb.svg',
  [Piece.KNIGHT + Color.WHITE]: '/chess/wn.svg',
  [Piece.KNIGHT + Color.BLACK]: '/chess/bn.svg',
  [Piece.ROOK + Color.WHITE]: '/chess/wr.svg',
  [Piece.ROOK + Color.BLACK]: '/chess/br.svg',
  [Piece.PAWN + Color.WHITE]: '/chess/wp.svg',
  [Piece.PAWN + Color.BLACK]: '/chess/bp.svg',
};

export const PLAYER_PIECE: Record<string, Piece> = {
  63: Piece.ROOK,
  62: Piece.KNIGHT,
  61: Piece.BISHOP,
  60: Piece.KING,
  59: Piece.QUEEN,
  58: Piece.BISHOP,
  57: Piece.KNIGHT,
  56: Piece.ROOK,
};

export const OPPONENT_PIECE: Record<string, Piece> = {
  0: Piece.ROOK,
  1: Piece.KNIGHT,
  2: Piece.BISHOP,
  3: Piece.QUEEN,
  4: Piece.KING,
  5: Piece.BISHOP,
  6: Piece.KNIGHT,
  7: Piece.ROOK,
};