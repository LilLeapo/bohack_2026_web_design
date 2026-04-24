import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMagnet } from '../hooks/useMagnet.js';

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

const QUESTIONS = [
  {
    kind: 'input',
    section: '基础信息',
    key: 'nickname',
    q: '昵称',
    hint: '用于报名沟通、微信群备注和现场识别。',
    required: true,
    placeholder: '例如：小波',
    max: 40,
  },
  {
    kind: 'input',
    section: '基础信息',
    key: 'realName',
    q: '姓名',
    hint: '请填写真实姓名，用于参赛资格确认。',
    required: true,
    placeholder: '例如：李家豪',
    max: 40,
  },
  {
    kind: 'single',
    section: '基础信息',
    key: 'gender',
    q: '性别',
    hint: '仅用于活动统计和服务准备。',
    required: true,
    options: [
      { v: 'male', lbl: '男' },
      { v: 'female', lbl: '女' },
      { v: 'other', lbl: '其他' },
      { v: 'prefer_not_to_say', lbl: '不便透露' },
    ],
  },
  {
    kind: 'single',
    section: '基础信息',
    key: 'ageGroup',
    q: '年龄段',
    hint: '请选择与你当前情况最接近的一项。',
    required: true,
    options: [
      { v: 'under_18', lbl: '18 岁以下' },
      { v: '18_22', lbl: '18-22 岁' },
      { v: '23_26', lbl: '23-26 岁' },
      { v: '27_35', lbl: '27-35 岁' },
      { v: 'over_35', lbl: '36 岁及以上' },
    ],
  },
  {
    kind: 'input',
    section: '基础信息',
    key: 'organization',
    q: '学校/机构 + 专业',
    hint: '例如：天津大学 / 计算机科学与技术。',
    required: true,
    placeholder: '学校或机构 / 专业或方向',
    max: 100,
  },
  {
    kind: 'input',
    section: '基础信息',
    key: 'contact',
    q: '电话/微信',
    hint: '请填写至少一种可联系到你的方式。',
    required: true,
    placeholder: '手机号或微信号',
    max: 32,
  },
  {
    kind: 'input',
    section: '基础信息',
    key: 'email',
    q: '邮箱',
    hint: '请确保您的邮箱能收到消息，未来重要通知将通过邮箱和微信群发送。',
    required: true,
    type: 'email',
    placeholder: 'you@example.com',
    max: 100,
  },
  {
    kind: 'text',
    section: '基础信息',
    key: 'resume',
    q: '个人简历',
    hint: '可填写简历链接、作品集链接，或简单介绍你的经历。',
    required: false,
    placeholder: '简历链接、作品集、个人主页，或一段简短介绍。',
    max: 500,
  },
  {
    kind: 'skillCards',
    section: '技能信息',
    key: 'skills',
    extraKey: 'skillsOther',
    q: '你擅长的技术或产品技能',
    hint: '可多选。选出你能带进团队的主要能力，也可以补充具体技术栈。',
    required: true,
    options: SKILL_OPTIONS,
    placeholder: '补充具体技术栈，例如 React、LLM Agent、Arduino、路演等。',
    max: 240,
  },
  {
    kind: 'input',
    section: '技能信息',
    key: 'keywords',
    q: '用几个关键词形容自己',
    hint: '可选。用逗号、空格或短句都可以。',
    required: false,
    placeholder: '例如：好奇、执行快、会讲故事',
    max: 120,
  },
  {
    kind: 'text',
    section: '技能信息',
    key: 'projects',
    q: '请列出你过去的活动/项目/奖项',
    hint: '不限类型。黑客松、课程项目、创业项目、论文、比赛、社团经历都可以。',
    required: false,
    placeholder: '项目名称 + 你的角色 + 结果，简单列出即可。',
    max: 800,
  },
  {
    kind: 'text',
    section: '思考问题',
    key: 'why',
    q: '你为什么想要参加这次世界智能产业博览会·智能创新黑客松大赛？',
    hint: '请写出你的真实动机：你期待遇见什么、验证什么、创造什么。',
    required: true,
    placeholder: '告诉我们你想来的原因。',
    max: 800,
  },
  {
    kind: 'text',
    section: '思考问题',
    key: 'nonstandard',
    q: '你觉得自己身上最“不像标准答案”的地方是什么？',
    hint: '我们想看到你的独特性，而不是模板答案。',
    required: true,
    placeholder: '一个特质、一段经历，或一个你长期在意的问题。',
    max: 800,
  },
  {
    kind: 'text',
    section: '思考问题',
    key: 'answerOrQuestion',
    q: '你认为这个时代更缺“答案”，还是更缺“好问题”？为什么？',
    hint: '可选。没有标准立场，关键是你的思考路径。',
    required: false,
    placeholder: '写下你的判断和理由。',
    max: 800,
  },
  {
    kind: 'text',
    section: '思考问题',
    key: 'postScarcityWork',
    q: '在一个不再以“生存”为前提的社会中，人类仍然需要“做事”吗？如果需要，这些事的价值来自哪里？',
    hint: '可选。欢迎理性、诗性、技术性或非常个人的回答。',
    required: false,
    placeholder: '写下你的想法。',
    max: 1000,
  },
  {
    kind: 'single',
    section: '思考问题',
    key: 'availability',
    q: '你是否能完整参加黑客松主要赛程？',
    hint: '主要赛程为线下黑客松、项目辅导与智博会线下展演相关安排。',
    required: true,
    options: [
      { v: 'full', lbl: '可以完整参加' },
      { v: 'mostly', lbl: '大部分时间可以参加' },
      { v: 'partial', lbl: '只能参加部分环节' },
      { v: 'unknown', lbl: '暂不确定' },
    ],
  },
];

const SECTIONS = ['基础信息', '技能信息', '思考问题'];

const QUESTION_GROUPS = [
  {
    section: '基础信息',
    title: '先确认你的基础信息',
    subtitle: '这些信息用于参赛资格确认和现场沟通。',
    keys: ['nickname', 'realName', 'gender', 'ageGroup'],
  },
  {
    section: '基础信息',
    title: '联系方式与背景',
    subtitle: '后续重要通知将通过邮箱和微信群发送。',
    keys: ['organization', 'contact', 'email', 'resume'],
  },
  {
    section: '技能信息',
    title: '技能、关键词与过往经历',
    subtitle: '帮我们理解你能带给团队和赛场的能力。',
    keys: ['skills', 'keywords', 'projects'],
  },
  {
    section: '思考问题',
    title: '参赛动机与独特性',
    subtitle: '这部分会用于参赛资格筛选，请认真填写。',
    keys: ['why', 'nonstandard'],
  },
  {
    section: '思考问题',
    title: '更多思考与赛程确认',
    subtitle: '开放题可选，赛程参与情况必填。',
    keys: ['answerOrQuestion', 'postScarcityWork', 'availability'],
  },
].map((group) => ({
  ...group,
  questions: group.keys.map((key) => QUESTIONS.find((q) => q.key === key)),
}));

const QUESTION_BY_KEY = Object.fromEntries(QUESTIONS.map((q) => [q.key, q]));

function isEmail(value) {
  return /.+@.+\..+/.test(value);
}

function valueText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function optionLabel(question, value) {
  return question.options.find((o) => o.v === value)?.lbl || '';
}

function fieldMessage(question, value) {
  const text = valueText(value);
  if (question.kind === 'skillCards') return '可多选';
  if (!question.required && !text) return '可选';
  if (question.type === 'email' && !isEmail(text)) return '请输入有效邮箱';
  if (question.required && text.length < (question.min || 1)) return '必填';
  return '看起来不错。';
}

function isQuestionValid(question, answers) {
  const value = answers[question.key];
  if (question.kind === 'skillCards') {
    return (
      (Array.isArray(value) && value.length > 0) ||
      valueText(answers[question.extraKey]).length > 0
    );
  }
  if (!question.required) {
    if (question.type === 'email' && valueText(value)) {
      return isEmail(valueText(value));
    }
    return true;
  }
  if (question.kind === 'single') return value !== undefined;
  if (question.type === 'email') return isEmail(valueText(value));
  return valueText(value).length >= (question.min || 1);
}

function formatSkillAnswer(answers) {
  const selected = (answers.skills || [])
    .map((value) => SKILL_OPTIONS.find((option) => option.v === value)?.lbl)
    .filter(Boolean);
  const extra = valueText(answers.skillsOther);
  return [...selected, extra].filter(Boolean).join(' · ');
}

function Ring({ pct }) {
  const C = 2 * Math.PI * 28;
  return (
    <div className="ring">
      <svg viewBox="0 0 72 72">
        <circle
          className="track-c"
          cx="36"
          cy="36"
          r="28"
          strokeWidth="4"
          fill="none"
        />
        <circle
          className="fill"
          cx="36"
          cy="36"
          r="28"
          strokeWidth="4"
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
        />
      </svg>
      <div className="label">{Math.round(pct * 100)}%</div>
    </div>
  );
}

export default function Questionnaire() {
  useMagnet();

  const [i, setI] = useState(0);
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.body.classList.add('q-body');
    return () => document.body.classList.remove('q-body');
  }, []);

  const page = QUESTION_GROUPS[i];
  const total = QUESTION_GROUPS.length;
  const pct = done ? 1 : i / total;

  const canNext = useCallback(() => {
    if (!page) return true;
    return page.questions.every((question) => isQuestionValid(question, ans));
  }, [page, ans]);

  const next = useCallback(() => {
    if (i >= total - 1) setDone(true);
    else setI(i + 1);
  }, [i, total]);

  const back = useCallback(() => {
    if (done) {
      setDone(false);
      setI(total - 1);
    } else if (i > 0) setI(i - 1);
  }, [done, i, total]);

  const up = (k, v) => setAns((a) => ({ ...a, [k]: v }));
  const toggleSkill = (value) =>
    setAns((a) => {
      const current = Array.isArray(a.skills) ? a.skills : [];
      return {
        ...a,
        skills: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });

  useEffect(() => {
    const onKey = (e) => {
      if (done) return;
      const tag = e.target?.tagName;
      if (e.key === 'Enter' && tag !== 'TEXTAREA' && canNext()) next();
      if (e.key === 'Backspace' && e.metaKey) back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, canNext, next, back]);

  const sectionStatus = (name) => {
    const firstIdx = QUESTION_GROUPS.findIndex((x) => x.section === name);
    const lastIdx = QUESTION_GROUPS.map((x) => x.section).lastIndexOf(name);
    if (done) return 'done';
    if (i > lastIdx) return 'done';
    if (i >= firstIdx && i <= lastIdx) return 'cur';
    return '';
  };

  const today = useMemo(() => new Date().toLocaleDateString('zh-CN'), []);

  const summaryItems = [
    ['昵称', ans.nickname],
    ['姓名', ans.realName],
    ['学校/机构', ans.organization],
    ['联系', ans.contact],
    ['技能', formatSkillAnswer(ans)],
    ['赛程', optionLabel(QUESTION_BY_KEY.availability, ans.availability)],
  ];

  return (
    <div className="q-shell">
      <aside className="q-side">
        <div>
          <div className="q-brand">
            <img
              src="/BoHack-LOGO-%E5%8F%8D%E7%99%BD.svg"
              alt="BoHack"
              className="q-brand-logo"
            />
            <span>Bohack · 2026</span>
          </div>
          <div style={{ marginTop: 36 }}>
            <div className="q-step-label" style={{ opacity: 0.6 }}>
              Registration Questionnaire
            </div>
            <div className="q-title" style={{ marginTop: 10 }}>
              报名
              <br />
              <em>问卷。</em>
            </div>
            <p className="q-sub">
              {QUESTIONNAIRE_TITLE}
              <br />
              {INTRO_LINES.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>
          <div className="progress-ring">
            <Ring pct={pct} />
            <div className="progress-text">
              <div className="k">Progress</div>
              <div className="v">
                {done ? '已完成' : `${i + 1} / ${total}`}
              </div>
            </div>
          </div>
          <div className="q-sections">
            {SECTIONS.map((s, idx) => {
              const st = sectionStatus(s);
              return (
                <div
                  key={s}
                  className={'q-sec' + (st ? ' ' + st : '')}
                >
                  <span className="n">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span>{s}</span>
                  <span className="mk" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="q-side-foot">
          <div>Local draft · {today}</div>
          <div style={{ marginTop: 6 }}>
            ← 返回
            <Link
              to="/user"
              style={{
                borderBottom: '1px dashed currentColor',
                color: 'var(--lime)',
                marginLeft: 6,
              }}
            >
              控制台
            </Link>
          </div>
        </div>
      </aside>

      <main className="q-main">
        <div className="q-top">
          <Link to="/user">← 控制台</Link>
          <span>
            Questionnaire · {done ? '已完成' : `Page ${i + 1} / ${total}`}
          </span>
        </div>

        {!done && page && (
          <div className="q-card">
            <div className="q-step-label">
              {page.section} · 第 {i + 1} 页 ·{' '}
              {page.questions.filter((question) => question.required).length} 项必填
            </div>
            <h1 className="q-question">{page.title}</h1>
            <p className="q-hint">{page.subtitle}</p>

            <div className="q-field-stack">
              {page.questions.map((question) => (
                <section className="q-field-block" key={question.key}>
                  <div className="q-field-head">
                    <h2>
                      {question.q}
                      <span>{question.required ? '必填' : '可选'}</span>
                    </h2>
                    {question.hint && <p>{question.hint}</p>}
                  </div>

                  {question.kind === 'single' && (
                    <div className="q-options">
                      {question.options.map((o, n) => (
                        <label
                          key={o.v}
                          className={
                            'q-opt' +
                            (ans[question.key] === o.v ? ' on' : '')
                          }
                        >
                          <span className="key">{n + 1}</span>
                          <span>
                            <span className="lbl" style={{ display: 'block' }}>
                              {o.lbl}
                            </span>
                            {o.sub && <span className="sub">{o.sub}</span>}
                          </span>
                          <span className="mk" />
                          <input
                            type="radio"
                            checked={ans[question.key] === o.v}
                            onChange={() => up(question.key, o.v)}
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  {question.kind === 'input' && (
                    <div className="q-text q-input">
                      <input
                        type={question.type || 'text'}
                        value={ans[question.key] || ''}
                        onChange={(e) => up(question.key, e.target.value)}
                        placeholder={question.placeholder}
                        maxLength={question.max}
                      />
                      <div className="q-meta">
                        <span>{fieldMessage(question, ans[question.key])}</span>
                        {question.max && (
                          <span>
                            {(ans[question.key] || '').length} / {question.max}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {question.kind === 'skillCards' && (
                    <>
                      <div className="q-svg-grid q-skill-grid">
                        {question.options.map((option, n) => {
                          const selected = (ans[question.key] || []).includes(
                            option.v
                          );
                          return (
                            <button
                              type="button"
                              key={option.v}
                              className={'q-svg' + (selected ? ' on' : '')}
                              onClick={() => toggleSkill(option.v)}
                            >
                              <div className="glyph">{option.glyph}</div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <span className="n">{option.lbl}</span>
                                <span className="n" style={{ opacity: 0.5 }}>
                                  {n + 1}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="q-text q-input q-skill-extra">
                        <input
                          value={ans[question.extraKey] || ''}
                          onChange={(e) => up(question.extraKey, e.target.value)}
                          placeholder={question.placeholder}
                          maxLength={question.max}
                        />
                        <div className="q-meta">
                          <span>{fieldMessage(question, ans[question.key])}</span>
                          <span>
                            {(ans[question.extraKey] || '').length} / {question.max}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {question.kind === 'text' && (
                    <div className="q-text">
                      <textarea
                        rows={6}
                        value={ans[question.key] || ''}
                        onChange={(e) => up(question.key, e.target.value)}
                        placeholder={question.placeholder}
                        maxLength={question.max}
                      />
                      <div className="q-meta">
                        <span>{fieldMessage(question, ans[question.key])}</span>
                        {question.max && (
                          <span>
                            {(ans[question.key] || '').length} / {question.max}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>

            <div className="q-actions">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  type="button"
                  className="auth-ghost magnet"
                  onClick={back}
                  disabled={i === 0}
                  style={{ opacity: i === 0 ? 0.4 : 1 }}
                >
                  ← 返回
                </button>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 20 }}
              >
                <span className="kb">
                  <kbd>Enter</kbd> 继续
                </span>
                <button
                  type="button"
                  className="auth-submit magnet"
                  onClick={next}
                  disabled={!canNext()}
                  style={{ opacity: canNext() ? 1 : 0.5 }}
                >
                  {i === total - 1 ? '提交' : '下一页'}{' '}
                  <span className="arrow">↗</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {done && (
          <div className="q-complete">
            <div className="q-step-label" style={{ opacity: 0.7 }}>
              问卷已收到
            </div>
            <h1 style={{ marginTop: 14 }}>
              谢谢。
              <br />
              <em>我们会认真阅读。</em>
            </h1>
            <p>
              后续重要通知将通过邮箱和微信群发送。请保持联系方式可用，并留意活动审核与赛程安排。
            </p>
            <div className="q-summary">
              {summaryItems.map(([label, value]) => (
                <div className="s" key={label}>
                  <div className="k">{label}</div>
                  <div className="v">{valueText(value) || '—'}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 32,
                display: 'flex',
                gap: 12,
                position: 'relative',
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/user"
                className="auth-submit magnet"
                style={{
                  background: 'var(--lime)',
                  color: 'var(--ink)',
                  borderColor: 'var(--lime)',
                }}
              >
                前往控制台 <span className="arrow">↗</span>
              </Link>
              <button
                type="button"
                className="auth-ghost magnet"
                onClick={() => {
                  setDone(false);
                  setI(0);
                }}
                style={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'var(--bone)',
                }}
              >
                修改回答
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
