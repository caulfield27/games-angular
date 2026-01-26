export type Pipe = {
  topHeight: number;
  bottomHeight: number;
  xDir: number;
  prevX: number | null;
  id: number;
};

export type BirdType = 'yellow' | 'blue' | 'red';

export type Bird = {
  src: string;
  name: string;
  type: BirdType;
};