export function getCoordinates(
  field: HTMLDivElement,
  pointer: { x: number; y: number },
  cellSize = 30,
  maxSize = 9,
): {
  x: number;
  y: number;
} {
  const gridRect = field.getBoundingClientRect();

  const relX = pointer.x - gridRect.left;
  const relY = pointer.y - gridRect.top;


  const col = Math.floor(relX / cellSize);
  const row = Math.floor(relY / cellSize);

  const x = Math.max(0, Math.min(maxSize, col));
  const y = Math.max(0, Math.min(maxSize, row));

  return { x, y };
}
