import { Injectable, signal } from '@angular/core';
import { Color, GameType, Piece, Square, SquareColor } from '../types';
import { Figure } from '../classes/figure';
import { Player } from '../classes/player';
import { AuthService } from '@/shared/services/auth.service';
import { OPPONENT_PIECE, PLAYER_PIECE } from '../constants';
import { get1Dposition, get2Dposition } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class ChessService {
  public gameType = signal<GameType | null>('bot');
  public playerPicesColor: Color = Color.WHITE;
  public board;
  public player;
  public opponent;
  constructor(private auth: AuthService) {
    this.player = new Player(this.playerPicesColor, auth.user());
    this.opponent = new Player(
      this.playerPicesColor === Color.WHITE ? Color.BLACK : Color.WHITE,
      null,
    );
    this.board = signal<Square[]>(this.generateBoard());
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
        square.figure = new Figure(
          piece,
          this.player.color,
          get2Dposition(idx)!,
        );
      } else if (idx < 16) {
        const piece =
          idx > 7 ? Piece.PAWN : (OPPONENT_PIECE[idx] ?? Piece.PAWN);
        square.figure = new Figure(
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

  isCheck(color: Color){
  }

  private isCastle(figure: Figure, index: number) {
    return figure.piece === Piece.KING && (index === 58 || index === 62);
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
}
