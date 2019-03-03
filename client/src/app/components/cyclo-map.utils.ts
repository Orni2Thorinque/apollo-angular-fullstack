import { StationModel } from '../models/station-model';
import { Position } from '../types/types';

export const DEFAULT_LOCATION: Position = {
  lat: 48.795404,
  lng: 2.339607,
};

export const DEFAULT_FOCUS_ZOOM = 13;
export const DEFAULT_START_ZOOM = 8;
export const DEFAUL_MAP_TYPE = 'terrain';
export const DEFAULT_RENDERING_DELAY_PER_STATION = 40;

export function getWindowDimensions(): Array<number> {
  return [window.innerWidth, window.innerHeight - 5];
}

export function nou(obj: any): boolean {
  return obj === null || obj === undefined;
}

/**
 * Compute station icon base on its status
 * @param station given station
 */
export function getBankIcon(station: StationModel): string {
  return station.banking ? 'BANK_OK' : 'BANK_WARN';
}

/**
 * Compute station icon base on its status
 * @param station given station
 */
export function getBikeIcon(station: StationModel, action: 'TAKE' | 'RETURN'): string {
  const status = action === 'TAKE' ? station.availableBikesStatus : action === 'RETURN' ? station.availableBikeStandsStatus : null;
  switch (status) {
    case 'OK':
      return 'BIKE_OK';
    case 'WARN':
      return 'BIKE_WARN';
    case 'CRITICAL':
      return 'BIKE_CRITICAL';
    default:
      return 'BIKE_CRITICAL';
  }
}

/**
 * Compute station icon base on its status
 * @param station given station
 */
export function getOverviewIcon(station: StationModel): string {
  switch (station.overviewStatus) {
    case 'OK':
      return 'PLACE_OK';
    case 'WARN':
      return 'PLACE_WARN';
    case 'CRITICAL':
      return 'PLACE_CRITICAL';
    default:
      return 'PLACE_CRITICAL';
  }
}

/**
 * Compute station icon base on its status
 * @param station given station
 */
export function getTakeIcon(station: StationModel): string {
  switch (station.availableBikesStatus) {
    case 'OK':
      return 'TAKE_OK';
    case 'WARN':
      return 'TAKE_WARN';
    case 'CRITICAL':
      return 'TAKE_CRITICAL';
    default:
      return 'TAKE_WARN';
  }
}

/**
 * Compute station icon base on its status
 * @param station given station
 */
export function getReturnIcon(station: StationModel): string {
  switch (station.availableBikeStandsStatus) {
    case 'OK':
      return 'RETURN_OK';
    case 'WARN':
      return 'RETURN_WARN';
    case 'CRITICAL':
      return 'RETURN_CRITICAL';
    default:
      return 'RETURN_WARN';
  }
}
