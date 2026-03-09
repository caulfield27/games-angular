import { apiRoutes } from '@/api/api.config';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: WebSocket | null = null;

  connect(handleMessage: (msg: MessageEvent<any>) => void) {
    return new Promise((res) => {
      this.socket = new WebSocket(apiRoutes.chess);
      this.socket.addEventListener('open', () => {
        console.info('ws соеденение успешно установлено');
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
}
