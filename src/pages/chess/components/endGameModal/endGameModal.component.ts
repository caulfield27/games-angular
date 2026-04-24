import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Instagram, LucideAngularModule, Send, Share2, Twitter } from 'lucide-angular';
import { ChessButton } from '../button/button.component';
import { ChessService } from '../../service/chess.service';

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
  imports: [CommonModule, ChessButton, LucideAngularModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-2 sm:p-4"
      (click)="onBackdropClick($event)"
    >
      <div
        class="relative my-4 w-full max-w-xl overflow-hidden rounded-md bg-neutral-100 text-[#2d2140]"
        (click)="$event.stopPropagation()"
      >
        <div class="relative">
          <header
            class="flex items-start justify-between gap-3 px-4 py-4 text-white sm:gap-4 sm:rounded-b-[28px] sm:px-7 sm:py-5"
            [ngClass]="getHeaderClasses()"
          >
            <div class="min-w-0">
              <div class="mb-1 text-[11px] font-black uppercase tracking-[0.24em] text-white/75">
                {{ getBadgeText() }}
              </div>
              <h2 class="text-xl font-black leading-none sm:text-[2.2rem]">
                {{ getTitle() }}
              </h2>
            </div>

            <button
              type="button"
              (click)="onClose()"
              class="close-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/60 bg-white/15 text-2xl font-black text-white"
              aria-label="Закрыть модальное окно"
            >
              ×
            </button>
          </header>

          <main class="px-4 py-4 sm:px-7 sm:py-7">
            <div class="scoreboard-card rounded-[24px] border-2 border-white bg-white px-4 py-5 sm:rounded-[30px] sm:px-5 sm:py-6">
              <div class="scoreboard-layout flex items-center justify-between gap-3">
                <div class="player-column">
                  <div class="avatar-shell" [ngClass]="isPlayerWinner() ? 'winner-ring' : ''">
                    <div class="crown-badge" *ngIf="isPlayerWinner()">👑</div>
                    <div class="avatar-face player-face">{{ getPlayerAvatar() }}</div>
                  </div>
                  <div class="mt-3 min-w-0 text-center">
                    <div class="truncate text-sm font-black text-[#2d2140] sm:text-base">{{ getPlayerName() }}</div>
                    <div class="text-xs font-bold uppercase tracking-[0.18em] text-[#7b6a98]">
                      {{ getPlayerCaption() }}
                    </div>
                  </div>
                </div>

                <div class="score-center flex flex-col items-center justify-center gap-2 px-1 sm:gap-3 sm:px-2">
                  <div class="score-value">
                    {{ getPlayerScore() }} <span class="score-divider">-</span> {{ getOpponentScore() }}
                  </div>
                </div>

                <div class="player-column">
                  <div class="avatar-shell" [ngClass]="isOpponentWinner() ? 'winner-ring' : ''">
                    <div class="crown-badge" *ngIf="isOpponentWinner()">👑</div>
                    <div class="avatar-face opponent-face">{{ getOpponentAvatar() }}</div>
                  </div>
                  <div class="mt-3 min-w-0 text-center">
                    <div class="truncate text-sm font-black text-[#2d2140] sm:text-base">{{ getOpponentName() }}</div>
                    <div class="text-xs font-bold uppercase tracking-[0.18em] text-[#7b6a98]">
                      {{ getOpponentCaption() }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
              <div class="action-button">
                <chess-button
                  label="Новая игра"
                  variant="primary"
                  (handleClick)="onNewGame()"
                />
              </div>
              <div class="action-button">
                <chess-button
                  label="Реванш"
                  variant="dark"
                  (handleClick)="onRematch()"
                />
              </div>
            </div>

            <div class="mt-2.5 action-button sm:mt-3">
              <chess-button
                label="Посмотреть игру"
                variant="dark"
                (handleClick)="onClose()"
              />
            </div>
          </main>

          <footer class="rounded-t-[24px] border-t-2 border-white/70 bg-[#f8efcf] px-4 py-4 sm:rounded-t-[28px] sm:px-7 sm:py-5 flex justify-end items-center gap-4">
            <div class="flex items-center gap-3">
              <button type="button" class="share-link" (click)="shareResult('x')" aria-label="Поделиться в X">
                <lucide-icon [img]="XIcon" size="20"></lucide-icon>
              </button>
              <button type="button" class="share-link" (click)="shareResult('telegram')" aria-label="Поделиться в Telegram">
                <lucide-icon [img]="TelegramIcon" size="20"></lucide-icon>
              </button>
              <button type="button" class="share-link" (click)="shareResult('instagram')" aria-label="Поделиться в Instagram">
                <lucide-icon [img]="InstagramIcon" size="20"></lucide-icon>
              </button>
            </div>
            <div role="button" class="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-[#7b6a98]">
              <lucide-icon [img]="ShareIcon" size="20"></lucide-icon>
            </div>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep {
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
          border-radius: 18px;
        }

        .close-button {
          transition: background-color 160ms ease;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.24);
        }

        .scoreboard-card {
          position: relative;
          overflow: hidden;
        }

        .player-column {
          display: flex;
          min-width: 0;
          flex: 1;
          flex-direction: column;
          align-items: center;
        }

        .scoreboard-layout {
          min-width: 0;
        }

        .score-center {
          min-width: 0;
        }

        .avatar-shell {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 108px;
          height: 108px;
          border-radius: 999px;
          background: #f7f1df;
          border: 3px solid #fff;
        }

        .winner-ring {
          border-color: #ffd65a;
        }

        .avatar-face {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 84px;
          height: 84px;
          border-radius: 999px;
          font-size: 2.4rem;
          border: 3px solid rgba(255, 255, 255, 0.95);
        }

        .player-face {
          background: linear-gradient(180deg, #d9f2ff, #9ed8ff);
        }

        .opponent-face {
          background: linear-gradient(180deg, #ffe1c2, #ffc58f);
        }

        .crown-badge {
          position: absolute;
          top: -26px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 2rem;
        }

        .score-value {
          font-size: 2.5rem;
          line-height: 1;
          font-weight: 900;
          color: #2d2140;
          text-align: center;
          white-space: nowrap;
        }

        .score-divider {
          color: #a68f5d;
        }

        .share-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          border: 2px solid #fff;
          background: rgba(255, 255, 255, 0.72);
          color: #4e3d69;
          transition: background-color 160ms ease;
        }

        .share-link:hover {
          background: #fff;
        }

        @media (max-width: 640px) {
          .scoreboard-layout {
            gap: 0.75rem;
          }

          .avatar-shell {
            width: 76px;
            height: 76px;
          }

          .avatar-face {
            width: 58px;
            height: 58px;
            font-size: 1.75rem;
          }

          .score-value {
            font-size: 1.5rem;
          }

          .crown-badge {
            top: -20px;
            font-size: 1.5rem;
          }

          .share-link {
            width: 42px;
            height: 42px;
          }
        }

        @media (max-width: 420px) {
          .scoreboard-layout {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: start;
          }

          .score-center {
            padding-top: 0.4rem;
          }

          .score-value {
            font-size: 1.3rem;
          }

          .action-button button {
            min-height: 50px;
            font-size: 0.92rem;
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
  @Output() newGame = new EventEmitter<void>();
  @Output() rematch = new EventEmitter<void>();

  readonly ShareIcon = Share2;
  readonly XIcon = Twitter;
  readonly TelegramIcon = Send;
  readonly InstagramIcon = Instagram;

  private readonly chessService = inject(ChessService);

  getBadgeText(): string {
    switch (this.data.reason) {
      case GameEndReason.Checkmate:
        return 'Мат';
      case GameEndReason.Resignation:
        return 'Соперник сдался';
      case GameEndReason.Stalemate:
        return 'Пат';
      case GameEndReason.PositionRepeat:
        return 'Повторение позиции';
      case GameEndReason.Timeout:
        return 'Время вышло';
      case GameEndReason.OpponentLeave:
        return 'Противник вышел';
      default:
        return 'Игра окончена';
    }
  }

  getTitle(): string {
    switch (this.data.state) {
      case GameEndState.PlayerWon:
        return 'Вы победили';
      case GameEndState.OpponentWon:
        return 'Вы проиграли';
      case GameEndState.Draw:
        return 'Ничья';
      default:
        return 'Игра окончена';
    }
  }

  getHeaderClasses(): string {
    switch (this.data.state) {
      case GameEndState.PlayerWon:
        return 'bg-[#7ad6a6]';
      case GameEndState.OpponentWon:
        return 'bg-[#ff9f8f]';
      case GameEndState.Draw:
        return 'bg-[#83cfff]';
      default:
        return 'bg-[#b59dff]';
    }
  }

  getPlayerName(): string {
    return this.chessService.player.name() || 'Вы';
  }

  getOpponentName(): string {
    return this.chessService.opponent.name() || 'Соперник';
  }

  getPlayerAvatar(): string {
    return this.chessService.player.color === 'white' ? '🙂' : '😎';
  }

  getOpponentAvatar(): string {
    return this.chessService.opponent.color === 'white' ? '🙂' : '😎';
  }

  getPlayerCaption(): string {
    return this.chessService.player.color === 'white' ? 'Белые' : 'Черные';
  }

  getOpponentCaption(): string {
    return this.chessService.opponent.color === 'white' ? 'Белые' : 'Черные';
  }

  isPlayerWinner(): boolean {
    return this.data.state === GameEndState.PlayerWon;
  }

  isOpponentWinner(): boolean {
    return this.data.state === GameEndState.OpponentWon;
  }

  getPlayerScore(): string {
    if (this.data.state === GameEndState.PlayerWon) return '1';
    if (this.data.state === GameEndState.OpponentWon) return '0';
    return '1/2';
  }

  getOpponentScore(): string {
    if (this.data.state === GameEndState.PlayerWon) return '0';
    if (this.data.state === GameEndState.OpponentWon) return '1';
    return '1/2';
  }

  onClose(): void {
    this.close.emit();
  }

  onExit(): void {
    this.exit.emit();
  }

  onNewGame(): void {
    this.newGame.emit();
  }

  onRematch(): void {
    this.rematch.emit();
  }

  shareResult(target: 'x' | 'telegram' | 'instagram'): void {
    const text = `${this.getTitle()} • ${this.getBadgeText()} • ${this.getPlayerName()} ${this.getPlayerScore()} - ${this.getOpponentScore()} ${this.getOpponentName()}`;
    const encodedText = encodeURIComponent(text);
    const url = encodeURIComponent(window.location.href);

    if (target === 'x') {
      window.open(`https://x.com/intent/tweet?text=${encodedText}&url=${url}`, '_blank', 'noopener,noreferrer');
      return;
    }

    if (target === 'telegram') {
      window.open(`https://t.me/share/url?url=${url}&text=${encodedText}`, '_blank', 'noopener,noreferrer');
      return;
    }

    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text);
    }

    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  }

  onBackdropClick(_: MouseEvent): void {
    this.close.emit();
  }
}
