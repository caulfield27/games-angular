export type Timer = {
    minutes: number;
    seconds: number;
}

export type LevelEnum = 'easy' | 'medium' | 'hard' | 'gigachad';

interface ISettings{
    level: LevelEnum;
    category: string;
}

interface ICard{
    src: string;
    id: number;
    isActive: boolean;
}

export type {ISettings, ICard}