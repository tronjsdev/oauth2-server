import express from 'express';
import passport from 'passport';

import { ensureLoggedIn } from '../middlewares';

const authRouter = provider => {
  // base = /auth
  const router = express.Router();

  router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect(req.app.locals.settings.DEFAULT_REDIRECT_PATH);
    }
    const { nextUrl } = req.query;
    if (req.session) {
      req.session.nextUrl = nextUrl;
    }
    return res.render('auth/login');
  });

  router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.session.loginErrorMsg = info.message;
        return res.redirect(req.app.locals.settings.LOGIN_PATH);
      }
      // Passport exposes a login() function on req (also aliased as logIn()) that can be used to establish a login session.
      // http://www.passportjs.org/docs/login/
      // eslint-disable-next-line no-shadow,@typescript-eslint/no-misused-promises
      return req.logIn(user, async err => {
        if (err) {
          return next(err);
        }
        await provider.setProviderSession(req, res, { account: req.user });
        const { nextUrl = req.app.locals.settings.DEFAULT_REDIRECT_PATH } = req.session;
        delete req.session.nextUrl;
        return res.redirect(nextUrl);
      });
    })(req, res, next);
  });

  router.post('/post-logout', (req, res) => {
    res.redirect('/');
  });

  /*router.post(
    '/login3',
    passport.authenticate('local', {
      failureRedirect: '/auth/login',
    }),
    async (req, res) => {
      debugger;
      await provider.setProviderSession(req, res, { account: req.user });
      const { nextUrl = '/auth/me' } = req.session;
      req.session.nextUrl = undefined;
      res.redirect(nextUrl);
    }
  );*/

  return router;
};

export { authRouter };
