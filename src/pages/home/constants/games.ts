import { IGames } from "../types";

export const games: IGames[] = [
    {
      name: 'Сапёр',
      image: '/minesweeper_preview.avif',
      href: 'minesweeper',
      tags: ['2D', 'Puzzle', 'Singleplayer'],
    },
    {
      name: 'Найди пару',
      image: '/pagesBackground/heroes_bg.webp',
      href: 'memory-game',
      tags: ['2D', 'Memory', 'Singleplayer'],
    },
    {
      name: 'Морской бой',
      image: '/battleship_preview.avif',
      href: 'battleship',
      tags: ['2D', 'Strategy', 'Multiplayer', 'Board Game'],
    },
    {
      name: 'Тетрис',
      image: '/tetris_preview.jpg',
      href: 'tetris',
      tags: ['2D', 'Puzzle', 'Arcade', 'Singleplayer'],
    },
  ];