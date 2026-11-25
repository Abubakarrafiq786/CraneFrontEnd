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
          } @else if (craneService.hasActiveDrawing() && craneService.isValidDesign()) {
            <span class="status-badge valid">
              <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Valid design / Generated
            </span>
          } @else if (craneService.hasActiveDrawing()) {
            <span class="status-badge draft">
              <span class="draft-dot"></span>
              Draft / Parameters Modified
            </span>
          } @else {
            <span class="status-badge idle">
              <span class="idle-dot"></span>
              Ready / Waiting for Input
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

        @if (craneService.hasActiveDrawing()) {
          <app-svg-drawing-renderer
            [rawSvgString]="craneService.svgContent()"
            [model]="craneService.drawingModel()"
          ></app-svg-drawing-renderer>
        } @else {
          <!-- Placeholder State with Preview Icon when cleared or new design -->
          <div class="preview-placeholder">
            <div class="placeholder-icon-circle">
              <!-- Technical CAD Blueprint Drawing Icon -->
              <svg class="placeholder-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
                <!-- Crane Outline Icon -->
                <rect x="6" y="16" width="52" height="6" rx="1" fill="#e2e8f0" stroke="#0284c7"/>
                <line x1="12" y1="22" x2="12" y2="52" stroke="#64748b" stroke-width="3"/>
                <line x1="52" y1="22" x2="52" y2="52" stroke="#64748b" stroke-width="3"/>
                <rect x="26" y="12" width="12" height="6" rx="1" fill="#0284c7" stroke="#0369a1"/>
                <line x1="32" y1="18" x2="32" y2="34" stroke="#475569" stroke-width="2"/>
                <circle cx="32" cy="37" r="3" stroke="#0f172a" stroke-width="2"/>
                <path d="M32 40 C30 44 26 46 29 49 C32 51 35 48 34 45" fill="none" stroke="#0f172a" stroke-width="2"/>
                <line x1="6" y1="52" x2="58" y2="52" stroke="#334155" stroke-width="2"/>
              </svg>
            </div>
            <h4 class="placeholder-title">CAD Drawing Preview Area</h4>
            <p class="placeholder-desc">
              Select any design from the <strong>Saved Designs</strong> table below and click <strong>Preview</strong>, or enter parameters on the left and click <strong>Validate &amp; Generate</strong>.
            </p>
          </div>
        }
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

    .status-badge.idle {
      background-color: #475569;
      color: #e2e8f0;
    }

    .badge-icon {
      width: 0.85rem;
      height: 0.85rem;
    }

    .idle-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #94a3b8;
    }

    .draft-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ffffff;
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

    .preview-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
      flex: 1;
      background-color: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 6px;
      margin: 0.5rem;
    }

    .placeholder-icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .placeholder-icon {
      width: 48px;
      height: 48px;
      color: #0284c7;
    }

    .placeholder-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem;
    }

    .placeholder-desc {
      font-size: 0.88rem;
      color: #64748b;
      max-width: 420px;
      line-height: 1.5;
      margin: 0;
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.85);
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
