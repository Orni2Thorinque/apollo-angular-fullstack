import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StationModel } from '../models/station-model';
import { Contract, GeocodeSummary, Station } from '../types/types';

const CONTRACTS = gql`
  query Contracts {
    contracts {
      name
      cities
      commercialName: commercial_name
      countryCode: country_code
    }
  }
`;

const STATIONS_BY_CONTRACT = gql`
  query StationByContract($contractName: String!) {
    contractStations(contract: $contractName) {
      number
      name
      address
      position {
        lat
        lng
      }
      status
      banking
      bike_stands
      available_bike_stands
      available_bikes
      last_update
      bonus
    }
  }
`;

const LOCATION_BY_ADDRESS = gql`
  query LocationByAdddress($address: String!) {
    location(address: $address) {
      formatedAddress
      geometry {
        location {
          lat
          lng
        }
        locationType
      }
      partialMatch
    }
  }
`;

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
}

// const StationsQuery = gql`;
//   query Contracts {
//     contracts {
//       name
//       commercial_name
//     }
//     stations {
//       number
//       contract_name
//       position {
//         lat
//         lng
//       }
//       available_bike_stands
//       available_bikes
//       address
//       last_update
//     }
//   }
// `;

// public async queryStations(): Promise<StationInfos> {
//   const data: StationInfos = {
//     contracts: null,
//     stations: null,
//   };

//   await this.apollo.watchQuery({ query: ContractsQuery }).valueChanges.subscribe(
//     (result: ApolloQueryResult<StationInfos>) => {
//       data.contracts = result.data.contracts;
//       data.stations = result.data.stations;
//     },
//     () => {
//       data.contracts = [];
//       data.stations = [];
//     }
//   );

//   return data;
// }
