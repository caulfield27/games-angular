import { Component, ElementRef, ViewChild } from '@angular/core';
import { SearchIcon } from '../../icons/search/search.component';
import { GameCard } from './components/gameCard/gameCard.component';
import { GamesFiltersService } from './services/filters.service';
import { AuthService } from '@/shared/services/auth.service';

@Component({
  selector: 'home-page',
  imports: [SearchIcon, GameCard],
  providers: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomePage {
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    public filters: GamesFiltersService,
    public auth: AuthService,
  ) {}

  getSearchValue() {
    return this.searchInputRef?.nativeElement?.value ?? '';
  }

  onTagClear(tag: string) {
    this.filters.removeTag(tag, this.getSearchValue());
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filters.gamesArray.set(this.filters.filterGames(value));
  }

  onFocus(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    target.placeholder = '';
  }

  onBlur(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    target.placeholder = 'Поиск...';
  }

  onModalOpen() {
    this.auth.isModalOpen.set(true);
  }
}
