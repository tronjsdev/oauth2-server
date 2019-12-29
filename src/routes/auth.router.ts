import express, { Response, Request } from 'express';
import passport from 'passport';

import { ensureLoggedIn } from '../middlewares';

const authRouter = provider => {
  // base = /auth
  const router = express.Router();

  router.get('/login', async (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect('/auth/me'); //TODO: move to const
    }
    const { nextUrl } = req.query;
    if (req.session) {
      req.session.nextUrl = nextUrl;
    }
    return res.render('auth/login');
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

  router.get('/me', ensureLoggedIn(), async (req: Request, res) => {
    //req.user = await getUserSignedIn(req, res, provider);
    res.render('auth/me', { user: JSON.stringify(req.user) });
  });

  return router;
};

export { authRouter };
