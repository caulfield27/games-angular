import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChessButton } from '../button/button.component';

export interface BoardTheme {
  name: string;
  white: string;
  black: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  { name: 'Классический', white: '#eeeed2', black: '#769656' },
  { name: 'Дерево', white: '#f0d9b5', black: '#b58863' },
  { name: 'Темный', white: '#cfcfcf', black: '#3b3b3b' },
  { name: 'Минимализм', white: '#dee3e6', black: '#8ca2ad' },
];

@Component({
  selector: 'theme-modal',
  templateUrl: './theme.component.html',
  styleUrl: './theme.component.css',
  imports: [ChessButton],
})
export class ThemeSettingsComponent {
  [x: string]: any;

  @Input() isOpen: boolean = false;

  @Output() onClose = new EventEmitter<void>();

  themes = BOARD_THEMES;

  preview = new Array(64);

  selectedTheme = this.themes[1];

  ngOnInit() {
    const saved = localStorage.getItem('boardTheme');
    if (saved) {
      const parsedSaved = JSON.parse(saved) as BoardTheme;
      const theme = this.themes.find((t) => t.name === parsedSaved.name);
      if (theme) {
        this.selectedTheme = theme;
      }
    }
  }

  selectTheme(theme: BoardTheme) {
    this.selectedTheme = theme;
  }

  handleSave() {
    localStorage.setItem('boardTheme', JSON.stringify(this.selectedTheme));

    document.documentElement.style.setProperty(
      '--board-white',
      this.selectedTheme.white,
    );
    document.documentElement.style.setProperty(
      '--board-black',
      this.selectedTheme.black,
    );
    this.close();
  }

  getColor(index: number, theme: BoardTheme) {
    return (index + Math.floor(index / 8)) % 2 ? theme.black : theme.white;
  }

  close() {
    this.onClose.emit();
  }
}
