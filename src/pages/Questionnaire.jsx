import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMagnet } from '../hooks/useMagnet.js';

const QUESTIONS = [
  {
    kind: 'single',
    section: '身份',
    key: 'exp',
    q: '你的黑客经验怎么样?',
    hint: '没有对错答案 —— 每个级别我们都有相应赛道。',
    options: [
      { v: 'first', lbl: '第一次参加', sub: '从没黑过' },
      { v: 'some', lbl: '有几次经验', sub: '1—3 次黑客松' },
      { v: 'many', lbl: '常在圈里跑', sub: '4—10 次黑客松' },
      { v: 'pro', lbl: '基本就是职业选手', sub: '10 次以上' },
    ],
  },
  {
    kind: 'svg',
    section: '角色',
    key: 'role',
    q: '你给团队带来什么?',
    hint: '选最接近的一个。周末你依然可以同时戴多顶帽子。',
    options: [
      { v: 'eng', lbl: '工程', glyph: '{ }' },
      { v: 'des', lbl: '设计', glyph: 'A◆' },
      { v: 'hw', lbl: '硬件', glyph: '⬢' },
      { v: 'pm', lbl: '产品', glyph: '△' },
      { v: 'res', lbl: '研究', glyph: '∑' },
      { v: 'viz', lbl: '创作 / 影像', glyph: '✦' },
    ],
  },
  {
    kind: 'multi',
    section: '兴趣',
    key: 'tracks',
    q: '你对哪些赛道感兴趣?',
    hint: '可多选。我们会据此为你匹配导师和赛前资料。',
    options: [
      { v: 'ai', lbl: '环境智能', sub: 'Agents · 助理' },
      { v: 'ci', lbl: '城市基建', sub: '交通 · 住房 · 投票' },
      { v: 'hw', lbl: '硬件朋克', sub: '烙铁 · 胶带' },
      { v: 'ct', lbl: '创作工具', sub: '音乐 · 文字 · 像素' },
      { v: 'ce', lbl: '气候与地球', sub: '传感器 · 数据集' },
      { v: 'wc', lbl: 'Wildcard', sub: '奇怪是一种褒义' },
    ],
  },
  {
    kind: 'slider',
    section: '兴趣',
    key: 'risk',
    q: '0 到 100,你的项目应该有多"怪"?',
    hint: '0 是"下周一上线";100 是"可能电到人的艺术装置"。',
    min: 0,
    max: 100,
    step: 5,
    default: 65,
  },
  {
    kind: 'chips',
    section: '工具',
    key: 'tools',
    q: '你真正喜欢用什么?',
    hint: '可多选,也可以跳过。仅用于导师匹配,不做评判。',
    options: [
      'Python',
      'TypeScript',
      'Rust',
      'Swift',
      'C/C++',
      'Go',
      'Arduino',
      'Raspberry Pi',
      'Figma',
      'Blender',
      'TouchDesigner',
      'Ableton',
      'Pandas',
      'PyTorch',
      'Three.js',
      'Unity',
      '电缆与烙铁',
      '纸和笔',
    ],
  },
  {
    kind: 'single',
    section: '组队',
    key: 'team',
    q: '组队情况如何?',
    hint: '单飞的话,周五我们会在组队舞台给你配对。',
    options: [
      { v: 'solo', lbl: '单飞 · 帮我匹配', sub: '我们为你匹配互补的人选' },
      { v: 'part', lbl: '已有部分队友', sub: '1—3 人,缺人' },
      { v: 'full', lbl: '满编 4 人', sub: '一切就绪' },
    ],
  },
  {
    kind: 'text',
    section: '想法',
    key: 'why',
    q: '这个周末你想造什么?',
    hint: '草图、半个想法、愤怒的吐槽都欢迎。至少 40 个字符,我们每一条都会读。',
    min: 40,
    max: 500,
  },
];

const SECTIONS = ['身份', '角色', '兴趣', '工具', '组队', '想法'];

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
  const [ans, setAns] = useState({
    tracks: ['ai'],
    tools: ['Python', 'Figma'],
    risk: 65,
  });
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.body.classList.add('q-body');
    return () => document.body.classList.remove('q-body');
  }, []);

  const q = QUESTIONS[i];
  const total = QUESTIONS.length;
  const pct = done ? 1 : i / total;

  const canNext = useCallback(() => {
    if (!q) return true;
    const v = ans[q.key];
    if (q.kind === 'multi') return Array.isArray(v) && v.length > 0;
    if (q.kind === 'chips') return true;
    if (q.kind === 'slider') return true;
    if (q.kind === 'text')
      return typeof v === 'string' && v.length >= (q.min || 1);
    return v !== undefined;
  }, [q, ans]);

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

  const skip = () => {
    if (i >= total - 1) setDone(true);
    else setI(i + 1);
  };

  const up = (k, v) => setAns((a) => ({ ...a, [k]: v }));
  const toggleMulti = (k, v) =>
    setAns((a) => ({
      ...a,
      [k]: (a[k] || []).includes(v)
        ? a[k].filter((x) => x !== v)
        : [...(a[k] || []), v],
    }));

  useEffect(() => {
    const onKey = (e) => {
      if (done) return;
      if (e.key === 'Enter' && canNext()) next();
      if (e.key === 'Backspace' && e.metaKey) back();
      if (i < total && q) {
        if ((q.kind === 'single' || q.kind === 'svg') && /^[1-9]$/.test(e.key)) {
          const n = parseInt(e.key, 10) - 1;
          if (q.options[n]) setAns((a) => ({ ...a, [q.key]: q.options[n].v }));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, canNext, next, back, i, total, q]);

  const sectionStatus = (name) => {
    const firstIdx = QUESTIONS.findIndex((x) => x.section === name);
    const lastIdx = QUESTIONS.map((x) => x.section).lastIndexOf(name);
    if (done) return 'done';
    if (i > lastIdx) return 'done';
    if (i >= firstIdx && i <= lastIdx) return 'cur';
    return '';
  };

  const today = useMemo(() => new Date().toLocaleDateString('zh-CN'), []);

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
              Questionnaire
            </div>
            <div className="q-title" style={{ marginTop: 10 }}>
              告诉我们
              <br />
              <em>你是谁。</em>
            </div>
            <p className="q-sub">
              七个小问题,帮我们把你和合适的导师、赛道与伙伴匹配起来。约 3 分钟。
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
          <div>Autosaved · {today}</div>
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
            Questionnaire · {done ? '已完成' : `Q${i + 1} / ${total}`}
          </span>
        </div>

        {!done && q && (
          <div className="q-card">
            <div className="q-step-label">
              {q.section} · 第 {i + 1} 题
            </div>
            <h1 className="q-question">{q.q}</h1>
            {q.hint && <p className="q-hint">{q.hint}</p>}

            {q.kind === 'single' && (
              <div className="q-options">
                {q.options.map((o, n) => (
                  <label
                    key={o.v}
                    className={'q-opt' + (ans[q.key] === o.v ? ' on' : '')}
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
                      checked={ans[q.key] === o.v}
                      onChange={() => up(q.key, o.v)}
                    />
                  </label>
                ))}
              </div>
            )}

            {q.kind === 'multi' && (
              <div className="q-options">
                {q.options.map((o, n) => {
                  const arr = ans[q.key] || [];
                  const on = arr.includes(o.v);
                  return (
                    <label
                      key={o.v}
                      className={'q-opt multi' + (on ? ' on' : '')}
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
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleMulti(q.key, o.v)}
                      />
                    </label>
                  );
                })}
              </div>
            )}

            {q.kind === 'svg' && (
              <div className="q-svg-grid">
                {q.options.map((o, n) => (
                  <button
                    type="button"
                    key={o.v}
                    className={'q-svg' + (ans[q.key] === o.v ? ' on' : '')}
                    onClick={() => up(q.key, o.v)}
                  >
                    <div className="glyph">{o.glyph}</div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span className="n">{o.lbl}</span>
                      <span className="n" style={{ opacity: 0.5 }}>
                        {n + 1}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {q.kind === 'slider' &&
              (() => {
                const v = ans[q.key] ?? q.default ?? 50;
                const sliderPct = ((v - q.min) / (q.max - q.min)) * 100;
                return (
                  <div className="q-slider">
                    <div className="q-slider-val">
                      {v}
                      <span
                        style={{
                          fontSize: 24,
                          opacity: 0.4,
                          marginLeft: 6,
                        }}
                      >
                        / {q.max}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={q.min}
                      max={q.max}
                      step={q.step}
                      value={v}
                      style={{ '--p': sliderPct + '%' }}
                      onChange={(e) => up(q.key, parseInt(e.target.value, 10))}
                    />
                    <div className="q-slider-row">
                      <span>下周一就能上线</span>
                      <span>可能会电到人</span>
                    </div>
                  </div>
                );
              })()}

            {q.kind === 'chips' && (
              <div className="q-chips">
                {q.options.map((o) => {
                  const on = (ans[q.key] || []).includes(o);
                  return (
                    <button
                      type="button"
                      key={o}
                      className={'q-chip' + (on ? ' on' : '')}
                      onClick={() => toggleMulti(q.key, o)}
                    >
                      {o}
                      <span className="x">{on ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {q.kind === 'text' && (
              <div className="q-text">
                <textarea
                  rows={6}
                  value={ans[q.key] || ''}
                  onChange={(e) => up(q.key, e.target.value)}
                  placeholder="一句话、一段话,或者一串动词 —— 都可以。"
                  maxLength={q.max}
                />
                <div className="q-meta">
                  <span>
                    {(ans[q.key] || '').length < (q.min || 0)
                      ? `还差 ${(q.min || 0) - (ans[q.key] || '').length} 字`
                      : '看起来不错。'}
                  </span>
                  <span>
                    {(ans[q.key] || '').length} / {q.max}
                  </span>
                </div>
              </div>
            )}

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
                {q.kind !== 'single' &&
                  q.kind !== 'svg' &&
                  q.kind !== 'multi' &&
                  q.kind !== 'text' && (
                    <button
                      type="button"
                      className="auth-ghost magnet"
                      onClick={skip}
                    >
                      跳过
                    </button>
                  )}
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
                  {i === total - 1 ? '提交' : '下一题'}{' '}
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
              <em>机库见。</em>
            </h1>
            <p>
              我们会在 5 月 22 日线下黑客松启动前,用你的回答为你匹配导师和预习资料。你可以随时从控制台修改。
            </p>
            <div className="q-summary">
              <div className="s">
                <div className="k">经验</div>
                <div className="v">
                  {QUESTIONS[0].options.find((o) => o.v === ans.exp)?.lbl ||
                    '—'}
                </div>
              </div>
              <div className="s">
                <div className="k">角色</div>
                <div className="v">
                  {QUESTIONS[1].options.find((o) => o.v === ans.role)?.lbl ||
                    '—'}
                </div>
              </div>
              <div className="s">
                <div className="k">赛道</div>
                <div className="v">
                  {(ans.tracks || [])
                    .map(
                      (v) =>
                        QUESTIONS[2].options.find((o) => o.v === v)?.lbl
                    )
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </div>
              </div>
              <div className="s">
                <div className="k">怪度</div>
                <div className="v">{ans.risk ?? 65} / 100</div>
              </div>
              <div className="s">
                <div className="k">工具</div>
                <div className="v">
                  {(ans.tools || []).slice(0, 4).join(' · ') || '—'}
                  {(ans.tools || []).length > 4
                    ? ` + ${(ans.tools || []).length - 4}`
                    : ''}
                </div>
              </div>
              <div className="s">
                <div className="k">组队</div>
                <div className="v">
                  {QUESTIONS[5].options.find((o) => o.v === ans.team)?.lbl ||
                    '—'}
                </div>
              </div>
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
