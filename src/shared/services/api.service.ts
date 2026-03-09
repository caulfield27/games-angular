import { Injectable } from '@angular/core';
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getToken } from '../utils/auth';
import { base_url } from '@/api/api.config';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = base_url;
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
