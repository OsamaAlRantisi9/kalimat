import { useTheme } from '../hooks/useTheme.js';

// The button names the mode it switches to.
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const toDark = theme === 'light';

  return (
    <button type="button" className="btn btn--ghost theme-toggle" onClick={toggleTheme}>
      {toDark ? <MoonIcon /> : <SunIcon />}
      {toDark ? 'Dark mode' : 'Light mode'}
    </button>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
