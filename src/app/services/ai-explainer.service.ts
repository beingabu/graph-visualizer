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
  private readonly baseUrl = '/api/explain';

  constructor(private http: HttpClient) {}

  explain(
    algorithm: PathAlgorithm,
    maze: MazeType,
    stats: PathStats,
    extraContext?: Record<string, unknown>
  ): Observable<ExplanationSections> {
    const body = {
      algorithm,
      maze,
      stats,
      extraContext: extraContext ?? {},
    };

    return this.http.post<ExplanationSections>(this.baseUrl, body);
  }
}
