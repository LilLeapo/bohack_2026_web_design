import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, userFacingError } from '../lib/api.js';

const STATUS_TEXT = {
  confirmed: '已确认参加',
  declined: '已标记无法参加',
};

export default function AttendanceConfirm() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const status = params.get('status') || '';
  const [state, setState] = useState({ loading: true, error: '', data: null });

  const statusLabel = useMemo(() => STATUS_TEXT[status] || '确认到场', [status]);

  useEffect(() => {
    document.body.classList.add('auth-body');
    return () => document.body.classList.remove('auth-body');
  }, []);

  useEffect(() => {
    let alive = true;

    async function confirm() {
      if (!token || !STATUS_TEXT[status]) {
        setState({ loading: false, error: '确认链接无效。', data: null });
        return;
      }
      try {
        const data = await api.confirmAttendance({ token, status });
        if (alive) setState({ loading: false, error: '', data });
      } catch (error) {
        if (alive) setState({ loading: false, error: userFacingError(error), data: null });
      }
    }

    confirm();
    return () => {
      alive = false;
    };
  }, [token, status]);

  return (
    <div className="auth-shell attendance-confirm-shell">
      <main className="auth-panel attendance-confirm-panel">
        <div className="auth-topbar">
          <Link to="/" className="auth-back">← 返回主页</Link>
          <span className="auth-topbar-meta">/ 参赛时间确认</span>
        </div>
        <div className="auth-form attendance-confirm-form">
          <div className="auth-eyebrow">Attendance Confirmation</div>
          <h1 className="auth-h1">
            {state.loading ? '正在确认。' : state.error ? '确认失败。' : statusLabel}
          </h1>
          {state.loading && <p className="auth-sub">请稍候，我们正在记录你的选择。</p>}
          {state.error && <p className="auth-sub">{state.error}</p>}
          {state.data && (
            <p className="auth-sub">
              {state.data.registration?.realName || '你的'} 参赛时间状态已经同步。后续如需修改，请联系主办方。
            </p>
          )}
          <div className="auth-btn-row">
            <Link to="/" className="auth-submit magnet">
              <span>回到首页</span>
              <span className="arrow">↗</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
