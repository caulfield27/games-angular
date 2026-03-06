import { Injectable, signal } from '@angular/core';
import { Color, GameType, History, Piece } from '../types';
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

@Injectable({
  providedIn: 'root',
})
export class ChessService {
  public history = signal<History[]>([]);
  public gameType = signal<GameType | null>(null);
  public playerPicesColor: Color = Color.WHITE;
  public board;
  public player;
  public opponent;
  public checkIndex = signal<null | number>(null);
  public mateIndex = signal<null | number>(null);
  public isGameEndModalOpen = signal<boolean>(false);
  public gameEndData = signal<GameEndData>({
    state: GameEndState.Draw,
    reason: GameEndReason.Stalemate,
  });
  public pawnPromotionIndex = signal<number | null>(null);
  public moveTurn;
  private historyHash: Record<string, number> = {};
  constructor(private auth: AuthService) {
    this.player = new Player(this.playerPicesColor, auth.user());
    this.opponent = new Player(
      this.playerPicesColor === Color.WHITE ? Color.BLACK : Color.WHITE,
      null,
    );
    this.moveTurn = signal(Color.WHITE);
    this.board = signal<Square[]>([]);
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

  public checkKingSavety(guardSquares: number[], fromIdx: number) {
    const checkIdx = this.checkIndex();
    if (checkIdx !== null) {
      const board = this.board();
      const checkedFigure = board[fromIdx ?? -1];
      if (checkedFigure.figure instanceof Figure) {
        const path = checkedFigure.figure.getPath(checkIdx, board);
        path.push(fromIdx);
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

  public check(color: Color, type: 'move' | 'promotion' = 'move') {
    const board = this.board();
    const king = board.find(
      (s) => s.figure instanceof King && s.figure.color === color,
    );
    if (!king) return;
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
            this.mateIndex.set(kingIdx);
            setTimeout(() => {
              this.isGameEndModalOpen.set(true);
              this.gameEndData.set({
                state: GameEndState.PlayerWon,
                reason: GameEndReason.Checkmate,
              });
            }, 800);
          } else {
            this.checkIndex.set(kingIdx);
          }
        }
      });
  }

  public generateBoard(): Square[] {
    return new Array(64).fill(null).map((square, idx) => {
      square = {
        figure: null,
        isPlayer: false,
        canMove: false,
      };
      if (idx > 47) {
        square.isPlayer = true;
        const piece = idx < 56 ? Piece.PAWN : (PLAYER_PIECE[idx] ?? Piece.PAWN);
        square.figure = this.getFigure(
          piece,
          this.player.color,
          get2Dposition(idx)!,
        );
      } else if (idx < 16) {
        const piece =
          idx > 7 ? Piece.PAWN : (OPPONENT_PIECE[idx] ?? Piece.PAWN);
        square.figure = this.getFigure(
          piece,
          this.opponent.color,
          get2Dposition(idx)!,
        );
      }
      return square;
    });
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

  public moveFigure(figure: Figure, index: number) {
    if (this.checkIndex() !== null) {
      this.checkIndex.set(null);
    }
    const prevPosition = figure.position();
    const prevIndex = get1Dposition(figure.position())!;
    const updatedBoard = this.board();

    if (this.isCastle(figure, index))
      this.handleCastle(index, updatedBoard, figure);

    figure.move(index);

    if (figure instanceof Pawn)
      this.handleOnPasson(index, prevIndex, updatedBoard);

    const prevSquare = updatedBoard[prevIndex];
    updatedBoard[prevIndex] = {
      figure: null,
      isPlayer: false,
      canMove: false,
    };
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
  }

  public handlePromotionChoose(
    newPiece: 'queen' | 'rook' | 'bishop' | 'knight',
    figure: Figure,
  ) {
    const index = this.pawnPromotionIndex();
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
    this.check(this.moveTurn());
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
  }
}
