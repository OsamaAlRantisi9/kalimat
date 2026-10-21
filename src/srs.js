// Spaced repetition with the Leitner system: every word sits in a box from 1 to 5.
// Knowing a word moves it up one box, so it comes back less often.
// Missing it sends it back to box 1, so it comes back in the same session.

const DAY = 24 * 60 * 60 * 1000;

export const MAX_BOX = 5;

// How long to wait before showing a word again, by box.
export const INTERVALS = {
  1: 0,
  2: 1 * DAY,
  3: 3 * DAY,
  4: 7 * DAY,
  5: 14 * DAY,
};

export function nextReview(progress, knewIt, now = Date.now()) {
  const currentBox = progress?.box ?? 1; // a word with no progress yet starts in box 1
  const box = knewIt ? Math.min(currentBox + 1, MAX_BOX) : 1; // got it: up one box; missed: box 1
  return { box, due: now + INTERVALS[box] };
}

// Today's queue: reviews whose time has come (the most overdue first),
// then a limited number of new words so a session never gets too long.
export function buildQueue(words, progressById, now = Date.now(), newLimit = 10) {
  const due = [];
  const fresh = [];

  for (const word of words) {
    const progress = progressById[word.id];
    if (!progress) fresh.push(word);
    else if (progress.due <= now) due.push(word);
  }

  due.sort((a, b) => progressById[a.id].due - progressById[b.id].due);
  return [...due, ...fresh.slice(0, newLimit)];
}
