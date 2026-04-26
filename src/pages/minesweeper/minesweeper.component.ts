import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Lightbulb, LucideAngularModule } from 'lucide-angular';
import { BoardService } from './services/board.service';
import { Tablo } from './components/tablo/tablo.component';
import { HappySmile } from './icons/happySmile.component';
import { SadSmile } from './icons/sadSmile.component';
import { dropdownOptions } from './constants';
import { IDropdownOption, ILevelOption } from '../../shared/types/types';
import { Dropdown } from '@/shared/components/dropdown/dropdown.component';

@Component({
  selector: 'minesweeper',
  templateUrl: './minesweeper.component.html',
  styleUrl: './minesweeper.component.scss',
  imports: [
    Tablo,
    NgClass,
    HappySmile,
    SadSmile,
    LucideAngularModule,
    Dropdown,
  ],
})
export class Minesweeper implements AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  readonly Bulb = Lightbulb;
  readonly options = dropdownOptions;

  constructor(public boardService: BoardService) {}

  get currentLevelName() {
    return this.boardService.level().name;
  }

  get statusTitle() {
    if (this.boardService.isFailed()) {
      return 'Игра окончена';
    }

    if (this.boardService.isGameOver) {
      return 'Поле раскрыто';
    }

    return this.boardService.isGameStart() ? 'Игра идет' : 'Новая партия';
  }

  get statusText() {
    if (this.boardService.isFailed()) {
      return 'Вы попали на мину. Нажмите на смайлик, чтобы начать заново.';
    }

    if (!this.boardService.isGameStart()) {
      return 'Выберите сложность и откройте первую клетку. Первая попытка всегда безопасна.';
    }

    if (this.boardService.hintAmount() === 0) {
      return 'Подсказки закончились. Отмечайте флажками клетки, в которых уверены.';
    }

    return 'Используйте подсказку, если поле зашло в тупик, и следите за счетчиком мин.';
  }

  get hintButtonLabel() {
    return this.boardService.hintAmount() > 0
      ? `Подсказка: ${this.boardService.hintAmount()}`
      : 'Подсказок не осталось';
  }

  ngAfterViewInit(): void {
    this.updateVariables();
  }

  updateVariables() {
    const { levels, level } = this.boardService;
    this.container.nativeElement.style.setProperty(
      '--cols',
      String(levels[level().value].cols),
    );
    this.container.nativeElement.style.setProperty(
      '--rows',
      String(levels[level().value].rows),
    );
    this.container.nativeElement.style.setProperty(
      '--size',
      String(levels[level().value].size),
    );
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
    ) {
      return;
    }

    if (fields[idx].isMine) {
      this.boardService.isFailed.set(true);
      this.boardService.stopTimer();
      this.boardService.fields.update((prev) =>
        prev.map((field, i) =>
          idx === i ? { ...field, isOpen: true, failed: true } : field,
        ),
      );
      setTimeout(() => {
        this.boardService.isGameOver = true;
        this.boardService.gameOver(idx, true);
      }, 500);
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
    this.updateVariables();
    this.boardService.restart();
  }

  ngOnDestroy(): void {
    if (this.boardService.isGameStart()) {
      this.boardService.restart();
    }
  }
}
