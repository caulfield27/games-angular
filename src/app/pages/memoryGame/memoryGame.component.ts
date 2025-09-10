import { Component } from '@angular/core';
import { images } from './constants/data';

@Component({
    selector: 'memory-game',
    templateUrl: './memoryGame.component.html',
    styleUrl: './memoryGame.component.scss'
})

export class MemoryGame {
    data = images
}