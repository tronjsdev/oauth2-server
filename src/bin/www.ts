#!/usr/bin/env node

/**
 * Module dependencies.
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';

import debug0 from 'debug';

import appPromise from '../app';

const debug = debug0('oauth2-server:server');

let server;

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

(async () => {
  const app = await appPromise();

  /**
   * Get port from environment and store in Express.
   */

  const port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);

  /**
   * Create HTTP server.
   */

  server = https.createServer(
    {
      key: fs.readFileSync(path.join(__dirname, '../certs/selfsigned.key')),
      cert: fs.readFileSync(path.join(__dirname, '../certs/selfsigned.cert')),
    },
    app
  );

  /**
   * Event listener for HTTP server "error" event.
   */

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */

  function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
    debug(`Listening on ${bind}`);
    console.log(`Listening on ${bind}`);
  }

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
})().catch(err => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exitCode = 1;
});
