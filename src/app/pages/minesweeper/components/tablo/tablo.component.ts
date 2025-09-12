import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { digitSegments } from '../../constants';

@Component({
  selector: 'tablo',
  templateUrl: './tablo.component.html',
  styleUrl: './tablo.component.scss',
})
export class Tablo implements OnChanges, AfterViewInit {
  @ViewChild('first') firstDigit!: ElementRef<HTMLDivElement>;
  @ViewChild('second') secondDigit!: ElementRef<HTMLDivElement>;
  @ViewChild('third') thirdDigit!: ElementRef<HTMLDivElement>;

  @Input() tabloNum!: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['tabloNum'] &&
      [this.firstDigit, this.secondDigit, this.thirdDigit].every((elem) => elem)
    ) {
      this.updateTablo();
    }
  }

  ngAfterViewInit(): void {
    this.updateTablo();
  }

  updateTablo() {
    const num = this.tabloNum.toString().padStart(3, '0');
    const parents = [this.firstDigit, this.secondDigit, this.thirdDigit];

    Array.from(num).forEach((digit, ind) => {
      if (!parents[ind]) return;
      const currentSegment = digitSegments[digit];
      Array.from(
        parents[ind].nativeElement.children as HTMLCollectionOf<HTMLElement>
      ).forEach((child) => {
        if (
          child?.classList &&
          [...child.classList].some((cls) =>
            currentSegment.includes(cls.replace('seg-', ''))
          )
        ) {    
          child.classList.add('on');
        } else {
          if (child?.classList) {
            child.classList.remove('on');
          }
        }
      });
    });
  }
}
