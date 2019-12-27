/* eslint-disable spaced-comment */

declare namespace NodeJS {
  interface Process {
    readonly browser: boolean;
  }

  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}

declare namespace Express{
  interface Request{
    // body?: any;
    session?: any;
    isAuthenticated?: boolean,
    user?: any,
  }
}
