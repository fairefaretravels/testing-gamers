/* Keyboard + touch controls and combat. */

describe('Garden of Terror: keyboard controls', () => {
  beforeEach(() => { cy.openGame(); cy.t('aiOff', true); cy.startFight(); cy.t('setDistance', 2); });

  it('J punches for damage', () => {
    cy.tap('KeyJ');
    cy.until((s) => expect(s.hp[1]).to.be.lessThan(100));
  });

  it('K kicks for more damage than a punch', () => {
    cy.tap('KeyJ');
    cy.until((s) => expect(s.hp[1]).to.be.lessThan(100));
    cy.gs().then((afterPunch) => {
      const punchDmg = 100 - afterPunch.hp[1];
      cy.wait(900); // let the move and stun finish
      cy.t('setHp', 100, 100);
      cy.t('setDistance', 2);
      cy.tap('KeyK');
      cy.until((s) => expect(100 - s.hp[1]).to.be.greaterThan(punchDmg));
    });
  });

  it('D / A move the fighter (distance changes)', () => {
    cy.t('setDistance', 8);
    cy.gs().then((s0) => {
      cy.keyDown('KeyD'); cy.wait(500); cy.keyUp('KeyD');
      cy.until((s) => expect(s.dist).to.be.lessThan(s0.dist));
    });
  });

  it('L blocks (fighter enters block state)', () => {
    cy.keyDown('KeyL');
    cy.until((s) => expect(s.fighterSt[0]).to.eq('block'));
    cy.keyUp('KeyL');
    cy.until((s) => expect(s.fighterSt[0]).to.not.eq('block'));
  });

  it('Q swaps the special and shows its name', () => {
    cy.t('unlock', 3);
    cy.tap('KeyQ', 50);
    cy.get('#pop').should('not.be.empty');
    cy.get('#spn').should('contain', 'SP:');
  });

  it('Space fires a special only with a full meter', () => {
    cy.t('setMeter', 0);
    cy.tap('Space');
    cy.until((s) => expect(s.meter).to.eq(0));
    cy.wait(600);
    cy.t('setMeter', 100);
    cy.tap('Space');
    cy.until((s) => expect(s.meter).to.be.lessThan(100));
  });
});

describe('Garden of Terror: touch controls (phone viewport)', () => {
  beforeEach(() => {
    cy.viewport(390, 844);
    cy.openGame(); cy.t('aiOff', true); cy.startFight(); cy.t('setDistance', 2);
  });

  it('shows the on-screen controls', () => {
    cy.get('#ctrl').should('be.visible');
    ['#pad', '#bP', '#bK', '#bB', '#bS', '#bW'].forEach((id) => cy.get(id).should('be.visible'));
  });

  it('PUNCH and KICK buttons deal damage', () => {
    cy.get('#bP').trigger('pointerdown', { force: true }); cy.wait(80); cy.get('#bP').trigger('pointerup', { force: true });
    cy.until((s) => expect(s.hp[1]).to.be.lessThan(100));
    cy.wait(900); cy.t('setHp', 100, 100); cy.t('setDistance', 2);
    cy.get('#bK').trigger('pointerdown', { force: true }); cy.wait(80); cy.get('#bK').trigger('pointerup', { force: true });
    cy.until((s) => expect(s.hp[1]).to.be.lessThan(100));
  });

  it('BLOCK button holds a block', () => {
    cy.get('#bB').trigger('pointerdown', { force: true });
    cy.until((s) => expect(s.fighterSt[0]).to.eq('block'));
    cy.get('#bB').trigger('pointerup', { force: true });
    cy.until((s) => expect(s.fighterSt[0]).to.not.eq('block'));
  });
});
