import 'main-dir';
import * as opbeat from 'opbeat';
import * as path from 'path';
import * as sourcemaps from 'source-map-support';
import Application from './application';

opbeat.start();
sourcemaps.install();

process.on('unhandledRejection', (reason: any, promise: any) => {
  console.error('A promise was rejected but did not have a .catch() handler:');
  console.error(reason && reason.stack || reason || promise);
  opbeat.captureError(reason);
  throw reason;
});

let application = new Application({
  environment: process.env.NODE_ENV || 'development',
  dir: path.dirname(__dirname)
});

application.start();

export default application;
