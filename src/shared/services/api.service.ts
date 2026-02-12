import { Injectable } from '@angular/core';
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getToken } from '../utils/auth';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';
  private request;
  constructor() {
    this.request = axios.create({
      baseURL: this.baseUrl,
    });

    this.request.interceptors.request.use(
      (config: InternalAxiosRequestConfig<any>) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
    );
  }

  postData(url: string, payload: unknown): Promise<AxiosResponse> {
    return this.request.post<unknown>(this.baseUrl + url, payload);
  }

  getData(url: string): Promise<AxiosResponse> {
    return this.request.get<unknown>(this.baseUrl + url);
  }
}
