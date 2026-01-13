export type Pipe = {
  topHeight: number;
  bottomHeight: number;
  xDir: number;
  prevX: number | null;
};

export enum BirdState {
  FALL = 0,
  JUMP = 1,
}
