const config = {
  babelrc: false,
  plugins: ['@babel/transform-modules-commonjs'],
}

module.exports = require('babel-jest').createTransformer(config)
