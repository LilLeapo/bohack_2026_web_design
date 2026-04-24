import { Fragment } from 'react';

const DAYS = [
  {
    n: 'Phase 01',
    t: '5 月 22—24 日 · 线下黑客松',
    rows: [
      { time: '5/22', title: '入场签到、开幕仪式、组队与开 Hack', tag: '启动' },
      { time: '5/23', title: '48 小时集中构建、导师 Office Hours、工作坊', tag: '构建' },
      { time: '5/24', title: '项目提交、Demo 初评、进入孵化辅导名单', tag: '提交' },
    ],
  },
  {
    n: 'Phase 02',
    t: '5 月 24—28 日 · 项目孵化辅导赋能',
    rows: [
      { time: '5/24', title: '项目梳理与孵化计划确认', tag: '孵化' },
      { time: '5/25—27', title: '基金、风投机构与产业导师辅导,线上线下同步', tag: '辅导' },
      { time: '5/28', title: '展演材料、路演脚本与现场 Demo 彩排', tag: '彩排' },
    ],
  },
  {
    n: 'Phase 03',
    t: '5 月 28—31 日 · 国家会展中心智博会线下展演',
    rows: [
      { time: '5/28', title: '国家会展中心布展、签到与展区预演', tag: '展演' },
      { time: '5/29—30', title: '世界智能产业博览会现场展示、交流与投融资对接', tag: '展会' },
      { time: '5/31', title: '终评、成果发布与闭幕', tag: '收官' },
    ],
  },
];

export default function Schedule() {
  return (
    <section className="section light" id="schedule">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 03 / 时间线</div>
            <div className="chapter-num" data-parallax="0.08">03</div>
          </div>
          <h2 className="title" data-parallax="-0.04">
            三段时间线,<br />
            从 Hack 到展演。
          </h2>
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
