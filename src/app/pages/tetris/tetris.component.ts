import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'tetris',
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(10, 30px);
        grid-template-rows: repeat(20, 30px);
        border: 1px solid blue;
        background-image: linear-gradient(to right, blue 1px, transparent 1px),
          linear-gradient(to bottom, blue 1px, transparent 1px);
        background-size: 30px 30px;
      }
    `,
  ],
  templateUrl: './tetris.component.html',
})
export class Tetris implements AfterViewInit {
  get figure(){

    return '';
  }

  ngAfterViewInit(): void {
    
  }
}
