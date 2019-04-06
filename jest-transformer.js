const config = {
  babelrc: false,
  plugins: [
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    "transform-es2015-modules-commonjs"
  ],
  presets: [
    [
      "@babel/env",
      {
        modules: false
      }
    ],
    "@babel/react"
  ]
};
module.exports = require("babel-jest").createTransformer(config);
