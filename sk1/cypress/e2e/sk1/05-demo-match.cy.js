/* Paced, human-watchable full match. Run this spec to produce the demo video
   (cypress/videos/sk1/05-demo-match.cy.js.mp4). */

describe('Garden of Terror: demo match (recorded)', () => {
  it('plays a full best-of-3 match from menu to YOU WIN', () => {
    cy.openGame();
    cy.t('aiOff', true);
    cy.wait(1200);
    cy.get('#go').click();
    cy.get('#banner').should('contain', 'ROUND 1');
    cy.wait(2200);

    for (let round = 1; round <= 2; round++) {
      cy.get('#banner').should('contain', 'FIGHT!');
      cy.t('setDistance', 6);
      cy.keyDown('KeyD'); cy.wait(700); cy.keyUp('KeyD');        // walk in
      cy.tap('KeyJ'); cy.wait(500);
      cy.tap('KeyK'); cy.wait(800);
      cy.keyDown('KeyL'); cy.wait(500); cy.keyUp('KeyL');        // block
      cy.t('hit', 'P', 15); cy.wait(500);                        // take a hit
      cy.t('setHp', null, 5); cy.wait(300);
      cy.tap('KeyJ');                                            // finishing blow
      cy.get('#banner').should('contain', 'K.O.');
      cy.wait(1800);
      cy.get('#p1').should('have.text', round === 1 ? '●○' : '●●');
      if (round === 1) cy.nextRound();
    }
    cy.t('skipRoundEnd');
    cy.get('#menu').should('be.visible');
    cy.get('#mtxt').should('contain', 'YOU WIN');
    cy.wait(2500);
  });
});
