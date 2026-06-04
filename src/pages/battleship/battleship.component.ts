import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { Board, Chat, FindGameOptions, OpponentBoard } from './components';
import { BattleshipService, ChatService, WebSocketService } from './services';
import { NgStyle } from '@angular/common';
import { sendMessageType } from './types/types';
import { AppModalService } from '@/shared/services/modal.service';

@Component({
  selector: 'battleship',
  templateUrl: './battleship.component.html',
  styleUrl: './battleship.component.scss',
  imports: [Chat, Board, FindGameOptions, NgStyle, OpponentBoard],
})
export class Battleship implements OnInit, OnDestroy {
  private readonly modalService = inject(AppModalService);

  constructor(
    public battleshipService: BattleshipService,
    public ws: WebSocketService,
    private chat: ChatService
  ) {
    effect(() => {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      if (room) {
        if (this.ws.state() === 'open') {
          this.ws.sendMessage({
            type: sendMessageType.INVITE,
            data: { key: room },
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.ws.connect();
    this.ws.setMessageHandler((data) =>
      this.battleshipService.onMessage(
        data,
        this.ws.sendMessage.bind(this.ws),
        (msg: string, type: 'user' | 'opponent') => {
          this.chat.addMessage(msg, type);
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.battleshipService.reset(true);
  }

  handleQuit() {
    this.modalService.open({
      icon: 'warning',
      title: 'Покинуть игру?',
      body: 'Вы действительно хотите покинуть текущую партию?',
      confirmText: 'Покинуть',
      cancelText: 'Отмена',
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        this.ws.sendMessage({
          type: sendMessageType.CLOSE_ROOM,
          data: { roomId: this.battleshipService.gameSessionData.sessionId },
        });
        this.battleshipService.reset(false);
      }
    });
  }

  handleShuffle() {
    this.battleshipService.shuffleShips(false, true);
  }
}
