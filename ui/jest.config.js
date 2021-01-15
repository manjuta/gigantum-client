module.exports = {
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "runtimeArgs": [
        "--inspect-brk",
        "${workspaceRoot}/node_modules/.bin/jest",
        "--runInBand"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "port": 9229
    }
  ],
  "collectCoverageFrom": [
    "src/js/components/**/*.js",
    "src/js/components/**/*.jsx",
    "!src/js/components/**/__tests__/**.js",
    "!src/js/components/**/__tests__/**.jsx",
  ],
  "coverageReporters": ["text","html", "JSON"],
  "coverageDirectory": "<rootDir>/coverage/",
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
  "testEnvironment": "jsdom",
  "testEnvironmentOptions": {
      html: "<html lang=\"en\"><body><div id=\"modal__cover\" class=\"modal__cover hidden\"><div><div id=\"modal\" class=\"ReactDom\"></div><div id=\"header\" class=\"ReactDom\"></div><div id=\"side_panel\"></div><div id=\"lightbox\" class=\"lightbox\"></div><div id=\"loader\" class=\"Loader fixed--important hidden\"></div></body></html>",
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.71 Safari/534.24',
    },
}
