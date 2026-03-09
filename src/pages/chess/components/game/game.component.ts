import { Component, ElementRef, ViewChild } from '@angular/core';
import { LucideAngularModule, Flag, User } from 'lucide-angular';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { ChessService } from '../../service/chess.service';
import { Figure, Square } from '../../classes/figure';
import { SoundType } from '../../types';
import { get1Dposition, get2Dposition, getSquareBg } from '../../utils';
import { getCoordinates } from '@/shared/utils/getCoordinates';
import { CommonModule } from '@angular/common';
import { King, Pawn } from '../../classes/pieces';
import { WaitingOpponent } from './_components';
import { WebsocketService } from '../../service/ws.service';

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  imports: [LucideAngularModule, CdkDrag, CommonModule, WaitingOpponent],
})
export class Game {
  // icons
  readonly FlagIcon = Flag;
  readonly UserIcon = User;

  // dom
  @ViewChild('board') board!: ElementRef<HTMLDivElement>;
  @ViewChild('cell') cell!: ElementRef<HTMLDivElement>;
  @ViewChild('promotionContainer')
  promotionContainer!: ElementRef<HTMLDivElement>;

  // states
  cellSize: number = 60;
  currentFigure: Figure | null = null;

  constructor(
    public chessService: ChessService,
    private ws: WebsocketService,
  ) {}

  ngAfterViewInit(): void {
    const width = this.cell.nativeElement.clientWidth;
    if (width) {
      const root = document.documentElement;
      root.style.setProperty('--chess-cell', width + 'px');
      this.cellSize = width;
    }
  }

  // getters
  get lastMove() {
    const history = this.chessService.history();
    const [fisrt, second] = history[history.length - 1]?.move ?? [];
    return [get1Dposition(fisrt ?? []), get1Dposition(second ?? [])];
  }

  // methods
  public promotionPosition(position: number | null) {
    if (position === null) return { display: 'none' };

    return {
      left:
        position < 8
          ? position * this.cellSize + 'px'
          : (position % 8) * this.cellSize + 'px',
      top: position < 8 ? 0 : 4 * this.cellSize + 'px',
      display: 'flex',
    };
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
    if (
      !this.chessService.board()[newIndex]?.canMove ||
      this.chessService.pawnPromotionIndex() !== null
    )
      return;
    this.handleMove(newIndex);
  }

  private handleMove(newIndex: number) {
    if (!this.currentFigure) return;
    if (this.currentFigure instanceof Pawn)
      this.chessService.checkPawnPromotion(newIndex);
    if (this.chessService.pawnPromotionIndex() !== null) return;

    const prevIdx = get1Dposition(this.currentFigure.position());
    const sound = this.chessService.moveFigure(this.currentFigure, newIndex);
    this.chessService.updateSquares([]);
    if (!sound) {
      this.currentFigure = null;
      return;
    }

    const isCheck = this.chessService.check();
    this.chessService.audio.play(isCheck ? SoundType.CHECK : sound);
    this.chessService.checkDraw();

    if (
      this.chessService.gameType() === 'friend' ||
      this.chessService.gameType() === 'online'
    ) {
      this.ws.send({
        type: 'move',
        data: {
          roomId: this.chessService.roomId,
          from: prevIdx,
          to: newIndex,
        },
      });
    }

    this.currentFigure = null;
  }

  public onPromotionChoose(piece: 'queen' | 'rook' | 'bishop' | 'knight') {
    if (this.currentFigure === null) return;
    this.chessService.handlePromotionChoose(piece, this.currentFigure);
    this.currentFigure = null;
  }

  public onPieceChoose(piece: Square) {
    if (
      !piece.isPlayer ||
      !piece.figure ||
      this.chessService.pawnPromotionIndex() !== null ||
      (piece.isPlayer &&
        this.chessService.moveTurn() !== this.chessService.player.color)
    )
      return;
    this.currentFigure = piece.figure;
    const board = this.chessService.board();
    const allowedSquares = piece.figure.getAllowedSquares(
      board,
      this.chessService.history(),
    );
    if (this.currentFigure instanceof King) {
      this.chessService.updateSquares(allowedSquares);
    } else {
      this.chessService.updateSquares(
        this.chessService.checkKingSavety(allowedSquares),
      );
    }
  }

  public onMove(piece: Square, index: number) {
    if (
      !piece.canMove ||
      !this.currentFigure ||
      this.chessService.pawnPromotionIndex() !== null
    )
      return;
    this.handleMove(index);
  }

  public isDragDisabled(figure: Figure) {
    if (this.chessService.gameType() === 'irl') return false;
    return !figure.isPlayer;
  }

  public onSelectionCancel() {
    this.ws.send({ type: 'cancel_selection' });
    this.chessService.isWaiting.set(false);
    this.chessService.gameType.set(null);
  }
}
