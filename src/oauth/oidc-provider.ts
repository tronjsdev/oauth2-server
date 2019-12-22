import Provider from 'oidc-provider';

import { port } from '../config';

import { Account } from './account';
import { oidcProviderConfig } from './oidc-provider.config';

// oidcProviderConfig.findAccount = Account.findAccount;

export const oidcProvider = new Provider(`http://localhost:${port}`, oidcProviderConfig);
