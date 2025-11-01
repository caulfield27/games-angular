import { Component, OnInit } from '@angular/core';
import { Board, Chat, FindGameOptions } from './components';
import { BattleshipService } from './services/battleship.service';
import { WebSocketService } from './services/webSocket.service';

@Component({
  selector: 'battleship',
  templateUrl: './battleship.component.html',
  styleUrl: './battleship.component.scss',
  imports: [Chat, Board, FindGameOptions],
})
export class Battleship implements OnInit {
  constructor(
    public battleshipService: BattleshipService,
    public ws: WebSocketService
  ) {}

  ngOnInit(): void {
    this.ws.connect();
    this.ws.setMessageHandler(this.battleshipService.onMessage);
  }

  handleShuffle() {
    this.battleshipService.reset();
  }
}
