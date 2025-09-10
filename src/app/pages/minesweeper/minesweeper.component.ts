import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BoardService } from './services/board.service';
import { Tablo } from './components/tablo/tablo.component';

@Component({
  selector: 'minesweeper',
  templateUrl: './minesweeper.component.html',
  styleUrl: './minesweeper.component.scss',
  imports: [Tablo]
})

export class Minesweeper implements AfterViewInit {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  constructor(public boardService: BoardService) {};

  ngAfterViewInit(): void {
    this.container.nativeElement.style.setProperty(
      '--cols',
      String(this.boardService.levels().easy.cols)
    );
    this.container.nativeElement.style.setProperty(
      '--rows',
      String(this.boardService.levels().easy.rows)
    );
    this.container.nativeElement.style.setProperty(
      '--size',
      String(this.boardService.levels().easy.size)
    );
  }
}
