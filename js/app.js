/* ============================================================
   COURSEVERSE — Application
   Hash router, global search, starfield, and page renderers.
   ============================================================ */

(function () {
  "use strict";

  /* ============================== INDEX ============================== */

  const COURSES = [].concat(CV.coursesA, CV.coursesB, CV.coursesC, CV.coursesD, CV.coursesE);
  const bySlug = {};
  COURSES.forEach((c) => { bySlug[c.slug] = c; });

  const fieldByCode = {}, fieldBySlug = {};
  CV.fields.forEach((f) => { fieldByCode[f.code] = f; fieldBySlug[f.slug] = f; });

  const qualBySlug = {}, levelByCode = {};
  CV.qualTypes.forEach((q) => { qualBySlug[q.slug] = q; });
  CV.levels.forEach((l) => { levelByCode[l.code] = l; });

  const degreeCount = (c) => (c.degrees.bachelors.length + c.degrees.masters.length + c.degrees.doctoral.length);
  const specCount = COURSES.reduce((n, c) => n + (c.specializations || []).length, 0);
  const progCount = COURSES.reduce((n, c) => n + degreeCount(c), 0);

  const allCountries = {};
  COURSES.forEach((c) => (c.countries || []).forEach((n) => { allCountries[n] = (allCountries[n] || 0) + 1; }));
  const COUNTRIES = Object.keys(allCountries).sort();

  /* ---------- search index ---------- */
  const SEARCH_INDEX = [];
  COURSES.forEach((c) => {
    const f = fieldByCode[c.field] || {};
    SEARCH_INDEX.push({
      type: "course", slug: c.slug, name: c.name, field: c.field,
      alias: (c.aliases || []).join(" ") + " " + c.slug.replace(/-/g, " "),
      tags: (c.specializations || []).join(" ") + " " + (c.study || []).slice(0, 8).join(" "),
      fieldCode: c.field, fieldName: f.name || "", boost: (c.popular ? 14 : 0) + (c.featured ? 8 : 0),
    });
  });
  CV.fields.forEach((f) => {
    SEARCH_INDEX.push({
      type: "field", slug: f.slug, name: f.name, field: f.code,
      alias: f.official + " " + f.code, tags: f.blurb + " " + (f.groups || []).map(g => g.name).join(" "),
      boost: 4,
    });
  });
  CV.qualTypes.forEach((q) => {
    SEARCH_INDEX.push({ type: "degree", slug: q.slug, name: q.name, alias: q.what.slice(0, 80), tags: q.isced + " " + q.duration, boost: 2 });
  });
  CV.levels.forEach((l) => {
    SEARCH_INDEX.push({ type: "level", slug: l.code, name: l.name, alias: "ISCED " + l.code, tags: l.desc, boost: 0 });
  });

  function searchAll(raw) {
    const q = (raw || "").trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    const out = [];
    for (const item of SEARCH_INDEX) {
      const name = item.name.toLowerCase();
      const alias = (item.alias || "").toLowerCase();
      const tags = (item.tags || "").toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (name.startsWith(t)) score += 110;
        else if (name.includes(t)) score += 55;
        if (alias.includes(t)) score += 38;
        if (tags.includes(t)) score += 10;
      }
      if (score > 0) out.push({ item, score: score + item.boost });
    }
    out.sort((a, b) => b.score - a.score);
    return out.map((o) => o.item);
  }

  /* ============================== UTILS ============================== */

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const icon = (name, cls) =>
    '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (CV.ICONS[name] || CV.ICONS.globe) + "</svg>";

  function hl(text, q) {
    const safe = esc(text);
    if (!q) return safe;
    const t = esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp("(" + t.split(/\s+/).map(esc).join("|") + ")", "ig"), "<mark>$1</mark>");
  }

  const fieldOf = (c) => fieldByCode[c.field] || { slug: "generic", name: "", hue: "#38bdf8", code: "" };
  const hueVar = (f) => ' style="--hue:' + f.hue + '"';

  const courseCard = (c, q) => {
    const f = fieldOf(c);
    const count = c.specializations.length;
    return '<article class="course-card reveal" data-go="#/course/' + c.slug + '" style="--cc:' + f.hue + '">' +
      '<div class="cc-band"></div><div class="cc-body">' +
      '<span class="cc-kicker">' + esc(f.code) + " · " + esc(f.name) + "</span>" +
      '<h3 class="cc-name">' + hl(c.name, q) + "</h3>" +
      '<p class="cc-blurb">' + esc(c.what.split(/[.—]/)[0]) + "</p>" +
      '<div class="cc-meta"><span class="cc-pill">' + count + ' areas</span><span class="cc-pill">' + degreeCount(c) + ' programmes</span></div>' +
      "</div></article>";
  };

  const flag = (n) => CV.flag(n);

  /* ============================== STARFIELD ============================== */

  function initStars() {
    const canvas = document.getElementById("starfield");
    const ctx = canvas.getContext("2d");
    let W, H, stars = [], shooting = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const n = Math.min(220, Math.floor((W * H) / 11000));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.6 + 0.15,
        tw: Math.random() * 0.02 + 0.004,
        ph: Math.random() * Math.PI * 2,
        vy: Math.random() * 0.02 + 0.005,
        hue: Math.random() < 0.12 ? (Math.random() < 0.5 ? "189,216,255" : "216,180,254") : "255,255,255",
      }));
    }
    function spawnShooting() {
      if (reduced || Math.random() > 0.006) return;
      shooting.push({ x: Math.random() * W * 0.8, y: Math.random() * H * 0.35, vx: 6 + Math.random() * 4, vy: 2 + Math.random() * 2, life: 1 });
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.ph += s.tw;
        const tw = 0.55 + 0.45 * Math.sin(s.ph);
        s.y -= s.vy; if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 7);
        ctx.fillStyle = "rgba(" + s.hue + "," + (s.a * tw).toFixed(3) + ")";
        ctx.fill();
      }
      spawnShooting();
      shooting = shooting.filter((m) => m.life > 0);
      for (const m of shooting) {
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
        grad.addColorStop(0, "rgba(160,210,255," + (0.8 * m.life).toFixed(2) + ")");
        grad.addColorStop(1, "rgba(160,210,255,0)");
        ctx.strokeStyle = grad; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9); ctx.stroke();
        m.x += m.vx; m.y += m.vy; m.life -= 0.02;
      }
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize", resize);
    if (!reduced) requestAnimationFrame(frame);
    else { /* static stars */ frame.call(null); }
  }

  /* ============================== REVEAL / CHROME ============================== */

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

  function initReveal(root) {
    const els = (root || document).querySelectorAll(".reveal:not(.in)");
    els.forEach((el) => io.observe(el));
    // Safety net: if IntersectionObserver hasn't fired (throttled/background tabs),
    // force-reveal anything already inside the viewport after a short grace period.
    setTimeout(() => {
      els.forEach((el) => {
        if (el.classList.contains("in")) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
      });
    }, 1200);
  }

  function initChrome() {
    const header = document.getElementById("siteHeader");
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 30);
      const bt = document.getElementById("toTop");
      if (bt) bt.classList.toggle("show", window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const toggle = document.getElementById("menuToggle");
    toggle.addEventListener("click", () => document.body.classList.toggle("menu-open"));
    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-link]");
      if (link) document.body.classList.remove("menu-open");
    });
  }

  /* ============================== HEADER / FOOTER INJECT ============================== */

  const toTopBtn = '<button class="back-top" id="toTop" aria-label="Back to top">↑</button>';
  document.body.insertAdjacentHTML("beforeend", toTopBtn);
  document.addEventListener("click", (e) => {
    if (e.target.closest("#toTop")) window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function setActiveNav(name) {
    document.querySelectorAll(".nav-link").forEach((a) => a.classList.toggle("active", a.dataset.nav === name));
  }

  /* ============================== VIEWS ============================== */

  const app = document.getElementById("app");
  const perPage = 24;

  /* ---------- HOME ---------- */
  function viewHome() {
    const featured = COURSES.filter((c) => c.featured).slice(0, 8);
    const popular = COURSES.filter((c) => c.popular).slice(0, 16);
    const popularExtra = ["computer-science", "medicine", "psychology", "artificial-intelligence", "law", "data-science", "cybersecurity", "business-administration", "mechanical-engineering", "architecture", "nursing", "pharmacy", "fine-arts", "music", "mathematics", "economics"]
      .map((s) => bySlug[s]).filter(Boolean);

    const tickerItems = [
      "<b>" + CV.fields.length + "</b> broad fields", "<b>" + COURSES.length + "</b> courses & fields explained",
      "<b>" + specCount + "</b> specializations", "<b>" + progCount + "</b> programme names",
      "<b>" + COUNTRIES.length + "</b> countries mapped", "<b>" + CV.levels.length + "</b> ISCED education levels",
      "<b>0</b> career quizzes", "<b>0</b> personality tests", "<b>0</b> rankings",
    ];
    const ticker = tickerItems.map((t) => '<span class="ticker-item">' + t + "</span>").join("");

    const fieldCards = CV.fields.map((f, i) => {
      const n = COURSES.filter((c) => c.field === f.code).length;
      return '<a class="field-card reveal d' + ((i % 6) + 1) + '" href="#/field/' + f.slug + '" data-link style="--fc:' + f.hue + '" data-hue="' + f.hue + '">' +
        '<div class="fc-top"><span class="fc-icon">' + icon(f.icon) + "</span><span class=\"fc-code\">" + esc(f.code) + "</span></div>" +
        '<h3 class="fc-name">' + esc(f.name) + "</h3>" +
        '<p class="fc-tagline">' + esc(f.tagline) + "</p>" +
        '<div class="fc-foot"><span class="fc-count">' + n + " courses</span>" + icon("arrow", "fc-arrow") + "</div></a>";
    }).join("");

    const featCards = featured.map((c, i) => {
      const f = fieldOf(c);
      return '<article class="course-card reveal d' + ((i % 4) + 1) + '" data-go="#/course/' + c.slug + '" style="--cc:' + f.hue + '">' +
        '<div class="cc-band"></div><div class="cc-body">' +
        '<span class="cc-kicker">' + esc(f.code) + " · " + esc(f.name) + "</span>" +
        '<h3 class="cc-name">' + esc(c.name) + "</h3>" +
        '<p class="cc-blurb">' + esc(c.what.split(/[.—]/)[0]) + "</p>" +
        '<div class="cc-meta"><span class="cc-pill">' + c.specializations.length + " areas</span><span class=\"cc-pill\">" + degreeCount(c) + " programmes</span></div>" +
        "</div></article>";
    }).join("");

    const chips = (popularExtra.length ? popularExtra : popular).map((c) =>
      '<a class="chip" href="#/course/' + c.slug + '" data-link>' + esc(c.name) + "</a>").join("");

    const ladder = CV.levels.map((l, i) =>
      '<div class="ladder-row reveal d' + ((i % 6) + 1) + '"><span class="lr-code">ISCED ' + l.code + '</span><span class="lr-name">' + esc(l.name) + '</span><span class="lr-desc">' + esc(l.desc) + "</span></div>").join("");

    const steps = [
      { n: "01", t: "Pick any course", d: "Search or browse 100+ fields and courses — from Medicine to Machine Learning." },
      { n: "02", t: "Understand it", d: "A plain-English explanation of what the course actually is. No jargon walls." },
      { n: "03", t: "See what you study", d: "The real subjects inside the course — anatomy, algorithms, auditing, whatever it is." },
      { n: "04", t: "Explore the degrees", d: "Specializations, programme names and how the same field is named around the world." },
    ].map((s) => '<div class="step-card reveal"><span class="step-num">' + s.n + '</span><h3 class="step-name">' + s.t + '</h3><p class="step-desc">' + s.d + "</p></div>").join("");

    app.innerHTML =
      '<section class="hero">' +
        '<span class="hero-eyebrow reveal"><span class="dot"></span>The global encyclopedia of courses</span>' +
        '<h1 class="hero-title reveal d1">Explore <span class="italic">everything</span><br/>you can study</h1>' +
        '<p class="hero-sub reveal d2">Search any course, field or degree. Courseverse tells you what it is, what you study in it, and what the major subjects and specializations are. Nothing more. Nothing less.</p>' +
        '<div class="search-wrap reveal d3" id="homeSearch"></div>' +
        '<div class="search-hint reveal d4">Try: <button data-q="Computer Science">Computer Science</button> · <button data-q="Medicine">Medicine</button> · <button data-q="Cybersecurity">Cybersecurity</button> · <button data-q="Psychology">Psychology</button> · <button data-q="Design">Design</button></div>' +
        '<div class="ticker reveal d5"><div class="ticker-track">' + ticker + ticker + "</div></div>" +
      "</section>" +

      '<section class="section">' +
        '<div class="section-head reveal"><span class="section-kicker">The master universe</span>' +
        '<h2 class="section-title">The 11 fields of <span class="italic">everything</span></h2>' +
        '<p class="section-sub">The backbone follows UNESCO\'s ISCED-F 2013 international classification — the world\'s agreed map of education fields. Every course lives inside one of these 11 branches.</p></div>' +
        '<div class="fields-grid">' + fieldCards + "</div>" +
      "</section>" +

      '<section class="section">' +
        '<div class="section-head reveal"><span class="section-kicker">Start here</span>' +
        '<h2 class="section-title">Featured <span class="italic">fields of study</span></h2>' +
        '<p class="section-sub">The courses people search for most — each one explained simply: what it is, what you study, what you can earn.</p></div>' +
        '<div class="featured-grid">' + featCards + "</div>" +
        '<div class="section-cta reveal"><a class="btn primary" href="#/browse" data-link>Browse all ' + COURSES.length + ' courses ' + icon("arrow") + "</a></div>" +
      "</section>" +

      '<section class="section">' +
        '<div class="section-head reveal"><span class="section-kicker">Popular searches</span>' +
        '<h2 class="section-title">What the world is <span class="italic">looking up</span></h2></div>' +
        '<div class="chip-cloud reveal">' + chips + "</div>" +
      "</section>" +

      '<section class="section"><blockquote class="quote-block reveal">' +
        '<div class="quote-mark">“</div>' +
        '<p class="quote-text">No career quiz. No personality test. No “you should choose this.” Just understanding the course.</p>' +
        '<div class="quote-attr">The Courseverse principle</div></blockquote></section>' +

      '<section class="section">' +
        '<div class="section-head reveal"><span class="section-kicker">The global backbone</span>' +
        '<h2 class="section-title">ISCED — the 9 levels of <span class="italic">education</span></h2>' +
        '<p class="section-sub">Every degree in the world sits on UNESCO\'s International Standard Classification of Education. Courseverse maps every programme to its level.</p></div>' +
        '<div class="ladder">' + ladder + "</div>" +
      "</section>" +

      '<section class="section">' +
        '<div class="section-head reveal"><span class="section-kicker">How Courseverse works</span>' +
        '<h2 class="section-title">Simple by <span class="italic">design</span></h2></div>' +
        '<div class="steps-grid">' + steps + "</div>" +
      "</section>";

    buildSearchBox(document.getElementById("homeSearch"));
    initReveal(app);
    setActiveNav("home");
    document.title = "Courseverse — Explore Everything You Can Study";
  }

  /* ---------- SEARCH BOX (hero) ---------- */
  function buildSearchBox(wrap) {
    if (!wrap) return;
    wrap.innerHTML =
      '<div class="search-box">' + icon("search") +
      '<input class="search-input" id="searchInput" type="text" placeholder="Search any course, degree or field…" autocomplete="off" spellcheck="false"/>' +
      '<button class="search-go">Search</button></div>' +
      '<div class="search-results" id="searchResults"></div>';

    const input = wrap.querySelector("#searchInput");
    const box = wrap.querySelector("#searchResults");
    let sel = -1, results = [];

    const renderResults = (q) => {
      results = searchAll(q).slice(0, 8);
      sel = -1;
      if (!q.trim()) { box.classList.remove("open"); box.innerHTML = ""; return; }
      box.innerHTML = results.length
        ? results.map((r, i) => {
            const meta = r.type === "course" ? "COURSE · " + r.fieldName : r.type.toUpperCase();
            const href = r.type === "course" ? "#/course/" + r.slug : r.type === "field" ? "#/field/" + r.slug : r.type === "degree" ? "#/degree/" + r.slug : "#/level/" + r.slug;
            return '<div class="search-result-item" data-href="' + href + '"><span class="sr-name">' + hl(r.name, q) + '</span><span class="sr-meta">' + esc(meta) + "</span></div>";
          }).join("")
        : '<div class="search-empty">No match for “' + esc(q) + '” — try a broader word like “engineering” or “health”.</div>';
      box.classList.add("open");
    };

    input.addEventListener("input", () => renderResults(input.value));
    input.addEventListener("focus", () => renderResults(input.value));
    input.addEventListener("keydown", (e) => {
      const items = box.querySelectorAll(".search-result-item");
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (sel >= 0 && items[sel]) location.hash = items[sel].dataset.href;
        else if (results.length) location.hash = (results[0].type === "course" ? "#/course/" + results[0].slug : results[0].type === "field" ? "#/field/" + results[0].slug : "#/search/" + encodeURIComponent(input.value.trim()));
        else location.hash = "#/search/" + encodeURIComponent(input.value.trim());
        return;
      } else if (e.key === "Escape") { box.classList.remove("open"); return; }
      else return;
      items.forEach((it, i) => it.classList.toggle("sel", i === sel));
      if (items[sel]) items[sel].scrollIntoView({ block: "nearest" });
    });
    box.addEventListener("click", (e) => {
      const it = e.target.closest(".search-result-item");
      if (it) location.hash = it.dataset.href;
    });
    wrap.querySelector(".search-go").addEventListener("click", () => {
      const q = input.value.trim();
      if (q) location.hash = "#/search/" + encodeURIComponent(q);
    });
    wrap.querySelector(".search-go").addEventListener("click", () => input.blur());
    document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) box.classList.remove("open"); });
    input.focus();
  }

  document.addEventListener("click", (e) => {
    const hintBtn = e.target.closest(".search-hint button");
    if (hintBtn) {
      const input = document.getElementById("searchInput");
      if (input) { input.value = hintBtn.dataset.q; input.dispatchEvent(new Event("input")); input.focus(); }
    }
    const go = e.target.closest("[data-go]");
    if (go && !e.target.closest("a")) location.hash = go.dataset.go;
  });

  /* ---------- BROWSE ---------- */
  const browseState = { q: "", field: "", page: 1 };

  function viewBrowse() {
    const chips = ['<button class="fchip' + (browseState.field === "" ? " active" : "") + '" data-f="">All fields</button>']
      .concat(CV.fields.map((f) =>
        '<button class="fchip' + (browseState.field === f.code ? " active" : "") + '" data-f="' + f.code + '" style="--fc:' + f.hue + '"><span class="fdot"></span>' + esc(f.code) + " " + esc(f.name) + "</button>")).join("");

    app.innerHTML =
      '<section class="browse-head"><span class="section-kicker reveal in">The full catalogue</span>' +
      '<h1 class="page-title reveal in">All <span class="italic">courses</span></h1>' +
      '<p class="page-sub reveal in">Every course in the Courseverse universe — searchable and filterable by the 11 international fields.</p></section>' +
      '<section class="filters-bar">' +
        '<div class="browse-search-row"><div class="browse-search">' + icon("search") + '<input id="browseSearch" type="text" placeholder="Filter courses…" value="' + esc(browseState.q) + '" autocomplete="off"/></div></div>' +
        '<div class="filter-chips" id="fieldChips">' + chips + "</div>" +
      "</section>" +
      '<div class="results-meta" id="resultsMeta"></div>' +
      '<div class="courses-grid" id="browseGrid"></div>' +
      '<div class="pagination" id="browsePager"></div>';

    const input = document.getElementById("browseSearch");
    let deb;
    input.addEventListener("input", () => {
      clearTimeout(deb);
      deb = setTimeout(() => { browseState.q = input.value; browseState.page = 1; renderBrowseList(); }, 160);
    });
    document.getElementById("fieldChips").addEventListener("click", (e) => {
      const b = e.target.closest(".fchip"); if (!b) return;
      browseState.field = b.dataset.f; browseState.page = 1;
      document.querySelectorAll("#fieldChips .fchip").forEach((x) => x.classList.toggle("active", x === b));
      renderBrowseList();
    });
    renderBrowseList();
    setActiveNav("browse");
    document.title = "All Courses — Courseverse";
    initReveal(app);
    input.focus({ preventScroll: true });
  }

  function renderBrowseList() {
    const q = browseState.q.trim().toLowerCase();
    let list = COURSES.filter((c) => (!browseState.field || c.field === browseState.field) &&
      (!q || (c.name + " " + (c.aliases || []).join(" ") + " " + c.specializations.join(" ") + " " + c.what).toLowerCase().includes(q)));
    list.sort((a, b) => a.name.localeCompare(b.name));
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    if (browseState.page > pages) browseState.page = pages;
    const slice = list.slice((browseState.page - 1) * perPage, browseState.page * perPage);

    document.getElementById("resultsMeta").innerHTML = "<span>" + total + " courses</span><span>Page " + browseState.page + " / " + pages + "</span>";
    document.getElementById("browseGrid").innerHTML = slice.length
      ? slice.map((c) => courseCard(c, browseState.q)).join("")
      : '<div class="empty-state"><div class="es-icon">🔭</div><h3>Nothing found</h3><p>Try a different word — or clear the filters.</p></div>';

    let pager = "";
    if (pages > 1) {
      pager = '<button class="page-btn" data-p="' + (browseState.page - 1) + '"' + (browseState.page === 1 ? " disabled" : "") + ">←</button>";
      for (let i = 1; i <= pages; i++) {
        if (pages > 9 && i > 3 && i < pages - 2 && Math.abs(i - browseState.page) > 1) {
          if (pager.endsWith("…</span>") === false) pager += '<span style="align-self:center;color:var(--dim)">…</span>';
          continue;
        }
        pager += '<button class="page-btn' + (i === browseState.page ? " active" : "") + '" data-p="' + i + '">' + i + "</button>";
      }
      pager += '<button class="page-btn" data-p="' + (browseState.page + 1) + '"' + (browseState.page === pages ? " disabled" : "") + ">→</button>";
    }
    const pagerEl = document.getElementById("browsePager");
    pagerEl.innerHTML = pager;
    pagerEl.onclick = (e) => {
      const b = e.target.closest(".page-btn");
      if (b && !b.disabled && b.dataset.p) {
        browseState.page = Math.max(1, Math.min(pages, parseInt(b.dataset.p, 10)));
        renderBrowseList();
        document.querySelector(".filters-bar").scrollIntoView({ behavior: "smooth" });
      }
    };
    initReveal(app);
  }

  /* ---------- FIELDS ---------- */
  function viewFields() {
    const cards = CV.fields.map((f, i) => {
      const n = COURSES.filter((c) => c.field === f.code).length;
      const specs = COURSES.filter((c) => c.field === f.code).reduce((s, c) => s + c.specializations.length, 0);
      return '<a class="field-card reveal d' + ((i % 6) + 1) + '" href="#/field/' + f.slug + '" data-link style="--fc:' + f.hue + '">' +
        '<div class="fc-top"><span class="fc-icon">' + icon(f.icon) + '</span><span class="fc-code">' + esc(f.code) + "</span></div>" +
        '<h3 class="fc-name">' + esc(f.name) + "</h3>" +
        '<p class="fc-tagline">' + esc(f.tagline) + "</p>" +
        '<div class="fc-foot"><span class="fc-count">' + n + " courses · " + specs + ' areas</span>' + icon("arrow", "fc-arrow") + "</div></a>";
    }).join("");

    app.innerHTML =
      '<section class="browse-head"><span class="section-kicker reveal in">UNESCO ISCED-F 2013</span>' +
      '<h1 class="page-title reveal in">The 11 <span class="italic">fields</span></h1>' +
      '<p class="page-sub reveal in">The internationally agreed classification of fields of education — the skeleton of all human knowledge taught worldwide.</p></section>' +
      '<section class="section tight"><div class="fields-grid">' + cards + "</div></section>";

    initReveal(app); setActiveNav("fields");
    document.title = "The 11 Fields — Courseverse";
  }

  function viewField(slug) {
    const f = fieldBySlug[slug];
    if (!f) return viewNotFound();
    const courses = COURSES.filter((c) => c.field === f.code).sort((a, b) => a.name.localeCompare(b.name));
    const specs = courses.reduce((s, c) => s + c.specializations.length, 0);
    const progs = courses.reduce((s, c) => s + degreeCount(c), 0);

    const groups = f.groups.map((g) =>
      '<div class="group-block reveal"><div class="group-title"><h3>' + esc(g.name) + '</h3><span>' + g.courses.length + ' courses</span></div>' +
      '<div class="group-grid">' + g.courses.map((s) => {
        const c = bySlug[s];
        if (!c) return "";
        return '<a class="group-item" href="#/course/' + c.slug + '" data-link>' + esc(c.name) + '<span class="gi-arrow">→</span></a>';
      }).join("") + "</div></div>").join("");

    app.innerHTML =
      '<section class="field-hero" ' + 'style="--hue:' + f.hue + '"><div class="hero-inner-c">' +
        '<div class="crumb reveal in"><a href="#/fields" data-link>Fields</a><span class="sep">/</span><span>' + esc(f.code) + "</span></div>" +
        '<div class="hero-code reveal in">' + esc(f.code) + " — BROAD FIELD</div>" +
        '<h1 class="hero-name reveal in">' + esc(f.name) + "</h1>" +
        '<p class="hero-aliases reveal in"><b>Official ISCED-F name</b>' + esc(f.official) + "</p>" +
        '<p class="hero-what reveal">' + esc(f.long) + "</p>" +
        '<div class="fh-stats reveal in">' +
          '<div class="fh-stat"><b>' + courses.length + '</b><span>Courses</span></div>' +
          '<div class="fh-stat"><b>' + specs + '</b><span>Specializations</span></div>' +
          '<div class="fh-stat"><b>' + progs + '</b><span>Programme names</span></div>' +
          '<div class="fh-stat"><b>' + f.groups.length + '</b><span>Groups</span></div>' +
        "</div></div></section>" +
      '<section class="cv-section" style="--hue:' + f.hue + '"><div class="cv-sec-label"><span class="num">／</span>WHAT LIVES INSIDE ' + esc(f.code) + "</div>" + groups + "</section>" +
      endBlock();

    initReveal(app); setActiveNav("fields");
    document.title = f.name + " — Courseverse";
  }

  /* ---------- COURSE PAGE ---------- */
  function viewCourse(slug) {
    const c = bySlug[slug];
    if (!c) return viewNotFound();
    const f = fieldOf(c);

    const studyItems = (c.study || []).map((s) => "<li>" + esc(s) + "</li>").join("");
    const specItems = (c.specializations || []).map((s) => '<a class="spec-chip" href="#/search/' + encodeURIComponent(s) + '" data-link>' + esc(s) + "</a>").join("");

    const deg = c.degrees || { bachelors: [], masters: [], doctoral: [] };
    const ladder = [
      { stage: "Bachelor's · ISCED 6", note: "First university degree", names: deg.bachelors },
      { stage: "Master's · ISCED 7", note: "Postgraduate degree", names: deg.masters },
      { stage: "Doctoral · ISCED 8", note: "Research doctorate", names: deg.doctoral },
    ].filter((d) => d.names.length).map((d) =>
      '<div class="dl-step reveal"><div class="dl-side"><span class="dl-stage">' + d.stage + '</span><span class="dl-note">' + d.note + '</span></div><ul class="dl-names">' + d.names.map((n) => "<li>" + esc(n) + "</li>").join("") + "</ul></div>").join("");

    const around = (c.nameAround || []).map((r) =>
      '<div class="at-row"><span class="at-country">' + flag(r.c) + " " + esc(r.c) + '</span><span class="at-name">' + esc(r.n) + "</span></div>").join("");

    const countries = (c.countries || []).map((n) =>
      '<a class="c-chip" href="#/country/' + encodeURIComponent(n) + '" data-link>' + flag(n) + " " + esc(n) + "</a>").join("");

    const related = (c.related || []).map((s) => bySlug[s]).filter(Boolean).slice(0, 8).map((r) => {
      const rf = fieldOf(r);
      return '<a class="rf-card" href="#/course/' + r.slug + '" data-link style="--rf:' + rf.hue + '"><span class="rf-dot"></span><span class="rf-name">' + esc(r.name) + '</span><span class="rf-sub">' + esc(rf.name) + "</span></a>";
    }).join("");

    const aliases = (c.aliases || []).map((a) => "<i>" + esc(a) + "</i>").join(" · ");

    app.innerHTML =
      '<section class="course-hero" style="--hue:' + f.hue + '"><div class="hero-inner-c">' +
        '<div class="crumb reveal in"><a href="#/" data-link>Home</a><span class="sep">/</span><a href="#/field/' + f.slug + '" data-link>' + esc(f.name) + '</a><span class="sep">/</span><span>' + esc(c.name) + "</span></div>" +
        '<div class="hero-code reveal in">' + esc(f.code) + " · FIELD OF STUDY</div>" +
        '<h1 class="hero-name reveal in">' + esc(c.name) + "</h1>" +
        '<a class="hero-field-link reveal in" href="#/field/' + f.slug + '" data-link><span class="hfdot"></span>' + esc(f.name) + "</a>" +
        (aliases ? '<p class="hero-aliases reveal in"><b>Also known as</b>' + aliases + "</p>" : "") +
        '<p class="hero-what reveal">' + esc(c.what) + "</p>" +
      "</div></section>" +

      '<section class="cv-section" style="--hue:' + f.hue + '">' +
        '<div class="cv-sec-label"><span class="num">01</span>WHAT DO YOU STUDY?</div>' +
        '<div class="study-cols reveal"><ul class="study-list">' + studyItems + "</ul></div>" +
      "</section>" +

      '<section class="cv-section" style="--hue:' + f.hue + '">' +
        '<div class="cv-sec-label"><span class="num">02</span>MAIN AREAS & SPECIALIZATIONS</div>' +
        '<div class="spec-chips reveal">' + specItems + "</div>" +
      "</section>" +

      (ladder ? '<section class="cv-section" style="--hue:' + f.hue + '">' +
        '<div class="cv-sec-label"><span class="num">03</span>DEGREES & PROGRAMME NAMES</div>' +
        '<div class="degree-ladder">' + ladder + "</div></section>" : "") +

      (around ? '<section class="cv-section" style="--hue:' + f.hue + '">' +
        '<div class="cv-sec-label"><span class="num">04</span>SAME FIELD, DIFFERENT NAMES</div>' +
        '<div class="around-wrap reveal"><div class="around-title">How this field is named around the world</div><div class="around-note">The same academic field carries different national programme names.</div>' + around + "</div></section>" : "") +

      '<section class="cv-section" style="--hue:' + f.hue + '">' +
        '<div class="cv-sec-label"><span class="num">' + (around ? "05" : "04") + '</span>WHERE IT IS STUDIED</div>' +
        '<div class="country-chips reveal">' + countries + "</div>" +
      "</section>" +

      '<section class="cv-section" style="--hue:' + f.hue + '">' +
        '<div class="cv-sec-label"><span class="num">' + (around ? "06" : "05") + '</span>RELATED COURSES</div>' +
        '<div class="related-grid">' + related + "</div>" +
      "</section>" +

      endBlock();

    initReveal(app); setActiveNav("browse");
    document.title = c.name + " — Courseverse";
  }

  function endBlock() {
    return '<div class="course-end reveal"><p class="want">Want another course? <b>Search another one.</b></p>' +
      '<div class="section-cta" style="justify-content:center"><a class="btn" href="#/browse" data-link>Explore all courses ' + icon("arrow") + "</a></div></div>";
  }

  /* ---------- DEGREES ---------- */
  function viewDegrees() {
    const cards = CV.qualTypes.map((q, i) => {
      const hue = ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#f472b6", "#fb7185", "#fb923c", "#fbbf24", "#a3e635"][i % 9];
      return '<a class="qual-card reveal d' + ((i % 6) + 1) + '" href="#/degree/' + q.slug + '" data-link style="--q:' + hue + '">' +
        '<div class="qc-band"></div><div class="qc-body">' +
        '<div class="qc-meta"><span class="cc-pill">' + esc(q.isced) + '</span><span class="cc-pill">' + esc(q.duration) + "</span></div>" +
        '<h3 class="qc-name">' + esc(q.name) + '</h3><p class="qc-what">' + esc(q.what) + '</p><div class="qc-dur">Understand this qualification →</div>' +
        "</div></a>";
    }).join("");

    app.innerHTML =
      '<section class="browse-head"><span class="section-kicker reveal in">The qualification layer</span>' +
      '<h1 class="page-title reveal in">Degrees & <span class="italic">qualifications</span></h1>' +
      '<p class="page-sub reveal in">A field describes what is studied. A qualification describes what is earned after studying it. They are different things — and every country names them differently.</p></section>' +
      '<section class="section tight"><p class="levels-note reveal">The same field can carry completely different award names: BSc, BTech, BEng, BBA, LLB, MBBS — all bachelor-level. Courseverse separates the <b>field</b> from the <b>qualification</b>.</p>' +
      '<div class="qual-grid">' + cards + "</div></section>";

    initReveal(app); setActiveNav("degrees");
    document.title = "Degrees & Qualifications — Courseverse";
  }

  function viewDegree(slug) {
    const q = qualBySlug[slug];
    if (!q) return viewNotFound();
    const coursesWith = COURSES.filter((c) => {
      const d = c.degrees || {};
      const join = [].concat(d.bachelors || [], d.masters || [], d.doctoral || []).join(" ").toLowerCase();
      const key = q.slug === "bachelors" ? ["bsc", "btech", "beng", "bba", "bcom", "ba ", "bs ", "llb", "mbbs", "bds", "b.pharm", "bsn", "bca", "bfa", "bdes", "b.arch", "bed", "bvm", "bvsc", "bpt", "bot", "bhm", "boptom"] :
        q.slug === "masters" ? ["msc", "mtech", "meng", "mba", "m.com", "ms ", "ma ", "llm", "m.pharm", "msn", "mfa", "mdes", "m.arch", "med", "msw", "mph", "mpt", "mot"] :
        ["phd", "dphil", "edd", "dba", "dm ", "mch", "dsc", "thd", "dr."];
      return join.includes(key[0]) || key.some((k) => join.includes(k));
    });
    const examples = (q.slug === "bachelors" ? ["computer-science", "medicine", "law", "psychology", "mechanical-engineering"] :
      q.slug === "masters" ? ["artificial-intelligence", "finance", "public-health", "data-science", "architecture"] :
      ["physics", "neuroscience", "economics", "computer-science", "biotechnology"]).map((s) => bySlug[s]).filter(Boolean);

    const examplesCards = examples.map((c) => {
      const f = fieldOf(c);
      return '<article class="course-card reveal" data-go="#/course/' + c.slug + '" style="--cc:' + f.hue + '">' +
        '<div class="cc-band"></div><div class="cc-body"><span class="cc-kicker">' + esc(f.name) + '</span><h3 class="cc-name">' + esc(c.name) + '</h3><p class="cc-blurb">' + esc(c.what.split(/[.—]/)[0]) + "</p></div></article>";
    }).join("");

    const lvl = levelByCode[q.isced.replace("ISCED ", "").split("–")[0]] || CV.levels[6];

    app.innerHTML =
      '<section class="course-hero" style="--hue:#38bdf8"><div class="hero-inner-c">' +
        '<div class="crumb reveal in"><a href="#/degrees" data-link>Degrees</a><span class="sep">/</span><span>' + esc(q.name) + "</span></div>" +
        '<div class="hero-code reveal in">' + esc(q.isced) + " · QUALIFICATION</div>" +
        '<h1 class="hero-name reveal in">' + esc(q.name) + "</h1>" +
        '<p class="hero-what reveal">' + esc(q.what) + "</p>" +
        '<div class="fh-stats reveal in">' +
          '<div class="fh-stat"><b>' + esc(q.isced) + '</b><span>ISCED level</span></div>' +
          '<div class="fh-stat"><b>' + esc(q.duration) + '</b><span>Common duration</span></div>' +
          '<div class="fh-stat"><b>Varies</b><span>By field & country</span></div>' +
        "</div></div></section>" +
      '<section class="cv-section" style="--hue:#38bdf8">' +
        '<div class="cv-sec-label"><span class="num">01</span>WHICH FIELDS OFFER A ' + esc(q.name.toUpperCase()) + "?</div>" +
        '<div class="study-cols reveal"><ul class="study-list">' +
          coursesWith.slice(0, 18).map((c) => "<li>" + esc(c.name) + "</li>").join("") + "</ul></div>" +
        '<p style="color:var(--dim);font-size:.8rem;margin-top:14px">Showing ' + Math.min(18, coursesWith.length) + " of " + coursesWith.length + ' fields with this qualification level in the database.</p>' +
      "</section>" +
      '<section class="cv-section" style="--hue:#38bdf8">' +
        '<div class="cv-sec-label"><span class="num">02</span>EXAMPLE PROGRAMMES</div>' +
        '<div class="featured-grid">' + examplesCards + "</div>" +
      "</section>" +
      '<section class="cv-section" style="--hue:#38bdf8">' +
        '<div class="cv-sec-label"><span class="num">03</span>WHERE IT SITS — ' + esc(lvl.name.toUpperCase()) + "</div>" +
        '<p class="about-p reveal">' + esc(lvl.desc) + "</p>" +
        '<div class="section-cta" style="justify-content:flex-start"><a class="btn" href="#/levels" data-link>See the full ISCED ladder ' + icon("arrow") + "</a></div>" +
      "</section>" + endBlock();

    initReveal(app); setActiveNav("degrees");
    document.title = q.name + " — Courseverse";
  }

  function viewLevels() {
    const ladder = CV.levels.map((l, i) =>
      '<a class="ladder-row reveal d' + ((i % 6) + 1) + '" href="#/level/' + l.code + '" data-link style="cursor:pointer"><span class="lr-code">ISCED ' + l.code + '</span><span class="lr-name">' + esc(l.name) + '</span><span class="lr-desc">' + esc(l.desc) + "</span></a>").join("");
    app.innerHTML =
      '<section class="browse-head"><span class="section-kicker reveal in">UNESCO ISCED 2011</span>' +
      '<h1 class="page-title reveal in">The 9 education <span class="italic">levels</span></h1>' +
      '<p class="page-sub reveal in">Education levels and fields are separate dimensions: you can study Computer Science (field) at bachelor level (ISCED 6) in India (country). Levels describe depth; fields describe content.</p></section>' +
      '<section class="section tight"><div class="ladder">' + ladder + "</div></section>";
    initReveal(app); setActiveNav("degrees");
    document.title = "Education Levels (ISCED) — Courseverse";
  }

  function viewLevel(code) {
    const l = levelByCode[code];
    if (!l) return viewNotFound();
    const quals = CV.qualTypes.filter((q) => q.isced.indexOf("ISCED " + l.code) === 0 || (l.code === "6" && q.isced.indexOf("ISCED 6") === 0) || (l.code === "7" && q.isced.indexOf("ISCED 7") === 0) || (l.code === "8" && q.isced.indexOf("ISCED 8") === 0) || (l.code === "5" && q.isced.indexOf("ISCED 5") === 0));
    const sample = COURSES.slice().sort(() => 0.5 - Math.random()).slice(0, 6);
    const cards = sample.map((c) => {
      const f = fieldOf(c);
      return '<article class="course-card reveal" data-go="#/course/' + c.slug + '" style="--cc:' + f.hue + '"><div class="cc-band"></div><div class="cc-body"><span class="cc-kicker">' + esc(f.name) + '</span><h3 class="cc-name">' + esc(c.name) + '</h3><p class="cc-blurb">' + esc(c.what.split(/[.—]/)[0]) + "</p></div></article>";
    }).join("");

    app.innerHTML =
      '<section class="course-hero" style="--hue:#c084fc"><div class="hero-inner-c">' +
        '<div class="crumb reveal in"><a href="#/levels" data-link>Levels</a><span class="sep">/</span><span>ISCED ' + esc(l.code) + "</span></div>" +
        '<div class="hero-code reveal in">ISCED ' + esc(l.code) + " · EDUCATION LEVEL</div>" +
        '<h1 class="hero-name reveal in">' + esc(l.name) + "</h1>" +
        '<p class="hero-what reveal">' + esc(l.desc) + "</p></div></section>" +
      '<section class="cv-section" style="--hue:#c084fc">' +
        '<div class="cv-sec-label"><span class="num">01</span>QUALIFICATIONS AT THIS LEVEL</div>' +
        '<div class="spec-chips reveal">' + (quals.length ? quals.map((q) => '<a class="spec-chip" href="#/degree/' + q.slug + '" data-link>' + esc(q.name) + "</a>").join("") : '<span class="cc-pill">General schooling level</span>') + "</div>" +
      "</section>" +
      '<section class="cv-section" style="--hue:#c084fc">' +
        '<div class="cv-sec-label"><span class="num">02</span>FIELDS YOU CAN STUDY (ANY OF 11)</div>' +
        '<div class="featured-grid">' + cards + "</div>" +
      "</section>" + endBlock();
    initReveal(app); setActiveNav("degrees");
    document.title = "ISCED " + l.code + ": " + l.name + " — Courseverse";
  }

  /* ---------- COUNTRIES ---------- */
  function viewCountries() {
    const cards = COUNTRIES.map((n, i) =>
      '<a class="country-card reveal d' + ((i % 6) + 1) + '" href="#/country/' + encodeURIComponent(n) + '" data-link>' +
      '<span class="coa-flag">' + flag(n) + '</span><span><span class="coa-name">' + esc(n) + '</span><br/><span class="coa-count">' + allCountries[n] + ' courses mapped</span></span></a>').join("");
    app.innerHTML =
      '<section class="browse-head"><span class="section-kicker reveal in">The country layer</span>' +
      '<h1 class="page-title reveal in">Same field, <span class="italic">different names</span></h1>' +
      '<p class="page-sub reveal in">A Computer Science bachelor\u2019s is B.Tech CSE in India, BSc in the UK, BS in the US, Informatik in Germany and Licence Informatique in France. Same field — different national programme names.</p></section>' +
      '<section class="section tight"><div class="country-grid">' + cards + "</div></section>";
    initReveal(app); setActiveNav("countries");
    document.title = "Countries — Courseverse";
  }

  function viewCountry(name) {
    const decoded = decodeURIComponent(name);
    const courses = COURSES.filter((c) => (c.countries || []).indexOf(decoded) >= 0).sort((a, b) => a.name.localeCompare(b.name));
    const specs = courses.reduce((s, c) => s + c.specializations.length, 0);
    const progs = courses.reduce((s, c) => s + degreeCount(c), 0);
    const cards = courses.map((c) => {
      const f = fieldOf(c);
      return '<article class="course-card reveal" data-go="#/course/' + c.slug + '" style="--cc:' + f.hue + '"><div class="cc-band"></div><div class="cc-body"><span class="cc-kicker">' + esc(f.name) + '</span><h3 class="cc-name">' + esc(c.name) + '</h3><p class="cc-blurb">' + esc(c.what.split(/[.—]/)[0]) + "</p></div></article>";
    }).join("");

    app.innerHTML =
      '<section class="country-hero" style="--hue:#38bdf8">' +
        '<div class="ch-flag reveal in">' + flag(decoded) + "</div>" +
        '<h1 class="page-title reveal in">' + esc(decoded) + "</h1>" +
        '<p class="page-sub reveal in" style="margin:14px auto 0">Courses and fields mapped in the Courseverse database for ' + esc(decoded) + '.</p>' +
        '<div class="ch-stats reveal in">' +
          '<div class="fh-stat"><b>' + courses.length + '</b><span>Courses</span></div>' +
          '<div class="fh-stat"><b>' + specs + '</b><span>Specializations</span></div>' +
          '<div class="fh-stat"><b>' + progs + '</b><span>Programme names</span></div>' +
        "</div></section>" +
      '<section class="section tight"><div class="featured-grid">' + (cards || '<div class="no-results">No mapped courses yet for this country.</div>') + "</div></section>" +
      '<div class="section-cta"><a class="btn" href="#/countries" data-link>' + icon("arrow") + " All countries</a></div>";
    initReveal(app); setActiveNav("countries");
    document.title = decoded + " — Courseverse";
  }

  /* ---------- SEARCH PAGE ---------- */
  function viewSearch(encoded) {
    const q = decodeURIComponent(encoded || "");
    const results = searchAll(q)
      .map((r) => (r.type === "course" ? bySlug[r.slug] : null))
      .filter(Boolean);
    app.innerHTML =
      '<section class="browse-head"><span class="section-kicker reveal in">Search</span>' +
      '<h1 class="page-title reveal in">Results for <span class="italic">“' + esc(q) + '”</span></h1>' +
      '<p class="page-sub reveal in">' + results.length + ' course' + (results.length === 1 ? "" : "s") + ' matched. Aliases count too — “CS” finds Computer Science, “InfoSec” finds Cybersecurity.</p></section>' +
      '<div class="courses-grid">' + (results.length ? results.map((c) => courseCard(c, q)).join("") :
        '<div class="empty-state"><div class="es-icon">🛰️</div><h3>Nothing in the universe matched</h3><p>Try a broader word — “engineering”, “health”, “design”, “law”.</p></div>') + "</div>" +
      '<div class="section-cta"><a class="btn" href="#/browse" data-link>Browse all courses instead ' + icon("arrow") + "</a></div>";
    initReveal(app); setActiveNav("browse");
    document.title = "Search: " + q + " — Courseverse";
  }

  /* ---------- ABOUT ---------- */
  function viewAbout() {
    app.innerHTML =
      '<section class="about-wrap">' +
        '<span class="section-kicker reveal in">The mission</span>' +
        '<h1 class="page-title reveal in">The open encyclopedia of <span class="italic">education itself</span></h1>' +
        '<p class="about-lead reveal">Courseverse answers one question for every course on Earth: <em>“Here is a course. Here is what that course means, what you study in it, and what the major subjects are.”</em></p>' +
        '<p class="about-p reveal">There isn\u2019t a single authoritative list of every course ever offered by every institution in every country. Programmes appear, disappear, merge and rename constantly. So Courseverse is built systematically instead: a global education <b>ontology</b> — fields, levels, specializations, qualifications — grounded in UNESCO\u2019s international classifications, with real-world programme names mapped onto it.</p>' +
        '<p class="about-p reveal">The backbone: <b>ISCED 2011</b> defines the 9 education levels. <b>ISCED-F 2013</b> defines the 11 broad fields (29 narrow, ~80 detailed). On top of that sits the extended Courseverse layer — specializations like Machine Learning or Orthodontics that modern education actually offers.</p>' +
        '<div class="principles-grid reveal">' +
          '<div class="principle"><span class="p-no">Career quiz</span><span class="p-yes">Just the course</span></div>' +
          '<div class="principle"><span class="p-no">Personality test</span><span class="p-yes">Just the subjects</span></div>' +
          '<div class="principle"><span class="p-no">“Choose this”</span><span class="p-yes">Just understanding</span></div>' +
          '<div class="principle"><span class="p-no">Rankings</span><span class="p-yes">Just the taxonomy</span></div>' +
        "</div>" +
        '<h2 class="section-title reveal" style="font-size:1.6rem;margin:40px 0 16px">Where the data comes <span class="italic">from</span></h2>' +
        '<div class="tier-list reveal">' +
          '<div class="tier-row"><span class="tier-name">Tier 1 · International</span><span class="tier-body">UNESCO Institute for Statistics, ISCED, OECD, Eurostat, World Bank — the internationally comparable backbone.</span></div>' +
          '<div class="tier-row"><span class="tier-name">Tier 2 · National</span><span class="tier-body">Ministries of Education, national qualification frameworks, statistics offices, accreditation bodies.</span></div>' +
          '<div class="tier-row"><span class="tier-name">Tier 3 · Institutional</span><span class="tier-body">Universities, colleges, polytechnics and recognised training providers.</span></div>' +
          '<div class="tier-row"><span class="tier-name">Tier 4 · Catalogues</span><span class="tier-body">Actual programme names and descriptions — the continuously updated open dataset.</span></div>' +
        "</div>" +
        '<h2 class="section-title reveal" style="font-size:1.6rem;margin:40px 0 16px">What we can <span class="italic">confidently say</span></h2>' +
        '<div class="tier-list reveal">' +
          '<div class="tier-row"><span class="tier-name">9</span><span class="tier-body">ISCED education levels — from early childhood to doctoral.</span></div>' +
          '<div class="tier-row"><span class="tier-name">11</span><span class="tier-body">ISCED-F broad fields — the official top-level structure.</span></div>' +
          '<div class="tier-row"><span class="tier-name">29</span><span class="tier-body">ISCED-F narrow fields.</span></div>' +
          '<div class="tier-row"><span class="tier-name">~80</span><span class="tier-body">ISCED-F detailed fields.</span></div>' +
          '<div class="tier-row"><span class="tier-name">200+</span><span class="tier-body">Countries & territories covered by UNESCO education statistics.</span></div>' +
        "</div>" +
        '<p class="about-p reveal" style="margin-top:20px">We do <b>not</b> claim a fixed number like “73,421 courses exist worldwide”. There is no single global register of programme titles — and that honesty is part of the design.</p>' +
      "</section>" + endBlock();
    initReveal(app); setActiveNav("about");
    document.title = "About — Courseverse";
  }

  /* ---------- 404 ---------- */
  function viewNotFound() {
    document.title = "Lost in space — Courseverse";
    app.innerHTML =
      '<section class="empty-state" style="padding-top:180px"><div class="es-icon">🌌</div><h3>This corner of the universe is empty</h3>' +
      '<p>The page you tried doesn\u2019t exist in the Courseverse — yet.</p>' +
      '<div class="section-cta" style="justify-content:center"><a class="btn primary" href="#/" data-link>Back to home ' + icon("arrow") + "</a></div></section>";
    setActiveNav("");
  }

  /* ============================== ROUTER ============================== */

  function route() {
    const hash = location.hash.replace(/^#\/?/, "");
    const parts = hash.split("/");
    const [head, arg] = [parts[0] || "", parts.slice(1).join("/")];
    window.scrollTo({ top: 0, behavior: "auto" });

    switch (head) {
      case "": viewHome(); break;
      case "browse": viewBrowse(); break;
      case "fields": viewFields(); break;
      case "field": viewField(arg); break;
      case "course": viewCourse(arg); break;
      case "degrees": viewDegrees(); break;
      case "degree": viewDegree(arg); break;
      case "levels": viewLevels(); break;
      case "level": viewLevel(arg); break;
      case "qualification": viewDegree(arg); break;
      case "countries": viewCountries(); break;
      case "country": viewCountry(arg); break;
      case "search": viewSearch(arg); break;
      case "about": viewAbout(); break;
      default: viewNotFound();
    }
    document.body.classList.remove("menu-open");
  }

  /* ============================== BOOT ============================== */

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    try { initStars(); } catch (e) { /* starfield is decorative — never block the app */ }
    initChrome();
    route();
  });
})();
