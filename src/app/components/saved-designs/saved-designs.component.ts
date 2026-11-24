import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DesignDto } from '../../core/models/crane.models';
import { CraneService } from '../../core/services/crane.service';

@Component({
  selector: 'app-saved-designs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card saved-designs-card">
      <div class="card-header">
        <span class="card-title">Saved Designs</span>
        <button
          type="button"
          class="btn-refresh"
          (click)="onRefresh()"
          [disabled]="craneService.isLoading()"
        >
          <!-- Refresh icon -->
          <svg
            class="refresh-icon"
            [class.spinning]="craneService.isLoading()"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Refresh
        </button>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-num">#</th>
                <th class="col-name">Design Name</th>
                <th class="col-type">Crane Type</th>
                <th class="col-cap">Capacity</th>
                <th class="col-span">Span</th>
                <th class="col-date">Created On</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (item of craneService.savedDesigns(); track item.id; let i = $index) {
                <tr [class.selected-row]="craneService.currentDesignId() === item.id">
                  <td class="col-num text-muted">{{ item.id || (i + 1) }}</td>
                  <td class="col-name font-medium">{{ item.designName }}</td>
                  <td class="col-type text-muted">{{ item.craneType }}</td>
                  <td class="col-cap">{{ item.capacityTonnes }} t</td>
                  <td class="col-span">{{ item.spanMm | number }} mm</td>
                  <td class="col-date text-muted">{{ item.createdOn || '26/04/2025 14:30' }}</td>
                  <td class="col-actions">
                    <div class="action-buttons">
                      <!-- Open Button (Blue) -->
                      <button
                        type="button"
                        class="btn-action btn-open"
                        (click)="onOpenDesign(item)"
                        title="Open and view design"
                      >
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                        Open
                      </button>

                      <!-- Edit Button (Light Blue) -->
                      <button
                        type="button"
                        class="btn-action btn-edit"
                        (click)="onEditDesign(item)"
                        title="Edit design parameters"
                      >
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 20h9"/>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                        Edit
                      </button>

                      <!-- Delete Button (Red) -->
                      <button
                        type="button"
                        class="btn-action btn-delete"
                        (click)="onDeleteDesign(item)"
                        title="Delete design"
                      >
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty-state">
                    No saved designs available. Configure parameters above and click "Save Design".
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .saved-designs-card {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      margin-top: 1.25rem;
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

    .card-title {
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 0.2px;
    }

    .btn-refresh {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      padding: 0.35rem 0.75rem;
      border-radius: 5px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-refresh:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .btn-refresh:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .refresh-icon {
      width: 0.9rem;
      height: 0.9rem;
    }

    .refresh-icon.spinning {
      animation: spin 0.8s linear infinite;
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;
    }

    .data-table th {
      background-color: #f8fafc;
      color: #475569;
      font-weight: 600;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #f1f5f9;
      white-space: nowrap;
    }

    .data-table th:last-child {
      border-right: none;
    }

    .data-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      border-right: 1px solid #f8fafc;
      color: #1e293b;
      vertical-align: middle;
      white-space: nowrap;
    }

    .data-table td:last-child {
      border-right: none;
    }

    .data-table tbody tr:hover {
      background-color: #f8fafc;
    }

    .selected-row {
      background-color: #eff6ff !important;
    }

    .font-medium {
      font-weight: 500;
      color: #0f172a;
    }

    .text-muted {
      color: #64748b;
    }

    .col-num {
      width: 50px;
      text-align: center;
    }

    .col-cap, .col-span {
      font-variant-numeric: tabular-nums;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.65rem;
      border-radius: 4px;
      font-size: 0.76rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
      color: #ffffff;
    }

    .action-icon {
      width: 0.85rem;
      height: 0.85rem;
    }

    /* Open Button */
    .btn-open {
      background-color: #2563eb;
    }

    .btn-open:hover {
      background-color: #1d4ed8;
    }

    /* Edit Button */
    .btn-edit {
      background-color: #0284c7;
    }

    .btn-edit:hover {
      background-color: #0369a1;
    }

    /* Delete Button */
    .btn-delete {
      background-color: #ef4444;
    }

    .btn-delete:hover {
      background-color: #dc2626;
    }

    .empty-state {
      text-align: center;
      padding: 2.5rem 1rem;
      color: #94a3b8;
      font-size: 0.9rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class SavedDesignsComponent {
  readonly craneService = inject(CraneService);

  onRefresh(): void {
    this.craneService.loadSavedDesigns();
  }

  onOpenDesign(design: DesignDto): void {
    this.craneService.selectDesign(design);
    this.craneService.generateDrawing(design.id, {
      designName: design.designName,
      craneType: design.craneType,
      capacityTonnes: design.capacityTonnes,
      spanMm: design.spanMm,
      liftHeightMm: design.liftHeightMm,
      runwayWidthMm: design.runwayWidthMm,
      hoistPositionMm: design.hoistPositionMm,
      buildingHeightMm: design.buildingHeightMm
    }).subscribe();
  }

  onEditDesign(design: DesignDto): void {
    this.craneService.selectDesign(design);
    // Smooth scroll to parameters card on smaller screens
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDeleteDesign(design: DesignDto): void {
    if (confirm(`Are you sure you want to delete "${design.designName}"?`)) {
      this.craneService.deleteDesign(design.id).subscribe();
    }
  }
}
