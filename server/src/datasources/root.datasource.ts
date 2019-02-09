import { RESTDataSource } from 'apollo-datasource-rest';
import { DataSources } from 'apollo-server-core/dist/requestPipeline';
import { CycloApi } from './cyclo.datasource';
import { GoogleMapsAPI } from './google-maps.datasource';
import { LaunchAPI } from './launch.datasource';

const { createStore } = require('../utils');
const store = createStore();

const UserAPI = require('./user.datasource');

export function getDatasources(): DataSources<RESTDataSource> {
  const cycloApiKey = process.env.JCDECAUX_API_KEY;
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!cycloApiKey) {
    throw new Error('🚀\tServer Launch Exception: Api key missing for JCDecaux');
  }

  if (!googleMapsApiKey) {
    throw new Error('🚀\tServer Launch Exception: Api key missing for Google Maps');
  }

  return {
    launchAPI: new LaunchAPI(),
    cycloAPI: new CycloApi(cycloApiKey),
    googleMapsAPI: new GoogleMapsAPI(googleMapsApiKey),
    userAPI: new UserAPI({ store }),
  };
}
