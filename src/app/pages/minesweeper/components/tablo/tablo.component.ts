import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";


@Component({
    selector: "tablo",
    templateUrl: "./tablo.component.html",
    styleUrl: "./tablo.component.scss"
})

export class Tablo implements OnChanges{
    @ViewChild('first') firstDigit!: ElementRef<HTMLDivElement>;
    @ViewChild('second') secondDigit!: ElementRef<HTMLDivElement>;
    @ViewChild('third') thirdDigit!: ElementRef<HTMLDivElement>;

    @Input() tabloNum!: number;

    ngOnChanges(changes: SimpleChanges): void {
        if(changes["tabloNum"]) {
            this.updateTablo();
        }
    }

    updateTablo(){
        const num = this.tabloNum.toString().padStart(3, "0");
        const []
          Array.from(num).forEach((digit, ind) => {
            if (!parents[ind]) return;
            const currentSet = new Set(digitSegments[digit]);
            parents[ind].childNodes.forEach((child) => {
              if (
                child?.classList &&
                [...child.classList].some((cls) => currentSet.has(cls.replace("seg-", "")))
              ) {
                child.classList.add("on");
              } else {
                if (child?.classList) {
                  child.classList.remove("on");
                }
              }
            });
          });
        console.log('i am useEffect killer: ' , this.tabloNum);
        
    }
}