import { ApolloServer } from 'apollo-server';
import * as dotenv from 'dotenv';
import { getDatasources } from './datasources/root.datasource';
import resolvers from './resolvers';
import typeDefs from './schema';

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => console.log('Module disposed. '));
}

try {
  startServer();
} catch (e) {
  console.error(e);
  process.exit();
}

function startServer() {
  dotenv.config();

  const server = new ApolloServer({
    typeDefs,
    dataSources: getDatasources,
    resolvers: resolvers,
  });

  server.listen({ port: 4000 }).then(({ url }) => console.log(`🚀 App running at ${url}`));
}
