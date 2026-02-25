import { Color, Piece } from '../../types';
import { get1Dposition } from '../../utils';
import { Figure, Square } from '../figure';
import { Bishop } from './bishop';
import { Knight } from './knight';
import { Pawn } from './pawn';
import { Queen } from './queen';
import { Rook } from './rook';

export class King extends Figure {
  constructor(color: Color, position: [number, number]) {
    super(Piece.KING, color, position);
  }

  public override getAllowedSquares(board: Square[]) {
    const forbidden = this.forbiddenMoves(board);
    const fields = this.getAvailableFields(
      board,
      this.position(),
      this.color,
    ).filter((field) => !forbidden.includes(field));
    return fields;
  }

  protected override forbiddenMoves(board: Square[]): number[] {
    const forbidden: number[] = [];
    for (const square of board) {
      const figure = square.figure;
      if (figure instanceof Figure && figure.color !== this.color) {
        const opPosition = figure.position();
        switch (true) {
          case figure instanceof Bishop:
            forbidden.push(
              ...figure.getAvailableFields(
                'leftdown',
                board,
                opPosition,
                figure.color,
              ),
              ...figure.getAvailableFields(
                'leftup',
                board,
                opPosition,
                figure.color,
              ),
              ...figure.getAvailableFields(
                'rightdown',
                board,
                opPosition,
                figure.color,
              ),
              ...figure.getAvailableFields(
                'rightup',
                board,
                opPosition,
                figure.color,
              ),
            );
            break;
          case figure instanceof King:
            forbidden.push(
              ...figure.getAvailableFields(board, opPosition, figure.color),
            );
            break;
          case figure instanceof Knight:
            forbidden.push(
              ...figure.getAvailableFields(board, opPosition, figure.color),
            );
            break;
          case figure instanceof Pawn:
            const pawn = figure.getAvailableFields(
              [],
              board,
              opPosition,
              false,
              figure.color,
            );
            forbidden.push(...pawn.upleft, ...pawn.upright);
            break;
          case figure instanceof Queen:
            forbidden.push(
              ...figure.getAvailableFields([], board, opPosition, figure.color),
            );
            break;
          case figure instanceof Rook:
            forbidden.push(
              ...figure.getAvailableFields(
                'down',
                board,
                opPosition,
                figure.color,
              ),
              ...figure.getAvailableFields(
                'left',
                board,
                opPosition,
                figure.color,
              ),
              ...figure.getAvailableFields(
                'right',
                board,
                opPosition,
                figure.color,
              ),
              ...figure.getAvailableFields(
                'up',
                board,
                opPosition,
                figure.color,
              ),
            );
            break;
        }
      }
    }

    return forbidden;
  }

  protected getAvailableFields(
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
        switch (true) {
          case guardFigure instanceof Bishop:
            protectedSquares.push(
              ...guardFigure.getAvailableFields(
                'leftdown',
                board,
                position,
                color,
                true,
              ),
              ...guardFigure.getAvailableFields(
                'leftup',
                board,
                position,
                color,
                true,
              ),
              ...guardFigure.getAvailableFields(
                'rightdown',
                board,
                position,
                color,
                true,
              ),
              ...guardFigure.getAvailableFields(
                'rightup',
                board,
                position,
                color,
                true,
              ),
            );
            break;
          case guardFigure instanceof King:
            protectedSquares.push(
              ...guardFigure.getAvailableFields(board, position, color, true),
            );
            break;
          case guardFigure instanceof Knight:
            protectedSquares.push(
              ...guardFigure.getAvailableFields(board, position, color, true),
            );
            break;
          case guardFigure instanceof Pawn:
            protectedSquares.push(
              ...guardFigure.getAvailableFields(
                [],
                board,
                position,
                false,
                color,
                true,
              ).upleft,
              ...guardFigure.getAvailableFields(
                [],
                board,
                position,
                false,
                color,
                true,
              ).upright,
            );
            break;
          case guardFigure instanceof Queen:
            protectedSquares.push(
              ...guardFigure.getAvailableFields(
                [],
                board,
                position,
                color,
                true,
              ),
            );
            break;
          case guardFigure instanceof Rook:
            protectedSquares.push(
              ...guardFigure.getAvailableFields(
                'up',
                board,
                position,
                color,
                true,
              ),
              ...guardFigure.getAvailableFields(
                'down',
                board,
                position,
                color,
                true,
              ),
              ...guardFigure.getAvailableFields(
                'left',
                board,
                position,
                color,
                true,
              ),
              ...guardFigure.getAvailableFields(
                'right',
                board,
                position,
                color,
                true,
              ),
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
