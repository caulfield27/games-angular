import { Component, effect } from '@angular/core';
import { LucideAngularModule, Bot, Handshake, Globe } from 'lucide-angular';
import { ChessService } from './service/chess.service';
import { Figure } from './classes/figure';

@Component({
  selector: 'chess',
  templateUrl: './chess.component.html',
  imports: [LucideAngularModule],
})
export class Chess {
  // icons
  readonly BotIcon = Bot;
  readonly HandshakeIcon = Handshake;
  readonly GlobeIcon = Globe;

  constructor(public chessService: ChessService) {
    effect(() => {
      switch (chessService.gameType()) {
        case 'bot':
          //todo
          break;
        case 'friend':
          // todo
          break;
        case 'online':
          //todo
          break;
      }
    });
  }

  public isFigure(data: Figure | null) {
    return data instanceof Figure;
  }

  public getSquareColor(idx: number) {
    const isEven = idx % 2 === 0;
    switch (true) {
      case idx >= 0 && idx < 8:
        return isEven ? '#f5f5f4' : '#404040';
      case idx >= 8 && idx < 16:
        return isEven ? '#404040' : '#f5f5f4';
      case idx >= 16 && idx < 24:
        return isEven ? '#f5f5f4' : '#404040';
      case idx >= 24 && idx < 32:
        return isEven ? '#404040' : '#f5f5f4';
      case idx >= 32 && idx < 40:
        return isEven ? '#f5f5f4' : '#404040';
      case idx >= 40 && idx < 48:
        return isEven ? '#404040' : '#f5f5f4';
      case idx >= 48 && idx < 56:
        return isEven ? '#f5f5f4' : '#404040';
      case idx >= 56 && idx < 64:
        return isEven ? '#404040' : '#f5f5f4';
      default:
        return '#f5f5f4';
    }
  }
}
