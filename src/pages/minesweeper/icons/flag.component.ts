import { Component, Input } from "@angular/core";

@Component({
  selector: 'flag-icon',
  template: `<img [style.width]="width" src="/flag.png" alt="flag icon">`
})

export class FlagIcon{
  @Input() width!: string;
}
