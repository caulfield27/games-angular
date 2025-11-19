import { Figures } from '../types';

export const BOARD_MATRIX: boolean[][] = [
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false, false],
];

export const COLORS: Record<string, string> = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
};

export const FIGURES_INITIAL_COORDINATES: Record<Figures, number[][][]> = {
  I: [
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
  ],
  J: [
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [0, 2],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
    ],
  ],
  L: [
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
    ],
  ],
  O: [
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  ],
  S: [
     [
      [0, 1],
      [1, 0],
      [1, 1],
      [2, 0],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  ],
  Z: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
  ],
  T: [
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [0, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 1],
    ],
  ],
};
