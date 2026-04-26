import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParticles } from '../hooks/useParticles.js';
import { useMagnet } from '../hooks/useMagnet.js';
import { api, setAuthSession, userFacingError } from '../lib/api.js';

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function usernameFromEmail(email) {
  return normalizeEmail(email)
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

function Poster() {
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  const stats = [
    { n: '1', t: '先创建账号' },
    { n: '2', t: '再填写问卷' },
    { n: '3', t: '审核通过后成为选手' },
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
        <div className="auth-poster-eyebrow">◉ 邮箱验证 · 账号注册</div>
        <h1 className="auth-poster-title">
          创建<span className="accent"> 账号。</span>
        </h1>
        <p className="auth-poster-lede">
          账号用于保存报名问卷和查看审核状态。只有问卷审核通过后，账号才会成为正式选手身份。
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
        <span>天津 · 滨海 / 2026.05.22-31</span>
        <span>WIE 2026</span>
      </div>
    </aside>
  );
}

export default function Register() {
  useMagnet();

  const [data, setData] = useState({
    username: '',
    email: '',
    verificationCode: '',
    password: '',
    confirm: '',
    agree: false,
  });
  const [errs, setErrs] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeMessage, setCodeMessage] = useState('');

  useEffect(() => {
    document.body.classList.add('auth-body');
    return () => document.body.classList.remove('auth-body');
  }, []);

  const up = (key, value) => setData((current) => ({ ...current, [key]: value }));

  const validateAccount = ({ requireCode = true } = {}) => {
    const nextErrs = {};
    const email = normalizeEmail(data.email);
    const username = data.username.trim();

    if (!username || username.length > 50) nextErrs.username = '请填写 1-50 个字符的用户名';
    if (!email || !/.+@.+\..+/.test(email)) nextErrs.email = '请输入有效邮箱';
    if (requireCode && !/^\d{6}$/.test(data.verificationCode.trim())) {
      nextErrs.verificationCode = '请输入 6 位邮箱验证码';
    }
    if (data.password.length < 8) nextErrs.password = '密码至少 8 位';
    if (data.password !== data.confirm) nextErrs.confirm = '两次密码不一致';
    if (requireCode && !data.agree) nextErrs.agree = '请先同意用户协议和隐私说明';

    setErrs(nextErrs);
    return Object.keys(nextErrs).length === 0;
  };

  const sendCode = async () => {
    const email = normalizeEmail(data.email);
    if (!email || !/.+@.+\..+/.test(email)) {
      setErrs({ email: '请输入有效邮箱后再发送验证码' });
      return;
    }

    setSendingCode(true);
    setCodeMessage('');
    setErrs({});
    try {
      const result = await api.sendVerificationCode({
        email,
        codeType: 'register',
      });
      setCodeMessage(
        result?.debug_code
          ? `验证码已发送。开发模式验证码: ${result.debug_code}`
          : '验证码已发送，请检查邮箱。'
      );
      if (result?.debug_code) up('verificationCode', result.debug_code);
    } catch (error) {
      setErrs({ form: userFacingError(error) });
    } finally {
      setSendingCode(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validateAccount()) return;

    setSubmitting(true);
    setErrs({});
    try {
      const auth = await api.register({
        username: data.username.trim(),
        email: normalizeEmail(data.email),
        password: data.password,
        verificationCode: data.verificationCode.trim(),
      });
      setAuthSession(auth);
      setDone(true);
    } catch (error) {
      setErrs({ form: userFacingError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="auth-shell">
        <Poster />
        <main className="auth-panel">
          <div className="auth-topbar">
            <Link to="/" className="auth-back">← 返回主页</Link>
            <span className="auth-topbar-meta">/ 账号已创建</span>
          </div>

          <div className="auth-form">
            <div className="auth-eyebrow">Account Created</div>
            <h1 className="auth-h1">账号已创建。</h1>
            <p className="auth-sub">
              你现在可以填写 BOHACK 2026 报名问卷。问卷审核通过后，你的账号才会升级为选手身份。
            </p>

            <div className="auth-btn-row">
              <Link to="/questionnaire" className="auth-submit magnet">
                <span>填写报名问卷</span>
                <span className="arrow">↗</span>
              </Link>
              <Link to="/user" className="auth-ghost magnet">进入控制台</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <Poster />

      <main className="auth-panel">
        <div className="auth-topbar">
          <Link to="/" className="auth-back">← 返回主页</Link>
          <span className="auth-topbar-meta">/ 创建账号</span>
        </div>

        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-eyebrow">邮箱验证码注册</div>
          <h1 className="auth-h1">创建账号。</h1>
          <p className="auth-sub">
            已有账号? <Link to="/login" className="auth-link">直接登录 →</Link>
          </p>

          <div className={'auth-field' + (errs.email ? ' is-error' : '')}>
            <label>
              邮箱 <span className="hint">用于登录和接收通知</span>
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => {
                const email = e.target.value;
                up('email', email);
                if (!data.username) up('username', usernameFromEmail(email));
              }}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
            {errs.email && <div className="auth-err">{errs.email}</div>}
          </div>

          <div className={'auth-field' + (errs.verificationCode ? ' is-error' : '')}>
            <label>
              邮箱验证码 <span className="hint">6 位数字</span>
            </label>
            <div className="auth-pw-wrap">
              <input
                value={data.verificationCode}
                onChange={(e) => up('verificationCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={sendCode}
                disabled={sendingCode}
              >
                {sendingCode ? '发送中' : '发送验证码'}
              </button>
            </div>
            {codeMessage && <div className="auth-field-meta"><span className="hint">{codeMessage}</span></div>}
            {errs.verificationCode && <div className="auth-err">{errs.verificationCode}</div>}
          </div>

          <div className={'auth-field' + (errs.username ? ' is-error' : '')}>
            <label>
              用户名 <span className="hint">可之后在后台识别你</span>
            </label>
            <input
              value={data.username}
              onChange={(e) => up('username', e.target.value)}
              placeholder="bohack_user"
              autoComplete="username"
              maxLength={50}
            />
            {errs.username && <div className="auth-err">{errs.username}</div>}
          </div>

          <div className="auth-field-row">
            <div className={'auth-field' + (errs.password ? ' is-error' : '')}>
              <label>
                登录密码 <span className="hint">至少 8 位</span>
              </label>
              <input
                type="password"
                value={data.password}
                onChange={(e) => up('password', e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errs.password && <div className="auth-err">{errs.password}</div>}
            </div>
            <div className={'auth-field' + (errs.confirm ? ' is-error' : '')}>
              <label>
                确认密码 <span className="hint">再输入一次</span>
              </label>
              <input
                type="password"
                value={data.confirm}
                onChange={(e) => up('confirm', e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errs.confirm && <div className="auth-err">{errs.confirm}</div>}
            </div>
          </div>

          <div
            className={
              'auth-field auth-field-agree' +
              (errs.agree ? ' is-error' : '')
            }
          >
            <label
              className={
                'auth-chip auth-chip-full' +
                (data.agree ? ' is-on' : '')
              }
            >
              <span className="mk" />
              <span>
                我已阅读并同意 BOHACK 的用户协议与隐私说明，理解账号信息将用于登录、报名状态查询和活动通知。
              </span>
              <input
                type="checkbox"
                checked={data.agree}
                onChange={(e) => up('agree', e.target.checked)}
              />
            </label>
            {errs.agree && <div className="auth-err">{errs.agree}</div>}
          </div>

          {errs.form && <div className="auth-err auth-form-err">{errs.form}</div>}

          <div className="auth-btn-row">
            <button
              type="submit"
              className="auth-submit magnet"
              disabled={submitting}
            >
              <span>{submitting ? '创建中…' : '创建账号'}</span>
              <span className="arrow">↗</span>
            </button>
            <Link to="/login" className="auth-ghost magnet">登录</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
