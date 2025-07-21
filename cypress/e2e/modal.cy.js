describe('Modal', () => {
  it('should open modal with artwork details', () => {
    cy.visit('/');
    cy.get('[data-testid="artwork-title"]').first().click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"]').contains('Test');
  });
});
