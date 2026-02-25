import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { LucideAngularModule, Bot, Handshake, Globe } from 'lucide-angular';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { ChessService } from './service/chess.service';
import { Figure, Square } from './classes/figure';
import { Color, History } from './types';
import { get1Dposition, get2Dposition, getSquareBg } from './utils';
import { getCoordinates } from '@/shared/utils/getCoordinates';
import { NgStyle } from '@angular/common';
import { GameEndModalComponent } from './components';

@Component({
  selector: 'chess',
  templateUrl: './chess.component.html',
  styleUrl: './chess.component.css',
  imports: [LucideAngularModule, CdkDrag, NgStyle, GameEndModalComponent],
})
export class Chess implements AfterViewInit {
  // icons
  readonly BotIcon = Bot;
  readonly HandshakeIcon = Handshake;
  readonly GlobeIcon = Globe;

  // dom
  @ViewChild('board') board!: ElementRef<HTMLDivElement>;
  @ViewChild('cell') cell!: ElementRef<HTMLDivElement>;

  // states
  cellSize: number = 60;
  currentFigure: Figure | null = null;
  history: History[] = [];

  constructor(public chessService: ChessService) {
    chessService.playerPicesColor =
      Math.round(Math.random()) === 0 ? Color.WHITE : Color.BLACK;

    effect(() => {
      switch (chessService.gameType()) {
        case 'bot':
          //todo
          break;
        case 'friend':
          // todo
          break;
        case 'online':
          //todo
          break;
      }
    });
  }

  ngAfterViewInit(): void {
    const width = this.cell.nativeElement.clientWidth;
    if (width) {
      const root = document.documentElement;
      root.style.setProperty('--chess-cell', width + 'px');
      this.cellSize = width;
    }
  }

  public getBg(idx: number) {
    return getSquareBg(idx);
  }

  public getGridArea(idx: number, position: [number, number] | null) {
    if (position) {
      return { gridColumn: position[1] + 1, gridRow: position[0] + 1 };
    }

    const [gridRow, gridColumn] = get2Dposition(idx) ?? [-1, -1];
    return { gridColumn: gridColumn + 1, gridRow: gridRow + 1 };
  }

  public isFigure(data: Figure | null) {
    return data instanceof Figure;
  }

  public onDragEnd(event: CdkDragEnd<Square>) {
    event.source.reset();
    if (!this.currentFigure) return;
    const { x, y } = getCoordinates(
      this.board.nativeElement,
      event.dropPoint,
      this.cellSize,
      8,
    );
    const newIndex = get1Dposition([y, x]) ?? -1;
    if (!this.chessService.board()[newIndex]?.canMove) return;
    this.handleMove(newIndex);
  }

  get lastMove() {
    const [fisrt, second] = this.history[this.history.length - 1]?.move ?? [];
    return [get1Dposition(fisrt ?? []), get1Dposition(second ?? [])];
  }

  private handleMove(newIndex: number) {
    if (!this.currentFigure) return;

    const prevPosition = this.currentFigure.position();
    this.chessService.moveFigure(this.currentFigure, newIndex);
    this.chessService.updateSquares([]);

    this.history.push({
      move: [prevPosition, this.currentFigure.position()],
    });

    const board = this.chessService.board();
    const oppColor = this.chessService.opponent.color;
    this.chessService.check(
      this.currentFigure.getAllowedSquares(board),
      oppColor,
      this.currentFigure,
    );
  }

  public onPieceChoose(piece: Square) {
    if (!piece.isPlayer || !piece.figure) return;
    this.currentFigure = piece.figure;
    const board = this.chessService.board();
    const allowedSquares = piece.figure.getAllowedSquares(board);
    this.chessService.updateSquares(allowedSquares);
  }

  public onMove(piece: Square, index: number) {
    if (!piece.canMove || !this.currentFigure) return;
    this.handleMove(index);
  }

  public reset() {
    this.chessService.reset();
  }
}
