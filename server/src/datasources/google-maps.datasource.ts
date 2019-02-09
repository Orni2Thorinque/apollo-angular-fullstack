import { RESTDataSource } from 'apollo-datasource-rest';
import { URLSearchParams } from 'apollo-server-env';
import { DirectionSummary } from '../schema';
import { debug } from 'util';

export class GoogleMapsAPI extends RESTDataSource {
  constructor(private apiKey: string) {
    super();
    this.baseURL = 'https://maps.googleapis.com/maps/api/directions';
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
    const response = await this.get<google.maps.DirectionsResult>('json', searchParams);
    console.log(response);
    return this.directionReducer(response);
  }

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
    };
  };
}
