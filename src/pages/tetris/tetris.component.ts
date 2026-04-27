import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { TetrisService } from './services/tetris.service';
import {
  LucideAngularModule,
  ArrowBigRight,
  ArrowBigLeft,
  ArrowBigDown,
  ArrowBigUp,
  Play,
  Pause,
} from 'lucide-angular';
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

  ngAfterViewInit(): void {
    if (this.canvas.nativeElement && this.infoCanvas.nativeElement) {
      const tetris = this.tetrisService;
      tetris.init(this.canvas.nativeElement, this.infoCanvas.nativeElement);
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
      this.currentAnimationFrameId = requestAnimationFrame((ts) =>
        this.requestMove(ts, move)
      );
      return;
    }

    const delta = ts - this.prevTs;

    if (delta > 100) {
      this.tetrisService.moveFigure(move);
      this.prevTs = ts;
    }
    this.currentAnimationFrameId = requestAnimationFrame((ts) =>
      this.requestMove(ts, move)
    );
  }

  onMouseDown(move: Move) {
    this.currentAnimationFrameId = requestAnimationFrame((ts) =>
      this.requestMove(ts, move)
    );
  }

  onMouseUp() {
    if (this.currentAnimationFrameId != null) {
      cancelAnimationFrame(this.currentAnimationFrameId);
      this.prevTs = null;
    }
  }
}
