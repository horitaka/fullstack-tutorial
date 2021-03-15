const { paginateResults } = require('./utils')

module.exports = {
  Query: {
    launches: async (_, { pageSize = 20, after }, { dataSources }) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches()
      // allLaunches.reverse()
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches,
      })
      return {
        launches,
        cursol: launches.length ? launches[launches.length - 1].cursol : null,
        hasMore: launches.length
          ? launches[launches.length - 1].cursol !==
            allLaunches[allLaunches.length - 1].cursol
          : false,
      }
    },
    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser(),
  },
  Launch: {
    isBooked: async (launch, _, { dataSources }) =>
      dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
  },
  User: {
    trips: async (_, __, { dataSources }) => {
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser()
      if (!launchIds.length) return []

      return (
        dataSources.launchAPI.getLaunchesByIds({
          launchIds,
        }) || []
      )
    },
  },
  Mission: {
    missionPatch: (mission, { size } = { size: 'LARGE ' }) => {
      return size === 'SMALL'
        ? mission.missionPatchSmall
        : mission.missionPatchLarge
    },
  },
}
