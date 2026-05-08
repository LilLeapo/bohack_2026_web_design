import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, userFacingError } from '../lib/api.js';

const STATUS_TEXT = {
  confirmed: '已确认参加',
  declined: '已标记无法参加',
};
const CONFIRMATION_FILE_ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.heic';

export default function AttendanceConfirm() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const status = params.get('status') || '';
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const statusLabel = useMemo(() => STATUS_TEXT[status] || '确认到场', [status]);
  const isConfirmedLink = token && status === 'confirmed';
  const shouldShowUpload = isConfirmedLink && !state.loading && !state.data;

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
      if (status === 'confirmed') {
        setState({ loading: false, error: '', data: null });
        return;
      }
      try {
        const data = await api.confirmAttendance({ token, status: 'declined' });
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

  const submitConfirmationFile = async (event) => {
    event.preventDefault();
    if (!file) {
      setState((current) => ({
        ...current,
        error: '请先选择手写签署后的确认书文件。',
      }));
      return;
    }

    setUploading(true);
    setState((current) => ({ ...current, error: '' }));
    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('file', file);
      const data = await api.uploadAttendanceConfirmation(formData);
      setState({ loading: false, error: '', data });
    } catch (error) {
      setState((current) => ({
        ...current,
        error: userFacingError(error),
        data: null,
      }));
    } finally {
      setUploading(false);
    }
  };

  const title = (() => {
    if (state.loading) return status === 'declined' ? '正在记录。' : '正在确认。';
    if (state.data) return statusLabel;
    if (shouldShowUpload) return '上传确认书';
    if (state.error) return '确认失败。';
    return statusLabel;
  })();

  return (
    <div className="auth-shell attendance-confirm-shell">
      <main className="auth-panel attendance-confirm-panel">
        <div className="auth-topbar">
          <Link to="/" className="auth-back">← 返回主页</Link>
          <span className="auth-topbar-meta">/ 参赛时间确认</span>
        </div>
        <div className="auth-form attendance-confirm-form">
          <div className="auth-eyebrow">Attendance Confirmation</div>
          <h1 className="auth-h1">{title}</h1>
          {state.loading && (
            <p className="auth-sub">
              请稍候，我们正在记录你无法参加的选择。
            </p>
          )}
          {!state.loading && shouldShowUpload && (
            <>
              <p className="auth-sub">
                请上传已手写签署后的参赛确认书。上传成功后，系统才会将你的参赛状态置为已确认。
              </p>
              <form className="attendance-upload" onSubmit={submitConfirmationFile}>
                <label className="attendance-file-box" htmlFor="attendance-confirm-file">
                  <span className="attendance-file-k">Signed confirmation</span>
                  <span className="attendance-file-name">
                    {file ? file.name : '选择 PDF / 图片 / Word 文件'}
                  </span>
                  <span className="attendance-file-action">浏览文件 ↗</span>
                </label>
                <input
                  id="attendance-confirm-file"
                  type="file"
                  accept={CONFIRMATION_FILE_ACCEPT}
                  onChange={(event) => {
                    setFile(event.target.files?.[0] || null);
                    setState((current) => ({ ...current, error: '' }));
                  }}
                />
                {state.error && <div className="auth-err">{state.error}</div>}
                <button
                  type="submit"
                  className="auth-submit magnet"
                  disabled={uploading}
                >
                  <span>{uploading ? '上传中' : '上传并确认参赛'}</span>
                  <span className="arrow">↗</span>
                </button>
              </form>
            </>
          )}
          {state.error && !shouldShowUpload && <p className="auth-sub">{state.error}</p>}
          {state.data && (
            <p className="auth-sub">
              {state.data.registration?.realName || '你的'} 参赛时间状态已经同步。后续如需修改，请联系主办方。
            </p>
          )}
          {!shouldShowUpload && (
            <div className="auth-btn-row">
              <Link to="/" className="auth-submit magnet">
                <span>回到首页</span>
                <span className="arrow">↗</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
