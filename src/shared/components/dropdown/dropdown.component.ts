import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IDropdownOption } from '@/shared/types/types';
import { NgClass } from '@angular/common';

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  imports: [NgClass],
})
export class Dropdown {
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  @Input() options!: IDropdownOption[];
  @Input() onSelect!: (option: IDropdownOption) => void;
  @Input() value!: IDropdownOption;
  @Input() placeholder?: string;

  isOpen: boolean = false;
  bindedFn: null | ((e: Event) => void) = null;

  toggleDropdown() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.bindedFn = this.handleClickOutside.bind(this);
      const listener = this.bindedFn;
      setTimeout(() => window.addEventListener('click', listener), 0);
    } else {
      const listener = this.bindedFn;
      if (listener) {
        window.removeEventListener('click', listener);
      }
    }
  }

  handleClickOutside(e: Event) {
    if (!this.container.nativeElement?.contains(e.target as Node)) {
      this.isOpen = false;
      const listener = this.bindedFn;
      if (listener) {
        window.removeEventListener('click', listener);
      }
    }
  }

  handleSelect(option: IDropdownOption) {
    this.onSelect(option);
    this.toggleDropdown();
  }
}
