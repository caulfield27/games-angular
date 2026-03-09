import { signal } from "@angular/core";

export class Player {
  public color;
  public name;
  constructor(color: 'black' | 'white', name: string) {
    this.color = color;
    this.name = signal(name);
  }
}
