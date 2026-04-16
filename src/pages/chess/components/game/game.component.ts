import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  LucideAngularModule,
  Flag,
  User,
  ChessPawn,
  ChessBishop,
  ChessQueen,
  ChessKnight,
  ChessRook,
  Timer,
  Handshake,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from 'lucide-angular';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { ChessService } from '../../service/chess.service';
import { Figure, Square } from '../../classes/figure';
import { PromoteOption, SoundType } from '../../types';
import { get1Dposition, get2Dposition, getSquareBg } from '../../utils';
import { getCoordinates } from '@/shared/utils/getCoordinates';
import { CommonModule } from '@angular/common';
import { King, Pawn } from '../../classes/pieces';
import {
  WaitingOpponent,
  PromotionDialog,
  InvitationModal,
} from './_components';
import { WebsocketService } from '../../service/ws.service';
import { PIECE_IMAGE_PATH } from '../../constants';


@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  imports: [
    LucideAngularModule,
    CdkDrag,
    CommonModule,
    WaitingOpponent,
    PromotionDialog,
    InvitationModal
  ],
})
export class Game implements OnDestroy, OnInit {
  // icons
  readonly FlagIcon = Flag;
  readonly DrawIcon = Handshake;
  readonly UserIcon = User;
  readonly PawnIcon = ChessPawn;
  readonly KnightIcon = ChessKnight;
  readonly BishopIcon = ChessBishop;
  readonly QueenIcon = ChessQueen;
  readonly RookIcon = ChessRook;
  readonly PIECE_PATH = PIECE_IMAGE_PATH;
  readonly TimerIcon = Timer;
  readonly ExitIcon = LogOut;
  readonly LeftIcon = ChevronLeft;
  readonly RightIcon = ChevronRight

  // dom
  @ViewChild('board') board!: ElementRef<HTMLDivElement>;
  @ViewChild('cell') cell!: ElementRef<HTMLDivElement>;
  @ViewChild('promotionContainer')
  promotionContainer!: ElementRef<HTMLDivElement>;

  // states
  cellSize = signal<number>(60);
  boardH = signal<number>(50);
  currentFigure: Figure | null = null;
  beforeUnloadListener: (() => void) | null = null;

  constructor(
    public chessService: ChessService,
    private ws: WebsocketService,
  ) {}

  ngAfterViewInit(): void {
    const width = this.cell.nativeElement.clientWidth;
    const boardHeight = this.board.nativeElement.clientHeight;
    if (width) {
      const root = document.documentElement;
      root.style.setProperty('--chess-cell', width + 'px');
      this.boardH.update(prev => prev+boardHeight);
      this.cellSize.set(width);
    }
  }

  ngOnInit(): void {
    this.beforeUnloadListener = () => {
      this.ws.close(3000, this.chessService.roomId ?? '');
    };
    window.addEventListener('beforeunload', this.beforeUnloadListener);
  }

  ngOnDestroy(): void {
    this.chessService.reset();
    window.removeEventListener('beforeunload', this.beforeUnloadListener!);
  }

  // getters
  get lastMove() {
    const history = this.chessService.history();
    const [fisrt, second] = history[history.length - 1]?.move ?? [];
    return [get1Dposition(fisrt ?? []), get1Dposition(second ?? [])];
  }

  // methods
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
    if (!this.currentFigure || this.chessService.isGameFinished()) return;
    const { x, y } = getCoordinates(
      this.board.nativeElement,
      event.dropPoint,
      this.cellSize(),
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
    const moveType = this.chessService.moveFigure(
      this.currentFigure,
      newIndex,
      this.chessService.moveTurn() === this.chessService.player.color,
    );
    this.chessService.updateSquares([]);

    if (!moveType) {
      this.currentFigure = null;
      return;
    }

    const isCheck = this.chessService.check();
    this.chessService.audio.play(isCheck ? SoundType.CHECK : moveType);
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

  public onPromotionChoose(piece: PromoteOption) {
    if (this.currentFigure === null) return;
    const prevIdx = get1Dposition(this.currentFigure.position());
    const promoteIdx = this.chessService.pawnPromotionIndex();
    this.chessService.handlePromotionChoose(
      piece,
      this.currentFigure,
      promoteIdx,
    );
    if (
      (this.chessService.gameType() === 'online' ||
        this.chessService.gameType() === 'friend') &&
      promoteIdx !== null
    ) {
      this.ws.send({
        type: 'promote',
        data: {
          roomId: this.chessService.roomId,
          figure: piece,
          idx: prevIdx,
          promoteIdx,
        },
      });
    }
    this.currentFigure = null;
  }

  public onPieceChoose(piece: Square) {
    if (
      this.chessService.isGameFinished() ||
      !piece.isPlayer ||
      !piece.figure ||
      this.chessService.pawnPromotionIndex() !== null ||
      (this.chessService.gameType() !== 'irl' &&
        piece.isPlayer &&
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
      this.chessService.isGameFinished() ||
      !piece.canMove ||
      !this.currentFigure ||
      this.chessService.pawnPromotionIndex() !== null
    )
      return;
    this.handleMove(index);
  }

  public isDragDisabled(figure: Figure) {
    if (this.chessService.isGameFinished()) return true;
    if (this.chessService.gameType() === 'irl') return false;
    return !figure.isPlayer;
  }

  public onSelectionCancel() {
    this.ws.send({ type: 'cancel_selection' });
    this.chessService.isWaiting.set(false);
    this.chessService.gameType.set(null);
  }

  public onInvitationCancel() {
    this.ws.close(1000, this.chessService.invitation().link ?? '');
    this.chessService.reset();
  }
}
