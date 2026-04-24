export default function Footer() {
  return (
    <footer className="footer" id="apply">
      <div className="container">
        <div className="eyebrow reveal" style={{ marginBottom: 24 }}>
          ◉ 报名截止 / APPLY BY · 2026.05.10
        </div>
        <div className="footer-big reveal">
          BUILD{' '}
          <span className="accent" data-parallax="0.12" data-parallax-rot="-2">
            SOMETHING
          </span>
          <br />
          WEIRD.
        </div>
        <div
          style={{ marginTop: 48, display: 'flex', gap: 20, flexWrap: 'wrap' }}
          className="reveal"
        >
          <a href="#questionnaire" className="btn btn-primary magnet">
            立即报名 BOHACK <span className="arrow">↗</span>
          </a>
          <a href="#" className="btn magnet">
            成为合作伙伴 <span className="arrow">↗</span>
          </a>
        </div>

        <div className="footer-grid">
          <div>
            <h4>活动 / Event</h4>
            <ul>
              <li><a href="#about">简介</a></li>
              <li><a href="#tracks">赛道</a></li>
              <li><a href="#schedule">日程</a></li>
              <li><a href="#prizes">奖项</a></li>
            </ul>
          </div>
          <div>
            <h4>参与方式 / Get involved</h4>
            <ul>
              <li><a href="#questionnaire">以黑客身份报名</a></li>
              <li><a href="#">成为导师</a></li>
              <li><a href="#">成为合作伙伴</a></li>
              <li><a href="#">志愿者招募</a></li>
            </ul>
          </div>
          <div>
            <h4>联系 / Contact</h4>
            <ul>
              <li><a href="#">hello@bohack.io</a></li>
              <li><a href="#">微信公众号</a></li>
              <li><a href="#">小红书</a></li>
              <li><a href="#">GitHub</a></li>
            </ul>
          </div>
          <div>
            <h4>版本说明 / Colophon</h4>
            <ul>
              <li>天津 · 滨海新区</li>
              <li>2026.05.28 — 05.31</li>
              <li>第 04 届</li>
              <li>WIE 2026 官方赛道</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© BOHACK COLLECTIVE 2026</span>
          <span>MADE IN TIANJIN · 津门出品,狂热所成。</span>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
            津ICP备2025030902号-2
          </a>
        </div>
      </div>
    </footer>
  );
}
