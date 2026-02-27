import { Component, ElementRef, ViewChild } from '@angular/core';
import { LucideAngularModule, Flag } from 'lucide-angular';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { ChessService } from '../../service/chess.service';
import { Figure, Square } from '../../classes/figure';
import { Color, GameType } from '../../types';
import { get1Dposition, get2Dposition, getSquareBg } from '../../utils';
import { getCoordinates } from '@/shared/utils/getCoordinates';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  imports: [LucideAngularModule, CdkDrag, CommonModule],
})
export class Game {
  // icons
  readonly FlagIcon = Flag;

  // dom
  @ViewChild('board') board!: ElementRef<HTMLDivElement>;
  @ViewChild('cell') cell!: ElementRef<HTMLDivElement>;

  // states
  cellSize: number = 60;
  currentFigure: Figure | null = null;

  constructor(public chessService: ChessService) {
    chessService.playerPicesColor =
      Math.round(Math.random()) === 0 ? Color.WHITE : Color.BLACK;
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
    const history = this.chessService.history();
    const [fisrt, second] = history[history.length - 1]?.move ?? [];
    return [get1Dposition(fisrt ?? []), get1Dposition(second ?? [])];
  }

  private handleMove(newIndex: number) {
    if (!this.currentFigure) return;

    this.chessService.moveFigure(this.currentFigure, newIndex);
    this.chessService.updateSquares([]);

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
    const allowedSquares = this.chessService.checkKingSavety(
      piece.figure.getAllowedSquares(board, this.chessService.history()),
      this.lastMove[1] ?? -1,
    );
    this.chessService.updateSquares(allowedSquares);
  }

  public onMove(piece: Square, index: number) {
    if (!piece.canMove || !this.currentFigure) return;
    this.handleMove(index);
  }

  public isDragDisabled(figure: Figure) {
    if (this.chessService.gameType() === 'irl') {
      return this.chessService.moveTurn() !== figure.color;
    } else {
      return !figure.isPlayer;
    }
  }
}
