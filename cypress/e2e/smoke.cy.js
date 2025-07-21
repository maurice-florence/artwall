describe('Artwall Smoke Test', () => {
  it('should load the homepage', () => {
    cy.visit('/');
    cy.contains('Welkom bij Kunstmuur');
  });
});
