import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cell } from '../models/cell.model';
import { GridModel } from '../models/grid.model';

export type PathAlgorithm = 'bfs' | 'dijkstra' | 'astar' | 'dfs';

export interface PathStep {
  visited: Cell[];
  frontier: Cell[];
  path?: Cell[];
}

export interface PathStats {
  visitedCount: number;
  pathLength: number;
  runtimeMs: number;
}

export interface PathResult {
  steps$: Observable<PathStep>;
  stats$: Observable<PathStats>;
}

@Injectable({ providedIn: 'root' })
export class PathfindingService {
  run(grid: GridModel, algorithm: PathAlgorithm, start: Cell, end: Cell): PathResult {
    switch (algorithm) {
      case 'bfs':
        return this.runBfs(grid, start, end);
      case 'dijkstra':
        return this.runDijkstra(grid, start, end);
      case 'astar':
        return this.runAstar(grid, start, end);
      case 'dfs':
        return this.runDfs(grid, start, end);
      default:
        return this.runBfs(grid, start, end);
    }
  }

  private runBfs(grid: GridModel, start: Cell, end: Cell): PathResult {
    const startTime = performance.now();
    const steps: PathStep[] = [];
    const parents = new Map<string, Cell>();
    const visited = new Set<string>();
    const frontierQueue: Cell[] = [];

    const queue: Cell[] = [];
    queue.push(start);
    frontierQueue.push(start);
    visited.add(this.key(start));

    while (queue.length) {
      const current = queue.shift()!;
      frontierQueue.shift();
      steps.push({ visited: [current], frontier: [...frontierQueue] });

      if (current === end) {
        break;
      }

      for (const neighbor of this.getWalkableNeighbors(grid, current)) {
        const key = this.key(neighbor);
        if (visited.has(key)) {
          continue;
        }
        visited.add(key);
        parents.set(key, current);
        queue.push(neighbor);
        frontierQueue.push(neighbor);
        steps.push({ visited: [], frontier: [...frontierQueue] });
      }
    }

    const { path, stats } = this.buildStats(startTime, visited.size, parents, end);
    if (path.length) {
      steps.push({ visited: [], frontier: [], path });
    }

    return {
      steps$: this.stepsObservable(steps),
      stats$: this.statsObservable(stats),
    };
  }

  private runDijkstra(grid: GridModel, start: Cell, end: Cell): PathResult {
    const startTime = performance.now();
    const steps: PathStep[] = [];
    const parents = new Map<string, Cell>();
    const dist = new Map<string, number>();
    const visited = new Set<string>();
    dist.set(this.key(start), 0);

    const pq: { cell: Cell; cost: number }[] = [{ cell: start, cost: 0 }];

    while (pq.length) {
      pq.sort((a, b) => a.cost - b.cost);
      const { cell, cost } = pq.shift()!;
      const key = this.key(cell);
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      steps.push({ visited: [cell], frontier: pq.map((item) => item.cell) });

      if (cell === end) {
        break;
      }

      for (const neighbor of this.getWalkableNeighbors(grid, cell)) {
        const nKey = this.key(neighbor);
        const nextCost = cost + 1;
        if (nextCost < (dist.get(nKey) ?? Infinity)) {
          dist.set(nKey, nextCost);
          parents.set(nKey, cell);
          pq.push({ cell: neighbor, cost: nextCost });
          steps.push({ visited: [], frontier: pq.map((item) => item.cell) });
        }
      }
    }

    const { path, stats } = this.buildStats(startTime, visited.size, parents, end);
    if (path.length) {
      steps.push({ visited: [], frontier: [], path });
    }

    return {
      steps$: this.stepsObservable(steps),
      stats$: this.statsObservable(stats),
    };
  }

  private runAstar(grid: GridModel, start: Cell, end: Cell): PathResult {
    const startTime = performance.now();
    const steps: PathStep[] = [];
    const parents = new Map<string, Cell>();
    const gScore = new Map<string, number>();
    const visited = new Set<string>();
    const startKey = this.key(start);
    gScore.set(startKey, 0);

    const open: { cell: Cell; f: number; g: number }[] = [{ cell: start, f: this.heuristic(start, end), g: 0 }];

    while (open.length) {
      open.sort((a, b) => a.f - b.f);
      const current = open.shift()!;
      const key = this.key(current.cell);
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      steps.push({ visited: [current.cell], frontier: open.map((item) => item.cell) });

      if (current.cell === end) {
        break;
      }

      for (const neighbor of this.getWalkableNeighbors(grid, current.cell)) {
        const nKey = this.key(neighbor);
        const tentativeG = current.g + 1;
        if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
          parents.set(nKey, current.cell);
          gScore.set(nKey, tentativeG);
          const fScore = tentativeG + this.heuristic(neighbor, end);
          open.push({ cell: neighbor, g: tentativeG, f: fScore });
          steps.push({ visited: [], frontier: open.map((item) => item.cell) });
        }
      }
    }

    const { path, stats } = this.buildStats(startTime, visited.size, parents, end);
    if (path.length) {
      steps.push({ visited: [], frontier: [], path });
    }

    return {
      steps$: this.stepsObservable(steps),
      stats$: this.statsObservable(stats),
    };
  }

  private runDfs(grid: GridModel, start: Cell, end: Cell): PathResult {
    const startTime = performance.now();
    const steps: PathStep[] = [];
    const parents = new Map<string, Cell>();
    const visited = new Set<string>();

    const stack: Cell[] = [start];
    visited.add(this.key(start));

    while (stack.length) {
      const current = stack.pop()!;
      steps.push({ visited: [current], frontier: [...stack] });

      if (current === end) {
        break;
      }

      for (const neighbor of this.getWalkableNeighbors(grid, current).reverse()) {
        const key = this.key(neighbor);
        if (visited.has(key)) {
          continue;
        }
        visited.add(key);
        parents.set(key, current);
        stack.push(neighbor);
        steps.push({ visited: [], frontier: [...stack] });
      }
    }

    const { path, stats } = this.buildStats(startTime, visited.size, parents, end);
    if (path.length) {
      steps.push({ visited: [], frontier: [], path });
    }

    return {
      steps$: this.stepsObservable(steps),
      stats$: this.statsObservable(stats),
    };
  }

  private stepsObservable(steps: PathStep[]): Observable<PathStep> {
    return new Observable<PathStep>((subscriber) => {
      for (const step of steps) {
        subscriber.next(step);
      }
      subscriber.complete();
    });
  }

  private statsObservable(stats: PathStats): Observable<PathStats> {
    return new Observable<PathStats>((subscriber) => {
      subscriber.next(stats);
      subscriber.complete();
    });
  }

  private buildStats(startTime: number, visitedCount: number, parents: Map<string, Cell>, end: Cell) {
    const path = this.reconstructPath(parents, end);
    const runtimeMs = performance.now() - startTime;
    const stats: PathStats = {
      visitedCount,
      pathLength: path.length,
      runtimeMs,
    };
    return { path, stats };
  }

  private reconstructPath(parents: Map<string, Cell>, end: Cell): Cell[] {
    const path: Cell[] = [];
    let current: Cell | undefined = end;
    while (current) {
      path.unshift(current);
      const parent = parents.get(this.key(current));
      if (!parent) {
        break;
      }
      current = parent;
    }
    if (!path.length || path[path.length - 1] !== end) {
      return [];
    }
    return path;
  }

  private getWalkableNeighbors(grid: GridModel, cell: Cell): Cell[] {
    return grid.getNeighbors(cell).filter((neighbor) => neighbor.type !== 'wall');
  }

  private heuristic(a: Cell, b: Cell): number {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  }

  private key(cell: Cell): string {
    return `${cell.row}-${cell.col}`;
  }
}
