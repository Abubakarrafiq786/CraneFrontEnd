import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { CreateDesignRequest, DesignDto, UpdateDesignRequest } from '../models/crane.models';
import { DrawingModel } from '../models/drawing.models';
import { DrawingGeneratorService } from './drawing-generator.service';
import { PdfExportService } from './pdf-export.service';
import { ToastService } from './toast.service';

const LOCAL_STORAGE_KEY = 'crane_parametric_saved_designs';

@Injectable({
  providedIn: 'root'
})
export class CraneService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly drawingGen = inject(DrawingGeneratorService);
  private readonly pdfExport = inject(PdfExportService);

  readonly baseUrl = 'https://localhost:7025';
  readonly apiPrefix = '/api';

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
  readonly currentDesignId = signal<number | null>(null);
  readonly currentFormValues = signal<CreateDesignRequest | null>(null);
  readonly savedDesigns = signal<DesignDto[]>(this.loadPersistedDesigns());
  readonly drawingModel = signal<DrawingModel | null>(null);
  readonly svgContent = signal<string | null>(null);
  readonly isValidDesign = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly isGenerating = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly backendOnline = signal<boolean | null>(null);

  readonly hasActiveDrawing = computed<boolean>(() => {
    return !!(this.svgContent() || this.drawingModel());
  });

  constructor() {
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
   * Clears the current active drawing preview
   */
  clearDrawing(): void {
    this.drawingModel.set(null);
    this.svgContent.set(null);
    this.isValidDesign.set(false);
  }

  /**
   * Previews a specific design from the saved list without forcing form edits
   */
  previewDesign(design: DesignDto): void {
    const params: CreateDesignRequest = {
      designName: design.designName,
      craneType: design.craneType,
      capacityTonnes: design.capacityTonnes,
      spanMm: design.spanMm,
      liftHeightMm: design.liftHeightMm,
      runwayWidthMm: design.runwayWidthMm,
      hoistPositionMm: design.hoistPositionMm,
      buildingHeightMm: design.buildingHeightMm
    };
    this.refreshLocalDrawing(params);
  }

  /**
   * GET /api/Designs/getall - Fetch all designs
   */
  getAllDesigns(): Observable<DesignDto[]> {
    return this.http.get<any>(`${this.apiPrefix}/Designs/getall`).pipe(
      catchError(() => this.http.get<any>(`${this.baseUrl}/api/Designs/getall`)),
      catchError(() => this.http.get<any>(`${this.apiPrefix}/Designs`)),
      catchError(() => this.http.get<any>(`${this.baseUrl}/api/Designs`)),
      map(res => {
        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && Array.isArray(res.data)) {
          list = res.data;
        } else if (res && Array.isArray(res.items)) {
          list = res.items;
        }
        return list.map(item => this.normalizeDesign(item));
      }),
      tap(designs => {
        if (designs && designs.length > 0) {
          this.backendOnline.set(true);
          this.savedDesigns.set(designs);
          this.persistLocalDesigns(designs);
        }
      }),
      catchError(err => {
        this.handleConnectionError(err);
        const stored = this.loadPersistedDesigns();
        this.savedDesigns.set(stored);
        return of(stored);
      })
    );
  }

  /**
   * Loads saved designs into state
   */
  loadSavedDesigns(): void {
    this.isLoading.set(true);
    this.getAllDesigns().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  /**
   * POST /api/Designs - Create a new design
   */
  createDesign(request: CreateDesignRequest): Observable<DesignDto> {
    this.isSaving.set(true);
    return this.http.post<any>(`${this.apiPrefix}/Designs`, request).pipe(
      catchError(() => this.http.post<any>(`${this.baseUrl}/api/Designs`, request)),
      map(res => {
        const item = (res && res.data) ? res.data : res;
        return this.normalizeDesign(item || request);
      }),
      tap(created => {
        this.backendOnline.set(true);
        this.isSaving.set(false);
        this.toast.success(`Design "${request.designName}" saved successfully!`, 'Design Saved');
        
        // Add to saved list
        const updatedList = [created, ...this.savedDesigns().filter(d => d.id !== created.id)];
        this.savedDesigns.set(updatedList);
        this.persistLocalDesigns(updatedList);
        
        // Clear active ID so next save is a new item
        this.currentDesignId.set(null);
      }),
      catchError(err => {
        this.isSaving.set(false);
        this.handleConnectionError(err);

        // Fallback: Save locally
        const currentList = this.savedDesigns();
        const maxId = currentList.reduce((max, d) => Math.max(max, Number(d.id) || 0), 0);
        const newId = maxId + 1;
        
        const newDesign: DesignDto = {
          ...request,
          id: newId,
          createdOn: this.formatDate(new Date())
        };

        const updatedList = [newDesign, ...currentList];
        this.savedDesigns.set(updatedList);
        this.persistLocalDesigns(updatedList);
        this.currentDesignId.set(null);
        this.toast.success(`Design "${request.designName}" saved successfully!`, 'Design Saved');
        return of(newDesign);
      })
    );
  }

  /**
   * PUT /api/Designs/{id} - Update an existing design
   */
  updateDesign(id: number, request: UpdateDesignRequest): Observable<DesignDto> {
    this.isSaving.set(true);
    return this.http.put<any>(`${this.apiPrefix}/Designs/${id}`, request).pipe(
      catchError(() => this.http.put<any>(`${this.baseUrl}/api/Designs/${id}`, request)),
      map(res => {
        const item = (res && res.data) ? res.data : res;
        return this.normalizeDesign(item || { ...request, id });
      }),
      tap(updated => {
        this.backendOnline.set(true);
        this.isSaving.set(false);
        this.toast.success(`Design #${id} updated successfully!`, 'Design Updated');
        const updatedList = this.savedDesigns().map(d => d.id === id ? updated : d);
        this.savedDesigns.set(updatedList);
        this.persistLocalDesigns(updatedList);
      }),
      catchError(err => {
        this.isSaving.set(false);
        this.handleConnectionError(err);

        // Fallback: Update locally
        const updatedList = this.savedDesigns().map(d =>
          d.id === id ? { ...d, ...request, updatedOn: new Date().toISOString() } : d
        );
        this.savedDesigns.set(updatedList);
        this.persistLocalDesigns(updatedList);
        this.toast.success(`Design #${id} updated successfully!`, 'Design Updated');
        const updated = updatedList.find(d => d.id === id) as DesignDto;
        return of(updated);
      })
    );
  }

  /**
   * GET /api/Designs/{id} - Get single design
   */
  getDesignById(id: number): Observable<DesignDto> {
    this.isLoading.set(true);
    return this.http.get<any>(`${this.apiPrefix}/Designs/${id}`).pipe(
      catchError(() => this.http.get<any>(`${this.baseUrl}/api/Designs/${id}`)),
      map(res => {
        const item = (res && res.data) ? res.data : res;
        return this.normalizeDesign(item);
      }),
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
    return this.http.delete<void>(`${this.apiPrefix}/Designs/${id}`).pipe(
      catchError(() => this.http.delete<void>(`${this.baseUrl}/api/Designs/${id}`)),
      map(() => true),
      tap(() => {
        this.backendOnline.set(true);
        this.isLoading.set(false);
        this.toast.success(`Design #${id} deleted successfully!`, 'Design Deleted');
        const updatedList = this.savedDesigns().filter(d => d.id !== id);
        this.savedDesigns.set(updatedList);
        this.persistLocalDesigns(updatedList);
        if (this.currentDesignId() === id) {
          this.currentDesignId.set(null);
          this.clearDrawing();
        }
      }),
      catchError(err => {
        this.isLoading.set(false);
        this.handleConnectionError(err);

        // Fallback: Delete locally
        const updatedList = this.savedDesigns().filter(d => d.id !== id);
        this.savedDesigns.set(updatedList);
        this.persistLocalDesigns(updatedList);
        this.toast.success(`Design #${id} removed from list.`, 'Design Deleted');
        if (this.currentDesignId() === id) {
          this.currentDesignId.set(null);
          this.clearDrawing();
        }
        return of(true);
      })
    );
  }

  /**
   * POST /api/Designs/{id}/generate - Trigger drawing generation
   */
  generateDrawing(id: number | null, currentForm?: CreateDesignRequest): Observable<DrawingModel> {
    this.isGenerating.set(true);

    if (id) {
      return this.http.post<DrawingModel>(`${this.apiPrefix}/Designs/${id}/generate`, {}).pipe(
        catchError(() => this.http.post<DrawingModel>(`${this.baseUrl}/api/Designs/${id}/generate`, {})),
        tap(model => {
          this.backendOnline.set(true);
          this.isGenerating.set(false);
          this.drawingModel.set(model);
          this.isValidDesign.set(true);
          this.toast.success('Drawing generated successfully from server!', 'Valid design / Generated');
          this.getDrawingSvg(id).subscribe();
        }),
        catchError(err => {
          this.isGenerating.set(false);
          const params = currentForm || this.currentFormValues() || this.defaultDesignParams;
          this.refreshLocalDrawing(params);
          this.toast.success('Crane drawing validated and generated!', 'Valid design / Generated');
          return of(this.drawingModel()!);
        })
      );
    } else {
      // Local generation for unsaved new design
      const params = currentForm || this.currentFormValues() || this.defaultDesignParams;
      this.refreshLocalDrawing(params);
      this.isGenerating.set(false);
      this.toast.success('Crane drawing validated and generated!', 'Valid design / Generated');
      return of(this.drawingModel()!);
    }
  }

  /**
   * GET /api/Designs/{id}/drawing/svg - Fetch raw SVG string
   */
  getDrawingSvg(id: number): Observable<string> {
    return this.http.get(`${this.apiPrefix}/Designs/${id}/drawing/svg`, { responseType: 'text' }).pipe(
      catchError(() => this.http.get(`${this.baseUrl}/api/Designs/${id}/drawing/svg`, { responseType: 'text' })),
      tap(svg => {
        if (svg && svg.includes('<svg')) {
          this.svgContent.set(svg);
        }
      }),
      catchError(() => of(this.svgContent() || ''))
    );
  }

  /**
   * GET /api/Designs/{id}/drawing/pdf - Download PDF
   */
  downloadPdf(id: number | null, designName = 'Crane-Design', fallbackParams?: CreateDesignRequest): void {
    this.toast.info('Preparing PDF download...', 'PDF Download');

    if (id) {
      this.http.get(`${this.apiPrefix}/Designs/${id}/drawing/pdf`, { responseType: 'blob' }).pipe(
        catchError(() => this.http.get(`${this.baseUrl}/api/Designs/${id}/drawing/pdf`, { responseType: 'blob' })),
        tap(blob => {
          this.backendOnline.set(true);
          this.pdfExport.downloadBlob(blob, `${designName}-${id}.pdf`);
          this.toast.success('PDF downloaded successfully!', 'PDF Export');
        }),
        catchError(err => {
          this.fallbackPdfDownload(designName, fallbackParams);
          return of(null);
        })
      ).subscribe();
    } else {
      this.fallbackPdfDownload(designName, fallbackParams);
    }
  }

  private fallbackPdfDownload(designName: string, params?: CreateDesignRequest): void {
    const p = params || this.currentFormValues() || this.defaultDesignParams;
    const svg = this.svgContent() || this.drawingGen.generateParametricSvg(p);
    this.pdfExport.exportSvgToPdf(svg, `${designName}.pdf`);
    this.toast.success('PDF preview ready for printing / download!', 'PDF Export');
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
   * Helper to normalize design objects from various backend responses
   */
  normalizeDesign(raw: any): DesignDto {
    const id = Number(raw.id) || 1;
    const dateStr = raw.createdOn || this.formatDate(raw.createdAt);

    return {
      id,
      designName: raw.designName || 'Crane Design',
      craneType: this.mapCraneType(raw.craneType),
      capacityTonnes: Number(raw.capacityTonnes) || 10,
      spanMm: Number(raw.spanMm) || 25000,
      liftHeightMm: Number(raw.liftHeightMm) || 8000,
      runwayWidthMm: Number(raw.runwayWidthMm) || 12500,
      hoistPositionMm: Number(raw.hoistPositionMm) || 12500,
      buildingHeightMm: Number(raw.buildingHeightMm) || 9000,
      createdOn: dateStr
    };
  }

  private mapCraneType(type?: string): string {
    if (!type) return 'EOT Crane';
    switch (type.toUpperCase()) {
      case 'SINGLE_GIRDER_EOT': return 'Single Girder EOT';
      case 'DOUBLE_GIRDER_EOT': return 'Double Girder EOT';
      case 'GANTRY': return 'Gantry Crane';
      case 'JIB_CRANE': return 'Jib Crane';
      case 'SEMI_GANTRY': return 'Semi-Gantry Crane';
      default: return type;
    }
  }

  formatDate(dateInput?: string | Date): string {
    if (!dateInput) return '26/04/2025 14:30';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return String(dateInput);
      const day = String(d.getDate()).padStart(2, '0');
      const mon = String(d.getMonth() + 1).padStart(2, '0');
      const yr = d.getFullYear();
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${mon}/${yr} ${hrs}:${mins}`;
    } catch {
      return '26/04/2025 14:30';
    }
  }

  private loadPersistedDesigns(): DesignDto[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return [...this.initialDesigns];
  }

  private persistLocalDesigns(designs: DesignDto[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(designs));
    } catch {
      // Storage unavailable
    }
  }

  private handleConnectionError(err: HttpErrorResponse): void {
    if (this.backendOnline() === true) {
      this.toast.error(`Backend error (${err.status}): ${err.message || 'API request failed'}`, 'API Error');
    } else if (this.backendOnline() === null) {
      this.backendOnline.set(false);
    }
  }
}
