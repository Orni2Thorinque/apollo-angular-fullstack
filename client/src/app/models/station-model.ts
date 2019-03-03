import { Position, Station, StationStatus } from '../types/types';

export let stationFreshnessStatusCritical = 6000 * 60;
export let stationFreshnessStatusWarn = 6000 * 20;
export class StationModel {
  number: number;
  contractName: string;
  name: string;
  address: string;
  position: Position;
  banking: boolean;
  bonus: boolean;
  status: string;
  bikeStands: number;
  availableBikeStands: number;
  availableBikes: number;
  lastUpdate: number;

  overviewStatus: StationStatus;
  availableBikesStatus: StationStatus;
  availableBikeStandsStatus: StationStatus;
  lastUpdateStatus: StationStatus;

  constructor(model: Station) {
    this.name = model.name;
    this.number = model.number;
    this.contractName = model.contract_name;
    this.address = model.address;
    this.position = model.position;
    this.banking = model.banking;
    this.bonus = model.bonus;
    this.bikeStands = model.bike_stands;
    this.availableBikeStands = model.available_bike_stands;
    this.availableBikes = model.available_bikes;
    this.lastUpdate = model.last_update;
    this.status = model.status;

    this.computeStatus();
  }

  private computeStatus() {
    this.availableBikesStatus = this.availableBikes > 3 ? 'OK' : this.availableBikes > 0 ? 'WARN' : 'CRITICAL';
    this.availableBikeStandsStatus = this.availableBikeStands > 3 ? 'OK' : this.availableBikeStands > 0 ? 'WARN' : 'CRITICAL';
    this.lastUpdateStatus = this.computeUpdateFreshness(this.lastUpdate);
    this.overviewStatus = this.computeGlobalStatus();
  }

  private computeUpdateFreshness(updateTime: number): StationStatus {
    const now = new Date().getTime();
    return updateTime > now - stationFreshnessStatusWarn ? 'OK' : updateTime > now - stationFreshnessStatusCritical ? 'WARN' : 'CRITICAL';
  }

  private computeGlobalStatus(): StationStatus {
    if (this.status !== 'OPEN') {
      return 'CRITICAL';
    } else if (this.availableBikesStatus === 'CRITICAL' && this.availableBikeStandsStatus === 'CRITICAL') {
      return 'CRITICAL';
    } else if (this.availableBikesStatus === 'CRITICAL' || this.availableBikeStandsStatus === 'CRITICAL') {
      return 'WARN';
    } else {
      return 'OK';
    }
  }
}
