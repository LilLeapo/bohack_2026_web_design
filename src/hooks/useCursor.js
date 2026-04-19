import { useEffect } from 'react';

const HOVER_SELECTOR = 'a, button, .magnet, .track, .prize, .sponsor, .faq-q';

export function useCursor() {
  useEffect(() => {
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    const spot = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    spot.className = 'spotlight';
    document.body.append(dot, ring, spot);

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let rafId = 0;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
      spot.style.setProperty('--mx', `${mx}px`);
      spot.style.setProperty('--my', `${my}px`);
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
      rafId = requestAnimationFrame(tick);
    };

    const onOver = (e) => {
      if (e.target.closest?.(HOVER_SELECTOR)) ring.classList.add('hover');
    };
    const onOut = (e) => {
      if (e.target.closest?.(HOVER_SELECTOR)) ring.classList.remove('hover');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      dot.remove();
      ring.remove();
      spot.remove();
    };
  }, []);
}
