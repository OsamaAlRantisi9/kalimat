import { useCallback, useEffect, useState } from 'react';
import { isConfigured } from './firebase.js';
import { useAnonymousUser } from './hooks/useAnonymousUser.js';
import { fetchProgress, fetchWords, isAdmin, saveProgress } from './data/wordsApi.js';
import { buildQueue, nextReview } from './srs.js';
import Flashcard from './components/Flashcard.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import StartOver from './components/StartOver.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <ThemeToggle />
        <h1>
          Kalimat <span className="brand-ar" lang="ar">كلمات</span>
        </h1>
        <p className="tagline">Arabic words, one card at a time.</p>
      </header>
      {isConfigured ? <Study /> : <SetupNotice />}
    </div>
  );
}

function Study() {
  const { user, error: authError } = useAnonymousUser();
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [words, setWords] = useState([]);
  const [progress, setProgress] = useState({});
  const [queue, setQueue] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);

  const load = useCallback(async (uid) => { // same function every render, so the effect below does not loop
    setStatus((current) => (current === 'ready' ? current : 'loading')); // only the first load shows Loading
    try {
      const [allWords, myProgress, adminFlag] = await Promise.all([ // three reads in parallel
        fetchWords(),
        fetchProgress(uid),
        isAdmin(uid),
      ]);
      setWords(allWords);
      setProgress(myProgress);
      setAdmin(adminFlag);
      setQueue(buildQueue(allWords, myProgress));
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (user) load(user.uid);
  }, [user, load]);

  function answer(knewIt) {
    const word = queue[0];
    const next = nextReview(progress[word.id], knewIt);

    // Update the screen first, then save in the background (optimistic update).
    setProgress((current) => ({ ...current, [word.id]: next }));
    setQueue((current) => (next.box === 1 ? [...current.slice(1), word] : current.slice(1)));
    setReviewed((n) => n + 1);
    saveProgress(user.uid, word.id, next).catch((err) => {
      console.error(err);
      setSaveFailed(true);
    });
  }

  if (authError || status === 'error') {
    return (
      <div className="panel" role="alert">
        <p>Something went wrong while loading your words.</p>
        <button type="button" className="btn btn--good" onClick={() => user && load(user.uid)}>
          Try again
        </button>
      </div>
    );
  }

  if (!user || status === 'loading') {
    return <p className="panel" aria-live="polite">Loading your words…</p>;
  }

  const current = queue[0];

  return (
    <main className="study">
      <p className="stats">
        Reviewed <strong>{reviewed}</strong> · Left today <strong>{queue.length}</strong>
      </p>

      {saveFailed && (
        <p className="warning" role="alert">
          Your last answers could not be saved. Check your connection.
        </p>
      )}

      {current ? (
        // A new key mounts a fresh Flashcard, so every card starts unflipped.
        <Flashcard key={`${current.id}-${reviewed}`} word={current} onAnswer={answer} />
      ) : (
        <div className="panel">
          {words.length === 0 ? (
            <p>No words yet.{admin && ' Import the starter words below.'}</p>
          ) : (
            <>
              <p>All done for today. Come back tomorrow for your next reviews.</p>
              <StartOver
                uid={user.uid}
                onDone={() => {
                  setReviewed(0);
                  load(user.uid);
                }}
              />
            </>
          )}
        </div>
      )}

      {admin && <AdminPanel onWordsChanged={() => load(user.uid)} />}

      <footer className="learner-id">
        Learner ID: <code>{user.uid}</code>
      </footer>
    </main>
  );
}

function SetupNotice() {
  return (
    <div className="panel">
      <p>
        Firebase is not configured yet. Copy <code>.env.example</code> to <code>.env.local</code>,
        fill in your web app config, and restart <code>npm run dev</code>.
      </p>
    </div>
  );
}
