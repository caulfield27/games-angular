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

  public moveFigure(figure: Figure, index: number) {
    const prevIndex = get1Dposition(figure.position())!;
    figure.move(index);
    const updatedBoard = this.board();
    [updatedBoard[prevIndex], updatedBoard[index]] = [
      updatedBoard[index],
      updatedBoard[prevIndex],
    ];
    this.board.set(updatedBoard);
  }
}
