import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { LucideAngularModule, House } from 'lucide-angular';
import { handleAppBackground } from '@/shared/utils/utils';
import { SeoService } from '../shared/services/seo.service';
import { AuthModal } from '@/shared/components/authModal/authModal.component';
import { AuthService } from '@/shared/services/auth.service';

@Component({
  selector: 'bootstrap',
  imports: [RouterOutlet, LucideAngularModule, AuthModal],
  template: `
    @if (!isHome) {
      <button
        class="z-10 fixed top-3 left-3 flex flex-row gap-2 justify-center items-center p-3 rounded-xl bg-yellow-400 font-semibold text-[#464646] hover:bg-yellow-300"
        (click)="goHome()"
      >
        <lucide-icon [img]="house"></lucide-icon>
        Вернуться на главную
      </button>
    }
    <router-outlet />
    @if (authService.isModalOpen()) {
      <auth-modal />
    }
  `,
})
export class Bootstrap {
  constructor(
    private router: Router,
    private seoService: SeoService,
    public authService: AuthService,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const pathname = this.router.url;
        seoService.updateMetadata(pathname);
        handleAppBackground(
          this.router.url,
          (isHome) => (this.isHome = isHome),
        );
      });
  }
  isHome: boolean = true;
  readonly house = House;

  goHome() {
    this.router.navigate(['/']);
  }
}
