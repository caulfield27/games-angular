import { Component, Input } from "@angular/core";

@Component({
  selector: 'mine-icon',
  template: `<img [style.width]="width" src="/naval-mine.svg" alt="mine">`
})

export class MineIcon{
  @Input() width!: string;
}
