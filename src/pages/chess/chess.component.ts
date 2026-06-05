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
  styleUrl: './chess.component.scss',
  imports: [
    GameEndModalComponent,
    Game,
    LucideAngularModule,
    ThemeSettingsComponent
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
    title: 'Онлайн партия',
    description: 'Быстрый подбор соперника с близким рейтингом и игра в реальном времени.',
    iconColor: '#60a5fa',
    iconBg: '#dbeafe',
    badge: 'Рейтинг',
    accent: '#0284c7',
    piece: '♙',
  },
  {
    type: 'bot',
    icon: this.BotIcon,
    title: 'Против компьютера',
    description: 'Играйте с ИИ разного уровня сложности и отрабатывайте тактику и дебюты.',
    iconColor: '#c084fc',
    iconBg: '#f3e8ff',
    badge: 'ИИ',
    accent: '#7c3aed',
    piece: '♞',
  },
  {
    type: 'friend',
    icon: this.UsersIcon,
    title: 'Игра с другом',
    description: 'Создайте приватную комнату и отправьте ссылку для совместной партии.',
    iconColor: '#4ade80',
    iconBg: '#dcfce7',
    badge: 'Приват',
    accent: '#059669',
    piece: '♜',
  },
  {
    type: 'irl',
    icon: this.HandshakeIcon,
    title: 'За одной доской',
    description: 'Локальная партия на одном устройстве — идеально для игры рядом.',
    iconColor: '#f59e0b',
    iconBg: '#fef3c7',
    badge: '2 игрока',
    accent: '#d97706',
    piece: '♛',
  },
];


  constructor(
    public chessService: ChessService,
    public ws: WebsocketService,
  ) {
    effect(async () => {
      switch (chessService.gameType()) {
        case 'bot':
          chessService.opponent.name.set('Stockfish');
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

  public handleRematch() {
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
