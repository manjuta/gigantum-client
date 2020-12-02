module.exports = {
  "collectCoverageFrom": [
    "src/js/**/*.js"
  ],
  "setupFiles": [
    "<rootDir>/__tests__/setupTests.js",
    "<rootDir>/config/polyfills.js",
    "<rootDir>/__tests__/localStorage.js",
  ],
  "testMatch": [
    "<rootDir>/**/__tests__/**/*.test.js?(x)"
  ],
  "verbose": false,
  "browser": false,
  "globals": {
    "__DEV__": true
  },
  "testURL": "http://localhost",
  "transform": {
    "^.+\\.(js|jsx)$": "<rootDir>/node_modules/babel-jest",
    "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
    "^(?!.*\\.(js|jsx|css|json)$)": "<rootDir>/config/jest/fileTransform.js"
  },
  "transformIgnorePatterns": [
    // "[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"
    // "/node_modules/(?!(@my-company)/).*/"
    "<rootDir>/(node_modules)/",
    "<rootDir>/node_modules/(?!shared|another)"
  ],
  "unmockedModulePathPatterns": [
    "react",
    "react-dom",
    "react-addons-test-utils",
    "fbjs",
    "enzyme",
    "cheerio",
    "htmlparser2",
    "lodash",
    "domhandler",
    "object.assign",
    "define-properties",
    "function-bind",
    "object-keys",
    "object.values",
    "es-abstract",
  ],
  // "setupTestFrameworkScriptFile": "<rootDir>/__tests__/setupTests.js",
  "moduleNameMapper": {
    "^react-native$": "react-native-web",
    "^react-markdown$": "react-markdown",
    "^Components[/](.+)": "<rootDir>/src/js/components/$1",
    "^Mutations[/](.+)": "<rootDir>/src/js/mutations/$1",
    "^Styles[/](.+)": "<rootDir>/src/css/$1",
    "^Tests[/](.+)": "<rootDir>/__tests__/$1",
    "^JS[/](.+)": "<rootDir>/src/js/$1",
    '^dnd-core$': 'dnd-core/dist/cjs',
    '^react-dnd$': 'react-dnd-cjs',
    '^react-dnd-html5-backend$': 'react-dnd-html5-backend-cjs',
    "^easymde/dist/easymde.min.css$": "<rootDir>/node_modules/easymde/dist/easymde.min.css",
  },
  "testEnvironment": "jsdom"
  // "testEnvironmentOptions": "<!DOCTYPE html><html><body><div id='root'></div></body></html>"
}
