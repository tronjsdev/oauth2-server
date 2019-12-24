/* eslint-disable */


const path = require('path');

const dotenv = require( 'dotenv');
const dotenvExpand = require( 'dotenv-expand');

const env = process.env.NODE_ENV;

const dotEnvResult = dotenv.config({
  //path: path.resolve(__dirname, `.env.${env}`),
  path: path.join(__dirname, `.env.${env}`),
});

dotenvExpand(dotEnvResult);

if (dotEnvResult.error) {
  throw dotEnvResult.error;
}
