import { interactionPolicy, ClaimsParameterMember } from 'oidc-provider';

import { oidcProvider as provider } from './oidc-provider';

const { Check, Prompt, base: policy } = interactionPolicy;

const defaultInteractionPolicy = policy();
const consent = defaultInteractionPolicy.get('consent');
// @ts-ignore
const check = consent.checks.get('scopes_missing');
check.check = (ctx) => {
  debugger;
  const { oidc } = ctx;
  const promptedScopes = oidc.session.promptedScopesFor(oidc.client.clientId);

  if (!oidc.client.is_first_party) {
    // eslint-disable-next-line no-restricted-syntax
    for (const scope of oidc.requestParamScopes) {
      if (!promptedScopes.has(scope)) {
        return true;
      }
    }
  } else {
    // Skip consent confirmation screen on the client that have is_first_party = true
    oidc.session.ensureClientContainer(oidc.client.clientId);
    oidc.session.promptedScopesFor(oidc.params.client_id, oidc.requestParamScopes);
    oidc.session.promptedClaimsFor(oidc.params.client_id, oidc.requestParamClaims);
  }

  return false;
};

const getUserSignedIn = async (req, res)=> {
  const ctx = provider.app.createContext(req, res);
  const session = await provider.Session.get(ctx);
  return session.account;
};

export { defaultInteractionPolicy as customInteractionPolicy, getUserSignedIn };