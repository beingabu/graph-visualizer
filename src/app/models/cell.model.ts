export type CellType = 'empty' | 'wall' | 'start' | 'end' | 'visited' | 'frontier' | 'path';

export interface Cell {
  row: number;
  col: number;
  type: CellType;
  distance: number;
  visited: boolean;
  inFrontier: boolean;
  inPath: boolean;
}
