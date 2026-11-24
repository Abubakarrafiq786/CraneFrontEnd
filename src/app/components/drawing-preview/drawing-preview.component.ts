import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CraneService } from '../../core/services/crane.service';
import { SvgDrawingRendererComponent } from './svg-drawing-renderer.component';

@Component({
  selector: 'app-drawing-preview',
  standalone: true,
  imports: [CommonModule, SvgDrawingRendererComponent],
  template: `
    <div class="card preview-card">
      <div class="card-header">
        <div class="header-left">
          <!-- Image/Preview icon -->
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span class="card-title">Drawing Preview</span>
        </div>

        <div class="header-right">
          @if (craneService.isGenerating()) {
            <span class="status-badge generating">
              <span class="spinner-dot"></span>
              Generating Drawing...
            </span>
          } @else if (craneService.isValidDesign()) {
            <span class="status-badge valid">
              <!-- Green Check Icon -->
              <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Valid design / Generated
            </span>
          } @else {
            <span class="status-badge draft">
              <span class="draft-dot"></span>
              Draft / Parameters Modified
            </span>
          }
        </div>
      </div>

      <div class="card-body">
        @if (craneService.isGenerating()) {
          <div class="loading-overlay">
            <div class="spinner"></div>
            <span>Generating CAD Drawing Model...</span>
          </div>
        }
        <app-svg-drawing-renderer
          [rawSvgString]="craneService.svgContent()"
          [model]="craneService.drawingModel()"
        ></app-svg-drawing-renderer>
      </div>
    </div>
  `,
  styles: [`
    .preview-card {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .card-header {
      background-color: #1e2e4a;
      color: #ffffff;
      padding: 0.65rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 48px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .header-icon {
      width: 1.15rem;
      height: 1.15rem;
      color: #93c5fd;
    }

    .card-title {
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 0.2px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.2px;
    }

    .status-badge.valid {
      background-color: #15803d;
      color: #ffffff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    }

    .status-badge.generating {
      background-color: #2563eb;
      color: #ffffff;
    }

    .status-badge.draft {
      background-color: #f59e0b;
      color: #ffffff;
    }

    .badge-icon {
      width: 0.85rem;
      height: 0.85rem;
    }

    .card-body {
      position: relative;
      padding: 0.75rem;
      background-color: #ffffff;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 480px;
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.82);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      z-index: 10;
      color: #1e293b;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .spinner {
      width: 2.2rem;
      height: 2.2rem;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner-dot {
      width: 8px;
      height: 8px;
      background: #ffffff;
      border-radius: 50%;
      animation: pulse 1s infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }
  `]
})
export class DrawingPreviewComponent {
  readonly craneService = inject(CraneService);
}
