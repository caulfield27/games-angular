import { IGames } from '../types';

export const games: IGames[] = [
  {
    name: 'Сапёр',
    image: '/minesweeper_preview.avif',
    href: 'minesweeper',
    tags: ['2D', 'Головоломка', 'Одиночная'],
  },
  {
    name: 'Найди пару',
    image: '/memory_preview.webp',
    href: 'memory-game',
    tags: ['2D', 'Память', 'Одиночная'],
  },
  {
    name: 'Морской бой',
    image: '/battleship_preview.avif',
    href: 'battleship',
    tags: ['2D', 'Стратегия', 'Мультиплеер', 'Настольная'],
  },
  {
    name: 'Тетрис',
    image: '/tetris_preview.webp',
    href: 'tetris',
    tags: ['2D', 'Головоломка', 'Аркада', 'Одиночная'],
  },
  {
    name: 'Флаппи Бёрд',
    image: '/flappy-bird.png',
    href: 'flappy-bird',
    tags: ['2D', 'Аркада', 'Бесконечная', 'Казуальная', 'Одиночная'],
  },
  {
    name: 'Шахматы онлайн',
    image: '/chess_preview.webp',
    href: 'chess',
    tags: ['2D', 'Стратегия', 'Настольная', 'Мультиплеер'],
  },
];
