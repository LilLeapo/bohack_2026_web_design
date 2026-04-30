import { Fragment } from 'react';

const DAYS = [
  {
    n: '报名阶段',
    t: '即日起开放报名。',
    rows: [
      { time: '即日起', title: '名额有限，滚动录取，先到先得。', tag: '报名' },
    ],
  },
  {
    n: '5月22日 16:00',
    t: '线下签到入场',
    rows: [
      { time: '地点', title: '天开高教科创园', tag: '签到' },
      { time: '现场', title: '完成签到、组队确认、赛道确认与规则说明。', tag: '确认' },
    ],
  },
  {
    n: '5月22日—5月24日',
    t: '42小时线下黑客松',
    rows: [
      { time: '42小时', title: '在此时空，拒绝虚浮辞藻，只致敬真实力量。', tag: '开发' },
      { time: 'Demo', title: '在42小时内，完成从想法到 Demo 的跨越。', tag: '产出' },
      { time: '真实', title: '它未必完美，但必须真实。', tag: '标准' },
    ],
  },
  {
    n: '5月24日—5月28日',
    t: '线上项目打磨与赋能',
    rows: [
      { time: '赋能', title: '围绕产品完善、用户运营、技术更新、路演展示展开深度赋能。', tag: '打磨' },
      { time: '作品', title: '比起完成一场比赛，我们更希望陪你雕琢一件真正的作品。', tag: '进化' },
    ],
  },
  {
    n: '5月28日—5月31日',
    t: '世界智能产业博览会现场展演',
    rows: [
      { time: '舞台', title: '经过洗礼的创新火种，将在2026世界智能产业博览会的舞台上与产业巨头同台共振。', tag: '展演' },
      { time: '现场', title: '展览、路演、评比、资源对接，在主流媒体与专业机构的注视中，让作品被世界看见。', tag: '连接' },
    ],
  },
];

export default function Schedule() {
  return (
    <section className="section light" id="schedule">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 04 / 活动流程</div>
            <div className="chapter-num" data-parallax="0.08">04</div>
          </div>
          <div className="title-block" data-parallax="-0.04">
            <h2 className="title">活动流程</h2>
            <p className="section-subtitle">从42小时极限开发，到世界智博会现场展演。</p>
          </div>
        </div>

        <div className="schedule-timeline reveal">
          {DAYS.map((day, di) => (
            <Fragment key={di}>
              <div className="day-header">
                <div className="dn">{day.n}</div>
                <div className="dt">{day.t}</div>
              </div>
              {day.rows.map((r, i) => (
                <div className="sch-row" key={i}>
                  <div className="sch-time">{r.time}</div>
                  <div className="sch-dot" />
                  <div className="sch-title">{r.title}</div>
                  <div className="sch-tag">{r.tag}</div>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
