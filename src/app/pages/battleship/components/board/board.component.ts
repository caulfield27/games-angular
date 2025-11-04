import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { IShip, sendMessageType } from '../../types/types';
import { NgStyle, NgClass } from '@angular/common';
import { CdkDrag, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { getCoordinates } from '../../utils/getCoordinates';
import { BoardService } from '../../services/board.service';
import { BattleshipService, WebSocketService } from '../../services';

@Component({
  selector: 'battleship-board',
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  imports: [NgStyle, CdkDrag, NgClass],
  providers: [BoardService],
})
export class Board implements AfterViewInit {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  constructor(
    public battleshipService: BattleshipService,
    public boardService: BoardService,
    public ws: WebSocketService
  ) {}

  ngAfterViewInit(): void {
    const ships = this.battleshipService.ships;
    ships.set(this.battleshipService.getShips());
  }

  onReady(){
    this.ws.sendMessage({ type: sendMessageType.READY, data: this.battleshipService.gameSessionData.sessionId });
    this.battleshipService.isReady.set(true);
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
}
