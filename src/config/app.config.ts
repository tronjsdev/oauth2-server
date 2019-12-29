interface AppConfig {
  LOGIN_PATH: string;
  DEFAULT_REDIRECT_PATH: string;
}

const appConfig: AppConfig = {
  LOGIN_PATH: '/auth/login',
  DEFAULT_REDIRECT_PATH: '/account/profile',
};

export { appConfig, AppConfig };
