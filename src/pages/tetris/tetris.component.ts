import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { TetrisService } from './services/tetris.service';
import { Figures } from './types';

@Component({
  selector: 'tetris',
  templateUrl: './tetris.component.html',
})
export class Tetris implements AfterViewInit {
  constructor(public tetrisService: TetrisService) {}

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('infoCanvas') infoCanvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    if (this.canvas.nativeElement && this.infoCanvas.nativeElement) {
      const tetris = this.tetrisService;
      tetris.init(this.canvas.nativeElement, this.infoCanvas.nativeElement);

      window.addEventListener('keydown', this.onKeyDown.bind(this));

      tetris.interval = setInterval(() => tetris.moveFigure('down'), 500);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    const { key } = event;
    const tetris = this.tetrisService;
    switch (key) {
      case 'ArrowRight':
        tetris.moveFigure('right');
        break;
      case 'ArrowLeft':
        tetris.moveFigure('left');
        break;
      case 'ArrowDown':
        tetris.moveFigure('down');
        break;
      case 'ArrowUp':
        if (tetris.figures[0].label === Figures.O) return;
        tetris.moveFigure('up');
        break;
      case ' ':
        // todo
        break;
    }
  }
}
