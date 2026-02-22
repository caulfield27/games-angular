import { EmbeddedViewRef, signal } from '@angular/core';
import { PIECE_IMAGE_PATH } from '../constants';
import { Color, Piece, Square, MoveDirection } from '../types';
import { get1Dposition, get2Dposition } from '../utils';

export class Figure {
  public piece: Piece;
  public position;
  public image: string;
  public color: Color;
  public isMoved: boolean;
  constructor(piece: Piece, color: Color, position: [number, number]) {
    this.piece = piece;
    this.position = signal<[number, number]>(position);
    this.image = PIECE_IMAGE_PATH[piece + color];
    this.color = color;
    this.isMoved = false;
  }

  public move(index: number) {
    if (!this.isMoved) this.isMoved = true;
    this.position.set(get2Dposition(index)!);
  }

  private kingForbiddenMoves(board: Square[]) {
    const forbidden: number[] = [];
    for (const square of board) {
      const figure = square.figure;
      if (figure instanceof Figure && figure.color !== this.color) {
        const opPosition = figure.position();
        switch (figure.piece) {
          case Piece.BISHOP:
            forbidden.push(
              ...this.getBishopFields(
                'leftdown',
                board,
                opPosition,
                figure.color,
              ),
              ...this.getBishopFields(
                'leftup',
                board,
                opPosition,
                figure.color,
              ),
              ...this.getBishopFields(
                'rightdown',
                board,
                opPosition,
                figure.color,
              ),
              ...this.getBishopFields(
                'rightup',
                board,
                opPosition,
                figure.color,
              ),
            );
            break;
          case Piece.KING:
            forbidden.push(
              ...this.getKingFields(board, opPosition, figure.color),
            );
            break;
          case Piece.KNIGHT:
            forbidden.push(
              ...this.getKnightFields(board, opPosition, figure.color),
            );
            break;
          case Piece.PAWN:
            const pawn = this.getPawnFields(
              [],
              board,
              opPosition,
              false,
              figure.color,
            );
            forbidden.push(...pawn.upleft, ...pawn.upright);
            break;
          case Piece.QUEEN:
            forbidden.push(
              ...this.getQueenFields([], board, opPosition, figure.color),
            );
            break;
          case Piece.ROOK:
            forbidden.push(
              ...this.getRookFields('down', board, opPosition, figure.color),
              ...this.getRookFields('left', board, opPosition, figure.color),
              ...this.getRookFields('right', board, opPosition, figure.color),
              ...this.getRookFields('up', board, opPosition, figure.color),
            );
            break;
        }
      }
    }

    return forbidden;
  }

  private guardsForbiddenMoves(board: Square[]): MoveDirection[] {
    let myKing, opBishop, opQueen, opRook;
    for (let i = 0; i < board.length; i++) {
      const figure = board[i].figure;
      if (figure?.piece === Piece.KING && figure.color === this.color)
        myKing = figure;
      if (figure?.piece === Piece.QUEEN && figure.color !== this.color)
        opQueen = figure;
      if (figure?.piece === Piece.BISHOP && figure.color !== this.color)
        opBishop = figure;
      if (figure?.piece === Piece.ROOK && figure.color !== this.color)
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

  private getBishopFields(
    dir: 'leftup' | 'leftdown' | 'rightup' | 'rightdown',
    board: Square[],
    position: [number, number],
    color: Color = this.color,
    isProtectionCheck: boolean = false,
  ) {
    const [y, x] = position;

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
    if (lastFigure instanceof Figure) {
      if (
        (isProtectionCheck && lastFigure.color === color) ||
        (!isProtectionCheck && lastFigure.color !== color)
      ) {
        arr.push(get1Dposition([startY, startX])!);
      }
    }

    return arr;
  }

  private getRookFields(
    move: 'left' | 'right' | 'down' | 'up',
    board: Square[],
    position: [number, number],
    color: Color = this.color,
    isProtectionCheck: boolean = false,
  ) {
    const [y, x] = position;
    let startX = move === 'left' ? x - 1 : move === 'right' ? x + 1 : x;
    let startY = move === 'down' ? y + 1 : move === 'up' ? y - 1 : y;

    const arr: number[] = [];

    while (board[get1Dposition([startY, startX]) ?? -1]?.figure === null) {
      arr.push(get1Dposition([startY, startX])!);

      if (move === 'left') {
        startX--;
      } else if (move === 'right') {
        startX++;
      } else if (move === 'down') {
        startY++;
      } else if (move === 'up') {
        startY--;
      }
    }

    const lastFigure = board[get1Dposition([startY, startX]) ?? -1]?.figure;
    if (lastFigure instanceof Figure) {
      if (
        (isProtectionCheck && lastFigure.color === color) ||
        (!isProtectionCheck && lastFigure.color !== color)
      ) {
        arr.push(get1Dposition([startY, startX])!);
      }
    }

    return arr;
  }

  private getQueenFields(
    forbidden: MoveDirection[],
    board: Square[],
    position: [number, number],
    color: Color = this.color,
    isProtectionCheck: boolean = false,
  ) {
    const arr: number[] = [];
    if (!forbidden.includes('left'))
      arr.push(
        ...this.getRookFields(
          'left',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    if (!forbidden.includes('right'))
      arr.push(
        ...this.getRookFields(
          'right',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    if (!forbidden.includes('down'))
      arr.push(
        ...this.getRookFields(
          'down',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    if (!forbidden.includes('up'))
      arr.push(
        ...this.getRookFields('up', board, position, color, isProtectionCheck),
      );
    if (!forbidden.includes('upleft'))
      arr.push(
        ...this.getBishopFields(
          'leftup',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    if (!forbidden.includes('downleft'))
      arr.push(
        ...this.getBishopFields(
          'leftdown',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    if (!forbidden.includes('upright'))
      arr.push(
        ...this.getBishopFields(
          'rightup',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    if (!forbidden.includes('downright'))
      arr.push(
        ...this.getBishopFields(
          'rightdown',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    return arr;
  }

  private getPawnFields(
    forbidden: MoveDirection[],
    board: Square[],
    position: [number, number],
    isPlayer: boolean = true,
    color: Color = this.color,
    isProtectionCheck: boolean = false,
  ) {
    const [y, x] = position;
    const hash: Record<'up' | 'upleft' | 'upright', number[]> = {
      up: [],
      upleft: [],
      upright: [],
    };

    if (!isPlayer) {
      const up3 = get1Dposition([y + 1, x + 1]) ?? -1;
      const up4 = get1Dposition([y + 1, x - 1]) ?? -1;
      const up3Figure = board[up3]?.figure;
      const up4Figure = board[up4]?.figure;

      if (up3Figure === null) hash.upleft.push(up3);
      if (up3Figure instanceof Figure) {
        if (isProtectionCheck && up3Figure.color === color) {
          hash['upleft'].push(up3);
        }
      }

      if (up4Figure === null) hash.upright.push(up4);
      if (up4Figure instanceof Figure) {
        if (isProtectionCheck && up4Figure.color === color) {
          hash['upright'].push(up4);
        }
      }
      return hash;
    }

    if (!forbidden.includes('up')) {
      const up1 = get1Dposition([y - 1, x]) ?? -1;
      const up2 = get1Dposition([y - 2, x]) ?? -1;
      const up1Figure = board[up1]?.figure;
      const up2Figure = board[up2]?.figure;
      if (up1Figure === null) {
        hash['up'].push(up1);
      }

      if (y === 6 && up1Figure === null && up2Figure === null) {
        hash['up'].push(up2);
      }
    }

    if (!forbidden.includes('upleft')) {
      const up3 = get1Dposition([y - 1, x - 1]) ?? -1;
      const up3Figure = board[up3]?.figure;
      if (up3Figure instanceof Figure && up3Figure.color !== color) {
        hash['upleft'].push(up3);
      }
    }

    if (!forbidden.includes('upright')) {
      const up4 = get1Dposition([y - 1, x + 1]) ?? -1;
      const up4Figure = board[up4]?.figure;
      if (up4Figure instanceof Figure && up4Figure.color !== color) {
        hash['upright'].push(up4);
      }
    }

    return hash;
  }

  private getKnightFields(
    board: Square[],
    position: [number, number],
    color: Color = this.color,
    isProtectionCheck: boolean = false,
  ) {
    const allowed: number[] = [];
    const [y, x] = position;
    const directions = [
      [-2, -1],
      [-1, -2],
      [-2, 1],
      [-1, 2],
      [2, -1],
      [1, -2],
      [2, 1],
      [1, 2],
    ];

    for (const [dy, dx] of directions) {
      const index = get1Dposition([y + dy, x + dx]);
      if (index === null) continue;
      const figure = board[index].figure;

      if (figure === null) allowed.push(index);
      if (figure instanceof Figure) {
        if (
          (isProtectionCheck && color === figure.color) ||
          (!isProtectionCheck && color !== figure.color)
        ) {
          allowed.push(index);
        }
      }
    }

    return allowed;
  }

  private getKingFields(
    board: Square[],
    position: [number, number],
    color: Color,
    isProtectionCheck: boolean = false,
  ) {
    const allowed: number[] = [];
    const directions: [number, number][] = [
      [-1, 0],
      [-1, -1],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, 0],
      [1, -1],
      [1, 1],
    ];

    for (const [dx, dy] of directions) {
      const newPos: [number, number] = [position[0] + dx, position[1] + dy];

      const index = get1Dposition(newPos);

      if (index === null) continue;

      const targetFigure = board[index]?.figure;

      if (targetFigure === null) allowed.push(index);
      if (targetFigure instanceof Figure) {
        if (
          (isProtectionCheck && color === targetFigure.color) ||
          (!isProtectionCheck &&
            color !== targetFigure.color &&
            !this.isProtected(targetFigure, board))
        ) {
          allowed.push(index);
        }
      }
    }

    if (isProtectionCheck || this.isMoved) return allowed;

    const rookRight = board[63].figure;
    const rookLeft = board[56].figure;
    const kingIndex = get1Dposition(position)!;

    if (rookLeft instanceof Figure && !rookLeft.isMoved) {
      if (
        board[kingIndex - 1].figure === null &&
        board[kingIndex - 2].figure === null &&
        board[kingIndex - 3].figure === null
      ) {
        allowed.push(kingIndex - 2);
      }
    }

    if (rookRight instanceof Figure && !rookRight.isMoved) {
      if (
        board[kingIndex + 1].figure === null &&
        board[kingIndex + 2].figure === null
      ) {
        allowed.push(kingIndex + 2);
      }
    }

    return allowed;
  }

  private isProtected(figure: Figure, board: Square[]): boolean {
    const figureIndex = get1Dposition(figure.position());
    return board.some((square) => {
      const { figure: guardFigure } = square;
      if (guardFigure instanceof Figure && guardFigure.color === figure.color) {
        const protectedSquares: number[] = [];
        const position = guardFigure.position();
        const color = guardFigure.color;
        switch (figure.piece) {
          case Piece.BISHOP:
            protectedSquares.push(
              ...this.getBishopFields('leftdown', board, position, color, true),
              ...this.getBishopFields('leftup', board, position, color, true),
              ...this.getBishopFields(
                'rightdown',
                board,
                position,
                color,
                true,
              ),
              ...this.getBishopFields('rightup', board, position, color, true),
            );
            break;
          case Piece.KING:
            protectedSquares.push(
              ...this.getKingFields(board, position, color, true),
            );
            break;
          case Piece.KNIGHT:
            protectedSquares.push(
              ...this.getKnightFields(board, position, color, true),
            );
            break;
          case Piece.PAWN:
            protectedSquares.push(
              ...this.getPawnFields([], board, position, false, color, true)
                .upleft,
              ...this.getPawnFields([], board, position, false, color, true)
                .upright,
            );
            break;
          case Piece.QUEEN:
            protectedSquares.push(
              ...this.getQueenFields([], board, position, color, true),
            );
            break;
          case Piece.ROOK:
            protectedSquares.push(
              ...this.getRookFields('up', board, position, color, true),
              ...this.getRookFields('down', board, position, color, true),
              ...this.getRookFields('left', board, position, color, true),
              ...this.getRookFields('right', board, position, color, true),
            );
            break;
        }

        return protectedSquares.includes(figureIndex!);
      } else {
        return false;
      }
    });
  }

  public getAllowedSquares(board: Square[]) {
    const allowedSquares: number[] = [];
    const position = this.position();

    if (this.piece === Piece.KING) {
      const forbidden = this.kingForbiddenMoves(board);
      const fields = this.getKingFields(board, position, this.color).filter(
        (field) => !forbidden.includes(field),
      );
      return fields;
    }

    const forbidden = this.guardsForbiddenMoves(board);

    switch (this.piece) {
      case Piece.BISHOP:
        if (!forbidden.includes('upleft'))
          allowedSquares.push(
            ...this.getBishopFields('leftup', board, position),
          );
        if (!forbidden.includes('downleft'))
          allowedSquares.push(
            ...this.getBishopFields('leftdown', board, position),
          );
        if (!forbidden.includes('upright'))
          allowedSquares.push(
            ...this.getBishopFields('rightup', board, position),
          );
        if (!forbidden.includes('downright'))
          allowedSquares.push(
            ...this.getBishopFields('rightdown', board, position),
          );
        break;
      case Piece.KNIGHT:
        if (forbidden.length) return allowedSquares;
        allowedSquares.push(...this.getKnightFields(board, position));
        break;
      case Piece.PAWN:
        const pawnFields = this.getPawnFields(forbidden, board, position, true);
        allowedSquares.push(
          ...pawnFields.up,
          ...pawnFields.upleft,
          ...pawnFields.upright,
        );
        break;
      case Piece.QUEEN:
        allowedSquares.push(...this.getQueenFields(forbidden, board, position));
        break;
      case Piece.ROOK:
        if (!forbidden.includes('left'))
          allowedSquares.push(...this.getRookFields('left', board, position));
        if (!forbidden.includes('right'))
          allowedSquares.push(...this.getRookFields('right', board, position));
        if (!forbidden.includes('down'))
          allowedSquares.push(...this.getRookFields('down', board, position));
        if (!forbidden.includes('up'))
          allowedSquares.push(...this.getRookFields('up', board, position));
        break;
    }
    return allowedSquares;
  }

  public isCheck(board: Square[]){
    
  }
}
