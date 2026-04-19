import { useEffect } from 'react';

export function useParallax() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll('[data-parallax]'));
    if (!items.length) return;

    const intensity = 0.85;

    const onScroll = () => {
      const vh = window.innerHeight;
      for (const el of items) {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const off = (center - vh / 2) / vh;
        const speed = parseFloat(el.dataset.parallax || '0.2');
        const y = -off * speed * 200 * intensity;
        const rot = el.dataset.parallaxRot
          ? off * parseFloat(el.dataset.parallaxRot) * intensity
          : 0;
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
