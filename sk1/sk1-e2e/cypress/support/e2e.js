/* Shared helpers for Garden of Terror (sk1). The game exposes window.__test only when opened with ?test. */

// The live radio stream and any third-party noise must never fail a game test.
Cypress.on('uncaught:exception', (err) => {
  if (/play\(\)|NotAllowedError|AbortError|The operation was aborted/i.test(err.message)) return false;
});

Cypress.Commands.add('openGame', () => {
  cy.visit('/sk1/index.html?test', {
    onBeforeLoad(win) {
      // collect console errors so specs can assert on them
      win.__consoleErrors = [];
      const orig = win.console.error;
      win.console.error = (...a) => { win.__consoleErrors.push(a.join(' ')); orig.apply(win.console, a); };
    },
  });
  cy.window().its('__test').should('exist');
  // wait until every preloaded sprite sheet has either loaded or failed
  cy.window().should((w) => {
    const s = w.__test.state();
    expect(s.sheetsReady + s.sheetsFailed.length, 'sheets settled').to.equal(s.sheetsTotal);
  });
});

Cypress.Commands.add('gs', () => cy.window().then((w) => w.__test.state()));
Cypress.Commands.add('t', (fn, ...args) => cy.window().then((w) => w.__test[fn](...args)));
// Retrying assertion against live game state: cy.until((s) => expect(s.hp[1]).to.be.lessThan(100))
Cypress.Commands.add('until', (fn) => cy.window().should((w) => fn(w.__test.state())));
// End the "round over" pause and the intro, landing in the next fight (game steps on animation frames).
Cypress.Commands.add('nextRound', () => {
  cy.t('skipRoundEnd');
  cy.until((s) => expect(s.st).to.eq('intro'));
  cy.t('skipIntro');
  cy.until((s) => expect(s.st).to.eq('fight'));
});

Cypress.Commands.add('startFight', () => {
  cy.get('#go').click();
  cy.get('#menu').should('not.be.visible');
  cy.until((s) => expect(s.st).to.eq('intro'));
  cy.t('skipIntro');
  cy.until((s) => expect(s.st).to.eq('fight'));
});

// Keyboard events go to window, which is where the game listens.
Cypress.Commands.add('keyDown', (code) =>
  cy.window().then((w) => w.dispatchEvent(new w.KeyboardEvent('keydown', { code, bubbles: true }))));
Cypress.Commands.add('keyUp', (code) =>
  cy.window().then((w) => w.dispatchEvent(new w.KeyboardEvent('keyup', { code, bubbles: true }))));
Cypress.Commands.add('tap', (code, ms = 80) => {
  cy.keyDown(code);
  cy.wait(ms);
  cy.keyUp(code);
});

// Knock out the enemy through the real hurt()/endRound() path.
Cypress.Commands.add('koEnemy', () => cy.t('hit', 'E', 100));
Cypress.Commands.add('koPlayer', () => cy.t('hit', 'P', 100));
