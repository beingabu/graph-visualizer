import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExplanationSections } from '../../services/ai-explainer.service';

@Component({
  selector: 'app-explanation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explanation.component.html',
  styleUrl: './explanation.component.scss',
})
export class ExplanationComponent {
  @Input() loading = false;
  @Input() explanation: ExplanationSections | null = null;
}
