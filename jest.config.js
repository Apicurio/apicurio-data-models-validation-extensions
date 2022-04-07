module.exports = {
	verbose: true,
	projects: ["<rootDir>/js/packages/*/jest.config.js"],
	collectCoverageFrom: [
	  "<rootDir>/js/packages/*/src/**/*.ts"
	],
	moduleDirectories: ["node_modules"],
	preset: "ts-jest",
	testTimeout: 60000
  };