import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PathAlgorithm } from './pathfinding.service';
import { MazeType } from './maze-generator.service';
import { PathStats } from './pathfinding.service';

export interface ExplanationSections {
  whatAlgorithmDoes: string;
  whatHappenedThisRun: string;
  comparison: string;
}

interface GenericAiMessage {
  role: string;
  content: string;
}

interface GenericAiChoice {
  message: GenericAiMessage;
}

interface GenericAiResponse {
  success: boolean;
  data?: {
    choices?: GenericAiChoice[];
  };
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

    return this.http
      .post<GenericAiResponse>(this.baseUrl, { prompt, text })
      .pipe(map((response) => this.extractExplanation(response)));
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

  private extractExplanation(response: GenericAiResponse): ExplanationSections {
    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI explanation response missing content');
    }

    try {
      const parsed = JSON.parse(content);
      return {
        whatAlgorithmDoes: parsed.whatAlgorithmDoes ?? 'No explanation.',
        whatHappenedThisRun: parsed.whatHappenedThisRun ?? 'No run details provided.',
        comparison: parsed.comparison ?? 'No comparison provided.',
      };
    } catch (error) {
      throw new Error('Failed to parse AI explanation content');
    }
  }
}
