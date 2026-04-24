// ─── Bohack sections (React + Babel) ─── //
const { useState, useEffect, useRef, useMemo } = React;

// ——— NAV ———
function Nav() {
  return (
    <nav className="nav">
      <div className="brand">
        <span className="brand-mark" />
        <span>Bohack / 2026</span>
      </div>
      <div className="nav-links">
        <a href="#about">About</a>
        <a href="#tracks">Tracks</a>
        <a href="#schedule">Schedule</a>
        <a href="#prizes">Prizes</a>
        <a href="#sponsors">Sponsors</a>
        <a href="#faq">FAQ</a>
      </div>
      <a href="#apply" className="nav-cta magnet">Apply →</a>
    </nav>
  );
}

// ——— HERO ———
function Hero() {
  const canvasRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) window.__bohackInitParticles(canvasRef.current);
    if (titleRef.current) {
      const el = titleRef.current;
      const final = el.textContent;
      setTimeout(() => window.__bohackScramble(el, final, 1400), 120);
    }
  }, []);

  return (
    <section className="hero">
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-grid pl" data-parallax="-0.25" />

      <div className="hero-floaters">
        <div className="floater lime pl" data-parallax="0.6" style={{ top: '14%', left: '6%' }}>
          ◆ 600+ BUILDERS
        </div>
        <div className="floater pl" data-parallax="0.4" style={{ top: '22%', right: '8%' }}>
          ↗ 48 HOURS
        </div>
        <div className="floater coral pl" data-parallax="0.5" style={{ bottom: '28%', left: '10%' }}>
          ★ $50K PRIZES
        </div>
        <div className="floater pl" data-parallax="0.3" style={{ bottom: '18%', right: '14%' }}>
          ✦ MAY 15—17
        </div>
      </div>

      <div className="hero-content">
        <div className="pl" data-parallax="0.15">
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7 }}>
            <span>◉ Live</span>
            <span style={{ opacity: 0.5 }}>— applications open</span>
          </div>
          <h1 ref={titleRef}>
            BO<span className="accent">HACK</span>
          </h1>
          <div className="hero-meta">
            <p className="hero-tag">
              The Boreal Collegiate Hackathon. 48 hours, one continent, infinite caffeine. Build something weird, win something real.
            </p>
            <div className="hero-stats">
              <div><b>48</b>hours</div>
              <div><b>600+</b>hackers</div>
              <div><b>$50K</b>prizes</div>
              <div><b>24</b>campuses</div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll">SCROLL TO ENTER</div>
    </section>
  );
}

// ——— TICKER ———
function Ticker({ items, dark }) {
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className={"ticker" + (dark ? " dark" : "")}>
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

// ——— COUNTDOWN ———
function Countdown() {
  // Target: May 15, 2026 18:00 local
  const target = useMemo(() => new Date(2026, 4, 15, 18, 0, 0).getTime(), []);
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
  const pad = (n) => String(n).padStart(2, '0');
  const cells = [
    { n: pad(d), l: 'Days' },
    { n: pad(h), l: 'Hours' },
    { n: pad(m), l: 'Minutes' },
    { n: pad(s), l: 'Seconds' },
  ];
  return (
    <div className="countdown">
      {cells.map((c, i) => (
        <div className="cell" key={i}>
          <div className="num">{c.n}</div>
          <div className="lbl">{c.l}</div>
          <div className="bar" style={{ width: i === 3 ? (s / 60) * 100 + '%' : i === 2 ? (m / 60) * 100 + '%' : i === 1 ? (h / 24) * 100 + '%' : '100%' }} />
        </div>
      ))}
    </div>
  );
}

// ——— ABOUT ———
function About() {
  return (
    <section className="section light" id="about">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 01 / Premise</div>
            <div className="chapter-num">01</div>
          </div>
          <h2 className="title">
            Forty-eight hours.<br />
            One absurdly good idea.
          </h2>
        </div>

        <div className="about-grid">
          <div className="reveal">
            <p className="about-lede">
              Bohack is a collegiate hackathon for builders who treat <span className="hl">a weekend</span> like a loaded question. Bring a laptop. Bring friends. Bring a half-formed hunch. We'll handle the rest — the food, the mentors, the{" "}
              <span className="hl">ambient chaos</span>.
            </p>
          </div>
          <div className="about-side reveal" data-stagger="true">
            <p>
              Sixteen universities. Six hundred students. One converted aircraft hangar in upstate New York, rigged with 48 hours of high-voltage creative panic.
            </p>
            <p>
              You'll ship something that actually runs — on silicon, on servers, on stage — and leave with a demo, a team, and a story.
            </p>
            <div className="about-stats">
              <div className="s"><div className="n">600</div><div className="t">Student hackers</div></div>
              <div className="s"><div className="n">16</div><div className="t">Partner universities</div></div>
              <div className="s"><div className="n">$50K</div><div className="t">Prize pool</div></div>
              <div className="s"><div className="n">∞</div><div className="t">Cold brew</div></div>
            </div>
          </div>
        </div>

        <Countdown />
      </div>
    </section>
  );
}

// ——— TRACKS ———
function Tracks() {
  const tracks = [
    { num: '01', glyph: '◢', title: 'Ambient Intelligence', desc: 'Agents, assistants, and software that reads the room. LLMs welcome; novelty required.', prize: '$10K top prize' },
    { num: '02', glyph: '◎', title: 'Civic Infrastructure', desc: 'Tools for transit, housing, voting, and everything else that breaks on Mondays.', prize: '$8K + pilot grant' },
    { num: '03', glyph: '▲', title: 'Hardware Punk', desc: 'Soldered, 3D-printed, duct-taped. If it blinks, beeps, or bruises, it counts.', prize: '$8K + lab access' },
    { num: '04', glyph: '✦', title: 'Creative Tools', desc: 'Instruments for makers — music, code, prose, pixels. Reinvent one workflow.', prize: '$6K + residency' },
    { num: '05', glyph: '◐', title: 'Climate & Earth', desc: 'Sensors, simulations, datasets. Build for a warmer, weirder planet.', prize: '$6K + field trip' },
    { num: '06', glyph: '✺', title: 'Wildcard', desc: 'The track for projects that fit nowhere else. Weird is a compliment here.', prize: '$5K + bragging rights' },
  ];
  return (
    <section className="section dark" id="tracks">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 02 / Where to aim</div>
            <div className="chapter-num">02</div>
          </div>
          <h2 className="title">Six tracks.<br/>Pick one, break it.</h2>
        </div>
        <div className="tracks reveal" data-stagger="true">
          {tracks.map(t => (
            <div className="track" key={t.num}>
              <div>
                <div className="track-num">Track / {t.num}</div>
                <div className="track-glyph">{t.glyph}</div>
              </div>
              <div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <span className="prize-chip">{t.prize}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ——— SCHEDULE ———
function Schedule() {
  const days = [
    {
      n: 'Day 01', t: 'Friday, May 15',
      rows: [
        { time: '16:00', title: 'Doors + check-in', tag: 'Arrival' },
        { time: '18:00', title: 'Opening ceremony (no slides, we promise)', tag: 'Live' },
        { time: '19:00', title: 'Team formation carousel', tag: 'Social' },
        { time: '20:00', title: 'Hacking begins. Clocks start.', tag: 'Build' },
        { time: '23:30', title: 'Midnight ramen run', tag: 'Food' },
      ],
    },
    {
      n: 'Day 02', t: 'Saturday, May 16',
      rows: [
        { time: '09:00', title: 'Mentor office hours open', tag: 'Mentor' },
        { time: '12:00', title: 'Workshop: shipping in the last 18 hours', tag: 'Talk' },
        { time: '16:00', title: 'Hardware lab open house', tag: 'Lab' },
        { time: '22:00', title: 'Quiet room opens for real sleep', tag: 'Rest' },
      ],
    },
    {
      n: 'Day 03', t: 'Sunday, May 17',
      rows: [
        { time: '08:00', title: 'Coffee, panic, and final commits', tag: 'Build' },
        { time: '12:00', title: 'Submissions close — pencils down', tag: 'Cutoff' },
        { time: '14:00', title: 'Science-fair judging (120 projects)', tag: 'Judging' },
        { time: '17:00', title: 'Finalist demos — main stage', tag: 'Stage' },
        { time: '19:00', title: 'Closing ceremony + prize reveal', tag: 'Stage' },
      ],
    },
  ];
  return (
    <section className="section light" id="schedule">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 03 / The clock</div>
            <div className="chapter-num">03</div>
          </div>
          <h2 className="title">Three days.<br/>One long Saturday.</h2>
        </div>

        <div className="schedule-timeline reveal">
          {days.map((day, di) => (
            <React.Fragment key={di}>
              <div className="day-header">
                <div className="dn">{day.n}</div>
                <div className="dt">{day.t}</div>
              </div>
              {day.rows.map((r, i) => (
                <div className="sch-row" key={i}>
                  <div className="sch-time">{r.time}</div>
                  <div className="sch-dot" />
                  <div className="sch-title">{r.title}</div>
                  <div className="sch-tag">{r.tag}</div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

// ——— PRIZES ———
function Prizes() {
  return (
    <section className="section dark" id="prizes">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 04 / Upside</div>
            <div className="chapter-num">04</div>
          </div>
          <h2 className="title">Fifty thousand<br/>in prize money.</h2>
        </div>

        <div className="prizes reveal" data-stagger="true">
          <div className="prize gold">
            <div>
              <div className="rank">Grand Prize</div>
            </div>
            <div>
              <div className="amt">$25K</div>
              <div className="label" style={{ marginTop: 16 }}>+ incubator interview at Boreal Labs, mentor dinner, and a gigantic physical trophy.</div>
            </div>
            <div className="deco" />
          </div>
          <div className="prize">
            <div className="rank">Track Winners × 6</div>
            <div>
              <div className="amt">$3K</div>
              <div className="label" style={{ marginTop: 8 }}>One per track.</div>
            </div>
            <div className="deco" />
          </div>
          <div className="prize">
            <div className="rank">Hardware Punk bonus</div>
            <div>
              <div className="amt">$2K</div>
              <div className="label" style={{ marginTop: 8 }}>Best thing with a blinking LED.</div>
            </div>
            <div className="deco" />
          </div>
          <div className="prize">
            <div className="rank">People's Choice</div>
            <div>
              <div className="amt">$3K</div>
              <div className="label" style={{ marginTop: 8 }}>Voted by the 600 hackers in the room.</div>
            </div>
            <div className="deco" />
          </div>
          <div className="prize">
            <div className="rank">First-Time Hacker</div>
            <div>
              <div className="amt">$2K</div>
              <div className="label" style={{ marginTop: 8 }}>For teams where nobody has hackathon'd before.</div>
            </div>
            <div className="deco" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ——— SPONSORS ———
function Sponsors() {
  const tiers = [
    ['HANGAR', '◆◆◆'], ['DIODE LABS', '◆◆◆'], ['MERIDIAN', '◆◆◆'], ['PAPERTRAIL', '◆◆'], ['STUDIO K', '◆◆'],
    ['NORTHWIND', '◆◆'], ['CACHE CO.', '◆◆'], ['PLENTY', '◆'], ['KILN', '◆'], ['WEFT', '◆'],
    ['SUBROUTINE', '◆'], ['FIELD NOTES', '◆'], ['HALFLIGHT', '◆'], ['BOREAL U.', 'HOST'], ['+ 12 MORE', ''],
  ];
  return (
    <section className="section light" id="sponsors">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 05 / Backed by</div>
            <div className="chapter-num">05</div>
          </div>
          <h2 className="title">Good people.<br/>Actual companies.</h2>
        </div>
        <div className="sponsors-grid reveal" data-stagger="true">
          {tiers.map(([name, tier], i) => (
            <div className="sponsor" key={i}>
              <span className="sponsor-tier" style={{ fontFamily: 'var(--f-mono)' }}>{tier}</span>
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ——— FAQ ———
function FAQ() {
  const items = [
    { q: 'Do I need a team?', a: "Nope. Show up solo — we run a team-formation carousel on Friday at 19:00 and most people leave with a crew." },
    { q: "I've never hacked before. Is this for me?", a: "Yes, emphatically. We run a first-timer track, a beginner mentor pool, and a dedicated $2K prize for first-time hackers." },
    { q: "What can I build?", a: "Anything shippable in 48 hours that fits a track. Hardware, software, art, prose, weird physical objects — all fair game." },
    { q: "Travel + housing?", a: "We cover bus fare from partner campuses and put you up two-to-a-room at the dorm next to the hangar." },
    { q: "Is it really 48 hours straight?", a: "Clocks run for 48 hours, but you should sleep. The quiet room opens Saturday 22:00 with actual cots and blackout curtains." },
    { q: "Who judges?", a: "A rotating cast of alumni, engineers, and faculty. Full panel drops two weeks before the event." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="section dark" id="faq">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 06 / Loose ends</div>
            <div className="chapter-num">06</div>
          </div>
          <h2 className="title">Questions we<br/>get a lot.</h2>
        </div>
        <div className="faq reveal">
          {items.map((it, i) => (
            <div className={"faq-item" + (open === i ? " open" : "")} key={i}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{it.q}</span>
                <span className="plus">+</span>
              </button>
              <div className="faq-a">
                <div className="faq-a-inner">{it.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ——— FOOTER / CTA ———
function Footer() {
  return (
    <footer className="footer" id="apply">
      <div className="container">
        <div className="eyebrow reveal" style={{ marginBottom: 24 }}>◉ Apply by April 29, 2026</div>
        <div className="footer-big reveal">
          BUILD <span className="accent">SOMETHING</span><br/>WEIRD.
        </div>
        <div style={{ marginTop: 48, display: 'flex', gap: 20, flexWrap: 'wrap' }} className="reveal">
          <a href="#" className="btn btn-primary magnet">
            Apply to Bohack <span className="arrow">↗</span>
          </a>
          <a href="#" className="btn magnet">
            Sponsor the event <span className="arrow">↗</span>
          </a>
        </div>

        <div className="footer-grid">
          <div>
            <h4>Event</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#tracks">Tracks</a></li>
              <li><a href="#schedule">Schedule</a></li>
              <li><a href="#prizes">Prizes</a></li>
            </ul>
          </div>
          <div>
            <h4>Get involved</h4>
            <ul>
              <li><a href="#">Apply as hacker</a></li>
              <li><a href="#">Mentor</a></li>
              <li><a href="#">Sponsor</a></li>
              <li><a href="#">Volunteer</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="#">hello@bohack.io</a></li>
              <li><a href="#">Discord</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">GitHub</a></li>
            </ul>
          </div>
          <div>
            <h4>Colophon</h4>
            <ul>
              <li>Upstate NY</li>
              <li>May 15—17, 2026</li>
              <li>Bohack 2026</li>
              <li>MLH-affiliated</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© Bohack Collective 2026</span>
          <span>Made in the hangar, with love.</span>
        </div>
      </div>
    </footer>
  );
}

// ——— APP ———
function App() {
  useEffect(() => {
    window.__bohackInitReveal();
    window.__bohackInitParallax();
    setTimeout(() => window.__bohackInitMagnets(), 200);
  }, []);
  return (
    <>
      <Nav />
      <Hero />
      <Ticker dark items={['Bohack 2026', 'May 15—17', 'Upstate NY', '600 hackers', '48 hours', '$50K prizes', 'Apply by April 29']} />
      <About />
      <Ticker items={['◆ 6 tracks', '◆ 16 universities', '◆ 40+ mentors', '◆ Free merch', '◆ Hangar venue', '◆ Cold brew on tap', '◆ Quiet room']} />
      <Tracks />
      <Schedule />
      <Ticker dark items={['$25K grand prize', '★ Track winners', '★ Hardware Punk bonus', '★ People\'s Choice', '★ First-Timer prize']} />
      <Prizes />
      <Sponsors />
      <FAQ />
      <Footer />
    </>
  );
}

Object.assign(window, { App });
