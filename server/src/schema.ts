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

export default gql`
  type Query {
    launches(pageSize: Int, after: String): LaunchConnection! # Paginated query
    launch(id: ID!): Launch
    me: User
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

  # MUTATION ___________________
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
