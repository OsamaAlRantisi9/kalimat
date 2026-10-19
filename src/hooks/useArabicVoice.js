import { useEffect, useState } from 'react';

// Finds an Arabic text-to-speech voice in this browser, or null if there is none.
// Browsers load their voice list late, so we pick again on 'voiceschanged'.
export function useArabicVoice() {
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      setVoice(voices.find((v) => v.lang.toLowerCase().startsWith('ar')) ?? null);
    };

    pick();
    window.speechSynthesis.addEventListener('voiceschanged', pick);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pick);
  }, []);

  return voice;
}
