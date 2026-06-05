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
  templateUrl: './endGameModal.component.html',
  styleUrl: './endGameModal.component.scss',
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
