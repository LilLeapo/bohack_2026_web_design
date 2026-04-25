import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMagnet } from '../hooks/useMagnet.js';
import {
  api,
  clearAuthSession,
  getAccessToken,
  userFacingError,
} from '../lib/api.js';

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

const TABS = [
  { id: 'overview', label: '总览' },
  { id: 'team', label: '我的队' },
  { id: 'schedule', label: '日程' },
  { id: 'project', label: '项目' },
  { id: 'support', label: '支持' },
];

const TIMELINE = [
  { t: '04/02', l: '提交申请', s: 'done' },
  { t: '04/11', l: '通过审核 · 欢迎加入', s: 'done' },
  { t: '04/23', l: '今日 · 组队通道开启', s: 'now' },
  { t: '05/22', l: '线下黑客松启动', s: 'todo' },
  { t: '05/24', l: '项目提交 · 进入孵化辅导阶段', s: 'todo' },
  { t: '05/24—28', l: '基金与风投机构辅导赋能', s: 'todo' },
  { t: '05/28—31', l: '国家会展中心智博会线下展演', s: 'todo' },
];

const PREP_ITEMS = [
  { id: '01', title: '完成报名问卷', meta: '用于赛道与导师匹配', status: '必做' },
  { id: '02', title: '确认联系方式', meta: '邮箱、学校、手机号保持最新', status: '待确认' },
  { id: '03', title: '关注赛前通知', meta: '5 月 22 日前会同步签到和分组安排', status: '即将发布' },
];

const STATUS_LABELS = {
  draft: '草稿',
  submitted: '已提交',
  under_review: '审核中',
  approved: '已通过',
  rejected: '未通过',
  cancelled: '已取消',
};

function parseExtra(registration) {
  if (!registration?.extra) return {};
  if (typeof registration.extra === 'string') {
    try {
      return JSON.parse(registration.extra);
    } catch {
      return {};
    }
  }
  return registration.extra;
}

function initialsFrom(value) {
  const text = (value || '黑客').trim();
  const chars = Array.from(text.replace(/\s+/g, ''));
  return chars.slice(0, 2).join('').toUpperCase();
}

export default function User() {
  useMagnet();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [me, setMe] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [err, setErr] = useState('');
  const target = useMemo(() => new Date(2026, 4, 22, 9, 0, 0).getTime(), []);
  const cd = useCountdown(target);

  useEffect(() => {
    document.body.classList.add('dash-body');
    return () => document.body.classList.remove('dash-body');
  }, []);

  useEffect(() => {
    let alive = true;

    if (!getAccessToken()) {
      navigate('/login', { replace: true });
      return () => {
        alive = false;
      };
    }

    async function loadUser() {
      setLoading(true);
      setErr('');

      try {
        const [user, registrationStatus] = await Promise.all([
          api.me(),
          api.registrationStatus().catch((error) => {
            if (error.status === 404) return null;
            throw error;
          }),
        ]);

        if (!alive) return;
        setMe(user);
        setRegistration(registrationStatus);
      } catch (error) {
        if (!alive) return;
        if (error.status === 401) {
          clearAuthSession();
          navigate('/login', { replace: true });
          return;
        }
        setErr(userFacingError(error));
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadUser();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const pad = (n) => String(n).padStart(2, '0');
  const extra = parseExtra(registration);
  const name = registration?.realName || me?.username || '黑客';
  const initials = initialsFrom(name);
  const appId = registration?.id
    ? `BH26-${String(registration.id).padStart(4, '0')}`
    : '未提交';
  const statusLabel = registration
    ? STATUS_LABELS[registration.status] || registration.status
    : '未提交';
  const tracks = Array.isArray(extra.tracks) && extra.tracks.length
    ? extra.tracks.join(' / ')
    : '待确认';
  const team = registration?.teamName || extra.teamStatus || '待组队';
  const role = registration?.rolePreference || extra.experienceLevel || '待确认';
  const tshirt = extra.tshirt || '待确认';

  const currentTab = TABS.find((x) => x.id === tab);
  const signOut = (event) => {
    event.preventDefault();
    clearAuthSession();
    navigate('/login');
  };
  const downloadCertificate = async () => {
    if (!registration) {
      setErr('请先完成报名后再下载证件。');
      return;
    }

    setCertificateLoading(true);
    try {
      const { blob, filename } = await api.downloadRegistrationCertificate(registration.eventSlug);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErr(userFacingError(error));
    } finally {
      setCertificateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dash">
        <main className="dash-main">
          <div className="dash-card dash-empty">
            <div className="c-label">/ LOADING</div>
            <h1 className="dash-empty-title">
              正在读取
              <br />
              <em>报名状态。</em>
            </h1>
          </div>
        </main>
      </div>
    );
  }

  if (err) {
    return (
      <div className="dash">
        <main className="dash-main">
          <div className="dash-card dash-empty">
            <div className="c-label">/ ERROR</div>
            <h1 className="dash-empty-title">
              无法读取
              <br />
              <em>用户信息。</em>
            </h1>
            <p className="dash-empty-sub">{err}</p>
            <button
              type="button"
              className="auth-submit magnet dash-empty-back"
              onClick={() => window.location.reload()}
            >
              重试 <span className="arrow">↗</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dash">
      <header className="dash-nav">
        <Link to="/" className="dash-brand">
          <img
            src="/BoHack-LOGO.svg"
            alt="BoHack"
            className="dash-brand-logo"
          />
          <span>Bohack · 黑客中心</span>
        </Link>

        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={'tab magnet' + (tab === t.id ? ' on' : '')}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="me">
          <span className="me-name">
            {name} · <span className="me-id">{appId}</span>
          </span>
          <div className="avatar">{initials}</div>
          <a href="/login" className="me-signout" onClick={signOut}>退出</a>
        </div>
      </header>

      <main className="dash-main">
        {tab === 'overview' && (
          <>
            <section className="dash-hero">
              <div className="dash-card dash-welcome-card">
                <div className="dash-welcome">
                  <div>
                    <div className="c-label">你好,黑客</div>
                    <h1 className="dash-welcome-title">
                      欢迎回来,<br />
                      <em>{name}。</em>
                    </h1>
                    <p className="sub">
                      {registration
                        ? '你的 BOHACK 2026 报名信息已同步。请留好时间、带上电脑与充电器。距离线下黑客松启动还有:'
                        : '你还没有提交 BOHACK 2026 报名。完成报名后,这里会显示审核进度。距离线下黑客松启动还有:'}
                    </p>
                  </div>
                  <span className={registration?.status === 'approved' ? 'badge-ok' : 'badge-wait'}>
                    ◆ {statusLabel}
                  </span>
                </div>

                <div className="big-countdown">
                  <div className="bc">
                    <div className="bcn">{pad(cd.d)}</div>
                    <div className="bcl">天</div>
                  </div>
                  <div className="bc">
                    <div className="bcn">{pad(cd.h)}</div>
                    <div className="bcl">小时</div>
                  </div>
                  <div className="bc">
                    <div className="bcn">{pad(cd.m)}</div>
                    <div className="bcl">分钟</div>
                  </div>
                  <div className="bc">
                    <div className="bcn">{pad(cd.s)}</div>
                    <div className="bcl">秒</div>
                  </div>
                </div>
              </div>

              <div className="dash-card status-card">
                <div className="c-label">当前状态</div>
                <div className="status-row">
                  <span className="status-k">报名审核</span>
                  <span className={registration?.status === 'approved' ? 'badge-ok' : 'badge-wait'}>
                    {statusLabel}
                  </span>
                </div>
                <div className="status-row">
                  <span className="status-k">联系邮箱</span>
                  <span className="status-v">{me?.email || '-'}</span>
                </div>
                <div className="status-row">
                  <span className="status-k">学校</span>
                  <span className="status-v">{registration?.school || '待填写'}</span>
                </div>
                <div className="status-row">
                  <span className="status-k">队伍</span>
                  <span className="status-v">{team}</span>
                </div>
                <div className="status-row">
                  <span className="status-k">赛道</span>
                  <span className="status-v">{tracks}</span>
                </div>
                <div className="status-row">
                  <span className="status-k">周边尺码</span>
                  <span className="status-v">{tshirt}</span>
                </div>
                <div className="quick-actions">
                  <Link to="/questionnaire" className="qa magnet">
                    <span className="qk">✎</span>
                    <span className="ql">报名问卷</span>
                  </Link>
                  <button
                    type="button"
                    className="qa magnet"
                    onClick={downloadCertificate}
                    disabled={certificateLoading || !registration}
                  >
                    <span className="qk">↓</span>
                    <span className="ql">
                      {certificateLoading ? '生成中' : '下载证件'}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            <section className="dash-grid">
              <div className="dash-card">
                <div className="section-h">
                  <h2>我的队伍 · {team}</h2>
                  <button type="button" onClick={() => setTab('team')}>
                    管理队伍 →
                  </button>
                </div>
                <div className="team-roster">
                  <div className="member">
                    <div className="av">{initials}</div>
                    <div className="member-meta">
                      <div className="name">{name}</div>
                      <div className="role">{role}</div>
                    </div>
                    <span className="tag">我</span>
                  </div>
                </div>

                <div className="section-h section-h-sp">
                  <h2>重要节点</h2>
                  <button type="button" onClick={() => setTab('schedule')}>
                    完整日程 →
                  </button>
                </div>
                <div className="timeline-list">
                  {TIMELINE.map((r, i) => (
                    <div
                      className={
                        'item ' +
                        (r.s === 'done' ? 'done' : r.s === 'now' ? 'now' : '')
                      }
                      key={`${r.t}-${i}`}
                    >
                      <div className="t">{r.t}</div>
                      <div className="d" />
                      <div className="l">{r.l}</div>
                      <div className="timeline-badge">
                        {r.s === 'now' && (
                          <span className="ticket-status open">进行中</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dash-side">
                {/* Temporarily hidden.
                <div className="project-panel">
                  <div className="c-label c-label-contrast">项目 pitch · 草稿</div>
                  <div className="pt">
                    “一台<br />会读空气的<br />环境智能体。”
                  </div>
                  <span className="track-chip">◢ 环境智能</span>
                  <textarea
                    defaultValue={registration?.note || '这里会同步你的报名 pitch,也可以先写下项目草稿。'}
                  />
                  <div className="project-footer">
                    <span className="save-hint">已自动保存</span>
                    <button type="button" className="auth-submit magnet save-btn">
                      保存草稿 <span className="arrow">↗</span>
                    </button>
                  </div>
                </div>

                <div className="dash-card accent">
                  <div className="c-label">奖金提醒</div>
                  <div className="c-title">
                    ¥25,000
                    <br />
                    总冠军奖金。
                  </div>
                  <p className="accent-body">
                    另加 Boreal Labs 孵化器面谈机会和一尊巨大奖杯。冠军只有一支,也许就是你们。
                  </p>
                </div>
                */}

                <div className="dash-card">
                  <div className="section-h">
                    <h2 className="section-h-sm">赛前清单</h2>
                    <Link to="/questionnaire">完善问卷 →</Link>
                  </div>
                  <div className="tickets">
                    {PREP_ITEMS.map((item, idx) => (
                      <div className="ticket" key={item.id}>
                        <span className="id">{item.id}</span>
                        <div>
                          <div className="tt">{item.title}</div>
                          <div className="th">{item.meta}</div>
                        </div>
                        <span
                          className={'ticket-status' + (idx === 0 ? ' open' : '')}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {tab !== 'overview' && (
          <div className="dash-card dash-empty">
            <div className="c-label">/ {currentTab?.label}</div>
            <h1 className="dash-empty-title">
              <em>{currentTab?.label}</em>
              <br />
              功能即将上线。
            </h1>
            <p className="dash-empty-sub">5 月 22 日前开放</p>
            <button
              type="button"
              className="auth-submit magnet dash-empty-back"
              onClick={() => setTab('overview')}
            >
              回到总览 <span className="arrow">↗</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
