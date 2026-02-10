import { AuthService } from '@/shared/services/auth.service';
import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { LucideAngularModule, X, Lock, Mail, User } from 'lucide-angular';

@Component({
  selector: 'auth-modal',
  templateUrl: './authModal.component.html',
  imports: [LucideAngularModule, NgClass],
})
export class AuthModal implements OnInit, OnDestroy {
  readonly Xicon = X;
  readonly LockIcon = Lock;
  readonly MailIcon = Mail;
  readonly UserIcon = User;
  public activeTab: 'login' | 'register' = 'login';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }

  public setActiveTab(tab: 'login' | 'register') {
    this.activeTab = tab;
  }

  public onClose() {
    this.authService.isModalOpen.set(false);
  }
}
