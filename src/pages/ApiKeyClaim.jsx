import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParticles } from '../hooks/useParticles.js';
import { useMagnet } from '../hooks/useMagnet.js';
import {
  api,
  clearAuthSession,
  getAccessToken,
  userFacingError,
} from '../lib/api.js';

function extractApiKey(data) {
  if (!data) return '';
  if (typeof data === 'string') return data;
  return data.apiKey || data.key || data.token || data.value || '';
}

function claimErrorText(error) {
  if (error.status === 409) {
    return error.message || '你已经领取过 API Key，每个账号只能领取一次。';
  }
  if (error.status === 404) {
    return '当前没有可领取的 API Key，请联系现场工作人员。';
  }
  return userFacingError(error);
}

export default function ApiKeyClaim() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useParticles(canvasRef);
  useMagnet();

  useEffect(() => {
    document.body.classList.add('auth-body');
    return () => document.body.classList.remove('auth-body');
  }, []);

  useEffect(() => {
    if (!getAccessToken()) navigate('/login', { replace: true });
  }, [navigate]);

  const apiKey = useMemo(() => extractApiKey(claimed), [claimed]);

  const claim = async () => {
    if (claiming || claimed) return;
    setClaiming(true);
    setError('');
    setCopied(false);
    try {
      const data = await api.claimApiKey();
      setClaimed(data || {});
    } catch (claimError) {
      if (claimError.status === 401) {
        clearAuthSession();
        navigate('/login', { replace: true });
        return;
      }
      setError(claimErrorText(claimError));
    } finally {
      setClaiming(false);
    }
  };

  const copyKey = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
    } catch {
      setCopied(false);
      setError('复制失败，请手动选中 API Key 后复制。');
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-poster">
        <canvas ref={canvasRef} className="auth-poster-canvas" />
        <div className="auth-poster-grid" />

        <div className="auth-brand">
          <img
            src="/BoHack-LOGO-%E5%8F%8D%E7%99%BD.svg"
            alt="BoHack"
            className="auth-brand-logo"
          />
          <span>Bohack / API</span>
        </div>

        <div className="auth-poster-body">
          <div className="auth-poster-eyebrow">◉ API Distribution</div>
          <h1 className="auth-poster-title">
            领取<span className="accent"> API。</span>
          </h1>
          <p className="auth-poster-lede">
            每个登录账号只能领取一次 API Key。领取成功后请立即保存，不要公开分享给他人。
          </p>
          <div className="auth-poster-stats">
            <div className="s">
              <div className="n">1</div>
              <div className="t">每人一次</div>
            </div>
            <div className="s">
              <div className="n">1</div>
              <div className="t">每 Key 一人</div>
            </div>
            <div className="s">
              <div className="n">POST</div>
              <div className="t">自动分发</div>
            </div>
          </div>
        </div>

        <div className="auth-poster-footer">
          <span>BOHACK 2026</span>
          <span>API KEY CLAIM</span>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-topbar">
          <Link to="/user" className="auth-back">← 返回控制台</Link>
          <span className="auth-topbar-meta">/ API Key 分发</span>
        </div>

        <div className="auth-form">
          <div className="auth-eyebrow">Claim API Key</div>
          <h1 className="auth-h1">领取你的 API Key。</h1>
          <p className="auth-sub">
            点击下方按钮后，系统会为当前登录用户分配一个未被领取的 API Key。
            每个用户只能领取一次，每个 Key 也只能被领取一次。
          </p>

          {apiKey && (
            <div className="auth-field">
              <label htmlFor="api-key-result">
                <span>Your API Key</span>
                <span className="hint">请妥善保存</span>
              </label>
              <input id="api-key-result" value={apiKey} readOnly />
            </div>
          )}

          {error && <div className="auth-err auth-form-err">{error}</div>}
          {copied && <div className="auth-foot">已复制到剪贴板。</div>}

          <div className="auth-btn-row">
            {!apiKey ? (
              <button
                type="button"
                className="auth-submit magnet"
                onClick={claim}
                disabled={claiming}
              >
                <span>{claiming ? '领取中' : '领取 API Key'}</span>
                <span className="arrow">↗</span>
              </button>
            ) : (
              <button
                type="button"
                className="auth-submit magnet"
                onClick={copyKey}
              >
                <span>{copied ? '已复制' : '复制 API Key'}</span>
                <span className="arrow">↗</span>
              </button>
            )}
            <Link to="/user" className="auth-ghost magnet">进入控制台</Link>
          </div>

          <p className="auth-foot">
            如果提示已经领取过，请使用首次领取时保存的 Key；如遇分发异常，请联系现场工作人员。
          </p>
        </div>
      </main>
    </div>
  );
}
