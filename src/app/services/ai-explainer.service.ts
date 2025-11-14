import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PathAlgorithm } from './pathfinding.service';
import { MazeType } from './maze-generator.service';
import { PathStats } from './pathfinding.service';

export interface ExplanationSections {
  whatAlgorithmDoes: string;
  whatHappenedThisRun: string;
  comparison: string;
}

@Injectable({ providedIn: 'root' })
export class AiExplainerService {
  private readonly baseUrl = 'https://epic-backend-hkeeg5uc5-beingmartinbmcs-projects.vercel.app/api/generic';

  constructor(private http: HttpClient) {}

  explain(
    algorithm: PathAlgorithm,
    maze: MazeType,
    stats: PathStats,
    extraContext?: Record<string, unknown>
  ): Observable<ExplanationSections> {
    const prompt = this.composePrompt();
    const text = this.composeTextPayload(algorithm, maze, stats, extraContext);

    return this.http.post<ExplanationSections>(this.baseUrl, { prompt, text });
  }

  private composePrompt(): string {
    return [
      'You are an AI assistant that explains maze generation and pathfinding runs.',
      'Return a strict JSON object with keys: whatAlgorithmDoes, whatHappenedThisRun, comparison.',
      'Each value should be 1-2 concise sentences tailored to the provided run details.',
      'No markdown, no code fences—just valid JSON.',
    ].join(' ');
  }

  private composeTextPayload(
    algorithm: PathAlgorithm,
    maze: MazeType,
    stats: PathStats,
    extraContext?: Record<string, unknown>
  ): string {
    const extra = extraContext && Object.keys(extraContext).length ? JSON.stringify(extraContext, null, 2) : 'none';
    return [`Algorithm: ${algorithm}`, `Maze type: ${maze}`, 'Stats:', `  - visitedCount: ${stats.visitedCount}`, `  - pathLength: ${stats.pathLength}`, `  - runtimeMs: ${stats.runtimeMs}`, `Additional context: ${extra}`].join('\n');
  }
}
