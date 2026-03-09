import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'waiting-opponent',
  templateUrl: './waiting.component.html'
})
export class WaitingOpponent implements OnInit, OnDestroy {

  @Output() cancel = new EventEmitter<void>();

  seconds = 0;
  private interval!: any;

  ngOnInit() {
    this.interval = setInterval(() => {
      this.seconds++;
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  cancelSearch(){
    this.cancel.emit();
  }

  get formattedTime(){
    const m = Math.floor(this.seconds / 60).toString().padStart(2,'0');
    const s = (this.seconds % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

}