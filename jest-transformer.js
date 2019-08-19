const config = {
  babelrc: false,
  presets: [
    [
      "@babel/env",
      {
        modules: false
      }
    ]
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    "transform-es2015-modules-commonjs"
  ]
}

module.exports = require("babel-jest").createTransformer(config)
