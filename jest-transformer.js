const config = {
  babelrc: false,
  plugins: ['transform-es2015-modules-commonjs'],
}

module.exports = require('babel-jest').createTransformer(config)
