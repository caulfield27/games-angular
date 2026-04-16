import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { ChessButton } from '../button/button.component';

export interface BoardTheme {
  name: string;
  white: string;
  black: string;
  historyColor: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    name: 'Классический',
    white: '#eeeed2',
    black: '#769656',
    historyColor: '#fde68a',
  },
  {
    name: 'Дерево',
    white: '#f0d9b5',
    black: '#b58863',
    historyColor: '#d6d3d1',
  },
  {
    name: 'Темный',
    white: '#f5f5f5',
    black: '#3b3b3b',
    historyColor: '#cbd5e1',
  },
  {
    name: 'Минимализм',
    white: '#dee3e6',
    black: '#8ca2ad',
    historyColor: '#fca5a5',
  },
];

@Component({
  selector: 'theme-modal',
  templateUrl: './theme.component.html',
  styleUrl: './theme.component.css',
  imports: [ChessButton],
})
export class ThemeSettingsComponent implements OnDestroy {
  [x: string]: any;

  @Input() isOpen: boolean = false;

  @Output() onClose = new EventEmitter<void>();

  themes = BOARD_THEMES;

  preview = new Array(64);

  selectedTheme = this.themes[1];

  ngOnInit() {
    document.body.style.overflowY = 'hidden';
    const saved = localStorage.getItem('boardTheme');
    if (saved) {
      const parsedSaved = JSON.parse(saved) as BoardTheme;
      const theme = this.themes.find((t) => t.name === parsedSaved.name);
      if (theme) {
        this.selectedTheme = theme;
      }
    }
  }

  ngOnDestroy(){
    document.body.style.overflowY = 'auto';
  }

  selectTheme(theme: BoardTheme) {
    this.selectedTheme = theme;
  }

  handleSave() {
    localStorage.setItem('boardTheme', JSON.stringify(this.selectedTheme));
    this.setupVariables();
    this.close();
  }

  setupVariables() {
    document.documentElement.style.setProperty(
      '--board-white',
      this.selectedTheme.white,
    );
    document.documentElement.style.setProperty(
      '--board-black',
      this.selectedTheme.black,
    );
    document.documentElement.style.setProperty(
      '--board-history',
      this.selectedTheme.historyColor,
    );
  }

  getColor(index: number, theme: BoardTheme) {
    return (index + Math.floor(index / 8)) % 2 ? theme.black : theme.white;
  }

  close() {
    this.onClose.emit();
  }
}
