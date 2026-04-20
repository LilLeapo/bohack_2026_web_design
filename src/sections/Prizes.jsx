export default function Prizes() {
  return (
    <section className="section dark" id="prizes">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 04 / 回报</div>
            <div className="chapter-num" data-parallax="0.08">04</div>
          </div>
          <h2 className="title" data-parallax="-0.04">
            五万元<br />
            现金奖金池。
          </h2>
        </div>

        <div className="prizes reveal" data-stagger="true">
          <div className="prize gold">
            <div>
              <div className="rank">总冠军 / Grand Prize</div>
            </div>
            <div>
              <div className="amt">¥25K</div>
              <div className="label" style={{ marginTop: 16 }}>
                + WIE 孵化器面试直通、导师晚宴、一座大到离谱的实体奖杯。
              </div>
            </div>
            <div className="deco" />
          </div>
          <div className="prize">
            <div className="rank">赛道冠军 × 6</div>
            <div>
              <div className="amt">¥3K</div>
              <div className="label" style={{ marginTop: 8 }}>每条赛道各一名。</div>
            </div>
            <div className="deco" />
          </div>
          <div className="prize">
            <div className="rank">硬件朋克特别奖</div>
            <div>
              <div className="amt">¥2K</div>
              <div className="label" style={{ marginTop: 8 }}>颁给“带闪烁 LED 的最佳作品”。</div>
            </div>
            <div className="deco" />
          </div>
          <div className="prize">
            <div className="rank">人气奖 · People's Choice</div>
            <div>
              <div className="amt">¥3K</div>
              <div className="label" style={{ marginTop: 8 }}>
                由现场 600 位黑客投票产生。
              </div>
            </div>
            <div className="deco" />
          </div>
          <div className="prize">
            <div className="rank">首秀黑客奖</div>
            <div>
              <div className="amt">¥2K</div>
              <div className="label" style={{ marginTop: 8 }}>
                队里全员都是第一次打黑客松——这个奖,就是为你们准备的。
              </div>
            </div>
            <div className="deco" />
          </div>
        </div>
      </div>
    </section>
  );
}
