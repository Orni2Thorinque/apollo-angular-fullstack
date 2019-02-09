import { ApolloServer } from 'apollo-server';
import { ApolloServer as ApolloServerLambda } from 'apollo-server-lambda';
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
  let server: any | ApolloServer | ApolloServerLambda;

  console.log(`🚀\tStarting server mode ${process.env.NODE_ENV}`);

  switch (process.env.NODE_ENV) {
    case 'development':
      server = new ApolloServer({
        typeDefs,
        dataSources: getDatasources,
        resolvers: resolvers,
      });

      (<ApolloServer>server).listen({ port: 4000 }).then(({ url }) => console.log(`🚀\tApp running at ${url}`));
      break;

    case 'production':
      server = new ApolloServerLambda({
        typeDefs,
        dataSources: getDatasources,
        resolvers: resolvers,
      });

      exports.graphqlHandler = server.createHandler();
      break;
  }
}
