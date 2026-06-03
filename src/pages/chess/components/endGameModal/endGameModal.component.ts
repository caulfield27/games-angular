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
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      (click)="onBackdropClick($event)"
    >
      <div
        class="relative my-4 w-full max-w-md overflow-hidden rounded-xl border border-[#c5c0b1] bg-[#fffefb]"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <header
          class="flex items-start justify-between gap-3 px-6 py-5"
          [ngClass]="getHeaderClasses()"
        >
          <div class="min-w-0">
            <p class="mb-1 text-[13px] font-medium uppercase tracking-[1px] text-[#fffefb]/70">
              {{ getBadgeText() }}
            </p>
            <h2 class="text-[28px] font-semibold leading-[32px] text-[#fffefb]">
              {{ getTitle() }}
            </h2>
          </div>
          <button
            type="button"
            (click)="onClose()"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#fffefb]/30 bg-[#fffefb]/10 text-[18px] font-bold text-[#fffefb] transition hover:bg-[#fffefb]/20"
            aria-label="Закрыть"
          >
            ×
          </button>
        </header>

        <!-- Body -->
        <main class="px-6 py-5">
          <!-- Scoreboard -->
          <div class="scoreboard-card rounded-xl border border-[#c5c0b1] bg-[#f8f4f0] px-4 py-5">
            <div class="scoreboard-layout flex items-center justify-between gap-3">
              <div class="player-column">
                <div class="avatar-shell" [ngClass]="isPlayerWinner() ? 'winner-ring' : ''">
                  <div class="crown-badge" *ngIf="isPlayerWinner()">👑</div>
                  <div class="avatar-face player-face">{{ getPlayerAvatar() }}</div>
                </div>
                <div class="mt-3 min-w-0 text-center">
                  <div class="truncate text-[14px] font-semibold text-[#201515]">{{ getPlayerName() }}</div>
                  <div class="text-[12px] uppercase tracking-[1px] text-[#939084]">
                    {{ getPlayerCaption() }}
                  </div>
                </div>
              </div>

              <div class="score-center flex flex-col items-center justify-center">
                <div class="score-value">
                  {{ getPlayerScore() }} <span class="score-divider">–</span> {{ getOpponentScore() }}
                </div>
              </div>

              <div class="player-column">
                <div class="avatar-shell" [ngClass]="isOpponentWinner() ? 'winner-ring' : ''">
                  <div class="crown-badge" *ngIf="isOpponentWinner()">👑</div>
                  <div class="avatar-face opponent-face">{{ getOpponentAvatar() }}</div>
                </div>
                <div class="mt-3 min-w-0 text-center">
                  <div class="truncate text-[14px] font-semibold text-[#201515]">{{ getOpponentName() }}</div>
                  <div class="text-[12px] uppercase tracking-[1px] text-[#939084]">
                    {{ getOpponentCaption() }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="mt-4 grid grid-cols-2 gap-3 max-sm:flex max-sm:flex-col">
            <div class="action-button">
              <chess-button label="Новая игра" variant="primary" (handleClick)="onNewGame()" />
            </div>
            <div class="action-button">
              <chess-button label="Реванш" variant="secondary" (handleClick)="onRematch()" />
            </div>
          </div>
          <div class="mt-3 action-button">
            <chess-button label="Посмотреть игру" variant="secondary" (handleClick)="onClose()" />
          </div>
        </main>

        <!-- Footer -->
        <footer class="flex items-center justify-between border-t border-[#c5c0b1] bg-[#f8f4f0] px-6 py-4">
          <p class="text-[13px] text-[#939084]">Поделиться результатом</p>
          <div class="flex items-center gap-2">
            <button type="button" class="share-link" (click)="shareResult('x')" aria-label="X">
              <lucide-icon [img]="XIcon" size="16"></lucide-icon>
            </button>
            <button type="button" class="share-link" (click)="shareResult('telegram')" aria-label="Telegram">
              <lucide-icon [img]="TelegramIcon" size="16"></lucide-icon>
            </button>
            <button type="button" class="share-link" (click)="shareResult('instagram')" aria-label="Instagram">
              <lucide-icon [img]="InstagramIcon" size="16"></lucide-icon>
            </button>
          </div>
        </footer>
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
          width: 96px;
          height: 96px;
          border-radius: 999px;
          background: #fffefb;
          border: 2px solid #c5c0b1;
        }

        .winner-ring {
          border-color: #ff4f00;
        }

        .avatar-face {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 76px;
          height: 76px;
          border-radius: 999px;
          font-size: 2.2rem;
          border: 2px solid #f8f4f0;
        }

        .player-face {
          background: #f8f4f0;
        }

        .opponent-face {
          background: #f8f4f0;
        }

        .crown-badge {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.75rem;
        }

        .score-value {
          font-size: 2.25rem;
          line-height: 1;
          font-weight: 700;
          color: #201515;
          text-align: center;
          white-space: nowrap;
        }

        .score-divider {
          color: #939084;
        }

        .share-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid #c5c0b1;
          background: #fffefb;
          color: #605d52;
          transition: background-color 150ms ease;
        }

        .share-link:hover {
          background: #f8f4f0;
        }

        @media (max-width: 480px) {
          .avatar-shell {
            width: 72px;
            height: 72px;
          }

          .avatar-face {
            width: 56px;
            height: 56px;
            font-size: 1.6rem;
          }

          .score-value {
            font-size: 1.75rem;
          }

          .crown-badge {
            top: -20px;
            font-size: 1.5rem;
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
        return 'bg-[#ff4f00]';
      case GameEndState.OpponentWon:
        return 'bg-[#201515]';
      case GameEndState.Draw:
        return 'bg-[#36342e]';
      default:
        return 'bg-[#201515]';
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
