import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BattleshipService } from '../../services/battleship.service';
import { Direction, ICoordinates, IShip } from '../../types/types';
import { NgStyle } from '@angular/common';
import { CdkDrag, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { getCoordinates } from '../../utils/getCoordinates';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'battleship-board',
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  imports: [NgStyle, CdkDrag],
  providers: [BoardService],
})
export class Board implements AfterViewInit {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  constructor(
    public battleshipService: BattleshipService,
    public boardService: BoardService
  ) {}

  ngAfterViewInit(): void {
    const ships = this.battleshipService.ships;
    ships.set(this.battleshipService.getShips());
  }

  onDragMove(event: CdkDragMove<IShip>) {
    const container = this.container?.nativeElement;
    if (!container) return;

    const { data } = event.source;
    const { x, y } = getCoordinates(container, event.pointerPosition);
    this.boardService.checkPosition(
      this.battleshipService.gameSessionData.fieldMatrix,
      data.coordinates,
      x,
      y,
      data.size,
      data.direction
    );
  }

  onDragEnd(event: CdkDragEnd<IShip>) {
    event.source.reset();
    const placeToArrange = this.boardService.placeToArrange();
    const { coordinates, size } = event.source.data;

    if (placeToArrange?.coordinates) {
      if (size === 1) {
        this.battleshipService.updateBattleshipCell(
          coordinates.x as number,
          coordinates.y as number,
          false
        );
        this.battleshipService.updateBattleshipCell(
          placeToArrange.coordinates.x as number,
          placeToArrange.coordinates.y as number,
          true
        );
      } else {
        const isVertical = Array.isArray(coordinates.y);
        const prevArray: number[] = isVertical
          ? (coordinates.y as number[])
          : (coordinates.x as number[]);
        const prevStart = Math.min(...prevArray);
        const prevEnd = Math.max(...prevArray);

        for (let i = prevStart; i <= prevEnd; i++) {
          this.battleshipService.updateBattleshipCell(
            isVertical ? (coordinates.x as number) : i,
            isVertical ? i : (coordinates.y as number),
            false
          );
        }

        const curArray: number[] = isVertical
          ? (placeToArrange.coordinates.y as number[])
          : (placeToArrange.coordinates.x as number[]);
        const start = Math.min(...curArray);
        const end = Math.max(...curArray);

        for (let i = start; i <= end; i++) {
          this.battleshipService.updateBattleshipCell(
            isVertical ? (placeToArrange.coordinates.x as number) : i,
            isVertical ? i : (placeToArrange.coordinates.y as number),
            true
          );
        }
      }
      this.battleshipService.updateShip(event.source.data, placeToArrange);
      this.boardService.placeToArrange.set(null);
    }
    this.boardService.coordinateDif = null;
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
