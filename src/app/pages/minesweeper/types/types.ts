interface IField {
  id: number;
  isMine: boolean;
  isFlaged: boolean;
  isOpen: boolean;
  edgeCase: number;
  minesAround?: number
  failed?: boolean
}

export type { IField };
