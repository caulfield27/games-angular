import { Component, effect, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { sendMessageType } from '../../types/types';
import { getCoordinates } from '../../utils/getCoordinates';
import { WebSocketService, BattleshipService } from '../../services';

@Component({
  selector: 'opponent-board',
  templateUrl: './opponentBoard.component.html',
  styleUrl: './opponentBoard.component.scss',
  imports: [NgClass, NgStyle],
})
export class OpponentBoard implements OnInit {
  constructor(
    public battleshipService: BattleshipService,
    private ws: WebSocketService
  ) {
    effect(() => {
      if (this.battleshipService.gameStatus() === 'start') {
        window.addEventListener('beforeunload', () => {
          this.ws.sendMessage({
            type: sendMessageType.CLOSE_ROOM,
            data: {
              roomId: this.battleshipService.gameSessionData.sessionId,
            },
          });
        });
      }
    });
  }
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    let col = 1;
    let row = 1;
    const btns = [];
    for (let i = 0; i < 100; i++) {
      const { gridColumn, gridRow } = this.battleshipService.getGridArea(
        {
          x: row - 1,
          y: col - 1,
        },
        null
      );

      btns.push({
        disabled: true,
        missed: false,
        hitted: false,
        gridColumn,
        gridRow,
      });

      if (col === 10) {
        row++;
        col = 0;
      }
      col++;
    }
    this.battleshipService.buttons.set(btns);
  }

  onClick(event: MouseEvent) {
    if (this.battleshipService.shotPending) {
      return;
    } else {
      this.battleshipService.shotPending = true;
    }
    

    const coordinates = getCoordinates(this.container.nativeElement, event);
    this.ws.sendMessage({
      type: sendMessageType.CHECK,
      data: {
        sessionId: this.battleshipService.gameSessionData.sessionId,
        coordinates,
      },
    });
  }
}
