import { Color, GameType, MoveDirection, Piece } from '../../types';
import { get1Dposition } from '../../utils';
import { Figure, Square } from '../figure';
import { King } from './king';

export class Rook extends Figure {
  constructor(
    color: Color,
    position: [number, number],
    isPlayer: boolean,
    type: GameType,
  ) {
    super(Piece.ROOK, color, position, isPlayer, type);
  }

  public override getAllowedSquares(
    board: Square[],
    _?: undefined,
    isCheck?: boolean,
  ): number[] {
    const allowed = [];
    const forbidden = isCheck
      ? []
      : (this.forbiddenMoves(board) as MoveDirection[]);
    if (!forbidden.includes('left'))
      allowed.push(...this.getAvailableFields('left', board));
    if (!forbidden.includes('right'))
      allowed.push(...this.getAvailableFields('right', board));
    if (!forbidden.includes('down'))
      allowed.push(...this.getAvailableFields('down', board));
    if (!forbidden.includes('up'))
      allowed.push(...this.getAvailableFields('up', board));

    return allowed;
  }

  public getAvailableFields(
    move: 'left' | 'right' | 'down' | 'up',
    board: Square[],
    kingCheck: boolean = false,
  ) {
    const position = this.position();
    const color = this.color;
    const [y, x] = position;
    let startX = move === 'left' ? x - 1 : move === 'right' ? x + 1 : x;
    let startY = move === 'down' ? y + 1 : move === 'up' ? y - 1 : y;
    let index = get1Dposition([startY, startX]) ?? -1;

    const arr: number[] = [];

    while (
      board[index]?.figure === null ||
      (kingCheck &&
        board[index]?.figure instanceof King &&
        board[index]?.figure?.color !== color)
    ) {
      arr.push(index);

      if (move === 'left') {
        startX--;
      } else if (move === 'right') {
        startX++;
      } else if (move === 'down') {
        startY++;
      } else if (move === 'up') {
        startY--;
      }
      index = get1Dposition([startY, startX]) ?? -1;
    }

    const lastFigure = board[get1Dposition([startY, startX]) ?? -1]?.figure;
    if (lastFigure instanceof Figure) {
      if (
        (kingCheck && lastFigure.color === color) ||
        lastFigure.color !== color
      ) {
        arr.push(get1Dposition([startY, startX])!);
      }
    }

    return arr;
  }
}
