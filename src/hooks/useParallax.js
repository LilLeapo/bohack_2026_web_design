import { useEffect } from 'react';

export function useParallax() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll('[data-parallax]'));
    if (!items.length) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    // Disable parallax on narrow viewports — differing translate speeds
    // between stacked hero elements can cause visual overlap on phones.
    const narrowMq = window.matchMedia('(max-width: 768px)');

    let rafId = 0;
    let pending = false;

    const clearTransforms = () => {
      for (const el of items) el.style.transform = '';
    };

    const apply = () => {
      pending = false;
      if (narrowMq.matches) {
        clearTransforms();
        return;
      }
      const vh = window.innerHeight;
      for (const el of items) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;

        const center = r.top + r.height / 2;
        const off = (center - vh / 2) / vh;
        const speed = parseFloat(el.dataset.parallax || '0.2');
        const y = -off * speed * 200;
        const rot = el.dataset.parallaxRot
          ? off * parseFloat(el.dataset.parallaxRot)
          : 0;
        const scale = el.dataset.parallaxScale
          ? 1 + off * parseFloat(el.dataset.parallaxScale)
          : 1;

        el.style.transform =
          `translate3d(0, ${y.toFixed(2)}px, 0) ` +
          `rotate(${rot.toFixed(2)}deg) ` +
          `scale(${scale.toFixed(3)})`;
      }
    };

    const onNarrowChange = () => {
      if (narrowMq.matches) clearTransforms();
      else apply();
    };
    if (narrowMq.addEventListener) narrowMq.addEventListener('change', onNarrowChange);
    else narrowMq.addListener(onNarrowChange);

    const onScroll = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(apply);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    apply();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (narrowMq.removeEventListener) narrowMq.removeEventListener('change', onNarrowChange);
      else narrowMq.removeListener(onNarrowChange);
    };
  }, []);
}
