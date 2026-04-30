import Countdown from './Countdown.jsx';

export default function About() {
  return (
    <section className="section light" id="about">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 01 / 关于这场黑客</div>
            <div className="chapter-num" data-parallax="0.08">01</div>
          </div>
          <div className="title-block" data-parallax="-0.04">
            <h2 className="title">从旁观，到主场</h2>
            <p className="section-subtitle">
              这不是一次短跑式比赛，而是一条从想法到作品、从作品到舞台的成长路径。
            </p>
          </div>
        </div>

        <div className="about-grid">
          <div className="reveal">
            <p className="about-lede">
              <span className="hl">2026世界智能产业博览会</span>，汇聚全球智能科技力量，孵化未来的无限可能。
              智能创新黑客松大赛，是其中的<span className="hl">新增板块</span>。
              这一次，我们希望在天津发现更多<span className="hl">敢想、敢做、敢把想法落地</span>的人。
            </p>
          </div>
          <div className="about-side reveal" data-stagger="true">
            <p>
              它面向高校学生、开发者、设计师、产品经理、创业者等所有创造者开放。
            </p>
            <p>
              本次活动以<span className="hl">发现—赋能—绽放</span>为主线：先用<span className="hl">42小时线下黑客松</span>，让想法快速落地；再用<span className="hl">5昼夜深度赋能</span>，让项目持续进化；最后把经过打磨的作品带到<span className="hl">世界智能产业博览会现场</span>，与产业、资本、媒体和更广阔的创新生态相遇。
            </p>
            <p>项目未必完美，但<span className="hl">必须真实</span>。</p>
            <p>这一次，我们寻找下一位<span className="hl">“造物者”</span>。</p>
          </div>
        </div>

        <Countdown />
      </div>
    </section>
  );
}
