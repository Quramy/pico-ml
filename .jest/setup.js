// Workaround for jest issue https://github.com/facebook/jest/issues/9983 .
if (!global.TextEncoder) {
  global.TextEncoder = require("util").TextEncoder;
}
