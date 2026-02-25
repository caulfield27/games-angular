import { Color, MoveDirection, Piece } from '../../types';
import { get1Dposition } from '../../utils';
import { Figure, Square } from '../figure';

export class Rook extends Figure {
  constructor(color: Color, position: [number, number]) {
    super(Piece.ROOK, color, position);
  }

  public override getAllowedSquares(board: Square[]): number[] {
    const allowed = [];
    const position = this.position();
    const forbidden = this.forbiddenMoves(board) as MoveDirection[];
    if (!forbidden.includes('left'))
      allowed.push(...this.getAvailableFields('left', board, position));
    if (!forbidden.includes('right'))
      allowed.push(...this.getAvailableFields('right', board, position));
    if (!forbidden.includes('down'))
      allowed.push(...this.getAvailableFields('down', board, position));
    if (!forbidden.includes('up'))
      allowed.push(...this.getAvailableFields('up', board, position));

    return allowed;
  }

  public getAvailableFields(
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
}
