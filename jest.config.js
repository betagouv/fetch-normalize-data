module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testEnvironment: 'node',
  'testURL': 'http://localhost',
  transform: {
    "^.+\\.(js|jsx|mjs)$": "<rootDir>/jest-transformer.js"
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/',
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$'
  ],
  verbose: true
}
