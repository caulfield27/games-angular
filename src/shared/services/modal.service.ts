import { Injectable, signal } from '@angular/core';

export type ModalIcon = 'success' | 'error' | 'info' | 'settings' | 'warning';

export interface AppModalConfig {
  title: string;
  body?: string;
  icon?: ModalIcon;
  confirmText?: string;
  cancelText?: string;
  /** Render a <select> pre-selected to this level value (memory settings) */
  settingsLevel?: string;
  /** Render a <input type="text"> with this placeholder (e.g. nickname entry) */
  inputPlaceholder?: string;
  /** Auto-dismiss after N ms without user action (e.g. game-found toast) */
  autoClose?: number;
}

export interface AppModalResult {
  isConfirmed: boolean;
  selectedLevel?: string;
  inputValue?: string;
}

@Injectable({ providedIn: 'root' })
export class AppModalService {
  readonly modal = signal<AppModalConfig | null>(null);

  private resolveRef?: (result: AppModalResult) => void;

  open(config: AppModalConfig): Promise<AppModalResult> {
    return new Promise((resolve) => {
      this.resolveRef = resolve;
      this.modal.set(config);

      if (config.autoClose) {
        setTimeout(() => this.dismiss(), config.autoClose);
      }
    });
  }

  confirm(selectedLevel?: string, inputValue?: string): void {
    this.resolveRef?.({ isConfirmed: true, selectedLevel, inputValue });
    this.modal.set(null);
    this.resolveRef = undefined;
  }

  dismiss(): void {
    this.resolveRef?.({ isConfirmed: false });
    this.modal.set(null);
    this.resolveRef = undefined;
  }
}
