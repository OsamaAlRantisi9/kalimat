import { useEffect, useState } from 'react';
import { useArabicVoice } from '../hooks/useArabicVoice.js';

const DIALECT_LABEL = { fusha: 'FusHa', ammiyeh: 'Ammiyeh' };

export default function Flashcard({ word, onAnswer }) {
  const [flipped, setFlipped] = useState(false);
  const voice = useArabicVoice();

  // Keyboard: Space flips, 1 = again, 2 = got it.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.target.closest('input, textarea, select')) return; // typing in a form
      if (event.key === ' ' && !event.target.closest('button')) {
        event.preventDefault(); // stop the page from scrolling
        setFlipped((f) => !f);
      } else if (flipped && event.key === '1') {
        onAnswer(false);
      } else if (flipped && event.key === '2') {
        onAnswer(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [flipped, onAnswer]);

  function speak() {
    const utterance = new SpeechSynthesisUtterance(word.ar);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="flashcard-area">
      <button
        type="button"
        className={`flashcard${flipped ? ' is-flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
      >
        <span className="flashcard__inner">
          <span className="flashcard__face flashcard__face--front" aria-hidden={flipped}>
            <span className={`badge badge--${word.dialect}`}>{DIALECT_LABEL[word.dialect]}</span>
            <span className="flashcard__arabic" lang="ar" dir="rtl">
              {word.ar}
            </span>
            <span className="flashcard__hint">Tap or press Space to see the meaning</span>
          </span>
          <span className="flashcard__face flashcard__face--back" aria-hidden={!flipped}>
            <span className="flashcard__translit">{word.translit}</span>
            <span className="flashcard__meaning">{word.en}</span>
          </span>
        </span>
      </button>

      <div className="flashcard-actions">
        {/* Off by default: browser voices get Arabic vowels wrong, which harms learners. */}
        {import.meta.env.VITE_PRONUNCIATION === 'on' && voice && (
          <button type="button" className="btn btn--ghost" onClick={speak}>
            Listen
          </button>
        )}
        <button type="button" className="btn btn--again" disabled={!flipped} onClick={() => onAnswer(false)}>
          Again <kbd>1</kbd>
        </button>
        <button type="button" className="btn btn--good" disabled={!flipped} onClick={() => onAnswer(true)}>
          Got it <kbd>2</kbd>
        </button>
      </div>
    </div>
  );
}
