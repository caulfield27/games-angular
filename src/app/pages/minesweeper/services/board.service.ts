import { Injectable, signal } from '@angular/core';
import { getFields, getLevels } from '../utils/utils';
import Swal from 'sweetalert2';
import { launchConfetti } from '../../../shared/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  levels = getLevels(window.innerWidth);
  isGameStart: boolean = false;
  isGameOver: boolean = false;
  fields = signal(getFields(this.levels.easy));
  intervalId: ReturnType<typeof setInterval> | null = null;
  seconds = signal<number>(0);
  flagCounter = signal<number>(this.levels.easy.mines);
  isFailed = signal<boolean>(false);

  checkField(idx: number): number {
    this.fields.update((prev) =>
      prev.map((field, i) => {
        if (i === idx) return { ...field, isOpen: true };
        return field;
      })
    );
    const fields = this.fields();

    const { edgeCase } = fields[idx];
    const neighbours = this.#getNeighbours(edgeCase, idx);

    let counter = 0;
    const validNeighbours = [];
    for (const neighbour of neighbours) {
      if (fields[neighbour]) {
        validNeighbours.push(neighbour);
        if (fields[neighbour]?.isMine) {
          counter++;
        }
      }
    }

    if (counter === 0) {
      for (const neighbour of validNeighbours) {
        if (
          fields[neighbour]?.isMine ||
          fields[neighbour]?.isOpen ||
          fields[neighbour]?.isFlaged
        ) {
          continue;
        }
        const minesAround = this.checkField(neighbour);
        if (minesAround) {
          this.updateMinesAroundStatus(minesAround, neighbour);
        }
      }
    }

    return counter;
  }

  generateMines(firstInd: number): void {
    const { edgeCase } = this.fields()[firstInd];
    const fields = this.fields();
    const saveFields = new Set(this.#getNeighbours(edgeCase, firstInd));
    saveFields.add(firstInd);
    const mines = new Set();
    while (mines.size !== this.levels.easy.mines) {
      const minePosition = Math.floor(Math.random() * fields.length);
      if (saveFields.has(minePosition)) continue;
      if (!mines.has(minePosition)) {
        mines.add(minePosition);
        this.fields.update((prev) =>
          prev.map((field, idx) =>
            idx === minePosition ? { ...field, isMine: true } : field
          )
        );
      }
    }
  }

  #getNeighbours(edgeCase: number, pos: number) {
    const rows = this.levels.easy.rows;
    switch (edgeCase) {
      case 1:
        return [
          pos + 1,
          pos - rows,
          pos + rows,
          pos - rows + 1,
          pos + rows + 1,
        ];
      case 2:
        return [
          pos - 1,
          pos - rows,
          pos + rows,
          pos - rows - 1,
          pos + rows - 1,
        ];
      case 3:
        return [pos + 1, pos + rows, pos + rows + 1];
      case 4:
        return [pos - 1, pos + rows, pos + rows - 1];
      case 5:
        return [pos + 1, pos - rows, pos - rows + 1];
      case 6:
        return [pos - 1, pos - rows, pos - rows - 1];
      case 7:
        return [
          pos + 1,
          pos - 1,
          pos - rows,
          pos + rows,
          pos - rows + 1,
          pos - rows - 1,
          pos + rows + 1,
          pos + rows - 1,
        ];
      default:
        return [];
    }
  }

  isWin() {
    let openCounter = 0;
    const fields = this.fields();
    const mines = this.levels.easy.mines;
    for (const field of fields) {
      if (field.isOpen) {
        openCounter++;
      }
    }
    return openCounter + mines === fields.length;
  }

  startTimer() {
    this.intervalId = setInterval(() => {
      if (this.seconds() === 999) {
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
        this.gameOver(-1, false);
      } else {
        this.seconds.update((second) => second + 1);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  restart() {
    this.fields.set(getFields(this.levels.easy));
    this.isGameStart = false;
    this.isGameOver = false;
    this.flagCounter.set(this.levels.easy.mines);
    this.seconds.set(0);
    this.stopTimer();
  }

  incrementFlags() {
    this.flagCounter.update((prev) => prev + 1);
  }

  decrementFlags() {
    this.flagCounter.update((prev) => prev - 1);
  }

  updateFlagStatus(idx: number) {
    this.fields.update((prev) =>
      prev.map((field, i) => {
        if (i === idx) return { ...field, isFlaged: !field.isFlaged };
        return field;
      })
    );
  }

  updateMinesAroundStatus(minesAround: number, idx: number) {
    this.fields.update((prev) =>
      prev.map((field, i) => {
        if (i === idx) return { ...field, minesAround };
        return field;
      })
    );
  }

  gameOver(faildIdx: number, isMine: boolean) {
    Swal.fire({
      icon: 'error',
      title: 'Вы проиграли',
      text: isMine
        ? 'К сожалению, вы наступили на мину :('
        : 'К сожалению вы не успели найти все мину во время :(',
      showCancelButton: true,
      confirmButtonText: 'Попробовать ещё раз',
      cancelButtonText: 'Посмотреть результат',
    }).then((res) => {
      if (res?.isConfirmed) {
        this.restart();
      } else {
        this.fields.update((prev) =>
          prev.map((field, idx) => {
            if (isMine && idx === faildIdx) {
              return { ...field, failed: true, isOpen: true };
            }

            if (field.isMine) {
              return { ...field, isOpen: true };
            }

            return field;
          })
        );
      }
    });
  }

  handleWin() {
    this.stopTimer();
    launchConfetti(2 * 1000);

    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Поздравляю, вы выиграли!',
        text: `Вы нашли все мины за ${this.seconds() ?? ''} секунд.`,
        confirmButtonText: 'Сыграть ещё',
      }).then((res) => {
        if (res?.isConfirmed) {
          this.restart();
        }
      });
    }, 2000);
  }
}
