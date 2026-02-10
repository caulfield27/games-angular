import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GamesFiltersService } from '../../services/filters.service';

@Component({
  selector: 'game-card',
  imports: [RouterLink],
  templateUrl: './gameCard.component.html',
})
export class GameCard {
  constructor(public filters: GamesFiltersService) {}

  @Input() name!: string;
  @Input() image!: string;
  @Input() href!: string;
  @Input() tags!: string[];
  @Input() searchInput!: string;

  onTagAdd(tag: string) {
    window.scrollTo({ top: 0});
    this.filters.addActiveTag(tag, this.searchInput);
  }
}
