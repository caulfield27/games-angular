import { Injectable, signal } from '@angular/core';
import {
  Color,
  GameFound,
  GameType,
  History,
  IInvitation,
  IMessageData,
  MessageType,
  MoveData,
  Piece,
  PromoteData,
  PromoteOption,
  SoundType,
} from '../types';
import { Figure, Square } from '../classes/figure';
import { Player } from '../classes/player';
import { AuthService } from '@/shared/services/auth.service';
import { OPPONENT_PIECE, PLAYER_PIECE } from '../constants';
import { get1Dposition, get2Dposition } from '../utils';
import { King, Bishop, Queen, Knight, Pawn, Rook } from '../classes/pieces';
import {
  GameEndData,
  GameEndReason,
  GameEndState,
} from '../components/endGameModal/endGameModal.component';
import { AudioService } from '@/shared/services/audio.service';

@Injectable({
  providedIn: 'root',
})
export class ChessService {
  public invitation = signal<IInvitation>({
    isModalOpen: false,
    link: null,
  });
  public roomId: string | null = null;
  public isWaiting = signal<boolean>(true);
  public history = signal<History[]>([]);
  public gameType = signal<GameType | null>(null);
  public board;
  public player: Player = new Player('black', '');
  public opponent: Player = new Player('white', '');
  public checkIndex = signal<null | number>(null);
  private checkedFigureIndex: number | null = null;
  public mateIndex = signal<null | number>(null);
  public isGameEndModalOpen = signal<boolean>(false);
  public gameEndData = signal<GameEndData>({
    state: GameEndState.Draw,
    reason: GameEndReason.Stalemate,
  });
  public pawnPromotionIndex = signal<number | null>(null);
  public moveTurn = signal(Color.BLACK);
  private historyHash: Record<string, number> = {};
  constructor(
    private auth: AuthService,
    public audio: AudioService,
  ) {
    this.board = signal<Square[]>([]);
    this.audio.connect(SoundType.MOVE, '/audio/chess/move-self.mp3');
    this.audio.connect(SoundType.CAPTURE, '/audio/chess/capture.mp3');
    this.audio.connect(SoundType.CHECK, '/audio/chess/move-check.mp3');
    this.audio.connect(SoundType.CASTLE, '/audio/chess/castle.mp3');
    this.audio.connect(SoundType.GAMEOVER, '/audio/chess/game-end.webm');
    this.audio.connect(SoundType.PROMOTE, '/audio/chess/promote.mp3');
  }

  public onMessage(event: MessageEvent<unknown>) {
    const parsedData = JSON.parse(event.data as string) as IMessageData;
    const { type } = parsedData;

    switch (type) {
      case MessageType.GAMESTART:
        {
          const data = parsedData.data as GameFound;
          this.player.color = data.color;
          this.player.name.set(data.name);
          this.roomId = data.roomId;
          this.opponent.color = data.color === 'white' ? 'black' : 'white';
          this.opponent.name.set(data.opponent);
          this.board.set(this.generateBoard());
          this.isWaiting.set(false);
          this.invitation.set({ isModalOpen: false, link: null });
        }
        break;
      case MessageType.MOVE: {
        const data = parsedData.data as MoveData;
        const fromC = get2Dposition(data.from)!;
        const toC = get2Dposition(data.to)!;
        const from = get1Dposition([7 - fromC[0], fromC[1]])!;
        const to = get1Dposition([7 - toC[0], toC[1]])!;
        const figure = this.board()[from].figure;
        
        const sound = this.moveFigure(figure!, to, false);
        if (!sound) return;
        const isCheck = this.check();
        this.audio.play(isCheck ? SoundType.CHECK : sound);
        this.checkDraw();
        break;
      }
      case MessageType.PROMOTE: {
        const data = parsedData.data as PromoteData;
        const [y, x] = get2Dposition(data.idx)!;
        const [promoteY, promoteX] = get2Dposition(data.promoteIdx)!;
        const realIndex = get1Dposition([7 - y, x])!;
        const figure = this.board()[realIndex].figure;
        if (figure === null) return;
        this.handlePromotionChoose(
          data.figure,
          figure,
          get1Dposition([7 - promoteY, promoteX]),
        );
        break;
      }
      case MessageType.OPPONENT_LEAVE:
        this.isGameEndModalOpen.set(true);
        this.gameEndData.set({
          state: GameEndState.PlayerWon,
          reason: GameEndReason.OpponentLeave,
        });
    }
  }

  private getFigure(piece: Piece, color: Color, position: [number, number]) {
    const type = this.gameType() ?? 'bot';
    switch (piece) {
      case Piece.BISHOP:
        return new Bishop(color, position, color === this.player.color, type);
      case Piece.KING:
        return new King(color, position, color === this.player.color, type);
      case Piece.QUEEN:
        return new Queen(color, position, color === this.player.color, type);
      case Piece.KNIGHT:
        return new Knight(color, position, color === this.player.color, type);
      case Piece.PAWN:
        return new Pawn(color, position, color === this.player.color, type);
      case Piece.ROOK:
        return new Rook(color, position, color === this.player.color, type);
      default:
        return new Figure(
          piece,
          color,
          position,
          color === this.player.color,
          type,
        );
    }
  }

  public checkKingSavety(guardSquares: number[]) {
    const checkIdx = this.checkIndex();
    if (checkIdx !== null && this.checkedFigureIndex !== null) {
      const board = this.board();
      const checkedFigure = board[this.checkedFigureIndex];
      if (checkedFigure.figure instanceof Figure) {
        const path = checkedFigure.figure.getPath(checkIdx, board);
        path.push(this.checkedFigureIndex);
        const arr = [];
        for (const index of path) {
          if (guardSquares.includes(index)) {
            arr.push(index);
          }
        }
        return arr;
      }
      return [];
    }
    return guardSquares;
  }

  public check(): boolean {
    const color = this.moveTurn();
    const board = this.board();
    const king = board.find(
      (s) => s.figure instanceof King && s.figure.color === color,
    );
    if (!king) return false;
    let isChek = false;
    const kingIdx = get1Dposition(king.figure!.position()) ?? -1;
    const kingEscapeSquares = king.figure!.getAllowedSquares(
      board,
      undefined,
      true,
    );

    board
      .filter(
        (s) =>
          s.figure instanceof Figure &&
          !(s.figure instanceof King) &&
          s.figure.color !== color,
      )
      .forEach((f) => {
        const squares = f.figure!.getAllowedSquares(board);
        if (squares.includes(kingIdx)) {
          const path = f.figure!.getPath(kingIdx, board);
          
          if (!kingEscapeSquares.length && f.figure!.isSave(board, path)) {
            const isWin = this.player.color !== color;
            this.mateIndex.set(kingIdx);
            setTimeout(() => {
              this.audio.play(SoundType.GAMEOVER);
              this.isGameEndModalOpen.set(true);
              this.gameEndData.set({
                state: isWin
                  ? GameEndState.PlayerWon
                  : GameEndState.OpponentWon,
                reason: GameEndReason.Checkmate,
              });
            }, 500);
          } else {
            this.checkIndex.set(kingIdx);
            this.checkedFigureIndex = get1Dposition(f.figure!.position());
          }
          isChek = true;
        }
      });
    return isChek;
  }

  // public generateBoard(): Square[] {
  //   return new Array(64).fill(null).map((square, idx) => {
  //     square = {
  //       figure: null,
  //       isPlayer: false,
  //       canMove: false,
  //     };
  //     if (idx > 47) {
  //       square.isPlayer = true;
  //       const piece = idx < 56 ? Piece.PAWN : (PLAYER_PIECE[idx] ?? Piece.PAWN);
  //       square.figure = this.getFigure(
  //         piece,
  //         this.player.color as Color,
  //         get2Dposition(idx)!,
  //       );
  //     } else if (idx < 16) {
  //       const piece =
  //         idx > 7 ? Piece.PAWN : (OPPONENT_PIECE[idx] ?? Piece.PAWN);
  //       square.figure = this.getFigure(
  //         piece,
  //         this.opponent.color as Color,
  //         get2Dposition(idx)!,
  //       );
  //     }
  //     return square;
  //   });
  // }

  public generateBoard(): Square[] {
    const board: Square[] = new Array(64).fill(null).map(() => ({
      figure: null,
      isPlayer: false,
      canMove: false,
    }));

    const setPiece = (idx: number, piece: Piece, color: Color) => {
      board[idx].figure = this.getFigure(piece, color, get2Dposition(idx)!);
      board[idx].isPlayer = color === this.player.color;
    };

    // WHITE
    setPiece(23, Piece.KING, Color.WHITE); // h6
    setPiece(48, Piece.QUEEN, Color.WHITE); // a2
    setPiece(16, Piece.PAWN, Color.WHITE); // a6
    setPiece(33, Piece.PAWN, Color.WHITE); // b4
    setPiece(22, Piece.PAWN, Color.WHITE); // g6
    setPiece(15, Piece.PAWN, Color.WHITE); // h7

    // BLACK
    setPiece(54, Piece.KING, Color.BLACK); // g2
    setPiece(38, Piece.QUEEN, Color.BLACK); // h4
    setPiece(12, Piece.ROOK, Color.BLACK); // e7
    setPiece(27, Piece.BISHOP, Color.BLACK); // d5
    setPiece(29, Piece.PAWN, Color.BLACK); // f5
    setPiece(53, Piece.PAWN, Color.BLACK); // f2
    setPiece(55, Piece.PAWN, Color.BLACK); // h2

    return board;
  }

  public updateSquares(squares: number[]) {
    this.board.update((prev) =>
      prev.map((s, idx) => ({ ...s, canMove: squares.includes(idx) })),
    );
  }

  private isCastle(figure: Figure, index: number) {
    if (!(figure instanceof King)) return false;
    if (figure.isMoved) return false;

    const board = this.board();
    const y = figure.position()[0];

    if (y === 7) {
      if (index === 58) {
        const leftRook = board[56].figure;
        if (leftRook instanceof Rook && !leftRook.isMoved) return true;
      } else if (index === 62) {
        const rightRook = board[63].figure;
        if (rightRook instanceof Rook && !rightRook.isMoved) return true;
      }
    } else if (y === 0) {
      if (index === 2) {
        const leftRook = board[0].figure;
        if (leftRook instanceof Rook && !leftRook.isMoved) return true;
      } else if (index === 6) {
        const rightRook = board[7].figure;
        if (rightRook instanceof Rook && !rightRook.isMoved) return true;
      }
    }
    return false;
  }

  public moveFigure(
    figure: Figure,
    index: number,
    isPlayer: boolean,
  ): SoundType | null {
    let sound = SoundType.MOVE;
    const isCastle = this.isCastle(figure, index);
    if (this.checkIndex() !== null) {
      if (isCastle) return null;
      this.checkIndex.set(null);
      this.checkedFigureIndex = null;
    }
    const prevPosition = figure.position();
    const prevIndex = get1Dposition(figure.position())!;
    const updatedBoard = this.board();

    if (isCastle) {
      sound = SoundType.CASTLE;
      this.handleCastle(index, updatedBoard, figure);
    }

    figure.move(index);

    if (figure instanceof Pawn)
      this.handleOnPasson(index, prevIndex, updatedBoard);

    const prevSquare = updatedBoard[prevIndex];
    updatedBoard[prevIndex] = {
      figure: null,
      isPlayer: false,
      canMove: false,
    };

    if (updatedBoard[index].figure instanceof Figure) {
      this.saveTakenPiece(updatedBoard[index].figure, isPlayer);
      sound = SoundType.CAPTURE;
    }

    updatedBoard[index] = prevSquare;
    this.history.update((prev) => [
      ...prev,
      { move: [prevPosition, figure.position()] },
    ]);
    const stringifiedBoard = JSON.stringify(
      updatedBoard
        .filter((s) => s.figure instanceof Figure)
        .map((f) => f.figure!.position()),
    );
    this.historyHash[stringifiedBoard] =
      (this.historyHash[stringifiedBoard] || 0) + 1;
    this.updateTurn(updatedBoard);
    return sound;
  }

  public saveTakenPiece(figure: Figure, isPlayer: boolean) {
    if (isPlayer) {
      this.player.insertTakenPiece(figure.piece, this.opponent);
    } else {
      this.opponent.insertTakenPiece(figure.piece, this.player);
    }
  }

  public handlePromotionChoose(
    newPiece: PromoteOption,
    figure: Figure,
    index: number | null,
  ) {
    this.audio.play(SoundType.PROMOTE);
    if (index === null) return;
    const updatedBoard = this.board();
    const prevIndex = get1Dposition(figure.position())!;
    const prevPosition = figure.position()!;
    let newFigure: Queen | Rook | Bishop | Knight;
    switch (newPiece) {
      case 'queen':
        newFigure = new Queen(
          figure.color,
          get2Dposition(index)!,
          figure.isPlayer,
          this.gameType() ?? 'irl',
        );
        break;
      case 'rook':
        newFigure = new Rook(
          figure.color,
          get2Dposition(index)!,
          figure.isPlayer,
          this.gameType() ?? 'irl',
        );
        break;
      case 'bishop':
        newFigure = new Bishop(
          figure.color,
          get2Dposition(index)!,
          figure.isPlayer,
          this.gameType() ?? 'irl',
        );
        break;
      case 'knight':
        newFigure = new Knight(
          figure.color,
          get2Dposition(index)!,
          figure.isPlayer,
          this.gameType() ?? 'irl',
        );
        break;
      default:
        newFigure = new Queen(
          figure.color,
          get2Dposition(index)!,
          figure.isPlayer,
          this.gameType() ?? 'irl',
        );
    }

    figure.move(index);

    const prevSquare = updatedBoard[prevIndex];
    updatedBoard[prevIndex] = {
      figure: null,
      isPlayer: false,
      canMove: false,
    };

    if (updatedBoard[index].figure instanceof Figure) {
      this.saveTakenPiece(
        updatedBoard[index].figure,
        this.moveTurn() === this.player.color,
      );
      this.audio.play(SoundType.CAPTURE);
    }

    updatedBoard[index] = { ...prevSquare, figure: newFigure };
    this.history.update((prev) => [
      ...prev,
      { move: [prevPosition, figure!.position()] },
    ]);
    const stringifiedBoard = JSON.stringify(
      updatedBoard
        .filter((s) => s.figure instanceof Figure)
        .map((f) => f.figure!.position()),
    );
    this.historyHash[stringifiedBoard] =
      (this.historyHash[stringifiedBoard] || 0) + 1;
    this.updateTurn(updatedBoard);
    this.updateSquares([]);
    this.check();
    this.pawnPromotionIndex.set(null);
    this.checkDraw();
  }

  public checkPawnPromotion(index: number) {
    if (index < 8 || (this.gameType() === 'irl' && index > 55)) {
      this.pawnPromotionIndex.set(index);
    }
  }

  public checkDraw() {
    const board = this.board();
    const currentFigures = board.filter(
      (s) => s.figure instanceof Figure && s.figure.color === this.moveTurn(),
    );
    if (
      !currentFigures.some((f) => f.figure!.getAllowedSquares(board).length)
    ) {
      this.isGameEndModalOpen.set(true);
      this.gameEndData.set({
        state: GameEndState.Draw,
        reason: GameEndReason.Stalemate,
      });
      return;
    }

    for (const key in this.historyHash) {
      if (this.historyHash[key] === 3) {
        this.isGameEndModalOpen.set(true);
        this.gameEndData.set({
          state: GameEndState.Draw,
          reason: GameEndReason.PositionRepeat,
        });
        return;
      }
    }
  }

  private handleOnPasson(index: number, prevIndex: number, board: Square[]) {
    if (this.board()[index].figure === null) {
      if (
        prevIndex > index &&
        prevIndex - 8 !== index &&
        prevIndex - 16 !== index
      ) {
        board[index + 8] = {
          figure: null,
          isPlayer: false,
          canMove: false,
        };
      }
      if (
        prevIndex < index &&
        prevIndex + 8 !== index &&
        prevIndex + 16 !== index
      ) {
        board[index - 8] = {
          figure: null,
          isPlayer: false,
          canMove: false,
        };
      }
    }
  }

  private handleCastle(index: number, board: Square[], figure: Figure) {
    const [y] = figure.position();
    const kingIndex = get1Dposition(figure.position())!;
    const isLeft = index < kingIndex;
    const dif = isLeft ? 1 : -1;
    let rookIndex;
    if (y === 0) {
      rookIndex = isLeft ? 0 : 7;
    } else {
      rookIndex = isLeft ? 56 : 63;
    }

    const rook = board[rookIndex];
    rook.figure?.move(index + dif);
    board[rookIndex] = {
      figure: null,
      isPlayer: false,
      canMove: false,
    };
    board[index + dif] = rook;
  }

  private updateTurn(updatedBoard: Square[]) {
    this.moveTurn.update((prev) =>
      prev === Color.WHITE ? Color.BLACK : Color.WHITE,
    );
    if (this.gameType() === 'irl') {
      this.board.set(
        updatedBoard.map((square) => {
          if (square.figure instanceof Figure) {
            square.figure.isPlayer = !square.figure.isPlayer;
            square.isPlayer = !square.isPlayer;
          }
          return square;
        }),
      );
    } else {
      this.board.set(updatedBoard);
    }
  }

  public reset() {
    this.board.set(this.generateBoard());
    this.isGameEndModalOpen.set(false);
    this.mateIndex.set(null);
    this.history.set([]);
    this.historyHash = {};
    this.gameType.set(null);
    this.roomId = null;
    this.isWaiting.set(false);
    this.moveTurn.set(Color.WHITE);
    this.player.takenPieces.set([]);
    this.player.advantage.set(0);
    this.opponent.takenPieces.set([]);
    this.opponent.advantage.set(0);
    this.invitation.set({ isModalOpen: false, link: null });
  }
}
