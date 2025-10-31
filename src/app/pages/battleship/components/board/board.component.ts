import { AfterViewInit, Component } from '@angular/core';
import { BattleshipService } from '../../services/battleship.service';
import { Direction, ICoordinates } from '../../types/types';
import { NgStyle } from '@angular/common';
import {CdkDrag } from '@angular/cdk/drag-drop';

@Component({
  selector: 'battleship-board',
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  imports: [NgStyle, CdkDrag]
})
export class Board implements AfterViewInit {
  constructor(public battleshipService: BattleshipService) {}

  ngAfterViewInit(): void {
    const ships = this.battleshipService.ships;
    ships.set(this.battleshipService.getShips());
  }

  getGridArea(
    coordinates: ICoordinates,
    dir: null | Direction
  ): { gridColumn: string; gridRow: string } {
    let gridColumn = '0';
    let gridRow = '0';
    const { x, y } = coordinates;

    if (!dir) {
      gridRow = String((y as number) + 1);
      gridColumn = String((x as number) + 1);
    } else {
      switch (dir) {
        case 'horizontal':
          if (Array.isArray(x)) {
            const xStart = Math.min(x[0], x[1]);
            const xEnd = Math.max(x[0], x[1]);
            gridRow = String((y as number) + 1);
            gridColumn = `${xStart + 1} / ${xEnd + 2}`;
          }
          break;
        case 'vertical':
          if (Array.isArray(y)) {
            const yStart = Math.min(y[0], y[1]);
            const yEnd = Math.max(y[0], y[1]);
            gridColumn = String((x as number) + 1);
            gridRow = `${yStart + 1} / ${yEnd + 2}`;
          }
          break;
      }
    }

    return {
      gridColumn,
      gridRow,
    };
  }
}
