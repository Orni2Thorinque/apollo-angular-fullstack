import { RESTDataSource } from 'apollo-datasource-rest';
import { Contract, Station } from '../types/types';
import { URLSearchParams } from 'apollo-server-env';

export class CycloApi extends RESTDataSource {
  constructor(private apiKey: string) {
    super();
    this.baseURL = 'https://api.jcdecaux.com/vls/v1/';
  }

  /** Data access method for directions
   * @returns {Promise<Array<Contract>>} promise of direction summary
   */
  public async getAllContracts(): Promise<Array<Contract>> {
    const response = await this.get<Array<Contract>>('contracts', new URLSearchParams([['apiKey', this.apiKey]]));
    console.log('🚲\tgetAllContracts: ', response);
    return Array.isArray(response) ? response.map(contract => this.contractReducer(contract as Contract)) : [];
  }

  /** Data access method for stations
   * @returns {Promise<Array<Station>>} promise of direction summary
   */
  public async getAllStations(): Promise<Array<Station>> {
    const response = await this.get<Array<Station>>('stations', new URLSearchParams([['apiKey', this.apiKey]]));
    console.log('🚲\tgetAllStations: ', response);
    return Array.isArray(response) ? response.map(station => this.stationReducer(station as Station)) : [];
  }

  /** Data access method for stations by contract name
   * @param {string} contractName given contract of stations
   * @returns {Promise<Array<Station>>} promise of direction summary
   */
  public async getStationByContract({ contractName }: any): Promise<Array<Station>> {
    console.log(`🚲\tgetStationByContract ${contractName}:`);
    const response = await this.get<Array<Station>>('stations', new URLSearchParams([['apiKey', this.apiKey], ['contract', contractName]]));
    return Array.isArray(response) ? response.map(station => this.stationReducer(station as Station)) : [];
  }

  /** Data access method for stations by contract name
   * @param {string} contractName given contract of stations
   * @returns {Promise<Array<Station>>} promise of direction summary
   */
  public async getStationByNumber({ stationNumber, contractName }: any): Promise<Station | null> {
    console.log(`🚲\tgetStationByNumber number: ${stationNumber}, contract: ${contractName}`);

    const searchParams = new URLSearchParams([['apiKey', this.apiKey]]);
    if (contractName) searchParams.append('contract', contractName);
    const response = await this.get<Station>(`stations/${stationNumber}`, searchParams);
    console.log(`🚲\t ${response}`);

    return this.stationReducer(response);
  }

  // /** Data access method for stations distance from address point
  //  * @param {string} address given origin address
  //  * @returns {Promise<Array<>>} promise of direction summary
  //  */
  // public async getDistanceToStations({ address }: any): Promise<Array<string>> {
  //   console.log(`🚲\tgetDistanceToStations from address: ${address}`);

  // }

  public contractReducer = (contract: Contract): Contract => contract;
  public stationReducer = (station: Station): Station => station;
}
