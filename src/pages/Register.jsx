import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParticles } from '../hooks/useParticles.js';
import { useMagnet } from '../hooks/useMagnet.js';
import { api, setAuthSession, userFacingError } from '../lib/api.js';

const QUESTIONNAIRE_TITLE =
  '2026世界智能产业博览会·智能创新黑客松报名问卷';

const INTRO_LINES = [
  '欢迎报名参加本次智能创新黑客松大赛。',
  '本问卷将用于参赛资格筛选，请认真填写。',
  '所有信息仅用于本次活动使用，我们将严格保密。',
];

const SKILL_OPTIONS = [
  { v: 'engineering', lbl: '工程', glyph: '{ }' },
  { v: 'design', lbl: '设计', glyph: 'A◆' },
  { v: 'hardware', lbl: '硬件', glyph: '⬢' },
  { v: 'product', lbl: '产品', glyph: '△' },
  { v: 'research', lbl: '研究', glyph: '∑' },
  { v: 'creative', lbl: '创作 / 影像', glyph: '✦' },
];

const GENDERS = ['男', '女', '其他', '不便透露'];
const AGE_GROUPS = ['18 岁以下', '18-22 岁', '23-26 岁', '27-35 岁', '36 岁及以上'];
const ATTENDANCE_OPTIONS = [
  '可以完整参加',
  '大部分时间可以参加',
  '只能参加部分环节',
  '暂不确定',
];
const STEP_TITLES = ['基础信息。', '技能信息。', '思考问题。'];
const STEP_META = ['基础信息', '技能信息', '思考问题'];

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function buildUsername(data) {
  const emailName = normalizeEmail(data.email).split('@')[0];
  const fallback = data.nickname.trim() || data.realName.trim();
  const base = (emailName || fallback || 'bohack')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 38) || 'bohack';

  return `${base}_${Math.random().toString(36).slice(2, 8)}`.slice(0, 50);
}

function realNameFrom(data) {
  return data.realName.trim() || data.nickname.trim() || data.email.trim();
}

function formatSkills(values, extra) {
  const selected = values
    .map((value) => SKILL_OPTIONS.find((option) => option.v === value)?.lbl)
    .filter(Boolean);
  return [...selected, extra.trim()].filter(Boolean).join(' · ');
}

function Poster() {
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  const stats = [
    { n: '16', t: '问卷题目' },
    { n: '3', t: '信息模块' },
    { n: '100%', t: '仅活动使用' },
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
          报名<span className="accent"> 问卷。</span>
        </h1>
        <p className="auth-poster-lede">
          {INTRO_LINES.join(' ')}
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
        <span>WIE 2026</span>
      </div>
    </aside>
  );
}

export default function Register() {
  useMagnet();

  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    nickname: '',
    realName: '',
    gender: '',
    ageGroup: '',
    organization: '',
    contact: '',
    email: '',
    password: '',
    confirm: '',
    resume: '',
    skills: [],
    skillsOther: '',
    keywords: '',
    projects: '',
    why: '',
    nonstandard: '',
    answerOrQuestion: '',
    postScarcityWork: '',
    availability: '',
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
  const toggleSkill = (value) =>
    setData((d) => ({
      ...d,
      skills: d.skills.includes(value)
        ? d.skills.filter((item) => item !== value)
        : [...d.skills, value],
    }));

  const validate = () => {
    const e = {};
    if (step === 0) {
      const email = normalizeEmail(data.email);
      const contact = data.contact.trim();
      if (!data.nickname.trim()) e.nickname = '请填写昵称';
      if (!data.realName.trim()) e.realName = '请填写姓名';
      if (!data.gender) e.gender = '请选择性别';
      if (!data.ageGroup) e.ageGroup = '请选择年龄段';
      if (!data.organization.trim()) e.organization = '请填写学校/机构和专业';
      if (!contact) e.contact = '请填写电话或微信';
      if (contact.length > 32) e.contact = '联系方式过长';
      if (!email || !/.+@.+\..+/.test(email)) e.email = '请输入有效邮箱';
      if (data.password.length < 8) e.password = '至少 8 位';
      if (data.password !== data.confirm) e.confirm = '两次密码不一致';
    }
    if (step === 1) {
      if (!data.skills.length && !data.skillsOther.trim())
        e.skills = '请选择或补充你擅长的技术或产品技能';
    }
    if (step === 2) {
      if (!data.why.trim()) e.why = '请填写参赛原因';
      if (!data.nonstandard.trim()) e.nonstandard = '请填写你的非标准答案';
      if (!data.availability) e.availability = '请选择赛程参与情况';
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

      const skillsText = formatSkills(data.skills, data.skillsOther);
      const questionnaire = {
        title: QUESTIONNAIRE_TITLE,
        nickname: data.nickname.trim(),
        realName: data.realName.trim(),
        gender: data.gender,
        ageGroup: data.ageGroup,
        organization: data.organization.trim(),
        contact: data.contact.trim(),
        email: normalizeEmail(data.email),
        resume: data.resume.trim(),
        skills: skillsText,
        skillTypes: data.skills,
        skillsOther: data.skillsOther.trim(),
        keywords: data.keywords.trim(),
        projects: data.projects.trim(),
        why: data.why.trim(),
        nonstandard: data.nonstandard.trim(),
        answerOrQuestion: data.answerOrQuestion.trim(),
        postScarcityWork: data.postScarcityWork.trim(),
        availability: data.availability,
      };

      const registration = await api.createRegistration({
        realName: realNameFrom(data),
        phone: data.contact.trim(),
        school: data.organization.trim(),
        bio: data.why.trim(),
        teamName: data.availability,
        rolePreference: skillsText.slice(0, 80),
        source: 'bohack-frontend',
        note: data.why.trim(),
        extra: {
          questionnaire,
          nickname: questionnaire.nickname,
          gender: questionnaire.gender,
          ageGroup: questionnaire.ageGroup,
          resume: questionnaire.resume,
          skills: questionnaire.skills,
          keywords: questionnaire.keywords,
          projects: questionnaire.projects,
          nonstandard: questionnaire.nonstandard,
          answerOrQuestion: questionnaire.answerOrQuestion,
          postScarcityWork: questionnaire.postScarcityWork,
          availability: questionnaire.availability,
        },
      });

      api.updateProfile({
        phone: data.contact.trim(),
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
      : `BH26-${(data.nickname || 'XX').slice(0, 2).toUpperCase()}`;
    return (
      <div className="auth-shell">
        <Poster />
        <main className="auth-panel">
          <div className="auth-topbar">
            <Link to="/" className="auth-back">← 返回主页</Link>
            <span className="auth-topbar-meta">/ 问卷已收到</span>
          </div>

          <div className="auth-form">
            <div className="auth-eyebrow">Application Received</div>
            <h1 className="auth-h1">
              谢谢,<br />
              {data.nickname || data.realName || '参赛者'}。
            </h1>
            <p className="auth-sub">
              我们已向 <b>{data.email}</b> 发送确认信息。未来重要通知将通过邮箱和微信群发送，请保持联系方式可用。
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

          <div className="auth-eyebrow">{QUESTIONNAIRE_TITLE}</div>
          <h1 className="auth-h1">{STEP_TITLES[step]}</h1>
          {step === 0 && (
            <p className="auth-sub auth-intro">
              {INTRO_LINES.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          )}

          {step === 0 && (
            <>
              <div className="auth-field-row">
                <div className={'auth-field' + (errs.nickname ? ' is-error' : '')}>
                  <label>
                    昵称 <span className="hint">必填</span>
                  </label>
                  <input
                    value={data.nickname}
                    onChange={(e) => up('nickname', e.target.value)}
                    placeholder="小波"
                    maxLength={40}
                  />
                  {errs.nickname && <div className="auth-err">{errs.nickname}</div>}
                </div>
                <div className={'auth-field' + (errs.realName ? ' is-error' : '')}>
                  <label>
                    姓名 <span className="hint">必填</span>
                  </label>
                  <input
                    value={data.realName}
                    onChange={(e) => up('realName', e.target.value)}
                    placeholder="李家豪"
                    autoComplete="name"
                    maxLength={40}
                  />
                  {errs.realName && <div className="auth-err">{errs.realName}</div>}
                </div>
              </div>

              <div className="auth-field-row">
                <div className={'auth-field' + (errs.gender ? ' is-error' : '')}>
                  <label>
                    性别 <span className="hint">必填</span>
                  </label>
                  <div className="auth-chip-group">
                    {GENDERS.map((gender) => (
                      <label
                        key={gender}
                        className={
                          'auth-chip' +
                          (data.gender === gender ? ' is-on' : '')
                        }
                      >
                        <span className="mk" />
                        <span>{gender}</span>
                        <input
                          type="radio"
                          name="gender"
                          checked={data.gender === gender}
                          onChange={() => up('gender', gender)}
                        />
                      </label>
                    ))}
                  </div>
                  {errs.gender && <div className="auth-err">{errs.gender}</div>}
                </div>
                <div className={'auth-field' + (errs.ageGroup ? ' is-error' : '')}>
                  <label>
                    年龄段 <span className="hint">必填</span>
                  </label>
                  <select
                    value={data.ageGroup}
                    onChange={(e) => up('ageGroup', e.target.value)}
                  >
                    <option value="">请选择年龄段</option>
                    {AGE_GROUPS.map((age) => (
                      <option key={age}>{age}</option>
                    ))}
                  </select>
                  {errs.ageGroup && <div className="auth-err">{errs.ageGroup}</div>}
                </div>
              </div>

              <div className={'auth-field' + (errs.organization ? ' is-error' : '')}>
                <label>
                  学校/机构 + 专业 <span className="hint">必填</span>
                </label>
                <input
                  value={data.organization}
                  onChange={(e) => up('organization', e.target.value)}
                  placeholder="天津大学 / 计算机科学与技术"
                  maxLength={100}
                />
                {errs.organization && <div className="auth-err">{errs.organization}</div>}
              </div>

              <div className="auth-field-row">
                <div className={'auth-field' + (errs.contact ? ' is-error' : '')}>
                  <label>
                    电话/微信 <span className="hint">必填</span>
                  </label>
                  <input
                    value={data.contact}
                    onChange={(e) => up('contact', e.target.value)}
                    placeholder="手机号或微信号"
                    autoComplete="tel"
                    maxLength={32}
                  />
                  {errs.contact && <div className="auth-err">{errs.contact}</div>}
                </div>
                <div className={'auth-field' + (errs.email ? ' is-error' : '')}>
                  <label>
                    邮箱 <span className="hint">必填</span>
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => up('email', e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    maxLength={100}
                  />
                  <div className="auth-field-meta">
                    <span className="hint">重要通知将通过邮箱和微信群发送</span>
                    {errs.email && <div className="auth-err">{errs.email}</div>}
                  </div>
                </div>
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

              <div className="auth-field">
                <label>
                  个人简历 <span className="hint">可选</span>
                </label>
                <textarea
                  rows={4}
                  value={data.resume}
                  onChange={(e) => up('resume', e.target.value)}
                  placeholder="简历链接、作品集、个人主页，或一段简短介绍。"
                  maxLength={500}
                />
                <div className="auth-field-meta">
                  <span className="hint">{data.resume.length} / 500</span>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className={'auth-field' + (errs.skills ? ' is-error' : '')}>
                <label>
                  你擅长的技术或产品技能 <span className="hint">必填</span>
                </label>
                <div className="auth-skill-grid">
                  {SKILL_OPTIONS.map((option, index) => {
                    const selected = data.skills.includes(option.v);
                    return (
                      <button
                        type="button"
                        key={option.v}
                        className={'auth-skill-card' + (selected ? ' is-on' : '')}
                        onClick={() => toggleSkill(option.v)}
                      >
                        <span className="glyph">{option.glyph}</span>
                        <span className="meta">
                          <span>{option.lbl}</span>
                          <span>{index + 1}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <input
                  value={data.skillsOther}
                  onChange={(e) => up('skillsOther', e.target.value)}
                  placeholder="补充具体技术栈，例如 React、LLM Agent、Arduino、路演等。"
                  maxLength={240}
                />
                <div className="auth-field-meta">
                  <span className="hint">可多选，也可只填写补充说明</span>
                  <span className="hint">{data.skillsOther.length} / 240</span>
                  {errs.skills && <div className="auth-err">{errs.skills}</div>}
                </div>
              </div>

              <div className="auth-field">
                <label>
                  用几个关键词形容自己 <span className="hint">可选</span>
                </label>
                <input
                  value={data.keywords}
                  onChange={(e) => up('keywords', e.target.value)}
                  placeholder="好奇、执行快、会讲故事"
                  maxLength={120}
                />
              </div>

              <div className="auth-field">
                <label>
                  请列出你过去的活动/项目/奖项 <span className="hint">不限</span>
                </label>
                <textarea
                  rows={6}
                  value={data.projects}
                  onChange={(e) => up('projects', e.target.value)}
                  placeholder="项目名称 + 你的角色 + 结果，简单列出即可。"
                  maxLength={800}
                />
                <div className="auth-field-meta">
                  <span className="hint">{data.projects.length} / 800</span>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={'auth-field' + (errs.why ? ' is-error' : '')}>
                <label>
                  你为什么想要参加这次世界智能产业博览会·智能创新黑客松大赛？
                  <span className="hint">必填</span>
                </label>
                <textarea
                  rows={5}
                  value={data.why}
                  onChange={(e) => up('why', e.target.value)}
                  placeholder="告诉我们你想来的原因。"
                  maxLength={800}
                />
                <div className="auth-field-meta">
                  <span className="hint">{data.why.length} / 800</span>
                  {errs.why && <div className="auth-err">{errs.why}</div>}
                </div>
              </div>

              <div className={'auth-field' + (errs.nonstandard ? ' is-error' : '')}>
                <label>
                  你觉得自己身上最“不像标准答案”的地方是什么？
                  <span className="hint">必填</span>
                </label>
                <textarea
                  rows={5}
                  value={data.nonstandard}
                  onChange={(e) => up('nonstandard', e.target.value)}
                  placeholder="一个特质、一段经历，或一个你长期在意的问题。"
                  maxLength={800}
                />
                <div className="auth-field-meta">
                  <span className="hint">{data.nonstandard.length} / 800</span>
                  {errs.nonstandard && <div className="auth-err">{errs.nonstandard}</div>}
                </div>
              </div>

              <div className="auth-field">
                <label>
                  你认为这个时代更缺“答案”，还是更缺“好问题”？为什么？
                  <span className="hint">可选</span>
                </label>
                <textarea
                  rows={5}
                  value={data.answerOrQuestion}
                  onChange={(e) => up('answerOrQuestion', e.target.value)}
                  placeholder="写下你的判断和理由。"
                  maxLength={800}
                />
                <div className="auth-field-meta">
                  <span className="hint">{data.answerOrQuestion.length} / 800</span>
                </div>
              </div>

              <div className="auth-field">
                <label>
                  在一个不再以“生存”为前提的社会中，人类仍然需要“做事”吗？如果需要，这些事的价值来自哪里？
                  <span className="hint">可选</span>
                </label>
                <textarea
                  rows={5}
                  value={data.postScarcityWork}
                  onChange={(e) => up('postScarcityWork', e.target.value)}
                  placeholder="写下你的想法。"
                  maxLength={1000}
                />
                <div className="auth-field-meta">
                  <span className="hint">{data.postScarcityWork.length} / 1000</span>
                </div>
              </div>

              <div
                className={
                  'auth-field auth-field-agree' +
                  (errs.availability ? ' is-error' : '')
                }
              >
                <label>
                  你是否能完整参加黑客松主要赛程？
                  <span className="hint">必填</span>
                </label>
                <div className="auth-chip-group">
                  {ATTENDANCE_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className={
                        'auth-chip' +
                        (data.availability === option ? ' is-on' : '')
                      }
                    >
                      <span className="mk" />
                      <span>{option}</span>
                      <input
                        type="radio"
                        name="availability"
                        checked={data.availability === option}
                        onChange={() => up('availability', option)}
                      />
                    </label>
                  ))}
                </div>
                {errs.availability && <div className="auth-err">{errs.availability}</div>}
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
                    我确认以上信息真实有效，并同意主办方仅将这些信息用于本次活动报名、筛选、通知与组织工作。
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
                <span>{submitting ? '提交中…' : '提交问卷'}</span>
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
