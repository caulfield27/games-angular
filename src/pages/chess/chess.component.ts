import { Component, effect, OnInit } from '@angular/core';
import { ChessService } from './service/chess.service';
import { ChessButton, Game, GameEndModalComponent, ThemeSettingsComponent } from './components';
import {
  LucideAngularModule,
  Bot,
  Handshake,
  Globe,
  Users,
  ArrowLeft,
  Paintbrush
} from 'lucide-angular';
import { GameType } from './types';
import { WebsocketService } from './service/ws.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'chess',
  templateUrl: './chess.component.html',
  imports: [GameEndModalComponent, Game, LucideAngularModule, ThemeSettingsComponent, ChessButton],
})
export class Chess implements OnInit {
  // icons
  readonly BotIcon = Bot;
  readonly HandshakeIcon = Handshake;
  readonly GlobeIcon = Globe;
  readonly UsersIcon = Users;
  readonly ArrowIcon = ArrowLeft;
  readonly PaintBrushIcon = Paintbrush;

  isThemeModalOpen: boolean = false;

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
          const params = new URLSearchParams(window.location.search);
          const room = params.get('q');
          if (room) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          } else {
            const roomId = uuidv4();
            const link = `${window.location.origin}/chess?q=${roomId}`;
            chessService.invitation.set({
              isModalOpen: true,
              link,
            });
            this.connectWs({
              type: 'invite',
              data: roomId,
            });
          }
          break;
        case 'online':
          chessService.isWaiting.set(true);
          this.connectWs({ type: 'selection' });
          break;
      }

      if (chessService.gameType() !== null) {
        chessService.board.set(chessService.generateBoard());
      }
    });
  }

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('q');
    if (room) {
      this.chessService.gameType.set('friend');
      this.chessService.isWaiting.set(true);
      this.connectWs({
        type: 'invite',
        data: room,
      });
    }
  }

  private connectWs(data: unknown) {
    this.ws
      .connect((e) => this.chessService.onMessage(e))
      .then(() => this.ws.send(data));
  }

  public onGameTypeChoose(type: GameType) {
    this.chessService.gameType.set(type);
  }

  public reset() {
    this.ws.close(1000, this.chessService.roomId ?? '');
    this.chessService.reset();
  }

  public onGoback() {
    this.ws.close(3000, this.chessService.roomId ?? '');
    this.chessService.reset();
  }

  public openThemeSettings(){
    this.isThemeModalOpen = true;
  }

  public closeThemeSettings(){
    this.isThemeModalOpen = false;
  }
}
