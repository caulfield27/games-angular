import { copy } from '@/shared/utils/utils';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LucideAngularModule, Copy } from 'lucide-angular';
import { ChessButton } from '../../../button/button.component';

@Component({
  selector: 'invitation-modal',
  templateUrl: './invitationModal.component.html',
  imports: [LucideAngularModule, ChessButton],
})
export class InvitationModal implements OnInit, OnDestroy {
  @Input() link!: string;

  readonly CopyIcon = Copy;

  ngOnInit(): void {
    window.scrollTo({top: 0})
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto'
  }

  @Output() cancel = new EventEmitter<void>();

  onCancel() {
    this.cancel.emit();
  }

  onCopy() {
    copy(this.link);
  }
}
