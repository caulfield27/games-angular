import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'chess-chip',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      type="button"
      (click)="onClick()"
      [ngClass]="chipClasses"
      class="shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200"
    >
      {{ label }}
    </button>
  `,
})
export class ChessChip {
  @Input() label: string = '';
  @Input() active: boolean = false;
  @Output() handleClick = new EventEmitter<void>();

  public onClick() {
    this.handleClick.emit();
  }

  get chipClasses() {
    if (this.active) {
      return 'border-transparent bg-gradient-to-r from-[#ea580c] to-[#c2410c] text-white shadow-lg hover:scale-[1.03]';
    }

    return 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50';
  }
}
