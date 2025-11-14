import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GridComponent } from './components/grid/grid.component';
import { ControlsComponent } from './components/controls/controls.component';
import { StatsComponent } from './components/stats/stats.component';
import { LegendComponent } from './components/legend/legend.component';
import { ExplanationComponent } from './components/explanation/explanation.component';
import { MazeType } from './services/maze-generator.service';
import { PathAlgorithm, PathStats } from './services/pathfinding.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    GridComponent, 
    ControlsComponent, 
    StatsComponent, 
    LegendComponent, 
    ExplanationComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Maze & Pathfinding Visualizer';
  @ViewChild(GridComponent) gridComponent?: GridComponent;

  stats: PathStats | null = null;
  currentAlgorithm: PathAlgorithm | null = null;
  private readonly minAnimationDelay = 5;
  private readonly maxAnimationDelay = 200;
  private readonly defaultSpeedSetting = 120;
  animationSpeed = this.mapSpeedToDelay(this.defaultSpeedSetting);

  handleGenerate(type: MazeType): void {
    this.gridComponent?.generateMaze(type);
  }

  handleVisualize(algorithm: PathAlgorithm): void {
    this.currentAlgorithm = algorithm;
    this.gridComponent?.visualizePath(algorithm);
  }

  handleClearGrid(): void {
    this.gridComponent?.resetGrid();
    this.stats = null;
  }

  handleClearPath(): void {
    this.gridComponent?.clearPath();
  }

  handleStatsChange(stats: PathStats): void {
    this.stats = stats;
  }

  handleSpeedChange(speedSetting: number): void {
    this.animationSpeed = this.mapSpeedToDelay(speedSetting);
  }

  private mapSpeedToDelay(value: number): number {
    const clamped = Math.min(Math.max(value, this.minAnimationDelay), this.maxAnimationDelay);
    return this.minAnimationDelay + this.maxAnimationDelay - clamped;
  }
}
