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
      title: 'Играть Онлайн',
      description: 'Подбор соперника и быстрый старт против игроков со всего мира.',
      iconColor: '#60a5fa',
      iconBg: '#dbeafe',
      badge: 'Рейтинг',
      gradient: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 52%, #ecfeff 100%)',
      accent: '#0284c7',
    },
    {
      type: 'bot',
      icon: this.BotIcon,
      title: 'Играть против Бота',
      description: 'Тренировка с ИИ и спокойный темп для отработки дебютов.',
      iconColor: '#c084fc',
      iconBg: '#f3e8ff',
      badge: 'AI sparring',
      gradient: 'linear-gradient(135deg, #ede9fe 0%, #ffffff 52%, #fdf4ff 100%)',
      accent: '#7c3aed',
    },
    {
      type: 'friend',
      icon: this.UsersIcon,
      title: 'Играть c Другом',
      description: 'Личная ссылка на партию и удобный матч с выбранным контролем.',
      iconColor: '#4ade80',
      iconBg: '#dcfce7',
      badge: 'Private room',
      gradient: 'linear-gradient(135deg, #d1fae5 0%, #ffffff 52%, #f7fee7 100%)',
      accent: '#059669',
    },
    {
      type: 'irl',
      icon: this.HandshakeIcon,
      title: 'Игра за доской',
      description: 'Локальная партия за одним устройством для игры рядом.',
      iconColor: '#f59e0b',
      iconBg: '#fef3c7',
      badge: '2 players',
      gradient: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 52%, #fff7ed 100%)',
      accent: '#d97706',
    },
  ];
  readonly speedOptions: GameSpeedOption[] = [
    {
      type: 'classic',
      title: 'Классический',
      time: '10+0',
      subtitle: 'Размеренная партия для долгих решений.',
    },
    {
      type: 'blitz',
      title: 'Блиц',
      time: '3+2',
      subtitle: 'Быстрый контроль времени и агрессивный темп.',
    },
    {
      type: 'rapid',
      title: 'Рапид',
      time: '5+5',
      subtitle: 'Баланс между скоростью и продуманной игрой.',
    },
  ];
  public selectedModes: Record<GameType, GameSpeed> = {
    online: 'blitz',
    bot: 'classic',
    friend: 'rapid',
    irl: 'classic',
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
