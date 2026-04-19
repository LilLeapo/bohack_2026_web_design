import { Fragment } from 'react';

const DAYS = [
  {
    n: 'Day 01',
    t: '5 月 28 日 · 周四',
    rows: [
      { time: '16:00', title: '入场 & 签到', tag: '报到' },
      { time: '18:00', title: '开幕仪式(我们保证不用 PPT)', tag: '直播' },
      { time: '19:00', title: '组队轮盘 · Team Carousel', tag: '社交' },
      { time: '20:00', title: '开 Hack,时钟启动', tag: '构建' },
      { time: '23:30', title: '午夜拉面加油站', tag: '餐饮' },
    ],
  },
  {
    n: 'Day 02',
    t: '5 月 29 日 · 周五',
    rows: [
      { time: '09:00', title: '导师 Office Hours 开放', tag: '导师' },
      { time: '12:00', title: '工作坊:最后 18 小时的交付艺术', tag: '讲座' },
      { time: '16:00', title: '硬件实验室开放参观', tag: '实验' },
      { time: '22:00', title: '安静休息区开门,可以真的睡觉', tag: '休息' },
    ],
  },
  {
    n: 'Day 03',
    t: '5 月 30 日 · 周六',
    rows: [
      { time: '09:00', title: '冲刺日:黑客松进入第 36 小时', tag: '构建' },
      { time: '14:00', title: '硬件演示预演', tag: '演示' },
      { time: '20:00', title: '户外夜场 · 放空与散步', tag: '放松' },
    ],
  },
  {
    n: 'Day 04',
    t: '5 月 31 日 · 周日',
    rows: [
      { time: '08:00', title: '咖啡、慌乱,以及最后的 commit', tag: '构建' },
      { time: '12:00', title: '提交截止——放下键盘', tag: '截止' },
      { time: '14:00', title: '科学展评审(120 个项目)', tag: '评审' },
      { time: '17:00', title: '决赛演示 · 主舞台', tag: '舞台' },
      { time: '19:00', title: '闭幕式 + 颁奖揭晓', tag: '舞台' },
    ],
  },
];

export default function Schedule() {
  return (
    <section className="section light" id="schedule">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 03 / 时钟</div>
            <div className="chapter-num">03</div>
          </div>
          <h2 className="title">
            四天时间。<br />
            像一个漫长的周末。
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
