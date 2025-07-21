describe('AdminModal', () => {
  it('should open and show form fields', () => {
    cy.visit('/');
    // Simulate opening the AdminModal (replace selector with actual trigger)
    cy.get('[data-testid="open-adminmodal"]').click();
    cy.get('[data-testid="adminmodal"]').should('be.visible');
    cy.get('[data-testid="form-title"]').should('exist');
  });
});
