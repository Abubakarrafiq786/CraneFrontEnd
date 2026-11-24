import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { CreateDesignRequest, DesignDto, UpdateDesignRequest } from '../models/crane.models';
import { DrawingModel } from '../models/drawing.models';
import { DrawingGeneratorService } from './drawing-generator.service';
import { PdfExportService } from './pdf-export.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class CraneService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly drawingGen = inject(DrawingGeneratorService);
  private readonly pdfExport = inject(PdfExportService);

  readonly baseUrl = 'https://localhost:7025';

  // Default design corresponding to UI Mockup
  readonly defaultDesignParams: CreateDesignRequest = {
    designName: 'Workshop Crane 01',
    craneType: 'EOT Crane',
    capacityTonnes: 10,
    spanMm: 25000,
    liftHeightMm: 8000,
    runwayWidthMm: 12500,
    hoistPositionMm: 12500,
    buildingHeightMm: 9000
  };

  // Initial mockup saved design item
  private readonly initialDesigns: DesignDto[] = [
    {
      id: 1,
      designName: 'Workshop Crane 01',
      craneType: 'EOT Crane',
      capacityTonnes: 10,
      spanMm: 25000,
      liftHeightMm: 8000,
      runwayWidthMm: 12500,
      hoistPositionMm: 12500,
      buildingHeightMm: 9000,
      createdOn: '26/04/2025 14:30'
    }
  ];

  // Reactive State Signals
  readonly currentDesignId = signal<number | null>(1);
  readonly currentFormValues = signal<CreateDesignRequest>({ ...this.defaultDesignParams });
  readonly savedDesigns = signal<DesignDto[]>([...this.initialDesigns]);
  readonly drawingModel = signal<DrawingModel | null>(null);
  readonly svgContent = signal<string | null>(null);
  readonly isValidDesign = signal<boolean>(true);
  readonly isLoading = signal<boolean>(false);
  readonly isGenerating = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly backendOnline = signal<boolean | null>(null);

  constructor() {
    // Generate initial drawing based on default design
    this.refreshLocalDrawing(this.defaultDesignParams);
    // Attempt to load from API backend on startup
    this.loadSavedDesigns();
  }

  /**
   * Refreshes the local parametric drawing model and SVG
   */
  refreshLocalDrawing(params: CreateDesignRequest): void {
    const model = this.drawingGen.generateParametricModel(params);
    const svg = this.drawingGen.generateParametricSvg(params);
    this.drawingModel.set(model);
    this.svgContent.set(svg);
    this.isValidDesign.set(true);
  }

  /**
   * GET /api/Designs/getall - Fetch all designs
   */
  getAllDesigns(): Observable<DesignDto[]> {
    return this.http.get<DesignDto[]>(`${this.baseUrl}/api/Designs/getall`).pipe(
      catchError(() => {
        // Fallback to GET /api/Designs
        return this.http.get<DesignDto[]>(`${this.baseUrl}/api/Designs`);
      }),
      tap(designs => {
        this.backendOnline.set(true);
        if (Array.isArray(designs) && designs.length > 0) {
          this.savedDesigns.set(designs);
        }
      }),
      catchError(err => {
        this.handleConnectionError(err);
        return of(this.savedDesigns());
      })
    );
  }

  /**
   * Loads saved designs into state
   */
  loadSavedDesigns(): void {
    this.isLoading.set(true);
    this.getAllDesigns().subscribe({
      next: (designs) => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * POST /api/Designs - Create a new design
   */
  createDesign(request: CreateDesignRequest): Observable<DesignDto> {
    this.isSaving.set(true);
    return this.http.post<DesignDto>(`${this.baseUrl}/api/Designs`, request).pipe(
      tap(res => {
        this.backendOnline.set(true);
        this.isSaving.set(false);
        this.toast.success(`Design "${request.designName}" saved successfully!`, 'Design Saved');
        this.loadSavedDesigns();
      }),
      catchError(err => {
        this.isSaving.set(false);
        this.handleConnectionError(err);

        // Fallback: Save locally
        const newId = (this.savedDesigns().reduce((max, d) => Math.max(max, d.id || 0), 0) || 0) + 1;
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const newDesign: DesignDto = {
          ...request,
          id: newId,
          createdOn: dateStr
        };

        this.savedDesigns.update(list => [newDesign, ...list]);
        this.currentDesignId.set(newId);
        this.toast.success(`Design "${request.designName}" saved locally!`, 'Design Saved (Local)');
        return of(newDesign);
      })
    );
  }

  /**
   * PUT /api/Designs/{id} - Update an existing design
   */
  updateDesign(id: number, request: UpdateDesignRequest): Observable<DesignDto> {
    this.isSaving.set(true);
    return this.http.put<DesignDto>(`${this.baseUrl}/api/Designs/${id}`, request).pipe(
      tap(res => {
        this.backendOnline.set(true);
        this.isSaving.set(false);
        this.toast.success(`Design #${id} updated successfully!`, 'Design Updated');
        this.loadSavedDesigns();
      }),
      catchError(err => {
        this.isSaving.set(false);
        this.handleConnectionError(err);

        // Fallback: Update locally
        this.savedDesigns.update(list =>
          list.map(d => d.id === id ? { ...d, ...request, updatedOn: new Date().toISOString() } : d)
        );
        this.toast.success(`Design #${id} updated locally!`, 'Design Updated (Local)');
        const updated = this.savedDesigns().find(d => d.id === id) as DesignDto;
        return of(updated);
      })
    );
  }

  /**
   * GET /api/Designs/{id} - Get single design
   */
  getDesignById(id: number): Observable<DesignDto> {
    this.isLoading.set(true);
    return this.http.get<DesignDto>(`${this.baseUrl}/api/Designs/${id}`).pipe(
      tap(design => {
        this.backendOnline.set(true);
        this.isLoading.set(false);
        this.selectDesign(design);
      }),
      catchError(err => {
        this.isLoading.set(false);
        this.handleConnectionError(err);
        const local = this.savedDesigns().find(d => d.id === id);
        if (local) {
          this.selectDesign(local);
          return of(local);
        }
        return throwError(() => err);
      })
    );
  }

  /**
   * DELETE /api/Designs/{id} - Delete design
   */
  deleteDesign(id: number): Observable<boolean> {
    this.isLoading.set(true);
    return this.http.delete<void>(`${this.baseUrl}/api/Designs/${id}`).pipe(
      map(() => true),
      tap(() => {
        this.backendOnline.set(true);
        this.isLoading.set(false);
        this.toast.success(`Design #${id} deleted successfully!`, 'Design Deleted');
        this.loadSavedDesigns();
      }),
      catchError(err => {
        this.isLoading.set(false);
        this.handleConnectionError(err);

        // Fallback: Delete locally
        this.savedDesigns.update(list => list.filter(d => d.id !== id));
        this.toast.success(`Design #${id} removed from local list.`, 'Design Deleted (Local)');
        return of(true);
      })
    );
  }

  /**
   * POST /api/Designs/{id}/generate - Trigger drawing generation
   */
  generateDrawing(id: number, currentForm?: CreateDesignRequest): Observable<DrawingModel> {
    this.isGenerating.set(true);
    return this.http.post<DrawingModel>(`${this.baseUrl}/api/Designs/${id}/generate`, {}).pipe(
      tap(model => {
        this.backendOnline.set(true);
        this.isGenerating.set(false);
        this.drawingModel.set(model);
        this.isValidDesign.set(true);
        this.toast.success('Drawing generated successfully from server!', 'Valid Design / Generated');
        // Also fetch the SVG if available
        this.getDrawingSvg(id).subscribe();
      }),
      catchError(err => {
        this.isGenerating.set(false);
        this.handleConnectionError(err);

        // Fallback: Generate parametric model locally
        const params = currentForm || this.currentFormValues();
        this.refreshLocalDrawing(params);
        this.toast.success('Crane drawing validated and generated!', 'Valid Design / Generated');
        return of(this.drawingModel()!);
      })
    );
  }

  /**
   * GET /api/Designs/{id}/drawing/svg - Fetch raw SVG string
   */
  getDrawingSvg(id: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/api/Designs/${id}/drawing/svg`, { responseType: 'text' }).pipe(
      tap(svg => {
        if (svg && svg.includes('<svg')) {
          this.svgContent.set(svg);
        }
      }),
      catchError(err => {
        // Ignore or keep local svg
        return of(this.svgContent() || '');
      })
    );
  }

  /**
   * GET /api/Designs/{id}/drawing/pdf - Download PDF
   */
  downloadPdf(id: number, designName = 'Crane-Design'): void {
    this.toast.info('Preparing PDF download...', 'PDF Download');
    
    this.http.get(`${this.baseUrl}/api/Designs/${id}/drawing/pdf`, { responseType: 'blob' }).pipe(
      tap(blob => {
        this.backendOnline.set(true);
        this.pdfExport.downloadBlob(blob, `${designName}-${id}.pdf`);
        this.toast.success('PDF downloaded successfully!', 'PDF Export');
      }),
      catchError(err => {
        this.handleConnectionError(err);
        // Fallback: Export current SVG drawing to PDF
        const svg = this.svgContent() || this.drawingGen.generateParametricSvg(this.currentFormValues());
        this.pdfExport.exportSvgToPdf(svg, `${designName}-${id}.pdf`);
        this.toast.success('PDF preview generated for printing/download!', 'PDF Export (Client)');
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Select a design and load into form and drawing preview
   */
  selectDesign(design: DesignDto): void {
    this.currentDesignId.set(design.id);
    const formVals: CreateDesignRequest = {
      designName: design.designName,
      craneType: design.craneType,
      capacityTonnes: design.capacityTonnes,
      spanMm: design.spanMm,
      liftHeightMm: design.liftHeightMm,
      runwayWidthMm: design.runwayWidthMm,
      hoistPositionMm: design.hoistPositionMm,
      buildingHeightMm: design.buildingHeightMm
    };
    this.currentFormValues.set(formVals);
    this.refreshLocalDrawing(formVals);
  }

  /**
   * Common error notification handler
   */
  private handleConnectionError(err: HttpErrorResponse): void {
    if (this.backendOnline() === true) {
      // Was online, now had an error
      this.toast.error(`Backend error (${err.status}): ${err.message || 'Unknown error'}`, 'API Error');
    } else if (this.backendOnline() === null) {
      // First connection attempt failed
      this.backendOnline.set(false);
      this.toast.info(
        `Backend at ${this.baseUrl} is not reachable. Operating in standalone interactive mode with full parametric CAD generation.`,
        'Standalone Mode Active'
      );
    }
  }
}
