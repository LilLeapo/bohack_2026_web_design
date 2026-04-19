const TIERS = [
  ['HANGAR 机库', '◆◆◆'],
  ['DIODE LABS', '◆◆◆'],
  ['MERIDIAN', '◆◆◆'],
  ['PAPERTRAIL', '◆◆'],
  ['STUDIO K', '◆◆'],
  ['NORTHWIND', '◆◆'],
  ['CACHE CO.', '◆◆'],
  ['PLENTY', '◆'],
  ['KILN', '◆'],
  ['WEFT', '◆'],
  ['SUBROUTINE', '◆'],
  ['FIELD NOTES', '◆'],
  ['HALFLIGHT', '◆'],
  ['WIE 2026', '主办'],
  ['+ 还有 12 家', ''],
];

export default function Sponsors() {
  return (
    <section className="section light" id="sponsors">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 05 / 合作方</div>
            <div className="chapter-num">05</div>
          </div>
          <h2 className="title">
            靠谱的人。<br />
            正经的公司。
          </h2>
        </div>
        <div className="sponsors-grid reveal" data-stagger="true">
          {TIERS.map(([name, tier], i) => (
            <div className="sponsor" key={i}>
              <span className="sponsor-tier" style={{ fontFamily: 'var(--f-mono)' }}>
                {tier}
              </span>
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
