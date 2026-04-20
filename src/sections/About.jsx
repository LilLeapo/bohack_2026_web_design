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
              BOHACK 是面向全国高校建设者的黑客松——把<span className="hl">一个周末</span>当作一道
              开卷题来解。带上你的笔记本、朋友,还有半成形的直觉。剩下的——餐食、导师、
              <span className="hl">环绕式混乱</span>——都交给我们。
            </p>
          </div>
          <div className="about-side reveal" data-stagger="true">
            <p>
              十六所高校,六百名学生,一座改建自滨海新区的机库。48 小时高压的创作面板,
              在天津被重新点亮。
            </p>
            <p>
              你会做出一件真正能跑起来的东西——跑在芯片上、跑在服务器上、也跑上舞台——
              最后带着一个 Demo、一支队伍和一段故事离场。
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
