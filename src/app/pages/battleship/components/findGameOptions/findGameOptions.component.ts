import { Component } from '@angular/core';
import { Type } from './findGameOptions.types';
import { NgClass } from '@angular/common';
import { copy } from '@/app/shared/utils/utils';
import { v4 as uuidv4 } from 'uuid';
import { BattleshipService, WebSocketService } from '../../services';
import { sendMessageType } from '../../types/types';
import Swal from 'sweetalert2';

@Component({
  selector: 'find-game-options',
  templateUrl: './findGameOptions.component.html',
  styleUrl: './findGameOptions.component.scss',
  imports: [NgClass],
})
export class FindGameOptions {
  constructor(
    private ws: WebSocketService,
    public battleshipService: BattleshipService
  ) {}
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
        this.ws.sendMessage({
          type: sendMessageType.INVITE,
          data: {
            key: id,
          },
        });
      }
    }
  }

  handleFindOpponent() {
    Swal.fire({
      title: 'Введите ваш никнейм',
      input: 'text',
      inputPlaceholder: 'никнейм',
      confirmButtonText: 'Продолжить',
    }).then((result) => {
      const name = result?.value;
      this.battleshipService.gameMetadata.update((prev) => ({
        ...prev,
        myName: !name
          ? 'you'
          : name.length > 15
          ? name.slice(0, 15) + '...'
          : name,
      }));
      this.battleshipService.selectionLoading.set(true);
      this.ws.sendMessage({
        type: sendMessageType.SELECTION,
        data: {
          name,
        },
      });
    });
  }

  handleCopy() {
    if (this.inviteLink) {
      copy(this.inviteLink);
    }
  }
}
