import { useState } from 'react';
import { addWord, importStarterWords } from '../data/wordsApi.js';
import { starterWords } from '../data/starterWords.js';

const EMPTY_FORM = { ar: '', translit: '', en: '', dialect: 'ammiyeh' };

// Only admins see this panel. The real protection is in firestore.rules:
// hiding a button is for convenience, the rules are what stop other users.
export default function AdminPanel({ onWordsChanged }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function run(action, successMessage) {
    setBusy(true);
    setMessage('');
    try {
      await action();
      setMessage(successMessage);
      onWordsChanged();
    } catch (err) {
      console.error(err);
      setMessage('Could not save. Only admins can change the word list.');
    } finally {
      setBusy(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    const word = {
      ar: form.ar.trim(),
      translit: form.translit.trim(),
      en: form.en.trim(),
      dialect: form.dialect,
    };
    if (!word.ar || !word.en) {
      setMessage('The Arabic word and its meaning are required.');
      return;
    }
    run(async () => {
      await addWord(word);
      setForm(EMPTY_FORM);
    }, `Added “${word.en}”.`);
  }

  return (
    <section className="admin" aria-labelledby="admin-title">
      <h2 id="admin-title">Admin: add words</h2>

      <form className="admin__form" onSubmit={submit}>
        <label>
          Arabic
          <input name="ar" value={form.ar} onChange={update} lang="ar" dir="rtl" maxLength={60} required />
        </label>
        <label>
          Transliteration
          <input name="translit" value={form.translit} onChange={update} maxLength={60} />
        </label>
        <label>
          Meaning (English)
          <input name="en" value={form.en} onChange={update} maxLength={80} required />
        </label>
        <label>
          Type
          <select name="dialect" value={form.dialect} onChange={update}>
            <option value="ammiyeh">Ammiyeh (spoken Levantine)</option>
            <option value="fusha">FusHa (Modern Standard)</option>
          </select>
        </label>
        <button type="submit" className="btn btn--good" disabled={busy}>
          Add word
        </button>
      </form>

      <button
        type="button"
        className="btn btn--ghost"
        disabled={busy}
        onClick={() => run(() => importStarterWords(starterWords), `Imported ${starterWords.length} starter words.`)}
      >
        Import {starterWords.length} starter words
      </button>

      {message && (
        <p className="admin__message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
