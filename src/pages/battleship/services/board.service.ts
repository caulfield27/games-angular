import { Injectable, signal } from '@angular/core';
import { Direction, ICoordinates, IShip } from '../types/types';

@Injectable()
export class BoardService {
  placeToArrange = signal<IShip | null>(null);
  coordinateDif: number | null = null;

  public checkPosition(
    matrix: boolean[][],
    coordinates: ICoordinates,
    x: number,
    y: number,
    size: number,
    dir: Direction | null
  ) {
    const prevX = coordinates.x;
    const prevY = coordinates.y;

    if (size === 1) {
      if (
        !matrix[y][x] &&
        (!matrix[y][x + 1] || (x + 1 === prevX && y === prevY)) &&
        (!matrix[y][x - 1] || (x - 1 === prevX && y === prevY)) &&
        (!matrix[y - 1]?.[x] || (x === prevX && y - 1 === prevY)) &&
        (!matrix[y - 1]?.[x - 1] || (x - 1 === prevX && y - 1 === prevY)) &&
        (!matrix[y - 1]?.[x + 1] || (x + 1 === prevX && y - 1 === prevY)) &&
        (!matrix[y + 1]?.[x] || (x === prevX && y + 1 === prevY)) &&
        (!matrix[y + 1]?.[x - 1] || (x - 1 === prevX && y + 1 === prevY)) &&
        (!matrix[y + 1]?.[x + 1] || (x + 1 === prevX && y + 1 === prevY))
      ) {
        this.placeToArrange.set({
          coordinates: {
            x,
            y,
          },
          direction: dir,
          size,
        });
      } else {
        this.placeToArrange.set(null);
      }
    } else {
      const array: number[] = Array.isArray(coordinates.x)
        ? coordinates.x
        : (coordinates.y as number[]);
      const prevPositionSet = new Set();
      const [arrStart, arrEnd] = [Math.min(...array), Math.max(...array)];
      for (let i = arrStart; i <= arrEnd; i++) {
        prevPositionSet.add(i);
      }
      let isAvailable = true;
      const pivot = dir === 'horizontal' ? x : y;
      if (this.coordinateDif === null) {
        this.coordinateDif = this.getDiff(
          dir === 'horizontal'
            ? (coordinates.x as number[])
            : (coordinates.y as number[]),
          pivot
        );
      }

      const start = Math.max(0, pivot - this.coordinateDif);

      let dynamicStart = start;
      let dynamicSize = size;

      if (dir === 'horizontal') {
        if (matrix[y][start + size] !== undefined) {
          dynamicSize++;
        }

        if (matrix[y][start - 1] !== undefined) {
          dynamicStart--;
          dynamicSize++;
        }
      } else {
        if (matrix[start + size] !== undefined) {
          dynamicSize++;
        }

        if (matrix[start - 1] !== undefined) {
          dynamicStart--;
          dynamicSize++;
        }
      }

      const staticPrevDir = Array.isArray(prevX) ? prevY : prevX;

      for (let i = 0; i < dynamicSize; i++) {
        if (dir === 'horizontal') {
          if (
            matrix[y][dynamicStart] !== false ||
            (matrix[y - 1] !== undefined &&
              matrix[y - 1][dynamicStart] &&
              !(
                staticPrevDir === y - 1 && prevPositionSet.has(dynamicStart)
              )) ||
            (matrix[y + 1] !== undefined &&
              matrix[y + 1][dynamicStart] &&
              !(staticPrevDir === y + 1 && prevPositionSet.has(dynamicStart)))
          ) {
            isAvailable = false;
          }
        } else {
          if (
            matrix[dynamicStart]?.[x] !== false ||
            (matrix[dynamicStart]?.[x - 1] &&
              !(
                x - 1 === staticPrevDir && prevPositionSet.has(dynamicStart)
              )) ||
            (matrix[dynamicStart]?.[x + 1] &&
              !(x + 1 === staticPrevDir && prevPositionSet.has(dynamicStart)))
          ) {
            isAvailable = false;
          }
        }
        dynamicStart++;
      }

      if (isAvailable) {
        const xDir = dir === 'horizontal' ? [start, start + size - 1] : x;
        const yDir = dir === 'vertical' ? [start, start + size - 1] : y;
        this.placeToArrange.set({
          coordinates: {
            x: xDir,
            y: yDir,
          },
          direction: dir,
          size,
        });
      } else {
        this.placeToArrange.set(null);
      }
    }
  }

  private getDiff(arr: number[], pos: number): number {
    const [start, end] = [Math.min(...arr), Math.max(...arr)];
    let counter = 0;
    for (let i = start; i <= end; i++) {
      if (i - pos === 0) {
        break;
      }
      counter++;
    }

    return counter;
  }
}
