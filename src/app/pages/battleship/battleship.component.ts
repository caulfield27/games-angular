import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Board, Chat, FindGameOptions } from './components';
import { BattleshipService } from './services/battleship.service';

@Component({
  selector: 'battleship',
  templateUrl: './battleship.component.html',
  styleUrl: './battleship.component.scss',
  imports: [Chat, Board, FindGameOptions],
})
export class Battleship {
}
