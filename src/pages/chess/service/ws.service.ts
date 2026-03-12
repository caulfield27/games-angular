import { apiRoutes } from '@/api/api.config';
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  public state = signal<'idle' | 'open' | 'closed'>('idle');

  connect(handleMessage: (msg: MessageEvent<unknown>) => void) {
    return new Promise((res) => {
      this.socket = new WebSocket(apiRoutes.chess);
      this.socket.addEventListener('open', () => {
        console.info('ws соеденение успешно установлено');
        this.state.set('open');
        this.socket!.addEventListener('message', handleMessage);
        res(null);
      });
    });
  }

  send(msg: unknown) {
    if (this.socket && this.socket.readyState === this.socket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    }
  }

  close(code: number, roomId: string) {
    if (this.socket && this.socket.readyState === this.socket.OPEN) {
      this.socket.close(code, roomId);
      this.state.set('closed');
    }
  }
}
