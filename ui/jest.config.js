module.exports = {
  "collectCoverageFrom": [
    "src/js/**/*.js"
  ],
  "setupFiles": [
    "<rootDir>/config/polyfills.js",
    "<rootDir>/__tests__/slickTestSetup.js",
    "<rootDir>/__tests__/localStorage.js",
    "<rootDir>/__tests__/setupFile.js"
  ],
  "testMatch": [
    "<rootDir>/**/__tests__/**/*.test.js?(x)"
  ],
  "verbose": false,
  "browser": true,
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
    "<rootDir>/node_modules/(?!shared|another)"
  ],
  "moduleNameMapper": {
    "^react-native$": "react-native-web",
    "^react-markdown$": "react-markdown",
    "^Components[/](.+)": "<rootDir>/src/js/components/$1",
    "^Mutations[/](.+)": "<rootDir>/src/js/mutations/$1",
    "^JS[/](.+)": "<rootDir>/src/js/$1"
  }
}
