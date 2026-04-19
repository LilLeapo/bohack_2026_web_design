import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    let onScroll = null;
    let io = null;
    let raf = 0;

    const run = () => {
      const els = Array.from(document.querySelectorAll('.reveal'));
      if (!els.length) {
        raf = requestAnimationFrame(run);
        return;
      }

      els.forEach((el) => {
        if (el.dataset.stagger) {
          const kids = el.children;
          for (let i = 0; i < kids.length; i++) {
            kids[i].style.transitionDelay = `${i * 70}ms`;
          }
        }
      });

      const vh = window.innerHeight;
      const check = (el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          el.classList.add('in');
          return true;
        }
        return false;
      };

      els.forEach(check);

      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io.unobserve(e.target);
            }
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      els.forEach((el) => {
        if (!el.classList.contains('in')) io.observe(el);
      });

      onScroll = () => {
        els.forEach((el) => {
          if (!el.classList.contains('in')) check(el);
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    };

    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(run);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (onScroll) window.removeEventListener('scroll', onScroll);
      if (io) io.disconnect();
    };
  }, []);
}
