import Countdown from './Countdown.jsx';

export default function About() {
  return (
    <section className="section light" id="about">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 01 / 缘起</div>
            <div className="chapter-num" data-parallax="0.08">01</div>
          </div>
          <h2 className="title" data-parallax="-0.04">
            四十八小时。<br />
            一个离谱到可行的点子。
          </h2>
        </div>

        <div className="about-grid">
          <div className="reveal">
            <p className="about-lede">
              BOHACK 是一场写给全国高校造物者的黑客松——把<span className="hl">5.22—5.31</span>当一道
              开卷题来做。带上你的笔记本、朋友,还有那个<span className="hl">还没想清楚</span>的念头。
              剩下的——三餐、导师、孵化辅导、<span className="hl">智博会展演</span>——都交给我们。
            </p>
          </div>
          <div className="about-side reveal" data-stagger="true">
            <p>
              十六所高校,六百名学生,先在 5 月 22—24 日完成 48 小时线下创作,
              再进入 5 月 24—28 日项目孵化辅导阶段。
            </p>
            <p>
              你会做出一件真正跑得起来的东西——跑在芯片上、跑在服务器上,也跑上
              5 月 28—31 日国家会展中心世界智能产业博览会的线下展演舞台。
            </p>
            <div className="about-stats">
              <div className="s"><div className="n">600</div><div className="t">学生黑客</div></div>
              <div className="s"><div className="n">16</div><div className="t">合作高校</div></div>
              <div className="s"><div className="n">¥50K+</div><div className="t">总奖金池</div></div>
              <div className="s"><div className="n">∞</div><div className="t">冷萃咖啡</div></div>
            </div>
          </div>
        </div>

        <Countdown />
      </div>
    </section>
  );
}
