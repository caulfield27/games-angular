import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BirdState, Pipe } from './types';

@Component({
  selector: 'flappy-bird',
  templateUrl: './flappyBird.component.html',
})
export class FlappyBird implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  ctx: null | CanvasRenderingContext2D = null;
  canvas: null | HTMLCanvasElement = null;
  bird: HTMLImageElement = new Image();
  readonly birdFallSpeed: number = 150;
  readonly birdJumpSpeed: number = 250;
  readonly pipeSpeed: number = 100;
  readonly jumpRange: number = 65;
  readonly pipeWidth: number = 100;
  readonly pipeGap: number = this.pipeWidth * 2.5;
  rotateAngle = 45;
  prevBirdTimestamp: number = 0;
  prevPipeTimestamp: number = 0;
  birdX: number = 100;
  birdY: number = 200;
  prevBirdY: number | null = null;
  prevJumpPoint: number | null = null;
  birdState: BirdState = BirdState.FALL;
  pipes: Pipe[] = [];

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    this.bird.src = '/bird.png';

    this.generatePipes();

    // requestAnimationFrame((time: number) => this.movePipes(time));
    requestAnimationFrame((time: number) => this.moveBird(time));
    window.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  private generatePipes() {
    if (!this.canvas) return;
    const { height, width } = this.canvas;
    const amount = width / (this.pipeWidth + this.pipeGap);

    for (let i = 0; i < amount; i++) {
      this.pipes.push(this.getPipePosition(width, height, i, true));
    }
  }

  private getPipePosition(
    width: number,
    height: number,
    idx: number,
    isFirstGenerate: boolean
  ): Pipe {
    const randomTopPos = (Math.round(Math.random() * 5) || 1) * 10;
    const topHeight = (randomTopPos / 100) * height;
    const xDir = !isFirstGenerate
      ? width
      : this.pipes[idx - 1]?.xDir - (this.pipeGap + this.pipeWidth) || width;
    return {
      topHeight,
      bottomHeight: height - (topHeight + 0.25 * height),
      xDir,
      prevX: null,
    };
  }

  private drawBird() {
    if (!this.ctx) return;

    const angle = this.getBirdRotation();
    const cx = this.birdX+this.bird.width / 2;
    const cy = this.birdY+this.bird.height / 2;

    this.ctx.save();

    this.ctx.translate(cx,cy);
    this.ctx.rotate(angle);

    this.ctx.drawImage(this.bird, this.birdX, this.birdY);
     
    this.ctx.restore();
    
    this.prevBirdY = this.birdY;
  }

  private moveBird(timeStamp: number) {
    const delta = (timeStamp - this.prevBirdTimestamp) / 1000;
    this.prevBirdTimestamp = timeStamp;
    const speed =
      this.birdState === BirdState.FALL
        ? this.birdFallSpeed
        : this.birdJumpSpeed;
    if (this.birdState == BirdState.FALL) {
      this.birdY += speed * delta;
    } else {
      if (
        this.prevJumpPoint !== null &&
        this.birdY <= this.prevJumpPoint! - this.jumpRange
      ) {
        this.prevJumpPoint = null;
        this.birdState = BirdState.FALL;
      }
      this.birdY -= speed * delta;
    }

    if (this.birdY > (this.canvas?.height ?? 0) || this.birdY < 0) return;

    if (this.prevBirdY) {
      this.clearBird(this.prevBirdY);
    }

    this.drawBird();

    requestAnimationFrame((time: number) => this.moveBird(time));
  }

  private handleKeyPress(e: KeyboardEvent) {
    if (e.key === ' ') {
      this.prevJumpPoint = this.birdY;
      this.birdState = BirdState.JUMP;
    }
  }

  private movePipes(timeStamp: number) {
    if (!this.ctx) return;

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
      // this.clearPipe(last.xDir, last.topHeight, last.bottomHeight);
      this.pipes[this.pipes.length - 1] = this.getPipePosition(
        this.canvas!.width,
        this.canvas!.height,
        this.pipes.length - 1,
        false
      );
      this.pipes.unshift(this.pipes.pop()!);
    }
    requestAnimationFrame((time: number) => this.movePipes(time));
  }

  private drawPipe(idx: number) {
    if (!this.ctx) return;
    const { height } = this.canvas!;
    const pipe = this.pipes[idx];
    const { topHeight, bottomHeight, xDir } = pipe;
    const bottomY = topHeight + (height - (topHeight + bottomHeight));

    this.ctx.fillStyle = '#A3C65C';
    this.ctx.fillRect(xDir, 0, this.pipeWidth, topHeight);
    this.ctx.fillRect(xDir, bottomY, this.pipeWidth, bottomHeight);

    this.ctx.lineWidth = 6;
    this.ctx.strokeStyle = '#749E3A';
    this.ctx.strokeRect(xDir, 0, this.pipeWidth, topHeight);
    this.ctx.strokeRect(xDir, bottomY, this.pipeWidth, bottomHeight);

    pipe.prevX = xDir;
  }

  private clearPipe(x: number, topH: number, bottomH: number) {
    if (!this.ctx) return;
    const { height } = this.canvas!;
    const bottomY = topH + (height - (topH + bottomH));
    this.ctx.clearRect(x - 6, 0, this.pipeWidth + 12, topH + 6);
    this.ctx.clearRect(x - 6, bottomY - 6, this.pipeWidth + 12, bottomH + 6);
  }

  private clearBird(y: number) {
    if (!this.ctx) return;
    // this.ctx.clearRect(this.birdX, y, this.bird.width, this.bird.height);
    this.ctx.clearRect(0,0,this.canvas!.width,this.canvas!.height);
  }

  private getBirdRotation(): number {
    if (this.birdState === BirdState.JUMP) {
      return -0.35; // вверх (~ -20°)
    }
    return 0.5; // вниз (~ +30°)
  }
}
