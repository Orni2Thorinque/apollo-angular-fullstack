import { RESTDataSource } from 'apollo-datasource-rest';
import { URLSearchParams } from 'apollo-server-env';
import { DirectionSummary, GeocodeFragment, GeocodeSummary, Step, GeocodeGeometry, DistanceMatrix, DistanceMatrixInfo } from '../types/types';
import { GeocoderReponse } from './google-maps.datasource';

export interface GeocoderReponse {
  results: Array<google.maps.GeocoderResult>;
  status: google.maps.GeocoderStatus;
}

export class GoogleMapsAPI extends RESTDataSource {
  constructor(private apiKey: string) {
    super();
    this.baseURL = 'https://maps.googleapis.com/maps/api/';
  }

  /** Data access method for directions
   * @param { olat, olng, dlat, dlng } tuples of longitude and latitude for start and end location
   * @returns {Promise<DirectionSummary>} promise of direction summary
   */
  public async getDirectionsByCoordinates({ olat, olng, dlat, dlng }: any): Promise<DirectionSummary> {
    const origin = `${olat},${olng}`;
    const destination = `${dlat},${dlng}`;
    const searchParams: URLSearchParams = new URLSearchParams([['key', this.apiKey], ['origin', origin], ['destination', destination], ['mode', 'bicycling']]);
    console.log(`🗺\tgetDirectionsByCoordinates start: ${olat}${olng} - end: ${dlat}${dlng}`);

    const response = await this.get<google.maps.DirectionsResult>('directions/json', searchParams);
    return this.directionReducer(response);
  }

  /** Data access method for directions
   * @param {string} address given GMap input address
   * @returns {Promise<GeocodeSummary>} promise of geocoder response
   */
  public async getPositionByAddress({ address }: any): Promise<Array<GeocodeSummary>> {
    console.log(`🗺\tgetPositionByAddress ${address}`);
    const formatedAddress = address && (<string>address).length ? (<string>address).trim().replace(' ', '+') : address.trim();
    const searchParams: URLSearchParams = new URLSearchParams([['key', this.apiKey], ['address', formatedAddress]]);

    const response = await this.get<GeocoderReponse>('geocode/json', searchParams);
    return response.status.toString() === 'OK' ? response.results.map(this.geocodeReducer) : [];
  }
  public async getDistanceMatrix({ address, targets, transportMode }: { address: string; targets: string; transportMode: google.maps.TravelMode }): Promise<DistanceMatrix> {
    console.log(`🗺\tgetDistanceMatrix address: ${address}, targets:  ${targets}, transportMode:  ${transportMode}`);

    const endAddresses: Array<{ lat: number; lng: number }> = JSON.parse(targets);
    const startAddresses: Array<string> = Array(endAddresses.length).fill(address);

    const origins = startAddresses.map(address => address.trimLeft().trimRight()).join('|');
    const destinations = endAddresses.map(coord => `${coord.lat},${coord.lng}`).join('|');
    const transportationMode = transportMode ? transportMode : google.maps.TravelMode.WALKING;

    const searchParams: URLSearchParams = new URLSearchParams([['key', this.apiKey], ['origins', origins], ['destinations', destinations], ['mode', transportationMode]]);
    const response = await this.get<google.maps.DistanceMatrixResponse>('distancematrix/json', searchParams);

    const reduced = this.distanceMatrixResponseReducer(response);
    return reduced;
  }

  // public async getDistanceMatrix({ address, targets, transportMode }: { address: string; targets: any; transportMode: google.maps.TravelMode }): Promise<DistanceMatrix> {
  //   console.log(`🗺\tgetDistanceMatrix address: ${address}, targets:  ${targets}, transportMode:  ${transportMode}`);

  //   const response = await this.get<google.maps.DistanceMatrixResponse>('distancematrix/json', new URLSearchParams([['key', this.apiKey]]));
  //   return this.distanceMatrixResponseReducer(response);
  // }

  public directionReducer = (directionResult: google.maps.DirectionsResult): DirectionSummary => {
    return {
      distance: directionResult.routes[0].legs[0].distance.value,
      distanceText: directionResult.routes[0].legs[0].distance.text,
      duration: directionResult.routes[0].legs[0].duration.value,
      durationText: directionResult.routes[0].legs[0].duration.text,
      startLocation: {
        lat: <any>directionResult.routes[0].legs[0].start_location.lat,
        lng: <any>directionResult.routes[0].legs[0].start_location.lng,
      },
      startLocationText: directionResult.routes[0].legs[0].start_address,
      endLocation: {
        lat: <any>directionResult.routes[0].legs[0].end_location.lat,
        lng: <any>directionResult.routes[0].legs[0].end_location.lng,
      },
      endLocationText: directionResult.routes[0].legs[0].end_address,
      steps: directionResult.routes[0].legs[0].steps.map(this.stepReducer),
    };
  };

  public stepReducer = (directionStep: google.maps.DirectionsStep): Step => {
    return {
      distance: directionStep.distance.value,
      distanceText: directionStep.distance.text,
      duration: directionStep.duration.value,
      durationText: directionStep.duration.text,
      endLocation: {
        lat: <any>directionStep.end_location.lat,
        lng: <any>directionStep.end_location.lng,
      },
      startLocation: {
        lat: <any>directionStep.start_location.lat,
        lng: <any>directionStep.start_location.lng,
      },
      htmlInstruction: directionStep.instructions,
      travelMode: directionStep.travel_mode.toString(),
      polyline: (<any>directionStep).polyline.points,
    };
  };

  public geocodeReducer = (geocodeResult: google.maps.GeocoderResult): GeocodeSummary => {
    return {
      addressFragments: geocodeResult.address_components ? geocodeResult.address_components.map(this.geocodeFragmentReducer) : [],
      formatedAddress: geocodeResult.formatted_address,
      geometry: this.geocodeGeometryReducer(geocodeResult.geometry),
      partialMatch: geocodeResult.partial_match,
      placeId: geocodeResult.place_id,
      types: geocodeResult.types,
    };
  };

  public geocodeGeometryReducer = (geocodeResult: google.maps.GeocoderGeometry): GeocodeGeometry => {
    return {
      location: {
        lat: <any>geocodeResult.location.lat,
        lng: <any>geocodeResult.location.lng,
      },
      locationType: <any>geocodeResult.location_type,
    };
  };

  public geocodeFragmentReducer = (geocodeResult: google.maps.GeocoderAddressComponent): GeocodeFragment => {
    return {
      longText: geocodeResult.long_name,
      shortText: geocodeResult.short_name,
      types: geocodeResult.types,
    };
  };

  public distanceMatrixResponseReducer = (distanceMatrixResponse: google.maps.DistanceMatrixResponse): DistanceMatrix => {
    return {
      originAddresses: distanceMatrixResponse.originAddresses,
      destinationAddresses: distanceMatrixResponse.destinationAddresses,
      infos: distanceMatrixResponse.rows.map(row => this.distanceMatrixInfoReducer(row)),
    };
  };

  public distanceMatrixInfoReducer(matrixInfo: google.maps.DistanceMatrixResponseRow): DistanceMatrixInfo {
    return {
      distanceTexts: matrixInfo.elements.map((element: google.maps.DistanceMatrixResponseElement) => element.distance.text),
      distances: matrixInfo.elements.map((element: google.maps.DistanceMatrixResponseElement) => element.distance.value),
      durationTexts: matrixInfo.elements.map((element: google.maps.DistanceMatrixResponseElement) => element.duration.text),
      durations: matrixInfo.elements.map((element: google.maps.DistanceMatrixResponseElement) => element.duration.value),
    };
  }
}
