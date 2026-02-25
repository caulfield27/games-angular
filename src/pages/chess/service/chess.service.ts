import { Injectable, signal } from '@angular/core';
import { Color, GameType, Piece } from '../types';
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
  public history: History[] = [];
  public gameType = signal<GameType | null>('bot');
  public playerPicesColor: Color = Color.WHITE;
  public board;
  public player;
  public opponent;
  public checkIndex = signal<null | number>(null);
  public isGameEndModalOpen = signal<boolean>(false);
  public gameEndData = signal<GameEndData>({
    state: GameEndState.Draw,
    reason: GameEndReason.Stalemate,
  });
  constructor(private auth: AuthService) {
    this.player = new Player(this.playerPicesColor, auth.user());
    this.opponent = new Player(
      this.playerPicesColor === Color.WHITE ? Color.BLACK : Color.WHITE,
      null,
    );
    this.board = signal<Square[]>(this.generateBoard());
  }

  private getFigure(piece: Piece, color: Color, position: [number, number]) {
    switch (piece) {
      case Piece.BISHOP:
        return new Bishop(color, position);
      case Piece.KING:
        return new King(color, position);
      case Piece.QUEEN:
        return new Queen(color, position);
      case Piece.KNIGHT:
        return new Knight(color, position);
      case Piece.PAWN:
        return new Pawn(color, position);
      case Piece.ROOK:
        return new Rook(color, position);
      default:
        return new Figure(piece, color, position);
    }
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
        const kingEscapeSquares = figure.getAllowedSquares(board);
        if (!kingEscapeSquares.length && targetFigure.isSave(board)) {
          this.isGameEndModalOpen.set(true);
          this.gameEndData.set({
            state: GameEndState.PlayerWon,
            reason: GameEndReason.Checkmate,
          });
        } else {
          this.checkIndex.set(i);
        }
        break;
      }
    }
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
    const prevIndex = get1Dposition(figure.position())!;
    const updatedBoard = this.board();

    figure.move(index);

    if (this.isCastle(figure, index)) {
      if (index === 62) {
        const rightRook = updatedBoard[63];
        rightRook.figure?.move(index - 1);
        updatedBoard[63] = {
          figure: null,
          isPlayer: false,
          canMove: false,
        };
        updatedBoard[index - 1] = rightRook;
      } else {
        const leftRook = updatedBoard[56];
        leftRook.figure?.move(index + 1);
        updatedBoard[56] = {
          figure: null,
          isPlayer: false,
          canMove: false,
        };
        updatedBoard[index + 1] = leftRook;
      }
    }

    const prevSquare = updatedBoard[prevIndex];
    updatedBoard[prevIndex] = {
      figure: null,
      isPlayer: false,
      canMove: false,
    };
    updatedBoard[index] = prevSquare;
    this.board.set(updatedBoard);
  }

  public reset() {
    this.board.set(this.generateBoard());
    this.isGameEndModalOpen.set(false);
    this.gameEndData.set({
      state: GameEndState.Draw,
      reason: GameEndReason.Stalemate,
    });
  }
}
