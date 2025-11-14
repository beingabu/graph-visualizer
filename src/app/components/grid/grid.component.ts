import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GridModel } from '../../models/grid.model';
import { MazeGeneratorService, MazeStep, MazeType } from '../../services/maze-generator.service';
import { PathAlgorithm, PathResult, PathStep, PathfindingService } from '../../services/pathfinding.service';
import { Cell } from '../../models/cell.model';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
})
export class GridComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gridCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() rows = 30;
  @Input() cols = 60;
  private _animationSpeed = 40;
  @Input()
  set animationSpeed(value: number) {
    this._animationSpeed = value;
    this.animation.setSpeed(value);
  }
  get animationSpeed(): number {
    return this._animationSpeed;
  }

  @Output() statsChange = new EventEmitter<{ visitedCount: number; pathLength: number; runtimeMs: number; algorithm?: PathAlgorithm }>();

  grid!: GridModel;
  private ctx!: CanvasRenderingContext2D;
  private cellSize = 20;
  private mouseDown = false;
  private drawingWall = true;
  private startCell: Cell | null = null;
  private endCell: Cell | null = null;

  private animationSub?: Subscription;
  private statsSub?: Subscription;

  constructor(
    private mazeService: MazeGeneratorService,
    private pathService: PathfindingService,
    private animation: AnimationService,
  ) {
    this.grid = new GridModel({ rows: this.rows, cols: this.cols });
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.resizeCanvas();
    this.drawGrid();
  }

  onMouseDown(event: MouseEvent): void {
    this.mouseDown = true;
    const { row, col } = this.getCellFromEvent(event);
    const cell = this.grid.cells[row][col];
    if (event.shiftKey) {
      this.setStart(row, col);
    } else if (event.altKey) {
      this.setEnd(row, col);
    } else {
      this.drawingWall = cell.type !== 'wall';
      this.toggleWall(row, col, this.drawingWall);
    }
    this.drawGrid();
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.mouseDown) return;
    const { row, col } = this.getCellFromEvent(event);
    this.toggleWall(row, col, this.drawingWall);
    this.drawGrid();
  }

  onMouseUp(): void {
    this.mouseDown = false;
  }

  ngOnDestroy(): void {
    this.animationSub?.unsubscribe();
    this.statsSub?.unsubscribe();
  }

  generateMaze(type: MazeType): void {
    this.cancelCurrentAnimation();
    const steps: MazeStep[] = [];
    this.mazeService.generateMaze(this.grid, type).subscribe({
      next: (step) => steps.push(step),
      complete: () => this.playMazeSteps(steps),
    });
  }

  visualizePath(type: PathAlgorithm): void {
    if (!this.startCell || !this.endCell) {
      return;
    }

    this.cancelCurrentAnimation();
    this.grid.resetVisits();

    const steps: PathStep[] = [];
    const result: PathResult = this.pathService.run(this.grid, type, this.startCell, this.endCell);

    result.steps$.subscribe({
      next: (step) => steps.push(step),
      complete: () => this.playPathSteps(steps),
    });

    this.statsSub?.unsubscribe();
    this.statsSub = result.stats$.subscribe((stats) => {
      this.statsChange.emit({ ...stats, algorithm: type });
    });
  }

  resetGrid(): void {
    this.cancelCurrentAnimation();
    this.grid = new GridModel({ rows: this.rows, cols: this.cols });
    this.startCell = null;
    this.endCell = null;
    this.drawGrid();
  }

  clearPath(): void {
    this.cancelCurrentAnimation();
    this.grid.resetVisits();
    this.drawGrid();
  }

  private playMazeSteps(steps: MazeStep[]): void {
    if (!steps.length) {
      return;
    }

    this.animationSub = this.animation.runSequence(steps).subscribe({
      next: (step) => {
        const cell = this.grid.cells[step.row][step.col];
        if (cell === this.startCell || cell === this.endCell) {
          return;
        }
        cell.type = step.makeWall ? 'wall' : 'empty';
        this.drawGrid();
      },
      complete: () => {
        if (!this.startCell) {
          this.setStart(1, 1);
        }
        if (!this.endCell) {
          this.setEnd(this.rows - 2, this.cols - 2);
        }
        this.drawGrid();
      },
    });
  }

  private playPathSteps(steps: PathStep[]): void {
    if (!steps.length) {
      return;
    }

    this.animationSub = this.animation.runSequence(steps).subscribe({
      next: (step) => {
        this.applyPathStep(step);
        this.drawGrid();
      },
    });
  }

  private applyPathStep(step: PathStep): void {
    this.clearDynamicStates();

    for (const cell of step.visited) {
      if (cell !== this.startCell && cell !== this.endCell) {
        cell.type = 'visited';
      }
    }

    for (const cell of step.frontier) {
      if (cell !== this.startCell && cell !== this.endCell) {
        cell.type = 'frontier';
      }
    }

    if (step.path) {
      for (const row of this.grid.cells) {
        for (const cell of row) {
          if (cell.type === 'path' && cell !== this.startCell && cell !== this.endCell) {
            cell.type = 'visited';
          }
        }
      }
      for (const cell of step.path) {
        if (cell !== this.startCell && cell !== this.endCell) {
          cell.type = 'path';
        }
      }
    }
  }

  private clearDynamicStates(): void {
    for (const row of this.grid.cells) {
      for (const cell of row) {
        if (cell !== this.startCell && cell !== this.endCell) {
          if (cell.type === 'frontier') {
            cell.type = 'visited';
          }
        }
      }
    }
  }

  private cancelCurrentAnimation(): void {
    this.animationSub?.unsubscribe();
    this.animationSub = undefined;
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.cols * this.cellSize;
    canvas.height = this.rows * this.cellSize;
  }

  private drawGrid(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.cols * this.cellSize, this.rows * this.cellSize);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid.cells[r][c];
        this.ctx.fillStyle = this.getCellColor(cell);
        this.ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
      }
    }

    // draw grid lines subtle
    this.ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    this.ctx.lineWidth = 1;
    for (let r = 0; r <= this.rows; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * this.cellSize + 0.5);
      this.ctx.lineTo(this.cols * this.cellSize, r * this.cellSize + 0.5);
      this.ctx.stroke();
    }
    for (let c = 0; c <= this.cols; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * this.cellSize + 0.5, 0);
      this.ctx.lineTo(c * this.cellSize + 0.5, this.rows * this.cellSize);
      this.ctx.stroke();
    }
  }

  private getCellFromEvent(event: MouseEvent): { row: number; col: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    return {
      row: Math.min(this.rows - 1, Math.max(0, row)),
      col: Math.min(this.cols - 1, Math.max(0, col)),
    };
  }

  private toggleWall(row: number, col: number, makeWall: boolean): void {
    const cell = this.grid.cells[row][col];
    if (cell.type === 'start' || cell.type === 'end') return;
    cell.type = makeWall ? 'wall' : 'empty';
  }

  private setStart(row: number, col: number): void {
    if (this.startCell) {
      this.startCell.type = 'empty';
    }
    const cell = this.grid.cells[row][col];
    if (cell.type === 'wall') {
      cell.type = 'empty';
    }
    cell.type = 'start';
    this.startCell = cell;
  }

  private setEnd(row: number, col: number): void {
    if (this.endCell) {
      this.endCell.type = 'empty';
    }
    const cell = this.grid.cells[row][col];
    if (cell.type === 'wall') {
      cell.type = 'empty';
    }
    cell.type = 'end';
    this.endCell = cell;
  }

  private getCellColor(cell: Cell): string {
    switch (cell.type) {
      case 'wall':
        return '#000000';
      case 'start':
        return '#16a34a';
      case 'end':
        return '#dc2626';
      case 'visited':
        return '#bfdbfe';
      case 'frontier':
        return '#1d4ed8';
      case 'path':
        return '#facc15';
      case 'empty':
      default:
        return '#ffffff';
    }
  }
}
