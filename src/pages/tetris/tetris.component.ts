import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
  LucideAngularModule,
  Pause,
  Play,
} from 'lucide-angular';
import { TetrisService } from './services/tetris.service';
import { Move } from './types';

@Component({
  selector: 'tetris',
  templateUrl: './tetris.component.html',
  styleUrl: './tetris.component.scss',
  imports: [LucideAngularModule],
})
export class Tetris implements AfterViewInit, OnDestroy {
  readonly ArrowRight = ArrowBigRight;
  readonly ArrowLeft = ArrowBigLeft;
  readonly ArrowDown = ArrowBigDown;
  readonly ArrowUp = ArrowBigUp;
  readonly Play = Play;
  readonly Pause = Pause;

  private currentAnimationFrameId: number | null = null;
  private prevTs: number | null = null;

  constructor(public tetrisService: TetrisService) {}

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('infoCanvas') infoCanvas!: ElementRef<HTMLCanvasElement>;

  get gameActionLabel() {
    return this.tetrisService.gameStarted() && !this.tetrisService.gameStopped()
      ? 'Пауза'
      : this.tetrisService.gameStarted()
        ? 'Продолжить'
        : 'Старт';
  }

  get gameStatusTitle() {
    if (!this.tetrisService.gameStarted()) {
      return 'Готов к старту';
    }

    return this.tetrisService.gameStopped() ? 'Пауза' : 'Игра идет';
  }

  get gameStatusText() {
    if (!this.tetrisService.gameStarted()) {
      return 'Запустите игру и собирайте линии, пока скорость не станет безумной.';
    }

    return this.tetrisService.gameStopped()
      ? 'Игра остановлена. Нажмите старт, чтобы продолжить с текущего места.'
      : 'Следите за следующим блоком и удерживайте ритм падения.';
  }

  ngAfterViewInit(): void {
    if (this.canvas.nativeElement && this.infoCanvas.nativeElement) {
      this.tetrisService.init(
        this.canvas.nativeElement,
        this.infoCanvas.nativeElement,
      );
    }
  }

  ngOnDestroy(): void {
    this.tetrisService.reset();
  }

  onPause() {
    this.tetrisService.gameStopped.set(true);
  }

  moveUp() {
    this.tetrisService.moveFigure('up');
  }

  requestMove(ts: number, move: Move) {
    if (this.prevTs === null) {
      this.tetrisService.moveFigure(move);
      this.prevTs = ts;
      this.currentAnimationFrameId = requestAnimationFrame((nextTs) =>
        this.requestMove(nextTs, move),
      );
      return;
    }

    const delta = ts - this.prevTs;

    if (delta > 100) {
      this.tetrisService.moveFigure(move);
      this.prevTs = ts;
    }

    this.currentAnimationFrameId = requestAnimationFrame((nextTs) =>
      this.requestMove(nextTs, move),
    );
  }

  onMouseDown(move: Move) {
    this.currentAnimationFrameId = requestAnimationFrame((ts) =>
      this.requestMove(ts, move),
    );
  }

  onMouseUp() {
    if (this.currentAnimationFrameId != null) {
      cancelAnimationFrame(this.currentAnimationFrameId);
      this.currentAnimationFrameId = null;
      this.prevTs = null;
    }
  }
}
