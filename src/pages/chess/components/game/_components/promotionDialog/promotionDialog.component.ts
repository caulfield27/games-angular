import { ChessService } from '@/pages/chess/service/chess.service';
import { PromoteOption } from '@/pages/chess/types';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'promotion-dialog',
  templateUrl: './promotionDialog.component.html',
  imports: [],
})
export class PromotionDialog {
  constructor(public chessService: ChessService) {}

  @Input('cellSize') cellSize!: number;
  @Output() handlePromotion = new EventEmitter<PromoteOption>();

  public promotionPosition(position: number | null) {
    if (position === null) return { display: 'none' };

    return {
      left:
        position < 8
          ? position * this.cellSize + 'px'
          : (position % 8) * this.cellSize + 'px',
      top: position < 8 ? 0 : 4 * this.cellSize + 'px',
      display: 'flex',
    };
  }

  public onPromotionChoose(piece: PromoteOption) {
    this.handlePromotion.emit(piece);
  }
}
