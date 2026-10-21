# Kalimat · كلمات

Arabic vocabulary flashcards for learners of spoken Levantine Arabic (Ammiyeh) and Modern Standard Arabic (FusHa).

Built with **React**, **Vite**, **SASS** and **Firebase** (Authentication, Cloud Firestore, Hosting).

**Live:** https://kalimat-ddd34.web.app

## Features

- Flip cards: the Arabic word (with tashkeel) on the front, transliteration and English meaning on the back.
- Spaced repetition with Leitner boxes 1–5. A missed word comes back in the same session; a known word comes back after 1, 3, 7 and then 14 days.
- Pronunciation is **switched off on purpose**. Browser voices read Arabic with the wrong vowels, which is worse than no audio for a learner. The code is kept behind a feature flag (`VITE_PRONUNCIATION=on`); the real fix is recordings by teachers saved with each word.
- Keyboard support: Space flips the card, 1 = again, 2 = got it.
- Anonymous sign-in, so each learner's progress is saved without a sign-up form.
- Start over: when the day's cards are done, a learner can delete their progress in one batch and study every word again.
- An admin panel to add words or import a starter set, protected by Firestore security rules.
- Mobile first, with reduced-motion support.
- Light and dark mode: follows the device until the learner picks one with the toggle, then remembers the pick (`src/hooks/useTheme.js`).

## How it works

```
Browser (React app)
  ├─ Firebase Auth ........ signs every visitor in anonymously → uid
  ├─ Cloud Firestore ...... words, per-user progress, admin list
  │     └─ firestore.rules  decides who may read or write each document
  └─ Firebase Hosting ..... serves the built files from dist/
```

When a learner answers a card, `nextReview()` in `src/srs.js` computes the new box and due date. The screen updates at once, and the result is saved to `users/{uid}/progress/{wordId}` in the background.

## Data model

| Path | What it holds | Who can read | Who can write |
|---|---|---|---|
| `words/{wordId}` | `ar`, `translit`, `en`, `dialect`, `createdAt` | everyone | admins only, validated |
| `users/{uid}/progress/{wordId}` | `box` (1–5), `due` (ms), `updatedAt` | that user | that user, validated |
| `admins/{uid}` | empty marker document | that user | nobody from the app (console only) |

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase web app config
npm run dev                  # http://localhost:5180
```

In the Firebase console: enable **Anonymous** sign-in and create a **Firestore** database. To become an admin, open the app, copy your Learner ID from the footer, and create an empty document `admins/<your id>` in the console.

## Tests

```bash
npm test
```

The spaced-repetition logic in `src/srs.js` is covered by unit tests in `src/srs.test.js` (Vitest).

## Deploy

```bash
npm run build
npx firebase-tools deploy --only firestore:rules,hosting
```

## Next steps

- Sign in with Google so progress follows the learner across devices.
- Teacher-recorded audio in Cloud Storage instead of the browser voice.
- Example sentences and a FusHa / Ammiyeh filter.
