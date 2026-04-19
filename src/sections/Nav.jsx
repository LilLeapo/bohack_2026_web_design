export default function Nav() {
  return (
    <nav className="nav">
      <div className="brand">
        <span className="brand-mark" />
        <span>BOHACK / 2026</span>
      </div>
      <div className="nav-links">
        <a href="#about">简介</a>
        <a href="#tracks">赛道</a>
        <a href="#schedule">日程</a>
        <a href="#prizes">奖项</a>
        <a href="#sponsors">合作</a>
        <a href="#faq">答疑</a>
      </div>
      <a href="#apply" className="nav-cta magnet">报名 →</a>
    </nav>
  );
}
