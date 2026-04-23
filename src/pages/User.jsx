import { useEffect, useMemo, useState } from 'react';
import { useMagnet } from '../hooks/useMagnet.js';

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

const TEAM = [
  { i: '李黑', name: '李黑客', role: '队长 · 工程', tag: '我' },
  { i: '陈野', name: '陈野', role: '硬件 · 机器人', tag: '天津大学' },
  { i: '周玥', name: '周玥', role: '设计 · 插画', tag: '中央美院' },
  { i: '汤恒', name: '汤恒', role: '研究 · ML', tag: '清华大学' },
];

const TIMELINE = [
  { t: '04/02', l: '提交申请', s: 'done' },
  { t: '04/11', l: '通过审核 · 欢迎加入', s: 'done' },
  { t: '04/23', l: '今日 · 组队通道开启', s: 'now' },
  { t: '05/05', l: '差旅补贴发放', s: 'todo' },
  { t: '05/18', l: '住宿分配通知', s: 'todo' },
  { t: '05/28', l: '开营 · 签到 (16:00)', s: 'todo' },
  { t: '05/28', l: '开幕仪式 (20:00)', s: 'todo' },
  { t: '05/30', l: '作品提交截止 (12:00)', s: 'todo' },
];

const TICKETS = [
  { id: '#142', title: '替换 USB-C 扩展坞', meta: '2 天前 · 陈野', status: 'open' },
  { id: '#128', title: '饮食:新增无麸质', meta: '已解决 · 5 天前', status: 'closed' },
  { id: '#099', title: '申请额外差旅补贴', meta: '审核中 · 1 周前', status: 'pending' },
];

export default function User() {
  useMagnet();

  const [tab, setTab] = useState('overview');
  const target = useMemo(() => new Date(2026, 4, 28, 9, 0, 0).getTime(), []);
  const cd = useCountdown(target);

  useEffect(() => {
    document.body.classList.add('dash-body');
    return () => document.body.classList.remove('dash-body');
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  const initials = 'LH';
  const name = '李黑客';

  const currentTab = TABS.find((x) => x.id === tab);

  return (
    <div className="dash">
      <header className="dash-nav">
        <a href="#" className="dash-brand">
          <span className="dash-mark" />
          <span>Bohack · 黑客中心</span>
        </a>

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
            {name} · <span className="me-id">BH26-0412</span>
          </span>
          <div className="avatar">{initials}</div>
          <a href="#login" className="me-signout">退出</a>
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
                      你已确认参加 BOHACK 2026。请留好时间、带上电脑与充电器。距离开幕还有:
                    </p>
                  </div>
                  <span className="badge-ok">◆ 已确认</span>
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
                  <span className="badge-ok">已通过</span>
                </div>
                <div className="status-row">
                  <span className="status-k">差旅补贴</span>
                  <span className="badge-ok">已批 · ¥800</span>
                </div>
                <div className="status-row">
                  <span className="status-k">队伍</span>
                  <span className="status-v">Hot Ramen (4/4)</span>
                </div>
                <div className="status-row">
                  <span className="status-k">赛道</span>
                  <span className="status-v">环境智能</span>
                </div>
                <div className="status-row">
                  <span className="status-k">周边尺码</span>
                  <span className="status-v">M · 签到日领取</span>
                </div>
                <div className="status-row">
                  <span className="status-k">住宿</span>
                  <span className="badge-wait">分配中</span>
                </div>
                <div className="quick-actions">
                  <button type="button" className="qa magnet">
                    <span className="qk">⇵</span>
                    <span className="ql">更新饮食</span>
                  </button>
                  <button type="button" className="qa magnet">
                    <span className="qk">↓</span>
                    <span className="ql">下载证件</span>
                  </button>
                </div>
              </div>
            </section>

            <section className="dash-grid">
              <div className="dash-card">
                <div className="section-h">
                  <h2>我的队伍 · Hot Ramen</h2>
                  <a href="#team">管理队伍 →</a>
                </div>
                <div className="team-roster">
                  {TEAM.map((m) => (
                    <div key={m.name} className="member">
                      <div className="av">{m.i}</div>
                      <div className="member-meta">
                        <div className="name">{m.name}</div>
                        <div className="role">{m.role}</div>
                      </div>
                      <span className="tag">{m.tag}</span>
                    </div>
                  ))}
                </div>

                <div className="section-h section-h-sp">
                  <h2>重要节点</h2>
                  <a href="#schedule">完整日程 →</a>
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
                <div className="project-panel">
                  <div className="c-label c-label-contrast">项目 pitch · 草稿</div>
                  <div className="pt">
                    “一台<br />会读空气的<br />环境智能体。”
                  </div>
                  <span className="track-chip">◢ 环境智能</span>
                  <textarea
                    defaultValue="我们想做一台懂宿舍氛围的小设备:根据人在、声音、光线,自动微调灯光、音乐和空调 — 不用 app,靠‘在场感’。48 小时目标是跑通原型 + 3 分钟短片。"
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

                <div className="dash-card">
                  <div className="section-h">
                    <h2 className="section-h-sm">支持工单</h2>
                    <a href="#support">新建 →</a>
                  </div>
                  <div className="tickets">
                    {TICKETS.map((t) => (
                      <div className="ticket" key={t.id}>
                        <span className="id">{t.id}</span>
                        <div>
                          <div className="tt">{t.title}</div>
                          <div className="th">{t.meta}</div>
                        </div>
                        <span
                          className={
                            'ticket-status' + (t.status === 'open' ? ' open' : '')
                          }
                        >
                          {t.status === 'open'
                            ? '处理中'
                            : t.status === 'closed'
                            ? '已关闭'
                            : '审核中'}
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
            <p className="dash-empty-sub">5 月 1 日前开放</p>
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
