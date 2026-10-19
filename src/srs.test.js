import { describe, it, expect } from 'vitest';
import { nextReview, buildQueue, INTERVALS, MAX_BOX } from './srs.js';

const NOW = 1_000_000;

describe('nextReview', () => {
  it('moves a new word to box 2 when the learner knows it', () => {
    expect(nextReview(undefined, true, NOW)).toEqual({ box: 2, due: NOW + INTERVALS[2] });
  });

  it('sends a word back to box 1, due right away, when the learner misses it', () => {
    expect(nextReview({ box: 4, due: 0 }, false, NOW)).toEqual({ box: 1, due: NOW });
  });

  it('never goes past the last box', () => {
    expect(nextReview({ box: MAX_BOX, due: 0 }, true, NOW).box).toBe(MAX_BOX);
  });
});

describe('buildQueue', () => {
  const words = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];

  it('puts due reviews first (most overdue first), skips future ones, then adds new words', () => {
    const progress = {
      a: { box: 2, due: NOW - 10 },
      b: { box: 3, due: NOW + 99 },
      c: { box: 2, due: NOW - 50 },
    };
    expect(buildQueue(words, progress, NOW).map((w) => w.id)).toEqual(['c', 'a', 'd']);
  });

  it('limits how many new words enter one session', () => {
    expect(buildQueue(words, {}, NOW, 2).map((w) => w.id)).toEqual(['a', 'b']);
  });
});
