module.exports = {
  apps: [
    {
      name: "ts-express",
      cwd: "./dist",
      script: "./bin/www.js",

      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      args: "one two",
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: true,
      ignore_watch: ["node_modules", "./public"],
      max_memory_restart: "1G",
      out_file: "/dev/null",
      error_file: "/dev/null",
      //node_args: '',
      env: {
        PORT: 3000,
        NODE_ENV: "development"
      },
      env_production: {
        PORT: 3000,
        NODE_ENV: "production"
      }
    }
  ],

  deploy: {
    production: {
      user: "node",
      host: "212.83.163.1",
      ref: "origin/master",
      repo: "git@github.com:repo.git",
      path: "/var/www/production",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production"
    }
  }
};
