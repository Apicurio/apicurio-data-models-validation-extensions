const baseConfig = require("../../../jest.config");
const packageName = 'spectral-validation-extension';

module.exports = {
    ...baseConfig,
    rootDir: '../..',
    preset: 'ts-jest',
    moduleNameMapper: {
        "^nimma/legacy$": "<rootDir>/../node_modules/nimma/dist/legacy/cjs/index.js",
        "^nimma/fallbacks$": "<rootDir>/../node_modules/nimma/dist/legacy/cjs/fallbacks/index.js"
    },
    roots: [
        `<rootDir>/packages/${packageName}`,
      ],
      collectCoverageFrom: [
        `<rootDir>/packages/${packageName}/src/**/*`,
      ],
      testRegex: '(/tests/.*)\\.(tsx?)$',
      testURL: 'http://localhost/',
      moduleDirectories: [
          'node_modules',
      ],
      modulePaths: [
          `<rootDir>/packages/${packageName}/src/`,
      ],
      projects: [`<rootDir>/packages/${packageName}/jest.config.js`],
      name: packageName,
      displayName: packageName,
      rootDir: '../..',
      testPathIgnorePatterns: [
        `<rootDir>/packages/${packageName}/tests/__util__\\.ts`
      ]
}
