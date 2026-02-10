import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { IAuthPayload } from '../types/types';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isModalOpen = signal<boolean>(false);
  constructor(private api: ApiService) {}

  login(data: IAuthPayload) {
    return this.api.postData(data).pipe(
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }

  register(data: IAuthPayload) {
    return this.api.postData(data).pipe(
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }
}
