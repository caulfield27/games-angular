export enum Figures {
  I = 'I',
  O = 'O',
  Z = 'Z',
  S = 'S',
  L = 'L',
  T = 'T',
  J = 'J',
}

export type Cells = {
  col: number;
  row: number;
};

export type Move = 'right' | 'down' | 'left' | 'up';

export type FiguresMap = {
  label: Figures;
  direction: number;
};
