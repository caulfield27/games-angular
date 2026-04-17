import { Component, effect, OnInit } from '@angular/core';
import { ChessService } from './service/chess.service';
import {
  Game,
  GameEndModalComponent,
  ThemeSettingsComponent,
} from './components';
import {
  LucideAngularModule,
  Bot,
  Handshake,
  Globe,
  Users,
  ArrowLeft,
  Paintbrush,
} from 'lucide-angular';
import { GameType, MenuOption } from './types';
import { WebsocketService } from './service/ws.service';
import { v4 as uuidv4 } from 'uuid';
import { setupTheme } from './utils';

@Component({
  selector: 'chess',
  templateUrl: './chess.component.html',
  imports: [
    GameEndModalComponent,
    Game,
    LucideAngularModule,
    ThemeSettingsComponent,
  ],
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
  readonly menuOptions: MenuOption[] = [
    {
      type: 'online',
      icon: this.GlobeIcon,
      title: 'Играть Онлайн',
      description: 'Соревнуйтесь с игроками по со всего мира',
      iconColor: '#60a5fa',
      iconBg: '#dbeafe',
    },
    {
      type: 'bot',
      icon: this.BotIcon,
      title: 'Играть против Бота',
      description: 'Бросьте вызов ИИ противникам',
      iconColor: '#c084fc',
      iconBg: '#f3e8ff',
    },
    {
      type: 'friend',
      icon: this.UsersIcon,
      title: 'Играть c Другом',
      description: 'Пригласить кого-нибудь поиграть',
      iconColor: '#4ade80',
      iconBg: '#dcfce7',
    },
    {
      type: 'irl',
      icon: this.HandshakeIcon,
      title: 'Игра за доской',
      description: 'Режим игры вдвоём.',
      iconColor: '#f59e0b',
      iconBg: '#fef3c7',
    },
  ];

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
        chessService.initialBoard = chessService.generateBoard();
        chessService.board.set(chessService.initialBoard);
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
    setupTheme();
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

  public dismissGameEndModal() {
    this.chessService.dismissGameEndModal();
  }

  public onGoback() {
    this.ws.close(3000, this.chessService.roomId ?? '');
    this.chessService.reset();
  }

  public openThemeSettings() {
    this.isThemeModalOpen = true;
  }

  public closeThemeSettings() {
    this.isThemeModalOpen = false;
  }
}
