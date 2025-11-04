import { Injectable, signal } from '@angular/core';
import { IMessage } from '../types/types';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public notifications = signal<number>(0);
  public messages = signal<IMessage[]>([]);

  public addMessage(msg: string, type: 'user' | 'opponent') {
    this.messages.update((prev) => [...prev, { type, content: msg }]);
  }
}
