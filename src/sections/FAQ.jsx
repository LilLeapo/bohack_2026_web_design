import { useState } from 'react';

const ITEMS = [
  {
    q: 'Q1：这是一场什么活动？',
    a: '这是一场面向青年创造者的智能创新黑客松。参赛者将在42小时内完成项目原型，并通过后续赋能进入世界智能产业博览会现场展示。',
  },
  {
    q: 'Q2：谁可以报名？',
    a: '高校学生、开发者、设计师、产品经理、创业者，以及所有对智能科技、AI、软件、硬件和创新实践感兴趣的人都可以报名。',
  },
  {
    q: 'Q3：我只有一个想法，可以参加吗？',
    a: '可以。黑客松正是为了让想法快速落地。你可以带着一个问题、一个方向或一种能力来到现场，与队友一起完成 Demo。',
  },
  {
    q: 'Q4：必须提前组队吗？',
    a: '不必须。你可以个人报名，也可以团队报名。现场将支持自由组队，每队建议1—4人。',
  },
  {
    q: 'Q5：软件背景可以参加硬件赛道吗？',
    a: '可以。我们鼓励“以软赋硬”。只要你的软件、算法或AI能力能够应用到硬件载体中，就可以参与硬件方向。',
  },
  {
    q: 'Q6：项目一定要很成熟吗？',
    a: '不需要。黑客松阶段更看重真实产出和成长潜力。项目可以是可运行 Demo、产品原型、演示视频、硬件样机或系统方案。',
  },
  {
    q: 'Q7：赋能期必须在天津吗？',
    a: '不必须。除5月22日—5月24日线下黑客松建议到场外，后续赋能支持线上协作。博览会展演阶段根据组委会安排现场参加。',
  },
  {
    q: 'Q8：选手可以获得哪些支持？',
    a: '基础硬件材料、算力资源、导师辅导、路演训练、产业资源、媒体曝光、奖金激励和后续孵化机会。',
  },
  {
    q: 'Q9：所有项目都会进入智博会现场吗？',
    a: '所有黑客松的产出项目都会进入智博会现场。',
  },
  {
    q: 'Q10：博览会现场如何展示？',
    a: '现场将包含展览展示、项目路演、终评评比和资源对接。部分项目将参与主舞台路演，其他项目也可通过展位展示进行交流。',
  },
  {
    q: 'Q11：后续是否还有其他项目通道？',
    a: '会有。更多优秀项目展示计划将陆续公布，欢迎持续关注官网与组委会通知。',
  },
  {
    q: 'Q12：活动是否收费？',
    a: '本次活动不收取报名费，参赛者需按组委会要求完成报名审核与现场签到。',
  },
  {
    q: 'Q13：是否提供住宿、餐饮和开发资源？',
    a: '组委会将在活动前公布具体保障安排。黑客松期间将尽力提供基础活动保障、开发交流空间、导师支持和部分资源支持。具体餐饮、住宿、设备、算力、API等支持情况，以组委会后续通知为准。',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section dark" id="faq">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 06 / 答疑 Q&A</div>
            <div className="chapter-num" data-parallax="0.08">06</div>
          </div>
          <div className="title-block" data-parallax="-0.04">
            <h2 className="title">答疑 Q&A</h2>
          </div>
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
