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
  isPlayer: boolean
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

  public getPath(toIdx: number, board: Square[]) {
    const squares = this.getAllowedSquares(board);
    const fromIdx = get1Dposition(this.position())!;
    const directions = [1, -1, -8, 8, 9, 7, -9, -7];
    for (let i = 0; i < directions.length; i++) {
      const path = [];
      const start = squares.indexOf(fromIdx + directions[i]);
      if (start === -1) continue;
      for (let j = start; j < squares.length; j++) {
        if (squares[j] === toIdx) return path;
        if (squares[j] + directions[i] !== squares[j + 1]) break;
        path.push(squares[j]);
      }
    }

    return [];
  }

  private saveToMove(
    board: Square[],
    direction: MoveDirection,
    targetPosition: [number, number],
    guardPosition: number,
    kingPosition: number,
  ): boolean {
    let [y, x] = targetPosition;
    if (
      direction === 'down' ||
      direction === 'up' ||
      direction === 'left' ||
      direction === 'right'
    ) {
      const dir = direction === 'down' || direction === 'left' ? -1 : 1;
      if (direction === 'down' || direction === 'up') {
        y += dir;
      } else {
        x += dir;
      }
      let index = get1Dposition([y, x]) ?? 99;
      while (index !== kingPosition) {
        if (board[index]?.figure instanceof Figure && index !== guardPosition) {
          return true;
        }

        if (direction === 'down' || direction === 'up') {
          y += dir;
        } else {
          x += dir;
        }
        index = get1Dposition([y, x]) ?? 99;
      }
    } else if (direction === 'upleft' || direction === 'downright') {
      const dir = direction === 'upleft' ? -1 : 1;
      y += dir;
      x += dir;

      let index = get1Dposition([y, x]) ?? 99;
      while (index !== kingPosition) {
        if (board[index]?.figure instanceof Figure && index !== guardPosition) {
          return true;
        }
        y += dir;
        x += dir;
        index = get1Dposition([y, x]) ?? 99;
      }
    } else if (direction === 'downleft' || direction === 'upright') {
      if (direction === 'downleft') {
        y++;
        x--;
      } else {
        y--;
        x++;
      }
      let index = get1Dposition([y, x]) ?? 99;
      while (index !== kingPosition) {
        if (board[index]?.figure instanceof Figure && index !== guardPosition) {
          return true;
        }
        if (direction === 'downleft') {
          y++;
          x--;
        } else {
          y--;
          x++;
        }
        index = get1Dposition([y, x]) ?? 99;
      }
    }
    return false;
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
    const kingIndex = get1Dposition(myKing.position())!;
    const curFigureIndex = get1Dposition(this.position())!;
    const [y, x] = this.position();

    if (kingX === x) {
      const rook = rooks.find((r) => r.position()[1] === x);
      if (rook) {
        const isUp = rook.position()[0] < kingY;
        if (
          !this.saveToMove(
            board,
            isUp ? 'up' : 'down',
            rook.position(),
            curFigureIndex,
            kingIndex,
          )
        ) {
          return [
            'downleft',
            'downright',
            'upleft',
            'upright',
            'left',
            'right',
          ];
        }
      }
      const queen = queens.find((q) => q.position()[1] === x);
      if (queen) {
        const isUp = queen.position()[0] < kingY;
        if (
          !this.saveToMove(
            board,
            isUp ? 'up' : 'down',
            queen.position(),
            curFigureIndex,
            kingIndex,
          )
        ) {
          return [
            'downleft',
            'downright',
            'upleft',
            'upright',
            'left',
            'right',
          ];
        }
      }
    }

    if (kingY === y) {
      const rook = rooks.find((r) => r.position()[0] === y);
      if (rook) {
        const isLeft = rook.position()[1] > kingX;
        if (
          !this.saveToMove(
            board,
            isLeft ? 'left' : 'right',
            rook.position(),
            curFigureIndex,
            kingIndex,
          )
        ) {
          return ['downleft', 'downright', 'upleft', 'upright', 'down', 'up'];
        }
      }
      const queen = queens.find((q) => q.position()[0] === y);
      if (queen) {
        const isLeft = queen.position()[1] > kingX;
        if (
          !this.saveToMove(
            board,
            isLeft ? 'left' : 'right',
            queen.position(),
            curFigureIndex,
            kingIndex,
          )
        ) {
          return ['downleft', 'downright', 'upleft', 'upright', 'down', 'up'];
        }
      }
    }

    const mainDiagonalDelta = kingX + kingY;
    const secondDiagonalDelta = kingX - kingY;
    if (mainDiagonalDelta === x + y) {
      if (
        bishops.some((b) => {
          const pos = b.position();
          return (
            pos[0] + pos[1] === mainDiagonalDelta &&
            !this.saveToMove(
              board,
              kingY < b.position()[0] ? 'upright' : 'downleft',
              b.position(),
              curFigureIndex,
              kingIndex,
            )
          );
        })
      ) {
        return ['up', 'down', 'downright', 'upleft', 'left', 'right'];
      }

      if (
        queens.some((q) => {
          const pos = q.position();
          return (
            pos[0] + pos[1] === mainDiagonalDelta &&
            !this.saveToMove(
              board,
              kingY < q.position()[0] ? 'upright' : 'downleft',
              q.position(),
              curFigureIndex,
              kingIndex,
            )
          );
        })
      ) {
        return ['up', 'down', 'downright', 'upleft', 'left', 'right'];
      }
    }

    if (secondDiagonalDelta === x - y) {
      if (
        bishops.some((b) => {
          const pos = b.position();
          return (
            pos[1] - pos[0] === secondDiagonalDelta &&
            !this.saveToMove(
              board,
              kingY < b.position()[0] ? 'upleft' : 'downright',
              b.position(),
              curFigureIndex,
              kingIndex,
            )
          );
        })
      ) {
        return ['up', 'down', 'upright', 'downleft', 'left', 'right'];
      }

      if (
        queens.some((q) => {
          const pos = q.position();
          return (
            pos[1] - pos[0] === secondDiagonalDelta &&
            !this.saveToMove(
              board,
              kingY < q.position()[0] ? 'upleft' : 'downright',
              q.position(),
              curFigureIndex,
              kingIndex,
            )
          );
        })
      ) {
        return ['up', 'down', 'upright', 'downleft', 'left', 'right'];
      }
    }
    return forbidden;
  }
}
