describe('Homepage', () => {
  it('should load and show artwork titles', () => {
    cy.visit('/');
    cy.contains('Welkom bij Kunstmuur');
    cy.get('[data-testid="artwork-title"]').should('exist');
  });
});
