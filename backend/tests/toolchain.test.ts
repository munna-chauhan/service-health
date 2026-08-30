describe('toolchain sentinel', () => {
  it('runs on Node 20', () => {
    expect(process.version.startsWith('v20')).toBe(true);
  });
});
