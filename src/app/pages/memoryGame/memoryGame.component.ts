import { Component } from '@angular/core';
import { LucideAngularModule, Settings, RotateCcw } from 'lucide-angular';
import { GameService } from './services/memoryGame.service';
import { NgClass } from '@angular/common';
import Swal from 'sweetalert2';
import { ISettings } from './types/types';

@Component({
  selector: 'memory-game',
  templateUrl: './memoryGame.component.html',
  styleUrl: './memoryGame.component.scss',
  imports: [LucideAngularModule, NgClass],
})
export class MemoryGame {
  readonly SettingsIcon = Settings;
  readonly RotateIcon = RotateCcw;

  settings: ISettings | null = null;

  constructor(public game: GameService) {}

  handleSettings() {
    Swal.fire({
      title: 'Настройки',
      html: `
    <div class="settings_container">  
         <div class="setting_wrap">
            <span>Время</span>
            <div class="timer_inputs">
              <label for="min">м</label>
              <input id="min" type="number" min="0" max="10"/>
              <label for="sec">с</label>
              <input id="sec" type="number" min="0" max="59"/>
            </div>
        </div>
        <div class="setting_wrap">
            <span>количество</span>
            <select name="quantity" id="quantity">
                <option value="10">10</option>
                <option value="16">16</option>
                <option value="20">20</option>
                <option value="32">32</option>
            </select>
        </div>
        <div class="setting_wrap">
            <span>тема</span>
            <select name="category" id="category">
                <option value="humo">хумо</option>
                <option value="cars">машины</option>
            </select>
        </div>
    </div>
    `,
      showCancelButton: true,
      cancelButtonText: 'Отмена',
      confirmButtonText: 'Сохранить',
      preConfirm: () => {
        const minutes = document.getElementById('min') as HTMLInputElement;
        const seconds = document.getElementById('sec') as HTMLInputElement;
        const quantity = document.getElementById(
          'quantity'
        ) as HTMLInputElement;
        const category = document.getElementById(
          'category'
        ) as HTMLInputElement;
        const validMinutes = +minutes.value;
        const validSeconds = +seconds.value;
        this.settings = {
          timer: {
            minutes: validMinutes < 0 ? 0 : validMinutes,
            seconds: validSeconds < 0 ? 30 : validSeconds,
          },
          quantity: quantity.value,
          category: category.value,
        };
      },
    }).then((res) => {
      if (res?.isConfirmed) {
        localStorage.setItem('settings', JSON.stringify(this.settings));
      }
    });
  }
}
