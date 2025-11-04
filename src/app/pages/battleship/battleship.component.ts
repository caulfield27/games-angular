import { Component, effect, OnInit } from '@angular/core';
import { Board, Chat, FindGameOptions, OpponentBoard } from './components';
import { BattleshipService, ChatService, WebSocketService } from './services';
import { NgStyle } from '@angular/common';
import Swal from 'sweetalert2';
import { IWsMessagePattern, sendMessageType } from './types/types';

@Component({
  selector: 'battleship',
  templateUrl: './battleship.component.html',
  styleUrl: './battleship.component.scss',
  imports: [Chat, Board, FindGameOptions, NgStyle, OpponentBoard],
})
export class Battleship implements OnInit {
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
            data: {
              key: room,
            },
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
        this.ws.sendMessage.bind(WebSocketService),
        (msg: string, type: 'user' | 'opponent') => {
          this.chat.addMessage(msg, type);
        }
      )
    );
  }

  handleQuit() {
    Swal.fire({
      icon: 'warning',
      title: 'Вы действительно хотите покинуть игру?',
      showCancelButton: true,
      cancelButtonText: 'Отмена',
      confirmButtonText: 'Покинуть',
    }).then((res) => {
      if (res?.isConfirmed) {
        this.ws.sendMessage({
          type: sendMessageType.CLOSE_ROOM,
          data: {
            roomId: this.battleshipService.gameSessionData.sessionId,
          },
        });
        this.battleshipService.reset();
      }
    });
  }

  handleShuffle() {
    this.battleshipService.reset();
  }
}
