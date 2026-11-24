import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CRANE_TYPES } from '../../core/models/crane.models';
import { CraneService } from '../../core/services/crane.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-crane-parameters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card params-card">
      <div class="card-header">
        <div class="header-left">
          <!-- Pencil/Edit icon -->
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span class="card-title">Crane Parameters</span>
        </div>
      </div>

      <div class="card-body">
        <form [formGroup]="paramForm" class="params-form" (ngSubmit)="onValidateAndGenerate()">
          <!-- Design Name -->
          <div class="form-row">
            <label class="form-label" for="designName">
              Design Name <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <input
                id="designName"
                type="text"
                class="form-control"
                formControlName="designName"
                placeholder="e.g. Workshop Crane 01"
              />
              @if (isFieldInvalid('designName')) {
                <span class="field-error">Design name is required</span>
              }
            </div>
          </div>

          <!-- Crane Type -->
          <div class="form-row">
            <label class="form-label" for="craneType">Crane Type</label>
            <div class="input-wrapper select-wrapper">
              <select id="craneType" class="form-control select-control" formControlName="craneType">
                @for (type of craneTypes; track type) {
                  <option [value]="type">{{ type }}</option>
                }
              </select>
              <svg class="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          <!-- Capacity (tonnes) -->
          <div class="form-row">
            <label class="form-label" for="capacityTonnes">
              Capacity (tonnes) <span class="required">*</span>
            </label>
            <div class="input-wrapper with-unit">
              <input
                id="capacityTonnes"
                type="number"
                step="0.5"
                min="0.5"
                class="form-control"
                formControlName="capacityTonnes"
              />
              <span class="unit-badge">t</span>
              @if (isFieldInvalid('capacityTonnes')) {
                <span class="field-error">Valid capacity > 0 is required</span>
              }
            </div>
          </div>

          <!-- Span (mm) -->
          <div class="form-row">
            <label class="form-label" for="spanMm">
              Span <span class="required">*</span>
            </label>
            <div class="input-wrapper with-unit">
              <input
                id="spanMm"
                type="number"
                step="100"
                min="1000"
                class="form-control"
                formControlName="spanMm"
              />
              <span class="unit-badge">mm</span>
              @if (isFieldInvalid('spanMm')) {
                <span class="field-error">Valid span (mm) is required</span>
              }
            </div>
          </div>

          <!-- Lift Height (mm) -->
          <div class="form-row">
            <label class="form-label" for="liftHeightMm">
              Lift Height <span class="required">*</span>
            </label>
            <div class="input-wrapper with-unit">
              <input
                id="liftHeightMm"
                type="number"
                step="100"
                min="1000"
                class="form-control"
                formControlName="liftHeightMm"
              />
              <span class="unit-badge">mm</span>
              @if (isFieldInvalid('liftHeightMm')) {
                <span class="field-error">Lift height must be > 0</span>
              }
            </div>
          </div>

          <!-- Runway Width (mm) -->
          <div class="form-row">
            <label class="form-label" for="runwayWidthMm">
              Runway Width <span class="required">*</span>
            </label>
            <div class="input-wrapper with-unit">
              <input
                id="runwayWidthMm"
                type="number"
                step="100"
                min="1000"
                class="form-control"
                formControlName="runwayWidthMm"
              />
              <span class="unit-badge">mm</span>
              @if (isFieldInvalid('runwayWidthMm')) {
                <span class="field-error">Runway width must be > 0</span>
              }
            </div>
          </div>

          <!-- Hoist Position (mm) -->
          <div class="form-row">
            <label class="form-label" for="hoistPositionMm">
              Hoist Position <span class="required">*</span>
            </label>
            <div class="input-wrapper with-unit">
              <input
                id="hoistPositionMm"
                type="number"
                step="100"
                min="500"
                class="form-control"
                formControlName="hoistPositionMm"
              />
              <span class="unit-badge">mm</span>
              @if (isFieldInvalid('hoistPositionMm')) {
                <span class="field-error">Hoist position must be > 0 and &le; Span</span>
              }
            </div>
          </div>

          <!-- Building Height (mm) -->
          <div class="form-row">
            <label class="form-label" for="buildingHeightMm">
              Building Height <span class="required">*</span>
            </label>
            <div class="input-wrapper with-unit">
              <input
                id="buildingHeightMm"
                type="number"
                step="100"
                min="1000"
                class="form-control"
                formControlName="buildingHeightMm"
              />
              <span class="unit-badge">mm</span>
              @if (isFieldInvalid('buildingHeightMm')) {
                <span class="field-error">Building height must be &gt; Lift height</span>
              }
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <!-- Validate & Generate -->
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="craneService.isGenerating()"
            >
              <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Validate &amp; Generate
            </button>

            <!-- Save Design -->
            <button
              type="button"
              class="btn btn-secondary"
              (click)="onSaveDesign()"
              [disabled]="craneService.isSaving()"
            >
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Save Design
            </button>

            <!-- Download PDF -->
            <button
              type="button"
              class="btn btn-outline"
              (click)="onDownloadPdf()"
            >
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .params-card {
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

    .card-body {
      padding: 1.25rem;
      background-color: #ffffff;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .params-form {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      flex: 1;
    }

    .form-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      align-items: center;
      gap: 0.75rem;
    }

    .form-label {
      font-size: 0.82rem;
      font-weight: 500;
      color: #334155;
      margin: 0;
      line-height: 1.3;
    }

    .required {
      color: #ef4444;
      font-weight: bold;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .input-wrapper.with-unit {
      flex-direction: row;
      align-items: center;
    }

    .input-wrapper.with-unit .form-control {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none;
    }

    .unit-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #f1f5f9;
      color: #64748b;
      border: 1px solid #cbd5e1;
      border-left: none;
      padding: 0.45rem 0.65rem;
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      min-width: 38px;
      height: 36px;
      box-sizing: border-box;
    }

    .form-control {
      width: 100%;
      height: 36px;
      padding: 0.45rem 0.75rem;
      font-size: 0.85rem;
      color: #0f172a;
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .form-control:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .select-wrapper {
      position: relative;
    }

    .select-control {
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
      padding-right: 2rem;
    }

    .select-chevron {
      position: absolute;
      right: 0.65rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      color: #64748b;
      pointer-events: none;
    }

    .field-error {
      font-size: 0.72rem;
      color: #dc2626;
      margin-top: 0.2rem;
    }

    .form-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid #f1f5f9;
    }

    @media (min-width: 480px) {
      .form-actions {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      height: 38px;
      padding: 0.4rem 0.6rem;
      font-size: 0.78rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
      text-decoration: none;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-icon {
      width: 0.95rem;
      height: 0.95rem;
      flex-shrink: 0;
    }

    /* Primary Blue */
    .btn-primary {
      background-color: #1a73e8;
      border: 1px solid #1a73e8;
      color: #ffffff;
      box-shadow: 0 1px 2px rgba(26, 115, 232, 0.25);
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #1557b0;
      border-color: #1557b0;
    }

    /* Secondary Blue */
    .btn-secondary {
      background-color: #0284c7;
      border: 1px solid #0284c7;
      color: #ffffff;
      box-shadow: 0 1px 2px rgba(2, 132, 199, 0.25);
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #0369a1;
      border-color: #0369a1;
    }

    /* Outline Button */
    .btn-outline {
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
    }

    .btn-outline:hover:not(:disabled) {
      background-color: #f8fafc;
      border-color: #94a3b8;
      color: #0f172a;
    }
  `]
})
export class CraneParametersComponent {
  readonly craneService = inject(CraneService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly craneTypes = CRANE_TYPES;

  paramForm: FormGroup = this.fb.group({
    designName: ['', [Validators.required, Validators.minLength(2)]],
    craneType: ['EOT Crane', [Validators.required]],
    capacityTonnes: [10, [Validators.required, Validators.min(0.1)]],
    spanMm: [25000, [Validators.required, Validators.min(1000)]],
    liftHeightMm: [8000, [Validators.required, Validators.min(1000)]],
    runwayWidthMm: [12500, [Validators.required, Validators.min(1000)]],
    hoistPositionMm: [12500, [Validators.required, Validators.min(100)]],
    buildingHeightMm: [9000, [Validators.required, Validators.min(1000)]]
  });

  constructor() {
    // Listen to changes in the service's currentFormValues signal
    effect(() => {
      const vals = this.craneService.currentFormValues();
      if (vals) {
        this.paramForm.patchValue(vals, { emitEvent: false });
      }
    });

    // Mark drawing as draft when user alters parameters
    this.paramForm.valueChanges.subscribe(vals => {
      if (this.paramForm.valid) {
        this.craneService.isValidDesign.set(false);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.paramForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onValidateAndGenerate(): void {
    if (this.paramForm.invalid) {
      this.paramForm.markAllAsTouched();
      this.toast.error('Please resolve all validation errors in the form before generating.', 'Form Invalid');
      return;
    }

    const formValues = this.paramForm.value;

    // Cross-field validation checks
    if (formValues.hoistPositionMm > formValues.spanMm) {
      this.toast.warning('Hoist Position cannot exceed the Crane Span.', 'Validation Warning');
      return;
    }

    if (formValues.liftHeightMm >= formValues.buildingHeightMm) {
      this.toast.warning('Lift Height must be less than Building Height to clear roof structures.', 'Validation Warning');
      return;
    }

    this.craneService.currentFormValues.set(formValues);
    const id = this.craneService.currentDesignId() || 1;
    this.craneService.generateDrawing(id, formValues).subscribe();
  }

  onSaveDesign(): void {
    if (this.paramForm.invalid) {
      this.paramForm.markAllAsTouched();
      this.toast.error('Please enter valid crane parameters before saving.', 'Cannot Save');
      return;
    }

    const formValues = this.paramForm.value;
    const currentId = this.craneService.currentDesignId();

    if (currentId && this.craneService.savedDesigns().some(d => d.id === currentId)) {
      this.craneService.updateDesign(currentId, formValues).subscribe();
    } else {
      this.craneService.createDesign(formValues).subscribe();
    }
  }

  onDownloadPdf(): void {
    const id = this.craneService.currentDesignId() || 1;
    const name = this.paramForm.get('designName')?.value || 'Workshop-Crane';
    this.craneService.downloadPdf(id, name);
  }
}
