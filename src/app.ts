// eslint-disable-next-line @typescript-eslint/triple-slash-reference,spaced-comment
/// <reference path="./@types/global.d.ts" />

import path from 'path';

import createError from 'http-errors';
import express, { Request } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import sassMiddleware from 'node-sass-middleware';
import hbs from 'hbs';

import './config/dotenv/load-dotenv';

import { oidcRouter, usersRouter, homeRouter, authRouter, privateRouter } from './routes';
import { sessionConfig } from './config';
import { getUserSignedIn } from './oauth/oidc-provider.helper';
import { oidcProviderPromise } from './oauth/oidc-provider';

const app = express();

// app.enable('trust proxy');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views/_partials'));

// app.use(bodyParser.json()); // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessionConfig);
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: false, // true = .sass and false = .scss
    sourceMap: true,
  })
);
app.use(express.static(path.join(__dirname, 'public')));

const appPromise = async () => {
  const provider = await oidcProviderPromise();
  app.use(async (req: Request, res, next) => {
    try {
      const user = await getUserSignedIn(req, res, provider);
      req.isAuthenticated = !!user;
      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  });

  // TODO: extract this method to a file
  const ensureLogin = (req, res, next) => {
    if (!req.isAuthenticated) {
      return res.redirect('/auth/login');
    }
    return next();
  };

  app.use('/', homeRouter);
  app.use('/private', ensureLogin, privateRouter);
  app.use('/users', usersRouter);
  app.use('/oauth2', oidcRouter(provider));
  app.use('/auth', authRouter(provider));

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  // express error handler
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
  return app;
};

export default appPromise;
