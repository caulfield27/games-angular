export enum Direction{
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}

export type Position = 'left' | 'right' | 'up' | 'down';

export interface ICoordinates{
  x: number | number[];
  y: number | number[];
}

export interface ISessionData {
  myName: string;
  opponentName: string;
  fieldMatrix: boolean[][];
  sessionId: null | string;
}

export interface IShip{
  direction: Direction | null;
  coordinates: ICoordinates;
}