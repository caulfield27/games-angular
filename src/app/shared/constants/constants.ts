import { IPagesMetadata } from '../types/types';

export const PAGES_METADATA: Record<string, IPagesMetadata> = {
  '/': {
    background_url_path: null,
  },
  '/minesweeper': {
    background_url_path: '/pagesBackground/minesweeper_bg.jpg',
  },
  '/memory-game': {
    background_url_path: '/pagesBackground/heroes_bg.webp',
  },
  '/battleship': {
    background_url_path: '/pagesBackground/battleship_bg.png',
  },
};
