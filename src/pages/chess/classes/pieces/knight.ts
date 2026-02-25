import { Color, MoveDirection, Piece } from '../../types';
import { get1Dposition } from '../../utils';
import { Figure, Square } from '../figure';

export class Knight extends Figure {
  constructor(color: Color, position: [number, number]) {
    super(Piece.KNIGHT, color, position);
  }

  public override getAllowedSquares(board: Square[]): number[] {
    const forbidden = this.forbiddenMoves(board) as MoveDirection[];
    if (forbidden.length) return [];
    return this.getAvailableFields(board, this.position(), this.color);
  }

  public getAvailableFields(
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
}
