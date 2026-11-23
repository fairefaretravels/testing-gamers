/* Regression guard for the tiny / off-screen fighters bug, on phone + desktop viewports. */

const VIEWPORTS = [
  { name: 'phone portrait',  w: 390,  h: 844, minH: 0.15 },
  { name: 'phone landscape', w: 844,  h: 390, minH: 0.40 },
  { name: 'tablet',          w: 820,  h: 1180, minH: 0.18 },
  { name: 'desktop',         w: 1440, h: 900, minH: 0.40 },
];

function assertFramed(minH) {
  cy.window().then((w) => {
    const [a, b] = w.__test.bounds();
    [a, b].forEach((f, i) => {
      expect(f.h, `fighter ${i} height (fraction of screen)`).to.be.greaterThan(minH);
      expect(f.cx, `fighter ${i} centre x`).to.be.within(-0.95, 0.95);   // body stays in view
      expect(f.y0, `fighter ${i} feet`).to.be.greaterThan(-1);           // not cut off below
      expect(f.y1, `fighter ${i} head`).to.be.lessThan(1);               // not cut off above
    });
  });
}

describe('Garden of Terror: both fighters visible and framed', () => {
  VIEWPORTS.forEach(({ name, w, h, minH }) => {
    context(`${name} ${w}x${h}`, () => {
      beforeEach(() => {
        cy.viewport(w, h);
        cy.openGame(); cy.t('aiOff', true); cy.startFight();
        cy.wait(1800); // camera eases into place
      });

      it('at the opening distance', () => assertFramed(minH));

      it('when pushed to the far edges of the arena', () => {
        cy.t('setDistance', 11);
        cy.wait(1800);
        assertFramed(minH * 0.6);
      });

      it('when standing close together', () => {
        cy.t('setDistance', 2);
        cy.wait(1800);
        assertFramed(minH);
      });

      it('shows both fighters through every action', () => {
        cy.t('setDistance', 2);
        cy.tap('KeyJ'); cy.window().should((win) => expect(win.__test.shown()).to.deep.equal([true, true]));
        cy.tap('KeyK'); cy.window().should((win) => expect(win.__test.shown()).to.deep.equal([true, true]));
        cy.t('hit', 'E', 20); cy.window().should((win) => expect(win.__test.shown()).to.deep.equal([true, true]));
        cy.koEnemy(); cy.wait(500);
        cy.window().should((win) => expect(win.__test.shown()).to.deep.equal([true, true]));
      });
    });
  });

  it('keeps the HUD and canvas present', () => {
    cy.openGame();
    cy.get('canvas').should('be.visible');
    cy.get('#hud').should('be.visible');
  });
});
