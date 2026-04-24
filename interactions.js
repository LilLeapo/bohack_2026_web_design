// ─── Bohack interactions: particles, parallax, magnets ─── //
(function () {
  // ——— Magnetic buttons ———
  function initMagnets() {
    document.querySelectorAll('.magnet').forEach(el => {
      if (el.__mag) return; el.__mag = true;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }
  window.__bohackInitMagnets = initMagnets;

  // ——— Particle canvas ———
  window.__bohackInitParticles = function (canvas) {
    const ctx = canvas.getContext('2d');
    // Force CSS sizing to full-parent, bulletproof against intrinsic 300x150
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    let w, h, dpr;
    const parts = [];
    const N = 90;

    function measure() {
      const parent = canvas.parentElement;
      const r = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      w = Math.max(r.width, canvas.clientWidth, window.innerWidth * 0.5);
      h = Math.max(r.height, canvas.clientHeight, window.innerHeight * 0.5);
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      measure();
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    // Wait for layout before spawning so we don't clump at 0,0
    function spawn() {
      resize();
      if (w < 10 || h < 10) { requestAnimationFrame(spawn); return; }
      parts.length = 0;
      for (let i = 0; i < N; i++) {
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
    }
    window.addEventListener('resize', resize);

    let cmx = -9999, cmy = -9999;
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      cmx = e.clientX - r.left; cmy = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', () => { cmx = -9999; cmy = -9999; });

    function step() {
      ctx.clearRect(0, 0, w, h);
      // lines between close particles
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        // mouse repulsion
        const dx = p.x - cmx, dy = p.y - cmy;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22500) {
          const d = Math.sqrt(d2) || 1;
          const f = (150 - d) / 150;
          p.vx += (dx / d) * f * 0.4;
          p.vy += (dy / d) * f * 0.4;
        }
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x += w; if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h; if (p.y > h) p.y -= h;

        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const ddx = p.x - q.x, ddy = p.y - q.y;
          const dd = ddx * ddx + ddy * ddy;
          if (dd < 14000) {
            const a = (1 - dd / 14000) * 0.35;
            ctx.strokeStyle = `rgba(220, 255, 180, ${a * 0.5})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      // draw points
      for (const p of parts) {
        ctx.beginPath();
        ctx.fillStyle = p.hue === 'lime' ? 'rgba(206, 255, 120, 0.95)' : 'rgba(240, 240, 230, 0.75)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(step);
    }
    spawn();
  };

  // ——— Parallax ———
  window.__bohackInitParallax = function () {
    const items = Array.from(document.querySelectorAll('[data-parallax]'));
    function onScroll() {
      const vh = window.innerHeight;
      const intensity = 0.85;
      for (const el of items) {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const off = (center - vh / 2) / vh;
        const speed = parseFloat(el.dataset.parallax || '0.2');
        const y = -off * speed * 200 * intensity;
        const rot = el.dataset.parallaxRot ? off * parseFloat(el.dataset.parallaxRot) * intensity : 0;
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  // ——— Reveal on scroll ———
  window.__bohackInitReveal = function () {
    // Run after React paints
    const run = () => {
      const els = Array.from(document.querySelectorAll('.reveal'));
      if (!els.length) { requestAnimationFrame(run); return; }

      // Prep stagger delays up front
      els.forEach(el => {
        if (el.dataset.stagger) {
          const kids = el.children;
          for (let i = 0; i < kids.length; i++) {
            kids[i].style.transitionDelay = (i * 70) + 'ms';
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

      // Immediately reveal anything already on screen
      els.forEach(check);

      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      els.forEach(el => { if (!el.classList.contains('in')) io.observe(el); });

      // Fallback: scroll listener in case IO misses
      const onScroll = () => {
        els.forEach(el => {
          if (!el.classList.contains('in')) check(el);
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  };

  // Legacy entry (unused, kept to avoid breakage)
  window.__bohackInitReveal_old = function () {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          if (e.target.dataset.stagger) {
            const kids = e.target.children;
            for (let i = 0; i < kids.length; i++) {
              kids[i].style.transitionDelay = (i * 70) + 'ms';
            }
          }
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  };

  // ——— Scramble text ———
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*<>/\\|[]{}=+-0123456789';
  window.__bohackScramble = function (el, finalText, dur = 900) {
    const len = finalText.length;
    const start = performance.now();
    function frame(t) {
      const p = Math.min(1, (t - start) / dur);
      let out = '';
      for (let i = 0; i < len; i++) {
        const revealAt = (i / len) * 0.7;
        if (p > revealAt + 0.3 || finalText[i] === ' ') out += finalText[i];
        else out += CHARS[(Math.random() * CHARS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = finalText;
    }
    requestAnimationFrame(frame);
  };
})();
