import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StationModel } from '../models/station-model';
import { Contract, DirectionSummary, GeocodeSummary, Position, Station, ContractFavorite } from '../types/types';
import { CONTRACTS, DIRECTIONS_BY_COORDINATES, LOCATION_BY_ADDRESS, STATIONS_BY_CONTRACT, CONTRACT_FAVORITES, SUBMIT_CONTRACT_FAVORITE } from './apollo-queries';

export interface StationInfos {
  contracts: Array<Contract>;
  stations: Array<Station>;
}

@Injectable()
export class ApolloService {
  constructor(private apollo: Apollo) {}

  /**
   * Get all contracts
   * @return {Observable<Array<Contract>>} observable over contracts
   */
  public queryContracts(): Observable<Array<Contract>> {
    return this.apollo
      .watchQuery<StationInfos>({ query: CONTRACTS }) //
      .valueChanges //
      .pipe(
        map((result: ApolloQueryResult<StationInfos>) =>
          result.data.contracts.sort(
            (c1, c2) => (c1.name < c2.name ? -1 : 1) //
          )
        )
      );
  }

  /**
   * Get all contracts
   * @return {Observable<Array<ContractFavorite>>} observable over contracts
   */
  public queryFavoriteContracts(): Observable<Array<ContractFavorite>> {
    return this.apollo
      .watchQuery<{ contractFavorite: Array<ContractFavorite> }>({ query: CONTRACT_FAVORITES }) //
      .valueChanges //
      .pipe(map((result: ApolloQueryResult<{ contractFavorite: Array<ContractFavorite> }>) => result.data.contractFavorite));
  }

  /**
   * Get all contracts
   * @return {Observable<Array<ContractFavorite>>} observable over contracts
   */
  public mutateFavoriteContract(name: string, favorite: boolean): Observable<boolean> {
    return this.apollo.mutate({
      mutation: SUBMIT_CONTRACT_FAVORITE,
      variables: {
        name,
        isFavorite: favorite,
      },
    });
  }

  /**
   * Get location infos by address
   * @param {string} address given address to look for
   * @return {Observable<GeocodeSummary>} observable over contracts
   */
  public queryLocation(address: string): Observable<GeocodeSummary> {
    return this.apollo
      .watchQuery<{ location: GeocodeSummary }>({ query: LOCATION_BY_ADDRESS, variables: { address: address } }) //
      .valueChanges //
      .pipe(
        map((result: ApolloQueryResult<{ location: GeocodeSummary }>) => {
          return result.data.location && result.data.location[0] ? result.data.location[0] : null;
        })
      );
  }

  /**
   * Get all stations for a contract
   * @param {string} contract given contract name
   * @return {Observable<Array<Station>>} observable over contracts
   */
  public queryStationByContract(contract: Contract): Observable<Array<StationModel>> {
    return this.apollo
      .watchQuery<{ contractStations: Array<Station> }>({ query: STATIONS_BY_CONTRACT, variables: { contractName: contract.name } }) //
      .valueChanges //
      .pipe(
        map(
          (
            result: ApolloQueryResult<{ contractStations: Array<Station> }> //
          ) =>
            result.data && result.data.contractStations //
              ? result.data.contractStations.map((s: Station) => new StationModel(s))
              : [] //
        )
      );
  }

  /**
   * Get directions between two locations
   * @param {Position} startLocation given start location
   * @param {Position} endLocation given end location
   * @return {Observable<DirectionSummary>} observable over contracts
   */
  public queryDirectionsByCoordinates(startLocation: Position, endLocation: Position): Observable<DirectionSummary> {
    return this.apollo
      .watchQuery<{ directions: DirectionSummary }>({
        query: DIRECTIONS_BY_COORDINATES, //
        variables: { olat: startLocation.lat, olng: startLocation.lng, dlat: endLocation.lat, dlng: endLocation.lng },
      }) //
      .valueChanges //
      .pipe(
        map((
          result: ApolloQueryResult<{ directions: DirectionSummary }> //
        ) =>
          result.data && result.data.directions //
            ? result.data.directions
            : null
        )
      );
  }
}
