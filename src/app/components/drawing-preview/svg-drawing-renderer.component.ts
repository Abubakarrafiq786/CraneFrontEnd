import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  DrawingDimension,
  DrawingElement,
  DrawingElementDrawingArc,
  DrawingModel,
  DrawingPoint
} from '../../core/models/drawing.models';

@Component({
  selector: 'app-svg-drawing-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="svg-renderer-wrapper">
      @if (rawSvgString()) {
        <!-- Render sanitized raw SVG string directly -->
        <div class="raw-svg-container" [innerHTML]="sanitizedRawSvg()"></div>
      } @else if (model()) {
        <!-- Render dynamic DrawingModel primitives -->
        <div class="drawing-model-svg-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            [attr.viewBox]="sheetViewBox()"
            width="100%"
            height="100%"
            class="model-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <marker
                id="model-arrow-start"
                viewBox="0 0 10 10"
                refX="2"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 10 2 L 0 5 L 10 8 z" fill="#1e293b" />
              </marker>
              <marker
                id="model-arrow-end"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 2 L 10 5 L 0 8 z" fill="#1e293b" />
              </marker>
            </defs>

            <!-- Sheet Margins -->
            @if (model()?.sheetMetadata; as meta) {
              <rect
                [attr.x]="meta.outerMargin || 10"
                [attr.y]="meta.outerMargin || 10"
                [attr.width]="(meta.sheetWidth || 1040) - (meta.outerMargin || 10) * 2"
                [attr.height]="(meta.sheetHeight || 660) - (meta.outerMargin || 10) * 2"
                fill="none"
                stroke="#1e293b"
                stroke-width="2"
              />
            }

            <!-- Views -->
            @for (view of model()?.views || []; track view.name) {
              <g class="drawing-view">
                <text
                  [attr.x]="view.x + view.width / 2"
                  [attr.y]="view.y + 18"
                  font-size="13"
                  font-weight="700"
                  text-anchor="middle"
                  fill="#0f172a"
                >
                  {{ view.name }}
                </text>
              </g>
            }

            <!-- Primitives Elements -->
            @for (el of model()?.elements || []; track $index) {
              @switch (el.$type) {
                @case ('line') {
                  <line
                    [attr.x1]="el.x1"
                    [attr.y1]="el.y1"
                    [attr.x2]="el.x2"
                    [attr.y2]="el.y2"
                    [attr.stroke]="el.stroke || '#1e293b'"
                    [attr.stroke-width]="el.strokeWidth || 1"
                  />
                }
                @case ('centerline') {
                  <line
                    [attr.x1]="el.x1"
                    [attr.y1]="el.y1"
                    [attr.x2]="el.x2"
                    [attr.y2]="el.y2"
                    [attr.stroke]="el.stroke || '#b45309'"
                    [attr.stroke-width]="el.strokeWidth || 1"
                    stroke-dasharray="8,3,2,3"
                  />
                }
                @case ('rectangle') {
                  <rect
                    [attr.x]="el.x"
                    [attr.y]="el.y"
                    [attr.width]="el.width"
                    [attr.height]="el.height"
                    [attr.fill]="el.fill || 'none'"
                    [attr.stroke]="el.stroke || '#1e293b'"
                    [attr.stroke-width]="el.strokeWidth || 1"
                  />
                }
                @case ('circle') {
                  <circle
                    [attr.cx]="el.centerX"
                    [attr.cy]="el.centerY"
                    [attr.r]="el.radius"
                    [attr.fill]="el.fill || 'none'"
                    [attr.stroke]="el.stroke || '#1e293b'"
                    [attr.stroke-width]="el.strokeWidth || 1"
                  />
                }
                @case ('polyline') {
                  <polyline
                    [attr.points]="formatPoints(el.points)"
                    [attr.fill]="el.fill || 'none'"
                    [attr.stroke]="el.stroke || '#1e293b'"
                    [attr.stroke-width]="el.strokeWidth || 1"
                  />
                }
                @case ('arc') {
                  <path
                    [attr.d]="formatArcPath(el)"
                    [attr.fill]="el.fill || 'none'"
                    [attr.stroke]="el.stroke || '#1e293b'"
                    [attr.stroke-width]="el.strokeWidth || 1"
                  />
                }
                @case ('text') {
                  <text
                    [attr.x]="el.x"
                    [attr.y]="el.y"
                    [attr.font-size]="el.fontSize || 12"
                    [attr.font-weight]="el.fontWeight || 'normal'"
                    [attr.text-anchor]="el.textAnchor || 'start'"
                    [attr.fill]="el.fill || '#0f172a'"
                  >
                    {{ el.content }}
                  </text>
                }
              }
            }

            <!-- Dimensions -->
            @for (dim of model()?.dimensions || []; track $index) {
              <g class="cad-dimension">
                <line
                  [attr.x1]="dim.x1"
                  [attr.y1]="dim.y1"
                  [attr.x2]="dim.x2"
                  [attr.y2]="dim.y2"
                  stroke="#1e293b"
                  stroke-width="1.2"
                  marker-start="url(#model-arrow-start)"
                  marker-end="url(#model-arrow-end)"
                />
                <rect
                  [attr.x]="(dim.x1 + dim.x2) / 2 - 35"
                  [attr.y]="(dim.y1 + dim.y2) / 2 - 8"
                  width="70"
                  height="16"
                  fill="#ffffff"
                />
                <text
                  [attr.x]="(dim.x1 + dim.x2) / 2"
                  [attr.y]="(dim.y1 + dim.y2) / 2 + 4"
                  font-size="11"
                  font-weight="600"
                  text-anchor="middle"
                  fill="#0f172a"
                >
                  {{ dim.label }}
                </text>
              </g>
            }

            <!-- Technical Data & Title Block -->
            @if (model()?.technicalData; as tech) {
              <g class="model-title-block" transform="translate(25, 555)">
                <rect x="0" y="0" width="990" height="90" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
                <line x1="600" y1="0" x2="600" y2="90" stroke="#0f172a" stroke-width="1.8" />
                <rect x="0" y="0" width="600" height="22" fill="#f8fafc" stroke="#0f172a" stroke-width="1.2" />
                <text x="12" y="15" font-size="12" font-weight="700" fill="#0f172a">TECHNICAL DATA</text>
                <line x1="0" y1="44" x2="600" y2="44" stroke="#cbd5e1" stroke-width="1" />
                <line x1="0" y1="67" x2="600" y2="67" stroke="#cbd5e1" stroke-width="1" />
                <line x1="300" y1="22" x2="300" y2="90" stroke="#cbd5e1" stroke-width="1" />

                <!-- Values -->
                <text x="12" y="37" font-size="11" font-weight="600" fill="#334155">Crane Capacity</text>
                <text x="125" y="37" font-size="11" fill="#0f172a">: {{ tech.capacityTonnes }} tonnes</text>
                <text x="312" y="37" font-size="11" font-weight="600" fill="#334155">Runway Width</text>
                <text x="425" y="37" font-size="11" fill="#0f172a">: {{ (tech.runwayWidthMm || 12500) | number }} mm</text>

                <text x="12" y="59" font-size="11" font-weight="600" fill="#334155">Span</text>
                <text x="125" y="59" font-size="11" fill="#0f172a">: {{ (tech.spanMm || 25000) | number }} mm</text>
                <text x="312" y="59" font-size="11" font-weight="600" fill="#334155">Hoist Position</text>
                <text x="425" y="59" font-size="11" fill="#0f172a">: {{ (tech.hoistPositionMm || 12500) | number }} mm</text>

                <text x="12" y="82" font-size="11" font-weight="600" fill="#334155">Lift Height</text>
                <text x="125" y="82" font-size="11" fill="#0f172a">: {{ (tech.liftHeightMm || 8000) | number }} mm</text>
                <text x="312" y="82" font-size="11" font-weight="600" fill="#334155">Building Height</text>
                <text x="425" y="82" font-size="11" fill="#0f172a">: {{ (tech.buildingHeightMm || 9000) | number }} mm</text>

                <!-- Right Title block -->
                <text x="795" y="24" font-size="13" font-weight="800" text-anchor="middle" fill="#0f172a">PARAMETRIC CRANE DRAWING</text>
                <line x1="600" y1="34" x2="990" y2="34" stroke="#0f172a" stroke-width="1.2" />
                <line x1="600" y1="62" x2="990" y2="62" stroke="#cbd5e1" stroke-width="1" />
                <line x1="750" y1="34" x2="750" y2="62" stroke="#cbd5e1" stroke-width="1" />
                <line x1="840" y1="34" x2="840" y2="62" stroke="#cbd5e1" stroke-width="1" />
                <text x="612" y="51" font-size="10.5" fill="#334155">Drawing No: {{ tech.drawingNumber || 'CRN-001' }}</text>
                <text x="760" y="51" font-size="10.5" fill="#334155">Rev: {{ tech.revision || 'A' }}</text>
                <text x="850" y="51" font-size="10.5" fill="#334155">Scale: 1:100</text>
                <line x1="750" y1="62" x2="750" y2="90" stroke="#cbd5e1" stroke-width="1" />
                <text x="612" y="79" font-size="10.5" fill="#334155">Date: 2025-04-26</text>
                <text x="865" y="74" font-size="10.5" font-weight="600" text-anchor="middle" fill="#0f172a">Conceptual Design</text>
                <text x="865" y="86" font-size="9" text-anchor="middle" fill="#64748b">( Not for Fabrication )</text>
              </g>
            }
          </svg>
        </div>
      } @else {
        <div class="no-drawing-placeholder">
          <p>No drawing data available. Click "Validate & Generate" to produce the crane technical drawing.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .svg-renderer-wrapper {
      width: 100%;
      height: 100%;
      min-height: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff;
      overflow: auto;
      border-radius: 4px;
    }

    .raw-svg-container, .drawing-model-svg-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    ::ng-deep .raw-svg-container svg {
      width: 100%;
      height: auto;
      max-height: 520px;
      display: block;
      margin: 0 auto;
    }

    .model-svg {
      width: 100%;
      height: auto;
      max-height: 520px;
      display: block;
      margin: 0 auto;
    }

    .no-drawing-placeholder {
      color: #64748b;
      font-size: 0.95rem;
      text-align: center;
      padding: 2rem;
    }
  `]
})
export class SvgDrawingRendererComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly rawSvgString = input<string | null>(null);
  readonly model = input<DrawingModel | null>(null);

  readonly sanitizedRawSvg = computed<SafeHtml>(() => {
    const raw = this.rawSvgString();
    return raw ? this.sanitizer.bypassSecurityTrustHtml(raw) : '';
  });

  readonly sheetViewBox = computed<string>(() => {
    const m = this.model()?.sheetMetadata;
    const w = m?.sheetWidth || 1040;
    const h = m?.sheetHeight || 670;
    return `0 0 ${w} ${h}`;
  });

  formatPoints(points?: DrawingPoint[] | any): string {
    if (!points || !Array.isArray(points)) return '';
    return points.map(p => `${p.x},${p.y}`).join(' ');
  }

  formatArcPath(el: any): string {
    const cx = Number(el?.centerX) || 0;
    const cy = Number(el?.centerY) || 0;
    const r = Number(el?.radius) || 10;
    const startRad = ((Number(el?.startAngleDegrees) || 0) * Math.PI) / 180;
    const endRad = ((Number(el?.endAngleDegrees) || 180) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const delta = (Number(el?.endAngleDegrees) || 180) - (Number(el?.startAngleDegrees) || 0);
    const largeArcFlag = delta <= 180 ? '0' : '1';
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  }
}
