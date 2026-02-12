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

  public isLogging: boolean = false;
  public isRegistring: boolean = false;
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

  private getPayload(form: HTMLFormElement) {
    const formdata = new FormData(form);

    const payload: {
      email?: string;
      password: string;
      username: string;
    } = {
      username: (formdata.get('username') as string | undefined) ?? '',
      password: (formdata.get('password') as string | undefined) ?? '',
    };
    const email = formdata.get('email') as string | undefined;
    if (email) {
      payload.email = email;
    }
    return payload;
  }

  public async handleLogin(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const payload = this.getPayload(form);
    this.isLogging = true;
    this.authService
      .login(payload)
      .then((res) => {
        localStorage.setItem('token', res.data?.data ?? '');
        this.authService.isAuthed.set(true);
        this.authService.isModalOpen.set(false);
        alert('Вход выполнен успешно');
      })
      .catch(console.error)
      .finally(() => (this.isLogging = false));
  }

  public async handleRegister(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const payload = this.getPayload(form);
    this.isRegistring = true;
    this.authService
      .register(payload)
      .then((res) => {
        if (res.status === 201) {
          alert('Регистрация прошла успешно');
          this.setActiveTab('login');
        }
      })
      .catch(console.error)
      .finally(() => (this.isRegistring = false));
  }
}
