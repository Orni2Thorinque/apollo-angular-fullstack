import { Contract, Position, Station } from './schema';
import { gql } from 'apollo-server';

export interface Launch {
  id: number;
  site: String;
  mission: Mission;
  rocket: Rocket;
  isBooked: Boolean;
}

export interface Rocket {
  id: number;
  name: String;
  type: String;
}

export interface User {
  id: number;
  email: String;
  trips: Launch;
}

export interface Mission {
  name: String;
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
  lng: boolean;
}

export default gql`
  type Query {
    launches(pageSize: Int, after: String): LaunchConnection! # Paginated query
    launch(id: ID!): Launch
    me: User
    contracts: [Contract]
    stations: [Station]
  }

  # Pagination wrapper type
  type LaunchConnection {
    cursor: String!
    hasMore: Boolean!
    launches: [Launch]!
  }

  type Launch {
    id: ID!
    site: String
    mission: Mission
    rocket: Rocket
    isBooked: Boolean!
    medias: Medias!
  }

  type Rocket {
    id: ID!
    name: String
    type: String
  }

  type Medias {
    wikipedia: String
    youtube: String
    flicker: [String]
  }

  type User {
    id: ID!
    email: String!
    trips: [Launch]!
  }

  type Mission {
    name: String
    missionPatch(size: PatchSize): String
  }

  enum PatchSize {
    SMALL
    LARGE
  }

  type Contract {
    name: String!
    commercial_name: String
    country_code: String
    cities: [String]
  }

  type Station {
    number: Int
    contract_name: String!
    name: String!
    address: String!
    position: Position
    banking: Boolean
    bonus: Boolean
    status: String!
    bike_stands: Int
    available_bike_stands: Int
    available_bikes: Int
    last_update: Int
  }

  type Position {
    lat: Float!
    lng: Float!
  }

  # MUTATIONS ___________________
  type Mutation {
    bookTrips(launchIds: [ID]!): TripUpdateResponse!
    cancelTrip(launchId: ID!): TripUpdateResponse!
    login(email: String): String # login token
  }

  type TripUpdateResponse {
    success: Boolean!
    message: String
    launches: [Launch]
  }
`;
