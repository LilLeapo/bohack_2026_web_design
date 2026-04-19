import { useEffect } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*<>/\\|[]{}=+-0123456789';

export function useScramble(ref, text, { delay = 120, duration = 1400 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !text) return;

    let rafId = 0;
    let timeoutId = 0;

    const start = () => {
      const len = text.length;
      const t0 = performance.now();
      const frame = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        let out = '';
        for (let i = 0; i < len; i++) {
          const revealAt = (i / len) * 0.7;
          if (p > revealAt + 0.3 || text[i] === ' ') out += text[i];
          else out += CHARS[(Math.random() * CHARS.length) | 0];
        }
        el.textContent = out;
        if (p < 1) rafId = requestAnimationFrame(frame);
        else el.textContent = text;
      };
      rafId = requestAnimationFrame(frame);
    };

    timeoutId = window.setTimeout(start, delay);

    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [ref, text, delay, duration]);
}
