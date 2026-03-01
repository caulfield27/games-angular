import { Color, GameType, Piece } from '../../types';
import { get1Dposition } from '../../utils';
import { Figure, Square } from '../figure';
import { Bishop } from './bishop';
import { Knight } from './knight';
import { Pawn } from './pawn';
import { Queen } from './queen';
import { Rook } from './rook';

export class King extends Figure {
  constructor(color: Color, position: [number, number], isPlayer: boolean, type: GameType) {
    super(Piece.KING, color, position, isPlayer, type);
  }

  public override getAllowedSquares(
    board: Square[],
    _: undefined,
    isCheck: boolean,
  ) {
    const forbidden = this.forbiddenMoves(board);
    const fields = this.getAvailableFields(board, isCheck).filter(
      (field) => !forbidden.includes(field),
    );
    return fields;
  }

  protected override forbiddenMoves(board: Square[]): number[] {
    const forbidden: number[] = [];
    for (const square of board) {
      const figure = square.figure;
      if (figure instanceof Figure && figure.color !== this.color) {
        switch (true) {
          case figure instanceof Bishop:
            forbidden.push(
              ...figure.getAvailableFields('leftdown', board, true),
              ...figure.getAvailableFields('leftup', board, true),
              ...figure.getAvailableFields('rightdown', board, true),
              ...figure.getAvailableFields('rightup', board, true),
            );
            break;
          case figure instanceof King:
            forbidden.push(...figure.getAvailableFields(board));
            break;
          case figure instanceof Knight:
            forbidden.push(...figure.getAvailableFields(board));
            break;
          case figure instanceof Pawn:
            const pawn = figure.getAvailableFields([], board);
            forbidden.push(...pawn.upleft, ...pawn.upright);
            break;
          case figure instanceof Queen:
            forbidden.push(...figure.getDiagonalSquares(board));
            forbidden.push()
            forbidden.push(...figure.getAvailableFields([], board));
            break;
          case figure instanceof Rook:
            forbidden.push(
              ...figure.getAvailableFields('down', board),
              ...figure.getAvailableFields('left', board),
              ...figure.getAvailableFields('right', board),
              ...figure.getAvailableFields('up', board),
            );
            break;
        }
      }
    }

    return forbidden;
  }

  protected getAvailableFields(board: Square[], isCheck: boolean = false) {
    const allowed: number[] = [];
    const position = this.position();
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
          (!this.isPlayer && this.color === targetFigure.color && !isCheck) ||
          (this.color !== targetFigure.color &&
            !this.isProtected(targetFigure, board))
        ) {
          allowed.push(index);
        }
      }
    }

    if (!this.isPlayer || this.isMoved) return allowed;

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
        switch (true) {
          case guardFigure instanceof Bishop:
            protectedSquares.push(
              ...guardFigure.getAvailableFields('leftdown', board),
              ...guardFigure.getAvailableFields('leftup', board),
              ...guardFigure.getAvailableFields('rightdown', board),
              ...guardFigure.getAvailableFields('rightup', board),
            );
            break;
          case guardFigure instanceof King:
            protectedSquares.push(...guardFigure.getAvailableFields(board));
            break;
          case guardFigure instanceof Knight:
            protectedSquares.push(...guardFigure.getAvailableFields(board));
            break;
          case guardFigure instanceof Pawn:
            protectedSquares.push(
              ...guardFigure.getAvailableFields([], board).upleft,
              ...guardFigure.getAvailableFields([], board).upright,
            );
            break;
          case guardFigure instanceof Queen:
            protectedSquares.push(...guardFigure.getAvailableFields([], board));
            break;
          case guardFigure instanceof Rook:
            protectedSquares.push(
              ...guardFigure.getAvailableFields('up', board),
              ...guardFigure.getAvailableFields('down', board),
              ...guardFigure.getAvailableFields('left', board),
              ...guardFigure.getAvailableFields('right', board),
            );
            break;
        }

        return protectedSquares.includes(figureIndex!);
      } else {
        return false;
      }
    });
  }
}
