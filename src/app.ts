// eslint-disable-next-line @typescript-eslint/triple-slash-reference,spaced-comment
/// <reference path="./@types/global.d.ts" />

import path from 'path';

import createError from 'http-errors';
import express, { Request } from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import sassMiddleware from 'node-sass-middleware';
import hbs from 'hbs';
import { Strategy as LocalStrategy } from 'passport-local';

import './config/dotenv/load-dotenv';

import { oidcRouter, usersRouter, homeRouter, authRouter, privateRouter } from './routes';
import { sessionConfig } from './config';
import { oidcProviderPromise } from './oauth/oidc-provider';
import { ensureLoggedIn } from './middlewares';
import { getUserSignedIn } from './oauth/oidc-provider.helper';
import { Account } from './oauth/account';

const LOGIN_URL = '/auth/login';
const app = express();
// hbs.localsAsTemplateData(app); //TODO: use this? https://handyman.dulare.com/passing-variables-through-express-middleware/

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

app.use(
  sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: false, // true = .sass and false = .scss
    sourceMap: true,
  })
);
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const accountId = await Account.authenticate(email, password);
      if (!accountId) {
        return done(null, false, { message: 'Incorrect credential.' });
      }
      return done(null, accountId);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((userContext, done) => {
  done(null, userContext);
});

passport.deserializeUser((obj, done) => {
  console.log('passport.deserializeUser', obj);
  done(null, obj);
});

const appPromise = async () => {
  const provider = await oidcProviderPromise();

  app.use('/', homeRouter);
  app.use('/private', ensureLoggedIn(), privateRouter);
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
