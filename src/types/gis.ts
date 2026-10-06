export type MapLayerType = 'cadastral' | 'satellite' | 'street' | 'hybrid';

export type GisInteractionMode = 'pan' | 'draw' | 'edit' | 'select';

export interface GisVertex {
  id: string;
  lat: number;
  lng: number;
  canvasX: number;
  canvasY: number;
  utmEasting?: number;
  utmNorthing?: number;
}

export interface GisPolygon {
  id: string;
  name: string;
  vertices: GisVertex[];
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
  strokeColor?: string;
  fillColor?: string;
}

export interface CadastralParcel {
  khasraNo: string;
  surveyNo: string;
  ownerName: string;
  landType: 'Agricultural (Wet)' | 'Agricultural (Dry)' | 'Government Poramboke' | 'Gram Kantham (Abadi)' | 'Commercial / Industrial' | 'Water Body / Canal' | 'Forest Buffer';
  areaHa: number;
  polygonPoints: { x: number; y: number }[]; // Canvas SVG coordinate points
  latLngBounds: { minLat: number; minLng: number; maxLat: number; maxLng: number };
  villageLgd?: string;
  pattaNumber?: string;
}

export interface SpatialCalculationResult {
  areaHectares: number;
  areaAcres: number;
  areaSqMeters: number;
  perimeterKm: number;
  perimeterMeters: number;
  centroidLat: number;
  centroidLng: number;
  boundingBox: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  };
}

export interface AffectedParcelResult {
  parcel: CadastralParcel;
  affectedAreaHa: number;
  affectedPercentage: number;
  intersectionType: 'Fully Inside' | 'Partial Intersection' | 'Buffer Adjacent';
}

export interface SavedBoundaryRecord {
  id: string;
  name: string;
  projectId?: string;
  projectName?: string;
  locationName: string;
  state: string;
  district: string;
  mandal: string;
  village: string;
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][]; // [lng, lat] GeoJSON format
  };
  vertices: GisVertex[];
  spatialCalculations: SpatialCalculationResult;
  affectedParcelsCount: number;
  totalAffectedAreaHa: number;
  savedBy: string;
  savedAt: string;
  notes?: string;
  epsgCode: string;
}
