export enum Figures {
  I = 'i',
  O = 'o',
  Z = 'z',
  S = 's',
  L = 'l',
  T = 't',
  J = 'j',
}

export type Cells = {
  col: number;
  row: number;
};

export type Move = 'right' | 'down' | 'left' | 'up';

export type FiguresMap = Record<string, Direction>;
export type PositionMap = Record<
  Figures,
  Record<Direction, Record<Move, (from: Direction,col: number, row: number) =>  ((number | false)[] | (number | true)[])[]>>
>;

export type Direction = 0 | 1 | 2 | 3;
