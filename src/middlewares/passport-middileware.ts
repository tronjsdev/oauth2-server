import passport from 'passport';
import { IVerifyOptions, Strategy as LocalStrategy } from 'passport-local';

import { Account } from '../oauth/account';

const passportMiddleware = app => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((userContext, done) => {
    done(null, userContext);
  });

  passport.deserializeUser((obj, done) => {
    console.log('passport.deserializeUser', obj);
    done(null, obj);
  });

  return (req, res, next) => {
    passport.use(
      new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        Account.authenticate(email, password)
          .then(accountId => {
            if (!accountId) {
              return done(null, false, { message: 'Incorrect credential.' });
            }
            return done(null, accountId);
          })
          .catch(err => {
            return done(err);
          });
      })
    );
    next();
  };
};

export { passportMiddleware };
