import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './seededRandom';

describe('createSeededRandom', () => {
  it('produces identical sequences for identical seeds', () => {
    const first = createSeededRandom(42);
    const second = createSeededRandom(42);
    const firstSequence = Array.from({ length: 20 }, () => first());
    const secondSequence = Array.from({ length: 20 }, () => second());
    expect(firstSequence).toEqual(secondSequence);
  });

  it('produces different sequences for different seeds', () => {
    const first = createSeededRandom(1);
    const second = createSeededRandom(2);
    const firstSequence = Array.from({ length: 5 }, () => first());
    const secondSequence = Array.from({ length: 5 }, () => second());
    expect(firstSequence).not.toEqual(secondSequence);
  });

  it('stays within [0, 1)', () => {
    const random = createSeededRandom(7);
    for (let index = 0; index < 1000; index += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
