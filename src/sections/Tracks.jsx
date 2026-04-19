const TRACKS = [
  {
    num: '01',
    glyph: '◢',
    title: '环境智能 · Ambient Intelligence',
    desc: '能读懂空间、理解场景的智能体与助理。欢迎 LLM,但要够新意。',
    prize: '¥10K 头奖',
  },
  {
    num: '02',
    glyph: '◎',
    title: '城市基础设施 · Civic Infrastructure',
    desc: '为交通、住房、投票,以及所有每周一就崩溃的系统设计的工具。',
    prize: '¥8K + 试点资助',
  },
  {
    num: '03',
    glyph: '▲',
    title: '硬件朋克 · Hardware Punk',
    desc: '焊的、3D 打印的、胶带粘的。只要会闪、会叫、会磕到手,就算数。',
    prize: '¥8K + 实验室权限',
  },
  {
    num: '04',
    glyph: '✦',
    title: '创作工具 · Creative Tools',
    desc: '为创作者设计的乐器——音乐、代码、文本、像素。重新发明一条工作流。',
    prize: '¥6K + 驻留机会',
  },
  {
    num: '05',
    glyph: '◐',
    title: '气候与地球 · Climate & Earth',
    desc: '传感器、仿真、数据集。为一个更热、更奇怪的星球建构。',
    prize: '¥6K + 田野考察',
  },
  {
    num: '06',
    glyph: '✺',
    title: '百搭 · Wildcard',
    desc: '什么都不属于的项目的赛道。在这里,“奇怪”是一种褒义词。',
    prize: '¥5K + 吹牛权利',
  },
];

export default function Tracks() {
  return (
    <section className="section dark" id="tracks">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 02 / 瞄准何处</div>
            <div className="chapter-num">02</div>
          </div>
          <h2 className="title">
            六条赛道。<br />
            挑一条,把它打破。
          </h2>
        </div>
        <div className="tracks reveal" data-stagger="true">
          {TRACKS.map((t) => (
            <div className="track" key={t.num}>
              <div>
                <div className="track-num">Track / {t.num}</div>
                <div className="track-glyph">{t.glyph}</div>
              </div>
              <div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <span className="prize-chip">{t.prize}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
