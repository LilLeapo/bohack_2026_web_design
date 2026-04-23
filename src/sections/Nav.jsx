import { useEffect, useState } from 'react';

const LINKS = [
  { href: '#about', label: '简介' },
  { href: '#tracks', label: '赛道' },
  { href: '#schedule', label: '日程' },
  { href: '#prizes', label: '奖项' },
  { href: '#sponsors', label: '合作' },
  { href: '#faq', label: '答疑' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const { body } = document;
    if (open) body.classList.add('nav-open');
    else body.classList.remove('nav-open');
    return () => body.classList.remove('nav-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <nav className={`nav ${open ? 'is-open' : ''}`}>
        <a
          href="#top"
          className="brand"
          aria-label="BoHack 2026 home"
          onClick={() => setOpen(false)}
        >
          <img
            src="/BoHack-LOGO-%E5%8F%8D%E7%99%BD.svg"
            alt="BoHack"
            className="brand-logo"
          />
          <span className="brand-year">/ 2026</span>
        </a>

        <div className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <a href="#login" className="nav-login">
            登录
          </a>
          <a href="#apply" className="nav-cta magnet nav-cta-desktop">
            报名 →
          </a>
        </div>

        <button
          type="button"
          className={`nav-toggle ${open ? 'is-open' : ''}`}
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div
        id="mobile-nav-drawer"
        className={`nav-drawer ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
      >
        <div className="nav-drawer-inner">
          <ul className="nav-drawer-links">
            {LINKS.map((l, i) => (
              <li key={l.href} style={{ transitionDelay: `${80 + i * 40}ms` }}>
                <a href={l.href} onClick={() => setOpen(false)}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="t">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-drawer-ctas">
            <a
              href="#apply"
              className="btn btn-primary nav-drawer-cta"
              onClick={() => setOpen(false)}
            >
              立即报名 <span className="arrow">↗</span>
            </a>
            <a
              href="#login"
              className="nav-drawer-login"
              onClick={() => setOpen(false)}
            >
              已有账号?登录 →
            </a>
          </div>
          <div className="nav-drawer-meta">
            <span>TIANJIN · 2026.05.28—31</span>
            <span>WIE 2026 OFFICIAL TRACK</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`nav-backdrop ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />
    </>
  );
}
