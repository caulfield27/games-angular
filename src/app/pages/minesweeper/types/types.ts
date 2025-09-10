interface ILevel {
  easy: LevelType;
  medium: LevelType;
  hard: LevelType;
}

interface IField {
  id: number;
  isMine: boolean;
  isFlaged: boolean;
  isOpen: boolean;
  edgeCase: number;
}

type LevelType = {
  label: string;
  rows: number;
  cols: number;
  mines: number;
  size: string;
  mineSize: string;
  flagSize: string;
  hintAmount: number;
};

export type { ILevel, IField, LevelType };
