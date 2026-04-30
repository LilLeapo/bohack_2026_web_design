import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="apply">
      <div className="container">
        <div className="eyebrow reveal" style={{ marginBottom: 24 }}>
          ◉ 活动周期 / EVENT WINDOW · 2026.05.22—05.31
        </div>
        <div className="footer-big footer-cta-title reveal">
          别让好的想法只停留在备忘录里
        </div>
        <div className="footer-copy reveal">
          <p>42小时，让构想落地。</p>
          <p>5昼夜，让项目进化。</p>
          <p>世界智博会，让作品被看见。</p>
        </div>
        <div
          style={{ marginTop: 48, display: 'flex', gap: 20, flexWrap: 'wrap' }}
          className="reveal"
        >
          <Link to="/questionnaire" className="btn btn-primary magnet">
            报名参加黑客松 <span className="arrow">↗</span>
          </Link>
          <a href="#sponsors" className="btn magnet">
            成为合作伙伴 <span className="arrow">↗</span>
          </a>
        </div>
        <p className="footer-note reveal">下一批登上世界舞台的项目，也许就从这里开始。</p>

        <div className="footer-grid">
          <div>
            <h4>活动 / Event</h4>
            <ul>
              <li><a href="#about">简介</a></li>
              <li><a href="#tracks">赛制</a></li>
              <li><a href="#prizes">你将获得什么</a></li>
              <li><a href="#schedule">活动流程</a></li>
            </ul>
          </div>
          <div>
            <h4>参与方式 / Get involved</h4>
            <ul>
              <li><Link to="/questionnaire">报名参加黑客松</Link></li>
              <li><a href="#sponsors">成为导师</a></li>
              <li><a href="#sponsors">成为合作伙伴</a></li>
              <li><a href="#">志愿者招募</a></li>
            </ul>
          </div>
          <div>
            <h4>联系 / Contact</h4>
            <ul>
              <li><a href="mailto:contact@bohack.top">contact@bohack.top</a></li>
              <li><a href="#">微信公众号</a></li>
              <li><a href="#">小红书</a></li>
              <li><a href="#">GitHub</a></li>
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
