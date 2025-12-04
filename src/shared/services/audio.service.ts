import { effect, Injectable, Signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  sounds: Map<string, { audio: HTMLAudioElement; isFirstEffect: boolean }> =
    new Map();

  connect(key: string, audioPath: string, trigger?: Signal<unknown>) {
    const audio = new Audio(audioPath);
    this.sounds.set(key, { audio, isFirstEffect: true });

    if (trigger) {
      effect(() => {
        const sound = this.sounds.get(key);
        if (trigger() !== undefined) {
          if (sound?.isFirstEffect) {
            this.sounds.set(key, { audio, isFirstEffect: false });
          } else {
            this.play(key);
          }
        }
      });
    }
  }

  play(key: string) {
    const sound = this.sounds.get(key);
    if (sound?.audio) {
      sound.audio.play();
    }
  }

  pause(key: string) {
    const sound = this.sounds.get(key);
    if (sound?.audio) {
      sound.audio.pause();
    }
  }
}
