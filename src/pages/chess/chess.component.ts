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
import { Figure } from './classes/figure';
import { Color, Square } from './types';
import { get1Dposition, get2Dposition, getSquareBg } from './utils';
import { getCoordinates } from '@/shared/utils/getCoordinates';
import { NgStyle, NgClass } from '@angular/common';

@Component({
  selector: 'chess',
  templateUrl: './chess.component.html',
  styleUrl: './chess.component.css',
  imports: [LucideAngularModule, CdkDrag, NgStyle, NgClass],
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

  // css classes
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

  public getContainerClasses(square: Square) {
    const isFigure = this.isFigure(square.figure);
    return {
      take_chess_cell: square.canMove && isFigure,
      allowed_chess_cell: square.canMove && !isFigure
    };
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
    const goalIndex = get1Dposition([y, x]) ?? -1;
    if (!this.chessService.board()[goalIndex]?.canMove) return;
    this.chessService.moveFigure(this.currentFigure, goalIndex);
    this.chessService.updateSquares([]);
  }

  onPieceChoose(piece: Square) {
    if (!piece.isPlayer) return;
    this.currentFigure = piece.figure;
    const allowedSquares = piece.figure!.getAllowedSquares(
      this.chessService.board(),
    );
    this.chessService.updateSquares(allowedSquares);
  }

  onMove(piece: Square, index: number) {
    if (!piece.canMove || !this.currentFigure) return;
    this.chessService.moveFigure(this.currentFigure, index);
    this.chessService.updateSquares([]);
  }
}
