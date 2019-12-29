import { interactionPolicy } from 'oidc-provider';

const { base: policy } = interactionPolicy;

const defaultInteractionPolicy = policy();
const consent = defaultInteractionPolicy.get('consent');
// @ts-ignore
const check = consent.checks.get('scopes_missing');
check.check = ctx => {
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
    //oidc.session.rejectedScopesFor(oidc.params.client_id, oidc.requestParamScopes);
    //oidc.session.rejectedClaimsFor(oidc.params.client_id, oidc.requestParamClaims);
  }

  return false;
};

const getUserSignedIn = async (req, res, oidcProvider)=> {
  const ctx = oidcProvider.app.createContext(req, res);
  const session = await oidcProvider.Session.get(ctx);
  return session.account || session.isNew;
};

export { defaultInteractionPolicy as customInteractionPolicy, getUserSignedIn };
