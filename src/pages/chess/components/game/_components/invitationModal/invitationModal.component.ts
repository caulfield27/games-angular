import { copy } from '@/shared/utils/utils';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, Copy } from 'lucide-angular';
import { ChessButton } from '../../../button/button.component';

@Component({
  selector: 'invitation-modal',
  templateUrl: './invitationModal.component.html',
  imports: [LucideAngularModule, ChessButton],
})
export class InvitationModal {
  @Input() link!: string;

  readonly CopyIcon = Copy;

  @Output() cancel = new EventEmitter<void>();

  onCancel() {
    this.cancel.emit();
  }

  onCopy() {
    copy(this.link);
  }
}
