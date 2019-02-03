const { paginateResults } = require('./utils');

export default {
  Query: {
    //   launches: async (_: any, __: any, { dataSources }: any): Promise<any> => dataSources.launchAPI.getAllLaunches(),
    launches: async (_: any, { pageSize = 20, after }: any, { dataSources }: any) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      // we want these in reverse chronological order
      allLaunches.reverse();

      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches,
      });

      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        // if the cursor of the end of the paginated results is the same as the
        // last item in _all_ results, then there are no more results after this
        hasMore: launches.length ? launches[launches.length - 1].cursor !== allLaunches[allLaunches.length - 1].cursor : false,
      };
    },
    launch: (_: any, { id }: any, { dataSources }: any) => dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: async (_: any, __: any, { dataSources }: any) => dataSources.userAPI.findOrCreateUser(),
  },
  Launch: {
    isBooked: async (launch: any, _: any, { dataSources }: any) => dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
  },
  Mission: {
    // make sure the default size is 'large' in case user doesn't specify
    missionPatch: (mission: any, { size } = { size: 'LARGE' }) => {
      return size === 'SMALL' ? mission.missionPatchSmall : mission.missionPatchLarge;
    },
  },
  User: {
    trips: async (_: any, __: any, { dataSources }: any) => {
      // get ids of launches by user
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser();

      if (!launchIds.length) return [];

      // look up those launches by their ids
      return (
        dataSources.launchAPI.getLaunchesByIds({
          launchIds,
        }) || []
      );
    },
  },
};
