import { RESTDataSource } from 'apollo-datasource-rest';

export class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2/';
  }

  public async getAllLaunches() {
    console.log(`🚀\tgetAllLaunches !`);
    const response = await this.get('launches');
    return Array.isArray(response) ? response.map(launch => this.launchReducer(launch)) : [];
  }

  public launchReducer(launch: any) {
    console.log(`🚀\tlaunchReducer !`, launch);
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
      medias: {
        wikipedia: launch.links.wikipedia,
        youtube: launch.links.video_link,
        flicker: launch.links.flickr_images,
      },
    };
  }

  public async getLaunchById({ launchId }: any) {
    const response = await this.get('launches', { flight_number: launchId });
    return this.launchReducer(response[0]);
  }

  public getLaunchesByIds({ launchIds }: any) {
    return Promise.all(launchIds.map((launchId: any) => this.getLaunchById({ launchId })));
  }
}
