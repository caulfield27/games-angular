import { effect, Injectable, signal } from '@angular/core';
import { Figures, FiguresMap } from '../types';
import {
  BOARD_MATRIX,
  COLORS,
  FIGURES_INITIAL_COORDINATES,
} from '../constants';
import Swal from 'sweetalert2';
import { launchConfetti } from '@/shared/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class TetrisService {
  readonly isMobile = window.innerWidth <= 710;
  public bestScore = signal<number>(
    Number(localStorage.getItem('testris_best_score')) || 0
  );
  public level = signal<number>(1);
  public score = signal<number>(0);
  public figures: FiguresMap[] = this.shuffleFigures([
    { label: Figures.I, direction: 0 },
    { label: Figures.J, direction: 0 },
    { label: Figures.L, direction: 0 },
    { label: Figures.O, direction: 0 },
    { label: Figures.S, direction: 0 },
    { label: Figures.T, direction: 0 },
    { label: Figures.Z, direction: 0 },
  ]);
  private matrix = this.getInitialMatrix();
  readonly GRID_ROWS = 10;
  readonly GRID_COLS = 20;
  readonly CELL_SIZE = this.isMobile ? 20 : 25;
  readonly NEXT_CELL_SIZE = this.isMobile ? 10 : 20;
  private canvas: HTMLCanvasElement | null = null;
  private infoCanvas: HTMLCanvasElement | null = null;
  private coordinates: number[][] | null = null;
  private prevCoordinates: number[][] | null = null;
  private x: number = 4;
  private y: number = -1;
  private lastY: number = this.y;
  private isBoardFilled: boolean = false;
  private colorsHash: Map<string, string> = new Map();
  private listener: ((event: KeyboardEvent) => void) | null = null;
  private duration: number = 1000;
  private prevTimestamp: number = 0;
  public gameStopped = signal<boolean>(false);
  public gameStarted = signal<boolean>(false);
  private linesPerLevel: number = 0;

  public init(canvas: HTMLCanvasElement, infoCanvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.infoCanvas = infoCanvas;

    // const dpr = Math.round(window.devicePixelRatio);
    // this.canvas.width = this.CELL_SIZE * this.GRID_ROWS * dpr;
    // this.canvas.height = this.CELL_SIZE * this.GRID_COLS * dpr;

    // this.infoCanvas.width = this.NEXT_CELL_SIZE * 4 * dpr;
    // this.infoCanvas.height = this.NEXT_CELL_SIZE * 4 * dpr;

    this.canvas.width = this.CELL_SIZE * this.GRID_ROWS;
    this.canvas.height = this.CELL_SIZE * this.GRID_COLS;

    this.infoCanvas.width = this.NEXT_CELL_SIZE * 4;
    this.infoCanvas.height = this.NEXT_CELL_SIZE * 4;
  }

  public reset() {
    const ctx1 = this.canvas?.getContext('2d');
    const ctx2 = this.infoCanvas?.getContext('2d');
    if (ctx1)
      ctx1.clearRect(0, 0, this.canvas?.width ?? 0, this.canvas?.height ?? 0);
    if (ctx2)
      ctx2.clearRect(
        0,
        0,
        this.infoCanvas?.width ?? 0,
        this.infoCanvas?.height ?? 0
      );
    this.x = 4;
    this.y = -1;
    this.lastY = this.y;
    this.colorsHash.clear();
    window.removeEventListener('keydown', this.listener!);
    this.gameStopped.set(false);
    this.gameStarted.set(false);
    this.isBoardFilled = false;
    this.matrix = this.getInitialMatrix();
    this.prevTimestamp = 0;
    this.bestScore.set(
      Number(localStorage.getItem('testris_best_score')) || this.score()
    );
    this.score.set(0);
    this.level.set(1);
  }

  public play() {
    if (!this.gameStarted()) {
      this.drawNextFigure();
      this.listener = (e) => this.onKeyDown(e);
      window.addEventListener('keydown', this.listener);
      this.drawNextFigure();
    }
    if (this.gameStopped()) {
      this.gameStopped.set(false);
    }
    this.gameStarted.set(true);
    requestAnimationFrame((time: number) => this.moveDownLoop(time));
  }

  public moveFigure(to: 'left' | 'right' | 'down' | 'up') {
    if (this.isBoardFilled || this.gameStopped() || !this.gameStarted()) return;

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
        this.drawBlock(xdir, ydir, color, this.canvas, this.CELL_SIZE);
      }
    }
    this.prevCoordinates = this.coordinates;

    if (this.isBottom()) {
      if (this.isBoardFilled) {
        const isRecoredBreaked = this.score() > this.bestScore();
        if (isRecoredBreaked) {
          launchConfetti(1000);
          Swal.fire({
            icon: 'success',
            title: 'Вы побили свой рекорд',
            text: `Ваш новый рекорд: ${this.score()}`,
          }).then(() => {
            localStorage.setItem('testris_best_score', String(this.score()));
            this.reset();
          });
        } else {
          Swal.fire({
            title: 'Игра окончена!',
            text: `Ваш счёт: ${this.score()}, текущий рекорд: ${this.bestScore()}`,
          }).then(() => {
            this.reset();
          });
        }
        return;
      }
      this.updateMatrix();
      let breakCounter = 0;
      for (let i = this.y; i <= this.lastY; i++) {
        if (!this.matrix[i]) continue;
        if (this.matrix[i].every((block) => block)) {
          breakCounter++;
          this.linesPerLevel++;
          this.breakLine(i);
        }
      }

      if (breakCounter) {
        const dif =
          breakCounter === 1
            ? 100
            : breakCounter === 2
            ? 300
            : breakCounter === 3
            ? 500
            : 800;
        this.score.update((prev) => (prev += dif * this.level()));
        if (this.linesPerLevel > 10) {
          this.linesPerLevel = 0;
          this.level.update((prev) => prev + 1);
          if (this.duration > 100) {
            this.duration -= 100;
          }
        }
      }

      this.resetPosition();
      this.updateFiguresPlacement();
      this.drawNextFigure();
    }
  }

  private moveDownLoop(timestamp: number) {
    if (timestamp - this.prevTimestamp >= this.duration) {
      this.prevTimestamp = timestamp;
      this.moveFigure('down');
    }

    if (!this.isBoardFilled && !this.gameStopped() && this.gameStarted()) {
      requestAnimationFrame((time: number) => this.moveDownLoop(time));
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
          this.infoCanvas,
          this.NEXT_CELL_SIZE
        );
      }
    }
  }

  private drawBlock(
    x: number,
    y: number,
    color: string,
    canvas: HTMLCanvasElement | null,
    size: number
  ) {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    x = x * size;
    y = y * size;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';

    ctx.fillRect(x, y, size * 0.3, size * 0.3);
    ctx.fillRect(x + size * 0.7, y + size * 0.7, size * 0.3, size * 0.3);

    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
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
      this.matrix[index][x] = false;
      this.clearBlock(x, index);
    }

    for (let x = 0; x < this.matrix[index - 1].length; x++) {
      let start = index - 1;
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
      this.drawBlock(x, y + 1, color ?? '#f00000', this.canvas, this.CELL_SIZE);
      this.colorsHash.set(`${x},${y + 1}`, color ?? '#f00000');
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    event.preventDefault();
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
    }
  }

  private getInitialMatrix() {
    return BOARD_MATRIX.map((arr) => [...arr]);
  }
}
