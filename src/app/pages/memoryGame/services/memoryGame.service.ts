import { Injectable, signal } from '@angular/core';
import { images } from '../constants/data';
import { ICard, ISettings, Timer } from '../types/types';
import { getCards, getSettings, getTimer, shuffle } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  settings: ISettings = getSettings();
  cards = signal<ICard[]>(shuffle(getCards(this.settings)));
  timer = signal<Timer>(getTimer(this.settings));
  intervalId: ReturnType<typeof setInterval> | null = null;

  updateCardStatus(id: number, active: boolean) {
    this.cards.update((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, isActive: active } : card
      )
    );
  }

  shuffleCards() {
    this.cards.set(shuffle(this.cards()));
  }

  startTimer(timeOverCb: () => void) {
    this.intervalId = setInterval(() => {
      const timer = this.timer();
      if (timer.seconds === 0) {
        if (timer.minutes === 0) {
          this.stopTimer();
          timeOverCb();
        } else {
          this.timer.update((prev) => ({
            minutes: prev.minutes - 1,
            seconds: 59,
          }));
        }
      } else {
        this.timer.update((prev) => ({ ...prev, seconds: prev.seconds - 1 }));
      }
    }, 1000);
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
