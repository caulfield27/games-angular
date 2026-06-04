import { Component, effect, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { sendMessageType } from '../../types/types';
import { getCoordinates } from '@/shared/utils/getCoordinates';
import { WebSocketService, BattleshipService } from '../../services';

@Component({
  selector: 'opponent-board',
  templateUrl: './opponentBoard.component.html',
  styleUrl: './opponentBoard.component.scss',
  imports: [NgClass, NgStyle],
})
export class OpponentBoard implements OnInit {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  // ── Projectile animation state ────────────────────────────────────────────
  projectileVisible = false;
  projectileFly = false;
  projectileTargetX = 0;
  projectileTargetY = 0;

  constructor(
    public battleshipService: BattleshipService,
    private ws: WebSocketService
  ) {
    effect(() => {
      if (this.battleshipService.gameStatus() === 'start') {
        window.addEventListener('beforeunload', () => {
          this.ws.sendMessage({
            type: sendMessageType.CLOSE_ROOM,
            data: { roomId: this.battleshipService.gameSessionData.sessionId },
          });
        });
      }
    });
  }

  ngOnInit(): void {
    let col = 1;
    let row = 1;
    const btns = [];
    for (let i = 0; i < 100; i++) {
      const { gridColumn, gridRow } = this.battleshipService.getGridArea(
        { x: row - 1, y: col - 1 },
        null
      );
      btns.push({ disabled: true, missed: false, hitted: false, gridColumn, gridRow });
      if (col === 10) { row++; col = 0; }
      col++;
    }
    this.battleshipService.buttons.set(btns);
  }

  onClick(event: MouseEvent) {
    if (this.battleshipService.shotPending) return;
    this.battleshipService.shotPending = true;

    const containerEl = this.container.nativeElement;
    const rect = containerEl.getBoundingClientRect();
    const coordinates = getCoordinates(containerEl, event);

    // Target cell centre relative to the container
    const cellSize = 30;
    this.projectileTargetX = (coordinates.x + 0.5) * cellSize;
    this.projectileTargetY = (coordinates.y + 0.5) * cellSize;

    // Spawn projectile at the bottom-centre of the board, then fly to target
    this.projectileVisible = true;
    this.projectileFly = false;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.projectileFly = true;
      });
    });

    // After animation completes, hide projectile and fire the shot
    setTimeout(() => {
      this.projectileVisible = false;
      this.projectileFly = false;
      this.ws.sendMessage({
        type: sendMessageType.CHECK,
        data: {
          sessionId: this.battleshipService.gameSessionData.sessionId,
          coordinates,
        },
      });
    }, 350);
  }
}
