module.exports = {
  // testEnvironment: 'node', // 'jsdom'
  expand: true,
  forceExit: true,
  moduleFileExtensions: [
    'js',
    'json',
    'vue'
  ],
  testMatch: [
    // '**/tests/**/components/**/*.spec.js'
    '**/tests/**/views/**/*.spec.js'
  ],
  setupFiles: ['jest-canvas-mock'],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/'
  ],
  transform: {
    '.*\\.(vue)$': 'vue-jest', // '<rootDir>/node_modules/vue-jest',
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^~/(.*)$': '<rootDir>/tests/$1',
    // '^vue$': 'vue/dist/vue.common.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  snapshotSerializers: [
    '<rootDir>/node_modules/jest-serializer-vue'
  ],
  // collectCoverage: true,
  coverageDirectory: '<rootDir>/tests/unit/coverage',
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/index.js',
    '!src/router/index.js',
    '!**/node_modules/**'
  ],
  coverageReporters: [
    'html',
    'text-summary'
  ]
}

