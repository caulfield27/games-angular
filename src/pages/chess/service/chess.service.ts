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
  public moveTurn;
  constructor(private auth: AuthService) {
    this.player = new Player(this.playerPicesColor, auth.user());
    this.opponent = new Player(
      this.playerPicesColor === Color.WHITE ? Color.BLACK : Color.WHITE,
      null,
    );
    this.moveTurn = signal(Color.WHITE);
    this.board = signal<Square[]>(this.generateBoard());
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
        const checkedSquares = checkedFigure.figure.getAllowedSquares(board);
        const path = this.getFigurePath(fromIdx, checkIdx, checkedSquares);
        path.push(fromIdx);
        const arr = [];
        for (const index of path) {
          if (guardSquares.includes(index)) {
            arr.push(index);
          }
        };
        return arr;
      }
      return [];
    }
    return guardSquares;
  }

  public check(squares: number[], color: Color, targetFigure: Figure) {
    const board = this.board();
    for (let i = 0; i < board.length; i++) {
      const { figure } = board[i];
      if (
        figure instanceof King &&
        figure.color === color &&
        squares.includes(i)
      ) {
        const kingEscapeSquares = figure.getAllowedSquares(
          board,
          undefined,
          true,
        );
        const from = get1Dposition(targetFigure.position())!;
        const path = this.getFigurePath(from, i, squares);

        if (!kingEscapeSquares.length && targetFigure.isSave(board, path)) {
          this.mateIndex.set(i);
          setTimeout(() => {
            this.isGameEndModalOpen.set(true);
            this.gameEndData.set({
              state: GameEndState.PlayerWon,
              reason: GameEndReason.Checkmate,
            });
          }, 800);
        } else {
          this.checkIndex.set(i);
        }
        break;
      }
    }
  }

  public getFigurePath(fromIdx: number, toIndex: number, squares: number[]) {
    const directions = [1, -1, -8, 8, 9, 7, -9, -7];
    for (let i = 0; i < directions.length; i++) {
      const path = [];
      const start = squares.indexOf(fromIdx + directions[i]);
      if (start === -1) continue;
      for (let j = start; j < squares.length; j++) {
        if (squares[j] === toIndex) return path;
        if (squares[j] + directions[i] !== squares[j + 1]) break;
        path.push(squares[j]);
      }
    }

    return [];
  }

  private generateBoard(): Square[] {
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
    return figure instanceof King && (index === 58 || index === 62);
  }

  public moveFigure(figure: Figure, index: number) {
    if (this.checkIndex() !== null) {
      this.checkIndex.set(null);
    }
    const prevPosition = figure.position();
    const prevIndex = get1Dposition(figure.position())!;
    const updatedBoard = this.board();

    figure.move(index);

    if (this.isCastle(figure, index)) this.handleCastle(index, updatedBoard);

    // if (figure instanceof Pawn) {
    //   if (
    //     prevIndex - 8 !== index &&
    //     prevIndex - 16 !== index &&
    //     this.board()[index].figure === null
    //   ) {
    //     updatedBoard[index + 8] = {
    //       figure: null,
    //       isPlayer: false,
    //       canMove: false,
    //     };
    //   } else if (index < 8) {
    //   }
    // }

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
    this.updateTurn(updatedBoard);
  }

  private handleCastle(index: number, board: Square[]) {
    if (index === 62) {
      const rightRook = board[63];
      rightRook.figure?.move(index - 1);
      board[63] = {
        figure: null,
        isPlayer: false,
        canMove: false,
      };
      board[index - 1] = rightRook;
    } else {
      const leftRook = board[56];
      leftRook.figure?.move(index + 1);
      board[56] = {
        figure: null,
        isPlayer: false,
        canMove: false,
      };
      board[index + 1] = leftRook;
    }
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
  }
}
