export interface CreateDesignRequest {
  designName: string;
  craneType: string;
  capacityTonnes: number;
  spanMm: number;
  liftHeightMm: number;
  runwayWidthMm: number;
  hoistPositionMm: number;
  buildingHeightMm: number;
}

export interface UpdateDesignRequest {
  designName: string;
  craneType: string;
  capacityTonnes: number;
  spanMm: number;
  liftHeightMm: number;
  runwayWidthMm: number;
  hoistPositionMm: number;
  buildingHeightMm: number;
}

export interface DesignDto {
  id: number;
  designName: string;
  craneType: string;
  capacityTonnes: number;
  spanMm: number;
  liftHeightMm: number;
  runwayWidthMm: number;
  hoistPositionMm: number;
  buildingHeightMm: number;
  createdOn?: string;
  updatedOn?: string;
}

export type CraneTypeOption = 'EOT Crane' | 'Single Girder EOT' | 'Double Girder EOT' | 'Gantry Crane' | 'Semi-Gantry Crane' | 'Jib Crane';

export const CRANE_TYPES: CraneTypeOption[] = [
  'EOT Crane',
  'Single Girder EOT',
  'Double Girder EOT',
  'Gantry Crane',
  'Semi-Gantry Crane',
  'Jib Crane'
];
