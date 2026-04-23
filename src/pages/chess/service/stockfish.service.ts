import { apiRoutes } from '@/api/api.config';
import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root',
})
export class StockfishService {
  private api: string = apiRoutes.stockfish;
  readonly depth: number = 12;
  public isThinking: boolean = false;
  constructor() {}

  public async bestMove(fen: string): Promise<string | null> {
    try {
      this.isThinking = true;
      let query = `?fen=${fen}&depth=${this.depth}`;
      const response = await axios.get<StockfishResponse>(this.api + query);
      if (response.data.success) {
        return response.data.bestmove.split(' ')[1];
      } else {
        throw new Error('Ошибка запроса');
      }
    } catch (e) {
      console.error('stockfish err: ', e);
      return null;
    } finally {
      this.isThinking = false;
    }
  }
}

interface StockfishResponse {
  success: boolean;
  evaluation: number | null;
  mate: number | null;
  bestmove: string;
  continuation: string;
}
