import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PAGES_METADATA } from './shared/constants/constants';
import { LucideAngularModule, House } from 'lucide-angular';

@Component({
  selector: 'bootstrap',
  imports: [RouterOutlet, LucideAngularModule],
  template: `
    @if (!isHome) {<button
      class="z-10 fixed top-3 left-3 flex flex-row gap-2 justify-center items-center p-3 rounded-xl bg-yellow-400 font-semibold text-[#464646] hover:bg-yellow-300"
      (click)="goHome()"
    >
      <lucide-icon [img]="house"></lucide-icon>
      Вернуться на главную</button
    >}
    <router-outlet />
  `,
})
export class Bootstrap {
  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const pathname = this.router.url;
        const curPageBackground = PAGES_METADATA[pathname]?.background_url_path;
        document.body.style.backgroundImage = curPageBackground
          ? `url(${curPageBackground})`
          : '';

        if (pathname === '/') {
          this.isHome = true;
          document.body.style.backgroundColor = '#EEF4F7';
        } else {
          this.isHome = false;
          document.body.style.backgroundColor = '';
        }
      });
  }
  isHome: boolean = true;
  readonly house = House;

  goHome() {
    this.router.navigate(['/']);
  }
}
