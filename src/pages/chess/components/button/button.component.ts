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
      class="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-[18px] font-semibold leading-[27px] transition-opacity"
    >
      @if (icon) {
        <lucide-angular
          [img]="icon"
          [style.color]="iconColor"
          class="w-5 h-5"
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
    const base = 'cursor-pointer hover:opacity-90 active:opacity-75';
    const variants: Record<string, string> = {
      primary: 'bg-[#ff4f00] text-[#fffefb]',
      secondary: 'bg-[#201515] text-[#fffefb]',
      dark: 'bg-[#201515] text-[#fffefb]',
    };
    return `${base} ${variants[this.variant]}`;
  }
}