import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  /**
   * Triggers a download of a Blob file in the browser
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generates a printable technical drawing sheet or downloads vector SVG/PDF
   */
  exportSvgToPdf(svgString: string, filename = 'Crane-Drawing.pdf'): void {
    // Try to create a printable PDF view or vector PDF blob
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${filename}</title>
            <style>
              @page {
                size: A4 landscape;
                margin: 5mm;
              }
              body {
                margin: 0;
                padding: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
                background-color: #ffffff;
              }
              .drawing-container {
                width: 100%;
                max-width: 1100px;
                height: auto;
              }
              svg {
                width: 100%;
                height: auto;
              }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="drawing-container">
              ${svgString}
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      // If popup blocker is active, trigger direct SVG vector download with .pdf / .svg fallback
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      this.downloadBlob(blob, filename.replace('.pdf', '.svg'));
    }
  }
}
