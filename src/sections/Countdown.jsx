import { useEffect, useMemo, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');

export default function Countdown() {
  const target = useMemo(() => new Date(2026, 4, 22, 16, 0, 0).getTime(), []);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const cells = [
    { n: pad(d), l: '天 · Days', w: '100%' },
    { n: pad(h), l: '时 · Hours', w: `${(h / 24) * 100}%` },
    { n: pad(m), l: '分 · Minutes', w: `${(m / 60) * 100}%` },
    { n: pad(s), l: '秒 · Seconds', w: `${(s / 60) * 100}%` },
  ];

  return (
    <div className="countdown">
      {cells.map((c, i) => (
        <div className="cell" key={i}>
          <div className="num">{c.n}</div>
          <div className="lbl">{c.l}</div>
          <div className="bar" style={{ width: c.w }} />
        </div>
      ))}
    </div>
  );
}
