import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParticles } from '../hooks/useParticles.js';
import { useMagnet } from '../hooks/useMagnet.js';
import { api, setAuthSession, userFacingError } from '../lib/api.js';

function Poster() {
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  const stats = [
    { n: '100+', t: '选手' },
    { n: '42h', t: '极限冲刺' },
    { n: '¥50K+', t: '奖金池' },
  ];

  return (
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
        <div className="auth-poster-eyebrow">◉ 报名进行中 · 5 月 22 日线下开赛</div>
        <h1 className="auth-poster-title">
          欢迎 <span className="accent">回来。</span>
        </h1>
        <p className="auth-poster-lede">
          登录后查看报名进度、组队情况,以及距离下一个里程碑还剩多久。
        </p>
        <div className="auth-poster-stats">
          {stats.map((s) => (
            <div className="s" key={s.t}>
              <div className="n">{s.n}</div>
              <div className="t">{s.t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-poster-footer">
        <span>天津 · 滨海 / 2026.05.22—31</span>
        <span>Bohack 2026</span>
      </div>
    </aside>
  );
}

export default function Login() {
  useMagnet();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prev = document.body.style.cursor;
    document.body.classList.add('auth-body');
    return () => {
      document.body.classList.remove('auth-body');
      document.body.style.cursor = prev;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErr('请填写邮箱和密码。');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const auth = await api.login({
        login: email.trim(),
        password,
      });
      setAuthSession(auth, { persist: remember });
      navigate('/user');
    } catch (error) {
      setErr(userFacingError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Poster />

      <main className="auth-panel">
        <div className="auth-topbar">
          <Link to="/" className="auth-back">← 返回主页</Link>
          <span className="auth-topbar-meta">/ 登录</span>
        </div>

        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-eyebrow">老黑客回归</div>
          <h1 className="auth-h1">登录。</h1>
          <p className="auth-sub">
            继续未完成的报名。还没有账号?{' '}
            <Link to="/register" className="auth-link">立即申请 →</Link>
          </p>

          <div className={'auth-field' + (err ? ' is-error' : '')}>
            <label>
              校园邮箱
              <span className="hint">推荐使用 .edu.cn</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErr(''); }}
              placeholder="you@university.edu.cn"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className={'auth-field' + (err ? ' is-error' : '')}>
            <label>
              密码
              <Link to="/forgot-password" className="hint hint-link">忘记密码?</Link>
            </label>
            <div className="auth-pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErr(''); }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? '隐藏密码' : '显示密码'}
              >
                {showPw ? '隐藏' : '显示'}
              </button>
            </div>
            {err && <div className="auth-err">{err}</div>}
          </div>

          <div className="auth-row">
            <label className={'auth-chip' + (remember ? ' is-on' : '')}>
              <span className="mk" />
              <span>记住此设备</span>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
            </label>
          </div>

          <div className="auth-btn-row">
            <button
              type="submit"
              className="auth-submit magnet"
              disabled={loading}
            >
              <span>{loading ? '登录中…' : '登录'}</span>
              <span className="arrow">↗</span>
            </button>
            <Link to="/register" className="auth-ghost magnet">创建账号</Link>
          </div>

          <div className="auth-foot">
            遇到问题?在 <a href="#">Discord</a> 联系我们,或发邮件至{' '}
            <a href="mailto:hello@bohack.io">hello@bohack.io</a>。
          </div>
        </form>
      </main>
    </div>
  );
}
