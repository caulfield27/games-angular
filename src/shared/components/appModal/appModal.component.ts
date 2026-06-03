import { Component, ElementRef, ViewChild } from '@angular/core';
import { AppModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './appModal.component.html',
  styleUrl: './appModal.component.scss',
})
export class AppModal {
  @ViewChild('levelSelect') levelSelect?: ElementRef<HTMLSelectElement>;

  constructor(public modal: AppModalService) {}

  onConfirm(): void {
    const selectedLevel = this.levelSelect?.nativeElement.value;
    this.modal.confirm(selectedLevel);
  }

  onDismiss(): void {
    this.modal.dismiss();
  }

  onBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      this.modal.dismiss();
    }
  }
}
