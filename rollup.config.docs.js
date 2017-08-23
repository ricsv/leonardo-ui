import path from 'path';

import browsersync from 'rollup-plugin-browsersync';
import config from './rollup.config';

const buildDocs = require('./docs/build').buildAll;
const buildFixtures = require('./test/fixtures/build').buildAll;

// Rollup plugin to build docs and fixtures
function oncomplete() {
  return {
    name: 'oncomplete',
    onwrite() {
      buildDocs();
      buildFixtures();
    }
  };
}

config.plugins.push(browsersync({
  open: false,
  notify: false,
  server: [
    path.resolve(__dirname, './docs/dist'),
    path.resolve(__dirname, './test/fixtures/dist')
  ],
  files: [{
    match: [`${path.resolve(__dirname, 'docs/src')}/**/*.*`],
    fn: function docsChanged(event) {
      if (event === 'change') {
        buildDocs();
      }
    }
  }, {
    match: [`${path.resolve(__dirname, 'test/fixtures/src')}/**/*.*`],
    fn: function fixtureChanged(event) {
      if (event === 'change') {
        buildFixtures();
      }
    }
  }],
  port: 8080,
  ui: {
    port: 8081
  }
}));
config.plugins.push(oncomplete());

export default config;
