import {
  Component,
  effect,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
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
import { PromoteOption } from '../../types';
import { get1Dposition, get2Dposition } from '../../utils';
import { getCoordinates } from '@/shared/utils/getCoordinates';
import { CommonModule } from '@angular/common';
import { King, Pawn } from '../../classes/pieces';
import {
  WaitingOpponent,
  PromotionDialog,
  InvitationModal,
} from './_components';
import { WebsocketService } from '../../service/ws.service';
import {
  normalLabels,
  PIECE_IMAGE_PATH,
  reversedLabels,
} from '../../constants';
import { StockfishService } from '../../service/stockfish.service';

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
    InvitationModal,
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
  readonly RightIcon = ChevronRight;

  // dom
  @ViewChildren('moveListMobile') moveListMobile!: QueryList<ElementRef>;
  @ViewChildren('moveListDesktop') moveListDesktop!: QueryList<ElementRef>;
  @ViewChild('board') board!: ElementRef<HTMLDivElement>;
  @ViewChild('cell') cell!: ElementRef<HTMLDivElement>;
  @ViewChild('promotionContainer')
  promotionContainer!: ElementRef<HTMLDivElement>;

  // states
  cellSize = signal<number>(60);
  boardH = signal<number>(175);
  currentFigure: Figure | null = null;
  beforeUnloadListener: (() => void) | null = null;

  constructor(
    public chessService: ChessService,
    private ws: WebsocketService,
    private stockfish: StockfishService,
  ) {
    effect(() => {
      const currentMove = chessService.currentMove();
      const elementsMobile = this.moveListMobile;
      const elementsDesktop = this.moveListDesktop;
      const elemMobile = elementsMobile?.get(currentMove[0])?.nativeElement as
        | HTMLDivElement
        | undefined;
      const elemDesktop = elementsDesktop?.get(currentMove[0])
        ?.nativeElement as HTMLDivElement | undefined;
      elemMobile?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
      elemDesktop?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    });
  }

  ngAfterViewInit(): void {
    const width = this.cell.nativeElement.clientWidth;
    const boardHeight = this.board.nativeElement.clientHeight;
    if (width) {
      const root = document.documentElement;
      root.style.setProperty('--chess-cell', width + 'px');
      this.boardH.update((prev) => boardHeight-prev);
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
  getSquareBg(i: number): string {
    return (i + Math.floor(i / 8)) % 2
      ? 'var(--board-black)'
      : 'var(--board-white)';
  }

  getLabelColor(i: number) {
    return (i + Math.floor(i / 8)) % 2
      ? 'var(--board-white)'
      : 'var(--board-black)';
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
    if (this.chessService.pawnPromotionIndex() !== null){
      return;
    } 
      

    const prevIdx = get1Dposition(this.currentFigure.position());
    const moveType = this.chessService.moveFigure(
      this.currentFigure,
      newIndex,
      this.chessService.moveTurn() === this.chessService.player.color,
    );

    if (!moveType) {
      this.currentFigure = null;
      return;
    }

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
    } else if (this.chessService.gameType() === 'bot') {
      const fen = this.chessService.getFEN();
      this.stockfish
        .bestMove(fen)
        .then((bestMove) => {
          if (bestMove) {
            this.chessService.handleBotMove(bestMove);
          }
        })
        .catch(console.error);
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
    if (this.chessService.inReview()) return;
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

  get isPrevDisabled() {
    if (!this.chessService.moves().length) return true;
    const currentMove = this.chessService.currentMove();
    return currentMove[0] === 0 && currentMove[1] < 1;
  }

  get isNextDisabled() {
    const moves = this.chessService.moves();
    const currentMove = this.chessService.currentMove();
    if (!moves.length) return true;
    return (
      currentMove[0] === moves.length - 1 &&
      currentMove[1] === moves[moves.length - 1].length - 1
    );
  }

  public prevMove() {
    const currentMove = this.chessService.currentMove();
    let prevMove: [number, number] = [0, 0];
    if (currentMove[1] === 2) {
      prevMove = [currentMove[0], 1];
    } else if (currentMove[1] === 1 && currentMove[0] > 0) {
      prevMove = [currentMove[0] - 1, 2];
    }
    this.updateBoard(prevMove);
  }

  public getLabel(index: number): {
    col: string | null;
    row: string | null;
  } {
    const labels =
      this.chessService.player.color === 'black'
        ? reversedLabels
        : normalLabels;
    return (
      labels[index] ?? {
        col: null,
        row: null,
      }
    );
  }

  public nextMove() {
    const currentMove = this.chessService.currentMove();
    let nextMove: [number, number] = [0, 0];

    if (currentMove[1] === 2) {
      nextMove = [currentMove[0] + 1, 1];
    } else if (!currentMove[0] && !currentMove[1]) {
      nextMove = [0, 1];
    } else {
      nextMove = [currentMove[0], 2];
    }

    this.updateBoard(nextMove);
  }

  private updateBoard(move: [number, number]) {
    this.chessService.updateSquares([]);
    this.chessService.currentMove.set(move);
    const moves = this.chessService.moves();
    const key = moves[move[0]][0] + moves[move[0]][move[1]];
    const savedPositions = this.chessService.movesHash[key];
    if (savedPositions) {
      const {
        board,
        checkIndex,
        mateIndex,
        playerAdvantage,
        playerTakenPieces,
        opponentAdvantage,
        opponentTakenPieces,
      } = savedPositions;
      const updatedBoard: Square[] = [];
      board.forEach((pos) => {
        if (pos.figure instanceof Figure) {
          pos.figure.position.set(pos.position!);
        }
        updatedBoard.push({
          figure: pos.figure,
          canMove: pos.canMove,
          isPlayer: pos.isPlayer,
        });
      });
      this.chessService.checkIndex.set(checkIndex);
      this.chessService.mateIndex.set(mateIndex);
      this.chessService.player.advantage.set(playerAdvantage);
      this.chessService.player.takenPieces.set(playerTakenPieces);
      this.chessService.opponent.advantage.set(opponentAdvantage);
      this.chessService.opponent.takenPieces.set(opponentTakenPieces);
      this.chessService.board.set(updatedBoard);
    } else {
      this.chessService.board.set(this.chessService.generateBoard());
      this.chessService.player.advantage.set(0);
      this.chessService.player.takenPieces.set([]);
      this.chessService.opponent.advantage.set(0);
      this.chessService.opponent.takenPieces.set([]);
    }

    const last = moves.length - 1;
    if (moves[last][0] + moves[last][moves[last].length - 1] === key) {
      this.chessService.inReview.set(false);
    } else {
      this.chessService.inReview.set(true);
    }
  }
}
