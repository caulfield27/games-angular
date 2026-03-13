import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'chess-button',
  standalone: true,
  imports: [LucideAngularModule, NgClass],
  template: `
    <button
      (click)="onClick()"
      [ngClass]="buttonClasses"
      class="p-3 w-full flex items-center justify-center gap-3 rounded-2xl font-bold text-white text-2xl max-sm:text-xl transition-transform duration-200"
    >
      @if (icon) {
        <lucide-angular
          [img]="icon"
          [style.color]="iconColor"
          class="w-6 h-6"
        />
      }
      {{ label }}
    </button>
  `,
})
export class ChessButton {
  @Input() label: string = 'Играть';
  @Input() icon: LucideIconData | null = null;
  @Input() iconColor: string = '#FFFFFF';
  @Input() variant: 'primary' | 'secondary' | 'dark' = 'primary';
  @Output() handleClick = new EventEmitter<void>();

  public onClick() {
    this.handleClick.emit();
  }

  get buttonClasses() {
    const base = 'cursor-pointer hover:scale-[1.05] shadow-lg';
    const variants: Record<string, string> = {
      primary:
        'bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:from-[#c2410c] hover:to-[#ea580c]',
      secondary:
        'bg-gradient-to-r from-[#43e97b] to-[#38f9d7] hover:from-[#2ecc71] hover:to-[#1abc9c]',
      dark: 'bg-neutral-800 hover:bg-neutral-700',
    };
    return `${base} ${variants[this.variant]}`;
  }
}