import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'chess-button',
  standalone: true,
  imports: [LucideAngularModule],
  styleUrl: './button.component.scss',
  template: `
    <button
      (click)="onClick()"
      class="chess-btn"
      [class.chess-btn--primary]="variant === 'primary'"
      [class.chess-btn--secondary]="variant === 'secondary'"
      [class.chess-btn--danger]="variant === 'dark'"
    >
      @if (icon) {
        <lucide-angular [img]="icon" [style.color]="iconColor" class="btn-icon" />
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