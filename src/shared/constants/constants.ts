import { IPagesMetadata } from '../types/types';

export const PAGES_METADATA: Record<string, IPagesMetadata> = {
  '/': {
    background_url_path: null,
    title: 'Онлайн игры — Список лучших бесплатных браузерных игр',
    description:
      'Лучшие онлайн игры на любой вкус — морской бой, сапёр, найди пару и другие. Бесплатно и без регистрации. Играйте прямо в браузере!',
    keywords:
      'онлайн игры, бесплатные игры, морской бой, сапёр, найди пару, игры в браузере',
    icoPath: 'ico/logo.ico',
  },
  '/minesweeper': {
    background_url_path: '/pagesBackground/minesweeper_bg.jpg',
    title: 'Сапёр — Классическая логическая онлайн игра',
    description:
      'Классическая игра сапёр онлайн — раскрывайте клетки, избегайте мин, улучшайте навыки логики и реакции. Играйте бесплатно в браузере.',
    keywords:
      'сапёр, minesweeper, логические игры, онлайн игры, бесплатные игры',
    icoPath: 'ico/minesweeper.ico',
  },
  '/memory-game': {
    background_url_path: '/pagesBackground/heroes_bg.webp',
    title: 'Найди пару — Онлайн игра для тренировки памяти',
    description:
      'Игра "Найди пару" — тренируйте память и внимание, открывая пары карт. Бесплатная онлайн игра с настройками и таймером.',
    keywords:
      'найди пару, игра на память, memory game, бесплатные игры, онлайн игры',
    icoPath: 'ico/logo.ico',
  },
  '/battleship': {
    background_url_path: '/pagesBackground/battleship_bg.png',
    title: 'Морской бой — Онлайн игра с реальными игроками',
    description:
      'Играйте в морской бой онлайн с реальными игроками. Захватывающие сражения, поиск противника, мультиплеер и удобный интерфейс.',
    keywords:
      'морской бой, онлайн игра, мультиплеер, игра с другом, бесплатные игры',
    icoPath: 'ico/battleship.ico',
  },
  '/tetris': {
    background_url_path: null,
    title: 'Тетрис — Классическая онлайн игра бесплатно',
    description:
      'Играйте в Тетрис онлайн бесплатно! Собирайте линии, зарабатывайте очки и ставьте рекорды в легендарной игре прямо в браузере.',
    keywords:
      'тетрис, онлайн тетрис, бесплатные игры, головоломка, классические игры, аркада',
    icoPath: 'ico/Tetris.ico',
  },
  '/flappy-bird': {
    background_url_path: '/pagesBackground/flappy-bird-night.jpg',
    title: 'Flappy Bird — Классическая аркадная онлайн игра',
    description:
      'Flappy Bird — популярная аркадная игра онлайн. Управляйте птицей, пролетайте между трубами, набирайте очки и ставьте новые рекорды. Играйте бесплатно прямо в браузере.',
    keywords:
      'flappy bird, флаппи берд, аркадные игры, онлайн игры, бесплатные игры, браузерные игры, классические игры',
    icoPath: 'ico/flappy_bird_icon.ico',
  },
};
