import { Injectable, signal } from '@angular/core';
import { IMessage } from '../types/types';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public messages = signal<IMessage[]>([]);

  public addMessage(msg: string, type: 'user' | 'opponent') {
    this.messages.update((prev) => [...prev, { type, content: msg }]);
  }
}
