import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LucideAngularModule, Flag } from 'lucide-angular';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { ChessService } from '../../service/chess.service';
import { Figure, Square } from '../../classes/figure';
import { Color } from '../../types';
import { get1Dposition, get2Dposition, getSquareBg } from '../../utils';
import { getCoordinates } from '@/shared/utils/getCoordinates';
import { CommonModule } from '@angular/common';
import { King, Pawn } from '../../classes/pieces';
import { AudioService } from '@/shared/services/audio.service';

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  imports: [LucideAngularModule, CdkDrag, CommonModule],
})
export class Game implements OnInit {
  // icons
  readonly FlagIcon = Flag;

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
    public audio: AudioService,
  ) {
    chessService.playerPicesColor =
      Math.round(Math.random()) === 0 ? Color.WHITE : Color.BLACK;
  }

  ngOnInit(): void {
    this.audio.connect('move', '/audio/chess/move-self.mp3');
    this.audio.connect('capture', '/audio/chess/capture.mp3');
    this.audio.connect('check', '/audio/chess/move-check.mp3');
    this.audio.connect('castle', '/audio/chess/castle.mp3');
    this.audio.connect('gameEnd', '/audio/chess/game-end.webm');
    this.audio.connect('promote', '/audio/chess/promote.mp3');
  }

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

    this.chessService.moveFigure(this.currentFigure, newIndex);
    this.chessService.updateSquares([]);

    this.chessService.check(this.chessService.moveTurn());
    this.chessService.checkDraw();
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
      this.chessService.pawnPromotionIndex() !== null
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
        this.chessService.checkKingSavety(
          allowedSquares,
          this.lastMove[1] ?? -1,
        ),
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
}
