import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  BattleshipService,
  ChatService,
  WebSocketService,
} from '../../services';
import { NgClass } from '@angular/common';
import { sendMessageType } from '../../types/types';

@Component({
  selector: 'battleship-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  imports: [NgClass],
})
export class Chat {
  constructor(
    public battleshipService: BattleshipService,
    public chatService: ChatService,
    private ws: WebSocketService
  ) {}

  @ViewChild('msgInput') msgInput!: ElementRef<HTMLInputElement>;

  onOpen() {
    this.battleshipService.isChatOpen.set(true);
    this.battleshipService.notifications.set(0);
  }

  onCLose() {
    this.battleshipService.isChatOpen.set(false);
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Enter') return;
    this.handleSend();
  }

  handleSend() {
    const value = this.msgInput?.nativeElement?.value;
    if (value) {
      this.chatService.addMessage(value, 'user');
      this.ws.sendMessage({
        type: sendMessageType.MESSAGE,
        data: {
          curRoomId: this.battleshipService.gameSessionData.sessionId,
          value,
        },
      });
      this.msgInput.nativeElement.value = '';
    }
  }
}
