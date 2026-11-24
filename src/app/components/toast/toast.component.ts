import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastMessage, ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-card" [class]="'toast-' + toast.type">
          <!-- Icon -->
          <div class="toast-icon-wrapper">
            @switch (toast.type) {
              @case ('success') {
                <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              }
              @case ('error') {
                <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              }
              @case ('warning') {
                <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              }
              @default {
                <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              }
            }
          </div>

          <!-- Content -->
          <div class="toast-body">
            @if (toast.title) {
              <div class="toast-title">{{ toast.title }}</div>
            }
            <div class="toast-message">{{ toast.message }}</div>
          </div>

          <!-- Close button -->
          <button type="button" class="toast-close" (click)="dismiss(toast.id)">
            &times;
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      max-width: 420px;
      pointer-events: none;
    }

    .toast-card {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      animation: slideIn 0.25s ease-out;
    }

    .toast-icon-wrapper {
      flex-shrink: 0;
      margin-top: 1px;
    }

    .toast-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .toast-body {
      flex: 1;
    }

    .toast-title {
      font-size: 0.88rem;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 0.2rem;
    }

    .toast-message {
      font-size: 0.82rem;
      color: #475569;
      line-height: 1.4;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      margin-left: 0.5rem;
    }

    .toast-close:hover {
      color: #334155;
    }

    .toast-success {
      border-left: 4px solid #10b981;
    }
    .toast-success .toast-icon {
      color: #10b981;
    }

    .toast-error {
      border-left: 4px solid #ef4444;
    }
    .toast-error .toast-icon {
      color: #ef4444;
    }

    .toast-warning {
      border-left: 4px solid #f59e0b;
    }
    .toast-warning .toast-icon {
      color: #f59e0b;
    }

    .toast-info {
      border-left: 4px solid #3b82f6;
    }
    .toast-info .toast-icon {
      color: #3b82f6;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
