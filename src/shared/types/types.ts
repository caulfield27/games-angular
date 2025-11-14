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

interface IPagesMetadata{
  background_url_path: string | null;
  title: string;
  description: string;
  keywords: string;
  icoPath: string;
}

export type {LevelType, ILevel, IDropdownOption, ILevelOption, IPagesMetadata}