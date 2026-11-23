const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: true,
  videoCompression: 28,
  screenshotOnRunFailure: true,
  e2e: {
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
    // sk1 loads three.js from cdnjs and its own sprites; give slow CI runners room
    pageLoadTimeout: 60000,
  },
});
