import { Signal, signal } from '@angular/core';
import { PIECE_IMAGE_PATH } from '../constants';
import { Color, Piece, Square } from '../types';
import { get1Dposition, get2Dposition } from '../utils';

export class Figure {
  public piece: Piece;
  public position;
  public image: string;
  public color: Color;
  constructor(piece: Piece, color: Color, position: [number, number]) {
    this.piece = piece;
    this.position = signal<[number, number]>(position);
    this.image = PIECE_IMAGE_PATH[piece + color];
    this.color = color;
  }

  public move(index: number) {
    this.position.set(get2Dposition(index)!);
  }

  private isDefendingKing(board: Square[]): boolean {
    const king = board.find((square) => square.figure?.piece === Piece.KING);
    if (!king) return false;
    const [kingY, kingX] = king.figure!.position();
    const [y, x] = this.position();

    const up1 = [y - 1, x];
    const up2 = [y - 1, x - 1];
    const up3 = [y - 1, x + 1];
    const down1 = [y + 1, x];
    const down2 = [y + 1, x - 1];
    const down3 = [y + 1, x + 1];
    const left = [y, x - 1];
    const right = [y, x + 1];

    return true;
  }

  private getBishopFields(
    dir: 'leftup' | 'leftdown' | 'rightup' | 'rightdown',
    board: Square[],
  ) {
    const [y, x] = this.position();

    const arr: number[] = [];
    let startX = dir === 'leftdown' || dir === 'leftup' ? x - 1 : x + 1;
    let startY = dir === 'leftdown' || dir === 'rightdown' ? y + 1 : y - 1;
    while (board[get1Dposition([startY, startX]) ?? -1]?.figure === null) {
      arr.push(get1Dposition([startY, startX])!);
      if (dir === 'leftup' || dir === 'leftdown') {
        startX--;
      } else {
        startX++;
      }

      if (dir === 'leftdown' || dir === 'rightdown') {
        startY++;
      } else {
        startY--;
      }
    }

    const lastFigure = board[get1Dposition([startY, startX]) ?? -1]?.figure;
    if (lastFigure instanceof Figure && lastFigure.color !== this.color) {
      arr.push(get1Dposition([startY, startX])!);
    }

    return arr;
  }

  public showAllowedSquares(board: Square[]) {
    const [y, x] = this.position();
    const allowedSquares: number[] = [];

    switch (this.piece) {
      case Piece.BISHOP:
        allowedSquares.push(...this.getBishopFields('leftup', board));
        allowedSquares.push(...this.getBishopFields('leftdown', board));
        allowedSquares.push(...this.getBishopFields('rightup', board));
        allowedSquares.push(...this.getBishopFields('rightdown', board));
        break;
      case Piece.KING:
        break;
      case Piece.KNIGHT:
        {
          const up1 = get1Dposition([y - 2, x - 1]) ?? -1;
          const up2 = get1Dposition([y - 1, x - 2]) ?? -1;
          const up3 = get1Dposition([y - 2, x + 1]) ?? -1;
          const up4 = get1Dposition([y - 1, x + 2]) ?? -1;
          const down1 = get1Dposition([y + 2, x - 1]) ?? -1;
          const down2 = get1Dposition([y + 1, x - 2]) ?? -1;
          const down3 = get1Dposition([y + 2, x + 1]) ?? -1;
          const down4 = get1Dposition([y + 1, x + 2]) ?? -1;

          const up1Figure = board[up1]?.figure;
          const up2Figure = board[up2]?.figure;
          const up3Figure = board[up3]?.figure;
          const up4Figure = board[up4]?.figure;
          const down1Figure = board[down1]?.figure;
          const down2Figure = board[down2]?.figure;
          const down3Figure = board[down3]?.figure;
          const down4Figure = board[down4]?.figure;

          if (
            up1Figure === null ||
            (up1Figure instanceof Figure && up1Figure.color !== this.color)
          ) {
            allowedSquares.push(up1);
          }

          if (
            up2Figure === null ||
            (up2Figure instanceof Figure && up2Figure.color !== this.color)
          ) {
            allowedSquares.push(up2);
          }

          if (
            up3Figure === null ||
            (up3Figure instanceof Figure && up3Figure.color !== this.color)
          ) {
            allowedSquares.push(up3);
          }

          if (
            up4Figure === null ||
            (up4Figure instanceof Figure && up4Figure.color !== this.color)
          ) {
            allowedSquares.push(up4);
          }

          if (
            down1Figure === null ||
            (down1Figure instanceof Figure && down1Figure.color !== this.color)
          ) {
            allowedSquares.push(down1);
          }

          if (
            down2Figure === null ||
            (down2Figure instanceof Figure && down2Figure.color !== this.color)
          ) {
            allowedSquares.push(down2);
          }

          if (
            down3Figure === null ||
            (down3Figure instanceof Figure && down3Figure.color !== this.color)
          ) {
            allowedSquares.push(down3);
          }

          if (
            down4Figure === null ||
            (down4Figure instanceof Figure && down4Figure.color !== this.color)
          ) {
            allowedSquares.push(down4);
          }
        }
        break;
      case Piece.PAWN:
        {
          const up1 = get1Dposition([y - 1, x]) ?? -1;
          const up2 = get1Dposition([y - 2, x]) ?? -1;
          const up3 = get1Dposition([y - 1, x - 1]) ?? -1;
          const up4 = get1Dposition([y - 1, x + 1]) ?? -1;

          const up1Figure = board[up1]?.figure;
          const up2Figure = board[up2]?.figure;
          const up3Figure = board[up3]?.figure;
          const up4Figure = board[up4]?.figure;
          if (up1Figure === null) {
            allowedSquares.push(up1);
          }
          if (y === 6 && up1Figure === null && up2Figure === null) {
            allowedSquares.push(up2);
          }
          if (up3Figure instanceof Figure && up3Figure.color !== this.color) {
            allowedSquares.push(up3);
          }
          if (up4Figure instanceof Figure && up4Figure.color !== this.color) {
            allowedSquares.push(up4);
          }
        }
        break;
      case Piece.QUEEN:
        break;
      case Piece.ROOK:
        break;
    }
    return allowedSquares;
  }
}
