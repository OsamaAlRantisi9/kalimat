import { useEffect, useState } from 'react';

// Same key as the small script in index.html, which applies the saved theme before the first paint.
const STORAGE_KEY = 'kalimat-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function readSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null; // storage can be blocked, e.g. in some private windows
  }
}

// Follows the device's theme until the learner picks one with the toggle, then remembers the pick.
export function useTheme() {
  const [choice, setChoice] = useState(readSaved); // 'light' | 'dark' | null (follow the device)
  const [deviceDark, setDeviceDark] = useState(() => window.matchMedia(DARK_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event) => setDeviceDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (choice) document.documentElement.dataset.theme = choice;
  }, [choice]);

  const theme = choice ?? (deviceDark ? 'dark' : 'light');

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setChoice(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembered, but the theme still switches for this visit.
    }
  }

  return { theme, toggleTheme };
}
