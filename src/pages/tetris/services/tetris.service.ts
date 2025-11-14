import { Injectable, signal } from '@angular/core';
import { FiguresMap } from '../types';

@Injectable({
  providedIn: 'root',
})
export class TetrisService {
  figures = signal<FiguresMap[]>(
    this.shuffleFigures([
      { i: 0 },
      { j: 0 },
      { l: 0 },
      { o: 0 },
      { s: 0 },
      { t: 0 },
      { z: 0 },
    ])
  );
  readonly GRID_ROWS = 10;
  readonly GRID_COLS = 20;
  readonly GRID_SIZE = 40;
  private canvas: HTMLCanvasElement | null = null;

  private shuffleFigures(figures: FiguresMap[]) {
    const shuffled = [...figures];

    for (let i = shuffled.length - 1; i > 0; i--) {
      this.randomSwap(i, shuffled);
    }

    return shuffled;
  }

  public updateFiguresPlacement() {
    const updatedFigure = [...this.figures()];
    updatedFigure.push(updatedFigure.shift() ?? { i: 0 });

    for (let i = updatedFigure.length - 1; i >= 3; i--) {
      this.randomSwap(i, updatedFigure);
    }

    this.figures.set(updatedFigure);
  }

  private randomSwap(idx: number, arr: FiguresMap[]): void {
    const randomIdx = Math.floor(Math.random() * (idx + 1));
    [arr[idx], arr[randomIdx]] = [arr[randomIdx], arr[idx]];
  }

  public drawGrid(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i <= this.GRID_ROWS; i++) {
      const px = this.GRID_SIZE * (i || 1);
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(this.GRID_SIZE, px);
        ctx.lineTo(px, this.GRID_SIZE);
        ctx.strokeStyle = 'white';
        ctx.stroke();
      }
    }
  }
}
