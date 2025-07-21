describe('Footer', () => {
  it('should display last updated info', () => {
    cy.visit('/');
    cy.get('footer').should('be.visible');
    cy.get('footer').contains(/laatst bijgewerkt|last updated/i);
  });
});
