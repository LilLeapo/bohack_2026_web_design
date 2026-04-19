import { useEffect } from 'react';

const COUNT = 90;

export function useParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    let w = 0;
    let h = 0;
    let dpr = 1;
    let rafId = 0;
    let cmx = -9999;
    let cmy = -9999;
    const parts = [];

    const measure = () => {
      const parent = canvas.parentElement;
      const r = parent
        ? parent.getBoundingClientRect()
        : { width: window.innerWidth, height: window.innerHeight };
      w = Math.max(r.width, canvas.clientWidth, window.innerWidth * 0.5);
      h = Math.max(r.height, canvas.clientHeight, window.innerHeight * 0.5);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      measure();
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const dx = p.x - cmx;
        const dy = p.y - cmy;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22500) {
          const d = Math.sqrt(d2) || 1;
          const f = (150 - d) / 150;
          p.vx += (dx / d) * f * 0.4;
          p.vy += (dy / d) * f * 0.4;
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += w;
        if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        if (p.y > h) p.y -= h;

        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const ddx = p.x - q.x;
          const ddy = p.y - q.y;
          const dd = ddx * ddx + ddy * ddy;
          if (dd < 14000) {
            const a = (1 - dd / 14000) * 0.35;
            ctx.strokeStyle = `rgba(220, 255, 180, ${a * 0.5})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      for (const p of parts) {
        ctx.beginPath();
        ctx.fillStyle =
          p.hue === 'lime' ? 'rgba(206, 255, 120, 0.95)' : 'rgba(240, 240, 230, 0.75)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(step);
    };

    const spawn = () => {
      resize();
      if (w < 10 || h < 10) {
        rafId = requestAnimationFrame(spawn);
        return;
      }
      parts.length = 0;
      for (let i = 0; i < COUNT; i++) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.6 + 0.6,
          hue: Math.random() < 0.2 ? 'lime' : 'bone',
        });
      }
      step();
    };

    const onCanvasMove = (e) => {
      const r = canvas.getBoundingClientRect();
      cmx = e.clientX - r.left;
      cmy = e.clientY - r.top;
    };
    const onCanvasLeave = () => {
      cmx = -9999;
      cmy = -9999;
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onCanvasMove);
    canvas.addEventListener('mouseleave', onCanvasLeave);
    spawn();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onCanvasMove);
      canvas.removeEventListener('mouseleave', onCanvasLeave);
    };
  }, [canvasRef]);
}
