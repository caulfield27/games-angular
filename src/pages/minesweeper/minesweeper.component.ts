import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BoardService } from './services/board.service';
import { Tablo } from './components/tablo/tablo.component';
import { FlagIcon } from './icons/flag.component';
import { MineIcon } from './icons/mine.component';
import { NgClass } from '@angular/common';
import { HappySmile } from './icons/happySmile.component';
import { SadSmile } from './icons/sadSmile.component';
import { Lightbulb, LucideAngularModule } from 'lucide-angular';
import { Dropdown } from '../../shared/components/dropdown/dropdown.component';
import { dropdownOptions } from './constants';
import { IDropdownOption, ILevelOption } from '../../shared/types/types';

@Component({
  selector: 'minesweeper',
  templateUrl: './minesweeper.component.html',
  styleUrl: './minesweeper.component.scss',
  imports: [
    Tablo,
    FlagIcon,
    MineIcon,
    NgClass,
    HappySmile,
    SadSmile,
    LucideAngularModule,
  ],
})
export class Minesweeper implements AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  readonly Bulb = Lightbulb;
  readonly options = dropdownOptions;

  constructor(public boardService: BoardService) {}

  ngAfterViewInit(): void {
    this.updateBoardSize();
    window.addEventListener('resize', () => this.updateBoardSize());
  }

  updateBoardSize() {
    const maxWidth = window.innerWidth * 0.78; // максимальная ширина board
    const maxHeight = window.innerHeight * 0.65; // максимальная высота board

    const { levels, level } = this.boardService;
    const cols = levels[level().value].cols;
    const rows = levels[level().value].rows;

    // размер клетки под текущий экран
    const sizeByWidth = maxWidth / cols;
    const sizeByHeight = maxHeight / rows;

    // выбираем минимальный, чтобы не вылезло ни по ширине, ни по высоте
    const cellSize = Math.floor(Math.min(sizeByWidth, sizeByHeight));

    // устанавливаем CSS переменные
    this.container.nativeElement.style.setProperty('--cell', cellSize + 'px');
    this.container.nativeElement.style.setProperty('--cols', cols.toString());
    this.container.nativeElement.style.setProperty('--rows', rows.toString());
  }

  onFieldCheck(e: MouseEvent, idx: number) {
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

  onFieldClick(idx: number) {
    if (!this.boardService.isGameStart()) {
      this.boardService.isGameStart.set(true);
      this.boardService.startTimer();
      this.boardService.generateMines(idx);
    }

    const fields = this.boardService.fields();

    if (
      fields[idx].isOpen ||
      fields[idx].isFlaged ||
      this.boardService.isGameOver
    )
      return;

    if (fields[idx].isMine) {
      this.boardService.isFailed.set(true);
      this.boardService.isGameOver = true;
      this.boardService.stopTimer();
      this.boardService.gameOver(idx, true);
      return;
    }

    const minesAround = this.boardService.checkField(idx);

    if (minesAround) {
      this.boardService.updateMinesAroundStatus(minesAround, idx);
    }

    if (this.boardService.isWin()) {
      this.boardService.handleWin();
    }

    if (minesAround) {
      this.boardService.updateMinesAroundStatus(minesAround, idx);
    }
  }

  handleUseHint() {
    if (this.boardService.hintAmount() === 0) return;
    this.boardService.hintAmount.update((prev) => prev - 1);
    this.boardService.showHint();
  }

  handleLevelSelect(option: IDropdownOption) {
    this.boardService.level.set(option as ILevelOption);
    this.updateBoardSize();
    this.boardService.restart();
  }

  ngOnDestroy(): void {
    if (this.boardService.isGameStart()) {
      this.boardService.restart();
    }
  }
}
