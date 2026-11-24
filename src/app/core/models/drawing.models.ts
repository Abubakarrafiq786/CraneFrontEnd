export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingElementBase {
  $type?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface DrawingElementDrawingLine extends DrawingElementBase {
  $type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DrawingElementDrawingRectangle extends DrawingElementBase {
  $type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
}

export interface DrawingElementDrawingCircle extends DrawingElementBase {
  $type: 'circle';
  centerX: number;
  centerY: number;
  radius: number;
  fill?: string;
}

export interface DrawingElementDrawingPolyline extends DrawingElementBase {
  $type: 'polyline';
  points: DrawingPoint[];
  isClosed?: boolean;
  fill?: string;
}

export interface DrawingElementDrawingArc extends DrawingElementBase {
  $type: 'arc';
  centerX: number;
  centerY: number;
  radius: number;
  startAngleDegrees: number;
  endAngleDegrees: number;
  fill?: string;
}

export interface DrawingElementDrawingText extends DrawingElementBase {
  $type: 'text';
  x: number;
  y: number;
  content: string;
  fontSize?: number;
  fill?: string;
  textAnchor?: 'start' | 'middle' | 'end' | string;
  fontWeight?: string;
}

export interface DrawingElementDrawingCenterline extends DrawingElementBase {
  $type: 'centerline';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type DrawingElement =
  | DrawingElementDrawingLine
  | DrawingElementDrawingRectangle
  | DrawingElementDrawingCircle
  | DrawingElementDrawingPolyline
  | DrawingElementDrawingArc
  | DrawingElementDrawingText
  | DrawingElementDrawingCenterline
  | (DrawingElementBase & { [key: string]: any });

export interface DrawingDimension {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  offset?: number;
  isReference?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'aligned' | string;
}

export interface DrawingView {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale?: string;
}

export interface DrawingDetail {
  identifier?: string;
  name?: string;
  scale?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  elements?: DrawingElement[];
  dimensions?: DrawingDimension[];
}

export interface DrawingNote {
  number: number;
  text: string;
  category?: string;
}

export interface DrawingRevision {
  rev: string;
  description: string;
  date: string;
  designed: string;
  checked: string;
}

export interface DrawingSheetMetadata {
  sheetWidth?: number;
  sheetHeight?: number;
  outerMargin?: number;
  innerMargin?: number;
  gridColumns?: string;
  gridRows?: string;
  warningNotice?: string;
  projectTitle?: string;
  units?: string;
}

export enum SpecificationSource {
  Standard = 0,
  Calculated = 1,
  UserSpecified = 2
}

export interface TechnicalSpecificationItem {
  label: string;
  value: string;
  source?: SpecificationSource | number;
  sourceTag?: string | null;
}

export interface DrawingTechnicalData {
  designName?: string;
  craneType?: string;
  drawingNumber?: string;
  revision?: string;
  note?: string;
  capacityTonnes?: number;
  spanMm?: number;
  liftHeightMm?: number;
  runwayWidthMm?: number;
  hoistPositionMm?: number;
  buildingHeightMm?: number;
  hoistingSpeed?: string;
  traversingSpeed?: string;
  travellingSpeed?: string;
  trolleyWeight?: string;
  craneWeight?: string;
  powerSupply?: string;
  totalSupplyPower?: string;
  craneGroup?: string;
  hoistGroup?: string;
  bridgeTravelGroup?: string;
  tolerance?: string;
  bridgePaint?: string;
  specifications?: TechnicalSpecificationItem[];
}

export interface DrawingModel {
  drawingNumber?: string;
  title?: string;
  scale?: string;
  revision?: string;
  views?: DrawingView[];
  elements?: DrawingElement[];
  dimensions?: DrawingDimension[];
  details?: DrawingDetail[];
  notes?: DrawingNote[];
  revisions?: DrawingRevision[];
  technicalData?: DrawingTechnicalData;
  sheetMetadata?: DrawingSheetMetadata;
}
