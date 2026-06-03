import { Injectable, signal } from '@angular/core';

export type ModalIcon = 'success' | 'error' | 'info' | 'settings';

export interface AppModalConfig {
  title: string;
  body?: string;
  icon?: ModalIcon;
  confirmText?: string;
  cancelText?: string;
  // Settings modal: pass current level so the select is pre-selected
  settingsLevel?: string;
}

export interface AppModalResult {
  isConfirmed: boolean;
  // Filled when settings modal is confirmed
  selectedLevel?: string;
}

@Injectable({ providedIn: 'root' })
export class AppModalService {
  readonly modal = signal<AppModalConfig | null>(null);

  private resolveRef?: (result: AppModalResult) => void;

  open(config: AppModalConfig): Promise<AppModalResult> {
    return new Promise((resolve) => {
      this.resolveRef = resolve;
      this.modal.set(config);
    });
  }

  confirm(selectedLevel?: string): void {
    this.resolveRef?.({ isConfirmed: true, selectedLevel });
    this.modal.set(null);
    this.resolveRef = undefined;
  }

  dismiss(): void {
    this.resolveRef?.({ isConfirmed: false });
    this.modal.set(null);
    this.resolveRef = undefined;
  }
}
