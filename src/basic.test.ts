// Basic test to ensure Jest is working
describe('Basic tests', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to jsdom environment', () => {
    expect(document).toBeDefined();
    expect(window).toBeDefined();
  });

  it('should have localStorage available', () => {
    expect(localStorage).toBeDefined();
  });
});
