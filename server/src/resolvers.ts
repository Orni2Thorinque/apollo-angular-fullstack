export default {
  Query: {
    launches: async (_: any, __: any, { dataSources }: any): Promise<any> => dataSources.launchAPI.getAllLaunches(),
    launch: (_: any, { id }: any, { dataSources }: any) => dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: async (_: any, __: any, { dataSources }: any) => dataSources.userAPI.findOrCreateUser(),
  },
};
