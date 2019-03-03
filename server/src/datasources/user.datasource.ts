import { DataSource } from 'apollo-datasource';

export class DatabaseAPI extends DataSource {
  store: any;
  context: any;

  constructor({ store }: any) {
    super();
    this.store = store;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config: any) {
    this.context = config.context;
  }

  /**
   * Get contract set as favorite
   */
  async getFavoriteContracts() {
    return await this.store.contracts.findAll();
  }

  /**
   * Get contract set as favorite
   */
  async setContractAsFavorite({ name, isFavorite }: any) {
    return await this.store.contracts
      .upsert({
        where: {
          name: name,
        },
        name: name,
        favorite: isFavorite,
      })
      .then(() => true)
      .catch(() => false);
  }
}
