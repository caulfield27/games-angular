import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { PAGES_METADATA } from '../constants/constants';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(private title: Title, private meta: Meta) {}

  public updateMetadata(pathname: string) {
    const pageMetadata = PAGES_METADATA[pathname];

    pageMetadata?.title && this.title.setTitle(pageMetadata.title);
    pageMetadata?.description &&
      this.meta.updateTag({
        name: 'description',
        content: pageMetadata.description,
      });
    pageMetadata?.keywords &&
      this.meta.updateTag({ name: 'keywords', content: pageMetadata.keywords });
    pageMetadata?.icoPath && this.updateFavicon(pageMetadata.icoPath);
  }

  private updateFavicon(icoPath: string) {
    const link: HTMLLinkElement =
      document.querySelector("link[rel*='icon']") ||
      document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = icoPath;
    document.head.appendChild(link);
  }
}
