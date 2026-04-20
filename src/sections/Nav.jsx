export default function Nav() {
  return (
    <nav className="nav">
      <a href="#top" className="brand" aria-label="BoHack 2026 home">
        <img
          src="/BoHack-LOGO-%E5%8F%8D%E7%99%BD.svg"
          alt="BoHack"
          className="brand-logo"
        />
        <span className="brand-year">/ 2026</span>
      </a>
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
