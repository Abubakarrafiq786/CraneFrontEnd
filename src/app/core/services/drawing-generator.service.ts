import { Injectable } from '@angular/core';
import { CreateDesignRequest } from '../models/crane.models';
import {
  DrawingDimension,
  DrawingElement,
  DrawingModel,
  DrawingSheetMetadata,
  DrawingTechnicalData,
  DrawingView
} from '../models/drawing.models';

@Injectable({
  providedIn: 'root'
})
export class DrawingGeneratorService {

  formatNumber(val: number): string {
    return val.toLocaleString('en-US');
  }

  generateParametricModel(params: CreateDesignRequest, drawingNo = 'CRN-001', rev = 'A'): DrawingModel {
    const span = Number(params.spanMm) || 25000;
    const lift = Number(params.liftHeightMm) || 8000;
    const capacity = Number(params.capacityTonnes) || 10;
    const runwayWidth = Number(params.runwayWidthMm) || 12500;
    const hoistPos = Number(params.hoistPositionMm) || 12500;
    const buildingHeight = Number(params.buildingHeightMm) || 9000;
    const craneType = params.craneType || 'EOT Crane';
    const designName = params.designName || 'Workshop Crane 01';

    const sheetMetadata: DrawingSheetMetadata = {
      sheetWidth: 1050,
      sheetHeight: 680,
      outerMargin: 15,
      innerMargin: 25,
      gridColumns: 'A-F',
      gridRows: '1-6',
      projectTitle: 'PARAMETRIC CRANE DRAWING',
      units: 'mm',
      warningNotice: 'Conceptual Design (Not for Fabrication)'
    };

    const technicalData: DrawingTechnicalData = {
      designName,
      craneType,
      drawingNumber: drawingNo,
      revision: rev,
      capacityTonnes: capacity,
      spanMm: span,
      liftHeightMm: lift,
      runwayWidthMm: runwayWidth,
      hoistPositionMm: hoistPos,
      buildingHeightMm: buildingHeight,
      hoistingSpeed: '0.8 / 5.0 m/min',
      traversingSpeed: '2.0 / 20.0 m/min',
      travellingSpeed: '3.0 / 30.0 m/min',
      trolleyWeight: `${(capacity * 0.15).toFixed(1)} t`,
      craneWeight: `${(capacity * 0.8 + 4.5).toFixed(1)} t`,
      powerSupply: '380V / 3Ph / 50Hz',
      totalSupplyPower: `${(capacity * 2.2 + 8).toFixed(1)} kW`,
      craneGroup: 'ISO M5 / FEM 2m',
      bridgePaint: 'RAL 1003 Signal Yellow',
      specifications: [
        { label: 'Crane Capacity', value: `${capacity} tonnes` },
        { label: 'Span', value: `${this.formatNumber(span)} mm` },
        { label: 'Lift Height', value: `${this.formatNumber(lift)} mm` },
        { label: 'Runway Width', value: `${this.formatNumber(runwayWidth)} mm` },
        { label: 'Hoist Position', value: `${this.formatNumber(hoistPos)} mm` },
        { label: 'Building Height', value: `${this.formatNumber(buildingHeight)} mm` }
      ]
    };

    const views: DrawingView[] = [
      { name: 'MAIN ELEVATION', x: 40, y: 40, width: 970, height: 310, scale: '1:100' },
      { name: 'PLAN VIEW', x: 40, y: 360, width: 600, height: 180, scale: '1:100' },
      { name: 'SECTION A-A', x: 670, y: 360, width: 340, height: 180, scale: '1:100' }
    ];

    const elements: DrawingElement[] = [];
    const dimensions: DrawingDimension[] = [];

    // Outer sheet border
    elements.push({
      $type: 'rectangle',
      x: 15,
      y: 15,
      width: 1020,
      height: 650,
      fill: 'none',
      stroke: '#334155',
      strokeWidth: 2
    });
    elements.push({
      $type: 'rectangle',
      x: 25,
      y: 25,
      width: 1000,
      height: 630,
      fill: 'none',
      stroke: '#64748b',
      strokeWidth: 1
    });

    // View Titles
    elements.push({
      $type: 'text',
      x: 525,
      y: 52,
      content: 'MAIN ELEVATION',
      fontSize: 14,
      fontWeight: 'bold',
      textAnchor: 'middle',
      fill: '#0f172a'
    });
    elements.push({
      $type: 'text',
      x: 340,
      y: 375,
      content: 'PLAN VIEW',
      fontSize: 13,
      fontWeight: 'bold',
      textAnchor: 'middle',
      fill: '#0f172a'
    });
    elements.push({
      $type: 'text',
      x: 840,
      y: 375,
      content: 'SECTION A-A',
      fontSize: 13,
      fontWeight: 'bold',
      textAnchor: 'middle',
      fill: '#0f172a'
    });

    // Return DrawingModel
    return {
      drawingNumber: drawingNo,
      title: 'PARAMETRIC OVERHEAD CRANE DRAWING',
      scale: '1:100',
      revision: rev,
      sheetMetadata,
      technicalData,
      views,
      elements,
      dimensions
    };
  }

  /**
   * Generates a complete standalone SVG representation of the crane drawing
   * matching the mock CAD technical drawing shown in the design image.
   */
  generateParametricSvg(params: CreateDesignRequest, drawingNo = 'CRN-001', rev = 'A'): string {
    const span = Number(params.spanMm) || 25000;
    const lift = Number(params.liftHeightMm) || 8000;
    const capacity = Number(params.capacityTonnes) || 10;
    const runwayWidth = Number(params.runwayWidthMm) || 12500;
    const hoistPos = Number(params.hoistPositionMm) || 12500;
    const buildingHeight = Number(params.buildingHeightMm) || 9000;
    const craneType = params.craneType || 'EOT Crane';
    const designName = params.designName || 'Workshop Crane 01';

    const spanFormatted = this.formatNumber(span) + ' mm';
    const liftFormatted = this.formatNumber(lift) + ' mm';
    const runwayWidthFormatted = this.formatNumber(runwayWidth) + ' mm';
    const buildingHeightFormatted = this.formatNumber(buildingHeight) + ' mm';
    const hoistPosFormatted = this.formatNumber(hoistPos) + ' mm';

    // Normalized ratio for hoist trolley position (0 to 1)
    const hoistRatio = Math.max(0.15, Math.min(0.85, hoistPos / (span || 25000)));
    // Main Elevation: Span coordinates
    const leftColX = 120;
    const rightColX = 900;
    const spanWidth = rightColX - leftColX; // 780px
    const girderY = 160;
    const girderHeight = 28;
    const trolleyX = leftColX + spanWidth * hoistRatio;
    const groundY = 320;
    const railY = 175;

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 670" width="100%" height="100%" class="crane-cad-svg" style="background:#ffffff; font-family:'Roboto', 'Segoe UI', Arial, sans-serif;">
  <defs>
    <!-- Arrowhead markers for dimensioning -->
    <marker id="cad-arrow-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 10 2 L 0 5 L 10 8 z" fill="#1e293b"/>
    </marker>
    <marker id="cad-arrow-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 2 L 10 5 L 0 8 z" fill="#1e293b"/>
    </marker>
    <!-- Concrete & metal hatching -->
    <pattern id="concrete-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" stroke-width="1.2" />
    </pattern>
    <pattern id="steel-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
      <line x1="0" y1="0" x2="0" y2="6" stroke="#94a3b8" stroke-width="1" />
    </pattern>
  </defs>

  <!-- ================= SHEET BORDER & MARGINS ================= -->
  <rect x="10" y="10" width="1020" height="650" fill="none" stroke="#1e293b" stroke-width="2"/>
  <rect x="18" y="18" width="1004" height="634" fill="none" stroke="#64748b" stroke-width="0.8"/>

  <!-- ================= 1. MAIN ELEVATION ================= -->
  <g id="main-elevation">
    <!-- View Title -->
    <text x="520" y="44" font-size="14" font-weight="700" text-anchor="middle" fill="#0f172a" letter-spacing="0.5">MAIN ELEVATION</text>

    <!-- Floor / Ground Line -->
    <line x1="90" y1="${groundY}" x2="930" y2="${groundY}" stroke="#334155" stroke-width="2"/>
    <!-- Ground Hatching -->
    <rect x="100" y="${groundY}" width="50" height="10" fill="url(#concrete-hatch)" stroke="#475569" stroke-width="1"/>
    <rect x="870" y="${groundY}" width="50" height="10" fill="url(#concrete-hatch)" stroke="#475569" stroke-width="1"/>

    <!-- Left Column & Corbel -->
    <polygon points="110,${groundY} 110,165 125,165 125,188 135,188 135,${groundY}" fill="#f8fafc" stroke="#1e293b" stroke-width="1.8"/>
    <!-- Left Column Bracket / Corbel support -->
    <polygon points="125,188 145,188 145,205 125,230" fill="#e2e8f0" stroke="#1e293b" stroke-width="1.5"/>
    <!-- Left Runway Beam & Rail -->
    <rect x="135" y="172" width="16" height="16" fill="#64748b" stroke="#1e293b" stroke-width="1.2"/>
    <rect x="139" y="167" width="8" height="5" fill="#334155" stroke="#1e293b" stroke-width="1"/>

    <!-- Right Column & Corbel -->
    <polygon points="910,${groundY} 910,165 895,165 895,188 885,188 885,${groundY}" fill="#f8fafc" stroke="#1e293b" stroke-width="1.8"/>
    <!-- Right Column Bracket / Corbel support -->
    <polygon points="895,188 875,188 875,205 895,230" fill="#e2e8f0" stroke="#1e293b" stroke-width="1.5"/>
    <!-- Right Runway Beam & Rail -->
    <rect x="869" y="172" width="16" height="16" fill="#64748b" stroke="#1e293b" stroke-width="1.2"/>
    <rect x="873" y="167" width="8" height="5" fill="#334155" stroke="#1e293b" stroke-width="1"/>

    <!-- Crane End Carriages / Trucks -->
    <!-- Left Carriage -->
    <rect x="132" y="150" width="22" height="20" rx="2" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.5"/>
    <circle cx="137" cy="168" r="4" fill="#475569" stroke="#0f172a" stroke-width="1"/>
    <circle cx="149" cy="168" r="4" fill="#475569" stroke="#0f172a" stroke-width="1"/>
    <!-- Left End Stop / Buffer -->
    <rect x="140" y="142" width="6" height="8" fill="#e2e8f0" stroke="#0f172a" stroke-width="1"/>

    <!-- Right Carriage -->
    <rect x="866" y="150" width="22" height="20" rx="2" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.5"/>
    <circle cx="871" cy="168" r="4" fill="#475569" stroke="#0f172a" stroke-width="1"/>
    <circle cx="883" cy="168" r="4" fill="#475569" stroke="#0f172a" stroke-width="1"/>
    <!-- Right End Stop / Buffer -->
    <rect x="874" y="142" width="6" height="8" fill="#e2e8f0" stroke="#0f172a" stroke-width="1"/>

    <!-- Crane Bridge Girder (Yellow Box Girder) -->
    <rect x="154" y="${girderY}" width="712" height="${girderHeight}" fill="#eab308" stroke="#854d0e" stroke-width="2"/>
    <!-- Girder Web Line / Details -->
    <line x1="154" y1="${girderY + girderHeight - 6}" x2="866" y2="${girderY + girderHeight - 6}" stroke="#ca8a04" stroke-width="1"/>
    <line x1="154" y1="${girderY + 6}" x2="866" y2="${girderY + 6}" stroke="#ca8a04" stroke-width="1"/>
    <!-- Girder Stiffeners -->
    <line x1="260" y1="${girderY}" x2="260" y2="${girderY + girderHeight}" stroke="#ca8a04" stroke-width="1"/>
    <line x1="390" y1="${girderY}" x2="390" y2="${girderY + girderHeight}" stroke="#ca8a04" stroke-width="1"/>
    <line x1="630" y1="${girderY}" x2="630" y2="${girderY + girderHeight}" stroke="#ca8a04" stroke-width="1"/>
    <line x1="760" y1="${girderY}" x2="760" y2="${girderY + girderHeight}" stroke="#ca8a04" stroke-width="1"/>

    <!-- Hoist & Trolley Assembly (Sitting on Girder) -->
    <g transform="translate(${trolleyX - 25}, ${girderY - 14})">
      <!-- Trolley Body (Blue) -->
      <rect x="0" y="0" width="50" height="15" rx="2" fill="#1d4ed8" stroke="#0f172a" stroke-width="1.5"/>
      <!-- Trolley Wheels -->
      <circle cx="10" cy="15" r="3.5" fill="#334155" stroke="#0f172a" stroke-width="1"/>
      <circle cx="40" cy="15" r="3.5" fill="#334155" stroke="#0f172a" stroke-width="1"/>
      <!-- Motor / Gearbox -->
      <rect x="6" y="-6" width="18" height="6" fill="#2563eb" stroke="#0f172a" stroke-width="1"/>
      <rect x="26" y="-8" width="16" height="8" rx="2" fill="#38bdf8" stroke="#0f172a" stroke-width="1"/>
      <!-- Hoist Drum / Ropes hanging down -->
      <line x1="22" y1="16" x2="22" y2="55" stroke="#475569" stroke-width="1.8"/>
      <line x1="28" y1="16" x2="28" y2="55" stroke="#475569" stroke-width="1.8"/>
      <!-- Hook Block -->
      <rect x="18" y="55" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.5"/>
      <circle cx="25" cy="61" r="2.5" fill="#0f172a"/>
      <!-- Crane Hook -->
      <path d="M 25 67 C 22 73 18 78 18 83 C 18 89 25 93 30 91 C 34 89 33 82 29 80" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
    </g>

    <!-- ====== DIMENSIONS FOR MAIN ELEVATION ====== -->
    <!-- 1. Span Dimension (Top) -->
    <line x1="143" y1="90" x2="143" y2="150" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2,2"/>
    <line x1="877" y1="90" x2="877" y2="150" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2,2"/>
    <line x1="143" y1="95" x2="877" y2="95" stroke="#1e293b" stroke-width="1.2" marker-start="url(#cad-arrow-start)" marker-end="url(#cad-arrow-end)"/>
    <rect x="465" y="85" width="90" height="18" fill="#ffffff"/>
    <text x="510" y="99" font-size="12" font-weight="600" text-anchor="middle" fill="#0f172a">${spanFormatted}</text>

    <!-- 2. Lift Height Dimension (Floor to Hook) -->
    <line x1="660" y1="${groundY}" x2="740" y2="${groundY}" stroke="#94a3b8" stroke-width="1"/>
    <line x1="${trolleyX + 25}" y1="${girderY + 70}" x2="740" y2="${girderY + 70}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2,2"/>
    <line x1="720" y1="${groundY}" x2="720" y2="${girderY + 70}" stroke="#1e293b" stroke-width="1.2" marker-start="url(#cad-arrow-start)" marker-end="url(#cad-arrow-end)"/>
    <rect x="725" y="${(groundY + girderY + 70) / 2 - 9}" width="75" height="18" fill="#ffffff"/>
    <text x="760" y="${(groundY + girderY + 70) / 2 + 4}" font-size="12" font-weight="600" text-anchor="middle" fill="#0f172a">${liftFormatted}</text>

    <!-- 3. Building Height Dimension (Right side) -->
    <line x1="910" y1="165" x2="975" y2="165" stroke="#94a3b8" stroke-width="1"/>
    <line x1="930" y1="${groundY}" x2="975" y2="${groundY}" stroke="#94a3b8" stroke-width="1"/>
    <line x1="965" y1="165" x2="965" y2="${groundY}" stroke="#1e293b" stroke-width="1.2" marker-start="url(#cad-arrow-start)" marker-end="url(#cad-arrow-end)"/>
    <rect x="970" y="235" width="45" height="18" fill="#ffffff"/>
    <text x="990" y="248" font-size="11" font-weight="600" text-anchor="start" fill="#0f172a">${buildingHeightFormatted}</text>
  </g>

  <!-- ================= 2. PLAN VIEW (Bottom Left) ================= -->
  <g id="plan-view" transform="translate(10, 0)">
    <!-- Title -->
    <text x="350" y="380" font-size="13" font-weight="700" text-anchor="middle" fill="#0f172a" letter-spacing="0.5">PLAN VIEW</text>

    <!-- Left Runway Rail & Beam -->
    <rect x="130" y="400" width="12" height="110" fill="#cbd5e1" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="136" y1="395" x2="136" y2="515" stroke="#475569" stroke-width="2"/>
    <!-- Left Wall / Column hatch marks -->
    <line x1="124" y1="420" x2="130" y2="426" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="124" y1="440" x2="130" y2="446" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="124" y1="460" x2="130" y2="466" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="124" y1="480" x2="130" y2="486" stroke="#94a3b8" stroke-width="1.5"/>

    <!-- Right Runway Rail & Beam -->
    <rect x="560" y="400" width="12" height="110" fill="#cbd5e1" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="566" y1="395" x2="566" y2="515" stroke="#475569" stroke-width="2"/>

    <!-- Crane Bridge Girder (Plan View - Yellow) -->
    <rect x="142" y="445" width="418" height="20" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/>
    <!-- Girder Centerline -->
    <line x1="130" y1="455" x2="572" y2="455" stroke="#b45309" stroke-width="1" stroke-dasharray="8,3,2,3"/>

    <!-- Left End Carriage (Plan) -->
    <rect x="133" y="435" width="9" height="40" rx="2" fill="#64748b" stroke="#0f172a" stroke-width="1.2"/>
    <!-- Right End Carriage (Plan) -->
    <rect x="561" y="435" width="9" height="40" rx="2" fill="#64748b" stroke="#0f172a" stroke-width="1.2"/>

    <!-- Hoist Trolley (Plan View - Blue) -->
    <g transform="translate(${142 + 418 * hoistRatio - 16}, 441)">
      <rect x="0" y="0" width="32" height="28" rx="2" fill="#1d4ed8" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="6" y="5" width="20" height="18" fill="#38bdf8" stroke="#0f172a" stroke-width="1"/>
      <circle cx="16" cy="14" r="3.5" fill="#1e293b"/>
    </g>

    <!-- Plan View Span Dimension (Bottom) -->
    <line x1="136" y1="520" x2="136" y2="538" stroke="#94a3b8" stroke-width="1"/>
    <line x1="566" y1="520" x2="566" y2="538" stroke="#94a3b8" stroke-width="1"/>
    <line x1="136" y1="530" x2="566" y2="530" stroke="#1e293b" stroke-width="1.2" marker-start="url(#cad-arrow-start)" marker-end="url(#cad-arrow-end)"/>
    <rect x="305" y="522" width="90" height="16" fill="#ffffff"/>
    <text x="350" y="534" font-size="11" font-weight="600" text-anchor="middle" fill="#0f172a">${spanFormatted}</text>

    <!-- Plan View Runway Width Dimension (Right) -->
    <line x1="575" y1="400" x2="600" y2="400" stroke="#94a3b8" stroke-width="1"/>
    <line x1="575" y1="510" x2="600" y2="510" stroke="#94a3b8" stroke-width="1"/>
    <line x1="592" y1="400" x2="592" y2="510" stroke="#1e293b" stroke-width="1.2" marker-start="url(#cad-arrow-start)" marker-end="url(#cad-arrow-end)"/>
    <rect x="596" y="446" width="70" height="16" fill="#ffffff"/>
    <text x="630" y="458" font-size="10" font-weight="600" text-anchor="middle" fill="#0f172a">${runwayWidthFormatted}</text>
  </g>

  <!-- ================= 3. SECTION A-A (Bottom Right) ================= -->
  <g id="section-view" transform="translate(680, 360)">
    <!-- Title -->
    <text x="160" y="20" font-size="13" font-weight="700" text-anchor="middle" fill="#0f172a" letter-spacing="0.5">SECTION A-A</text>

    <!-- Runway Width Top Dimension -->
    <line x1="40" y1="35" x2="40" y2="48" stroke="#94a3b8" stroke-width="1"/>
    <line x1="200" y1="35" x2="200" y2="48" stroke="#94a3b8" stroke-width="1"/>
    <line x1="40" y1="42" x2="200" y2="42" stroke="#1e293b" stroke-width="1.2" marker-start="url(#cad-arrow-start)" marker-end="url(#cad-arrow-end)"/>
    <rect x="95" y="34" width="75" height="15" fill="#ffffff"/>
    <text x="132" y="45" font-size="10" font-weight="600" text-anchor="middle" fill="#0f172a">${runwayWidthFormatted}</text>

    <!-- Section Columns -->
    <polygon points="30,170 30,60 45,60 45,75 52,75 52,170" fill="#f8fafc" stroke="#1e293b" stroke-width="1.5"/>
    <polygon points="210,170 210,60 195,60 195,75 188,75 188,170" fill="#f8fafc" stroke="#1e293b" stroke-width="1.5"/>
    <!-- Ground Line -->
    <line x1="20" y1="170" x2="220" y2="170" stroke="#334155" stroke-width="1.8"/>

    <!-- Crane Bridge Girder Cross Section (Yellow) -->
    <rect x="52" y="72" width="136" height="14" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/>

    <!-- Trolley & Hoist in Section (Blue) -->
    <rect x="105" y="62" width="30" height="10" rx="1" fill="#1d4ed8" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="120" y1="72" x2="120" y2="105" stroke="#334155" stroke-width="1.5"/>
    <circle cx="120" cy="112" r="4.5" fill="#94a3b8" stroke="#0f172a" stroke-width="1.2"/>
    <path d="M 120 116 C 117 122 113 125 118 128 C 122 130 125 125 123 122" fill="none" stroke="#0f172a" stroke-width="2"/>

    <!-- Building Height Side Dimension in Section -->
    <line x1="215" y1="60" x2="245" y2="60" stroke="#94a3b8" stroke-width="1"/>
    <line x1="220" y1="170" x2="245" y2="170" stroke="#94a3b8" stroke-width="1"/>
    <line x1="240" y1="60" x2="240" y2="170" stroke="#1e293b" stroke-width="1.2" marker-start="url(#cad-arrow-start)" marker-end="url(#cad-arrow-end)"/>
    <rect x="244" y="105" width="45" height="15" fill="#ffffff"/>
    <text x="246" y="117" font-size="10" font-weight="600" text-anchor="start" fill="#0f172a">${buildingHeightFormatted}</text>
  </g>

  <!-- ================= 4. TECHNICAL DATA & TITLE BLOCK ================= -->
  <!-- Outer Title Block Frame -->
  <g id="title-block" transform="translate(25, 555)">
    <!-- Outer boundary of table -->
    <rect x="0" y="0" width="990" height="90" fill="#ffffff" stroke="#0f172a" stroke-width="1.8"/>

    <!-- Vertical Split: Left (Technical Data, width 600) vs Right (Drawing Title, width 390) -->
    <line x1="600" y1="0" x2="600" y2="90" stroke="#0f172a" stroke-width="1.8"/>

    <!-- ====== TECHNICAL DATA (LEFT) ====== -->
    <!-- Table Header -->
    <rect x="0" y="0" width="600" height="22" fill="#f8fafc" stroke="#0f172a" stroke-width="1.2"/>
    <text x="12" y="15" font-size="12" font-weight="700" fill="#0f172a" letter-spacing="0.5">TECHNICAL DATA</text>

    <!-- Table Horizontal Grid Lines -->
    <line x1="0" y1="44" x2="600" y2="44" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="0" y1="67" x2="600" y2="67" stroke="#cbd5e1" stroke-width="1"/>

    <!-- Table Vertical Grid Line (midpoint of left side) -->
    <line x1="300" y1="22" x2="300" y2="90" stroke="#cbd5e1" stroke-width="1"/>

    <!-- Column 1 & 2 separator dashes / lines -->
    <line x1="120" y1="22" x2="120" y2="90" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="420" y1="22" x2="420" y2="90" stroke="#e2e8f0" stroke-width="1"/>

    <!-- Row 1 -->
    <text x="12" y="37" font-size="11" font-weight="600" fill="#334155">Crane Capacity</text>
    <text x="125" y="37" font-size="11" fill="#0f172a">: ${capacity} tonnes</text>
    <text x="312" y="37" font-size="11" font-weight="600" fill="#334155">Runway Width</text>
    <text x="425" y="37" font-size="11" fill="#0f172a">: ${runwayWidthFormatted}</text>

    <!-- Row 2 -->
    <text x="12" y="59" font-size="11" font-weight="600" fill="#334155">Span</text>
    <text x="125" y="59" font-size="11" fill="#0f172a">: ${spanFormatted}</text>
    <text x="312" y="59" font-size="11" font-weight="600" fill="#334155">Hoist Position</text>
    <text x="425" y="59" font-size="11" fill="#0f172a">: ${hoistPosFormatted}</text>

    <!-- Row 3 -->
    <text x="12" y="82" font-size="11" font-weight="600" fill="#334155">Lift Height</text>
    <text x="125" y="82" font-size="11" fill="#0f172a">: ${liftFormatted}</text>
    <text x="312" y="82" font-size="11" font-weight="600" fill="#334155">Building Height</text>
    <text x="425" y="82" font-size="11" fill="#0f172a">: ${buildingHeightFormatted}</text>

    <!-- ====== DRAWING TITLE BLOCK (RIGHT) ====== -->
    <!-- Title -->
    <text x="795" y="24" font-size="13" font-weight="800" text-anchor="middle" fill="#0f172a" letter-spacing="0.5">PARAMETRIC CRANE DRAWING</text>
    <line x1="600" y1="34" x2="990" y2="34" stroke="#0f172a" stroke-width="1.2"/>

    <!-- Info Sub-Grid -->
    <line x1="600" y1="62" x2="990" y2="62" stroke="#cbd5e1" stroke-width="1"/>
    <!-- Vertical divides for drawing no, rev, scale -->
    <line x1="750" y1="34" x2="750" y2="62" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="840" y1="34" x2="840" y2="62" stroke="#cbd5e1" stroke-width="1"/>

    <!-- Row 1 of right block -->
    <text x="612" y="51" font-size="10.5" fill="#334155"><tspan font-weight="600">Drawing No:</tspan> ${drawingNo}</text>
    <text x="760" y="51" font-size="10.5" fill="#334155"><tspan font-weight="600">Rev:</tspan> ${rev}</text>
    <text x="850" y="51" font-size="10.5" fill="#334155"><tspan font-weight="600">Scale:</tspan> 1:100</text>

    <!-- Row 2 of right block: Date and Notice -->
    <line x1="750" y1="62" x2="750" y2="90" stroke="#cbd5e1" stroke-width="1"/>
    <text x="612" y="79" font-size="10.5" fill="#334155"><tspan font-weight="600">Date:</tspan> 2025-04-26</text>
    <text x="865" y="74" font-size="10.5" font-weight="600" text-anchor="middle" fill="#0f172a">Conceptual Design</text>
    <text x="865" y="86" font-size="9" text-anchor="middle" fill="#64748b">( Not for Fabrication )</text>
  </g>
</svg>
    `.trim();
  }
}
