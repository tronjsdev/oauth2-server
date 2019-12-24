import Provider from 'oidc-provider';

import { port } from '../config';

import { oidcProviderConfig } from './oidc-provider.config';

const oidcProvider = new Provider(`http://localhost:${port}`, oidcProviderConfig);
//TODO: save to backend ??
new oidcProvider.InitialAccessToken({})
  .save()
  .then(token => console.log('Register InitialAccessToken:\n', token));

export { oidcProvider };
