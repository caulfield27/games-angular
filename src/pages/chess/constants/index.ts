import { FigureEnum, Color } from '../types';

export const COLLS = 8;
export const ROWS = 8;

export const PIECE_INITIAL_POSITION: Record<string, [number, number]> = {
  [FigureEnum.KING]: [0, 4],
  [FigureEnum.QUEEN]: [0, 3],
  [FigureEnum.BISHOP + Color.WHITE]: [0, 5],
  [FigureEnum.BISHOP + Color.BLACK]: [0, 2],
  [FigureEnum.KNIGHT + Color.WHITE]: [0, 1],
  [FigureEnum.KNIGHT + Color.BLACK]: [0, 6],
  [FigureEnum.ROOK + Color.WHITE]: [0, 7],
  [FigureEnum.ROOK + Color.BLACK]: [0, 0],
};


export const PIECE_IMAGE_PATH:Record<string, string> = {
    [FigureEnum.KING+Color.WHITE]: '/chess/wk.svg',
    [FigureEnum.KING+Color.BLACK]: '/chess/bk.svg',
    [FigureEnum.QUEEN+Color.WHITE]: '/chess/wq.svg',
    [FigureEnum.QUEEN+Color.BLACK]: '/chess/bq.svg',
    [FigureEnum.BISHOP+Color.WHITE]: '/chess/wb.svg',
    [FigureEnum.BISHOP+Color.BLACK]: '/chess/bb.svg',
    [FigureEnum.KNIGHT+Color.WHITE]: '/chess/wn.svg',
    [FigureEnum.KNIGHT+Color.BLACK]: '/chess/bn.svg',
    [FigureEnum.ROOK+Color.WHITE]: '/chess/wr.svg',
    [FigureEnum.ROOK+Color.BLACK]: '/chess/br.svg',
    [FigureEnum.PAWN+Color.WHITE]: '/chess/wp.svg',
    [FigureEnum.PAWN+Color.BLACK]: '/chess/bp.svg',
} 