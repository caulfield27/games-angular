import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { TetrisService } from './services/tetris.service';

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
    }
  }
}
