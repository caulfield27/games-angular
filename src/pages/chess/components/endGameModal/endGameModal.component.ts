import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChessButton } from '../button/button.component';

export enum GameEndState {
  Draw = 'draw',
  PlayerWon = 'player-won',
  OpponentWon = 'opponent-won',
}

export enum GameEndReason {
  Checkmate = 'checkmate',
  Resignation = 'resignation',
  Stalemate = 'stalemate',
  PositionRepeat = 'repeat',
  Timeout = 'timeout',
  OpponentLeave = 'opponentLeave',
}

export interface GameEndData {
  state: GameEndState;
  reason: GameEndReason;
}

@Component({
  selector: 'game-end-modal',
  standalone: true,
  imports: [CommonModule, ChessButton],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-opacity-animation"
      (click)="onBackdropClick($event)"
    >
      <div class="absolute inset-0 bg-black/80"></div>

      <div
        class="relative max-w-lg w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#121212] text-white shadow-2xl modal-scale-animation"
        (click)="$event.stopPropagation()"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br opacity-90"
          [ngClass]="getAccentClasses()"
        ></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_48%)]"></div>
        <div class="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

        <div class="relative p-8 sm:p-9">
          <div class="mb-7 flex items-start justify-between gap-4">
            <div
              [ngClass]="getIconClasses()"
              class="flex h-20 w-20 items-center justify-center rounded-3xl border shadow-lg backdrop-blur-sm"
            >
              <span class="text-4xl text-white">{{ getIcon() }}</span>
            </div>

            <div
              class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-300 backdrop-blur-sm"
            >
              {{ getBadgeText() }}
            </div>
          </div>

          <h2 [ngClass]="getTitleColorClass()" class="mb-3 text-3xl font-bold tracking-tight">
            {{ getTitle() }}
          </h2>

          <p class="mb-6 max-w-md text-base leading-7 text-neutral-300/95 sm:text-lg">
            {{ getSubtitle() }}
          </p>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="action-button">
              <chess-button
                label="Посмотреть доску"
                variant="primary"
                (handleClick)="onClose()"
              />
            </div>
            <div class="action-button">
              <chess-button
                label="В меню"
                variant="dark"
                (handleClick)="onExit()"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
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

        chess-button {
          display: block;
          width: 100%;
        }

        .action-button {
          width: 100%;
          min-width: 0;
        }

        .action-button button {
          min-height: 56px;
          width: 100%;
          font-size: 1rem;
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
    `,
  ],
})
export class GameEndModalComponent {
  @Input() isOpen = false;
  @Input() data: GameEndData = {
    state: GameEndState.Draw,
    reason: GameEndReason.Stalemate,
  };

  @Output() close = new EventEmitter<void>();
  @Output() exit = new EventEmitter<void>();

  getAccentClasses(): string {
    switch (this.data.state) {
      case GameEndState.PlayerWon:
        return 'from-emerald-500/20 via-emerald-400/8 to-[#171717]';
      case GameEndState.OpponentWon:
        return 'from-red-500/20 via-red-400/8 to-[#171717]';
      case GameEndState.Draw:
        return 'from-amber-500/20 via-amber-400/8 to-[#171717]';
      default:
        return 'from-neutral-700/40 via-neutral-700/10 to-[#171717]';
    }
  }

  getBadgeText(): string {
    switch (this.data.reason) {
      case GameEndReason.Checkmate:
        return 'Мат';
      case GameEndReason.Resignation:
        return 'Сдача';
      case GameEndReason.Stalemate:
        return 'Пат';
      case GameEndReason.PositionRepeat:
        return 'Повторение';
      case GameEndReason.Timeout:
        return 'Время';
      case GameEndReason.OpponentLeave:
        return 'Соперник вышел';
      default:
        return 'Игра завершена';
    }
  }

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
    const isOpponentLeave = this.data.reason === GameEndReason.OpponentLeave;

    switch (this.data.state) {
      case GameEndState.PlayerWon:
        if (isResignation) return 'Соперник сдался';
        if (isCheckmate) return 'Вы объявили мат';
        if (isTimeout) return 'У соперника закончилась время';
        if (isOpponentLeave) return 'Противник покинул игру';
        return 'Победа!';

      case GameEndState.OpponentWon:
        if (isResignation) return 'Вы сдались';
        if (isCheckmate) return 'Соперник объявил мат';
        if (isTimeout) return 'Время вышло';
        return 'Проигрыш!';

      case GameEndState.Draw:
        if (this.data.reason === GameEndReason.Stalemate) return 'Пат';
        if (this.data.reason === GameEndReason.PositionRepeat)
          return 'Троектратное повторение позиции';
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
    const baseClasses = '';
    switch (this.data.state) {
      case GameEndState.PlayerWon:
        return baseClasses + 'bg-emerald-500/18 border-emerald-300/35';
      case GameEndState.OpponentWon:
        return baseClasses + 'bg-red-500/18 border-red-300/35';
      case GameEndState.Draw:
        return baseClasses + 'bg-amber-500/18 border-amber-300/35';
      default:
        return baseClasses + 'bg-neutral-700 border-neutral-500/40';
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

  onClose(): void {
    this.close.emit();
  }

  onExit(): void {
    this.exit.emit();
  }

  onBackdropClick(_: MouseEvent): void {
    this.close.emit();
  }
}
