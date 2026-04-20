import { useEffect, useRef, useState } from 'react';
import { useParticles } from '../hooks/useParticles.js';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*<>/\\|[]{}=+-0123456789';
const FINAL = 'BOHACK';

function useHeroScramble(ref, { delay = 120, duration = 1400 } = {}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rafId = 0;
    const timeoutId = window.setTimeout(() => {
      const len = FINAL.length;
      const t0 = performance.now();
      const frame = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        let out = '';
        for (let i = 0; i < len; i++) {
          const revealAt = (i / len) * 0.7;
          if (p > revealAt + 0.3 || FINAL[i] === ' ') out += FINAL[i];
          else out += CHARS[(Math.random() * CHARS.length) | 0];
        }
        el.textContent = out;
        if (p < 1) rafId = requestAnimationFrame(frame);
        else setDone(true);
      };
      rafId = requestAnimationFrame(frame);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [ref, delay, duration]);

  return done;
}

export default function Hero() {
  const canvasRef = useRef(null);
  const titleRef = useRef(null);

  useParticles(canvasRef);
  const scrambleDone = useHeroScramble(titleRef);

  return (
    <section className="hero">
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-grid pl" data-parallax="-0.25" />

      <div className="hero-top-left pl" data-parallax="0.1">
        <div className="hero-b-label">
          <span>PRESENTED AS PART OF · 主办单位</span>
          <span>CN / TIANJIN</span>
        </div>
        <div className="hero-wie-logo" role="img" aria-label="World Intelligence Expo 2026" />
      </div>

      <div className="hero-tianjin-chip pl" data-parallax="0.2">
        TIANJIN · 5.28—31
      </div>

      <div className="hero-content">
        <div className="pl" data-parallax="0.15">
          <div className="hero-live">
            <span className="live">◉ LIVE · 报名通道已开启</span>
            <span className="edition">BOHACK · 第 04 届</span>
          </div>

          <h1>
            {scrambleDone ? (
              <>
                BO<span className="accent">HACK</span>
              </>
            ) : (
              <span ref={titleRef}>{FINAL}</span>
            )}
          </h1>

          <div className="cn-title-block">
            <div className="cn-meta">
              <span className="cn-meta-chip">CN · 官方赛道</span>
              <span>EVENT NAME · 赛事名称</span>
            </div>
            <div className="cn-title">智能创新黑客松大赛</div>
            <div className="cn-sub">
              The Smart Innovation Hackathon — an official satellite of World Intelligence Expo
              2026.
            </div>
          </div>

          <div className="hero-meta">
            <p className="hero-tag">
              48 小时,天津集结,600 位学生黑客。WIE 2026 官方赛道。
              带一个还没想清楚的点子来,带一件能跑的作品、一支队伍、一段故事走。
            </p>
            <div className="hero-stats">
              <div><b>48</b>小时</div>
              <div><b>600+</b>黑客</div>
              <div><b>¥50K+</b>奖金池</div>
              <div><b>24</b>校区</div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll">— SCROLL · 向下滚动</div>
    </section>
  );
}
