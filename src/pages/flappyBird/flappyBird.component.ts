import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Bird, BirdType, Pipe } from './types';
import { defaultPipe } from './constants';
import { NgClass, NgStyle } from '@angular/common';
import { LucideAngularModule, Play, Sun, Moon, View } from 'lucide-angular';
import Swal from 'sweetalert2';
import { launchConfetti } from '@/shared/utils/utils';

@Component({
  selector: 'flappy-bird',
  templateUrl: './flappyBird.component.html',
  imports: [NgStyle, NgClass, LucideAngularModule],
})
export class FlappyBird implements AfterViewInit, OnDestroy {
  // dom
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  ctx: null | CanvasRenderingContext2D = null;
  canvas: null | HTMLCanvasElement = null;
  container: null | HTMLDivElement = null;

  // lucide icons
  readonly PlayIcon = Play;
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;

  // images
  bird: HTMLImageElement = new Image();
  pipe: HTMLImageElement = new Image();

  // audio
  dieSound: HTMLAudioElement | null = null;
  hitSound: HTMLAudioElement | null = null;
  pointSound: HTMLAudioElement | null = null;
  wingSound: HTMLAudioElement | null = null;

  // constants
  readonly isMobile = window.innerWidth < 768;
  readonly birdFallSpeed: number = 4;
  readonly pipeSpeed: number = 100;
  readonly landHeight: number = 112;
  readonly jumpImpulse: number = -350;
  readonly gravity: number = 1200;
  readonly birds: Bird[] = [
    {
      name: 'Sunny',
      src: '/flappyBird/yellowbird.png',
      type: 'yellow',
    },
    {
      name: 'Sky',
      src: '/flappyBird/bluebird.png',
      type: 'blue',
    },
    {
      name: 'Ruby',
      src: '/flappyBird/redbird.png',
      type: 'red',
    },
  ];

  // variables
  scores: string[] = ['0'];
  currentBestScore = Number(localStorage.getItem('fb-best-score')) || 0;
  selectedBird: BirdType = this.birds[0].type;
  selectedBackground: 'day' | 'night' = 'day';
  isCollisioned: boolean = false;
  pipeWidth: number | null = null;
  pipeGap: number | null = null;
  prevBirdTimestamp: number = 0;
  prevPipeTimestamp: number = 0;
  birdX: number = 100;
  birdY: number = 0;
  prevBirdY: number | null = null;
  prevJumpPoint: number | null = null;
  pipes: Pipe[] = [];
  speedY: number = 0;
  collisionedPipeIndex: number | null = null;
  score: number = 0;
  prevPipeId: number | null = null;
  isGameStart: boolean = false;

  // methods
  ngAfterViewInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.reset();
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
    this.birdY = (this.canvas.height - this.landHeight) / 2;
    this.dieSound = new Audio('/flappyBird/die.wav');
    this.hitSound = new Audio('/flappyBird/hit.wav');
    this.pointSound = new Audio('/flappyBird/point.wav');
    this.wingSound = new Audio('/flappyBird/wing.wav');

    this.bird.src = this.birds[0].src;
    this.pipe.src =
      this.selectedBackground === 'day'
        ? '/flappyBird/pipe-green.png'
        : '/flappyBird/pipe-green.png';

    this.pipe.onload = () => {
      if (!this.pipeWidth) {
        this.pipeWidth = this.pipe.width;
        this.pipeGap = this.pipeWidth * 2.5;
        this.generatePipes();
      }
    };

    this.bird.onload = () => {
      this.drawBird();
    };

    window.onkeyup = (e) => this.handleKeyPress(e);
  }

  public reset() {
    if (!this.canvas) return;

    this.ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height);

    window.onclick = null;

    this.isGameStart = false;
    this.isCollisioned = false;
    this.birdY = (this.canvas.height - this.landHeight) / 2;
    this.score = 0;
    this.prevPipeId = null;
    this.collisionedPipeIndex = null;
    this.speedY = 0;
    this.pipes = [];
    this.prevBirdTimestamp = 0;
    this.prevPipeTimestamp = 0;
    this.generatePipes();
  }

  public startGame() {
    if (!this.pipeWidth || this.isGameStart) return;
    requestAnimationFrame((time: number) => this.movePipes(time));
    requestAnimationFrame((time: number) => this.moveBird(time));
    window.onclick = () => this.jump(false);
  }

  public changeBackground(bg: 'day' | 'night') {
    this.selectedBackground = bg;
    this.pipe.src =
      bg === 'day' ? '/flappyBird/pipe-green.png' : '/flappyBird/pipe-red.png';
  }

  public selectBird(birdType: BirdType) {
    this.selectedBird = birdType;
    const bird = this.birds.find((bird) => bird.type === birdType);
    if (bird) {
      this.bird.src = bird.src;
    }
  }

  private getPipePosition(
    width: number,
    height: number,
    idx: number,
    isFirstGenerate: boolean,
    id?: number,
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
        width * 2;
    }

    return {
      topHeight,
      bottomHeight,
      xDir,
      prevX: null,
      id: id ?? idx + 1,
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
    if (!this.isGameStart) return;
    if (!this.prevBirdTimestamp) {
      this.prevBirdTimestamp = timeStamp;
      requestAnimationFrame((time: number) => this.moveBird(time));
      return;
    }

    const delta = (timeStamp - this.prevBirdTimestamp) / 1000;
    this.prevBirdTimestamp = timeStamp;
    this.speedY += this.gravity * delta;
    this.birdY += this.speedY * delta;

    const height = this.canvas?.height ?? 0;
    const realH = height - this.landHeight;
    if (this.birdY + this.bird.height / 2 >= realH) {
      this.failed(true);
      return;
    }

    if (this.prevBirdY) {
      this.clearBird(this.prevBirdY);

      if (this.isCollisioned) {
        this.drawPipe(this.collisionedPipeIndex!);
      }
    }

    if (!this.isCollisioned && this.pipes.length) {
      this.isCollisioned = this.checkCollisions();

      if (this.isCollisioned) {
        this.failed(false);
      }
    }

    this.drawBird();
    requestAnimationFrame((time: number) => this.moveBird(time));
  }

  private handleKeyPress(e: KeyboardEvent) {
    if (e.key === ' ') {
      this.jump(true);
    }
  }

  private jump(isSpace: boolean) {
    if (!this.isGameStart) {
      isSpace && this.startGame();
      this.isGameStart = true;
    }

    this.wingSound?.play();
    this.speedY = this.jumpImpulse;
  }

  private movePipes(timeStamp: number) {
    if (!this.ctx || !this.pipeWidth) return;
    if (!this.prevPipeTimestamp) {
      this.prevPipeTimestamp = timeStamp;
      requestAnimationFrame((ts: number) => this.movePipes(ts));
      return;
    }

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

    this.checkProgress(last.xDir + this.pipeWidth, last.id);

    if (last.xDir + this.pipeWidth < 0) {
      this.pipes[this.pipes.length - 1] = this.getPipePosition(
        this.canvas!.width,
        this.canvas!.height,
        this.pipes.length - 1,
        false,
        last.id,
      );
      this.pipes.unshift(this.pipes.pop()!);
    }

    if (this.isCollisioned || !this.isGameStart) return;
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
      const { height } = this.canvas;
      const { xDir, topHeight, bottomHeight } = pipe;

      if (
        xDir <= realBirdX &&
        xDir + this.pipeWidth >= this.birdX &&
        (this.birdY <= topHeight ||
          this.birdY+(this.bird.height/2) >= height - (bottomHeight + this.landHeight))
      ) {
        this.collisionedPipeIndex = idx;
        return true;
      }
      return false;
    });
  }

  private checkProgress(pipeX: number, id: number) {
    if (pipeX < this.birdX && id !== this.prevPipeId) {
      this.pointSound?.play();
      this.score++;
      this.scores = String(this.score).split('');
      this.prevPipeId = id; 
    }
  }

  private failed(isOver: boolean) {
    if (!this.isCollisioned) {
      this.isCollisioned = true;
    }

    this.hitSound?.play();
    window.onkeyup = null;
    window.onclick = null;

    if (isOver) {
      this.dieSound?.play();
      setTimeout(() => {
        if (this.score > this.currentBestScore) {
          this.currentBestScore = this.score;
          localStorage.setItem('fb-best-score', String(this.currentBestScore));
          launchConfetti(1000);
          Swal.fire({
            icon: 'success',
            title: 'Вы побили свой рекорд',
            text: `Ваш новый рекорд: ${this.currentBestScore}`,
          }).then(() => this.reset());
        } else {
          Swal.fire({
            title: 'Игра окончена!',
            text: `Ваш счёт: ${this.score}, текущий рекорд: ${this.currentBestScore}`,
          }).then(() => this.reset());
        }
      }, 500);
    }else{
      this.speedY = this.jumpImpulse;
    }
  }

}
