import { Component, inject, OnDestroy } from '@angular/core';
import { NgClass } from '@angular/common';
import { LucideAngularModule, RotateCcw, Settings } from 'lucide-angular';
import { launchConfetti } from '../../shared/utils/utils';
import { getCards, getQuantity, getSettings, getTimer } from './utils/utils';
import { GameService } from './services/memoryGame.service';
import { ICard, LevelEnum } from './types/types';
import { AppModalService } from '../../shared/services/modal.service';

@Component({
  selector: 'memory-game',
  templateUrl: './memoryGame.component.html',
  styleUrl: './memoryGame.component.scss',
  imports: [LucideAngularModule, NgClass],
})
export class MemoryGame implements OnDestroy {
  readonly SettingsIcon = Settings;
  readonly RotateIcon = RotateCcw;
  readonly levelLabels: Record<LevelEnum, string> = {
    easy: 'Легкий',
    medium: 'Средний',
    hard: 'Сложный',
    gigachad: 'Эксперт',
  };

  private readonly modalService = inject(AppModalService);
  private correctCounter = 0;
  private queue: ICard[] = [];
  private isGameStart = false;

  constructor(public game: GameService) {}

  get minutes() {
    const minutes = this.game.timer().minutes;
    return minutes > 9 ? minutes : `0${minutes}`;
  }

  get seconds() {
    const seconds = this.game.timer().seconds;
    return seconds > 9 ? seconds : `0${seconds}`;
  }

  get quantity() {
    return getQuantity(this.game.settings);
  }

  get matchedPairs() {
    return this.correctCounter;
  }

  get totalPairs() {
    return this.game.cards().length / 2;
  }

  get boardColumns() {
    switch (this.quantity) {
      case 10:
        return 5;
      case 16:
        return 4;
      case 20:
        return 5;
      default:
        return 8;
    }
  }

  get currentLevelLabel() {
    return this.levelLabels[this.game.settings.level];
  }

  get progressText() {
    return `${this.matchedPairs}/${this.totalPairs} пар`;
  }

  restart() {
    this.game.stopTimer();
    this.correctCounter = 0;
    this.queue = [];
    this.isGameStart = false;
    this.game.timer.set(getTimer(this.game.settings));
    this.game.cards.update((prev) =>
      prev.map((card) => ({
        ...card,
        isActive: false,
      }))
    );
    setTimeout(this.game.shuffleCards.bind(this.game), 0);
  }

  isCardDisabled(card: ICard) {
    return this.queue.length === 2 || card.isActive;
  }

  getCardAriaLabel(card: ICard, index: number) {
    const state = card.isActive ? 'открыта' : 'скрыта';
    return `Карточка ${index + 1}, ${state}`;
  }

  handleOpenCard(card: ICard) {
    if (!this.isGameStart) {
      this.isGameStart = true;
      this.game.startTimer(() =>
        this.modalService.open({
          title: 'Время вышло',
          body: 'Вы не успели найти все пары до окончания таймера.',
          icon: 'error',
          confirmText: 'Попробовать снова',
        }).then(({ isConfirmed }) => {
          if (isConfirmed) {
            this.restart();
          }
        })
      );
    }

    if (this.queue.length === 2 || card.isActive) {
      return;
    }

    this.game.updateCardStatus(card.id, true);

    if (this.queue.length < 2) {
      this.queue.push(card);
    }

    if (this.queue.length === 2) {
      if (this.queue[0].src !== this.queue[1].src) {
        setTimeout(() => {
          this.game.updateCardStatus(this.queue.pop()?.id ?? -1, false);
          this.game.updateCardStatus(this.queue.pop()?.id ?? -1, false);
        }, 500);
      } else {
        this.correctCounter++;
        this.queue = [];
      }
    }

    if (this.correctCounter === this.game.cards().length / 2) {
      this.game.stopTimer();
      launchConfetti(2000);

      setTimeout(() => {
        this.modalService.open({
          title: 'Победа',
          body: 'Вы нашли все пары.',
          icon: 'success',
          confirmText: 'Сыграть еще',
        }).then(() => {
          this.restart();
        });
      }, 2000);
    }
  }

  handleSettings() {
    this.modalService.open({
      title: 'Настройки игры',
      icon: 'settings',
      settingsLevel: this.game.settings.level,
      confirmText: 'Сохранить',
      cancelText: 'Отмена',
    }).then(({ isConfirmed, selectedLevel }) => {
      if (isConfirmed && selectedLevel) {
        this.game.settings = {
          level: selectedLevel as LevelEnum,
          category: 'superheroes',
        };
        localStorage.setItem('settings', JSON.stringify(this.game.settings));
        this.game.cards.set(getCards(getSettings()));
        this.restart();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.isGameStart) {
      this.restart();
    }
  }
}
