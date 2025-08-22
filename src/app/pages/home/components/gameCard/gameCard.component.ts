import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'game-card',
  imports: [RouterLink],
  templateUrl: './gameCard.component.html',
  styleUrl: './gameCard.component.scss',
})
export class GameCard {
  @Input() name!: string;
  @Input() image!: string;
  @Input() href!: string;
  @Input() tags!: string[];
  @Input() activeTags!: string[];

  onTagsClick(tag: string){
    if(this.activeTags.includes(tag)) return;
    this.activeTags.push(tag);
    // i need to change games array here
  }
}
