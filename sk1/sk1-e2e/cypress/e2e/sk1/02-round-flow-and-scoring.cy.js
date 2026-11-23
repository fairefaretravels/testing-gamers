/* Match flow: intro, timer, KO, draw, win and loss logic, score pips, HUD bars. */

describe('Garden of Terror: round flow and scoring', () => {
  beforeEach(() => { cy.openGame(); cy.t('aiOff', true); });

  it('runs ROUND 1 -> FIGHT! and counts the timer down', () => {
    cy.get('#go').click();
    cy.get('#banner').should('contain', 'ROUND 1');
    cy.t('skipIntro');
    cy.get('#banner').should('contain', 'FIGHT!');
    cy.get('#timer').invoke('text').then((a) => {
      cy.wait(1500);
      cy.get('#timer').invoke('text').should((b) => expect(+b).to.be.lessThan(+a));
    });
  });

  it('damage updates health bars', () => {
    cy.startFight();
    cy.t('hit', 'E', 30);
    cy.until((s) => expect(s.hp[1]).to.eq(70));
    cy.get('#h2').should('have.attr', 'style').and('match', /width:\s*70%/);
    cy.get('#h1').should('have.attr', 'style').and('match', /width:\s*100%/);
  });

  it('block cuts damage dramatically', () => {
    cy.startFight();
    cy.keyDown('KeyL');
    cy.wait(150);
    cy.t('hit', 'P', 20);
    cy.until((s) => expect(s.hp[0]).to.be.greaterThan(95)); // blocked: 12% of 20
    cy.keyUp('KeyL');
    cy.wait(200);
    cy.t('hit', 'P', 20);
    cy.until((s) => expect(s.hp[0]).to.be.lessThan(85)); // unblocked: full damage
  });

  it('a KO awards the round and updates the score pips', () => {
    cy.startFight();
    cy.koEnemy();
    cy.get('#banner').should('contain', 'K.O.');
    cy.until((s) => expect(s.wins).to.deep.equal([1, 0]));
    cy.get('#p1').should('have.text', '●○');
    cy.get('#p2').should('have.text', '○○');
  });

  it('winning two rounds shows YOU WIN and the rematch menu', () => {
    cy.startFight();
    cy.koEnemy();
    cy.nextRound();
    cy.until((s) => expect(s.round).to.eq(2));
    cy.koEnemy();
    cy.t('skipRoundEnd');
    cy.get('#menu').should('be.visible');
    cy.get('#mtxt').should('contain', 'YOU WIN');
    cy.get('#go').should('contain', 'REMATCH');
    cy.get('#nx').should('be.visible');
    cy.window().then((w) => expect(w.localStorage.getItem('sk_unlock')).to.eq('2'));
  });

  it('losing two rounds shows YOU LOSE and no NEXT FIGHTER', () => {
    cy.startFight();
    cy.koPlayer();
    cy.nextRound();
    cy.koPlayer();
    cy.t('skipRoundEnd');
    cy.get('#menu').should('be.visible');
    cy.get('#mtxt').should('contain', 'YOU LOSE');
    cy.get('#nx').should('not.be.visible');
  });

  it('timeout with more health wins the round (TIME!)', () => {
    cy.startFight();
    cy.t('setHp', 80, 40);
    cy.t('setTimer', 0.2);
    cy.get('#banner').should('contain', 'TIME!');
    cy.until((s) => expect(s.wins).to.deep.equal([1, 0]));
  });

  it('timeout with equal health is a DRAW and the round is replayed', () => {
    cy.startFight();
    cy.t('setHp', 50, 50);
    cy.t('setTimer', 0.2);
    cy.get('#banner').should('contain', 'DRAW');
    cy.until((s) => expect(s.wins).to.deep.equal([0, 0]));
    cy.t('skipRoundEnd');
    cy.until((s) => expect(s.st).to.eq('intro'));
    cy.until((s) => expect(s.round).to.eq(1));
  });

  it('REMATCH resets scores and health', () => {
    cy.startFight();
    cy.koEnemy(); cy.nextRound();
    cy.koEnemy(); cy.t('skipRoundEnd');
    cy.get('#menu').should('be.visible');
    cy.get('#go').click();
    cy.until((s) => {
      expect(s.wins).to.deep.equal([0, 0]);
      expect(s.round).to.eq(1);
      expect(s.hp).to.deep.equal([100, 100]);
    });
  });

  it('NEXT FIGHTER cycles the opponent (Klondor -> Root)', () => {
    cy.startFight();
    cy.koEnemy(); cy.nextRound();
    cy.koEnemy(); cy.t('skipRoundEnd');
    cy.get('#nx').should('be.visible').click();
    cy.until((s) => {
      expect(s.opp).to.eq(1);
      expect(s.chars[1]).to.eq('Root');
    });
  });
});
