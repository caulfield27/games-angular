import { EmbeddedViewRef, Injectable, signal } from '@angular/core';
import { Direction, ISessionData, IShip, Position } from '../types/types';

@Injectable({
  providedIn: 'root',
})
export class BattleshipService {
  // states
  gameSessionData: ISessionData = {
    myName: 'me',
    opponentName: '',
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
  directions: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  directionsHash: Record<string, number[]> = {
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
  ships = signal<IShip[]>([]);

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
        const ship = this.randomlyArrangeShip(i);
        if (ship) ships.push(ship);
      }
    }
    return ships;
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
}
