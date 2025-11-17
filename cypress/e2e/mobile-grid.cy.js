describe('Mobile grid layout', () => {
  it('cards do not overlap at portrait width', () => {
    cy.viewport(390, 844); // iPhone-ish portrait
    cy.visit('/');
    // Wait for initial paint
    cy.get('[data-testid^="artwork-card-"]').then(($cards) => {
      const rects = [];
      $cards.each((i, el) => {
        rects.push(el.getBoundingClientRect());
      });
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i];
          const b = rects[j];
          const sameColumn = Math.abs(a.left - b.left) < 2;
          const verticalOverlap = !(a.bottom <= b.top || b.bottom <= a.top);
          if (sameColumn && verticalOverlap) {
            throw new Error(`Overlap detected between cards ${i} and ${j}`);
          }
        }
      }
    });
  });
});
