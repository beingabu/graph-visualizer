import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PathAlgorithm, PathStats } from '../../services/pathfinding.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent {
  @Input() stats: PathStats | null = null;
  @Input() algorithm: PathAlgorithm | null = null;
}
