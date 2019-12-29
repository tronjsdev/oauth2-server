/* eslint-disable @typescript-eslint/camelcase */

import { strict as assert } from 'assert';

import express, { urlencoded, Router } from 'express'; // eslint-disable-line import/no-unresolved
import passport from 'passport';

import { Account } from '../oauth/account';

const router: Router = express.Router();

const body = urlencoded({ extended: false });

function setNoCache(req, res, next) {
  res.set('Pragma', 'no-cache');
  res.set('Cache-Control', 'no-cache, no-store');
  next();
}

const oidcRouter = oidcProvider => {
  const {
    constructor: {
      // @ts-ignore
      errors: { SessionNotFound },
    },
  } = oidcProvider;
  router.get('/interaction/:uid', setNoCache, async (req, res, next) => {
    try {
      const { uid, prompt, params, session } = await oidcProvider.interactionDetails(req, res);
      const client = await oidcProvider.Client.find(params.client_id);

      if (session && client.is_first_party) {
        const result = {
          select_account: {}, // make sure its skipped by the interaction policy since we just logged in
          login: {
            account: session.accountId,
          },
        };

        return await oidcProvider.interactionFinished(req, res, result, {
          mergeWithLastSubmission: false,
        });
      }

      const { error } = req.query;

      switch (prompt.name) {
        case 'select_account': {
          /* if (!session) {
            // eslint-disable-next-line @typescript-eslint/camelcase
            return provider.interactionFinished(req, res, { select_account: {} }, { mergeWithLastSubmission: false });
          }
          
          const account = await provider.Account.findAccount(undefined, session.accountId);
          const { email } = await account.claims('prompt', 'email', { email: null }, []);
          
          return res.render('select_account', {
            client,
            uid,
            email,
            details: prompt.details,
            params,
            title: 'Sign-in',
            session: session ? debug(session) : undefined,
            dbg: {
              params: debug(params),
              prompt: debug(prompt),
            },
          }); */
          return null;
        }
        case 'login': {
          const { details } = prompt;
          return res.render('oauth2/login', {
            client,
            uid,
            details,
            params,
            title: 'Sign-in',
            session,
            error,
            /* dbg: {
              params: debug(params),
              prompt: debug(prompt),
            }, */
          });
        }
        case 'consent': {
          const { details } = prompt;
          const isNewAuth = [
            details.scopes.accepted,
            details.scopes.rejected,
            details.claims.accepted,
            details.claims.rejected,
          ].every(obj => obj?.length === 0);
          const isOldAuth = [details.scopes.new, details.claims.new].every(
            obj => obj?.length === 0
          );
          const newScopes = new Set(details.scopes.new);
          newScopes.delete('openid');
          newScopes.delete('offline_access');

          const newClaims = new Set(details.claims.new);
          ['sub', 'sid', 'auth_time', 'acr', 'amr', 'iss'].forEach(
            Set.prototype.delete.bind(newClaims)
          );

          const isOffline = params.scope && params.scope.includes('offline_access');
          const isOldOffline = !details.scopes.new.includes('offline_access');
          return res.render('oauth2/interaction', {
            client,
            uid,
            details: prompt.details,
            params,
            title: 'Authorize',
            session,
            isNewAuth,
            isOldAuth,
            newScopes: [...newScopes],
            newClaims: [...newClaims],
            isOffline,
            isOldOffline,
            /*dbg: {
              params: debug(params),
              prompt: debug(prompt),
            },*/
          });
        }
        default:
          return undefined;
      }
    } catch (err) {
      return next(err);
    }
  });

  router.post('/interaction/:uid/login', setNoCache, body, async (req, res, next) => {
    try {
      const {
        prompt: { name, details },
        params,
        uid,
        session,
      } = await oidcProvider.interactionDetails(req, res);
      assert.equal(name, 'login');
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          req.session.loginErrorMsg = info.message;
          return res.redirect(`/oauth2/interaction/${uid}`);
        }
        // Passport exposes a login() function on req (also aliased as logIn()) that can be used to establish a login session.
        // http://www.passportjs.org/docs/login/
        // eslint-disable-next-line no-shadow,@typescript-eslint/no-misused-promises
        return req.logIn(user, async err => {
          if (err) {
            return next(err);
          }
          const accountId = user;
          const result = {
            select_account: {}, // make sure its skipped by the interaction policy since we just logged in
            login: {
              account: accountId,
            },
          };

          return oidcProvider.interactionFinished(req, res, result, {
            mergeWithLastSubmission: false,
          });
        });
      })(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  router.post('/interaction/:uid/continue', setNoCache, body, async (req, res, next) => {
    try {
      const interaction = await oidcProvider.interactionDetails(req, res);
      const {
        prompt: { name, details },
      } = interaction;
      assert.equal(name, 'select_account');

      if (req.body.switch) {
        if (interaction.params.prompt) {
          const prompts = new Set(interaction.params.prompt.split(' '));
          prompts.add('login');
          interaction.params.prompt = [...prompts].join(' ');
        } else {
          interaction.params.prompt = 'logout';
        }
        await interaction.save();
      }

      const result = { select_account: {} };
      await oidcProvider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err) {
      next(err);
    }
  });

  router.post('/interaction/:uid/confirm', setNoCache, body, async (req, res, next) => {
    try {
      const {
        prompt: { name, details },
      } = await oidcProvider.interactionDetails(req, res);
      assert.equal(name, 'consent');

      const consent: any = {};

      // any scopes you do not wish to grant go in here
      //   otherwise details.scopes.new.concat(details.scopes.accepted) will be granted
      consent.rejectedScopes = [];

      // any claims you do not wish to grant go in here
      //   otherwise all claims mapped to granted scopes
      //   and details.claims.new.concat(details.claims.accepted) will be granted
      consent.rejectedClaims = [];

      // replace = false means previously rejected scopes and claims remain rejected
      // changing this to true will remove those rejections in favour of just what you rejected above
      consent.replace = false;

      const result = { consent };
      await oidcProvider.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
    } catch (err) {
      next(err);
    }
  });

  router.get('/interaction/:uid/abort', setNoCache, async (req, res, next) => {
    try {
      const result = {
        error: 'access_denied',
        error_description: 'End-User aborted interaction',
      };
      await oidcProvider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err) {
      next(err);
    }
  });

  router.use((err, req, res, next) => {
    if (err instanceof SessionNotFound) {
      // handle interaction expired / session not found error
    }
    next(err);
  });

  router.use(oidcProvider.callback);
  return router;
};

export { oidcRouter };
