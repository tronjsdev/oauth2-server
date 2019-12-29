import express, { Response, Request } from 'express';
import passport from 'passport';

import { Account } from '../oauth/account';
import { getUserSignedIn } from '../oauth/oidc-provider.helper';
import { ensureLoggedIn } from '../middlewares';

const authRouter = provider => {
  // base = /auth
  const router = express.Router();

  router.get('/login', async (req: Request, res) => {
    if (req.session?.isAuthenticated) {
      return res.redirect('/auth/me');
    }
    const accountId = await getUserSignedIn(req, res, provider);
    if (accountId) {
      return res.redirect('/auth/me');
    }
    const { nextUrl } = req.query;
    if (req.session) {
      req.session.nextUrl = nextUrl;
    }
    return res.render('auth/login');
  });

  router.post('/login2', async (req: Request, res: Response) => {
    if (req.isAuthenticated) {
      res.redirect('/auth/me');
    } else {
      //TODO: implement user authentication here
      const { email, password } = req.body;
      const accountId = await Account.authenticate(email, password);

      await provider.setProviderSession(req, res, { account: accountId });
      if (req.session) {
        req.session.isAuthenticated = true;
      }
      const { nextUrl = '/auth/me' } = req.session;
      req.session.nextUrl = undefined;
      res.redirect(nextUrl);
    }
  });

  router.post(
    '/login',
    passport.authenticate('local', { failureRedirect: '/auth/login' }),
    async (req, res) => {
      debugger;
      await provider.setProviderSession(req, res, { account: req.user });
      const { nextUrl = '/auth/me' } = req.session;
      req.session.nextUrl = undefined;
      res.redirect(nextUrl);
    }
  );

  router.get('/me', ensureLoggedIn(undefined), async (req: Request, res) => {
    //req.user = await getUserSignedIn(req, res, provider);
    res.render('auth/me', { user: JSON.stringify(req.user) });
  });

  return router;
};

export { authRouter };
