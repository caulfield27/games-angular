import { Color, GameType, MoveDirection, Piece } from '../../types';
import { Figure, Square } from '../figure';
import { Bishop } from './bishop';
import { Rook } from './rook';

export class Queen extends Figure {
  constructor(color: Color, position: [number, number], isPlayer: boolean, type: GameType) {
    super(Piece.QUEEN, color, position, isPlayer, type);
  }

  public override getAllowedSquares(board: Square[]): number[] {
    const forbidden = this.forbiddenMoves(board) as MoveDirection[];
    return this.getAvailableFields(forbidden, board);
  }

  public getAvailableFields(forbidden: MoveDirection[], board: Square[]) {
    const color = this.color;
    const position = this.position();
    const rook = new Rook(color, position, true, this.gameType);
    const bishop = new Bishop(color, position, true, this.gameType);
    const arr: number[] = [];
    if (!forbidden.includes('left')) {
      arr.push(...rook.getAvailableFields('left', board));
    }
    if (!forbidden.includes('right')) {
      arr.push(...rook.getAvailableFields('right', board));
    }
    if (!forbidden.includes('down')) {
      arr.push(...rook.getAvailableFields('down', board));
    }
    if (!forbidden.includes('up')) {
      arr.push(...rook.getAvailableFields('up', board));
    }
    if (!forbidden.includes('upleft')) {
      arr.push(...bishop.getAvailableFields('leftup', board));
    }
    if (!forbidden.includes('downleft')) {
      arr.push(...bishop.getAvailableFields('leftdown', board));
    }
    if (!forbidden.includes('upright')) {
      arr.push(...bishop.getAvailableFields('rightup', board));
    }
    if (!forbidden.includes('downright')) {
      arr.push(...bishop.getAvailableFields('rightdown', board));
    }
    return arr;
  }
}
