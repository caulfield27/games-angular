import { Component, Input } from '@angular/core';

export interface BoardTheme {
  name: string;
  white: string;
  black: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  { name: 'Коассический', white: '#eeeed2', black: '#769656' },
  { name: 'Дерево', white: '#f0d9b5', black: '#b58863' },
  { name: 'Темный', white: '#cfcfcf', black: '#3b3b3b' },
  { name: 'Минимализм', white: '#dee3e6', black: '#8ca2ad' },
];

@Component({
  selector: 'theme-modal',
  templateUrl: './theme.component.html',
  styleUrl: './theme.component.css',
})
export class ThemeSettingsComponent {
  [x: string]: any;

  @Input() isOpen: boolean = false;

  themes = BOARD_THEMES;

  preview = new Array(64);

  selectedTheme = this.themes[0];

  ngOnInit() {
    const saved = localStorage.getItem('boardTheme');
    if (saved) {
      this.selectedTheme = JSON.parse(saved);
    }
  }

  selectTheme(theme: BoardTheme) {
    this.selectedTheme = theme;

    localStorage.setItem('boardTheme', JSON.stringify(theme));

    document.documentElement.style.setProperty('--board-white', theme.white);
    document.documentElement.style.setProperty('--board-black', theme.black);
  }

  getColor(index: number, theme: BoardTheme) {
    return (index + Math.floor(index / 8)) % 2 ? theme.black : theme.white;
  }

  close() {
    this.isOpen = false;
  }
}
