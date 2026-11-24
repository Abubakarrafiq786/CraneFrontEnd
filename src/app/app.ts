import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AboutModalComponent } from './components/about-modal/about-modal.component';
import { CraneParametersComponent } from './components/crane-parameters/crane-parameters.component';
import { DrawingPreviewComponent } from './components/drawing-preview/drawing-preview.component';
import { HeaderComponent } from './components/header/header.component';
import { SavedDesignsComponent } from './components/saved-designs/saved-designs.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    CraneParametersComponent,
    DrawingPreviewComponent,
    SavedDesignsComponent,
    ToastComponent,
    AboutModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  showAboutModal = false;
}
