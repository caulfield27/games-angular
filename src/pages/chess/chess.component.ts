import { Component, effect, OnInit } from '@angular/core';
import { ChessService } from './service/chess.service';
import {
  Game,
  GameEndModalComponent,
  ThemeSettingsComponent,
  ChessButton,
  ChessChip,
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
import { GameSpeed, GameSpeedOption, GameType, MenuOption } from './types';
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
    ChessButton,
    ChessChip,
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
    gradient: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 52%, #ecfeff 100%)',
    accent: '#0284c7',
  },
  {
    type: 'bot',
    icon: this.BotIcon,
    title: 'Против компьютера',
    description: 'Играйте с ИИ разного уровня сложности и отрабатывайте тактику и дебюты.',
    iconColor: '#c084fc',
    iconBg: '#f3e8ff',
    badge: 'AI',
    gradient: 'linear-gradient(135deg, #ede9fe 0%, #ffffff 52%, #fdf4ff 100%)',
    accent: '#7c3aed',
  },
  {
    type: 'friend',
    icon: this.UsersIcon,
    title: 'Игра с другом',
    description: 'Создайте приватную комнату и отправьте ссылку для совместной партии.',
    iconColor: '#4ade80',
    iconBg: '#dcfce7',
    badge: 'Private',
    gradient: 'linear-gradient(135deg, #d1fae5 0%, #ffffff 52%, #f7fee7 100%)',
    accent: '#059669',
  },
  {
    type: 'irl',
    icon: this.HandshakeIcon,
    title: 'За одной доской',
    description: 'Локальная партия на одном устройстве — идеально для игры рядом.',
    iconColor: '#f59e0b',
    iconBg: '#fef3c7',
    badge: '2 игрока',
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 52%, #fff7ed 100%)',
    accent: '#d97706',
  },
];

readonly speedOptions: GameSpeedOption[] = [
  {
    type: 'bullet',
    title: 'Пуля',
    time: '1+0',
    subtitle: 'Максимально быстрые партии на реакцию и интуицию.',
  },
  {
    type: 'blitz',
    title: 'Блиц',
    time: '3+2',
    subtitle: 'Динамичная игра с упором на тактику и скорость.',
  },
  {
    type: 'rapid',
    title: 'Рапид',
    time: '10+0',
    subtitle: 'Оптимальный баланс между скоростью и качеством решений.',
  },
  {
    type: 'classic',
    title: 'Классика',
    time: '15+10',
    subtitle: 'Глубокая позиционная игра с достаточным временем на расчёт.',
  },
];
  public selectedModes: Record<GameType, GameSpeed> = {
    online: 'rapid',
    bot: 'rapid',
    friend: 'rapid',
    irl: 'rapid',
  };

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

  public onModeChoose(gameType: GameType, speed: GameSpeed) {
    this.selectedModes = {
      ...this.selectedModes,
      [gameType]: speed,
    };
  }

  public getSelectedMode(gameType: GameType) {
    return this.speedOptions.find((item) => item.type === this.selectedModes[gameType]) ?? this.speedOptions[0];
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
