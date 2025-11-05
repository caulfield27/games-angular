import { Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CheckMessageData,
  Direction,
  FieldButton,
  GameFoundData,
  GameStatus,
  ICoordinates,
  IGameMetadata,
  IHittedFields,
  incomneMessageType,
  ISessionData,
  IShip,
  IWsIncomeMessage,
  IWsMessagePattern,
  Position,
  sendMessageType,
  StatusData,
} from '../types/types';
import Swal from 'sweetalert2';
import { launchConfetti } from '@/app/shared/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class BattleshipService {
  // contructor
  constructor(private route: ActivatedRoute, private router: Router) {}
  // states
  private audio: HTMLAudioElement | null = null;
  private directions: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  private initialMatrix: boolean[][] = [];
  private directionsHash: Record<string, number[]> = {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    2: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    3: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    5: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    6: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    7: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    8: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    9: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  };
  selectionLoading = signal<boolean>(false);
  turn = signal<number>(1);
  shotPending: boolean = false;
  isReady = signal<boolean>(false);
  isOpponentReady = signal<boolean>(false);
  gameStatus = signal<GameStatus>('idle');
  gameSessionData: ISessionData = {
    fieldMatrix: [
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false, false],
    ],
    sessionId: null,
  };
  gameMetadata = signal<IGameMetadata>({
    myName: 'me',
    opName: '',
  });
  ships = signal<IShip[]>([]);
  hittedFields = signal<IHittedFields[]>([]);
  activeUsers = signal<number>(0);
  buttons = signal<FieldButton[]>([]);
  isChatOpen = signal<boolean>(false);
  notifications = signal<number>(0);

  // methods

  public getShips(): IShip[] {
    const sizeMap: Record<string, number> = {
      1: 4,
      2: 3,
      3: 2,
      4: 1,
    };
    const ships = [];
    for (let i = 1; i < 5; i++) {
      for (let j = 0; j < sizeMap[i]; j++) {
        try {
          const ship = this.randomlyArrangeShip(i);
          if (ship) ships.push(ship);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return ships;
  }

  public reset() {
    this.gameStatus.set('idle');
    this.isReady.set(false);
    this.isOpponentReady.set(false);
    this.gameSessionData = {
      fieldMatrix: [
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false, false],
      ],
      sessionId: null,
    };
    this.directions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.directionsHash = {
      0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      2: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      3: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      5: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      6: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      7: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      8: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      9: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    };
    this.ships.set(this.getShips());
    this.hittedFields.set([]);
    this.gameMetadata.set({
      myName: 'me',
      opName: '',
    });
    this.shotPending = false;
  }

  private randomlyArrangeShip(shipSize: number): IShip | void {
    if (shipSize === 1) {
      const y =
        this.directions[Math.floor(Math.random() * this.directions.length)];
      const xDirections = this.directionsHash[y];
      const x = xDirections[Math.floor(Math.random() * xDirections.length)];

      this.gameSessionData.fieldMatrix[y][x] = true;
      this.directionsHash[y] = this.filterDirections(
        [x, x + 1, x - 1],
        this.directionsHash[y]
      );

      if (this.directionsHash[y - 1]) {
        this.directionsHash[y - 1] = this.filterDirections(
          [x, x - 1, x + 1],
          this.directionsHash[y - 1]
        );
      }

      if (this.directionsHash[y + 1]) {
        this.directionsHash[y + 1] = this.filterDirections(
          [x, x - 1, x + 1],
          this.directionsHash[y + 1]
        );
      }

      return {
        coordinates: {
          x,
          y,
        },
        direction: null,
        size: shipSize,
      };
    } else {
      let isArranged = false;
      let tryAttempt = 0;
      while (!isArranged) {
        if (tryAttempt > 1000000) {
          throw new Error('Не удалось расположить корабли');
        }

        const y =
          this.directions[Math.floor(Math.random() * this.directions.length)];
        const xDirections = this.directionsHash[y];
        const x = xDirections[Math.floor(Math.random() * xDirections.length)];

        isArranged = this.isFieldsAvailable(x, y, shipSize, 'right');

        if (isArranged) {
          const end = this.horizontalyArrangeShipToMatrix(
            y,
            x,
            'right',
            shipSize
          );
          return {
            direction: Direction.HORIZONTAL,
            coordinates: {
              x: [x, end],
              y,
            },
            size: shipSize,
          };
        }

        isArranged = this.isFieldsAvailable(x, y, shipSize, 'left');

        if (isArranged) {
          const end = this.horizontalyArrangeShipToMatrix(
            y,
            x,
            'left',
            shipSize
          );
          return {
            direction: Direction.HORIZONTAL,
            coordinates: {
              x: [x, end],
              y,
            },
            size: shipSize,
          };
        }

        isArranged = this.isFieldsAvailable(x, y, shipSize, 'up');

        if (isArranged) {
          const end = this.verticallyArrangeShipToMatrix(y, x, shipSize, 'up');
          return {
            direction: Direction.VERTICAL,
            coordinates: {
              x,
              y: [y, end],
            },
            size: shipSize,
          };
        }

        isArranged = this.isFieldsAvailable(x, y, shipSize, 'down');

        if (isArranged) {
          const end = this.verticallyArrangeShipToMatrix(
            y,
            x,
            shipSize,
            'down'
          );
          return {
            direction: Direction.VERTICAL,
            coordinates: {
              x,
              y: [y, end],
            },
            size: shipSize,
          };
        }

        tryAttempt++;
      }
    }
  }

  private filterDirections(ship: number[], array: number[]) {
    const newArray = [];
    for (let i = 0; i < array.length; i++) {
      if (ship.includes(array[i])) continue;
      newArray.push(array[i]);
    }

    return newArray;
  }

  private isFieldsAvailable(x: number, y: number, size: number, dir: Position) {
    let xDir = x;
    let yDir = y;
    const matrix = this.gameSessionData.fieldMatrix;
    switch (dir) {
      case 'right':
        if (matrix[y][x - 1] !== undefined) {
          xDir = x - 1;
          size = size + 2;
        } else {
          size = size + 1;
        }
        break;
      case 'left':
        if (matrix[y][x + 1] !== undefined) {
          xDir = x + 1;
          size = size + 2;
        } else {
          size = size + 1;
        }
        break;
      case 'up':
        if (matrix[y + 1] !== undefined) {
          yDir = y + 1;
          size = size + 2;
        } else {
          size = size + 1;
        }
        break;
      case 'down':
        if (matrix[y - 1] !== undefined) {
          yDir = y - 1;
          size = size + 2;
        } else {
          size = size + 1;
        }
    }

    for (let i = 0; i < size; i++) {
      if (dir === 'right' || dir === 'left') {
        if (i === size) {
          if (
            matrix[yDir][xDir] ||
            matrix[yDir - 1]?.[xDir] ||
            matrix[yDir + 1]?.[xDir]
          ) {
            return false;
          }
        } else {
          if (
            matrix[yDir][xDir] === undefined ||
            matrix[yDir][xDir] ||
            matrix[yDir + 1]?.[xDir] ||
            matrix[yDir - 1]?.[xDir]
          ) {
            return false;
          }
        }
        if (dir === 'right') {
          xDir++;
        } else {
          xDir--;
        }
      } else if (dir === 'up' || dir == 'down') {
        if (i === size) {
          if (
            matrix[yDir]?.[xDir] ||
            matrix[yDir]?.[xDir + 1] ||
            matrix[yDir]?.[xDir - 1]
          ) {
            return false;
          }
        } else {
          if (
            matrix[yDir]?.[xDir] === undefined ||
            matrix[yDir]?.[xDir] ||
            matrix[yDir]?.[xDir - 1] ||
            matrix[yDir]?.[xDir + 1]
          ) {
            return false;
          }
        }
        if (dir === 'up') {
          yDir--;
        } else {
          yDir++;
        }
      }
    }

    return true;
  }

  private horizontalyArrangeShipToMatrix(
    y: number,
    x: number,
    dir: Position,
    shipSize: number
  ) {
    this.directionsHash[y] = this.filterDirections(
      this.generatePositionsArray(x, dir, shipSize),
      this.directionsHash[y]
    );

    if (!this.directionsHash[y].length) {
      this.directions = this.directions.filter((pos) => pos !== y);
    }

    if (this.directionsHash[y - 1] !== undefined) {
      this.directionsHash[y - 1] = this.filterDirections(
        this.generatePositionsArray(x, dir, shipSize),
        this.directionsHash[y - 1]
      );

      if (!this.directionsHash[y - 1].length) {
        this.directions = this.directions.filter((pos) => pos !== y - 1);
      }
    }

    if (this.directionsHash[y + 1] !== undefined) {
      this.directionsHash[y + 1] = this.filterDirections(
        this.generatePositionsArray(x, dir, shipSize),
        this.directionsHash[y + 1]
      );

      if (!this.directionsHash[y + 1].length) {
        this.directions = this.directions.filter((pos) => pos !== y + 1);
      }
    }

    let curDir = x;

    for (let i = 0; i < shipSize; i++) {
      this.gameSessionData.fieldMatrix[y][curDir] = true;
      if (dir === 'right') {
        curDir++;
      } else {
        curDir--;
      }
    }

    return dir === 'left' ? curDir + 1 : curDir - 1;
  }

  private verticallyArrangeShipToMatrix(
    y: number,
    x: number,
    shipSize: number,
    dir: Position
  ) {
    let curDir = y;
    for (let i = 0; i < shipSize; i++) {
      this.directionsHash[curDir] = this.filterDirections(
        [x, x + 1, x - 1],
        this.directionsHash[curDir]
      );
      if (!this.directionsHash[curDir].length)
        this.directions = this.directions.filter((pos) => pos !== curDir);
      this.gameSessionData.fieldMatrix[curDir][x] = true;
      if (dir === 'up') {
        curDir--;
      } else {
        curDir++;
      }
    }

    return dir === 'up' ? curDir + 1 : curDir - 1;
  }

  private generatePositionsArray(x: number, dir: Position, size: number) {
    const arr = [];
    let curPos = dir === 'right' ? x - 1 : x + 1;
    for (let i = 0; i < size + 2; i++) {
      arr.push(curPos);
      if (dir === 'right') {
        curPos++;
      } else {
        curPos--;
      }
    }

    return arr;
  }

  public updateBattleshipCell(x: number, y: number, value: boolean) {
    this.gameSessionData.fieldMatrix[y][x] = value;
  }

  public updateShip(ship: IShip, newShip: IShip) {
    this.ships.update((prev) =>
      prev.map((mapShip) => (mapShip === ship ? newShip : mapShip))
    );
  }

  private getRange(x: number, y: number) {
    const arr = this.initialMatrix;
    const matrix = this.gameSessionData.fieldMatrix;
    if (
      !arr[y][x - 1] &&
      !arr[y][x + 1] &&
      !arr[y - 1]?.[x] &&
      !arr[y + 1]?.[x]
    ) {
      return {
        range: null,
        isVertical: false,
        isDestroyed: true,
      };
    }

    const isVertical = arr[y + 1]?.[x] || arr[y - 1]?.[x];
    let start = isVertical ? y : x;
    let end = isVertical ? y : x;

    if (isVertical) {
      while (arr[start]?.[x] || arr[end]?.[x]) {
        if (arr[start]?.[x]) start--;
        if (arr[end]?.[x]) end++;
      }
    } else {
      while (arr[y][start] || arr[y][end]) {
        if (arr[y][start]) start--;
        if (arr[y][end]) end++;
      }
    }

    let isDestroyed = true;
    for (let i = start + 1; i < end; i++) {
      if (isVertical) {
        if (matrix[i]?.[x]) {
          isDestroyed = false;
        }
      } else {
        if (matrix[y]?.[i]) {
          isDestroyed = false;
        }
      }
    }

    return {
      range: [start, end],
      isVertical,
      isDestroyed,
    };
  }

  private isLose() {
    return this.gameSessionData.fieldMatrix.every((arr) =>
      arr.every((field) => !field)
    );
  }

  public onMessage(
    msg: IWsIncomeMessage,
    sendMessage: (msg: IWsMessagePattern) => void,
    handleMessage: (msg: string, type: 'user' | 'opponent') => void
  ) {
    const { type, data } = msg;

    switch (type) {
      case incomneMessageType.ACTIVE_USERS_COUNT:
        this.activeUsers.set(data as number);
        break;
      case incomneMessageType.CHECK:
        const checkData = data as { coordinates: { x: number; y: number } };
        const { x, y } = checkData.coordinates;
        const { fieldMatrix } = this.gameSessionData;
        const message: CheckMessageData = {
          type: sendMessageType.STATUS,
          data: {
            roomId: this.gameSessionData.sessionId!,
            coordinates: checkData.coordinates,
          },
        };

        if (fieldMatrix[y]?.[x]) {
          fieldMatrix[y][x] = false;
          if (this.isLose()) {
            message.data['status'] = 'lose';
          } else {
            const { range, isVertical, isDestroyed } = this.getRange(x, y);

            if (isDestroyed) {
              message.data['status'] = 'destroy';
              message.data['range'] = { range, isVertical };
            } else {
              message.data['status'] = 'hit';
            }
          }
        } else {
          message.data['status'] = 'miss';
        }

        this.hittedFields.update((prev) => [
          ...prev,
          {
            ...checkData.coordinates,
            type: message.data.status === 'miss' ? 'mis' : 'hit',
          },
        ]);
        sendMessage(message);
        break;
      case incomneMessageType.GAME_FOUND:
        const params = this.route.snapshot.queryParamMap;
        const gameFoundData = data as GameFoundData;
        if (params.has('room')) {
          this.router.navigate([], { queryParams: { room: null } });
        }
        const { name, sessionId } = gameFoundData;
        this.gameMetadata.update((prev) => ({ ...prev, opName: name }));
        this.gameSessionData.sessionId = sessionId;
        this.gameStatus.set('found');

        if (!this.audio) {
          this.audio = new Audio('/audio/message.wav');
        }

        this.selectionLoading.set(false);
        Swal.fire({
          icon: 'success',
          text: 'Игра началась.',
          showConfirmButton: false,
          timer: 1300,
        });
        break;
      case incomneMessageType.GAME_START:
        this.gameStatus.set('start');
        this.initialMatrix = this.gameSessionData.fieldMatrix.map((arr) => [
          ...arr,
        ]);
        break;
      case incomneMessageType.LOSE:
        Swal.fire({
          icon: 'error',
          title: 'К сожалению, вы проиграли битву.',
          text: 'Но не проиграли войну!',
        }).then(() => this.reset());
        break;
      case incomneMessageType.MESSAGE:
        const msg = data as string;

        if (!this.isChatOpen()) {
          if (this.audio) {
            this.audio.play();
          }
          this.notifications.update((prev) => prev + 1);
        }
        handleMessage(msg, 'opponent');
        break;
      case incomneMessageType.READY:
        this.isOpponentReady.set(true);
        break;
      case incomneMessageType.ROOM_CLOSED:
        Swal.fire({
          icon: 'info',
          title: 'Игра закончена',
          text: `Противник ${this.gameMetadata().opName ?? ''} покинул игру`,
        }).then(() => this.reset());
        break;
      case incomneMessageType.STATUS:
        const statusData = data as StatusData;
        const status = statusData.status;
        const xDir = statusData.coordinates.x;
        const yDir = statusData.coordinates.y;

        this.initialMatrix[yDir]?.[xDir] !== undefined &&
          this.updateButtonField(
            xDir,
            yDir,
            status === 'miss' ? 'miss' : 'hit'
          );

        if (status === 'lose') {
          launchConfetti(2000);
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: 'Поздравляем, вы выиграли битву!',
              text: 'Вы смогли уничтожить весь флот противника',
            }).then(() => this.reset());
          }, 2000);
        } else if (status === 'destroy') {
          const { range, isVertical } = statusData.range;
          if (!range) {
            this.disableAround(xDir, yDir, null, null, isVertical, true);
          } else {
            this.disableAround(
              xDir,
              yDir,
              range[0],
              range[1],
              isVertical,
              false
            );
          }
        }
        this.shotPending = false;
        break;
      case incomneMessageType.TURN:
        const turnData = data as number;
        this.turn.set(turnData);
        this.updateButtonsState(turnData !== 1);
        break;
    }
  }

  private disableAround(
    x: number,
    y: number,
    start: number | null,
    end: number | null,
    isVertical: boolean,
    isSingle: boolean
  ) {
    const matrix = this.gameSessionData.fieldMatrix;
    if (isSingle) {
      this.updateButtonField(x + 1, y, 'miss');
      this.updateButtonField(x - 1, y, 'miss');
      matrix[y - 1]?.[x] !== undefined &&
        this.updateButtonField(x, y - 1, 'miss');
      matrix[y - 1]?.[x - 1] !== undefined &&
        this.updateButtonField(x - 1, y - 1, 'miss');
      matrix[y - 1]?.[x + 1] !== undefined &&
        this.updateButtonField(x + 1, y - 1, 'miss');
      matrix[y + 1]?.[x] !== undefined &&
        this.updateButtonField(x, y + 1, 'miss');
      matrix[y + 1]?.[x - 1] !== undefined &&
        this.updateButtonField(x - 1, y + 1, 'miss');
      matrix[y + 1]?.[x + 1] !== undefined &&
        this.updateButtonField(x + 1, y + 1, 'miss');
    } else if (start !== null && end !== null) {
      for (let i = start; i <= end; i++) {
        if (isVertical) {
          matrix[i]?.[x + 1] !== undefined &&
            this.updateButtonField(x + 1, i, 'miss');
          matrix[i]?.[x - 1] !== undefined &&
            this.updateButtonField(x - 1, i, 'miss');
          if (i === start || i === end) {
            matrix[i]?.[x] !== undefined &&
              this.updateButtonField(x, i, 'miss');
          }
        } else {
          matrix[y - 1]?.[i] !== undefined &&
            this.updateButtonField(i, y - 1, 'miss');
          matrix[y + 1]?.[i] !== undefined &&
            this.updateButtonField(i, y + 1, 'miss');
          if (i === start || i === end) {
            matrix[y]?.[i] !== undefined &&
              this.updateButtonField(i, y, 'miss');
          }
        }
      }
    }
  }

  private updateButtonsState(disable: boolean) {
    this.buttons.update((prev) =>
      prev.map((btn) => ({ ...btn, disabled: disable }))
    );
  }

  private updateButtonField(x: number, y: number, type: 'miss' | 'hit') {
    this.buttons.update((prev) =>
      prev.map((btn) => {
        const btnX = Number(btn.gridColumn) - 1;
        const btnY = Number(btn.gridRow) - 1;
        const key = type === 'miss' ? 'missed' : 'hitted';
        if (x === btnX && y === btnY) {
          return { ...btn, [key]: true };
        }

        return btn;
      })
    );
  }

  public getGridArea(
    coordinates: ICoordinates,
    dir: null | Direction
  ): { gridColumn: string; gridRow: string } {
    let gridColumn = '0';
    let gridRow = '0';
    const { x, y } = coordinates;

    if (!dir) {
      gridRow = String((y as number) + 1);
      gridColumn = String((x as number) + 1);
    } else {
      switch (dir) {
        case 'horizontal':
          if (Array.isArray(x)) {
            const xStart = Math.min(x[0], x[1]);
            const xEnd = Math.max(x[0], x[1]);
            gridRow = String((y as number) + 1);
            gridColumn = `${xStart + 1} / ${xEnd + 2}`;
          }
          break;
        case 'vertical':
          if (Array.isArray(y)) {
            const yStart = Math.min(y[0], y[1]);
            const yEnd = Math.max(y[0], y[1]);
            gridColumn = String((x as number) + 1);
            gridRow = `${yStart + 1} / ${yEnd + 2}`;
          }
          break;
      }
    }

    return {
      gridColumn,
      gridRow,
    };
  }
}
