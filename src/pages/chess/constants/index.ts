import { Piece, Color, PromoteOption } from '../types';

export const initialBoard: (Piece | null)[][] = [
  [
    Piece.ROOK,
    Piece.KNIGHT,
    Piece.BISHOP,
    Piece.QUEEN,
    Piece.KING,
    Piece.BISHOP,
    Piece.KNIGHT,
    Piece.ROOK,
  ],
  [
    Piece.PAWN,
    Piece.PAWN,
    Piece.PAWN,
    Piece.PAWN,
    Piece.PAWN,
    Piece.PAWN,
    Piece.PAWN,
    Piece.PAWN,
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    Piece.PAWN,
    Piece.PAWN,
    Piece.PAWN,
    Piece.PAWN,
    Piece.PAWN,
    Piece.PAWN,
    Piece.PAWN,
    Piece.PAWN,
  ],
  [
    Piece.ROOK,
    Piece.KNIGHT,
    Piece.BISHOP,
    Piece.QUEEN,
    Piece.KING,
    Piece.BISHOP,
    Piece.KNIGHT,
    Piece.ROOK,
  ],
];

export const PIECE_VALUE: Record<string, number> = {
  [Piece.PAWN]: 1,
  [Piece.BISHOP]: 3,
  [Piece.KNIGHT]: 3,
  [Piece.ROOK]: 5,
  [Piece.QUEEN]: 8,
};

export const PIECE_NOTATION: Record<string, string> = {
  [Piece.PAWN]: 'p',
  [Piece.BISHOP]: 'b',
  [Piece.KNIGHT]: 'n',
  [Piece.ROOK]: 'r',
  [Piece.KING]: 'k',
  [Piece.QUEEN]: 'q',
};

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

// export const PIECE_IMAGE_PATH: Record<string, string> = {
//   [Piece.KING + Color.WHITE]: '/chess/wk_secondary.svg',
//   [Piece.KING + Color.BLACK]: '/chess/bk_secondary.svg',
//   [Piece.QUEEN + Color.WHITE]: '/chess/wq_secondary.svg',
//   [Piece.QUEEN + Color.BLACK]: '/chess/bq_secondary.svg',
//   [Piece.BISHOP + Color.WHITE]: '/chess/wb_secondary.svg',
//   [Piece.BISHOP + Color.BLACK]: '/chess/bb_secondary.svg',
//   [Piece.KNIGHT + Color.WHITE]: '/chess/wn_secondary.svg',
//   [Piece.KNIGHT + Color.BLACK]: '/chess/bn_secondary.svg',
//   [Piece.ROOK + Color.WHITE]: '/chess/wr_secondary.svg',
//   [Piece.ROOK + Color.BLACK]: '/chess/br_secondary.svg',
//   [Piece.PAWN + Color.WHITE]: '/chess/wp_secondary.svg',
//   [Piece.PAWN + Color.BLACK]: '/chess/bp_secondary.svg',
// };

export const lettersHash: Record<string, string> = {
  0: 'a',
  1: 'b',
  2: 'c',
  3: 'd',
  4: 'e',
  5: 'f',
  6: 'g',
  7: 'h',
};

export const numbersHash: Record<string, number> = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  g: 6,
  h: 7,
};

export const promotionHash: Record<string, PromoteOption> = {
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
};

type Labels = Record<
  number,
  {
    col: string | null;
    row: string | null;
  }
>;

export const normalLabels: Labels = {
  0: {
    col: '8',
    row: null,
  },
  8: {
    col: '7',
    row: null,
  },
  16: {
    col: '6',
    row: null,
  },
  24: {
    col: '5',
    row: null,
  },
  32: {
    col: '4',
    row: null,
  },
  40: {
    col: '3',
    row: null,
  },
  48: {
    col: '2',
    row: null,
  },
  56: {
    col: '1',
    row: 'a',
  },
  57: {
    col: null,
    row: 'b',
  },
  58: {
    col: null,
    row: 'c',
  },
  59: {
    col: null,
    row: 'd',
  },
  60: {
    col: null,
    row: 'e',
  },
  61: {
    col: null,
    row: 'f',
  },
  62: {
    col: null,
    row: 'g',
  },
  63: {
    col: null,
    row: 'h',
  },
};

export const reversedLabels: Labels = {
  0: {
    col: '1',
    row: null,
  },
  8: {
    col: '2',
    row: null,
  },
  16: {
    col: '3',
    row: null,
  },
  24: {
    col: '4',
    row: null,
  },
  32: {
    col: '5',
    row: null,
  },
  40: {
    col: '6',
    row: null,
  },
  48: {
    col: '7',
    row: null,
  },
  56: {
    col: '8',
    row: 'h',
  },
  57: {
    col: null,
    row: 'g',
  },
  58: {
    col: null,
    row: 'f',
  },
  59: {
    col: null,
    row: 'e',
  },
  60: {
    col: null,
    row: 'd',
  },
  61: {
    col: null,
    row: 'c',
  },
  62: {
    col: null,
    row: 'b',
  },
  63: {
    col: null,
    row: 'a',
  },
};
