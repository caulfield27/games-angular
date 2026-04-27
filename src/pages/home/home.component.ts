import { Component, ElementRef, ViewChild } from '@angular/core';
import { GameCard } from './components/gameCard/gameCard.component';
import { GamesFiltersService } from './services/filters.service';
import { AuthService } from '@/shared/services/auth.service';
import { PwaService } from '@/shared/services/pwa.service';
import {
  Download,
  Gamepad2,
  LucideAngularModule,
  User,
  Search,
  LogIn,
  Menu,
  X,
} from 'lucide-angular';

@Component({
  selector: 'home-page',
  imports: [GameCard, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomePage {
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  readonly GamepadIcon = Gamepad2;
  readonly DownloadIcon = Download;
  readonly SearchIcon = Search;
  readonly UserIcon = User;
  readonly LoginIcon = LogIn;
  readonly Xicon = X;
  readonly MenuIcon = Menu;

  public isMenuOpen: boolean = false;

  constructor(
    public filters: GamesFiltersService,
    public auth: AuthService,
    public pwa: PwaService,
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
    target.placeholder = 'Найти игру...';
  }

  onModalOpen() {
    this.auth.isModalOpen.set(true);
  }

  onInstallApp() {
    this.pwa.install();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
