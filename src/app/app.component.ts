import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GridComponent } from './components/grid/grid.component';
import { ControlsComponent } from './components/controls/controls.component';
import { StatsComponent } from './components/stats/stats.component';
import { LegendComponent } from './components/legend/legend.component';
import { ExplanationComponent } from './components/explanation/explanation.component';
import { MazeType } from './services/maze-generator.service';
import { PathAlgorithm, PathStats } from './services/pathfinding.service';
import { AiExplainerService, ExplanationSections } from './services/ai-explainer.service';
import { Subscription } from 'rxjs';

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
  private lastMazeType: MazeType = 'dfs-backtracking';
  private readonly minAnimationDelay = 5;
  private readonly maxAnimationDelay = 200;
  private readonly defaultSpeedSetting = 120;
  animationSpeed = this.mapSpeedToDelay(this.defaultSpeedSetting);
  explanation: ExplanationSections | null = null;
  explanationLoading = false;
  private aiSub?: Subscription;

  constructor(private aiExplainer: AiExplainerService) {}

  handleGenerate(type: MazeType): void {
    this.gridComponent?.generateMaze(type);
    this.lastMazeType = type;
  }

  handleVisualize(algorithm: PathAlgorithm): void {
    this.currentAlgorithm = algorithm;
    this.gridComponent?.visualizePath(algorithm);
  }

  handleClearGrid(): void {
    this.gridComponent?.resetGrid();
    this.stats = null;
    this.resetExplanationState();
  }

  handleClearPath(): void {
    this.gridComponent?.clearPath();
  }

  handleStatsChange(stats: PathStats): void {
    this.stats = stats;
    this.fetchExplanation(stats);
  }

  handleSpeedChange(speedSetting: number): void {
    this.animationSpeed = this.mapSpeedToDelay(speedSetting);
  }

  private mapSpeedToDelay(value: number): number {
    const clamped = Math.min(Math.max(value, this.minAnimationDelay), this.maxAnimationDelay);
    return this.minAnimationDelay + this.maxAnimationDelay - clamped;
  }

  private fetchExplanation(stats: PathStats): void {
    if (!this.currentAlgorithm || !this.lastMazeType) {
      return;
    }

    this.explanationLoading = true;
    this.explanation = null;
    this.aiSub?.unsubscribe();
    this.aiSub = this.aiExplainer
      .explain(this.currentAlgorithm, this.lastMazeType, stats, {
        gridSize: `${this.gridComponent?.rows ?? 0}x${this.gridComponent?.cols ?? 0}`,
      })
      .subscribe({
        next: (response) => {
          this.explanation = response;
        },
        error: () => {
          this.explanation = null;
        },
        complete: () => {
          this.explanationLoading = false;
        },
      });
  }

  private resetExplanationState(): void {
    this.explanationLoading = false;
    this.explanation = null;
    this.aiSub?.unsubscribe();
    this.aiSub = undefined;
  }
}
