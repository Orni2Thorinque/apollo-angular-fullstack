import { gql } from 'apollo-server';

export default gql`
  type Query {
    # Cyclo query
    contracts: [Contract]
    contractFavorite: [ContractFavorite]
    stations: [Station]
    station(stationId: Int!, contract: String): Station
    contractStations(contract: String!): [Station]
    distanceTo(address: String!, targets: [PositionInput!]!, transportMode: TransportMode): DistanceMatrix

    # GMaps query
    directions(olat: Float!, olng: Float!, dlat: Float!, dlng: Float!): DirectionSummary
    location(address: String!): [GeocodeSummary]
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
    last_update: Float
  }

  type Position {
    lat: Float!
    lng: Float!
  }

  input PositionInput {
    lat: Float!
    lng: Float!
  }

  type DirectionSummary {
    distance: Int
    distanceText: String
    duration: Int
    durationText: String
    startLocation: Position
    startLocationText: String
    endLocation: Position
    endLocationText: String
    steps: [Step]
  }

  type Step {
    distance: Int
    distanceText: String
    duration: Int
    durationText: String
    startLocation: Position
    endLocation: Position
    htmlInstruction: String
    travelMode: String
    polyline: String
  }

  type GeocodeSummary {
    addressFragments: [GeocodeFragment]
    formatedAddress: String
    geometry: GeocodeGeometry
    partialMatch: Boolean
    placeId: String
    types: [String]
  }

  type GeocodeFragment {
    longText: String
    shortText: String
    types: [String]
  }

  type GeocodeGeometry {
    location: Position
    locationType: String
  }

  type DistanceMatrix {
    destinationAddresses: [String]
    originAddresses: [String]
    infos: [DistanceMatrixInfo]
  }

  type DistanceMatrixInfo {
    distanceTexts: [String]
    distances: [Int]
    durationTexts: [String]
    durations: [Int]
  }

  enum TransportMode {
    BICYCLING
    DRIVING
    TRANSIT
    WALKING
  }

  # MUTATIONS ___________________
  type Mutation {
    contractFavorite(name: String!, isFavorite: Boolean!): Boolean
  }

  type ContractFavorite {
    name: String!
    favorite: Boolean
  }
`;
