/* eslint-disable spaced-comment */


declare interface AppConfig {
  LOGIN_PATH: string;
  DEFAULT_REDIRECT_PATH: string;
}

declare namespace NodeJS {
  interface Process {
    readonly browser: boolean;
  }

  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}

declare namespace Express {
  interface Request {
    // body?: any;
    session?: any;
    user?: any;
    locals?: any;
    //flash: (...props)=>void,
    app: {
      locals: {
        settings: AppConfig | any;
      };
    };
  }
}
