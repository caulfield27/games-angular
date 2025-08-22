import { Component } from '@angular/core';
import { SearchIcon } from '../../icons/search/search.component';
import { GameCard } from './components/gameCard/gameCard.component';
import { games } from './constants/games';
import { GamesFiltersService } from './services/filters.service';

@Component({
  selector: 'home-page',
  imports: [SearchIcon, GameCard],
  providers: [GamesFiltersService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomePage {
  gamesArray = games;
  activeTags = [];

  // constructor(private)

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.gamesArray = games.filter((game) =>
      game.name.toLowerCase().includes(target.value.toLowerCase())
    );
  }

  onFocus(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    target.placeholder = '';
  }

  onBlur(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    target.placeholder = 'Поиск...';
  }
}
