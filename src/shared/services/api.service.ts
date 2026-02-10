import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'https://localhost:3000/api';
  constructor(private api: HttpClient) {}

  postData(payload: unknown): Observable<unknown> {
    return this.api.post<unknown>(this.baseUrl, payload);
  }
}
