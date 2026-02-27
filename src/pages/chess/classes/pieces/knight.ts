import { Color, GameType, MoveDirection, Piece } from '../../types';
import { get1Dposition } from '../../utils';
import { Figure, Square } from '../figure';

export class Knight extends Figure {
  constructor(color: Color, position: [number, number], isPlayer: boolean, type: GameType) {
    super(Piece.KNIGHT, color, position, isPlayer, type);
  }

  public override getAllowedSquares(board: Square[]): number[] {
    const forbidden = this.forbiddenMoves(board) as MoveDirection[];
    if (forbidden.length) return [];
    return this.getAvailableFields(board);
  }

  public getAvailableFields(board: Square[]) {
    const allowed: number[] = [];
    const [y, x] = this.position();
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
          (!this.isPlayer && this.color === figure.color) ||
          (this.color !== figure.color)
        ) {
          allowed.push(index);
        }
      }
    }

    return allowed;
  }
}
