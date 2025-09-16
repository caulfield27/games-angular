interface ILevel {
  easy: LevelType;
  medium: LevelType;
  hard: LevelType;
}

interface ILevelOption{
  name: string,
  value: keyof ILevel
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

interface IDropdownOption{
    name: string,
    value: string
}

export type {LevelType, ILevel, IDropdownOption, ILevelOption}