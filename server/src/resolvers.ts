export default {
  // Query resolvers //
  Query: {
    contracts: (_: any, __: any, { dataSources }: any) => dataSources.cycloAPI.getAllContracts(),
    contractStations: (_: any, { contract }: any, { dataSources }: any) => dataSources.cycloAPI.getStationByContract({ contractName: contract }),
    contractFavorite: (_: any, __: any, { dataSources }: any) => dataSources.databaseAPI.getFavoriteContracts(),

    station: (_: any, { stationId, contract }: any, { dataSources }: any) => dataSources.cycloAPI.getStationByNumber({ stationNumber: stationId, contractName: contract }),
    stations: (_: any, __: any, { dataSources }: any) => dataSources.cycloAPI.getAllStations(),

    directions: (_: any, { olat, olng, dlat, dlng }: any, { dataSources }: any) => dataSources.googleMapsAPI.getDirectionsByCoordinates({ olat: olat, olng: olng, dlat: dlat, dlng: dlng }),
    distanceTo: (_: any, { address, targets, transportMode }: any, { dataSources }: any) => dataSources.googleMapsAPI.getDistanceMatrix({ address: address, targets: JSON.stringify(targets), transportMode: transportMode }),

    // distanceToStation: (_: any, { address }: any, { dataSources }: any) => dataSources.googleMapsAPI.getDistanceToStations({ address: address }),

    location: (_: any, { address }: any, { dataSources }: any) => dataSources.googleMapsAPI.getPositionByAddress({ address }),
  },
  Mutation: {
    contractFavorite: async (_: any, { name, isFavorite }: any, { dataSources }: any) => {
      const result = await dataSources.databaseAPI.setContractAsFavorite({ name, isFavorite });
      return result;
    },
  },
};
