/* eslint-disable @typescript-eslint/camelcase */

import { Configuration } from 'oidc-provider';

import { customInteractionPolicy } from './oidc-provider.helper';
import { Account } from './account';

const oidcProviderConfig: Configuration = {
  // ... see the available options in Configuration options section
  features: {
    introspection: { enabled: true },
    revocation: { enabled: true },
    registration: { enabled: true, initialAccessToken: true },
    registrationManagement: { enabled: true },
    devInteractions: { enabled: false },
    //clientCredentials: { enabled: true },
  },
  scopes: ['openid', 'email', 'profile'],
  /* responseTypes: [
    'code',
    'id_token', 'id_token token',
    'code id_token', 'code token', 'code id_token token',
    'none',
  ], */
  // formats: {
  //   AccessToken: 'jwt',
  //   ClientCredentials: 'jwt',
  // },
  tokenEndpointAuthMethods: ['client_secret_basic'],
  introspectionEndpointAuthMethods: ['client_secret_basic'],
  clients: [
    {
      /* eslint-disable @typescript-eslint/camelcase */
      client_id: '0-0-0-0',
      client_secret: 'cf6baa772bba217ff55409f2b4517e13ce817bd2',
      redirect_uris: ['https://127.0.0.1:3000/auth/cb'],
      response_types: ['id_token token'],
      grant_types: ['implicit'],
      scope: 'openid email profile',
      //token_endpoint_auth_method: 'client_secret_basic',
      is_first_party: true,
    },
    {
      client_id: '0-0-0-1',
      client_secret: 'cf6baa772bba217ff55409f2b4517e13ce817bd2',
      redirect_uris: ['https://127.0.0.1:3001/auth/cb'],
      response_types: ['code'],
      grant_types: ['authorization_code'],
      scope: 'openid email profile',
      client_name: '7ONe Inc.',
      logo_uri: 'https://127.0.0.1:3000/images/7ONe-logo.png',
      introspection_endpoint_auth_method: 'client_secret_basic',
      is_first_party: true,
    },
    {
      // Offline access client (often using in api resource server)
      // The in the authorization request must to append: &prompt=consent (kind of let the user to confirm there is a offline access request)
      // and append &scope=offline_access
      client_id: '0-0-0-2',
      client_secret: 'cf6baa772bba217ff55409f2b4517e13ce817bd2',
      redirect_uris: ['https://127.0.0.1:3001/auth/cb'],
      response_types: ['code'],
      grant_types: ['authorization_code', 'refresh_token'],
      scope: 'openid email profile offline_access',
      client_name: '7ONe Inc.',
      logo_uri: 'https://127.0.0.1:3000/images/7ONe-logo.png',
      introspection_endpoint_auth_method: 'client_secret_basic',
      //is_first_party: true,
    },
  ],
  
  findAccount: Account.findAccount,
  claims: {
    openid: ['sub'],
    email: ['email', 'email_verified'],
    profile: ['name', 'gender', 'picture'],
  },

  interactions: {
    url: (ctx, interaction) => {
      return `/oauth2/interaction/${ctx.oidc.uid}`;
    },
    policy: customInteractionPolicy,
  },
  extraClientMetadata: {
    // Adding extra props in the `clients` section above
    properties: ['is_first_party'],
  },
  //routes:{ }
  /*responseTypes: [
    'code',
    'code id_token',
    'code id_token token',
    'code token',
    'id_token',
    'id_token token',
    'none',
  ],*/
  // ...
};

export { oidcProviderConfig };
