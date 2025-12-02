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

@Component({
  selector: 'tetris',
  templateUrl: './tetris.component.html',
  imports: [LucideAngularModule],
})
export class Tetris implements AfterViewInit, OnDestroy {
  readonly ArrowRight = ArrowBigRight;
  readonly ArrowLeft = ArrowBigLeft;
  readonly ArrowDown = ArrowBigDown;
  readonly ArrowUp = ArrowBigUp;
  readonly Play = Play;
  readonly Pause = Pause;

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

  moveLeft() {
    this.tetrisService.moveFigure('left');
  }
  moveRight() {
    this.tetrisService.moveFigure('right');
  }
  moveDown() {
    this.tetrisService.moveFigure('down');
  }
  moveUp() {
    this.tetrisService.moveFigure('up');
  }
}
