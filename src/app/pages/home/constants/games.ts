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
      image: '/memory.avif',
      href: 'memory-game',
      tags: ['2D', 'Memory', 'Singleplayer'],
    },
    {
      name: 'Морской бой',
      image: '/battleship_preview.avif',
      href: 'battleship',
      tags: ['2D', 'Strategy', 'Multiplayer', 'Board Game'],
    },
  ];