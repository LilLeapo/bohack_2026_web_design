const SUPPORTS = [
  {
    rank: '资源支持',
    title: ['开发所需的', '基础资源'],
    label:
      '组委会将提供基础硬件材料、算力资源、开发支持和现场保障，帮助团队更高效地完成项目开发。',
  },
  {
    rank: '导师赋能',
    title: ['技术、产品', '与商业辅导'],
    label:
      '来自技术、产品、创业、产业和投资方向的导师，将围绕项目实现、产品表达、商业逻辑和路演展示提供辅导。',
  },
  {
    rank: '世界级舞台',
    title: ['登上世界', '智博会现场'],
    label:
      '优秀项目将进入2026世界智能产业博览会现场，参与展览、路演和评比，与产业资源、投资机构和专业观众面对面交流。',
  },
  {
    rank: '破圈曝光',
    title: ['让作品被', '更多人看见'],
    label:
      '项目有机会获得媒体关注、现场展示、企业资源对接和后续孵化支持，让作品被更多人看见。',
  },
  {
    rank: '奖励与机会',
    title: ['奖金、资源', '与持续孵化'],
    label:
      '多重奖金、产业资源、破圈流量与持续孵化机会，将共同助力优秀项目继续成长。',
  },
];

export default function Prizes() {
  return (
    <section className="section light" id="prizes">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 03 / 选手将获得什么</div>
            <div className="chapter-num" data-parallax="0.08">03</div>
          </div>
          <div className="title-block" data-parallax="-0.04">
            <h2 className="title">你将获得什么？</h2>
            <p className="section-subtitle">
              为每一份创意平稳着陆，提供资源、舞台与后续连接。
            </p>
          </div>
        </div>

        <div className="prizes reveal" data-stagger="true">
          {SUPPORTS.map((item, index) => (
            <article className={'prize' + (index === 0 ? ' gold' : '')} key={item.rank}>
              <div className="rank">{item.rank}</div>
              <div>
                <div className="amt">
                  {item.title.map((part) => (
                    <span className="amt-seg" key={part}>{part}</span>
                  ))}
                </div>
                <div className="label" style={{ marginTop: 16 }}>{item.label}</div>
              </div>
              <div className="deco" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
