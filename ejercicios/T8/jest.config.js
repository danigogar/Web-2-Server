export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js','!src/index.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  verbose: true
}