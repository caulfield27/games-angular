export enum Direction {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export type Position = 'left' | 'right' | 'up' | 'down';

export interface ICoordinates {
  x: number | number[];
  y: number | number[];
}

export interface ISessionData {
  myName: string;
  opponentName: string;
  fieldMatrix: boolean[][];
  sessionId: null | string;
}

export interface IShip {
  direction: Direction | null;
  coordinates: ICoordinates;
  size: number;
}

export type WsState =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'closing'
  | 'closed'
  | 'error';
export interface IWsMessagePattern {
  type: sendMessageType;
  data: unknown;
}

export interface IWsIncomeMessage {
  type: incomneMessageType;
  data: unknown;
}

export enum sendMessageType {
  INIT = 'init',
  SELECTION = 'selection',
  CLOSE_ROOM = 'closeRoom',
  CHECK = 'check',
  STATUS = 'status',
  INVITE = 'invite',
  READY = 'ready',
  MESSAGE = 'message',
}

export enum incomneMessageType {
  ACTIVE_USERS_COUNT = 'activeUsersCount',
  GAME_FOUND = 'gameFound',
  TURN = 'turn',
  ROOM_CLOSED = 'roomClosed',
  CHECK = 'check',
  STATUS = 'status',
  LOSE = 'lose',
  READY = 'ready',
  GAME_START = 'gameStart',
  MESSAGE = 'message',
}
