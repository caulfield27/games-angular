import { User } from '@/shared/types/types';
import { Color, Piece, Square } from '../types';

export class Player {
  public color;
  public user;
  constructor(color: Color, user: User | null) {
    this.color = color;
    this.user = user;
  }
}
