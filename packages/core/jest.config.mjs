export default {
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
  },
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testRegex: "(src/.*\\.test)\\.ts$",
  testPathIgnorePatterns: ["/node_modules/", "\\.d\\.ts$", "lib/.*", "lib-esm/.*"],
  watchPathIgnorePatterns: ["playground/.*", "lib/.*", "lib-esm/.*"],
  moduleFileExtensions: ["js", "ts", "json"],
};
