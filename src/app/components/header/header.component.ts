import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CraneService } from '../../core/services/crane.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="header-left">
        <h2 class="page-title">Parametric Overhead Crane Drawing Generator</h2>
      </div>

      <div class="header-right">
        <!-- Backend API Status Indicator -->
        <div class="backend-pill" [class.online]="craneService.backendOnline() === true" [class.offline]="craneService.backendOnline() === false">
          <span class="status-dot"></span>
          @if (craneService.backendOnline() === true) {
            <span class="status-text">API Online (7025)</span>
          } @else if (craneService.backendOnline() === false) {
            <span class="status-text">Interactive Local Mode</span>
          } @else {
            <span class="status-text">Connecting API...</span>
          }
        </div>

        <!-- User Profile -->
        <div class="user-profile">
          <div class="avatar-circle">
            <svg class="avatar-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <span class="user-name">Student User</span>
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      height: 60px;
      background-color: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 90;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    .page-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.2px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .backend-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .backend-pill.online {
      background-color: #ecfdf5;
      color: #065f46;
      border-color: #a7f3d0;
    }

    .backend-pill.offline {
      background-color: #fef3c7;
      color: #92400e;
      border-color: #fde68a;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #94a3b8;
    }

    .online .status-dot {
      background-color: #10b981;
    }

    .offline .status-dot {
      background-color: #f59e0b;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.35rem 0.5rem;
      border-radius: 6px;
      transition: background-color 0.15s ease;
    }

    .user-profile:hover {
      background-color: #f8fafc;
    }

    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #3b82f6;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .avatar-icon {
      width: 20px;
      height: 20px;
    }

    .user-name {
      font-size: 0.88rem;
      font-weight: 500;
      color: #334155;
    }

    .chevron-icon {
      width: 0.9rem;
      height: 0.9rem;
      color: #64748b;
    }
  `]
})
export class HeaderComponent {
  readonly craneService = inject(CraneService);
}
