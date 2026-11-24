import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CraneService } from '../../core/services/crane.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="app-sidebar">
      <!-- Top Brand Header -->
      <div class="sidebar-brand">
        <!-- Crane Hook & Trolley Icon -->
        <div class="brand-icon-wrapper">
          <svg class="brand-icon" viewBox="0 0 48 48" fill="none">
            <!-- Trolley & Hook Icon matching CAD branding -->
            <rect x="8" y="8" width="32" height="8" rx="2" fill="#ffffff"/>
            <circle cx="16" cy="20" r="3" fill="#93c5fd"/>
            <circle cx="32" cy="20" r="3" fill="#93c5fd"/>
            <line x1="24" y1="16" x2="24" y2="28" stroke="#ffffff" stroke-width="3"/>
            <circle cx="24" cy="30" r="3" fill="#ffffff"/>
            <path d="M 24 33 C 21 37 17 40 21 44 C 25 47 29 44 28 39 C 27 37 25 36 24 36" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="brand-title">Crane Drawing<br>Generator</h1>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <!-- Dashboard Link (Active) -->
        <button
          type="button"
          class="nav-item"
          [class.active]="activeSection === 'dashboard'"
          (click)="onNavigate('dashboard')"
        >
          <!-- Home Icon -->
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span class="nav-label">Dashboard</span>
        </button>

        <!-- Designs Link -->
        <button
          type="button"
          class="nav-item"
          [class.active]="activeSection === 'designs'"
          (click)="onNavigate('designs')"
        >
          <!-- Document Icon -->
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span class="nav-label">Designs</span>
        </button>

        <!-- New Design Link -->
        <button
          type="button"
          class="nav-item"
          [class.active]="activeSection === 'new'"
          (click)="onNewDesign()"
        >
          <!-- Plus Icon -->
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span class="nav-label">New Design</span>
        </button>

        <!-- Settings Link -->
        <button
          type="button"
          class="nav-item"
          [class.active]="activeSection === 'settings'"
          (click)="onNavigate('settings')"
        >
          <!-- Gear Icon -->
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span class="nav-label">Settings</span>
        </button>
      </nav>

      <!-- Bottom About Link -->
      <div class="sidebar-bottom">
        <button
          type="button"
          class="bottom-link"
          (click)="onOpenAbout()"
        >
          <!-- Info Icon -->
          <svg class="bottom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>About</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      width: 230px;
      min-width: 230px;
      background-color: #0d1e38;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      user-select: none;
      z-index: 100;
    }

    .sidebar-brand {
      padding: 1.5rem 1rem 1.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.75rem;
    }

    .brand-icon-wrapper {
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-icon {
      width: 44px;
      height: 44px;
    }

    .brand-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      line-height: 1.25;
      letter-spacing: 0.3px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 0.5rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.65rem 1rem;
      border-radius: 6px;
      background: transparent;
      border: none;
      color: #cbd5e1;
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all 0.15s ease;
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    .nav-item.active {
      background-color: #1a73e8;
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(26, 115, 232, 0.3);
    }

    .nav-icon {
      width: 1.15rem;
      height: 1.15rem;
      flex-shrink: 0;
    }

    .sidebar-bottom {
      padding: 1.25rem 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .bottom-link {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0.4rem 0.5rem;
      border-radius: 4px;
      transition: color 0.15s ease;
    }

    .bottom-link:hover {
      color: #ffffff;
    }

    .bottom-icon {
      width: 1.1rem;
      height: 1.1rem;
    }
  `]
})
export class SidebarComponent {
  private readonly craneService = inject(CraneService);
  private readonly toast = inject(ToastService);

  @Output() openAbout = new EventEmitter<void>();

  activeSection = 'dashboard';

  onNavigate(section: string): void {
    this.activeSection = section;
    if (section === 'designs') {
      const el = document.querySelector('.saved-designs-card');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'settings') {
      this.toast.info('Settings configured for API Base URL: https://localhost:7025/', 'Settings');
    }
  }

  onNewDesign(): void {
    const nextNumber = this.craneService.savedDesigns().length + 1;
    this.craneService.currentDesignId.set(null);
    this.craneService.currentFormValues.set({
      designName: `New Crane Design 0${nextNumber}`,
      craneType: 'EOT Crane',
      capacityTonnes: 10,
      spanMm: 25000,
      liftHeightMm: 8000,
      runwayWidthMm: 12500,
      hoistPositionMm: 12500,
      buildingHeightMm: 9000
    });
    this.craneService.refreshLocalDrawing(this.craneService.currentFormValues());
    this.toast.info('Initialized new blank design template.', 'New Design');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onOpenAbout(): void {
    this.openAbout.emit();
  }
}
