import { signal } from '@angular/core';
import { PIECE_IMAGE_PATH } from '../constants';
import { Color, Piece, MoveDirection, Forbidden, History } from '../types';
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
  constructor(piece: Piece, color: Color, position: [number, number]) {
    this.position = signal<[number, number]>(position);
    this.color = color;
    this.piece = piece;
    this.image = PIECE_IMAGE_PATH[piece + color];
    this.isMoved = false;
  }

  public move(index: number) {
    if (!this.isMoved) this.isMoved = true;
    this.position.set(get2Dposition(index)!);
  }

  public getAllowedSquares(_: Square[], __?: History[]): number[] {
    return [];
  }

  public isSave(board: Square[]) {
    return !board.some(
      (square) =>
        square.figure instanceof Figure &&
        square.figure.color !== this.color &&
        square.figure
          .getAllowedSquares(board)
          .includes(get1Dposition(this.position())!),
    );
  }

  protected forbiddenMoves(board: Square[]): Forbidden {
    let myKing, opBishop, opQueen, opRook;
    for (let i = 0; i < board.length; i++) {
      const figure = board[i].figure;
      if (!(figure instanceof Figure)) continue;
      if (figure.piece === Piece.KING && figure.color === this.color)
        myKing = figure;
      if (figure.piece === Piece.QUEEN && figure.color !== this.color)
        opQueen = figure;
      if (figure.piece === Piece.BISHOP && figure.color !== this.color)
        opBishop = figure;
      if (figure.piece === Piece.ROOK && figure.color !== this.color)
        opRook = figure;
      if (myKing && opBishop && opQueen && opRook) break;
    }

    if (!myKing || !opBishop || !opQueen || !opRook) return [];

    const forbidden: MoveDirection[] = [];
    const [kingY, kingX] = myKing.position();
    const [y, x] = this.position();
    const [rookY, rookX] = opRook.position();
    const [bishopY, bishopX] = opBishop.position();
    const [queenY, queenX] = opQueen.position();

    if (kingX === x && (rookX === x || queenX === x)) {
      return ['downleft', 'downright', 'upleft', 'upright', 'left', 'right'];
    }

    if (kingY === y && (rookY === y || queenY === y)) {
      return ['downleft', 'downright', 'upleft', 'upright', 'down', 'up'];
    }

    if (kingX + kingY === x + y && bishopX + bishopY === x + y) {
      return ['down', 'up', 'upleft', 'downright', 'left', 'right'];
    }

    const delta1 = Math.abs(bishopY - kingY);
    const delta2 = Math.abs(bishopX - kingX);
    const delta3 = Math.abs(kingY - y);
    const delta4 = Math.abs(kingX - x);
    if (delta1 === delta2 && delta3 === delta4) {
      return ['down', 'up', 'upright', 'downleft', 'left', 'right'];
    }

    return forbidden;
  }
}
