import { useEffect } from 'react';

export function useMagnet() {
  useEffect(() => {
    const id = window.setTimeout(() => {
      const els = document.querySelectorAll('.magnet');
      els.forEach((el) => {
        if (el.__mag) return;
        el.__mag = true;
        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - (r.left + r.width / 2);
          const y = e.clientY - (r.top + r.height / 2);
          el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
        };
        const onLeave = () => {
          el.style.transform = '';
        };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        el.__magCleanup = () => {
          el.removeEventListener('mousemove', onMove);
          el.removeEventListener('mouseleave', onLeave);
        };
      });
    }, 200);

    return () => {
      window.clearTimeout(id);
      document.querySelectorAll('.magnet').forEach((el) => {
        if (el.__magCleanup) el.__magCleanup();
        el.__mag = false;
        el.__magCleanup = null;
      });
    };
  }, []);
}
