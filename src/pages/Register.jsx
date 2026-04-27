import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParticles } from '../hooks/useParticles.js';
import { useMagnet } from '../hooks/useMagnet.js';
import { api, setAuthSession, userFacingError } from '../lib/api.js';

const TERMS_CONTENT = `BOHACK 用户协议

最后更新：2026 年 4 月

一、服务说明
本网站由 BOHACK 主办方运营，账号用于报名、查看审核状态及接收活动通知。

二、账号责任
请妥善保管账号和密码，不得将账号转让或共享给他人使用。

三、信息使用
你提供的信息仅用于本次 BOHACK 2026 活动的参赛资格确认、组队匹配及活动沟通，不会用于其他商业目的。

四、服务变更
主办方保留在不提前通知的情况下修改或终止服务的权利。

如有疑问，请联系：hello@bohack.io`;

const PRIVACY_CONTENT = `BOHACK 隐私说明

最后更新：2026 年 4 月

一、收集的信息
注册时我们收集：邮箱地址、用户名及加密密码。报名问卷中我们收集：姓名、联系方式、学校/机构、技能背景、参赛动机等。

二、信息使用目的
· 验证参赛资格
· 发送活动通知（审核结果、日程、赛前提醒）
· 组队匹配与导师对接

三、信息存储与安全
数据存储于国内服务器，采用加密传输（HTTPS）和访问控制保护。

四、信息共享
我们不会将你的个人信息出售或共享给任何第三方，仅在法律要求时配合监管机构。

五、数据保留
活动结束后，个人信息将在合理期限内保留以备查阅，之后按规定删除或匿名化处理。

如有疑问，请联系：hello@bohack.io`;

function PolicyModal({ title, content, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="policy-overlay" onClick={onClose}>
      <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="policy-modal-header">
          <span className="policy-modal-title">{title}</span>
          <button type="button" className="policy-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="policy-modal-body">
          {content.split('\n').map((line, i) => (
            line.trim() === '' ? <br key={i} /> : <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

const RESEND_CODE_SECONDS = 60;

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
        <span>天津 / 2026.05.22-31</span>
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
  const [modal, setModal] = useState(null);
  const [codeCooldown, setCodeCooldown] = useState(0);

  useEffect(() => {
    document.body.classList.add('auth-body');
    return () => document.body.classList.remove('auth-body');
  }, []);

  useEffect(() => {
    if (codeCooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCodeCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [codeCooldown]);

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
    if (sendingCode || codeCooldown > 0) return;

    const email = normalizeEmail(data.email);
    if (!email || !/.+@.+\..+/.test(email)) {
      setErrs({ email: '请输入有效邮箱后再发送验证码' });
      return;
    }

    setSendingCode(true);
    setCodeMessage('');
    setErrs({});
    try {
      await api.sendVerificationCode({
        email,
        codeType: 'register',
      });
      setCodeMessage('验证码已发送，请检查邮箱。');
      setCodeCooldown(RESEND_CODE_SECONDS);
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
                disabled={sendingCode || codeCooldown > 0}
              >
                {sendingCode
                  ? '发送中'
                  : codeCooldown > 0
                  ? `${codeCooldown}s 后重发`
                  : '发送验证码'}
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
            <label className="auth-agree-label">
              <input
                type="checkbox"
                checked={data.agree}
                onChange={(e) => up('agree', e.target.checked)}
              />
              <span>
                我已阅读并同意 BOHACK{' '}
                <button
                  type="button"
                  className="auth-policy-link"
                  onClick={(e) => { e.preventDefault(); setModal('terms'); }}
                >用户协议</button>
                {' '}与{' '}
                <button
                  type="button"
                  className="auth-policy-link"
                  onClick={(e) => { e.preventDefault(); setModal('privacy'); }}
                >隐私说明</button>
                。
              </span>
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
      {modal && (
        <PolicyModal
          title={modal === 'terms' ? 'BOHACK 用户协议' : 'BOHACK 隐私说明'}
          content={modal === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
