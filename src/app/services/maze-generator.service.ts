import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GridModel } from '../models/grid.model';

export type MazeType = 'dfs-backtracking' | 'prims' | 'binary-tree';

export interface MazeStep {
  row: number;
  col: number;
  makeWall: boolean;
}

@Injectable({ providedIn: 'root' })
export class MazeGeneratorService {
  generateMaze(grid: GridModel, type: MazeType): Observable<MazeStep> {
    const layout = this.buildLayout(grid.rows, grid.cols, type);
    const steps = this.layoutToSteps(layout);
    return new Observable<MazeStep>((subscriber) => {
      for (const step of steps) {
        subscriber.next(step);
      }
      subscriber.complete();
    });
  }

  private buildLayout(rows: number, cols: number, type: MazeType): boolean[][] {
    switch (type) {
      case 'dfs-backtracking':
        return this.generateRandomizedDfsLayout(rows, cols);
      case 'prims':
        return this.generateRandomizedPrimsLayout(rows, cols);
      case 'binary-tree':
        return this.generateBinaryTreeLayout(rows, cols);
      default:
        return this.generateRandomizedDfsLayout(rows, cols);
    }
  }

  private layoutToSteps(layout: boolean[][]): MazeStep[] {
    const steps: MazeStep[] = [];
    for (let r = 0; r < layout.length; r++) {
      for (let c = 0; c < layout[0].length; c++) {
        steps.push({ row: r, col: c, makeWall: layout[r][c] });
      }
    }
    return steps;
  }

  private generateRandomizedDfsLayout(rows: number, cols: number): boolean[][] {
    const layout = this.createFilled(rows, cols, true);
    const start = { row: 1, col: 1 };
    layout[start.row][start.col] = false;
    const stack: { row: number; col: number }[] = [start];

    while (stack.length) {
      const current = stack[stack.length - 1];
      const neighbors = this.getNeighborsTwoSteps(current.row, current.col, rows, cols)
        .filter((n) => layout[n.row][n.col]);

      if (!neighbors.length) {
        stack.pop();
        continue;
      }

      const next = this.randomOf(neighbors);
      const wallRow = current.row + (next.row - current.row) / 2;
      const wallCol = current.col + (next.col - current.col) / 2;
      layout[next.row][next.col] = false;
      layout[wallRow][wallCol] = false;
      stack.push(next);
    }

    this.ensureEntranceExit(layout);
    return layout;
  }

  private generateRandomizedPrimsLayout(rows: number, cols: number): boolean[][] {
    const layout = this.createFilled(rows, cols, true);
    const start = { row: 1, col: 1 };
    layout[start.row][start.col] = false;
    const walls: { row: number; col: number; between: { row: number; col: number } }[] = [];

    const addWalls = (row: number, col: number) => {
      for (const [dr, dc] of [
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2],
      ]) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr > 0 && nr < rows && nc > 0 && nc < cols && layout[nr][nc]) {
          walls.push({ row: nr, col: nc, between: { row: row + dr / 2, col: col + dc / 2 } });
        }
      }
    };

    addWalls(start.row, start.col);

    while (walls.length) {
      const index = Math.floor(Math.random() * walls.length);
      const wall = walls.splice(index, 1)[0];
      if (!layout[wall.row][wall.col]) {
        continue;
      }
      if (layout[wall.row][wall.col]) {
        layout[wall.row][wall.col] = false;
        layout[wall.between.row][wall.between.col] = false;
        addWalls(wall.row, wall.col);
      }
    }

    this.ensureEntranceExit(layout);
    return layout;
  }

  private generateBinaryTreeLayout(rows: number, cols: number): boolean[][] {
    const layout = this.createFilled(rows, cols, true);
    for (let r = 1; r < rows; r += 2) {
      for (let c = 1; c < cols; c += 2) {
        layout[r][c] = false;
        const carveNorth = r > 1 && (c === 1 || Math.random() < 0.5);
        if (carveNorth && r - 1 >= 0) {
          layout[r - 1][c] = false;
        } else if (c - 1 >= 0) {
          layout[r][c - 1] = false;
        }
      }
    }
    this.ensureEntranceExit(layout);
    return layout;
  }

  private createFilled(rows: number, cols: number, value: boolean): boolean[][] {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => value));
  }

  private ensureEntranceExit(layout: boolean[][]): void {
    const rows = layout.length;
    const cols = layout[0].length;
    layout[1][1] = false;
    layout[rows - 2][cols - 2] = false;
  }

  private randomOf<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  private getNeighborsTwoSteps(row: number, col: number, rows: number, cols: number): { row: number; col: number }[] {
    const neighbors: { row: number; col: number }[] = [];
    for (const [dr, dc] of [
      [2, 0],
      [-2, 0],
      [0, 2],
      [0, -2],
    ]) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr > 0 && nr < rows && nc > 0 && nc < cols) {
        neighbors.push({ row: nr, col: nc });
      }
    }
    return neighbors;
  }
}
