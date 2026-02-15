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

interface IAuthPayload{
  username: string;
  password: string;
  email?: string
}

interface User{
  id: number;
  username: string;
  email: string;
  avatar: number | null;
}

export type {LevelType, ILevel, IDropdownOption, ILevelOption, IPagesMetadata, IAuthPayload, User}