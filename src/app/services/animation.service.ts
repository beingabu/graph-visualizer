import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, mapTo, switchMap, take, timer, concatMap } from 'rxjs';

export interface AnimationControl {
  playing: boolean;
  speedMs: number;
}

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private speedSubject = new BehaviorSubject<number>(40);
  private playingSubject = new BehaviorSubject<boolean>(false);

  readonly speed$ = this.speedSubject.asObservable();
  readonly playing$ = this.playingSubject.asObservable();

  setSpeed(msPerStep: number): void {
    this.speedSubject.next(msPerStep);
  }

  play(): void {
    this.playingSubject.next(true);
  }

  pause(): void {
    this.playingSubject.next(false);
  }

  runSequence<T>(steps: T[]): Observable<T> {
    return from(steps).pipe(
      concatMap((step) =>
        this.speedSubject.pipe(
          take(1),
          switchMap((speed) => timer(Math.max(0, speed)).pipe(mapTo(step)))
        )
      )
    );
  }
}
