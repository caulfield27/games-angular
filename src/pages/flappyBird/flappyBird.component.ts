import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Pipe } from './types';
import { defaultPipe } from './constants';

@Component({
  selector: 'flappy-bird',
  templateUrl: './flappyBird.component.html',
})
export class FlappyBird implements AfterViewInit {
  // dom
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  ctx: null | CanvasRenderingContext2D = null;
  canvas: null | HTMLCanvasElement = null;
  container: null | HTMLDivElement = null;

  // images
  bird: HTMLImageElement = new Image();
  pipe: HTMLImageElement = new Image();

  // constants
  readonly birdFallSpeed: number = 4;
  readonly pipeSpeed: number = 100;
  readonly landHeight: number = 112;

  // variables
  keyupListener: ((e: KeyboardEvent) => void) | null = null;
  clickListener: (() => void) | null = null;
  isCollisioned: boolean = false;
  pipeWidth: number | null = null;
  pipeGap: number | null = null;
  prevBirdTimestamp: number = 0;
  prevPipeTimestamp: number = 0;
  birdX: number = 50;
  birdY: number = 0;
  prevBirdY: number | null = null;
  prevJumpPoint: number | null = null;
  pipes: Pipe[] = [];
  speedY = 0;
  gravity = 1200;
  jumpImpulse = -350;
  collisionedPipeIndex: number | null = null;

  // methods
  ngAfterViewInit(): void {
    this.init();
  }

  private generatePipes() {
    if (!this.canvas || !this.pipeWidth || !this.pipeGap) return;
    const { height, width } = this.canvas;
    const amount = width / (this.pipeWidth + this.pipeGap);

    for (let i = 0; i < amount; i++) {
      this.pipes.push(this.getPipePosition(width, height, i, true));
    }
  }

  private init() {
    this.container = this.containerRef.nativeElement;
    this.canvas = this.canvasRef.nativeElement;
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    this.ctx = this.canvas.getContext('2d');
    this.bird.src = '/flappyBird/yellowbird.png';
    this.pipe.src = '/flappyBird/pipe-red.png';

    this.pipe.onload = () => {
      this.pipeWidth = this.pipe.width;
      this.pipeGap = this.pipeWidth * 2.5;
      this.generatePipes();
      requestAnimationFrame((time: number) => this.movePipes(time));
    };

    requestAnimationFrame((time: number) => this.moveBird(time));
    this.drawBird();
    this.keyupListener = (e) => this.handleKeyPress(e);
    this.clickListener = () => this.jump();
    window.addEventListener('keyup', this.keyupListener);
    window.addEventListener('click', this.clickListener);
  }

  private getPipePosition(
    width: number,
    height: number,
    idx: number,
    isFirstGenerate: boolean,
  ): Pipe {
    if (!this.pipeGap || !this.pipeWidth) return defaultPipe;

    height = height - this.landHeight;
    const randomTopPos = (Math.round(Math.random() * 6) || 1) * 10;
    const topHeight = (randomTopPos / 100) * height;
    const bottomHeight = height - (topHeight + 0.25 * height);
    let xDir;
    if (!isFirstGenerate) {
      const before = this.pipes[0];
      const dif = width - before.xDir;
      if (dif < this.pipeGap) {
        xDir = before.xDir + this.pipeWidth + this.pipeGap;
      } else {
        xDir = width;
      }
    } else {
      xDir =
        this.pipes[idx - 1]?.xDir - (this.pipeGap + this.pipeWidth) ||
        width + width / 2;
    }

    return {
      topHeight,
      bottomHeight,
      xDir,
      prevX: null,
    };
  }

  private drawBird() {
    if (!this.ctx) return;
    const angle = this.getBirdRotation();
    const w = this.bird.width;
    const h = this.bird.height;

    const cx = this.birdX + w / 2;
    const cy = this.birdY + h / 2;

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(angle);

    this.ctx.drawImage(this.bird, -w / 2, -h / 2);

    this.ctx.restore();
    this.prevBirdY = this.birdY;
  }

  private moveBird(timeStamp: number) {
    const delta = (timeStamp - this.prevBirdTimestamp) / 1000;
    this.prevBirdTimestamp = timeStamp;
    this.speedY += this.gravity * delta;
    this.birdY += this.speedY * delta;

    const height = this.canvas?.height ?? 0;
    const realH = height - this.landHeight;
    if (this.birdY + this.bird.height / 2 >= realH) {
      this.failed();
      return;
    }

    if (this.prevBirdY) {
      this.clearBird(this.prevBirdY);

      if (this.isCollisioned) {
        this.drawPipe(this.collisionedPipeIndex!);
      };
    }

    if (!this.isCollisioned && this.pipes.length) {
      this.isCollisioned = this.checkCollisions();

      if (this.isCollisioned) {
        this.failed();
      }
    }

    this.drawBird();
    requestAnimationFrame((time: number) => this.moveBird(time));
  }

  private handleKeyPress(e: KeyboardEvent) {
    if (e.key === ' ') {
      this.jump();
    }
  }

  private jump() {
    this.speedY = this.jumpImpulse;
  }

  private movePipes(timeStamp: number) {
    if (!this.ctx || !this.pipeWidth) return;

    const delta = (timeStamp - this.prevPipeTimestamp) / 1000;
    this.prevPipeTimestamp = timeStamp;

    for (let i = 0; i < this.pipes.length; i++) {
      const pipe = this.pipes[i];
      pipe.xDir -= this.pipeSpeed * delta;
      if (pipe.prevX) {
        this.clearPipe(pipe.prevX, pipe.topHeight, pipe.bottomHeight);
      }
      this.drawPipe(i);
    }

    const last = this.pipes[this.pipes.length - 1];
    if (last.xDir + this.pipeWidth < 0) {
      this.pipes[this.pipes.length - 1] = this.getPipePosition(
        this.canvas!.width,
        this.canvas!.height,
        this.pipes.length - 1,
        false,
      );
      this.pipes.unshift(this.pipes.pop()!);
    }

    if (this.isCollisioned) return;
    requestAnimationFrame((time: number) => this.movePipes(time));
  }

  private drawPipe(idx: number) {
    if (!this.ctx || !this.pipeWidth) return;
    const { height } = this.canvas!;
    const realHeight = height - this.landHeight;

    const currentPipe = this.pipes[idx];
    const { topHeight, bottomHeight, xDir } = currentPipe;
    const bottomY = topHeight + (realHeight - (topHeight + bottomHeight));

    const centerX = xDir + this.pipeWidth / 2;
    const centerY = topHeight / 2;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(Math.PI);
    this.ctx.drawImage(
      this.pipe,
      -this.pipeWidth / 2,
      -topHeight / 2,
      this.pipeWidth,
      topHeight,
    );
    this.ctx.restore();
    this.ctx.drawImage(this.pipe, xDir, bottomY, this.pipeWidth, bottomHeight);

    currentPipe.prevX = xDir;
  }

  private clearPipe(x: number, topH: number, bottomH: number) {
    if (!this.ctx || !this.pipeWidth) return;
    const { height } = this.canvas!;
    const realH = height - this.landHeight;
    const bottomY = topH + (realH - (topH + bottomH));
    this.ctx.clearRect(x - 6, 0, this.pipeWidth + 12, topH + 6);
    this.ctx.clearRect(x - 6, bottomY - 6, this.pipeWidth + 12, bottomH + 6);
  }

  private clearBird(y: number) {
    if (!this.ctx) return;
    const angle = this.getBirdRotation();
    const w = this.bird.width;
    const h = this.bird.height;

    const cx = this.birdX + w / 2;
    const cy = y + h / 2;

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(angle);

    const realH = angle < 0 ? h + 16 : h + 5;
    this.ctx.clearRect(-w / 2 - 5, -h / 2 - 5, w + 5, realH);

    this.ctx.restore();
  }

  private getBirdRotation(): number {
    const angle = this.speedY * 0.0015;

    return Math.max(-0.35, Math.min(angle, 1.5));
  }

  private checkCollisions() {
    const realBirdX = this.birdX + this.bird.width;
    return this.pipes.some((pipe, idx) => {
      if (!this.pipeWidth || !this.pipeGap || !this.canvas) return;
      const {height} = this.canvas;
      const { xDir, topHeight, bottomHeight } = pipe;
      const gap = height - (topHeight+bottomHeight);
      if (
        xDir <= realBirdX &&
        xDir + this.pipeWidth >= this.birdX &&
        (this.birdY <= topHeight || this.birdY >= (topHeight + gap))
      ) {
        this.collisionedPipeIndex = idx;
        return true;
      }
      return false;
    });
  }

  private failed() {
    this.isCollisioned = true;
    if (this.clickListener && this.keyupListener) {
      window.removeEventListener('keyup', this.keyupListener);
      window.removeEventListener('click', this.clickListener);
    }
  }
}
