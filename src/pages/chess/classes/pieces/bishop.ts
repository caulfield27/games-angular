import { Color, GameType, MoveDirection, Piece } from '../../types';
import { get1Dposition } from '../../utils';
import { Figure, Square } from '../figure';

export class Bishop extends Figure {
  constructor(
    color: Color,
    position: [number, number],
    isPlayer: boolean,
    type: GameType,
  ) {
    super(Piece.BISHOP, color, position, isPlayer, type);
  }

  public override getAllowedSquares(board: Square[]): number[] {
    const allowed = [];
    const forbidden = this.forbiddenMoves(board) as MoveDirection[];
    if (!forbidden.includes('upleft'))
      allowed.push(...this.getAvailableFields('leftup', board));
    if (!forbidden.includes('downleft'))
      allowed.push(...this.getAvailableFields('leftdown', board));
    if (!forbidden.includes('upright'))
      allowed.push(...this.getAvailableFields('rightup', board));
    if (!forbidden.includes('downright'))
      allowed.push(...this.getAvailableFields('rightdown', board));

    return allowed;
  }

  public getAvailableFields(
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
    if (lastFigure instanceof Figure) {
      if (
        (!this.isPlayer && lastFigure.color === this.color) ||
        lastFigure.color !== this.color
      ) {
        arr.push(get1Dposition([startY, startX])!);
      }
    }

    return arr;
  }
}
