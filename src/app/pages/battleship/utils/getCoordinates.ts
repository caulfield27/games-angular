export function getCoordinates(
  field: HTMLDivElement,
  pointer: { x: number; y: number }
): {
  x: number;
  y: number;
} {
  const gridRect = field.getBoundingClientRect();

  const relX = pointer.x - gridRect.left;
  const relY = pointer.y - gridRect.top;

  const cellSize = 30;

  const col = Math.floor(relX / cellSize);
  const row = Math.floor(relY / cellSize);

  const x = Math.max(0, Math.min(9, col));
  const y = Math.max(0, Math.min(9, row));

  return { x, y };
}
