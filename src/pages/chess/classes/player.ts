import { signal } from '@angular/core';
import { Piece } from '../types';
import { PIECE_VALUE } from '../constants';

export class Player {
  public color;
  public name;
  public takenPieces = signal<Piece[]>([]);
  public advantage = signal<number>(0);
  constructor(color: 'black' | 'white', name: string) {
    this.color = color;
    this.name = signal(name);
  }

  public insertTakenPiece(piece: Piece, opponent: Player) {
    this.takenPieces.update((prev) => [...prev, piece]);
    this.advantage.set(this.getAdvantage(opponent.takenPieces()));
    opponent.advantage.set(opponent.getAdvantage(this.takenPieces()));
  }

  public getAdvantage(losePieces: Piece[]) {
    const totalLose = losePieces.reduce(
      (acc, item) => acc + PIECE_VALUE[item],
      0,
    );
    const totalWin = this.takenPieces().reduce(
      (acc, item) => acc + PIECE_VALUE[item],
      0,
    );
    return totalWin > totalLose ? totalWin - totalLose : 0;
  }
}
