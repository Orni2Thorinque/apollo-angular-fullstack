import gql from 'graphql-tag';

export const FRAGMENTS = {
  coordinates: gql`
    fragment CoordinatesFragments on Position {
      lat
      lng
    }
  `,
};

export const SUBMIT_CONTRACT_FAVORITE = gql`
  mutation SubmitContractFavorite($name: String!, $isFavorite: Boolean!) {
    contractFavorite(name: $name, isFavorite: $isFavorite)
  }
`;

export const CONTRACTS = gql`
  query Contracts {
    contracts {
      name
      cities
      commercialName: commercial_name
      countryCode: country_code
    }
  }
`;

export const CONTRACT_FAVORITES = gql`
  query ContractFavorites {
    contractFavorite {
      name
      favorite
    }
  }
`;

export const STATIONS_BY_CONTRACT = gql`
  query StationByContract($contractName: String!) {
    contractStations(contract: $contractName) {
      number
      name
      address
      position {
        ...CoordinatesFragments
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
  ${FRAGMENTS.coordinates}
`;

export const LOCATION_BY_ADDRESS = gql`
  query LocationByAdddress($address: String!) {
    location(address: $address) {
      formatedAddress
      geometry {
        location {
          ...CoordinatesFragments
        }
        locationType
      }
      partialMatch
    }
  }
  ${FRAGMENTS.coordinates}
`;

export const DIRECTIONS_BY_COORDINATES = gql`
  query DirectionsByCoordinates($olat: Float!, $olng: Float!, $dlat: Float!, $dlng: Float!) {
    directions(olat: $olat, olng: $olng, dlat: $dlat, dlng: $dlng) {
      durationText
      distanceText
      startLocationText
      endLocationText
      steps {
        startLocation {
          ...CoordinatesFragments
        }
        endLocation {
          ...CoordinatesFragments
        }
      }
    }
  }
  ${FRAGMENTS.coordinates}
`;
