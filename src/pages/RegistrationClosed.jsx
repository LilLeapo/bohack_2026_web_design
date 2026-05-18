import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useParticles } from '../hooks/useParticles.js';
import { useMagnet } from '../hooks/useMagnet.js';

export default function RegistrationClosed() {
  const canvasRef = useRef(null);

  useParticles(canvasRef);
  useMagnet();

  useEffect(() => {
    document.body.classList.add('auth-body');
    return () => document.body.classList.remove('auth-body');
  }, []);

  return (
    <div className="auth-shell">
      <aside className="auth-poster">
        <canvas ref={canvasRef} className="auth-poster-canvas" />
        <div className="auth-poster-grid" />

        <div className="auth-brand">
          <img
            src="/BoHack-LOGO-%E5%8F%8D%E7%99%BD.svg"
            alt="BoHack"
            className="auth-brand-logo"
          />
          <span>Bohack / 2026</span>
        </div>

        <div className="auth-poster-body">
          <div className="auth-poster-eyebrow">◉ Notice · 报名通知</div>
          <h1 className="auth-poster-title">
            报名<span className="accent"> 截止。</span>
          </h1>
          <p className="auth-poster-lede">
            BOHACK 2026 黑客松个人参赛报名通道已关闭。感谢每一位创造者的关注与支持。
          </p>
          <div className="auth-poster-stats">
            <div className="s">
              <div className="n">05/18</div>
              <div className="t">报名截止</div>
            </div>
            <div className="s">
              <div className="n">42h</div>
              <div className="t">线下黑客松</div>
            </div>
            <div className="s">
              <div className="n">WIE</div>
              <div className="t">智博会展演</div>
            </div>
          </div>
        </div>

        <div className="auth-poster-footer">
          <span>天津 / 2026.05.22-31</span>
          <span>WIE 2026</span>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-topbar">
          <Link to="/" className="auth-back">← 返回主页</Link>
          <span className="auth-topbar-meta">/ 报名已截止</span>
        </div>

        <div className="auth-form">
          <div className="auth-eyebrow">Registration Closed</div>
          <h1 className="auth-h1">个人报名已停止。</h1>
          <p className="auth-sub">
            本次 BOHACK 2026 黑客松个人参赛报名已截止，系统不再接收新的个人报名表单。
            已提交报名的用户仍可登录控制台查看审核状态与后续通知。
          </p>

          <div className="auth-btn-row">
            <Link to="/login" className="auth-submit magnet">
              <span>登录查看状态</span>
              <span className="arrow">↗</span>
            </Link>
            <Link to="/" className="auth-ghost magnet">返回主页</Link>
          </div>

          <p className="auth-foot">
            如有特殊情况，请联系微信 15522512264。
          </p>
        </div>
      </main>
    </div>
  );
}
