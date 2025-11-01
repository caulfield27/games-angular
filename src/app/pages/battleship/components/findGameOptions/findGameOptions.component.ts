import { Component } from '@angular/core';
import { Type } from './findGameOptions.types';
import { NgClass } from '@angular/common';
import { copy } from '@/app/shared/utils/utils';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'find-game-options',
  templateUrl: './findGameOptions.component.html',
  styleUrl: './findGameOptions.component.scss',
  imports: [NgClass],
})
export class FindGameOptions {
  public type: Type = 'random';
  public switcherClasses: Record<string, boolean> = {
    switcher: true,
    right: this.type === 'friend',
  };
  public inviteLink: string | null = null;

  onChange(event: MouseEvent) {
    const { name } = event.target as HTMLButtonElement;
    this.type = name as Type;
    this.switcherClasses = {
      ...this.switcherClasses,
      right: name === 'friend',
    };

    if (name === 'friend') {
      if (!this.inviteLink) {
        const id = uuidv4();
        this.inviteLink = `${window.location.href}?room=${id}`;
        // todo
      }
    }
  }

  handleCopy() {
    if (this.inviteLink) {
      copy(this.inviteLink);
    }
  }
}
