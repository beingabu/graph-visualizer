import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MazeType } from '../../services/maze-generator.service';
import { PathAlgorithm } from '../../services/pathfinding.service';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.scss',
})
export class ControlsComponent {
  mazeType: MazeType = 'dfs-backtracking';
  algorithm: PathAlgorithm = 'bfs';
  speed = 120;

  @Output() mazeGenerate = new EventEmitter<MazeType>();
  @Output() visualize = new EventEmitter<PathAlgorithm>();
  @Output() clearGrid = new EventEmitter<void>();
  @Output() clearPath = new EventEmitter<void>();
  @Output() speedChange = new EventEmitter<number>();

  onGenerate(): void {
    this.mazeGenerate.emit(this.mazeType);
  }

  onVisualize(): void {
    this.visualize.emit(this.algorithm);
  }

  onClearGrid(): void {
    this.clearGrid.emit();
  }

  onClearPath(): void {
    this.clearPath.emit();
  }

  onSpeedChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    this.speed = value;
    this.speedChange.emit(value);
  }
}
