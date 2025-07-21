describe('Sidebar', () => {
  it('should open and show artwork list', () => {
    cy.visit('/');
    cy.get('aside').should('be.visible');
    cy.get('[data-testid="artwork-title"]').should('exist');
  });
});
