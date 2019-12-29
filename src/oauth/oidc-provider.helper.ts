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

const getUserSignedIn = async (req, res, oidcProvider) => {
  const ctx = oidcProvider.app.createContext(req, res);
  const session = await oidcProvider.Session.get(ctx);
  return session.account || session.isNew;
};

const logoutSource = (ctx, form) => {
  // @param ctx - koa request context
  // @param form - form source (id="op.logoutForm") to be embedded in the page and submitted by
  //   the End-User
  // Here we dont want to confirm to logout, so we auto submit the form once the page get ready
  // https://github.com/panva/node-oidc-provider/issues/536
  ctx.body = `<!DOCTYPE html>
<head>
  <title>Logging out...</title>
  <style>/* css and html classes omitted for brevity, see lib/helpers/defaults.js */</style>
</head>
<body>
<div>
  <!-- <h1>Do you want to sign-out from ${ctx.host}?</h1> -->
  ${form}
  <button autofocus id="btnYes"
          type="submit"
          form="op.logoutForm"
          value="yes"
          name="logout"
          style="display: none">Yes, sign me out
  </button>
  <button type="submit"
          form="op.logoutForm"
          style="display: none">No, stay signed in
  </button>
</div>
<script>
  document.getElementById('btnYes').click();
</script>
</body>
</html>`;
};

const postLogoutSuccessSource = ctx => {
  // @param ctx - koa request context
  const { clientId, clientName, clientUri, initiateLoginUri, logoUri, policyUri, tosUri } =
    ctx.oidc.client || {}; // client is defined if the user chose to stay logged in with the OP
  const display = clientName || clientId;
  ctx.body = `<!DOCTYPE html>
    <head>
      <title>Sign-out Success</title>
      <style>/* css and html classes omitted for brevity, see lib/helpers/defaults.js */</style>
    </head>
    <body>
    <div>
      <p>Please wait...</p>
      <form action="/auth/post-logout" id="form" method="post">
      
      </form>
    </div>
      <script>
        document.getElementById('form').submit();
      </script>
    </body>
  </html>`;
};

export {
  defaultInteractionPolicy as customInteractionPolicy,
  getUserSignedIn,
  logoutSource,
  postLogoutSuccessSource,
};
