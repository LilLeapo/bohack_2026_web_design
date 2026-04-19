export default function Ticker({ items, dark = false }) {
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className={'ticker' + (dark ? ' dark' : '')}>
      <div className="ticker-track">
        {repeated.map((x, i) => (
          <span key={i}>
            {x}
            <span className="dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
