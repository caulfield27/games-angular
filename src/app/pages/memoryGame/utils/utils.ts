import { images } from '../constants/data';
import { ICard, ISettings, Timer } from '../types/types';

export function shuffle(cards: ICard[]): ICard[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function getSettings(): ISettings {
  const storageSettings = localStorage.getItem('settings');
  return storageSettings
    ? JSON.parse(storageSettings!)
    : {
        level: 'medium',
        category: 'superheroes',
      };
}

export function getCards(settings: ISettings): ICard[] {
  return images[settings?.category ?? 'superheroes'].slice(
    0,
    getQuantity(settings)
  );
}

export function getQuantity(settings: ISettings): number {
  const { level } = settings;

  switch (level) {
    case 'easy':
      return 10;
    case 'medium':
      return 16;
    case 'hard':
      return 20;
    default:
      return 32;
  }
}

export function getTimer(settings: ISettings): Timer {
  const { level } = settings;

  switch (level) {
    case 'easy':
      return {
        minutes: 1,
        seconds: 0,
      };
    case 'medium':
      return {
        minutes: 1,
        seconds: 0,
      };
    case 'hard':
      return {
        minutes: 1,
        seconds: 45,
      };
    default:
      return {
        minutes: 2,
        seconds: 0,
      };
  }
}
