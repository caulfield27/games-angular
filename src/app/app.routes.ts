import { Routes } from '@angular/router';
import {
  HomePage,
  Minesweeper,
  MemoryGame,
  Battleship,
  Tetris,
  FlappyBird,
  Chess,
} from '@/pages';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'minesweeper',
    component: Minesweeper,
  },
  {
    path: 'memory-game',
    component: MemoryGame,
  },
  {
    path: 'battleship',
    component: Battleship,
  },
  {
    path: 'tetris',
    component: Tetris,
  },
  {
    path: 'flappy-bird',
    component: FlappyBird,
  },
  {
    path: 'chess',
    component: Chess,
  },
];
