import { debounce } from './performance';

describe('debounce', () => {
  it('should delay execution', async () => {
    let called = false;
    await new Promise((resolve) => {
      const fn = debounce(() => {
        called = true;
        expect(called).toBe(true);
        resolve(null);
      }, 50);
      fn();
    });
  });
});
