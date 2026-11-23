/* Sprite loading + visibility. Regression tests for the "invisible fighters" bug. */

// Sheets referenced by the code but not committed yet. Remove entries as the art lands.
const KNOWN_MISSING = ['Gontor-punch.png', 'KLONDOR-kick.png'];

describe('Garden of Terror: load and sprites', () => {
  beforeEach(() => cy.openGame());

  it('shows the title menu', () => {
    cy.contains('h1', 'GARDEN OF').should('be.visible');
    cy.get('#go').should('be.visible').and('contain', 'START FIGHT');
  });

  it('loads every sprite sheet except the known-missing ones', () => {
    cy.gs().then((s) => {
      const unexpected = s.sheetsFailed.filter((f) => !KNOWN_MISSING.includes(f));
      expect(unexpected, 'unexpected failed sheets').to.deep.equal([]);
    });
  });

  it('reports failed sheets with a useful console error', () => {
    cy.gs().then((s) => {
      if (!s.sheetsFailed.length) return;
      cy.window().then((w) => {
        const msg = w.__consoleErrors.find((m) => m.includes('[sprites] FAILED'));
        expect(msg, 'diagnostic').to.match(/Tried: .*sprites\//);
      });
    });
  });

  it('never leaves a fighter without a visible sprite, even on a missing sheet', () => {
    cy.startFight();
    cy.t('aiOff', true);
    cy.t('setDistance', 2);
    // Gontor punches: his punch sheet may be missing, the fallback must still be on screen
    cy.tap('KeyJ');
    cy.window().should((w) => expect(w.__test.shown()).to.deep.equal([true, true]));
    cy.tap('KeyK');
    cy.window().should((w) => expect(w.__test.shown()).to.deep.equal([true, true]));
  });
});
