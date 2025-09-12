import { Component } from '@angular/core';

@Component({
  selector: 'sad-smile',
  template: `<svg width="80" height="80" viewBox="0 0 100 100">
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="yellow"
      stroke="black"
      stroke-width="3"
    />
    <line x1="25" y1="30" x2="35" y2="40" stroke="black" stroke-width="3" />
    <line x1="35" y1="30" x2="25" y2="40" stroke="black" stroke-width="3" />
    <line x1="65" y1="30" x2="75" y2="40" stroke="black" stroke-width="3" />
    <line x1="75" y1="30" x2="65" y2="40" stroke="black" stroke-width="3" />
    <path
      d="M30 75 Q50 55, 70 75"
      stroke="black"
      stroke-width="3"
      fill="none"
    />
  </svg>`,
})
export class SadSmile {}
