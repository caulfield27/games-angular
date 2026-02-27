import { signal } from '@angular/core';
import { PIECE_IMAGE_PATH } from '../constants';
import {
  Color,
  Piece,
  MoveDirection,
  Forbidden,
  History,
  GameType,
} from '../types';
import { get1Dposition, get2Dposition } from '../utils';

export interface Square {
  figure: Figure | null;
  canMove: boolean;
  isPlayer: boolean;
}

export class Figure {
  public position;
  public piece: Piece;
  public image: string;
  public color: Color;
  public isMoved: boolean;
  public isPlayer: boolean;
  public gameType: GameType;
  constructor(
    piece: Piece,
    color: Color,
    position: [number, number],
    isPlayer: boolean,
    gageType: GameType,
  ) {
    this.position = signal<[number, number]>(position);
    this.color = color;
    this.piece = piece;
    this.image = PIECE_IMAGE_PATH[piece + color];
    this.isMoved = false;
    this.isPlayer = isPlayer;
    this.gameType = gageType;
  }

  public move(index: number) {
    if (!this.isMoved) this.isMoved = true;
    this.position.set(get2Dposition(index)!);
  }

  public getAllowedSquares(
    _: Square[],
    __?: History[],
    ___?: boolean,
  ): number[] {
    return [];
  }

  public isSave(board: Square[], path: number[]) {
    path.push(get1Dposition(this.position())!);
    return !board.some((square) => {
      if (
        square.figure instanceof Figure &&
        square.figure.color !== this.color
      ) {
        const protectedSquares = square.figure.getAllowedSquares(board);
        return path.some((p) => protectedSquares.includes(p));
      }
      return false;
    });
  }

  protected forbiddenMoves(board: Square[]): Forbidden {
    let myKing;
    const bishops = [];
    const queens = [];
    const rooks = [];
    for (let i = 0; i < board.length; i++) {
      const figure = board[i].figure;
      if (!(figure instanceof Figure)) continue;
      if (figure.piece === Piece.KING && figure.color === this.color)
        myKing = figure;
      if (figure.piece === Piece.QUEEN && figure.color !== this.color)
        queens.push(figure);
      if (figure.piece === Piece.BISHOP && figure.color !== this.color)
        bishops.push(figure);
      if (figure.piece === Piece.ROOK && figure.color !== this.color)
        rooks.push(figure);
    }

    if (!myKing) return [];

    const forbidden: MoveDirection[] = [];
    const [kingY, kingX] = myKing.position();
    const [y, x] = this.position();

    if (
      kingX === x &&
      (rooks.some((rook) => rook.position()[1] === x) ||
        queens.some((rook) => rook.position()[1] === x))
    ) {
      return ['downleft', 'downright', 'upleft', 'upright', 'left', 'right'];
    }

    if (
      kingY === y &&
      (rooks.some((rook) => rook.position()[0] === y) ||
        queens.some((rook) => rook.position()[0] === y))
    ) {
      return ['downleft', 'downright', 'upleft', 'upright', 'down', 'up'];
    }

    // if (
    //   kingX + kingY === x + y &&
    //   bishops.some((b) => b.position()[1] + b.position()[0] === x + y)
    // ) {
    //   return ['down', 'up', 'upleft', 'downright', 'left', 'right'];
    // }

    // const delta3 = Math.abs(kingY - y);
    // const delta4 = Math.abs(kingX - x);

    // if (
    //   bishops.some(
    //     (b) =>
    //       Math.abs(b.position()[0] - kingY) ===
    //       Math.abs(b.position()[1] - kingX),
    //   ) &&
    //   delta3 === delta4
    // ) {
    //   return ['down', 'up', 'upright', 'downleft', 'left', 'right'];
    // }

    return forbidden;
  }
}
