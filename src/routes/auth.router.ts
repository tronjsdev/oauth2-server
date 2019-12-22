import express, { Response, Request } from 'express';

import { oidcProvider as provider } from '../oauth/oidc-provider';

const authRouter = app => {
  // base = /auth
  const router = express.Router();

  router.get('/login', async (req: Request, res) => {
    if (req.isAuthenticated) {
      res.redirect('/auth/me');
    } else {
      res.render('auth/login');
    }
  });

  router.post('/login', async (req: Request, res: Response) => {
    if (req.isAuthenticated) {
      res.redirect('/auth/me');
    } else {
      //TODO: implement user authentication here
      const { email, password } = req.body;
      await provider.setProviderSession(req, res, { account: email });
      res.redirect('/auth/me');
    }
  });

  router.get('/me', (req: Request, res) => {
    res.render('auth/me', { user: JSON.stringify(req.user) });
  });

  return router;
};

export { authRouter };
