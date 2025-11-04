import { WS_CONNECTION_URL } from '@/app/api/api.config';
import { Injectable, signal } from '@angular/core';
import {
  IWsIncomeMessage,
  IWsMessagePattern,
  sendMessageType,
  WsState,
} from '../types/types';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  public state = signal<WsState>('idle');
  public clientId: null | string = null;
  private messageHandler: ((msg: IWsIncomeMessage) => void) | null = null;

  public setMessageHandler(msgHandler: (msg: IWsIncomeMessage) => void) {
    this.messageHandler = msgHandler;
  }

  public connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    this.state.set('connecting');
    this.socket = new WebSocket(WS_CONNECTION_URL);

    this.socket.onopen = () => {
      const userId = uuidv4();
      this.clientId = userId;
      this.state.set('open');

      this.sendMessage({
        type: sendMessageType.INIT,
        data: userId,
      });

      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.onmessage = (event: MessageEvent<string>) => {
          const data = JSON.parse(event.data) as IWsIncomeMessage;
          if (this.messageHandler) {
            this.messageHandler(data);
          }
        };

        this.socket.close = () => {
          this.state.set('closed');
        };

        this.socket.onerror = () => {
          this.state.set('error');
        };
      }
    };
  }

  public sendMessage(message: IWsMessagePattern) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}
