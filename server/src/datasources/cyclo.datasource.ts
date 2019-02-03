import { RESTDataSource } from 'apollo-datasource-rest';
import { Contract, Station } from '../schema';
import { URLSearchParams } from 'apollo-server-env';

export class CycloApi extends RESTDataSource {
  private readonly dynamicEndpoint = 'stations/{station_number}?contract={contract_name}';

  constructor(private apiKey: string) {
    super();
    this.baseURL = 'https://api.jcdecaux.com/vls/v1/';
  }

  public async getAllContracts() {
    const response = await this.get<Array<Contract>>('/contracts', new URLSearchParams([['apiKey', this.apiKey]]));
    console.log('🚲 getAllContracts: ', response);
    return Array.isArray(response) ? response.map(contract => this.contractReducer(contract as Contract)) : [];
  }

  public async getAllStations() {
    const response = await this.get<Array<Station>>('/stations', new URLSearchParams([['apiKey', this.apiKey]]));
    console.log('🚲 getAllStations: ', response);
    return Array.isArray(response) ? response.map(station => this.stationReducer(station as Station)) : [];
  }

  public contractReducer = (contract: Contract) => contract;
  public stationReducer = (station: Station) => station;
}
