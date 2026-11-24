import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-about-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title-group">
            <svg class="modal-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <h3 class="modal-title">About Parametric Overhead Crane Generator</h3>
          </div>
          <button type="button" class="btn-close" (click)="onClose()">&times;</button>
        </div>

        <div class="modal-body">
          <p class="lead-text">
            This application is an engineering CAD generation system for Parametric Overhead Electric Overhead Traveling (EOT) Cranes, built according to industry standards and the OpenAPI v1 specification.
          </p>

          <h4 class="section-title">Backend API Architecture</h4>
          <p class="text-sm">Configured Base URL: <code>https://localhost:7025/</code></p>
          <ul class="endpoint-list">
            <li><code>GET /api/Designs/getall</code> - Retrieve all saved crane designs</li>
            <li><code>POST /api/Designs</code> - Save new crane design with parametric specifications</li>
            <li><code>POST /api/Designs/&#123;id&#125;/generate</code> - Compute drawing model &amp; technical attributes</li>
            <li><code>GET /api/Designs/&#123;id&#125;/drawing/svg</code> - Stream high-precision vector SVG</li>
            <li><code>GET /api/Designs/&#123;id&#125;/drawing/pdf</code> - Generate downloadable engineering PDF</li>
            <li><code>PUT /api/Designs/&#123;id&#125;</code> &amp; <code>DELETE /api/Designs/&#123;id&#125;</code> - Modify / Delete designs</li>
          </ul>

          <h4 class="section-title">Key Parametric Features</h4>
          <div class="features-grid">
            <div class="feature-card">
              <strong>Multi-View CAD Projection</strong>
              <p>Generates Main Elevation, Plan View, and Cross-Section A-A with real-time dimensioning.</p>
            </div>
            <div class="feature-card">
              <strong>Dynamic Title Block</strong>
              <p>Produces complete technical data tables and drawing revision metadata matching ISO/DIN standards.</p>
            </div>
            <div class="feature-card">
              <strong>Resilient Offline Fallback</strong>
              <p>Seamlessly operates both online with ASP.NET Core API and offline with local CAD computation.</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-primary" (click)="onClose()">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
      background: #ffffff;
      border-radius: 10px;
      max-width: 620px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      animation: scaleIn 0.2s ease-out;
    }

    .modal-header {
      background-color: #1e2e4a;
      color: #ffffff;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-title-group {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .modal-title-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: #93c5fd;
    }

    .modal-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .btn-close {
      background: transparent;
      border: none;
      color: #cbd5e1;
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
      padding: 0;
    }

    .btn-close:hover {
      color: #ffffff;
    }

    .modal-body {
      padding: 1.25rem;
      color: #334155;
      max-height: 70vh;
      overflow-y: auto;
    }

    .lead-text {
      font-size: 0.9rem;
      line-height: 1.5;
      color: #1e293b;
      margin-top: 0;
    }

    .section-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: #0f172a;
      margin: 1.25rem 0 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .text-sm {
      font-size: 0.82rem;
      color: #64748b;
      margin: 0 0 0.5rem;
    }

    code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.8rem;
    }

    .endpoint-list {
      margin: 0;
      padding-left: 1.25rem;
      font-size: 0.82rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
      margin-top: 0.75rem;
    }

    @media (min-width: 500px) {
      .features-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .feature-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.75rem;
      font-size: 0.8rem;
    }

    .feature-card strong {
      display: block;
      color: #0f172a;
      margin-bottom: 0.25rem;
    }

    .feature-card p {
      margin: 0;
      color: #64748b;
      line-height: 1.35;
    }

    .modal-footer {
      padding: 0.85rem 1.25rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
    }

    .btn-primary {
      background: #1a73e8;
      color: #ffffff;
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-primary:hover {
      background: #1557b0;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class AboutModalComponent {
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
