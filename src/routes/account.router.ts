import express from 'express';

const accountRouter = express.Router();

accountRouter.get('/profile', async (req, res) => {
  //req.user = await getUserSignedIn(req, res, provider);
  res.render('account/profile', { user: JSON.stringify(res.locals.user) });
});

accountRouter.post('/logout', async (req, res) => {
  req.logout();
  res.redirect('/oauth2/session/end');
});

export { accountRouter };
