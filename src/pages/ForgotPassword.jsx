import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParticles } from '../hooks/useParticles.js';
import { useMagnet } from '../hooks/useMagnet.js';
import { api, userFacingError } from '../lib/api.js';

function Poster() {
  const canvasRef = useRef(null);
  useParticles(canvasRef);

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
        <div className="auth-poster-eyebrow">◉ 找回账号 · 邮箱验证</div>
        <h1 className="auth-poster-title">
          重置 <span className="accent">密码。</span>
        </h1>
        <p className="auth-poster-lede">
          输入注册邮箱，我们会向你发送一封 6 位验证码。验证码有效期 10 分钟，请尽快使用。
        </p>
      </div>

      <div className="auth-poster-footer">
        <span>天津 / 2026.05.22—31</span>
        <span>Bohack 2026</span>
      </div>
    </aside>
  );
}

export default function ForgotPassword() {
  useMagnet();
  const navigate = useNavigate();

  const [stage, setStage] = useState('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add('auth-body');
    return () => document.body.classList.remove('auth-body');
  }, []);

  const sendCode = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      setErr('请填写邮箱。');
      return;
    }
    setLoading(true);
    setErr('');
    setInfo('');
    try {
      const data = await api.forgotPasswordSendCode({
        email: email.trim().toLowerCase(),
      });
      setStage('reset');
      setInfo(
        data?.debug_code
          ? `验证码已发送（调试模式：${data.debug_code}）。`
          : '验证码已发送至你的邮箱，请查收。',
      );
    } catch (error) {
      setErr(userFacingError(error));
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e) => {
    e?.preventDefault();
    if (code.trim().length !== 6) {
      setErr('请输入 6 位验证码。');
      return;
    }
    if (password.length < 8) {
      setErr('密码至少 8 位。');
      return;
    }
    if (password !== confirm) {
      setErr('两次密码不一致。');
      return;
    }
    setLoading(true);
    setErr('');
    setInfo('');
    try {
      await api.forgotPasswordReset({
        email: email.trim().toLowerCase(),
        verificationCode: code.trim(),
        newPassword: password,
      });
      setStage('done');
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
          <Link to="/login" className="auth-back">← 返回登录</Link>
          <span className="auth-topbar-meta">
            / {stage === 'done' ? '完成' : '找回密码'}
          </span>
        </div>

        {stage === 'request' && (
          <form className="auth-form" onSubmit={sendCode} noValidate>
            <div className="auth-eyebrow">Reset Password</div>
            <h1 className="auth-h1">忘了密码？</h1>
            <p className="auth-sub">
              输入注册邮箱，我们会发送 6 位验证码用于重置。
            </p>

            <div className={'auth-field' + (err ? ' is-error' : '')}>
              <label>
                注册邮箱
                <span className="hint">必填</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErr('');
                }}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
              {err && <div className="auth-err">{err}</div>}
              {info && <div className="auth-foot">{info}</div>}
            </div>

            <div className="auth-btn-row">
              <button
                type="submit"
                className="auth-submit magnet"
                disabled={loading}
              >
                <span>{loading ? '发送中…' : '发送验证码'}</span>
                <span className="arrow">↗</span>
              </button>
              <Link to="/login" className="auth-ghost magnet">回到登录</Link>
            </div>
          </form>
        )}

        {stage === 'reset' && (
          <form className="auth-form" onSubmit={reset} noValidate>
            <div className="auth-eyebrow">Verify & Reset</div>
            <h1 className="auth-h1">设置新密码。</h1>
            <p className="auth-sub">
              我们已向 <b>{email}</b> 发送验证码。
              <button
                type="button"
                className="auth-link"
                onClick={sendCode}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  marginLeft: 6,
                  cursor: 'pointer',
                  font: 'inherit',
                }}
              >
                重新发送
              </button>
            </p>

            <div className="auth-field">
              <label>
                验证码
                <span className="hint">6 位</span>
              </label>
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setErr('');
                }}
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
              />
            </div>

            <div className="auth-field">
              <label>
                新密码
                <span className="hint">至少 8 位</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErr('');
                }}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div className="auth-field">
              <label>
                确认新密码
                <span className="hint">再来一次</span>
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setErr('');
                }}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {err && <div className="auth-err">{err}</div>}
              {info && !err && <div className="auth-foot">{info}</div>}
            </div>

            <div className="auth-btn-row">
              <button
                type="submit"
                className="auth-submit magnet"
                disabled={loading}
              >
                <span>{loading ? '提交中…' : '重置密码'}</span>
                <span className="arrow">↗</span>
              </button>
              <button
                type="button"
                className="auth-ghost magnet"
                onClick={() => {
                  setStage('request');
                  setErr('');
                  setInfo('');
                }}
              >
                换个邮箱
              </button>
            </div>
          </form>
        )}

        {stage === 'done' && (
          <div className="auth-form">
            <div className="auth-eyebrow">All Set</div>
            <h1 className="auth-h1">
              密码已重置。
              <br />
              请登录。
            </h1>
            <p className="auth-sub">
              你现在可以使用新密码登录账号。
            </p>
            <div className="auth-btn-row">
              <button
                type="button"
                className="auth-submit magnet"
                onClick={() => navigate('/login')}
              >
                <span>前往登录</span>
                <span className="arrow">↗</span>
              </button>
              <Link to="/" className="auth-ghost magnet">回到首页</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
