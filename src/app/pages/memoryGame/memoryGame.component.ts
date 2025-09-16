import { Component } from '@angular/core';
import { images } from './constants/data';
import { LucideAngularModule, Settings, RotateCcw } from 'lucide-angular';

@Component({
    selector: 'memory-game',
    templateUrl: './memoryGame.component.html',
    styleUrl: './memoryGame.component.scss',
    imports: [LucideAngularModule]
})

export class MemoryGame {
    readonly SettingsIcon = Settings;
    readonly RotateIcon = RotateCcw;
    data = images
}