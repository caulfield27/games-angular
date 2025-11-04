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
  fieldMatrix: boolean[][];
  sessionId: null | string;
}

export interface IGameMetadata {
  myName: string;
  opName: string;
}

export interface IHittedFields {
  x: number;
  y: number;
  type: 'hit' | 'mis';
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

export type CheckMessageData = {
  type: sendMessageType.STATUS;
  data: {
    roomId: string;
    coordinates: ICoordinates;
    status?: 'hit' | 'miss' | 'lose' | 'destroy';
    range?: {
      range: number[] | null;
      isVertical: boolean;
    };
  };
};

export type GameFoundData = {
  name: string;
  sessionId: string;
};

export type FieldButton = {
  disabled: boolean;
  missed: boolean;
  hitted: boolean;
  gridColumn: string;
  gridRow: string;
};

export type StatusData = {
  status: 'hit' | 'miss' | 'lose' | 'destroy';
  coordinates: {
    x: number;
    y: number;
  };
  range: {
    range: number[];
    isVertical: boolean
  }
}

export interface IMessage{
  type: 'user' | 'opponent';
  content: string;
}

export type GameStatus = 'idle' | 'found' | 'start'