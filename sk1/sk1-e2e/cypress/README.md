# Garden of Terror (sk1) end-to-end tests

    npm install
    npm run cy:open     # interactive
    npm run cy:run      # headless; videos land in cypress/videos/

The game exposes a test hook (`window.__test`) only when opened with `?test`
(e.g. `/sk1/index.html?test`). It can force KOs, timer, distance and read state;
it does nothing in normal play.

`05-demo-match.cy.js` is the paced full-match spec; its video is the demo.
Run just that: `npx cypress run --spec cypress/e2e/sk1/05-demo-match.cy.js`
