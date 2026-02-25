import { Color, History, MoveDirection, Piece } from '../../types';
import { get1Dposition, get2Dposition } from '../../utils';
import { Figure, Square } from '../figure';

export class Pawn extends Figure {
  constructor(color: Color, position: [number, number]) {
    super(Piece.PAWN, color, position);
  }

  public override getAllowedSquares(
    board: Square[],
    history: History[],
  ): number[] {
    const allowed = [];
    const forbidden = this.forbiddenMoves(board) as MoveDirection[];
    const pawnFields = this.getAvailableFields(
      forbidden,
      board,
      this.position(),
      true,
      this.color,
      false,
      history,
    );
    allowed.push(...pawnFields.up, ...pawnFields.upleft, ...pawnFields.upright);
    return allowed;
  }

  public getAvailableFields(
    forbidden: MoveDirection[],
    board: Square[],
    position: [number, number],
    isPlayer: boolean = true,
    color: Color = this.color,
    isProtectionCheck: boolean = false,
    history?: History[],
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

      // if (up3Figure === null && history && history[history.length - 1]) {
      //   const lastMove = history[history.length - 1];
      
      //   const prevY = lastMove.move[0][0];
      //   const curY = lastMove.move[1][1];
      //   const lastMoveIndex = get1Dposition(lastMove.move[1]) ?? -1;
      //   const lastMovedFigure = board[lastMoveIndex];
      //   if (
      //     lastMovedFigure instanceof Pawn &&
      //     lastMovedFigure.color !== this.color &&
      //     curY - 2 === prevY
      //   ) {
      //   }
      // }
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
}
