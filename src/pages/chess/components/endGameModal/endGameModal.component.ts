import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export enum GameEndState {
  Draw = 'draw',
  PlayerWon = 'player-won',
  OpponentWon = 'opponent-won'
}

export enum GameEndReason {
  Checkmate = 'checkmate',
  Resignation = 'resignation',
  Stalemate = 'stalemate',
  Timeout = 'timeout'
}

export interface GameEndData {
  state: GameEndState;
  reason: GameEndReason;
}

@Component({
  selector: 'game-end-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-opacity-animation"
      (click)="onBackdropClick($event)">

      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/80"></div>

      <!-- Modal -->
      <div
        class="relative bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-700 modal-scale-animation"
        (click)="$event.stopPropagation()">

        <!-- Content -->
        <div class="p-8 text-center">
          <!-- Icon/Symbol -->
          <div class="mb-6">
            <div [ngClass]="getIconClasses()" class="mx-auto w-20 h-20 rounded-full flex items-center justify-center">
              <span class="text-4xl text-white">{{ getIcon() }}</span>
            </div>
          </div>

          <!-- Title -->
          <h2 [ngClass]="getTitleColorClass()" class="text-3xl font-bold mb-3">
            {{ getTitle() }}
          </h2>

          <!-- Subtitle -->
          <p class="text-neutral-400 text-lg mb-8">
            {{ getSubtitle() }}
          </p>

          <!-- Buttons -->
          <div class="flex flex-col gap-3">
            <button
              (click)="onNewGame()"
              class="w-full bg-white hover:bg-neutral-100 text-neutral-900 font-semibold py-3.5 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95">
              Навая игра
            </button>

            <button
              (click)="onClose()"
              class="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-3.5 px-6 rounded-lg transition-all duration-200">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .backdrop-opacity-animation {
        animation: fadeInBackdrop 200ms ease-out forwards;
      }

      .backdrop-opacity-animation.ng-leave {
        animation: fadeOutBackdrop 150ms ease-in forwards;
      }

      .modal-scale-animation {
        animation: scaleInModal 200ms ease-out forwards;
      }

      .modal-scale-animation.ng-leave {
        animation: scaleOutModal 150ms ease-in forwards;
      }

      @keyframes fadeInBackdrop {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fadeOutBackdrop {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      @keyframes scaleInModal {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes scaleOutModal {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(0.9);
          opacity: 0;
        }
      }
    }
  `]
})
export class GameEndModalComponent {
  @Input() isOpen = false;
  @Input() data: GameEndData = {
    state: GameEndState.Draw,
    reason: GameEndReason.Stalemate
  };

  @Output() newGame = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  getTitle(): string {
    switch (this.data.state) {
      case GameEndState.PlayerWon:
        return 'Вы выиграли!';
      case GameEndState.OpponentWon:
        return 'Вы проиграли';
      case GameEndState.Draw:
        return 'Ничья';
      default:
        return 'Игра закончена';
    }
  }

  getSubtitle(): string {
    const isResignation = this.data.reason === GameEndReason.Resignation;
    const isCheckmate = this.data.reason === GameEndReason.Checkmate;
    const isTimeout = this.data.reason === GameEndReason.Timeout;

    switch (this.data.state) {
      case GameEndState.PlayerWon:
        if (isResignation) return 'Соперник сдался';
        if (isCheckmate) return 'Вы объявили мат';
        if (isTimeout) return 'У соперника закончилась время';
        return 'Победа!';

      case GameEndState.OpponentWon:
        if (isResignation) return 'Вы сдались';
        if (isCheckmate) return 'Соперник объявил мат';
        if (isTimeout) return 'Время вышло';
        return 'Проигрыш!';

      case GameEndState.Draw:
        if (this.data.reason === GameEndReason.Stalemate) return 'Пат';
        return 'Ничья!';

      default:
        return '';
    }
  }

  getIcon(): string {
    switch (this.data.state) {
      case GameEndState.PlayerWon:
        return '♔';
      case GameEndState.OpponentWon:
        return '♚';
      case GameEndState.Draw:
        return '⚖';
      default:
        return '♟';
    }
  }

  getIconClasses(): string {
    const baseClasses = 'border-2 ';
    switch (this.data.state) {
      case GameEndState.PlayerWon:
        return baseClasses + 'bg-emerald-500/20 border-emerald-500/50';
      case GameEndState.OpponentWon:
        return baseClasses + 'bg-red-500/20 border-red-500/50';
      case GameEndState.Draw:
        return baseClasses + 'bg-amber-500/20 border-amber-500/50';
      default:
        return baseClasses + 'bg-neutral-700 border-neutral-600';
    }
  }

  getTitleColorClass(): string {
    switch (this.data.state) {
      case GameEndState.PlayerWon:
        return 'text-emerald-400';
      case GameEndState.OpponentWon:
        return 'text-red-400';
      case GameEndState.Draw:
        return 'text-amber-400';
      default:
        return 'text-white';
    }
  }

  onNewGame(): void {
    this.newGame.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    this.close.emit();
  }
}
