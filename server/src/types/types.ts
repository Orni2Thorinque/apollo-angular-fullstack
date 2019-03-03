export interface Contract {
  name: string;
  commercial_name: string;
  country_code: string;
  cities: string[];
}

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
