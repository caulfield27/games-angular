import { Component } from '@angular/core';

@Component({
  selector: 'happy-smile',
  template: `<svg width="80" height="80" viewBox="0 0 100 100">
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="yellow"
      stroke="black"
      stroke-width="3"
    />
    <rect x="20" y="30" width="20" height="10" fill="black" />
    <rect x="60" y="30" width="20" height="10" fill="black" />
    <line x1="40" y1="35" x2="60" y2="35" stroke="black" stroke-width="3" />
    <path
      d="M30 65 Q50 85, 70 65"
      stroke="black"
      stroke-width="3"
      fill="none"
    />
  </svg>`,
  styles: `
  @media screen and (max-width: 480px) {
    svg{
      width: 60px;
      height: 60px;
    }
  }

  @media screen and (max-width: 380px) {
    svg{
      width: 40px;
      height: 40px;
    }
  }
  `,
})
export class HappySmile {}
