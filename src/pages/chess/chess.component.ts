import { Component, effect } from '@angular/core';
import { ChessService } from './service/chess.service';
import { Game, GameEndModalComponent } from './components';
import {
  LucideAngularModule,
  Bot,
  Handshake,
  Globe,
  Users,
  ArrowLeft,
} from 'lucide-angular';
import { GameType } from './types';
import { WebsocketService } from './service/ws.service';

@Component({
  selector: 'chess',
  templateUrl: './chess.component.html',
  imports: [GameEndModalComponent, Game, LucideAngularModule],
})
export class Chess {
  // icons
  readonly BotIcon = Bot;
  readonly HandshakeIcon = Handshake;
  readonly GlobeIcon = Globe;
  readonly UsersIcon = Users;
  readonly ArrowIcon = ArrowLeft;
  constructor(
    public chessService: ChessService,
    public ws: WebsocketService,
  ) {
    effect(async () => {
      switch (chessService.gameType()) {
        case 'bot':
          //todo
          break;
        case 'friend':
          // todo
          break;
        case 'online':
          chessService.isWaiting.set(true);
          ws.connect((e) => chessService.onMessage(e)).then(() =>
            ws.send({ type: 'selection' }),
          );
          break;
        case 'irl':
      }

      if (chessService.gameType() !== null) {
        chessService.board.set(chessService.generateBoard());
      }
    });
  }

  public onGameTypeChoose(type: GameType) {
    this.chessService.gameType.set(type);
  }

  public reset() {
    this.chessService.reset();
  }

  public onGoback() {
    this.chessService.gameType.set(null);
  }
}
