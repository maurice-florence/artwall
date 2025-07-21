import { debounce } from './performance';

describe('debounce', () => {
  it('should delay execution', (done) => {
    let called = false;
    const fn = debounce(() => {
      called = true;
      expect(called).toBe(true);
      done();
    }, 50);
    fn();
  });
});
