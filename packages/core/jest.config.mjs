export default {
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        diagnostics: false,
      },
    ],
  },
  testRegex: "(src/.*\\.test)\\.ts$",
  testPathIgnorePatterns: ["/node_modules/", "\\.d\\.ts$", "lib/.*", "lib-esm/.*"],
  watchPathIgnorePatterns: ["playground/.*", "lib/.*", "lib-esm/.*"],
  moduleFileExtensions: ["js", "ts", "json"],
};
