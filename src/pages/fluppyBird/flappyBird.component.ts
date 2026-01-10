import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { PipePosition } from './types';

@Component({
  selector: 'flappy-bird',
  templateUrl: './flappyBird.component.html',
})
export class FlappyBird implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  ctx: null | CanvasRenderingContext2D = null;
  canvas: null | HTMLCanvasElement = null;
  readonly speed: number = 150;
  readonly jumpRange: number = 120;
  readonly pipeWidth: number = 130;
  readonly pipeGap: number = this.pipeWidth * 3;
  prevTimestamp: number = 0;
  x: number = 100;
  y: number = 300;
  prevY: number | null = null;
  prevJumpPoint: number | null = null;
  dir: 0 | 1 = 0;
  pipesPositions: PipePosition[] = [];

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    this.generatePipes();
    this.drawBird();
    // requestAnimationFrame((time: number) => this.move(time));
    window.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  private generatePipes() {
    if (!this.canvas) return;
    const { height, width } = this.canvas;
    const amount = width / (this.pipeWidth + this.pipeGap);

    for (let i = 0; i < amount; i++) {
      const randomTopPos = (Math.round(Math.random() * 6) || 1) * 10;
      const topHeight = (randomTopPos / 100) * height;
      const xDir =
        this.pipesPositions[i - 1]?.xDir - (this.pipeGap + this.pipeWidth) ||
        width - this.pipeWidth;
      this.pipesPositions.push({
        topHeight,
        bottomHeight: height - (topHeight + 0.1 * height),
        xDir,
      });
    }
    this.drawPipes();
  }

  private drawBird() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(this.x, this.y, 30, 30);
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 30, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'yellow';
    this.ctx.fill();

    if(this.prevY){
      this.ctx.clearRect(this.x, this.prevY, 50, 30);
    };
    this.prevY = this.y;
  }

  move(timeStamp: number) {
    const delta = (timeStamp - this.prevTimestamp) / 1000;
    this.prevTimestamp = timeStamp;

    if (this.dir === 0) {
      this.y += this.speed * delta;
    } else {
      if (
        this.prevJumpPoint !== null &&
        this.y <= this.prevJumpPoint! - this.jumpRange
      ) {
        this.prevJumpPoint = null;
        this.dir = 0;
      }
      this.y -= this.speed * delta;
    }

    if (this.y > (this.canvas?.height ?? 0) || this.y < 0) return;
    this.drawBird();

    requestAnimationFrame((time: number) => this.move(time));
  }

  handleKeyPress(e: KeyboardEvent) {
    if (e.key === ' ') {
      this.prevJumpPoint = this.y;
      this.dir = 1;
    }
  }

  drawPipes() {
    if (!this.ctx) return;
    for (let i = 0; i < this.pipesPositions.length; i++) {
      const { topHeight, bottomHeight, xDir } = this.pipesPositions[i];
      console.log(xDir, topHeight, bottomHeight);
      
      this.ctx.fillStyle = 'green';
      this.ctx.fillRect(xDir, 0, this.pipeWidth, topHeight);
      this.ctx.fillRect(xDir, bottomHeight, this.pipeWidth, bottomHeight);
    }
  }
}
