import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BoardService } from './services/board.service';
import { Tablo } from './components/tablo/tablo.component';
import { FlagIcon } from './icons/flag.component';
import { MineIcon } from './icons/mine.component';
import { NgClass } from '@angular/common';
import { HappySmile } from './icons/happySmile.component';
import { SadSmile } from './icons/sadSmile.component';

@Component({
  selector: 'minesweeper',
  templateUrl: './minesweeper.component.html',
  styleUrl: './minesweeper.component.scss',
  imports: [Tablo, FlagIcon, MineIcon, NgClass, HappySmile, SadSmile]
})

export class Minesweeper implements AfterViewInit {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  constructor(public boardService: BoardService) {};

  ngAfterViewInit(): void {
    this.container.nativeElement.style.setProperty(
      '--cols',
      String(this.boardService.levels.easy.cols)
    );
    this.container.nativeElement.style.setProperty(
      '--rows',
      String(this.boardService.levels.easy.rows)
    );
    this.container.nativeElement.style.setProperty(
      '--size',
      String(this.boardService.levels.easy.size)
    );
  }

  onFieldCheck(e: MouseEvent, idx: number){
    if (this.boardService.isGameOver) return;
      e.preventDefault();
      const fields = this.boardService.fields();
      if (fields[idx].isFlaged) {
        this.boardService.incrementFlags();
        this.boardService.updateFlagStatus(idx);
      } else {
        if (this.boardService.flagCounter() < 1) return;
        this.boardService.decrementFlags();
        this.boardService.updateFlagStatus(idx);
      }
  }

  onFieldClick(idx: number){
    if (!this.boardService.isGameStart) {
        this.boardService.isGameStart = true;
        this.boardService.startTimer();
        this.boardService.generateMines(idx);
      }

      const fields = this.boardService.fields();

      if (fields[idx].isOpen || fields[idx].isFlaged || this.boardService.isGameOver) return;

      if (fields[idx].isMine) {
        this.boardService.isFailed.set(true);
        this.boardService.isGameOver = true;
        this.boardService.stopTimer();
        this.boardService.gameOver(idx, true);
        return;
      }

      const minesAround = this.boardService.checkField(idx);

      if(minesAround){
        this.boardService.updateMinesAroundStatus(minesAround, idx);
      }

      if(this.boardService.isWin()){
        this.boardService.handleWin();
      }

      if(minesAround){
        this.boardService.updateMinesAroundStatus(minesAround, idx);
      }
  }
}
