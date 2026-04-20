import { useState } from 'react';

const ITEMS = [
  {
    q: '需要自己组好队才能报名吗?',
    a: '不需要。你可以单人前来——周四 19:00 的组队轮盘会让大多数人在当晚就找到搭子。',
  },
  {
    q: '我从没参加过黑客松,适合我吗?',
    a: '非常适合。我们有专门的新手赛道、新手导师池,以及一笔 ¥2K 的“首秀黑客”专项奖。',
  },
  {
    q: '可以做什么项目?',
    a: '任何 48 小时内能够交付、且契合任一赛道的作品。硬件、软件、艺术、文字、奇怪的实体装置——都接受。',
  },
  {
    q: '路费和住宿怎么安排?',
    a: '合作高校的同学我们覆盖往返大巴,到场后安排在机库隔壁的青年公寓,双人间。',
  },
  {
    q: '真的要连续 48 小时不睡?',
    a: '时钟跑满 48 小时,但你应该睡觉。周五 22:00 开放的安静休息区配有行军床和遮光窗帘。',
  },
  {
    q: '谁来评审?',
    a: '一组来自校友、工程师、高校老师的轮换阵容。完整评委名单将在活动前两周公布。',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section dark" id="faq">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 06 / 待解的问题</div>
            <div className="chapter-num" data-parallax="0.08">06</div>
          </div>
          <h2 className="title" data-parallax="-0.04">
            被问得最多的<br />
            六个问题。
          </h2>
        </div>
        <div className="faq reveal">
          {ITEMS.map((it, i) => (
            <div className={'faq-item' + (open === i ? ' open' : '')} key={i}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{it.q}</span>
                <span className="plus">+</span>
              </button>
              <div className="faq-a">
                <div className="faq-a-inner">{it.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
