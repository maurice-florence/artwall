describe('Homepage', () => {
  it('should load and show artwork titles', () => {
    cy.visit('/');
    cy.contains('Welcome at the Artwall');
    cy.get('[data-testid="artwork-title"]').should('exist');
  });
});
