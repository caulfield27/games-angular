import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { IAuthPayload, User } from '../types/types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isModalOpen = signal<boolean>(false);
  public isAuthed = signal<boolean>(!!localStorage.getItem('token'));
  public user = signal<User | null>(null);

  constructor(private api: ApiService) {}

  login(data: IAuthPayload) {
    return this.api.postData('/login', data);
  }

  register(data: IAuthPayload) {
    return this.api.postData('/register', data);
  }

  getMe() {
    return this.api.getData('/me');
  }
}
