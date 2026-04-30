const PHASES = [
  {
    kicker: 'Phase 01',
    time: '5月22日—5月24日',
    title: '42小时线下黑客松',
    desc: '参赛者将在42小时内完成项目开发与初步展示，让想法先成为真实可运行的 Demo。',
  },
  {
    kicker: 'Phase 02',
    time: '5月24日—5月28日',
    title: '5昼夜项目赋能',
    desc: '组委会将联合企业、导师和资源方，对项目进行线上赋能、表达训练与持续打磨。',
  },
  {
    kicker: 'Phase 03',
    time: '5月28日—5月31日',
    title: '智博会现场展演',
    desc: '项目进入2026世界智能产业博览会现场，参与展览、路演、评比与资源对接。',
  },
];

const RULES = [
  {
    label: '参赛对象',
    value: '所有创造者开放',
    desc: '高校学生、开发者、设计师、产品经理、创业者，以及智能科技相关方向青年人才都可以报名。',
  },
  {
    label: '组队方式',
    value: '1—4人自由组队',
    desc: '支持个人报名，也支持团队报名。鼓励跨专业、跨领域联动，在碰撞中诞生奇思妙想。',
  },
];

const TRACKS = [
  {
    title: '软件赛道',
    lead: '用代码，让想法真正发生。',
    tags: ['软件系统', 'AI应用', 'AI Agent', '算法工具', 'SaaS产品', '数字内容产品'],
  },
  {
    title: '硬件赛道',
    lead: '让想法被世界触碰。',
    tags: ['智能硬件', '机器人', '传感器', '嵌入式系统', '软硬件结合产品'],
  },
];

export default function Tracks() {
  return (
    <section className="section dark" id="tracks">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 02 / 赛制</div>
            <div className="chapter-num" data-parallax="0.08">02</div>
          </div>
          <div className="title-block" data-parallax="-0.04">
            <h2 className="title">赛制设置</h2>
            <p className="section-subtitle">软件改变逻辑，硬件改变现实。</p>
          </div>
        </div>

        <div className="race-layout reveal" data-stagger="true">
          <div className="race-flow">
            <div className="race-label">三段递进赛制</div>
            <div className="race-phase-grid">
              {PHASES.map((phase) => (
                <article className="race-phase" key={phase.kicker}>
                  <div className="phase-kicker">{phase.kicker}</div>
                  <div className="phase-dot" />
                  <div className="phase-time">{phase.time}</div>
                  <h3>{phase.title}</h3>
                  <p>{phase.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="race-rules">
            {RULES.map((rule) => (
              <article className="race-rule" key={rule.label}>
                <div className="rule-label">{rule.label}</div>
                <h3>{rule.value}</h3>
                <p>{rule.desc}</p>
              </article>
            ))}
          </div>

          <div className="race-track-grid">
            {TRACKS.map((track, index) => (
              <article className={'race-track' + (index === 0 ? ' is-featured' : '')} key={track.title}>
                <div className="race-track-index">{String(index + 1).padStart(2, '0')}</div>
                <div>
                  <h3>{track.title}</h3>
                  <p>{track.lead}</p>
                  <div className="race-track-tags">
                    {track.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
