import { Cell, CellType } from './cell.model';

export interface GridSize {
  rows: number;
  cols: number;
}

export class GridModel {
  readonly rows: number;
  readonly cols: number;
  cells: Cell[][];

  constructor(size: GridSize) {
    this.rows = size.rows;
    this.cols = size.cols;
    this.cells = this.createEmptyGrid();
  }

  private createEmptyGrid(): Cell[][] {
    const grid: Cell[][] = [];
    for (let r = 0; r < this.rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < this.cols; c++) {
        row.push({
          row: r,
          col: c,
          type: 'empty',
          distance: Infinity,
          visited: false,
          inFrontier: false,
          inPath: false,
        });
      }
      grid.push(row);
    }
    return grid;
  }

  resetVisits(): void {
    for (const row of this.cells) {
      for (const cell of row) {
        cell.visited = false;
        cell.inFrontier = false;
        cell.inPath = false;
        cell.distance = Infinity;
        if (cell.type === 'visited' || cell.type === 'frontier' || cell.type === 'path') {
          cell.type = 'empty';
        }
      }
    }
  }

  clearWallsAndPaths(): void {
    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.type === 'wall' || cell.type === 'visited' || cell.type === 'frontier' || cell.type === 'path') {
          cell.type = 'empty';
        }
        cell.visited = false;
        cell.inFrontier = false;
        cell.inPath = false;
        cell.distance = Infinity;
      }
    }
  }

  getNeighbors(cell: Cell, allowDiagonals = false): Cell[] {
    const neighbors: Cell[] = [];
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const diagDirs = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];

    for (const [dr, dc] of dirs) {
      const nr = cell.row + dr;
      const nc = cell.col + dc;
      if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
        neighbors.push(this.cells[nr][nc]);
      }
    }

    if (allowDiagonals) {
      for (const [dr, dc] of diagDirs) {
        const nr = cell.row + dr;
        const nc = cell.col + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          neighbors.push(this.cells[nr][nc]);
        }
      }
    }

    return neighbors;
  }

  setCellType(row: number, col: number, type: CellType): void {
    const cell = this.cells[row][col];
    cell.type = type;
  }
}
