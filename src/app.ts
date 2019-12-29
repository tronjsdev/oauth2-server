// eslint-disable-next-line @typescript-eslint/triple-slash-reference,spaced-comment
/// <reference path="./@types/global.d.ts" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference,spaced-comment
/// <reference path="./@types/index.d.ts" />

import path from 'path';

import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import sassMiddleware from 'node-sass-middleware';
import hbs from 'hbs';

import './config/dotenv/load-dotenv';

import { oidcRouter, homeRouter, authRouter, accountRouter } from './routes';
import { appConfig, sessionConfig } from './config';
import { oidcProviderPromise } from './oauth/oidc-provider';
import { ensureLoggedIn, passportMiddleware } from './middlewares';

const app = express();
// hbs.localsAsTemplateData(app); //TODO: use this? https://handyman.dulare.com/passing-variables-through-express-middleware/

// app.enable('trust proxy');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.locals.settings = { ...appConfig, ...app.locals.settings };
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
app.use(passportMiddleware(app));

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  res.locals.loginErrorMsg = req.session.loginErrorMsg;
  res.locals.isAuthenticated = req.isAuthenticated();

  delete req.session.message;

  next();
});

const appPromise = async () => {
  const provider = await oidcProviderPromise();

  app.use('/', homeRouter);
  app.use('/account', ensureLoggedIn(), accountRouter);
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
