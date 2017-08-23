import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import license from 'rollup-plugin-license';
import sourcemaps from 'rollup-plugin-sourcemaps';
import postcss from 'rollup-plugin-postcss';
import resolvePlugin from 'rollup-plugin-node-resolve';

import path from 'path';
import less from 'less';
import autoprefixer from 'autoprefixer';

const copyFile = require('./tools/file-util').copyFile;
const pkg = require('./package.json');

const isProduction = process.env.BUILD === 'production';

const preprocessor = (content, id) => new Promise((resolve, reject) => {
  less.render(content, {
    paths: [path.resolve(__dirname, 'src')],
    filename: id
  }, (err, output) => {
    if (err) {
      reject(err);
    } else {
      resolve({
        code: output.css
        // map: renderer.sourcemap
      });
    }
  });
});

// Rollup plugin to copy static files
function copy() {
  return {
    name: 'docs-copy',
    onwrite() {
      copyFile('src/colors.less', 'dist/colors.less');
      copyFile('src/variables.less', 'dist/variables.less');
      copyFile('src/resources/lui-icons.ttf', 'dist/lui-icons.ttf');
      copyFile('src/resources/lui-icons.woff', 'dist/lui-icons.woff');
    }
  };
}

const config = {
  entry: 'src/leonardo-ui.js',
  dest: `dist/leonardo-ui${isProduction ? '.min' : ''}.js`,
  moduleName: 'leonardoui',
  format: 'umd',
  sourceMap: !isProduction,
  plugins: [
    copy(),
    babel({
      exclude: ['node_modules/**', '**/*.less']
    }),
    resolvePlugin({
      modulesOnly: true,
      customResolveOptions: {
        moduleDirectory: 'src'
      }
    }),
    postcss({
      preprocessor,
      extensions: ['.less'],
      sourceMap: !isProduction, // true, "inline" or false
      extract: path.resolve(__dirname, `dist/leonardo-ui${isProduction ? '.min' : ''}.css`),
      plugins: [autoprefixer({
        browsers: [
          'last 2 Chrome versions',
          'last 2 Firefox versions',
          'Explorer >= 10',
          'Safari >= 8.0',
          'iOS >= 9.0'
        ]
      })]
    }),
    license({
      banner: `
${pkg.name} v${pkg.version}
Copyright (c) ${new Date().getFullYear()} QlikTech International AB
This library is licensed under MIT - See the LICENSE file for full details
`
    })
  ]
};

if (isProduction) {
  config.dest = 'dist/leonardo-ui.min.js';
  config.plugins.push(uglify());
} else {
  config.plugins.push(sourcemaps());
}

export default config;
