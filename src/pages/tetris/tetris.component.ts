import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { TetrisService } from './services/tetris.service';

@Component({
  selector: 'tetris',
  templateUrl: './tetris.component.html',
})
export class Tetris implements AfterViewInit {
  constructor(public tetrisService: TetrisService) {}

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    if (this.canvas.nativeElement) {
      this.tetrisService.drawGrid(this.canvas.nativeElement);
    }
  }
}
