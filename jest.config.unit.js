module.exports = {
  displayName: "unit",
  preset: "ts-jest",
  testEnvironment: "node",
  modulePaths: ["./test/unit"],
  testPathIgnorePatterns: ["/dist/"],

  collectCoverageFrom: [
    "./src/**/*.ts",
  ],
  collectCoverage: true,
  testResultsProcessor: "jest-sonar-reporter",
};
