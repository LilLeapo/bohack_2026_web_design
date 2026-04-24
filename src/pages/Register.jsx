import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParticles } from '../hooks/useParticles.js';
import { useMagnet } from '../hooks/useMagnet.js';
import { api, setAuthSession, userFacingError } from '../lib/api.js';

const TRACKS = [
  'Ambient AI',
  '城市基建',
  '硬件朋克',
  '创作工具',
  '气候与地球',
  'Wildcard',
];
const LEVELS = ['首次参加', '1—3 次', '4—10 次', '10 次以上'];
const ROLES = ['工程', '设计', '硬件', '产品', '研究'];
const TEAMS = ['单飞(帮我组队)', '已有部分队友', '满编 4 人'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const GRADS = ['2025', '2026', '2027', '2028', '2029', '更晚'];
const STEP_TITLES = ['先聊聊你。', '你是怎样的黑客?', '最后一步。'];
const STEP_META = ['个人信息', '黑客画像', '动机与同意'];

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function buildUsername(data) {
  const emailName = normalizeEmail(data.email).split('@')[0];
  const fallback = `${data.first}${data.last}`.trim();
  const base = (emailName || fallback || 'bohack')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 38) || 'bohack';

  return `${base}_${Math.random().toString(36).slice(2, 8)}`.slice(0, 50);
}

function realNameFrom(data) {
  return [data.last.trim(), data.first.trim()].filter(Boolean).join('') ||
    data.email.trim();
}

function Poster() {
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  const stats = [
    { n: '~3m', t: '填写时长' },
    { n: '62%', t: '录取率' },
    { n: '6', t: '赛道' },
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
        <div className="auth-poster-eyebrow">◉ 报名通道开放 · 5 月 22 日线下开赛</div>
        <h1 className="auth-poster-title">
          来<span className="accent"> 搞点事情。</span>
        </h1>
        <p className="auth-poster-lede">
          三分钟的纸面功夫,换来 42 小时的折腾时间。每一份申请我们都会亲自阅读——没有关键字过滤。
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

export default function Register() {
  useMagnet();

  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    first: '',
    last: '',
    email: '',
    phone: '',
    school: '',
    grad: '2027',
    password: '',
    confirm: '',
    level: LEVELS[0],
    role: ROLES[0],
    tracks: [TRACKS[0]],
    team: TEAMS[0],
    dietary: '',
    tshirt: 'M',
    pitch: '',
    github: '',
    agree: false,
  });
  const [errs, setErrs] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  useEffect(() => {
    document.body.classList.add('auth-body');
    return () => document.body.classList.remove('auth-body');
  }, []);

  const up = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const toggleTrack = (t) =>
    setData((d) => ({
      ...d,
      tracks: d.tracks.includes(t)
        ? d.tracks.filter((x) => x !== t)
        : [...d.tracks, t],
    }));

  const validate = () => {
    const e = {};
    if (step === 0) {
      const email = normalizeEmail(data.email);
      const phone = data.phone.trim();
      if (!data.first.trim()) e.first = '请填写';
      if (!data.last.trim()) e.last = '请填写';
      if (!email || !/.+@.+\..+/.test(email)) e.email = '请输入有效邮箱';
      if (!phone) e.phone = '请填写手机号';
      if (phone.length > 32) e.phone = '手机号过长';
      if (!data.school.trim()) e.school = '请填写';
      if (data.password.length < 8) e.password = '至少 8 位';
      if (data.password !== data.confirm) e.confirm = '两次密码不一致';
    }
    if (step === 2) {
      if (!data.pitch || data.pitch.trim().length < 40)
        e.pitch = '至少 40 个字符,我们会认真读';
      if (!data.agree) e.agree = '需要勾选同意才能提交';
    }
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const next = (ev) => {
    ev?.preventDefault();
    if (validate()) setStep((s) => Math.min(2, s + 1));
  };
  const back = () => {
    setErrs({});
    setStep((s) => Math.max(0, s - 1));
  };
  const submit = async (ev) => {
    ev?.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrs({});
    try {
      const auth = await api.register({
        username: buildUsername(data),
        email: normalizeEmail(data.email),
        password: data.password,
      });
      setAuthSession(auth);

      const registration = await api.createRegistration({
        realName: realNameFrom(data),
        phone: data.phone.trim(),
        school: data.school.trim(),
        bio: data.pitch.trim(),
        teamName: data.team,
        rolePreference: data.role,
        source: 'bohack-frontend',
        note: data.pitch.trim(),
        extra: {
          firstName: data.first.trim(),
          lastName: data.last.trim(),
          graduationYear: data.grad,
          experienceLevel: data.level,
          tracks: data.tracks,
          teamStatus: data.team,
          dietary: data.dietary.trim(),
          tshirt: data.tshirt,
          portfolio: data.github.trim(),
        },
      });

      api.updateProfile({
        phone: data.phone.trim(),
      }).catch(() => {});

      setRegistrationResult(registration);
      setDone(true);
    } catch (error) {
      setErrs((current) => ({
        ...current,
        form: userFacingError(error),
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const appId = registrationResult?.id
      ? `BH26-${String(registrationResult.id).padStart(4, '0')}`
      : `BH26-${(data.first || 'XX').slice(0, 2).toUpperCase()}`;
    return (
      <div className="auth-shell">
        <Poster />
        <main className="auth-panel">
          <div className="auth-topbar">
            <Link to="/" className="auth-back">← 返回主页</Link>
            <span className="auth-topbar-meta">/ 申请已收到</span>
          </div>

          <div className="auth-form">
            <div className="auth-eyebrow">Application Received</div>
            <h1 className="auth-h1">
              机库见,<br />
              {data.first || '黑客'}。
            </h1>
            <p className="auth-sub">
              我们已向 <b>{data.email}</b> 发送了确认邮件。审核按周进行,十天之内你会收到我们的消息。
            </p>

            <div className="auth-success-id">
              <div className="auth-success-label">申请编号</div>
              <div className="auth-success-code">{appId}</div>
            </div>

            <div className="auth-btn-row">
              <Link to="/user" className="auth-submit magnet">
                <span>前往控制台</span>
                <span className="arrow">↗</span>
              </Link>
              <Link to="/" className="auth-ghost magnet">回到首页</Link>
            </div>

            <div className="auth-foot">
              需要修改?写信给{' '}
              <a href="mailto:hello@bohack.io">hello@bohack.io</a> ,我们会人工处理。
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
          <span className="auth-topbar-meta">Step {step + 1} / 3</span>
        </div>

        <form
          className="auth-form"
          onSubmit={step < 2 ? next : submit}
          noValidate
        >
          <div className="auth-steps" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={
                  'auth-step-dot' +
                  (i < step ? ' is-done' : '') +
                  (i === step ? ' is-current' : '')
                }
              />
            ))}
          </div>
          <div className="auth-step-label">
            Step {step + 1} / 3 · {STEP_META[step]}
          </div>

          <div className="auth-eyebrow">申请加入 Bohack</div>
          <h1 className="auth-h1">{STEP_TITLES[step]}</h1>

          {step === 0 && (
            <>
              <div className="auth-field-row">
                <div className={'auth-field' + (errs.first ? ' is-error' : '')}>
                  <label>
                    名 <span className="hint">必填</span>
                  </label>
                  <input
                    value={data.first}
                    onChange={(e) => up('first', e.target.value)}
                    placeholder="家豪"
                    autoComplete="given-name"
                  />
                  {errs.first && <div className="auth-err">{errs.first}</div>}
                </div>
                <div className={'auth-field' + (errs.last ? ' is-error' : '')}>
                  <label>
                    姓 <span className="hint">必填</span>
                  </label>
                  <input
                    value={data.last}
                    onChange={(e) => up('last', e.target.value)}
                    placeholder="李"
                    autoComplete="family-name"
                  />
                  {errs.last && <div className="auth-err">{errs.last}</div>}
                </div>
              </div>

              <div className={'auth-field' + (errs.email ? ' is-error' : '')}>
                <label>
                  校园邮箱 <span className="hint">推荐 .edu.cn</span>
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => up('email', e.target.value)}
                  placeholder="you@university.edu.cn"
                  autoComplete="email"
                />
                {errs.email && <div className="auth-err">{errs.email}</div>}
              </div>

              <div className={'auth-field' + (errs.phone ? ' is-error' : '')}>
                <label>
                  手机号 <span className="hint">用于报名联系</span>
                </label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => up('phone', e.target.value)}
                  placeholder="138 0000 0000"
                  autoComplete="tel"
                />
                {errs.phone && <div className="auth-err">{errs.phone}</div>}
              </div>

              <div className="auth-field-row">
                <div className={'auth-field' + (errs.school ? ' is-error' : '')}>
                  <label>
                    就读学校 <span className="hint">必填</span>
                  </label>
                  <input
                    value={data.school}
                    onChange={(e) => up('school', e.target.value)}
                    placeholder="天津大学"
                  />
                  {errs.school && <div className="auth-err">{errs.school}</div>}
                </div>
                <div className="auth-field">
                  <label>毕业年份</label>
                  <select
                    value={data.grad}
                    onChange={(e) => up('grad', e.target.value)}
                  >
                    {GRADS.map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="auth-field-row">
                <div className={'auth-field' + (errs.password ? ' is-error' : '')}>
                  <label>
                    密码 <span className="hint">至少 8 位</span>
                  </label>
                  <input
                    type="password"
                    value={data.password}
                    onChange={(e) => up('password', e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  {errs.password && (
                    <div className="auth-err">{errs.password}</div>
                  )}
                </div>
                <div className={'auth-field' + (errs.confirm ? ' is-error' : '')}>
                  <label>
                    确认密码 <span className="hint">再来一次</span>
                  </label>
                  <input
                    type="password"
                    value={data.confirm}
                    onChange={(e) => up('confirm', e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  {errs.confirm && (
                    <div className="auth-err">{errs.confirm}</div>
                  )}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="auth-field">
                <label>黑客经验</label>
                <div className="auth-chip-group">
                  {LEVELS.map((l) => (
                    <label
                      key={l}
                      className={
                        'auth-chip' + (data.level === l ? ' is-on' : '')
                      }
                    >
                      <span className="mk" />
                      <span>{l}</span>
                      <input
                        type="radio"
                        name="level"
                        checked={data.level === l}
                        onChange={() => up('level', l)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="auth-field">
                <label>主要角色</label>
                <div className="auth-chip-group">
                  {ROLES.map((r) => (
                    <label
                      key={r}
                      className={
                        'auth-chip' + (data.role === r ? ' is-on' : '')
                      }
                    >
                      <span className="mk" />
                      <span>{r}</span>
                      <input
                        type="radio"
                        name="role"
                        checked={data.role === r}
                        onChange={() => up('role', r)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="auth-field">
                <label>
                  感兴趣的赛道 <span className="hint">可多选</span>
                </label>
                <div className="auth-chip-group">
                  {TRACKS.map((t) => (
                    <label
                      key={t}
                      className={
                        'auth-chip' +
                        (data.tracks.includes(t) ? ' is-on' : '')
                      }
                    >
                      <span className="mk" />
                      <span>{t}</span>
                      <input
                        type="checkbox"
                        checked={data.tracks.includes(t)}
                        onChange={() => toggleTrack(t)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="auth-field-row">
                <div className="auth-field">
                  <label>组队情况</label>
                  <select
                    value={data.team}
                    onChange={(e) => up('team', e.target.value)}
                  >
                    {TEAMS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="auth-field">
                  <label>T 恤尺码</label>
                  <select
                    value={data.tshirt}
                    onChange={(e) => up('tshirt', e.target.value)}
                  >
                    {SIZES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="auth-field">
                <label>
                  饮食备注 <span className="hint">可选</span>
                </label>
                <input
                  value={data.dietary}
                  onChange={(e) => up('dietary', e.target.value)}
                  placeholder="素食、无麸质、过敏等"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={'auth-field' + (errs.pitch ? ' is-error' : '')}>
                <label>
                  为什么选择 Bohack? <span className="hint">40+ 字符 · 我们会读</span>
                </label>
                <textarea
                  rows={5}
                  value={data.pitch}
                  onChange={(e) => up('pitch', e.target.value)}
                  placeholder="告诉我们你想造什么,或者你对什么好奇。不必追求语法完美,真诚就好。"
                />
                <div className="auth-field-meta">
                  <span className="hint">{data.pitch.length} / 500</span>
                  {errs.pitch && <div className="auth-err">{errs.pitch}</div>}
                </div>
              </div>

              <div className="auth-field">
                <label>
                  GitHub 或作品集 <span className="hint">可选</span>
                </label>
                <input
                  value={data.github}
                  onChange={(e) => up('github', e.target.value)}
                  placeholder="github.com/your-id"
                />
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
                    我已阅读并同意 <a href="#" className="auth-link">MLH 行为准则</a> 与 Bohack 活动条款。
                  </span>
                  <input
                    type="checkbox"
                    checked={data.agree}
                    onChange={(e) => up('agree', e.target.checked)}
                  />
                </label>
                {errs.agree && <div className="auth-err">{errs.agree}</div>}
              </div>
            </>
          )}

          <div className="auth-btn-row">
            {step > 0 && (
              <button type="button" className="auth-ghost magnet" onClick={back}>
                ← 返回上一步
              </button>
            )}
            {step < 2 && (
              <button type="submit" className="auth-submit magnet">
                <span>继续</span>
                <span className="arrow">↗</span>
              </button>
            )}
            {step === 2 && (
              <button
                type="submit"
                className="auth-submit magnet"
                disabled={submitting}
              >
                <span>{submitting ? '提交中…' : '提交申请'}</span>
                <span className="arrow">↗</span>
              </button>
            )}
          </div>

          {errs.form && <div className="auth-err auth-form-err">{errs.form}</div>}

          <div className="auth-foot">
            已有账号?<Link to="/login">登录</Link> 查看申请状态。
          </div>
        </form>
      </main>
    </div>
  );
}
