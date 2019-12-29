import passport from 'passport';
import { IVerifyOptions, Strategy as LocalStrategy } from 'passport-local';

import { Account } from '../oauth/account';

const doNotUseSessionPages = [];

const passportMiddleware = app => {
  app.use(passport.initialize());
  
  // Passport resolve session on every request, which also call to passport.deserializeUser
  // This is a trick to avoid that on certain paths
  app.use((req, res, next) => {
    if (doNotUseSessionPages.some(x=>x===req.url)) {
      next(); // do not invoke passport
    } else {
      passport.session()(req, res, next);
      //app.use(passport.session());
    }
  });
  
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
              return done(null, false, { message: 'Incorrect credential' });
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
