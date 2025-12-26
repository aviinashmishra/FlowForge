/**
 * Basic setup test to verify testing infrastructure
 */
describe('FlowForge Setup', () => {
  it('should have a working test environment', () => {
    expect(true).toBe(true);
  });

  it('should support TypeScript', () => {
    const message: string = 'FlowForge is ready!';
    expect(message).toBe('FlowForge is ready!');
  });
});