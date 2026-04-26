import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AUTH_CHANGED_EVENT,
  api,
  clearAuthSession,
  getAccessToken,
} from '../lib/api.js';

const LINKS = [
  { href: '#about', label: '简介' },
  { href: '#tracks', label: '赛道' },
  { href: '#schedule', label: '日程' },
  { href: '#prizes', label: '奖项' },
  { href: '#sponsors', label: '合作' },
  { href: '#faq', label: '答疑' },
];

function userInitial(user) {
  const source = user?.username || user?.email || 'ME';
  const clean = source.trim().replace(/@.*$/, '').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
  return Array.from(clean || 'ME').slice(0, 2).join('').toUpperCase();
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(() => Boolean(getAccessToken()));
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    const syncAuth = () => {
      const hasToken = Boolean(getAccessToken());
      setIsAuthed(hasToken);
      if (!hasToken) setUser(null);
    };

    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!isAuthed) return undefined;

    let alive = true;
    api.me()
      .then((currentUser) => {
        if (alive) setUser(currentUser);
      })
      .catch((error) => {
        if (!alive) return;
        if (error.status === 401) {
          clearAuthSession();
          setIsAuthed(false);
          setUser(null);
        }
      });

    return () => {
      alive = false;
    };
  }, [isAuthed]);

  const closeDrawer = () => setOpen(false);
  const avatarText = userInitial(user);

  return (
    <>
      <nav className={`nav ${open ? 'is-open' : ''}`}>
        <Link
          to="/"
          className="brand"
          aria-label="BoHack 2026 home"
          onClick={closeDrawer}
        >
          <img
            src="/BoHack-LOGO-%E5%8F%8D%E7%99%BD.svg"
            alt="BoHack"
            className="brand-logo"
          />
          <span className="brand-year">/ 2026</span>
        </Link>

        <div className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          {isAuthed ? (
            <Link
              to="/user"
              className="nav-user magnet"
              aria-label="进入用户中心"
              title="进入用户中心"
              onClick={closeDrawer}
            >
              <span className="nav-user-avatar" aria-hidden="true">
                {avatarText}
              </span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-login">
                登录
              </Link>
              <Link to="/register" className="nav-cta magnet nav-cta-desktop">
                创建账号 →
              </Link>
            </>
          )}
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
                <a href={l.href} onClick={closeDrawer}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="t">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-drawer-ctas">
            <Link
              to={isAuthed ? '/user' : '/register'}
              className="btn btn-primary nav-drawer-cta"
              onClick={closeDrawer}
            >
              {isAuthed ? '进入控制台' : '创建账号'} <span className="arrow">↗</span>
            </Link>
            {!isAuthed && (
              <Link
                to="/login"
                className="nav-drawer-login"
                onClick={closeDrawer}
              >
                已有账号?登录 →
              </Link>
            )}
          </div>
          <div className="nav-drawer-meta">
            <span>TIANJIN · 2026.05.22—31</span>
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
