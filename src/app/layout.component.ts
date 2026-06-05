import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule, House } from 'lucide-angular';
import { AuthModal } from '@/shared/components/authModal/authModal.component';
import { AppModal } from '@/shared/components/appModal/appModal.component';
import { AuthService } from '@/shared/services/auth.service';
import { PwaService } from '@/shared/services/pwa.service';
import { User } from '@/shared/types/types';
import { AxiosError } from 'axios';

@Component({
  selector: 'layout',
  imports: [RouterOutlet, LucideAngularModule, AuthModal, AppModal],
  template: `
    <router-outlet />
    @if (authService.isModalOpen()) {
      <auth-modal />
    }
    <app-modal />
  `,
})
// export class Layout implements OnInit {
export class Layout {
  constructor(
    private router: Router,
    public authService: AuthService,
    private pwaService: PwaService,
  ) {}
  isHome: boolean = true;
  readonly house = House;

  ngOnInit(): void {
    this.pwaService.init();

    this.authService
      .getMe()
      .then((res) => {
        const user = res.data?.data as User | undefined;
        if (user) {
          this.authService.user.set(user);
        }
      })
      .catch((err: AxiosError<any>) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          this.authService.user.set(null);
        }
      });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
