/* ============================================================
   D&J Stratagem — shared behaviour for the multi-page site.
   Vanilla JS. Every module checks for its own markup first, so the
   same file runs safely on all eight pages.
   ============================================================ */
(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const on = (s, e, fn, r = document) => { const el = $(s, r); if (el) el.addEventListener(e, fn); };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const burst = (fn, t = 180) => (e) => { e.preventDefault(); const href = e.currentTarget.href; fn(() => setTimeout(() => { location.href = href; }, reduce ? 0 : t)); };

  /* ---------- page wipe on internal navigation ---------- */
  const wipe = $('.page-wipe');
  function travel(href) {
    if (!href) return;
    if (reduce || !wipe) { location.href = href; return; }
    wipe.classList.remove('is-on');
    void wipe.offsetWidth;
    wipe.classList.add('is-on');
    setTimeout(() => { location.href = href; }, 420);
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    travel(url.pathname + url.hash);
  });
  addEventListener('pageshow', () => wipe && wipe.classList.remove('is-on'));

  /* ---------- toasts ---------- */
  const toastHost = $('[data-toasts]');
  function toast(msg) {
    if (!toastHost) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<i></i>${msg}`;
    toastHost.appendChild(el);
    setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 300); }, 3200);
  }

  /* ---------- theme ---------- */
  on('[data-theme-toggle]', 'click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('djs-theme', next); } catch (e) {}
    drawBlueprint();
    toast(next === 'dark' ? 'Graphite at dusk' : 'Drafting paper');
  });

  /* ---------- scroll chrome ---------- */
  const bar = $('[data-progress]'), hdr = $('[data-header]'), totop = $('[data-totop]');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = ((max > 0 ? scrollY / max : 0) * 100).toFixed(2) + '%';
    if (hdr) hdr.classList.toggle('is-stuck', scrollY > 8);
    if (totop) totop.classList.toggle('is-on', scrollY > 700);
    drawTimeline();
  };
  addEventListener('scroll', onScroll, { passive: true });
  on('[data-totop]', 'click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  on('[data-topbar-close]', 'click', () => { const t = $('[data-topbar]'); if (t) t.hidden = true; });

  /* ---------- mega menu (hover + keyboard) ---------- */
  const megaRoot = $('[data-mega-root]'), mega = $('[data-mega]'), megaBtn = $('[data-mega-btn]');
  if (megaRoot && mega) {
    let timer;
    const openMega = (bool) => {
      clearTimeout(timer);
      if (bool) { mega.hidden = false; requestAnimationFrame(() => mega.classList.add('is-open')); }
      else { mega.classList.remove('is-open'); timer = setTimeout(() => { mega.hidden = true; }, 200); }
      if (megaBtn) megaBtn.setAttribute('aria-expanded', String(bool));
    };
    megaRoot.addEventListener('mouseenter', () => openMega(true));
    megaRoot.addEventListener('mouseleave', () => openMega(false));
    megaRoot.addEventListener('focusin', () => openMega(true));
    megaRoot.addEventListener('focusout', (e) => { if (!megaRoot.contains(e.relatedTarget)) openMega(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') openMega(false); });
  }

  /* ---------- mobile drawer ---------- */
  const drawer = $('[data-drawer]'), burger = $('[data-drawer-open]');
  const closeDrawer = () => { if (drawer) { drawer.hidden = true; } if (burger) burger.classList.remove('is-on'); };
  if (burger) burger.addEventListener('click', () => {
    drawer.hidden = !drawer.hidden;
    burger.classList.toggle('is-on', !drawer.hidden);
  });
  on('[data-drawer-close]', 'click', closeDrawer);
  if (drawer) drawer.addEventListener('click', e => { if (e.target === drawer) closeDrawer(); });
  $$('.drawer__panel a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ---------- blueprint canvas ---------- */
  const cv = $('[data-blueprint]');
  let ctx, bpT = 0;
  function drawBlueprint() {
    if (!cv) return;
    if (!ctx) ctx = cv.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cs = getComputedStyle(document.body);
    const line = cs.getPropertyValue('--ds-grid-line').trim() || 'rgba(120,160,190,.1)';
    const accent = cs.getPropertyValue('--ds-accent-2').trim();
    const step = 34;
    ctx.strokeStyle = line; ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += step) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += step) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); ctx.stroke(); }
    [[4, 3], [9, 7], [15, 2], [20, 9], [26, 5], [31, 11]].forEach(([gx, gy], i) => {
      const x = gx * step, y = gy * step;
      if (x > w || y > h) return;
      ctx.strokeStyle = accent;
      ctx.globalAlpha = reduce ? .5 : .32 + .28 * Math.sin(bpT / 40 + i);
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }
  if (cv) {
    drawBlueprint();
    if (!reduce) (function loop() { bpT++; drawBlueprint(); requestAnimationFrame(loop); })();
    addEventListener('resize', drawBlueprint);
  }

  /* ---------- pointer-reactive surfaces ---------- */
  const hero = $('[data-spotlight]');
  if (hero) hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
  $$('[data-glow]').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--gx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--gy', (e.clientY - r.top) + 'px');
  }));
  if (!reduce) {
    $$('[data-magnetic]').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .16}px, ${(e.clientY - r.top - r.height / 2) * .22}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    const tilt = $('[data-tilt]');
    if (tilt) {
      tilt.addEventListener('pointermove', e => {
        const r = tilt.getBoundingClientRect();
        tilt.style.transform = `perspective(900px) rotateX(${((e.clientY - r.top) / r.height - .5) * -5}deg) rotateY(${((e.clientX - r.left) / r.width - .5) * 6}deg)`;
      });
      tilt.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
    }
  }

  /* ---------- headline reveal ---------- */
  $$('[data-reveal-line]').forEach((l, i) => {
    const txt = l.textContent;
    l.innerHTML = `<span class="reveal-in" style="animation-delay:${reduce ? 0 : 120 + i * 110}ms">${txt}</span>`;
  });

  /* ---------- counters ---------- */
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target.toLocaleString(undefined, { minimumFractionDigits: dec }) + suffix; return; }
    const dur = 1500, t0 = performance.now();
    (function tick(t) {
      const k = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = (target * eased).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
      if (k < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  /* ---------- feed skeletons ---------- */
  const FEED = [
    ['Tenant improvement · Pasadena', 'Electrical · 92% fit', '2m'],
    ['Conduit + fittings request', 'Harbor Wholesale replied', '14m'],
    ['School modernisation · Norwalk', 'Walkthrough Thursday 7am', '1h'],
    ['Retail build-out · Irvine', 'Bid due in 4 days', '3h'],
  ];
  function startFeed(host) {
    host.innerHTML = '';
    FEED.forEach(() => { const s = document.createElement('div'); s.className = 'skel'; host.appendChild(s); });
    FEED.forEach(([a, b, t], i) => setTimeout(() => {
      const skel = host.querySelector('.skel');
      if (!skel) return;
      const row = document.createElement('div');
      row.className = 'feed__row';
      row.innerHTML = `<b>${a}</b><span class="muted tiny">${b}</span><span class="mono">${t}</span>`;
      host.replaceChild(row, skel);
    }, reduce ? 0 : 350 + i * 420));
  }

  /* ---------- observer: reveals, counters, feed, chapters ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (el.hasAttribute('data-count')) { countUp(el); io.unobserve(el); return; }
      if (el.hasAttribute('data-feed')) { startFeed(el); io.unobserve(el); return; }
      el.classList.add('is-in');
      if (el.hasAttribute('data-chapter')) el.classList.add('is-in');
      io.unobserve(el);
    });
  }, { threshold: .18, rootMargin: '0px 0px -40px' });
  $$('[data-count], [data-feed], [data-obs], [data-chapter]').forEach(el => io.observe(el));

  /* ---------- bento filter ---------- */
  const cards = $$('[data-bento] .card');
  $$('.chip[data-filter]').forEach(chip => chip.addEventListener('click', () => {
    $$('.chip[data-filter]').forEach(c => { c.classList.remove('is-on'); c.setAttribute('aria-selected', 'false'); });
    chip.classList.add('is-on'); chip.setAttribute('aria-selected', 'true');
    const f = chip.dataset.filter;
    cards.forEach(c => { c.classList.toggle('is-dim', f !== 'all' && c.dataset.group !== f); });
  }));

  /* ---------- tabs ---------- */
  const tabWrap = $('[data-tabs]');
  if (tabWrap) {
    const ink = $('[data-tab-ink]', tabWrap);
    const moveInk = btn => { if (!ink || !btn) return; ink.style.width = btn.offsetWidth + 'px'; ink.style.transform = `translateX(${btn.offsetLeft}px)`; };
    const tabs = $$('.tab', tabWrap);
    tabs.forEach(btn => btn.addEventListener('click', () => {
      tabs.forEach(b => { b.classList.remove('is-on'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('is-on'); btn.setAttribute('aria-selected', 'true');
      $$('.panel', tabWrap).forEach(p => p.classList.toggle('is-on', p.dataset.panel === btn.dataset.tab));
      moveInk(btn);
    }));
    const init = () => moveInk($('.tab.is-on', tabWrap));
    addEventListener('load', init); addEventListener('resize', init); setTimeout(init, 300);
  }

  /* ---------- home rail ---------- */
  const RAIL = [
    ['The lead arrives already filtered', 'Opportunities surface by trade and territory, so the first thing you read is already worth reading. Drive time comes from your yard, not a radius guess.'],
    ['Priced and ready to send', 'Three supplier quotes sit side by side with the scope and the exclusions. The number you send is the number you can defend.'],
    ['Material, cash, crew and trucks', 'When the award lands the pieces are already attached. Lead times, draw dates and crew bookings all read from the same job.'],
    ['Proof for the next job', 'Close-out photos, final numbers and the reference go into Studio, ready for the next proposal.'],
  ];
  if ($('[data-rail]')) {
    const detail = $('[data-rail-detail]');
    $$('[data-stop]').forEach(stop => stop.addEventListener('click', () => {
      const i = +stop.dataset.stop;
      $$('[data-stop]').forEach(s => s.classList.toggle('is-on', s === stop));
      detail.style.animation = 'none'; void detail.offsetWidth; detail.style.animation = '';
      detail.innerHTML = `<h4>${RAIL[i][0]}</h4><p>${RAIL[i][1]}</p>`;
    }));
  }

  /* ---------- modes: stage rail + detail sheet ---------- */
  const STAGES = {
    find: ['Find — the work arrives already sorted', 'Projects and Exchange surface opportunities by trade and territory. Fit is scored against your licence, your crew and the drive from your yard.'],
    win: ['Win — the pursuit stays in one place', 'Platform and Solutions hold scope, takeoff notes, quotes and the next action. Every revision is kept with the person who made it.'],
    build: ['Build — the pieces arrive attached', 'Supply, Capital, Workforce and Fleet read from the same job record. Nothing gets re-keyed into another system when the award lands.'],
    keep: ['Keep — finished work sells the next one', 'Studio turns close-out photos, final numbers and the reference into a project page you can send to an owner.'],
  };
  if ($('[data-stagerail]')) {
    const detail = $('[data-stage-detail]');
    $$('[data-stage]').forEach(btn => btn.addEventListener('click', () => {
      $$('[data-stage]').forEach(b => b.classList.toggle('is-on', b === btn));
      const s = STAGES[btn.dataset.stage];
      detail.style.animation = 'none'; void detail.offsetWidth; detail.style.animation = '';
      detail.innerHTML = `<h4>${s[0]}</h4><p>${s[1]}</p>`;
    }));
  }
  const sheet = $('[data-sheet]'), sheetBack = $('[data-sheet-back]');
  const closeSheet = () => { if (sheet) sheet.hidden = true; if (sheetBack) sheetBack.hidden = true; };
  $$('[data-mode]').forEach(card => card.addEventListener('click', () => {
    if (!sheet) return;
    const m = MODES[+card.dataset.mode];
    $('[data-sheet-body]', sheet).innerHTML = `
      <span class="card__stage">${m[1].toUpperCase()}</span><span class="mode-card__num mono">MODE ${String(+card.dataset.mode + 1).padStart(2, '0')}</span>
      <h3 style="margin-top:18px">${m[0]}</h3><p>${m[2]}</p>
      <div class="sheet__stat"><span>${m[4]}</span><span>Shared job record</span></div>
      <h4 class="h3">What it keeps honest</h4><ul class="ticks ticks--lg">${m[3].map(b => `<li>${b}</li>`).join('')}</ul>
      <a class="btn btn--accent" href="join.html" style="margin-top:28px">Open a free desk <span class="arrow">→</span></a>`;
    sheet.hidden = false; sheetBack.hidden = false;
  }));
  on('[data-sheet-x]', 'click', closeSheet);
  if (sheetBack) sheetBack.addEventListener('click', closeSheet);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  /* ---------- approval simulator ---------- */
  const TASKS = [
    { title: 'Pursuit brief · Pasadena TI', route: 'PROJECTS → PLATFORM → EXCHANGE', desc: 'Trade fit confirmed. Supplier request drafted with the electrical scope and the due date.', facts: [['Scope', 'attached'], ['Suppliers', '3 matched'], ['Status', 'no action taken yet']] },
    { title: 'Supplier request · conduit', route: 'EXCHANGE → SUPPLY', desc: 'A readable request with quantity, lead time and the delivery date the job needs.', facts: [['Items', '14 lines'], ['Lead time', '11 days'], ['Status', 'awaiting your OK']] },
    { title: 'Cash gap note · week 6', route: 'CAPITAL → PLATFORM', desc: 'Draw and payroll compared by week. A gap is projected before it lands.', facts: [['Gap', '$48k projected'], ['Week', '6'], ['Status', 'draft only']] },
  ];
  let activeTask = 0;
  if ($('[data-sim]')) {
    const renderTask = i => {
      activeTask = i;
      const t = TASKS[i];
      $('[data-sim-title]').textContent = t.title;
      $('[data-sim-route]').textContent = t.route;
      $('[data-sim-desc]').textContent = t.desc;
      $('[data-sim-facts]').innerHTML = t.facts.map(([k, v]) => `<li><span class="mono">${k}</span> ${v}</li>`).join('');
      $$('.qitem').forEach(q => q.classList.toggle('is-on', +q.dataset.task === i));
      const approve = $('[data-approve]');
      approve.classList.remove('is-done');
      const pill = $('[data-approve-pill]');
      pill.textContent = 'Needs your OK'; pill.className = 'pill pill--warn';
      const btn = $('[data-approve-run]'); btn.disabled = false; btn.textContent = 'Approve run';
      $('[data-approve-bar]').hidden = true;
      $('[data-approve-bar] i').style.width = '0';
    };
    $$('.qitem').forEach(q => q.addEventListener('click', () => renderTask(+q.dataset.task)));
    const log = $('[data-log]');
    log.innerHTML = `<div class="log__line"><span class="mono">09:41</span><span>3 runs queued for your review</span></div>`;
    $('[data-approve-details]').addEventListener('click', () => toast('Opened the full brief for review'));
    $('[data-approve-run]').addEventListener('click', e => {
      const btn = e.currentTarget;
      btn.disabled = true; btn.textContent = 'Running…';
      const wrap = $('[data-approve-bar]');
      wrap.hidden = false;
      requestAnimationFrame(() => { $('i', wrap).style.width = '100%'; });
      const pill = $('[data-approve-pill]');
      pill.textContent = 'Approved by you'; pill.className = 'pill pill--ok';
      setTimeout(() => {
        $('[data-approve]').classList.add('is-done');
        btn.textContent = 'Run complete';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        log.insertAdjacentHTML('beforeend', `<div class="log__line"><span class="mono">${time}</span><span>${TASKS[activeTask].title} — approved and attached to the job</span></div>`);
        toast('Run approved and attached to the job');
        const next = $$('.qitem').find(q => !q.classList.contains('is-done'));
        if (next) setTimeout(() => { next.classList.add('is-done'); renderTask(+next.dataset.task); toast('Next task loaded'); }, 1400);
      }, reduce ? 100 : 1700);
    });
  } else {
    on('[data-approve-details]', 'click', () => toast('Opened the pursuit brief'));
    on('[data-approve-run]', 'click', e => {
      const btn = e.currentTarget;
      btn.disabled = true; btn.textContent = 'Running…';
      const wrap = $('[data-approve-bar]');
      wrap.hidden = false;
      requestAnimationFrame(() => { $('i', wrap).style.width = '100%'; });
      const pill = $('[data-approve-pill]');
      pill.textContent = 'Approved by you'; pill.className = 'pill pill--ok';
      setTimeout(() => {
        $('[data-approve]').classList.add('is-done');
        btn.textContent = 'Run complete';
        toast('Supplier request sent to 3 matched suppliers');
      }, reduce ? 100 : 1700);
    });
  }

  /* ---------- estimator ---------- */
  const est = $('[data-est]');
  if (est) {
    const out = k => $(`[data-out="${k}"]`, est);
    const arc = $('[data-ring-arc]', est);
    const money = n => n >= 1000 ? '$' + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'M' : '$' + n + 'k';
    function calcEst() {
      const bids = +$('[data-rng="bids"]', est).value;
      const value = +$('[data-rng="value"]', est).value;
      const hours = +$('[data-rng="hours"]', est).value;
      const ai = $('[data-rng="ai"]', est).checked;
      out('bids').textContent = bids;
      out('value').textContent = '$' + value + 'k';
      out('hours').textContent = hours;
      const saved = Math.round(bids * hours * (ai ? .45 : .18));
      const hit = Math.min(62, Math.round(22 + (ai ? 11 : 4) + Math.max(0, 14 - bids) * .5 + (hours > 12 ? 4 : 0)));
      const pipe = bids * value;
      const extra = Math.max(1, Math.round(saved / Math.max(hours, 1)));
      out('saved').textContent = saved;
      out('hit').textContent = hit + '%';
      out('pipe').textContent = money(pipe);
      out('extra').textContent = extra;
      arc.style.strokeDashoffset = String(327 - (327 * hit) / 100);
      const chart = $('[data-chart]');
      if (chart) {
        const vals = { bids, hours: bids * hours, saved, extra };
        const max = Math.max(...Object.values(vals), 1);
        Object.entries(vals).forEach(([k, v]) => {
          $(`[data-bar="${k}"]`, chart).style.width = Math.round(v / max * 100) + '%';
          $(`[data-chart="${k}"]`, chart).textContent = v;
        });
      }
    }
    $$('[data-rng]', est).forEach(i => i.addEventListener('input', calcEst));
    calcEst();
    const PRESETS = { small: [6, 140, 7], mid: [12, 340, 10], supplier: [22, 95, 5] };
    $$('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
      $$('[data-preset]').forEach(b => b.classList.toggle('is-on', b === btn));
      const [b, v, h] = PRESETS[btn.dataset.preset];
      $('[data-rng="bids"]', est).value = b;
      $('[data-rng="value"]', est).value = v;
      $('[data-rng="hours"]', est).value = h;
      calcEst();
      toast('Loaded the ' + btn.textContent.toLowerCase() + ' scenario');
    }));
  }

  /* ---------- map + county tooltips ---------- */
  const map = $('[data-map]'), tip = $('[data-map-tip]');
  if (map && tip) {
    const showTip = (label, x, y) => {
      tip.hidden = false; tip.textContent = label;
      tip.style.left = x; tip.style.top = y;
    };
    $$('.pin', map).forEach(p => {
      const show = () => showTip(p.dataset.pin, p.style.getPropertyValue('--x'), p.style.getPropertyValue('--y'));
      p.addEventListener('pointerenter', show);
      p.addEventListener('focus', show);
      p.addEventListener('click', () => toast(p.dataset.pin));
      p.addEventListener('pointerleave', () => { tip.hidden = true; });
      p.addEventListener('blur', () => { tip.hidden = true; });
    });
    $$('[data-county]').forEach(c => c.addEventListener('pointerenter', () => {
      const pin = $$('.pin', map).find(p => p.dataset.pin === c.dataset.county);
      if (pin) showTip(pin.dataset.pin, pin.style.getPropertyValue('--x'), pin.style.getPropertyValue('--y'));
    }));
    $$('[data-county]').forEach(c => c.addEventListener('pointerleave', () => { tip.hidden = true; }));
  }

  /* ---------- testimonials carousel ---------- */
  const track = $('[data-car-track]');
  if (track) {
    const slides = $$('.quotecard', track), dotsHost = $('[data-car-dots]');
    const perView = () => (innerWidth <= 900 ? 1 : 2);
    const pages = () => Math.max(1, slides.length - perView() + 1);
    let idx = 0;
    function renderDots() {
      dotsHost.innerHTML = '';
      for (let i = 0; i < pages(); i++) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Quote ${i + 1}`);
        if (i === idx) b.classList.add('is-on');
        b.addEventListener('click', () => { idx = i; go(); });
        dotsHost.appendChild(b);
      }
    }
    function go() {
      idx = (idx + pages()) % pages();
      const w = slides[0].getBoundingClientRect().width + 16;
      track.style.transform = `translateX(${-idx * w}px)`;
      $$('button', dotsHost).forEach((b, i) => b.classList.toggle('is-on', i === idx));
    }
    on('[data-car-next]', 'click', () => { idx++; go(); });
    on('[data-car-prev]', 'click', () => { idx--; go(); });
    addEventListener('resize', () => { renderDots(); go(); });
    renderDots(); go();
  }

  /* ---------- pricing toggle ---------- */
  on('[data-billing]', 'change', e => {
    const yearly = e.target.checked;
    $$('[data-price]').forEach(p => {
      p.textContent = '$' + (yearly ? p.dataset.priceYear : p.dataset.price);
      p.classList.remove('is-flip'); void p.offsetWidth; p.classList.add('is-flip');
    });
    toast(yearly ? 'Showing yearly pricing — two months free' : 'Showing monthly pricing');
  });

  /* ---------- forms ---------- */
  const form = $('[data-join]');
  if (form) {
    const validate = input => {
      const field = input.closest('.field'), small = $('small', field);
      let msg = '';
      if (!input.value.trim()) msg = 'This one is required.';
      else if (input.dataset.v === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value)) msg = 'Use a work email that can receive the review notice.';
      field.classList.toggle('is-bad', !!msg);
      field.classList.toggle('is-ok', !msg);
      if (small) small.textContent = msg;
      return !msg;
    };
    $$('input[data-v]', form).forEach(i => {
      i.addEventListener('blur', () => validate(i));
      i.addEventListener('input', () => { if (i.closest('.field').classList.contains('is-bad')) validate(i); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const ok = $$('input[data-v]', form).map(validate).every(Boolean) && $('#tr', form).value;
      if (!ok) { toast('Check the highlighted fields'); return; }
      toast('Request received — a person reviews it within a business day');
      form.reset();
      $$('.field', form).forEach(f => f.classList.remove('is-ok', 'is-bad'));
    });
  }
  on('[data-news]', 'submit', e => { e.preventDefault(); toast('Subscribed to field notes'); e.target.reset(); });
  on('[data-copy]', 'click', async e => {
    const btn = e.currentTarget;
    try { await navigator.clipboard.writeText(btn.dataset.copy); toast('Email address copied'); }
    catch { toast('Copy blocked by the browser — select it manually'); }
  });

  /* ---------- scroll timeline ---------- */
  const timeline = $('[data-timeline]'), fill = $('[data-timeline-fill]');
  function drawTimeline() {
    if (!timeline || !fill) return;
    const r = timeline.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .55 - r.top) / r.height));
    fill.style.height = (p * 100).toFixed(2) + '%';
  }
  drawTimeline();

  /* ---------- pipeline steps ---------- */
  $$('[data-pipe] .pipe__step').forEach((step, i) => step.addEventListener('click', () => {
    $$('[data-pipe] .pipe__step').forEach((s, j) => {
      s.classList.toggle('is-done', j < i);
      s.classList.toggle('is-active', j === i);
    });
  }));

  /* ---------- mode data (shared by the sheet and the palette) ---------- */
  const MODES = [
    ['Projects', 'find', 'Bid invitations and public work filtered to the trades you actually self-perform and the counties you actually drive to.', ['Trade fit against licence and crew', 'Drive time from your yard', 'Owner and GC history attached'], '92% fit on the Pasadena TI'],
    ['Exchange', 'find', 'Post what you need, see who actually stocks it, and keep buyer and supplier reading the same request.', ['One readable request', 'Stock confirmed before you call', 'Buyer and supplier in sync'], '3 suppliers matched in 40 min'],
    ['Platform', 'win', 'The pursuit workspace behind every job: scope, takeoff notes, quotes, the next action and who owes it.', ['Scope and quotes on the job', 'Every revision kept', 'Next action always named'], '6 active pursuits · 0 lost notes'],
    ['Solutions', 'win', 'A connected setup for each side of the job — GC, sub, supplier — without three separate logins.', ['One identity per company', 'Permissions by role', 'No re-keying across sides'], 'GC · sub · supplier, one desk'],
    ['Supply', 'build', 'Source material against the real schedule, with lead times attached to the job that needs them.', ['Lead times on the schedule', 'Quotes compared side by side', 'Substitution flagged early'], 'Conduit order · 11-day lead'],
    ['Capital', 'build', 'See the cash gap between draw and payroll before it happens, not during it.', ['Draw vs payroll by week', 'Gap surfaced a month out', 'Numbers stay with the job'], '$48k gap, seen 4 weeks early'],
    ['Workforce', 'build', 'Match certified crews to the work ahead and keep the roster honest week to week.', ['Certifications checked', 'Crew booked to dates', 'Roster stays current'], '2 crews certified and available'],
    ['Fleet', 'build', 'Get trucks, lifts and equipment to the gate on the morning the work starts.', ['Equipment tied to the job', 'Gate time, not a guess', 'Conflicts visible early'], 'Boom lift booked for 7am'],
    ['Studio', 'keep', 'Turn a finished job into the thing that wins the next one: photos, scope, numbers, a reference that holds up.', ['Project page for an owner', 'Performance carried forward', 'Repeat customers surfaced'], 'Pasadena TI · complete'],
  ];

  /* ---------- command palette ---------- */
  const CMD = [
    ['Home', 'page', 'index.html'], ['Nine modes', 'page', 'modes.html'],
    ['How a job moves', 'page', 'how-it-works.html'], ['Approvals', 'page', 'approvals.html'],
    ['Bid estimator', 'tool', 'estimator.html'], ['Coverage map', 'page', 'coverage.html'],
    ['Pricing and plans', 'page', 'pricing.html'], ['Join the desk', 'action', 'join.html'],
    ...MODES.map(m => [m[0], 'mode', `modes.html#${m[0].toLowerCase()}`]),
    ['Who gets into the network?', 'answer', 'pricing.html#faq'],
    ['Does this replace Procore?', 'answer', 'pricing.html#faq'],
    ['Switch dark / light', 'action', 'theme'],
  ];
  const cmdk = $('[data-cmdk]'), cmdkInput = $('[data-cmdk-input]'), cmdkList = $('[data-cmdk-list]');
  let sel = 0, results = CMD;
  function renderCmd(q = '') {
    results = CMD.filter(([label, kind]) => (label + ' ' + kind).toLowerCase().includes(q.toLowerCase()));
    sel = 0;
    if (!results.length) { cmdkList.innerHTML = `<div class="cmdk__empty">Nothing matches “${q}”. Try a mode, “pricing”, or “estimator”.</div>`; return; }
    cmdkList.innerHTML = results.map(([label, kind], i) => `<li class="${i === 0 ? 'is-sel' : ''}" data-i="${i}"><span class="kind">${kind}</span>${label}<em>↵</em></li>`).join('');
    $$('li', cmdkList).forEach(li => {
      li.addEventListener('mouseenter', () => { sel = +li.dataset.i; paintSel(); });
      li.addEventListener('click', () => runCmd(results[+li.dataset.i]));
    });
  }
  const paintSel = () => $$('li', cmdkList).forEach((li, i) => li.classList.toggle('is-sel', i === sel));
  function openCmd(on) {
    cmdk.hidden = !on;
    if (on) { cmdkInput.value = ''; renderCmd(); cmdkInput.focus(); }
  }
  function runCmd(item) {
    if (!item) return;
    openCmd(false);
    if (item[2] === 'theme') { $('[data-theme-toggle]').click(); return; }
    travel(item[2]);
  }
  on('[data-cmdk-open]', 'click', () => openCmd(true));
  if (cmdk) cmdk.addEventListener('click', e => { if (e.target === cmdk) openCmd(false); });
  if (cmdkInput) cmdkInput.addEventListener('input', e => renderCmd(e.target.value));
  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCmd(cmdk.hidden); return; }
    if (!cmdk || cmdk.hidden) return;
    if (e.key === 'Escape') openCmd(false);
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, results.length - 1); paintSel(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); paintSel(); }
    if (e.key === 'Enter') { e.preventDefault(); runCmd(results[sel]); }
  });

  document.body.classList.add('is-ready');
  onScroll();
})();
