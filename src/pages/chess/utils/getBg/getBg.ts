import { BoardTheme } from '../../components';

export function getSquareBg(i: number): string {
  return (i + Math.floor(i / 8)) % 2
    ? 'var(--board-white)'
    : 'var(--board-black)';
}

export function setupTheme() {
  const saved = localStorage.getItem('boardTheme');
  if (saved) {
    const parsedSaved = JSON.parse(saved) as BoardTheme;
    document.documentElement.style.setProperty(
      '--board-white',
      parsedSaved.white,
    );
    document.documentElement.style.setProperty(
      '--board-black',
      parsedSaved.black,
    );
    document.documentElement.style.setProperty(
      '--board-history',
      parsedSaved.historyColor,
    );
  }
}
