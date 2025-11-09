import { Injectable, signal } from '@angular/core';
import { Figures } from '../types';

@Injectable({
  providedIn: 'root',
})
export class TetrisService {
  figures = signal<Figures[]>(
    this.shuffleFigures([
      Figures.I,
      Figures.J,
      Figures.L,
      Figures.O,
      Figures.S,
      Figures.T,
      Figures.Z,
    ])
  );
  row: number = 1;
  col: number = 5;

  private shuffleFigures(figures: Figures[]) {
    const shuffled = [...figures];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomIdx = Math.floor(Math.random() * (i+1));
      [shuffled[i], shuffled[randomIdx]] = [shuffled[randomIdx], shuffled[i]];
    }

    return shuffled;
  }

  public updateFiguresPlacement() {
    const updatedFigure = [...this.figures()];
  }
}
