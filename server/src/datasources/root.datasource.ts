import { RESTDataSource } from 'apollo-datasource-rest';
import { DataSources } from 'apollo-server-core/dist/requestPipeline';
import { CycloApi } from './cyclo.datasource';
import { LaunchAPI } from './launch.datasource';

const { createStore } = require('../utils');
const store = createStore();

const UserAPI = require('./user.datasource');

export function getDatasources(): DataSources<RESTDataSource> {
  const cycloApiKey = process.env.JCDECAUX_API_KEY;

  if (!cycloApiKey) {
    throw new Error('Server Launch Exception: Api key missing');
  }

  return {
    launchAPI: new LaunchAPI(),
    cycloAPI: new CycloApi(cycloApiKey),
    userAPI: new UserAPI({ store }),
  };
}
