import { Injectable } from '@angular/core';
import { Figures, FiguresMap } from '../types';
import {
  BOARD_MATRIX,
  COLORS,
  FIGURES_INITIAL_COORDINATES,
} from '../constants';

@Injectable({
  providedIn: 'root',
})
export class TetrisService {
  public figures: FiguresMap[] = this.shuffleFigures([
    { label: Figures.I, direction: 0 },
    { label: Figures.J, direction: 0 },
    { label: Figures.L, direction: 0 },
    { label: Figures.O, direction: 0 },
    { label: Figures.S, direction: 0 },
    { label: Figures.T, direction: 0 },
    { label: Figures.Z, direction: 0 },
  ]);
  private matrix = BOARD_MATRIX;
  readonly GRID_ROWS = 10;
  readonly GRID_COLS = 20;
  readonly CELL_SIZE = 40;
  private canvas: HTMLCanvasElement | null = null;
  private infoCanvas: HTMLCanvasElement | null = null;
  private coordinates: number[][] | null = null;
  private prevCoordinates: number[][] | null = null;
  private x: number = 4;
  private y: number = -1;
  private lastY: number = this.y;
  private isBoardFilled: boolean = false;
  private interval: ReturnType<typeof setInterval> | null = null;
  private colorsHash: Map<string, string> = new Map();
  private listener: ((event: KeyboardEvent) => void) | null = null;
  private asideListener: ((event: KeyboardEvent) => void) | null = null;

  public init(canvas: HTMLCanvasElement, infoCanvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.infoCanvas = infoCanvas;

    const dpr = Math.round(window.devicePixelRatio);

    this.canvas.width = this.CELL_SIZE * this.GRID_ROWS * dpr;
    this.canvas.height = this.CELL_SIZE * this.GRID_COLS * dpr;

    this.infoCanvas.width = this.CELL_SIZE * 4 * dpr;
    this.infoCanvas.height = this.CELL_SIZE * 4 * dpr;
    this.drawNextFigure();
    this.listener = (e) => this.onKeyDown(e);
    window.addEventListener('keydown', this.listener);
    this.interval = setInterval(() => this.moveFigure('down'), 500);
  }

  private moveFigure(
    to: 'left' | 'right' | 'down' | 'up',
    isAside: boolean = false
  ) {
    if (this.isBoardFilled) return;

    const { label, direction } = this.figures[0];
    const color = COLORS[label] ?? '#f0f000';
    const initialMatrix = FIGURES_INITIAL_COORDINATES[label];
    let initialCoordinates = initialMatrix[direction];

    switch (to) {
      case 'up':
        const newDirection =
          direction === initialMatrix.length - 1 ? 0 : direction + 1;

        initialCoordinates = initialMatrix[newDirection];
        const { xSize, ySize } = this.getSize(initialCoordinates);

        if (this.x + xSize > 10 || this.y + ySize > 20 || this.x < 0) {
          return;
        }

        if (
          initialCoordinates.some(
            ([x, y]) => !this.matrix[y + this.y]?.[x + this.x] === false
          )
        )
          return;

        this.figures[0].direction = newDirection;
        break;
      case 'left':
        if (
          initialCoordinates.some(([x, y]) => {
            x = x + this.x - 1;
            y = y + this.y;
            if (x < 0 || this.matrix[y]?.[x]) return true;
            return false;
          })
        )
          return;
        this.x--;
        break;
      case 'right':
        if (
          initialCoordinates.some(([x, y]) => {
            x = x + this.x + 1;
            y = y + this.y;
            if (x > 9 || this.matrix[y]?.[x]) return true;
            return false;
          })
        )
          return;
        this.x++;
        break;
      case 'down':
        this.y++;
    }

    this.coordinates = this.getCoordinates(initialCoordinates);

    if (this.prevCoordinates) {
      for (let i = 0; i < this.prevCoordinates.length; i++) {
        this.clearBlock(this.prevCoordinates[i][0], this.prevCoordinates[i][1]);
      }
    }
    for (let i = 0; i < this.coordinates.length; i++) {
      const [xdir, ydir] = this.coordinates[i];
      if (this.matrix[ydir]?.[xdir] === false) {
        this.colorsHash.set(`${xdir},${ydir}`, color);
        this.drawBlock(xdir, ydir, color, this.canvas);
      }
    }
    this.prevCoordinates = this.coordinates;

    if (isAside) return;

    if (this.isBottom()) {
      clearInterval(this.interval!);
      window.removeEventListener('keydown', this.listener!);
      this.asideListener = (e: KeyboardEvent) => this.onKeyDownAside(e);
      window.addEventListener('keydown', this.asideListener);

      setTimeout(() => {
        let lastLine = null;
        this.updateMatrix();
        for (let i = this.y; i <= this.lastY; i++) {
          if (this.matrix[i].every((block) => block)) {
            lastLine = i;
            this.breakLine(i);
          }
        }

        if (lastLine !== null) {
          while (this.matrix[lastLine].every((block) => block)) {
            this.breakLine(lastLine);
          }
        }

        this.resetPosition();
        this.updateFiguresPlacement();
        this.drawNextFigure();
        this.interval = setInterval(() => this.moveFigure('down'), 500);
        window.removeEventListener('keydown', this.asideListener!);
        window.addEventListener('keydown', this.listener!);
      }, 350);
    }
  }

  private shuffleFigures(figures: FiguresMap[]) {
    const shuffled = [...figures];
    this.randomSwap([0, shuffled.length - 1], shuffled);
    return shuffled;
  }

  private updateFiguresPlacement() {
    this.figures.push(this.figures.shift()!);
    this.randomSwap([2, this.figures.length - 1], this.figures);
  }

  private getSize(coordinates: number[][]): { xSize: number; ySize: number } {
    const xSeen = new Set();
    const ySeen = new Set();
    let xSize = 0;
    let ySize = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const x = coordinates[i][0];
      const y = coordinates[i][1];
      if (!xSeen.has(x)) {
        xSeen.add(x);
        xSize++;
      }

      if (!ySeen.has(y)) {
        ySeen.add(y);
        ySize++;
      }
    }

    return { xSize, ySize };
  }

  private getLastY(coordinates: number[][]): number {
    let lastY = -Infinity;
    for (let i = 0; i < coordinates.length; i++) {
      if (coordinates[i][1] > lastY) {
        lastY = coordinates[i][1];
      }
    }

    return lastY;
  }

  private randomSwap(range: number[], arr: FiguresMap[]): void {
    const rangeArr = [];
    for (let i = range[1]; i >= range[0]; i--) {
      rangeArr.push(i);
    }

    for (let i = range[1]; i >= range[0]; i--) {
      const randomRangeIdx = Math.floor(Math.random() * rangeArr.length);
      const randomIdx = rangeArr[randomRangeIdx];
      [arr[i], arr[randomIdx]] = [arr[randomIdx], arr[i]];
    }
  }

  private drawNextFigure() {
    const ctx = this.infoCanvas?.getContext('2d');
    if (ctx) {
      const { width, height } = ctx.canvas;
      ctx.clearRect(0, 0, width, height);
      const coordinates = FIGURES_INITIAL_COORDINATES[this.figures[1].label][0];
      const color = COLORS[this.figures[1].label];
      for (let i = 0; i < coordinates.length; i++) {
        this.drawBlock(
          coordinates[i][0] + 1,
          coordinates[i][1],
          color,
          this.infoCanvas
        );
      }
    }
  }

  private drawBlock(
    x: number,
    y: number,
    color: string,
    canvas: HTMLCanvasElement | null
  ) {
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      x = x * this.CELL_SIZE;
      y = y * this.CELL_SIZE;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, this.CELL_SIZE, this.CELL_SIZE);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(x, y, this.CELL_SIZE * 0.3, this.CELL_SIZE * 0.3);
      ctx.fillRect(
        x + this.CELL_SIZE * 0.7,
        y + this.CELL_SIZE * 0.7,
        this.CELL_SIZE * 0.3,
        this.CELL_SIZE * 0.3
      );

      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, this.CELL_SIZE - 2, this.CELL_SIZE - 2);
    }
  }

  private clearBlock(x: number, y: number) {
    const ctx = this.canvas?.getContext('2d');
    if (ctx) {
      x = x * this.CELL_SIZE;
      y = y * this.CELL_SIZE;
      ctx.clearRect(x, y, this.CELL_SIZE, this.CELL_SIZE);
    }
  }

  private isBottom(): boolean {
    const coordinates = this.coordinates;
    if (coordinates) {
      this.lastY = this.getLastY(coordinates);
      if (this.lastY === this.matrix.length - 1) return true;

      if (coordinates.some(([x, y]) => this.matrix[y + 1]?.[x])) {
        if (this.y === 0) {
          this.isBoardFilled = true;
          if (this.interval) {
            clearInterval(this.interval);
          }
        }
        return true;
      }

      return false;
    }
    return false;
  }

  private getCoordinates(coordinates: number[][]): number[][] {
    const validCoordinates = JSON.parse(JSON.stringify(coordinates));
    for (let i = 0; i < validCoordinates.length; i++) {
      validCoordinates[i][0] = validCoordinates[i][0] + this.x;
      validCoordinates[i][1] = validCoordinates[i][1] + this.y;
    }

    return validCoordinates;
  }

  private resetPosition() {
    this.x = 4;
    this.y = -1;
    this.coordinates = null;
    this.prevCoordinates = null;
    this.lastY = this.y;
  }

  private updateMatrix() {
    const coordinates = this.coordinates;
    if (coordinates) {
      for (let i = 0; i < coordinates.length; i++) {
        const [x, y] = coordinates[i];
        if (this.matrix[y]?.[x] !== undefined) {
          this.matrix[y][x] = true;
        }
      }
    }
  }

  private breakLine(index: number) {
    for (let x = 0; x < this.matrix[index].length; x++) {
      let start = index;
      while (start >= 0) {
        if (this.matrix[start][x]) {
          this.dropBlock(x, start);
        }
        start--;
      }
    }
  }

  private dropBlock(x: number, y: number) {
    this.matrix[y][x] = false;
    this.clearBlock(x, y);
    const key = `${x},${y}`;
    const color = this.colorsHash.get(key);
    this.colorsHash.delete(key);
    if (this.matrix[y + 1]?.[x] !== undefined) {
      this.matrix[y + 1][x] = true;
      this.drawBlock(x, y + 1, color ?? '#f00000', this.canvas);
      this.colorsHash.set(`${x},${y + 1}`, color ?? '#f00000');
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    const { key } = event;
    switch (key) {
      case 'ArrowRight':
        this.moveFigure('right');
        break;
      case 'ArrowLeft':
        this.moveFigure('left');
        break;
      case 'ArrowDown':
        this.moveFigure('down');
        break;
      case 'ArrowUp':
        if (this.figures[0].label === Figures.O) return;
        this.moveFigure('up');
        break;
      case ' ':
        // todo
        break;
    }
  }

  private onKeyDownAside(event: KeyboardEvent) {
    const { key } = event;
    switch (key) {
      case 'ArrowRight':
        this.moveFigure('right', true);
        break;
      case 'ArrowLeft':
        this.moveFigure('left', true);
        break;
    }
  }
}
