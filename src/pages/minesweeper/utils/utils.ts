import { IField } from '../types/types';
import { ILevel, LevelType } from '../../../shared/types/types';

export function getLevels(width: number): ILevel {
  return {
    easy: {
      label: 'Лёгкий',
      rows: 10,
      cols: 8,
      mines: 10,
      size: width <= 480 ? '25px' : '45px',
      mineSize: width <= 480 ? '20px' : '35px',
      flagSize: width <= 480 ? '15px' : '35px',
      hintAmount: 1,
    },
    medium: {
      label: 'Средний',
      rows: width <= 480 ? 14 : 18,
      cols: 14,
      mines: 40,
      size:
        width <= 480 && width > 400 ? '25px' : width <= 400 ? '20px' : '35px',
      mineSize: width <= 480 ? '15px' : '30px',
      flagSize: width <= 480 ? '15px' : '25px',
      hintAmount: 3,
    },
    hard: {
      label: 'Сложный',
      rows: width <= 480 ? 16 : 24,
      cols: 20,
      mines: 99,
      size:
        width <= 480 && width > 385 ? '20px' : width < 385 ? '17px' : '25px',
      mineSize: width <= 480 ? '10px' : '20px',
      flagSize: width <= 480 ? '12px' : '20px',
      hintAmount: 5,
    },
  };
}

export function getFields(level: LevelType): IField[] {
  const rows = level.rows;
  let edgeTrack = level.rows - 1;
  const leftEdge = new Set();
  const rightEdge = new Set();
  return new Array(rows * level.cols).fill(null).map((_, i) => {
    if (i === edgeTrack) {
      leftEdge.add(edgeTrack + 1);
      rightEdge.add(edgeTrack + rows);
      edgeTrack = edgeTrack + rows;
    }
    const bottomLeft = i === 0;
    const bottomRight = i === rows - 1;
    const topLeft = i === rows * rows;
    const topRight = i === rows * (rows + 1) - 1;

    if (
      (bottomLeft || bottomRight || topLeft || topRight) &&
      (leftEdge.has(i) || rightEdge.has(i))
    ) {
      if (leftEdge.has(i)) {
        leftEdge.delete(i);
      } else {
        rightEdge.delete(i);
      }
    }
    const edgeCase = leftEdge.has(i)
      ? 1
      : rightEdge.has(i)
      ? 2
      : bottomLeft
      ? 3
      : bottomRight
      ? 4
      : topLeft
      ? 5
      : topRight
      ? 6
      : 7;
    return {
      id: i + 1,
      isMine: false,
      isFlaged: false,
      isOpen: false,
      edgeCase,
    };
  });
}
