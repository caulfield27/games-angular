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
      class="shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-[13px] font-medium transition-all duration-150"
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
      return 'border-[#ff4f00] bg-[#ff4f00] text-[#fffefb]';
    }
    return 'border-[#c5c0b1] bg-[#fffefb] text-[#605d52] hover:border-[#201515] hover:text-[#201515]';
  }
}
