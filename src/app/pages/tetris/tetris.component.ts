import { Component } from '@angular/core';
import { TetrisService } from './services/tetris.service';

@Component({
  selector: 'tetris',
  templateUrl: './tetris.component.html',
})

export class Tetris {
  constructor(public tetrisService: TetrisService) {}
}
