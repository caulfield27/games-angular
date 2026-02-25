import { Color, MoveDirection, Piece } from '../../types';
import { Figure, Square } from '../figure';
import { Bishop } from './bishop';
import { Rook } from './rook';

export class Queen extends Figure {
  constructor(color: Color, position: [number, number]) {
    super(Piece.QUEEN, color, position);
  }

  public override getAllowedSquares(board: Square[]): number[] {
    const forbidden = this.forbiddenMoves(board) as MoveDirection[];
    return this.getAvailableFields(
      forbidden,
      board,
      this.position(),
      this.color,
      false,
    );
  }

  public getAvailableFields(
    forbidden: MoveDirection[],
    board: Square[],
    position: [number, number],
    color: Color = this.color,
    isProtectionCheck: boolean = false,
  ) {
    const rook = new Rook(color, position);
    const bishop = new Bishop(color, position);
    const arr: number[] = [];
    if (!forbidden.includes('left')) {
      arr.push(
        ...rook.getAvailableFields(
          'left',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    }
    if (!forbidden.includes('right')) {
      arr.push(
        ...rook.getAvailableFields(
          'right',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    }
    if (!forbidden.includes('down')) {
      arr.push(
        ...rook.getAvailableFields(
          'down',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    }
    if (!forbidden.includes('up')) {
      arr.push(
        ...rook.getAvailableFields(
          'up',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    }
    if (!forbidden.includes('upleft')) {
      arr.push(
        ...bishop.getAvailableFields(
          'leftup',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    }
    if (!forbidden.includes('downleft')) {
      arr.push(
        ...bishop.getAvailableFields(
          'leftdown',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    }
    if (!forbidden.includes('upright')) {
      arr.push(
        ...bishop.getAvailableFields(
          'rightup',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    }
    if (!forbidden.includes('downright')) {
      arr.push(
        ...bishop.getAvailableFields(
          'rightdown',
          board,
          position,
          color,
          isProtectionCheck,
        ),
      );
    }
    return arr;
  }
}
