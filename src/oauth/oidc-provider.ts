import Provider from 'oidc-provider';

import { oidcProviderConfig } from './oidc-provider.config';
import { MongoAdapter } from './mongodb-adapter';

const oidcProviderPromise: () => Promise<Provider> = async () => {
  let adapter;
  if (process.env.OIDC_ADAPTER_MONGODB_URI) {
    adapter = MongoAdapter;
    await adapter.connect();
  }
  const provider: Provider = new Provider(`${process.env.OIDC_ISSUER}`, {
    adapter,
    ...oidcProviderConfig,
  });

  new provider.InitialAccessToken({})
    .save()
    .then(token => console.log('Register InitialAccessToken:\n', token));
  return provider;
};

export { oidcProviderPromise };
