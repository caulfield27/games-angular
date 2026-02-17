import { PIECE_IMAGE_PATH } from '../constants';
import { Color, FigureEnum } from '../types';

export class Figure {
  public figure: FigureEnum;
  public position: [number, number];
  public image: string; 
  constructor(
    figure: FigureEnum,
    color: Color,
    position: [number, number],
  ) {
    this.figure = figure;
    this.position = position;
    this.image = PIECE_IMAGE_PATH[figure+color];
  }
}
