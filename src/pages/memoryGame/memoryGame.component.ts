import { Component, OnDestroy } from '@angular/core';
import { LucideAngularModule, Settings, RotateCcw } from 'lucide-angular';
import { GameService } from './services/memoryGame.service';
import { NgClass } from '@angular/common';
import Swal from 'sweetalert2';
import { ICard, LevelEnum } from './types/types';
import { launchConfetti } from '../../shared/utils/utils';
import { getCards, getQuantity, getSettings, getTimer } from './utils/utils';
import { reset } from 'canvas-confetti';

@Component({
  selector: 'memory-game',
  templateUrl: './memoryGame.component.html',
  styleUrl: './memoryGame.component.scss',
  imports: [LucideAngularModule, NgClass],
})
export class MemoryGame implements OnDestroy {
  // locale states
  readonly SettingsIcon = Settings;
  readonly RotateIcon = RotateCcw;

  private correctCounter: number = 0;
  private queue: ICard[] = [];
  private isGameStart: boolean = false;

  constructor(public game: GameService) {}

  // getters
  get minutes() {
    const minutes = this.game.timer().minutes;
    return minutes > 9 ? minutes : `0${minutes}`;
  }

  get seconds() {
    const seconds = this.game.timer().seconds;
    return seconds > 9 ? seconds : `0${seconds}`;
  }

  get quantity() {
    const settings = this.game.settings;
    return getQuantity(settings);
  }

  // event handlers
  restart() {
    this.game.stopTimer();
    this.correctCounter = 0;
    this.queue = [];
    this.isGameStart = false;
    this.game.timer.set(getTimer(this.game.settings));
    this.game.cards.update((prev) =>
      prev.map((card) => {
        card.isActive = false;
        return card;
      })
    );
    setTimeout(this.game.shuffleCards.bind(this.game), 0);
  }

  handleOpenCard(card: ICard) {
    if (!this.isGameStart) {
      this.isGameStart = true;
      this.game.startTimer(() =>
        Swal.fire({
          title: 'Вы проиграли',
          text: 'Вы не успели найти все пары во время ):',
          icon: 'error',
          confirmButtonText: 'Попробовать ещё',
        }).then((res) => {
          if (res.isConfirmed) {
            this.restart();
          }
        })
      );
    }

    if (this.queue.length === 2 || card.isActive) return;

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
        Swal.fire({
          title: 'Поздравляю, вы выиграли!',
          icon: 'success',
          showCancelButton: false,
          confirmButtonText: 'Сыграть ещё',
        }).then(() => {
          this.restart();
        });
      }, 2000);
    }
  }

  handleSettings() {
    Swal.fire({
      title: 'Настройки',
      html: `
    <div class="settings_container">  
        <div class="setting_wrap">
            <span>уровень</span>
            <select name="level" id="level">
                <option value="easy" ${
                  this.game.settings.level === 'easy' ? 'selected="true"' : ''
                }>лёгкий</option>
                <option value="medium" ${
                  this.game.settings.level === 'medium' ? 'selected="true"' : ''
                }>средний</option>
                <option value="hard" ${
                  this.game.settings.level === 'hard' ? 'selected="true"' : ''
                }>сложный</option>
                <option value="gigachad" ${
                  this.game.settings.level === 'gigachad'
                    ? 'selected="true"'
                    : ''
                }>очень сложный</option>
            </select>
        </div>
    </div>
    `,
      showCancelButton: true,
      cancelButtonText: 'Отмена',
      confirmButtonText: 'Сохранить',
      preConfirm: () => {
        const level = document.getElementById('level') as HTMLInputElement;
        this.game.settings = {
          level: level.value as LevelEnum,
          category: 'superheroes',
        };
      },
    }).then((res) => {
      if (res?.isConfirmed) {
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
