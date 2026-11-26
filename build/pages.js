/* Generates the eight static pages from one shared shell.
   Edit here, run `npm run build`, and every page stays consistent. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const MODES = [
  ['Projects', 'find', 'Bid invitations and public work filtered to the trades you actually self-perform and the counties you actually drive to.', ['Trade fit against licence and crew', 'Drive time from your yard', 'Owner and GC history attached'], '92% fit on the Pasadena TI', 'Bid invitations'],
  ['Exchange', 'find', 'Post what you need, see who actually stocks it, and keep buyer and supplier reading the same request.', ['One readable request', 'Stock confirmed before you call', 'Buyer and supplier in sync'], '3 suppliers matched in 40 min', 'Stock + replies'],
  ['Platform', 'win', 'The pursuit workspace behind every job: scope, takeoff notes, quotes, the next action and who owes it.', ['Scope and quotes on the job', 'Every revision kept', 'Next action always named'], '6 active pursuits · 0 lost notes', 'Scope + quotes'],
  ['Solutions', 'win', 'A connected setup for each side of the job — GC, sub, supplier — without three separate logins.', ['One identity per company', 'Permissions by role', 'No re-keying across sides'], 'GC · sub · supplier, one desk', 'One identity'],
  ['Supply', 'build', 'Source material against the real schedule, with lead times attached to the job that needs them.', ['Lead times on the schedule', 'Quotes compared side by side', 'Substitution flagged early'], 'Conduit order · 11-day lead', 'Lead times'],
  ['Capital', 'build', 'See the cash gap between draw and payroll before it happens, not during it.', ['Draw vs payroll by week', 'Gap surfaced a month out', 'Numbers stay with the job'], '$48k gap, seen 4 weeks early', 'Draw vs payroll'],
  ['Workforce', 'build', 'Match certified crews to the work ahead and keep the roster honest week to week.', ['Certifications checked', 'Crew booked to dates', 'Roster stays current'], '2 crews certified and available', 'Certified crews'],
  ['Fleet', 'build', 'Get trucks, lifts and equipment to the gate on the morning the work starts.', ['Equipment tied to the job', 'Gate time, not a guess', 'Conflicts visible early'], 'Boom lift booked for 7am', 'Equipment at gate'],
  ['Studio', 'keep', 'Turn a finished job into the thing that wins the next one: photos, scope, numbers, a reference that holds up.', ['Project page for an owner', 'Performance carried forward', 'Repeat customers surfaced'], 'Pasadena TI · complete', 'Proof for next job'],
];

const PAGES = {
  'index.html': 'Home', 'modes.html': 'Nine modes',
  'how-it-works.html': 'How it works', 'approvals.html': 'Approvals',
  'estimator.html': 'Estimator', 'coverage.html': 'Coverage',
  'pricing.html': 'Pricing', 'join.html': 'Join',
};

/* ---------------- SHARED MOTION SCREENS ---------------- */
// Each page embeds only the screen that belongs to its story. The behaviour
// lives in app.js and is keyed by data-demo-sec / data-screen.

function inlineDemo(id, stage, title, copy, screen, actionLabel, href) {
  return `<section class="sec demo-sec" id="${id}" data-demo-sec="${id}" data-obs>
  <div class="wrap two demo-two">
    <div class="demo-copy">
      <span class="eyebrow">${stage}</span>
      <h2 class="h2">${title}</h2>
      <p class="lede">${copy}</p>
      <div class="demo-actions">
        <button class="btn btn--accent" data-demo="${id}">${actionLabel}</button>
        <button class="btn btn--ghost" data-reset="${id}">Restart</button>
        <a class="btn btn--line" href="${href}">See the mode <span class="arrow">→</span></a>
      </div>
      <p class="demo-note">Illustrative screen. The numbers show the motion, not a quote for a live job.</p>
    </div>
    ${screen}
  </div>
</section>`;
}

const bar = (label, pill = 'In motion') => `<div class="dscreen__bar"><span class="dscreen__dots"><i></i><i></i><i></i></span><span class="mono">${label}</span><span class="pill pill--live" data-screen-pill><i></i>${pill}</span></div>`;

const fitScreen = `<div class="dscreen" data-screen="fit" aria-label="Projects fit scoring screen">
  ${bar('DJS / Projects · opportunities', 'Live scoring')}
  <div class="dscreen__body">
    <div class="fit-head" data-fit-body>
      <div><span class="mono tiny" data-fit-id>DJS-014</span><h3 data-fit-title>Commercial TI · Pasadena</h3><p class="tiny muted" data-fit-meta>Electrical · 12 min from your yard</p></div>
      <div class="fit-score" data-fit-score style="--score:0"><b data-fit-num>0</b><span>fit</span></div>
    </div>
    <div class="fit-meters">
      <div class="fit-meter"><span>Trade and licence fit</span><i><b data-fit-bar="0"></b></i></div>
      <div class="fit-meter"><span>Crew available</span><i><b data-fit-bar="1"></b></i></div>
      <div class="fit-meter"><span>Drive from your yard</span><i><b data-fit-bar="2"></b></i></div>
    </div>
    <div class="fit-trail"><span data-fit-line>Ready for your estimator</span><span class="mono" data-fit-step>01 / 03</span></div>
  </div>
</div>`;

const sendScreen = `<div class="dscreen" data-screen="send" aria-label="Exchange supplier request screen">
  ${bar('DJS / Exchange · request 0142', 'Draft ready')}
  <div class="dscreen__body">
    <div class="req"><span>Supply request</span><b>3/4&quot; conduit · 1,200 ft</b><p class="tiny muted">Delivery Thu 07:00 · Pasadena · scope attached</p></div>
    <div class="send-rows" data-send-rows>
      <div class="send-row"><span class="send-row__ic">AW</span><span><b>Harbor Wholesale</b><small>In stock · quote on file</small></span><span class="send-row__state">Waiting</span><span class="send-row__price" data-send-price="$176,840">—</span></div>
      <div class="send-row"><span class="send-row__ic">AE</span><span><b>Alpine Electric Supply</b><small>Stock confirmed this morning</small></span><span class="send-row__state">Waiting</span><span class="send-row__price" data-send-price="$184,200">—</span></div>
      <div class="send-row"><span class="send-row__ic">IC</span><span><b>Inland Conduit Co.</b><small>Lead time 11 days</small></span><span class="send-row__state">Waiting</span><span class="send-row__price" data-send-price="$191,500">—</span></div>
    </div>
    <div class="send-foot"><span data-send-line>Request drafted. Nothing sent until you approve.</span><span class="mono" data-send-count>0 / 3 quotes</span></div>
  </div>
</div>`;

const routeScreen = `<div class="dscreen" data-screen="route" aria-label="Platform pursuit board screen">
  ${bar('DJS / Platform · DJS-014', 'Human gate')}
  <div class="dscreen__body">
    <div class="kanban" data-kanban>
      <div class="kcol is-on"><span>Lead</span><div class="kcol__slot"><div class="kcard is-moving" data-route-card><em>DJS-014</em><b>Pasadena TI</b><small>Matched to your trade · 92% fit</small></div></div></div>
      <div class="kcol"><span>Priced</span><div class="kcol__slot"></div></div>
      <div class="kcol"><span>Pursuit</span><div class="kcol__slot"></div></div>
      <div class="kcol"><span>Build</span><div class="kcol__slot"></div></div>
    </div>
    <div class="route-log" data-route-log><span><span class="mono">09:41</span> Subagent prepared the brief. Awaiting your OK.</span></div>
  </div>
</div>`;

const cashScreen = `<div class="dscreen" data-screen="cash" aria-label="Capital cash gap screen">
  ${bar('DJS / Capital · draw vs payroll', 'Four weeks out')}
  <div class="dscreen__body">
    <div class="cash-top"><div><span class="mono tiny">DJS-014 · Pasadena TI</span><h3>Cash position, by week</h3></div><span class="cash-gap" data-cash-gap>$0 gap</span></div>
    <div class="cash-chart" data-cash-chart>
      <div class="cash-week is-on" data-cash-week="0"><span>W2</span><i class="cash-draw" style="--h:0%" data-h="72"></i><i class="cash-pay" style="--h:0%" data-h="38"></i></div>
      <div class="cash-week" data-cash-week="1"><span>W3</span><i class="cash-draw" style="--h:0%" data-h="80"></i><i class="cash-pay" style="--h:0%" data-h="52"></i></div>
      <div class="cash-week" data-cash-week="2"><span>W4</span><i class="cash-draw" style="--h:0%" data-h="86"></i><i class="cash-pay" style="--h:0%" data-h="67"></i></div>
      <div class="cash-week" data-cash-week="3"><span>W6</span><i class="cash-draw" style="--h:0%" data-h="92"></i><i class="cash-pay" style="--h:0%" data-h="100"></i></div>
    </div>
    <div class="cash-legend"><span><i></i>Draw</span><span><i></i>Payroll</span></div>
    <div class="cash-tabs"><button data-cash-tab="0" class="is-on">Week 2</button><button data-cash-tab="1">Week 3</button><button data-cash-tab="2">Week 4</button><button data-cash-tab="3">Week 6</button></div>
    <p class="cash-note" data-cash-note>Select a week to see the projected gap.</p>
  </div>
</div>`;

const dispatchScreen = `<div class="dscreen" data-screen="dispatch" aria-label="Fleet and Workforce dispatch screen">
  ${bar('DJS / Fleet + Workforce · Monday', '2 unassigned')}
  <div class="dscreen__body">
    <div class="dispatch-head"><span>Pasadena TI · 07:00 gate</span><span class="pill pill--warn" data-dispatch-state>2 unassigned</span></div>
    <div class="dispatch-rows" data-dispatch-rows>
      <div class="drow"><span class="drow__time">07:00</span><span class="drow__what"><b>Boom lift</b><small>Fleet · gate 3</small></span><span class="drow__assign" data-dispatch-assign>Book equipment</span></div>
      <div class="drow"><span class="drow__time">07:00</span><span class="drow__what"><b>2 electricians</b><small>Workforce · certified</small></span><span class="drow__assign" data-dispatch-assign>Check crew</span></div>
      <div class="drow"><span class="drow__time">06:45</span><span class="drow__what"><b>Conduit delivery</b><small>Exchange · 11-day lead</small></span><span class="drow__assign" data-dispatch-assign>Confirm slot</span></div>
    </div>
    <div class="dispatch-track"><i data-dispatch-progress></i></div>
    <div class="dispatch-caption"><span data-dispatch-line>Three things to stage before the gate.</span><span class="mono" data-dispatch-count>0 / 3 ready</span></div>
  </div>
</div>`;

const svgLogo = `<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M3 27 L13 5 L19 18 L23 11 L29 27 Z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><circle cx="13" cy="5" r="2.4" fill="currentColor"/></svg>`;
const chev = `<svg class="chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 4.5 L6 8.5 L10 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const searchIcon = `<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10.6 10.6 L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const sunIcon = `<svg class="ic-sun" viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><circle cx="10" cy="10" r="3.6" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10 1.6v2.2M10 16.2v2.2M18.4 10h-2.2M3.8 10H1.6M15.9 4.1l-1.6 1.6M5.7 14.3l-1.6 1.6M15.9 15.9l-1.6-1.6M5.7 5.7 4.1 4.1"/></g></svg><svg class="ic-moon" viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><path d="M16.5 12.6A7 7 0 0 1 7.4 3.5a7 7 0 1 0 9.1 9.1z" fill="currentColor"/></svg>`;

function navLink(href, label, current) {
  return `<a class="nav__link${href === current ? ' is-current' : ''}" href="${href}">${label}</a>`;
}

function shell(file, title, desc, content) {
  const current = file;
  const megaCols = ['find', 'win', 'build', 'keep'].map(stage => {
    const head = stage[0].toUpperCase() + stage.slice(1);
    const links = MODES.filter(m => m[1] === stage).map(m =>
      `<a class="mega__link" href="modes.html#${m[0].toLowerCase()}"><span class="mega__ic" data-ic="${m[0].toLowerCase()}"></span><span><strong>${m[0]}</strong><small>${m[5]}</small></span></a>`).join('');
    return `<div class="mega__col"><p class="mega__head">${head}</p>${links}</div>`;
  }).join('');

  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — D&amp;J Stratagem</title>
<meta name="description" content="${desc}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
<script>try{var t=localStorage.getItem('djs-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
</head>
<body data-page="${file.replace('.html', '')}">

<div class="page-wipe" aria-hidden="true"><span></span></div>
<a class="skip" href="#main">Skip to content</a>
<div class="scroll-progress" aria-hidden="true"><span data-progress></span></div>

<div class="topbar" data-topbar>
  <div class="topbar__track"><div class="topbar__marquee">
    <span>New · Live in LA County, Orange County and the San Fernando Valley</span><span class="dot"></span>
    <span>14 new commercial bids posted this week</span><span class="dot"></span>
    <span>Every company is reviewed by a person before it joins</span><span class="dot"></span>
    <span>New · Live in LA County, Orange County and the San Fernando Valley</span><span class="dot"></span>
    <span>14 new commercial bids posted this week</span><span class="dot"></span>
    <span>Every company is reviewed by a person before it joins</span><span class="dot"></span>
  </div></div>
  <button class="topbar__x" data-topbar-close aria-label="Dismiss announcements">&times;</button>
</div>

<header class="hdr" data-header>
  <div class="hdr__in">
    <a class="brand" href="index.html" aria-label="D&J Stratagem home">
      <span class="brand__mark">${svgLogo}</span>
      <span class="brand__text"><strong>D&amp;J</strong><em>Stratagem</em></span>
    </a>
    <nav class="nav" aria-label="Primary">
      <div class="nav__item" data-mega-root>
        <a class="nav__link${'modes.html' === current ? ' is-current' : ''}" href="modes.html" data-mega-btn aria-expanded="false">Nine modes ${chev}</a>
        <div class="mega" data-mega hidden>
          <div class="mega__grid">${megaCols}
            <div class="mega__col"><p class="mega__head">Go deeper</p>
              <a class="mega__link" href="index.html#fit"><span class="mega__ic"></span><span><strong>Fit scoring</strong><small>A lead gets ranked</small></span></a>
              <a class="mega__link" href="how-it-works.html"><span class="mega__ic"></span><span><strong>How a job moves</strong><small>Four stages, one job</small></span></a>
              <a class="mega__link" href="approvals.html"><span class="mega__ic"></span><span><strong>Approvals</strong><small>A human gate</small></span></a>
              <a class="mega__link" href="estimator.html"><span class="mega__ic"></span><span><strong>Bid estimator</strong><small>Model your week</small></span></a>
            </div>
          </div>
          <div class="mega__promo"><span class="pill pill--live"><i></i>Live</span>
            <p>Pasadena TI brief ready for review — 3 suppliers matched.</p>
            <a class="link" href="join.html">Open the desk</a></div>
        </div>
      </div>
      ${navLink('how-it-works.html', 'How it works', current)}
      ${navLink('estimator.html', 'Estimator', current)}
      ${navLink('coverage.html', 'Coverage', current)}
      ${navLink('pricing.html', 'Pricing', current)}
    </nav>
    <div class="hdr__right">
      <button class="kbtn" data-cmdk-open aria-label="Search the site">${searchIcon}<span>Search</span><kbd>⌘K</kbd></button>
      <button class="icon-btn" data-theme-toggle aria-label="Switch between dark and light">${sunIcon}</button>
      <a class="btn btn--ghost hide-sm" href="join.html">Sign in</a>
      <a class="btn btn--accent" data-magnetic href="join.html">Join free</a>
      <button class="burger" data-drawer-open aria-label="Open menu"><span></span><span></span></button>
    </div>
  </div>
</header>

<div class="drawer" data-drawer hidden><div class="drawer__panel">
  <button class="drawer__x" data-drawer-close aria-label="Close menu">&times;</button>
  ${Object.entries(PAGES).map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}
  <a class="btn btn--accent" href="join.html">Join free</a>
</div></div>

<main id="main">
${content}
</main>

<footer class="foot"><div class="wrap foot__in">
  <div class="foot__brand">
    <a class="brand" href="index.html" aria-label="D&J Stratagem home">
      <span class="brand__mark">${svgLogo}</span>
      <span class="brand__text"><strong>D&amp;J</strong><em>Stratagem</em></span>
    </a>
    <p>Construction work, connected from the first lead to the next customer. Los Angeles, California.</p>
    <button class="copy" data-copy="hello@djstratageminc.com">hello@djstratageminc.com<span>Copy</span></button>
  </div>
  <nav class="foot__cols" aria-label="Footer">
    <div><h4>Platform</h4><a href="modes.html#projects">Projects</a><a href="modes.html#exchange">Exchange</a><a href="modes.html#platform">Platform</a><a href="modes.html#solutions">Solutions</a><a href="modes.html#supply">Supply</a></div>
    <div><h4>Build</h4><a href="modes.html#capital">Capital</a><a href="modes.html#workforce">Workforce</a><a href="modes.html#fleet">Fleet</a><a href="modes.html#studio">Studio</a><a href="approvals.html">Approvals</a></div>
    <div><h4>Company</h4><a href="index.html#fit">Fit scoring</a><a href="coverage.html">Coverage</a><a href="pricing.html">Pricing</a><a href="join.html">Contact</a><a href="pricing.html#faq">Questions</a></div>
    <div class="foot__news"><h4>Field notes</h4>
      <p class="tiny muted">What's bidding in SoCal, once a month.</p>
      <form class="news" data-news novalidate><input type="email" placeholder="you@company.com" aria-label="Email for field notes" required><button class="btn btn--accent" type="submit">Subscribe</button></form>
    </div>
  </nav>
</div>
<div class="wrap foot__bar">
  <span>© 2026 D&amp;J Stratagem, Inc.</span>
  <span class="mono tiny">34°08′N 118°08′W · Los Angeles</span>
  <span><a href="pricing.html#faq">Privacy</a> · <a href="pricing.html#faq">Terms</a></span>
</div></footer>

<button class="totop" data-totop aria-label="Back to top">↑</button>
<div class="cmdk" data-cmdk hidden><div class="cmdk__box" role="dialog" aria-modal="true" aria-label="Search the site">
  <div class="cmdk__in">${searchIcon}<input type="text" placeholder="Jump to a page, a mode, an answer…" data-cmdk-input aria-label="Search"><kbd>esc</kbd></div>
  <ul class="cmdk__list" data-cmdk-list></ul>
  <footer class="cmdk__foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></footer>
</div></div>
<div class="toasts" data-toasts aria-live="polite"></div>
<script src="app.js"></script>
</body>
</html>`;
}

/* ---------------- HOME ---------------- */
const home = `
<section class="hero" data-spotlight>
  <canvas class="hero__grid" data-blueprint aria-hidden="true"></canvas><div class="hero__glow" aria-hidden="true"></div>
  <div class="wrap hero__in">
    <div class="hero__copy">
      <div class="hero__tag"><span class="pill pill--live"><i></i>Live in Southern California</span><span class="coord">34°08′N 118°08′W</span></div>
      <h1 class="hero__h1"><span class="line" data-reveal-line>Find the work.</span><span class="line" data-reveal-line>Price it.</span><span class="line line--accent" data-reveal-line>Build it.</span></h1>
      <p class="hero__lede">One account carries a job from the first lead to the next customer — bids, suppliers, cash, crews, trucks and the proof you did it well.</p>
      <div class="hero__cta"><a class="btn btn--accent btn--lg" data-magnetic href="join.html">Create a free account</a><a class="btn btn--line btn--lg" href="how-it-works.html">Watch a job move<span class="play" aria-hidden="true"></span></a></div>
      <dl class="stats">
        <div><dt>Open bids this month</dt><dd data-count="1284">0</dd></div>
        <div><dt>Avg. days to first bid</dt><dd data-count="3" data-decimals="1" data-suffix=" days">0</dd></div>
        <div><dt>Suppliers in network</dt><dd data-count="612" data-suffix="+">0</dd></div>
      </dl>
    </div>
    <aside class="jobcard" data-tilt data-obs>
      <header class="jobcard__top"><div><span class="mono tiny">DJS-014</span><h3>Commercial tenant improvement</h3><p class="mono tiny muted">Pasadena, CA · Electrical · $280k–$340k</p></div><span class="pill pill--live"><i></i>In motion</span></header>
      <ol class="pipe" data-pipe>
        <li class="pipe__step is-done"><span class="pipe__dot"></span><span>Found<em>Matched to your trade</em></span></li>
        <li class="pipe__step is-done"><span class="pipe__dot"></span><span>Priced<em>Bid built from 3 quotes</em></span></li>
        <li class="pipe__step is-active"><span class="pipe__dot"></span><span>Pursuit<em>Awaiting GC response</em></span></li>
        <li class="pipe__step"><span class="pipe__dot"></span><span>Build<em>Crew + material staged</em></span></li>
        <li class="pipe__step"><span class="pipe__dot"></span><span>Showcase<em>Proof for the next job</em></span></li>
      </ol>
      <footer class="jobcard__foot"><div class="faces"><span class="face">GC</span><span class="face">EL</span><span class="face">SP</span><span class="face face--more">+4</span></div><p class="tiny muted">One job. The right people in the loop.</p></footer>
    </aside>
  </div>
  <div class="hero__ruler" aria-hidden="true"></div>
</section>

<section class="strip" aria-label="Trades and territories"><div class="strip__track" data-marquee>
  <ul><li>Electrical</li><li>Mechanical</li><li>Plumbing</li><li>Concrete</li><li>Glazing</li><li>Drywall</li><li>Roofing</li><li>Earthwork</li><li>Low voltage</li><li>Fire protection</li><li>Framing</li><li>Paving</li></ul>
  <ul aria-hidden="true"><li>Electrical</li><li>Mechanical</li><li>Plumbing</li><li>Concrete</li><li>Glazing</li><li>Drywall</li><li>Roofing</li><li>Earthwork</li><li>Low voltage</li><li>Fire protection</li><li>Framing</li><li>Paving</li></ul>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec__head" data-obs><div><span class="eyebrow">01 / The desk</span><h2 class="h2">Nine modes, one desk</h2><p class="lede">The parts of a job already depend on each other. Your tools finally do too — move the whole pipeline without starting over somewhere else.</p><p class="tiny muted" style="margin-top:12px">Plus Workforce, Fleet and Studio — see all nine.</p></div><a class="btn btn--line" href="modes.html">See all nine <span class="arrow">→</span></a></div>
  <div class="bento stagger" data-bento>
    ${MODES.slice(0, 6).map((m, i) => `<article class="card${i === 0 ? ' card--xl' : i === 3 ? ' card--wide' : ''}" data-group="${m[1]}" data-glow data-obs style="--i:${i}">
      <span class="card__stage">${m[1].toUpperCase()}</span><span class="mode-card__num mono">0${i + 1}</span>
      <h3>${m[0]}</h3><p>${m[2]}</p>
      ${i === 0 ? `<div class="card__demo"><div class="minirow"><span class="mono">TI · Pasadena</span><span class="tag tag--fit">92% fit</span></div><div class="minirow"><span class="mono">School mod · Norwalk</span><span class="tag">78% fit</span></div><div class="minirow"><span class="mono">Retail build · Irvine</span><span class="tag">71% fit</span></div></div>` : ''}
      ${i === 3 ? '<div class="bars" aria-hidden="true"><i style="--h:42%"></i><i style="--h:68%"></i><i style="--h:55%"></i><i style="--h:84%"></i><i style="--h:71%"></i><i style="--h:95%"></i></div>' : ''}
      <a class="link" href="modes.html#${m[0].toLowerCase()}">Explore ${m[0]}</a>
    </article>`).join('')}
  </div>
</div></section>

${inlineDemo('fit', '01 / Projects', 'The lead arrives already ranked', 'Opportunities are scored against your licence, your crew and the drive from your yard. Cycle through three bids to see the fit change — and why the third one is worth a second look.', fitScreen, 'Next opportunity', 'modes.html#projects')}

<section class="sec sec--alt"><div class="wrap">
  <div class="sec__head" data-obs><div><span class="eyebrow">02 / The path</span><h2 class="h2">A job, in motion</h2><p class="lede">Follow one Pasadena tenant improvement across the desk. Click a stage to see what changes.</p></div><a class="btn btn--line" href="how-it-works.html">Full walkthrough <span class="arrow">→</span></a></div>
  <div class="rail" data-rail>
    <div class="rail__track">
      <div class="rail__stop is-on" data-stop="0"><small>Find</small><b>The lead arrives</b><p>Already filtered to your trade and territory.</p></div>
      <div class="rail__stop" data-stop="1"><small>Win</small><b>Priced and sent</b><p>Three quotes, one defensible number.</p></div>
      <div class="rail__stop" data-stop="2"><small>Build</small><b>Everything staged</b><p>Material, cash, crew and trucks on one job.</p></div>
      <div class="rail__stop" data-stop="3"><small>Keep</small><b>Proof for next time</b><p>Finished work becomes the next lead.</p></div>
    </div>
    <div class="rail__detail" data-rail-detail><h4>The lead arrives already filtered</h4><p>Opportunities surface by trade and territory, so the first thing you read is already worth reading. Drive time comes from your yard, not a radius guess.</p></div>
  </div>
</div></section>

<section class="sec"><div class="wrap teaser" data-obs>
  <div><span class="eyebrow">03 / Human gate</span><h2 class="h2">Automation that waits for your yes</h2><p class="lede">Subagents prepare real work across the pipeline — qualifying opportunities, organising supplier requests, drafting the next step. Nothing executes until a person approves it.</p>
    <ul class="ticks ticks--lg" style="margin-top:24px"><li>You choose what work to hand off</li><li>A person approves every run</li><li>The result stays attached to the job</li></ul>
    <a class="btn btn--line" href="approvals.html">Open the approval desk <span class="arrow">→</span></a>
  </div>
  <div class="approve" data-approve>
    <header class="approve__top"><span class="mono tiny">PROJECTS → PLATFORM → EXCHANGE</span><span class="pill pill--warn" data-approve-pill>Needs your OK</span></header>
    <h3>Pursuit brief · Pasadena TI</h3><p>Trade fit confirmed. Supplier request drafted with the electrical scope and the due date.</p>
    <ul class="approve__facts"><li><span class="mono">Scope</span> attached</li><li><span class="mono">Suppliers</span> 3 matched</li><li><span class="mono">Status</span> no action taken yet</li></ul>
    <div class="approve__bar" data-approve-bar hidden><i></i></div>
    <div class="approve__btns"><button class="btn btn--ghost" data-approve-details>Review details</button><button class="btn btn--accent" data-approve-run>Approve run</button></div>
  </div>
</div></section>

<section class="sec sec--alt"><div class="wrap teaser teaser--reverse" data-obs>
  <div><span class="eyebrow">04 / Where we work</span><h2 class="h2">Built around the work on the ground</h2><p class="lede">We started where we are. Los Angeles first, then the counties the same crews already drive to.</p><a class="btn btn--line" href="coverage.html">See the coverage map <span class="arrow">→</span></a></div>
  <div class="teaser__art"><div class="mini-map"><i style="left:30%;top:40%"></i><i style="left:58%;top:58%"></i><i style="left:44%;top:24%"></i><i style="left:76%;top:34%;opacity:.45"></i></div><p class="mono tiny muted" style="margin-top:16px">LA · OC · SFV live &nbsp; / &nbsp; IE · SD opening next</p></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec__head" data-obs><h2 class="h2">From the people doing the work</h2><div class="car__btns"><button class="icon-btn" data-car-prev aria-label="Previous quote">‹</button><button class="icon-btn" data-car-next aria-label="Next quote">›</button></div></div>
  <div class="car" data-car><div class="car__track" data-car-track>
    <figure class="quotecard"><blockquote>We stopped running the bid in email and a spreadsheet. The scope, the three quotes and the due date sit on the job.</blockquote><figcaption><span class="face">RM</span><span><b>Rosa Medina</b><em>Estimator · 14-person electrical sub, Vernon</em></span></figcaption></figure>
    <figure class="quotecard"><blockquote>I used to find out about the cash gap the week payroll hit. Now I see it against the draw schedule a month out.</blockquote><figcaption><span class="face">DT</span><span><b>Dale Trujillo</b><em>Owner · Concrete contractor, Pomona</em></span></figcaption></figure>
    <figure class="quotecard"><blockquote>The supplier requests come in readable. Same scope, same dates, same format, every time.</blockquote><figcaption><span class="face">AK</span><span><b>Amy Kwan</b><em>Branch manager · Material supplier, Carson</em></span></figcaption></figure>
    <figure class="quotecard"><blockquote>Every company gets looked at by a person before they're in. That's the only reason I take the invitations here seriously.</blockquote><figcaption><span class="face">JB</span><span><b>Joel Barrera</b><em>Project manager · General contractor, Glendale</em></span></figcaption></figure>
  </div><div class="car__dots" data-car-dots></div></div>
</div></section>

<section class="cta" id="join"><div class="wrap cta__in" data-obs>
  <div><span class="eyebrow">Start here</span><h2 class="h2">Your next job starts on the desk</h2><p class="lede">Free to start, no card. We review every company before it joins.</p></div>
  ${joinForm()}
</div></section>`;

function joinForm() {
  return `<form class="joinform" data-join novalidate>
    <div class="field"><input id="co" type="text" placeholder=" " required data-v="text"><label for="co">Company name</label><small></small></div>
    <div class="field"><input id="em" type="email" placeholder=" " required data-v="email"><label for="em">Work email</label><small></small></div>
    <div class="field field--sel"><select id="tr" required><option value="">Choose one</option><option>Specialty subcontractor</option><option>General contractor</option><option>Material supplier</option><option>Owner or developer</option></select><label for="tr">You are a…</label><small></small></div>
    <button class="btn btn--accent btn--lg" type="submit" data-magnetic>Join free</button>
    <p class="tiny muted">Reviewed by a person, usually within a business day.</p>
  </form>`;
}

/* ---------------- MODES ---------------- */
const modes = `
<section class="phero"><div class="wrap phero__in">
  <div><div class="crumbs"><a href="index.html">Home</a> / <span>Nine modes</span></div><span class="eyebrow">The desk / 01</span>
    <h1 class="phero__h1">Nine modes.<br><em>One job.</em></h1>
    <p class="lede">Find it, win it, build it, keep it. Each mode does one job well and already shares the same job record with the others.</p></div>
  <div class="phero__meta"><span class="pill pill--live"><i></i>All nine connected</span><span class="coord">DJS-014 / Pasadena TI</span><a class="btn btn--accent" data-magnetic href="join.html">Open a free desk <span class="arrow">→</span></a></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec__head" data-obs><div><h2 class="h2">Pick the part you need</h2><p class="lede">Start with one. The rest switch on when the job asks for them.</p></div>
    <div class="chips" role="tablist" aria-label="Filter modes"><button class="chip is-on" data-filter="all">All nine</button><button class="chip" data-filter="find">Find</button><button class="chip" data-filter="win">Win</button><button class="chip" data-filter="build">Build</button><button class="chip" data-filter="keep">Keep</button></div>
  </div>
  <div class="bento stagger" data-bento>
    ${MODES.map((m, i) => `<article class="card mode-card" id="${m[0].toLowerCase()}" data-group="${m[1]}" data-glow data-obs data-mode="${i}" style="--i:${i % 3}">
      <span class="card__stage">${m[1].toUpperCase()}</span><span class="mode-card__num mono">${String(i + 1).padStart(2, '0')}</span>
      <h3>${m[0]}</h3><p>${m[2]}</p>
      <ul class="mode-card__bullets">${m[3].map(b => `<li>${b}</li>`).join('')}</ul>
      <span class="link">Open details <span class="arrow">→</span></span>
    </article>`).join('')}
  </div>
</div></section>

<section class="sec sec--alt"><div class="wrap">
  <h2 class="h2" data-obs>Four stages, one continuous record</h2>
  <p class="lede" data-obs>Every mode writes to the same job, so nothing is re-keyed when the work moves on.</p>
  <div class="stagerail" data-stagerail>
    <button class="is-on" data-stage="find">01 · Find</button><button data-stage="win">02 · Win</button><button data-stage="build">03 · Build</button><button data-stage="keep">04 · Keep</button>
  </div>
  <div class="rail__detail" data-stage-detail><h4>Find — the work arrives already sorted</h4><p>Projects and Exchange surface opportunities by trade and territory. Fit is scored against your licence, your crew and the drive from your yard.</p></div>
</div></section>

${inlineDemo('send', 'Exchange / Find', 'One request, three readable replies', 'A subagent drafts the supplier request from the scope. You approve it, then the quotes come back into the same thread. No phone tag, no re-keying.', sendScreen, 'Send the request', 'modes.html#exchange')}

${ctaStrip()}

<div class="sheet-back" data-sheet-back hidden></div>
<aside class="sheet" data-sheet hidden aria-label="Mode details"><button class="sheet__x" data-sheet-x aria-label="Close details">&times;</button><div data-sheet-body></div></aside>`;

function ctaStrip() {
  return `<section class="cta"><div class="wrap cta__in" data-obs><div><span class="eyebrow">Ready when you are</span><h2 class="h2">Put the desk to work</h2><p class="lede">Free to start. A person reviews every company before it joins.</p></div><div><a class="btn btn--accent btn--lg" data-magnetic href="join.html">Create a free account</a><p class="tiny muted" style="margin-top:14px">Usually reviewed within one business day.</p></div></div></section>`;
}

/* ---------------- HOW IT WORKS ---------------- */
const how = `
<section class="phero"><div class="wrap phero__in">
  <div><div class="crumbs"><a href="index.html">Home</a> / <span>How it works</span></div><span class="eyebrow">The path / 02</span>
    <h1 class="phero__h1">Watch a job <em>move.</em></h1><p class="lede">DJS-014, a commercial tenant improvement in Pasadena. One job, four stages, no re-keying.</p></div>
  <div class="phero__meta"><span class="pill pill--live"><i></i>In pursuit</span><span class="coord">Pasadena · Electrical · $280k–$340k</span></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="timeline" data-timeline><div class="timeline__fill" data-timeline-fill></div>
    <article class="chapter" data-chapter><div><span class="chapter__n">Chapter 01 / Find</span><h3>The lead arrives already filtered</h3><p>Opportunities surface by trade and territory, so the first thing you read is already worth reading. The owner and GC history come attached.</p><ul class="ticks"><li>Trade fit against your licence and crew</li><li>Drive time from your yard</li><li>Owner and GC history attached</li></ul></div><div class="chapter__art"><div class="feed" data-feed></div></div></article>
    <article class="chapter" data-chapter><div><span class="chapter__n">Chapter 02 / Win</span><h3>Price it without rebuilding the scope</h3><p>Quotes, exclusions and the bid form live on the job, so the number you send is the number you can defend.</p><ul class="ticks"><li>Three supplier quotes side by side</li><li>Scope gaps flagged early</li><li>Every revision kept with who changed it</li></ul></div><div class="chapter__art"><div class="quote-stack"><div class="quote"><span class="mono">Alpine Electric Supply</span><b>$184,200</b></div><div class="quote quote--best"><span class="mono">Harbor Wholesale</span><b>$176,840</b><em>Best</em></div><div class="quote"><span class="mono">Inland Conduit Co.</span><b>$191,500</b></div></div></div></article>
    <article class="chapter" data-chapter><div><span class="chapter__n">Chapter 03 / Build</span><h3>Material, cash, crew and trucks on one job</h3><p>When the award lands, the pieces are already attached — nothing gets re-keyed into another system.</p><ul class="ticks"><li>Lead times mapped to the build schedule</li><li>Draw vs payroll visible by week</li><li>Crew and equipment booked to the same dates</li></ul></div><div class="chapter__art"><div class="gantt"><i style="--s:0;--w:30%"></i><i style="--s:18%;--w:40%"></i><i style="--s:42%;--w:34%"></i><i style="--s:66%;--w:28%"></i></div></div></article>
    <article class="chapter" data-chapter><div><span class="chapter__n">Chapter 04 / Keep</span><h3>Finished work becomes the next lead</h3><p>Close-out photos, final numbers and the reference go into Studio, ready for the next proposal.</p><ul class="ticks"><li>Project page you can send to an owner</li><li>Performance carried into future bids</li><li>Repeat customers surfaced automatically</li></ul></div><div class="chapter__art"><div class="proof"><div class="proof__img"></div><div class="proof__meta"><b>Sample close-out · Pasadena TI</b><span class="mono tiny">On time · 2 RFIs · $312,400 final</span></div></div></div></article>
  </div>
</div></section>

<section class="sec sec--alt"><div class="wrap two" data-obs><div><span class="eyebrow">Same record</span><h2 class="h2">Click through the job</h2><p class="lede">The live card below tracks a real pursuit. Step through the pipeline to see what each stage adds.</p></div>
  <aside class="jobcard" data-tilt><header class="jobcard__top"><div><span class="mono tiny">DJS-014</span><h3>Commercial tenant improvement</h3><p class="mono tiny muted">Pasadena, CA · Electrical</p></div><span class="pill pill--live"><i></i>In motion</span></header>
    <ol class="pipe" data-pipe>
      <li class="pipe__step is-done"><span class="pipe__dot"></span><span>Found<em>Matched to your trade</em></span></li>
      <li class="pipe__step is-done"><span class="pipe__dot"></span><span>Priced<em>Bid built from 3 quotes</em></span></li>
      <li class="pipe__step is-active"><span class="pipe__dot"></span><span>Pursuit<em>Awaiting GC response</em></span></li>
      <li class="pipe__step"><span class="pipe__dot"></span><span>Build<em>Crew + material staged</em></span></li>
      <li class="pipe__step"><span class="pipe__dot"></span><span>Showcase<em>Proof for the next job</em></span></li>
    </ol><footer class="jobcard__foot"><div class="faces"><span class="face">GC</span><span class="face">EL</span><span class="face">SP</span><span class="face face--more">+4</span></div><p class="tiny muted">One job. The right people in the loop.</p></footer>
  </aside>
</div></section>

${inlineDemo('route', 'Platform / Win', 'The pursuit moves, the notes stay', 'Scope, quotes and the next action travel with the job. Advance the card and watch the record keep its history at every stage.', routeScreen, 'Advance the job', 'modes.html#platform')}

${ctaStrip()}`;

/* ---------------- APPROVALS ---------------- */
const approvals = `
<section class="phero"><div class="wrap phero__in">
  <div><div class="crumbs"><a href="index.html">Home</a> / <span>Approvals</span></div><span class="eyebrow">The human gate / 03</span>
    <h1 class="phero__h1">Automation that <em>waits.</em></h1><p class="lede">Subagents prepare the paperwork. A person decides what goes out. Nothing is sent, bought or committed without your yes.</p></div>
  <div class="phero__meta"><span class="pill pill--live"><i></i>3 tasks queued</span><span class="coord">Every run logged · Every run reviewed</span></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sim" data-sim>
    <div><span class="eyebrow">The queue</span><h2 class="h2">Three things waiting on you</h2><p class="lede">Pick a task, read the brief, then approve or send it back. The log records everything.</p>
      <div class="queue" data-queue>
        <div class="qitem is-on" data-task="0"><span class="pill pill--warn">Review</span><span><b>Pursuit brief · Pasadena TI</b><small>Projects → Platform → Exchange</small></span></div>
        <div class="qitem" data-task="1"><span class="pill pill--warn">Review</span><span><b>Supplier request · conduit</b><small>Exchange · due Thursday</small></span></div>
        <div class="qitem" data-task="2"><span class="pill pill--warn">Review</span><span><b>Cash gap note · week 6</b><small>Capital · $48k projected</small></span></div>
      </div>
      <div class="log"><span class="eyebrow">Approval log</span><div data-log></div></div>
    </div>
    <div class="approve" data-approve>
      <header class="approve__top"><span class="mono tiny" data-sim-route>PROJECTS → PLATFORM → EXCHANGE</span><span class="pill pill--warn" data-approve-pill>Needs your OK</span></header>
      <h3 data-sim-title>Pursuit brief · Pasadena TI</h3><p data-sim-desc>Trade fit confirmed. Supplier request drafted with the electrical scope and the due date.</p>
      <ul class="approve__facts" data-sim-facts><li><span class="mono">Scope</span> attached</li><li><span class="mono">Suppliers</span> 3 matched</li><li><span class="mono">Status</span> no action taken yet</li></ul>
      <div class="approve__bar" data-approve-bar hidden><i></i></div>
      <div class="approve__btns"><button class="btn btn--ghost" data-approve-details>Review details</button><button class="btn btn--accent" data-approve-run>Approve run</button></div>
    </div>
  </div>
</div></section>

<section class="sec sec--alt"><div class="wrap">
  <h2 class="h2" data-obs>What a subagent actually prepares</h2><p class="lede" data-obs>Real work, staged for your review — never an action taken on its own.</p>
  <div class="motion-grid stagger" style="margin-top:40px">
    ${[['Qualifies the lead','Scores an invitation against your licence, crew and drive time.'],['Drafts the request','Turns a scope into a supplier request with dates and exclusions.'],['Assembles the next step','Names the next action on a pursuit and who owes it.'],['Flags the cash gap','Compares draw and payroll by week before payroll lands.'],['Stages the crew','Matches certified crews and equipment to the build dates.'],['Writes the close-out','Pulls photos, final numbers and the reference into Studio.']].map((m, i) => `<div class="motion-card" data-obs style="--i:${i % 3}"><b>${m[0]}</b><p>${m[1]}</p></div>`).join('')}
  </div>
</div></section>

<section class="sec"><div class="wrap two" data-obs><div><span class="eyebrow">The safeguard</span><h2 class="h2">A person is always in the loop</h2><p class="lede">You choose what to hand off. You approve each run. The result stays attached to the job, with your name on it.</p></div>
  <ul class="ticks ticks--lg"><li>You choose what work to hand off</li><li>Every run needs an explicit approval</li><li>Nothing sends, buys or commits on its own</li><li>The full log stays with the job</li><li>Any run can be sent back for changes</li></ul>
</div></section>

${inlineDemo('dispatch', 'Fleet + Workforce / Build', 'Stage the morning in one pass', 'Crew certifications, equipment and material delivery all read from the job. Book the morning and watch the gate time fill in.', dispatchScreen, 'Dispatch the morning', 'modes.html#fleet')}

${ctaStrip()}`;

/* ---------------- ESTIMATOR ---------------- */
const estimator = `
<section class="phero"><div class="wrap phero__in">
  <div><div class="crumbs"><a href="index.html">Home</a> / <span>Estimator</span></div><span class="eyebrow">The tool / 04</span>
    <h1 class="phero__h1">Model your <em>week.</em></h1><p class="lede">Move the sliders to your shop. The numbers are illustrative — a way to see the shape of your pipeline, not a quote.</p></div>
  <div class="phero__meta"><span class="pill pill--live"><i></i>Interactive model</span><span class="coord">Illustrative · not a quote</span></div>
</div></section>

<section class="sec"><div class="wrap" data-est>
  <div class="sec__head" data-obs><div><h2 class="h2">What the desk gives back</h2><p class="lede">Try a preset, then tune it.</p></div><div class="presets"><button class="chip is-on" data-preset="small">Small shop</button><button class="chip" data-preset="mid">Mid-size sub</button><button class="chip" data-preset="supplier">Supplier</button></div></div>
  <div class="est">
    <div class="est__controls">
      <label class="rng"><span>Bids you chase a month <b data-out="bids">8</b></span><input type="range" min="2" max="40" value="8" data-rng="bids"></label>
      <label class="rng"><span>Average job value <b data-out="value">$280k</b></span><input type="range" min="25" max="1500" step="5" value="280" data-rng="value"></label>
      <label class="rng"><span>Hours spent per bid <b data-out="hours">9</b></span><input type="range" min="2" max="30" value="9" data-rng="hours"></label>
      <label class="switch switch--inline"><input type="checkbox" data-rng="ai" checked><span class="switch__ui"></span><span>Let subagents prepare the paperwork</span></label>
    </div>
    <div class="est__out">
      <div class="ring" data-ring><svg viewBox="0 0 120 120"><circle class="ring__bg" cx="60" cy="60" r="52"></circle><circle class="ring__fg" cx="60" cy="60" r="52" data-ring-arc></circle></svg><div class="ring__mid"><b data-out="hit">34%</b><span>modelled hit rate</span></div></div>
      <div class="est__nums"><div><span>Hours back per month</span><b data-out="saved">41</b></div><div><span>Pipeline value in play</span><b data-out="pipe">$2.2M</b></div><div><span>Extra bids you could run</span><b data-out="extra">4</b></div></div>
    </div>
  </div>
  <div class="chart" data-chart>
    <div class="chart__row"><span>Bids chased</span><div class="chart__bar"><i data-bar="bids"></i></div><b data-chart="bids">8</b></div>
    <div class="chart__row"><span>Hours on bids</span><div class="chart__bar"><i data-bar="hours"></i></div><b data-chart="hours">72</b></div>
    <div class="chart__row"><span>Hours back</span><div class="chart__bar"><i data-bar="saved"></i></div><b data-chart="saved">41</b></div>
    <div class="chart__row"><span>Extra bids</span><div class="chart__bar"><i data-bar="extra"></i></div><b data-chart="extra">4</b></div>
  </div>
</div></section>

<section class="sec sec--alt"><div class="wrap narrow"><h2 class="h2" data-obs>What the model assumes</h2>
  <div class="acc" data-acc>
    <details class="acc__item" open><summary>Where the hours-back number comes from<span class="acc__ic"></span></summary><div class="acc__body"><p>The model assumes subagents prepare between 18% and 45% of the paperwork around a bid, depending on whether you let them draft the request and assemble the next action. It is a planning estimate, not a measured promise.</p></div></details>
    <details class="acc__item"><summary>How the hit rate is modelled<span class="acc__ic"></span></summary><div class="acc__body"><p>The hit rate starts from a baseline and adjusts for how focused your bid count is, whether paperwork is prepared ahead, and how much estimating time each bid gets. Tighter pipelines score higher simply because each bid gets more attention.</p></div></details>
    <details class="acc__item"><summary>Why pipeline value is not revenue<span class="acc__ic"></span></summary><div class="acc__body"><p>Pipeline value is bids × average job value. It shows how much work is in play, not what you will win. Hit rate and margin are separate questions.</p></div></details>
  </div>
</div></section>

${inlineDemo('cash', 'Capital / Build', 'See the gap before payroll lands', 'Draw and payroll sit on the same chart by week. Pick a week to watch the projection move from a quiet number to one you can act on.', cashScreen, 'Step through the weeks', 'modes.html#capital')}

${ctaStrip()}`;

/* ---------------- COVERAGE ---------------- */
const coverage = `
<section class="phero"><div class="wrap phero__in">
  <div><div class="crumbs"><a href="index.html">Home</a> / <span>Coverage</span></div><span class="eyebrow">The ground / 05</span>
    <h1 class="phero__h1">Where the crews <em>already drive.</em></h1><p class="lede">Los Angeles first, then the counties the same trucks already reach. Hover a marker to see what is open.</p></div>
  <div class="phero__meta"><span class="pill pill--live"><i></i>3 markets live</span><span class="coord">34°08′N 118°08′W</span></div>
</div></section>

<section class="sec"><div class="wrap two two--map" data-obs>
  <div><h2 class="h2">Live now, opening next</h2><p class="lede">Coverage follows the work, not a marketing map. Each new county opens when there is enough bid volume and supplier depth to make it useful.</p>
    <div class="legend"><span><i class="dot-live"></i>Live now</span><span><i class="dot-soon"></i>Opening next</span></div>
    <div class="counties" data-counties>
      <div class="county" data-county="Los Angeles County · 62 open bids"><b>Los Angeles County</b><span class="mono">62 open bids</span></div>
      <div class="county" data-county="Orange County · 28 open bids"><b>Orange County</b><span class="mono">28 open bids</span></div>
      <div class="county" data-county="San Fernando Valley · 19 open bids"><b>San Fernando Valley</b><span class="mono">19 open bids</span></div>
      <div class="county" data-county="Inland Empire · opening Q1"><b>Inland Empire</b><span class="mono">Opening Q1</span></div>
      <div class="county" data-county="San Diego · opening Q2"><b>San Diego</b><span class="mono">Opening Q2</span></div>
    </div>
  </div>
  <div class="map" data-map>
    <svg class="map__svg" viewBox="0 0 420 320"><path class="map__coast" d="M18 96 C70 118 92 150 128 176 C166 204 206 222 238 252 C262 274 282 294 300 312" fill="none"/><path class="map__inland" d="M150 28 C214 44 286 60 352 86 C392 102 404 132 398 168" fill="none"/></svg>
    <button class="pin pin--live" style="--x:30%;--y:40%" data-pin="Los Angeles County · 62 open bids"><i></i><span>LA</span></button>
    <button class="pin pin--live" style="--x:58%;--y:58%" data-pin="Orange County · 28 open bids"><i></i><span>OC</span></button>
    <button class="pin pin--live" style="--x:44%;--y:24%" data-pin="San Fernando Valley · 19 open bids"><i></i><span>SFV</span></button>
    <button class="pin pin--soon" style="--x:76%;--y:34%" data-pin="Inland Empire · opening Q1"><i></i><span>IE</span></button>
    <button class="pin pin--soon" style="--x:80%;--y:72%" data-pin="San Diego · opening Q2"><i></i><span>SD</span></button>
    <div class="map__tip" data-map-tip hidden></div><div class="map__grid"></div>
  </div>
</div></section>

<section class="sec sec--alt"><div class="wrap"><h2 class="h2" data-obs>How the desk expands</h2>
  <div class="expand" data-expand>
    <div class="is-on"><span class="eyebrow">Done</span><b>Los Angeles</b><p>Where the desk started. Bid volume, suppliers and crews all in one place.</p></div>
    <div class="is-on"><span class="eyebrow">Done</span><b>Orange County</b><p>Same crews, next county over. Live with 28 open bids.</p></div>
    <div><span class="eyebrow">Q1</span><b>Inland Empire</b><p>Supplier depth is building. Opening when the network is ready.</p></div>
    <div><span class="eyebrow">Q2</span><b>San Diego</b><p>The next frontier for the same trades and the same workflow.</p></div>
  </div>
</div></section>

${ctaStrip()}`;

/* ---------------- PRICING ---------------- */
const pricing = `
<section class="phero"><div class="wrap phero__in">
  <div><div class="crumbs"><a href="index.html">Home</a> / <span>Pricing</span></div><span class="eyebrow">The plans / 06</span>
    <h1 class="phero__h1">Start free. Pay when it <em>earns it.</em></h1><p class="lede">Every account is reviewed by a person before it joins the network.</p></div>
  <div class="phero__meta"><label class="switch"><span>Monthly</span><input type="checkbox" data-billing><span class="switch__ui"></span><span>Yearly <b class="save" style="color:var(--ds-success);font-size:11px">2 months free</b></span></label></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="prices stagger">
    <article class="price" data-glow data-obs style="--i:0"><h3>Yard</h3><p class="price__who">Owner-operators and small crews finding their next job.</p><p class="price__amt"><span data-price="0" data-price-year="0">$0</span><em>/month</em></p>
      <ul class="ticks"><li>Projects and Exchange</li><li>Three active pursuits</li><li>Reviewed company profile</li></ul><a class="btn btn--line" href="join.html">Create account</a></article>
    <article class="price price--pop" data-glow data-obs style="--i:1"><span class="price__badge">Most shops start here</span><h3>Desk</h3><p class="price__who">Subs and suppliers running real pipeline every week.</p><p class="price__amt"><span data-price="149" data-price-year="124">$149</span><em>/month</em></p>
      <ul class="ticks"><li>All nine modes</li><li>Unlimited pursuits and quotes</li><li>Subagents with human approval</li><li>Capital and Fleet scheduling</li></ul><a class="btn btn--accent" data-magnetic href="join.html">Start 14-day trial</a></article>
    <article class="price" data-glow data-obs style="--i:2"><h3>Region</h3><p class="price__who">Multi-office contractors coordinating across counties.</p><p class="price__amt"><span data-price="420" data-price-year="350">$420</span><em>/month</em></p>
      <ul class="ticks"><li>Everything in Desk</li><li>Multiple yards and teams</li><li>Shared supplier agreements</li><li>A named person on your account</li></ul><a class="btn btn--line" href="join.html">Talk to a person</a></article>
  </div>
</div></section>

<section class="sec sec--alt"><div class="wrap"><h2 class="h2" data-obs>Side by side</h2>
  <div class="table-wrap" data-obs><table class="cmp">
    <thead><tr><th>What you get</th><th>Yard</th><th>Desk</th><th>Region</th></tr></thead>
    <tbody>
      <tr><td>Active pursuits</td><td class="no">3</td><td>Unlimited</td><td>Unlimited</td></tr>
      <tr><td>All nine modes</td><td class="no">—</td><td class="yes">✓</td><td class="yes">✓</td></tr>
      <tr><td>Subagents with human approval</td><td class="no">—</td><td class="yes">✓</td><td class="yes">✓</td></tr>
      <tr><td>Capital and Fleet</td><td class="no">—</td><td class="yes">✓</td><td class="yes">✓</td></tr>
      <tr><td>Multiple yards and teams</td><td class="no">—</td><td class="no">—</td><td class="yes">✓</td></tr>
      <tr><td>Named account person</td><td class="no">—</td><td class="no">—</td><td class="yes">✓</td></tr>
      <tr><td>Company review before joining</td><td class="yes">✓</td><td class="yes">✓</td><td class="yes">✓</td></tr>
    </tbody>
  </table></div>
</div></section>

<section class="sec" id="faq"><div class="wrap narrow"><h2 class="h2" data-obs>Questions people actually ask</h2>
  <div class="acc" data-acc data-obs>
    <details class="acc__item" open><summary>Who gets into the network?<span class="acc__ic"></span></summary><div class="acc__body"><p>Contractors, subcontractors and suppliers working in Southern California. A person reviews the licence, the trade and the service area before an account goes live — usually within a business day.</p></div></details>
    <details class="acc__item"><summary>Do I have to use all nine modes?<span class="acc__ic"></span></summary><div class="acc__body"><p>No. Most shops start on Yard with Projects and Exchange; Platform switches on with Desk when a pursuit needs it. The rest switch on the same way, and they already share your job data when they do.</p></div></details>
    <details class="acc__item"><summary>What do the subagents actually do?<span class="acc__ic"></span></summary><div class="acc__body"><p>They prepare work: scoring whether an invitation fits your trade, drafting a supplier request from the scope, assembling the next action on a pursuit. They never send, buy or commit anything. A person approves each run.</p></div></details>
    <details class="acc__item"><summary>Is my pricing visible to anyone else?<span class="acc__ic"></span></summary><div class="acc__body"><p>Your quotes, margins and bid numbers are yours. Suppliers see the request you send them; general contractors see the bid you submit. Nothing else crosses company lines.</p></div></details>
    <details class="acc__item"><summary>We already run Procore. Does this replace it?<span class="acc__ic"></span></summary><div class="acc__body"><p>No. Project management starts after the award. Stratagem covers the part before it — finding, pricing and winning the job — and hands the won job off with its context intact.</p></div></details>
  </div>
</div></section>

${ctaStrip()}`;

/* ---------------- JOIN ---------------- */
const join = `
<section class="phero"><div class="wrap phero__in">
  <div><div class="crumbs"><a href="index.html">Home</a> / <span>Join</span></div><span class="eyebrow">The first step / 07</span>
    <h1 class="phero__h1">Open the <em>desk.</em></h1><p class="lede">Free to start, no card. Tell us who you are and what you do; a person reviews it before your account goes live.</p></div>
  <div class="phero__meta"><span class="pill pill--live"><i></i>Reviewed within a business day</span><span class="coord">Los Angeles, California</span></div>
</div></section>

<section class="sec"><div class="wrap join-grid" data-obs>
  <div><h2 class="h2">What happens next</h2><ol class="steps"><li><b>You tell us who you are</b><p>Company, work email and the side of the job you're on.</p></li><li><b>A person reviews it</b><p>Licence, trade and service area — checked by a human, usually within a business day.</p></li><li><b>Your desk opens</b><p>Projects and Exchange first. The rest switch on when a job needs them.</p></li></ol>
    <div class="contact"><span class="eyebrow">Talk to a person first</span><a href="mailto:hello@djstratageminc.com">hello@djstratageminc.com</a><span class="coord">34°08′N 118°08′W · Los Angeles</span></div>
  </div>
  ${joinForm()}
</div></section>

<section class="sec sec--alt"><div class="wrap"><h2 class="h2" data-obs>Small on purpose</h2><p class="lede" data-obs>The network stays useful because every company in it has been looked at by a person.</p>
  <div class="motion-grid stagger" style="margin-top:40px">
    ${[['Reviewed, not scraped','Every account is checked by a person against licence, trade and service area.'],['Your numbers stay yours','Quotes, margins and bids never cross company lines.'],['One job, one record','Nothing gets re-keyed when the work moves from finding to building.']].map((m, i) => `<div class="motion-card" data-obs style="--i:${i}"><b>${m[0]}</b><p>${m[1]}</p></div>`).join('')}
  </div>
</div></section>`;

/* ---------------- 404 ---------------- */
const notfound = `<section class="wrap notfound"><div class="notfound__code">404</div><span class="eyebrow">Off the survey grid</span><h1 class="h1">That parcel isn't on the map.</h1><p class="lede center" style="margin-inline:auto">The page moved or never existed. The desk is still where you left it.</p><div style="display:flex;gap:12px;justify-content:center;margin-top:24px"><a class="btn btn--accent" href="index.html">Back to the desk</a><a class="btn btn--line" href="modes.html">Browse nine modes</a></div></section>`;

const files = {
  'index.html': ['The construction desk for Southern California', 'Find the work, price it, build it. One account for the full job lifecycle — projects, bids, supply, capital, crews, fleet and finished-work proof.', home],
  'modes.html': ['Nine modes, one desk', 'Projects, Exchange, Platform, Solutions, Supply, Capital, Workforce, Fleet and Studio — one connected record for every job.', modes],
  'how-it-works.html': ['How a job moves', 'Follow one Pasadena tenant improvement from the first lead to the next customer through the D&J Stratagem desk.', how],
  'approvals.html': ['Automation that waits for your yes', 'Subagents prepare real work across the pipeline. A person approves every run before anything is sent.', approvals],
  'estimator.html': ['Bid estimator', 'Model your week: bids, job value, estimating hours and the hours a connected desk gives back.', estimator],
  'coverage.html': ['Coverage in Southern California', 'Los Angeles, Orange County and the San Fernando Valley live now. Inland Empire and San Diego next.', coverage],
  'pricing.html': ['Pricing', 'Start free with Yard. Desk and Region plans for shops running real pipeline every week.', pricing],
  'join.html': ['Join the desk', 'Create a free account. Every company is reviewed by a person before it joins the network.', join],
  '404.html': ['Page not found', 'That page is not on the survey grid.', notfound],
};

for (const [file, [title, desc, content]] of Object.entries(files)) {
  fs.writeFileSync(path.join(root, file), shell(file, title, desc, content));
  console.log('wrote', file);
}
