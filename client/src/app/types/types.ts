export interface Launch {
  id: number;
  site: string;
  mission: Mission;
  rocket: Rocket;
  isBooked: boolean;
}

export interface Rocket {
  id: number;
  name: string;
  type: string;
}

export interface User {
  id: number;
  email: string;
  trips: Launch;
}

export interface Mission {
  name: string;
  missionPatchSmall?: string;
  missionPatchLarge?: string;
  // missionPatch(size: PatchSize): String;
}

export enum PatchSize {
  SMALL,
  LARGE,
}

export interface Contract {
  name: string;
  commercialName: string;
  countryCode: string;
  cities: string[];
}

export type StationStatus = 'OK' | 'CRITICAL' | 'WARN';

export interface Station {
  number: number;
  contract_name: string;
  name: string;
  address: string;
  position: Position;
  banking: boolean;
  bonus: boolean;
  status: string;
  bike_stands: number;
  available_bike_stands: number;
  available_bikes: number;
  last_update: number;
}

export interface Position {
  lat: number;
  lng: number;
}

export interface DirectionSummary {
  distance: number;
  distanceText: string;
  duration: number;
  durationText: string;
  startLocation: Position;
  startLocationText: string;
  endLocation: Position;
  endLocationText: string;
  steps: Array<Step>;
}

export interface Step {
  distance: number;
  distanceText: string;
  duration: number;
  durationText: string;
  startLocation: Position;
  endLocation: Position;
  htmlInstruction: string;
  travelMode: string;
  polyline: string;
}

export interface GeocodeSummary {
  addressFragments: Array<GeocodeFragment>;
  formatedAddress: string;
  geometry: GeocodeGeometry;
  partialMatch: boolean;
  placeId: string;
  types: Array<string>;
}

export interface GeocodeFragment {
  longText: string;
  shortText: string;
  types: Array<string>;
}

export interface GeocodeGeometry {
  location: Position;
  locationType: string;
}

export interface DistanceMatrix {
  destinationAddresses: string[];
  originAddresses: string[];
  infos: Array<DistanceMatrixInfo>;
}

export interface DistanceMatrixInfo {
  distanceTexts: Array<string>;
  distances: Array<number>;
  durationTexts: Array<string>;
  durations: Array<number>;
}
