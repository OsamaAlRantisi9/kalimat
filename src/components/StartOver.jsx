import { useState } from 'react';
import { resetProgress } from '../data/wordsApi.js';

// Lets a learner wipe their progress and study every word from box 1 again.
export default function StartOver({ uid, onDone }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function startOver() {
    if (!window.confirm('Start over? Your progress will be deleted, and every word will be new again.')) {
      return;
    }
    setBusy(true);
    setFailed(false);
    try {
      await resetProgress(uid);
      onDone();
    } catch (err) {
      console.error(err);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="btn btn--ghost" onClick={startOver} disabled={busy}>
        {busy ? 'Starting over…' : 'Start over'}
      </button>
      {failed && (
        <p className="warning" role="alert">
          Your progress could not be reset. Check your connection and try again.
        </p>
      )}
    </>
  );
}
