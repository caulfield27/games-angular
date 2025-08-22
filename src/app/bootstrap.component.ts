import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'bootstrap',
    imports: [RouterOutlet],
    template: `<router-outlet/>`
})

export class Bootstrap {}