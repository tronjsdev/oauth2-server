/* eslint-disable @typescript-eslint/camelcase */

import { Configuration } from 'oidc-provider';

import { customInteractionPolicy } from './oidc-provider.helper';

const oidcProviderConfig: Configuration = {
  // ... see the available options in Configuration options section
  features: {
    introspection: { enabled: true },
    revocation: { enabled: true },
    registration: { enabled: true },
    registrationManagement: { enabled: true },
    /* clientCredentials: {
      enabled: true
    }, */
    devInteractions: { enabled: false },
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
  clients: [
    {
      /* eslint-disable @typescript-eslint/camelcase */
      client_id: '0-0-0-0',
      client_secret: 'cooool_nodejs',
      redirect_uris: ['https://127.0.0.1:3000/auth/cb'],
      response_types: ['id_token token'],
      grant_types: ['implicit'],
      scope: 'openid email profile test',
      token_endpoint_auth_method: 'client_secret_basic',
      is_first_party: true,
    },{
      /* eslint-disable @typescript-eslint/camelcase */
      client_id: '0-0-0-1',
      client_secret: 'cooool_nodejs',
      redirect_uris: ['https://127.0.0.1:3001/auth/cb'],
      response_types: ['code'],
      grant_types: ['authorization_code'],
      scope: 'openid email profile test',
      token_endpoint_auth_method: 'client_secret_basic',
      client_name: '7ONe Inc.',
      logo_uri: 'https://127.0.0.1:3000/images/7ONe-logo.png',
    },
  ],

  //findAccount: Account.findAccount,
  claims: {
    openid: ['sub'],
    email: ['email', 'email_verified'],
    profile: ['name', 'gender'],
    test: ['nickname'],
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
  responseTypes: [
    'code',
    'code id_token',
    'code id_token token',
    'code token',
    'id_token',
    'id_token token',
    'none',
  ],
  // ...
};

export { oidcProviderConfig };
