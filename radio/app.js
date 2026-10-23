(() => {
"use strict";
const $ = (id) => document.getElementById(id);
const ST = {};
window.STATIONS.forEach((s) => {
  let acc = 0;
  s.tracks.forEach((t, i) => { t.i = i; t.start = acc; acc += t.d; });
  s.total = acc;
  ST[s.key] = s;
});
const TZ = "America/Los_Angeles";
const params = new URLSearchParams(location.search);
const state = {
  station: window.STATIONS[0].key,
  tuned: false,       // user pressed Tune in
  live: true,         // following the clock
  idx: -1,            // track currently shown
  playingIdx: -1,     // track loaded into the Spotify player
  paused: true,
  pos: 0, dur: 0,     // Spotify playback (ms)
  preview: false,
  ctrl: null, apiReady: false, pendingPlay: null,
  ended: false, lastPos: 0, seekWanted: 0, gotUpdate: false,
  offsetBase: null,   // for off-schedule listening without Spotify feedback
};

/* ---------- time ---------- */
const fmtParts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" });
function ptSeconds(now = new Date()) {
  const p = {}; fmtParts.formatToParts(now).forEach((x) => (p[x.type] = x.value));
  return (+p.hour % 24) * 3600 + (+p.minute) * 60 + (+p.second) + now.getMilliseconds() / 1000;
}
const fmtClock = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
const clockStr = (d) => fmtClock.format(d).replace(/\s?(AM|PM)/, (m, a) => " " + a);
const mmss = (s) => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
function liveAt(st, now = new Date()) {
  const sec = ptSeconds(now) % st.total;
  let lo = 0, hi = st.tracks.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (st.tracks[m].start <= sec) lo = m; else hi = m - 1; }
  return { idx: lo, off: sec - st.tracks[lo].start };
}
const cur = () => ST[state.station];

/* ---------- render ---------- */
const eq = $("eq");
for (let i = 0; i < 18; i++) { const b = document.createElement("b"); b.style.animationDuration = (0.45 + Math.random() * 0.7).toFixed(2) + "s"; b.style.animationDelay = (-Math.random()).toFixed(2) + "s"; eq.appendChild(b); }

function setTrack(i, animate = true) {
  const st = cur(), t = st.tracks[i];
  if (state.idx === i && $("npTitle").dataset.st === st.key) return;
  const first = state.idx === -1;
  state.idx = i;
  $("npTitle").dataset.st = st.key;
  const rec = $("record"), arm = $("tonearm");
  const apply = () => {
    $("labelArt").src = "art/" + t.art;
    $("labelArt").alt = t.al ? t.al + " cover" : t.t + " cover";
    document.documentElement.style.setProperty("--tint", t.c);
    ["npTitle", "npArtist", "npAlbum"].forEach((k) => { const el = $(k); el.classList.remove("fade"); void el.offsetWidth; el.classList.add("fade"); });
    $("npTitle").textContent = t.t;
    $("npArtist").textContent = t.a;
    $("npAlbum").textContent = t.al || "\u00a0";
    $("npKicker").textContent = `Track ${String(i + 1).padStart(2, "0")} of ${st.tracks.length}`;
    const n = $("notes"); n.classList.remove("flip"); void n.offsetWidth; n.classList.add("flip");
    $("notesNo").textContent = `Liner note ${String(i + 1).padStart(2, "0")}`;
    $("notesSt").textContent = t.seg || st.name;
    $("notesTag").textContent = t.tag;
    $("notesBody").textContent = t.s;
    $("notesQ").innerHTML = t.q ? `<p>\u201c${esc(t.q)}\u201d</p><cite>${t.qu ? `<a href="${esc(t.qu)}" target="_blank" rel="noopener">${esc(t.qw || "")}</a>` : esc(t.qw || "")}</cite>` : "";
    $("notesSrc").innerHTML = srcLine(t.src);
    document.title = `${t.t} · ${t.a} | ${st.name}`;
    renderQueue();
  };
  if (first || !animate) { apply(); return; }
  rec.classList.add("swap"); arm.classList.add("lift");
  setTimeout(() => { apply(); rec.style.transition = "none"; rec.classList.remove("swap"); rec.style.transform = "translateX(16%) rotate(40deg) scale(.92)"; rec.style.opacity = "0";
    void rec.offsetWidth; rec.style.transition = ""; rec.style.transform = ""; rec.style.opacity = "";
    setTimeout(() => arm.classList.remove("lift"), 500);
  }, 520);
}

function upcoming(fromIdx, secsLeft, count) {
  const st = cur(), out = []; let t = Date.now() + secsLeft * 1000;
  for (let k = 1; k <= count; k++) {
    const j = (fromIdx + k) % st.tracks.length; out.push({ tr: st.tracks[j], at: new Date(t) }); t += st.tracks[j].d * 1000;
  }
  return out;
}
let lastQueueKey = "";
function renderQueue(force) {
  const st = cur(), t = st.tracks[state.idx];
  const left = Math.max(0, t.d - progressSecs());
  const items = upcoming(state.idx, left, 5);
  const key = st.key + state.idx + (state.live ? "L" : "O");
  if (key === lastQueueKey && !force) { // just refresh times
    [...$("queue").querySelectorAll(".q-time")].forEach((el, k) => (el.lastChild.textContent = clockStr(items[k].at)));
    return;
  }
  lastQueueKey = key;
  $("queue").innerHTML = items.map((it, k) => `
    <li class="q-item" style="animation-delay:${k * 60}ms"><button data-i="${it.tr.i}" aria-label="Play ${esc(it.tr.t)} now">
      <img class="q-art" src="art/${it.tr.art}" alt="" loading="lazy" width="44" height="44">
      <span style="min-width:0"><span class="q-t">${esc(it.tr.t)}</span><span class="q-a">${esc(it.tr.a)}</span></span>
      <span class="q-time"><b>${k === 0 ? "Next" : "Then"}</b>${clockStr(it.at)}</span>
    </button></li>`).join("");
  if (!$("rundown").classList.contains("hidden")) renderRundown();
}
function srcLine(a) { return a && a.length ? "Source: " + a.map((s) => `<a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.l)}</a>`).join(" · ") : ""; }
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function renderRundown() {
  const st = cur(), now = new Date(), sec = ptSeconds(now), base = Math.floor(sec / st.total) * st.total;
  const live = liveAt(st, now);
  let seg = "";
  $("rundown").innerHTML = st.tracks.map((t) => {
    let s = base + t.start; if (s + t.d < sec) s += st.total;
    const at = new Date(now.getTime() + (s - sec) * 1000);
    const isNow = t.i === live.idx;
    let head = "";
    if (t.seg && t.seg !== seg) { seg = t.seg; const sd = (st.segs || []).find((x) => x.n === seg); head = `<li class="r-seg"><span>${esc(seg)}</span>${sd ? `<small>${esc(sd.w)}</small>` : ""}</li>`; }
    return head + `<li><button class="r-item${isNow ? " now" : ""}" data-i="${t.i}"><span class="n">${String(t.i + 1).padStart(2, "0")}</span><span class="tt">${esc(t.t)} <span>· ${esc(t.a)}</span></span><span class="tm">${isNow ? "On air" : clockStr(at)}</span></button></li>`;
  }).join("");
}

function progressSecs() {
  const st = cur(), t = st.tracks[state.idx];
  if (state.tuned && state.gotUpdate && state.playingIdx === state.idx && state.dur > 0 && !state.preview) return state.pos / 1000;
  if (state.live) { const l = liveAt(st); return l.idx === state.idx ? l.off : 0; }
  if (state.tuned && state.gotUpdate && state.playingIdx === state.idx && state.dur > 0) return Math.min(t.d, state.pos / 1000);
  if (state.offsetBase) return Math.min(t.d, (Date.now() - state.offsetBase) / 1000);
  return 0;
}

function tick() {
  const st = cur(), now = new Date();
  $("clock").textContent = clockStr(now) + " PT";
  if (state.live) {
    const l = liveAt(st, now);
    if (l.idx !== state.idx) {
      if (state.tuned && state.playingIdx !== l.idx && !state.preview) loadTrack(l.idx, l.off);
      setTrack(l.idx);
    }
  }
  const t = st.tracks[state.idx], p = progressSecs();
  const inPreview = !state.live && state.preview && state.tuned && state.playingIdx === state.idx && state.dur > 0;
  const d = inPreview ? state.dur / 1000 : t.d;
  $("bar").style.width = Math.min(100, (p / d) * 100) + "%";
  $("tEl").textContent = mmss(p); $("tRem").textContent = "-" + mmss(d - p);
  const lt = $("liveTag");
  const ltText = state.live ? "Live" : "Back to live";
  if (lt.textContent !== ltText) { lt.textContent = ltText; lt.classList.toggle("off", !state.live); lt.tabIndex = state.live ? -1 : 0; lt.setAttribute("aria-label", state.live ? "Live broadcast" : "Return to the live broadcast"); }
  // tonearm rides from the outer groove to the run-out as the song plays
  const arm = $("tonearm"); if (!arm.classList.contains("lift")) arm.style.transform = `rotate(${21 + 13 * Math.min(1, p / d)}deg)`;
  const playingAudio = state.tuned && !state.paused;
  eq.classList.toggle("idle", !playingAudio);
  $("deck").classList.toggle("paused", state.tuned && state.gotUpdate && state.paused);
  if (state.tuned && !state.gotUpdate && state.tunedAt && Date.now() - state.tunedAt > 3500 && !$("hint").textContent)
    setHint('If nothing plays, tap play on the Spotify player once. After that the station runs itself.');
  if (state.gotUpdate && !state.paused && $("hint").dataset.kind === "tap") setHint("");
  renderQueue();
}

/* ---------- Spotify ---------- */
window.onSpotifyIframeApiReady = (API) => {
  state.apiReady = true;
  state.API = API;
  if (state.pendingPlay) { const p = state.pendingPlay; state.pendingPlay = null; createPlayer(p.i, p.off); }
};
function createPlayer(i, off) {
  const t = cur().tracks[i];
  $("playerWrap").classList.add("show");
  state.API.createController($("spotify"), { uri: "spotify:track:" + t.id, width: "100%", height: 80 }, (ctrl) => {
    state.ctrl = ctrl;
    ctrl.addListener("playback_update", onUpdate);
    ctrl.addListener("ready", () => { try { ctrl.play(); } catch (e) {} });
    state.playingIdx = i; state.seekWanted = off; state.ended = false; state.lastPos = 0;
    setTimeout(() => { try { ctrl.play(); } catch (e) {} }, 600);
  });
}
function loadTrack(i, off = 0) {
  const t = cur().tracks[i];
  if (state.playingIdx === i && state.loadedAt && Date.now() - state.loadedAt < 3000 && state.loadedSt === state.station) return;
  state.loadedAt = Date.now(); state.loadedSt = state.station; state.started = false;
  state.playingIdx = i; state.seekWanted = off; state.ended = false; state.lastPos = 0; state.gotUpdate = false; state.pos = 0;
  state.offsetBase = Date.now() - off * 1000;
  if (!state.ctrl) {
    if (state.apiReady) createPlayer(i, off); else state.pendingPlay = { i, off };
    return;
  }
  try { state.ctrl.loadUri("spotify:track:" + t.id); state.ctrl.play(); } catch (e) {}
}
function onUpdate(e) {
  const d = e.data || {};
  state.paused = !!d.isPaused; state.dur = d.duration || 0;
  const pos = d.position || 0;
  if (state.dur > 0) {
    state.gotUpdate = true;
    const t = cur().tracks[state.playingIdx];
    const wasPreview = state.preview;
    state.preview = t && state.dur < 31000 && t.d > 40;
    if (state.preview && !wasPreview) {
      setHint('Spotify is playing 30 second previews, so the station plays a sampler from here. <a href="https://accounts.spotify.com/login" target="_blank" rel="noopener">Log in to Spotify</a> in this browser, then reload, for the full live broadcast.', "preview");
      if (state.live) { state.live = false; }
    }
    if (!state.preview && $("hint").dataset.kind === "preview") setHint("");
    // join the broadcast mid-song, like real radio
    if (state.seekWanted > 3 && !d.isPaused && pos < 4000 && !state.preview) {
      const s = state.seekWanted; state.seekWanted = 0;
      if (s < state.dur / 1000 - 6) { try { state.ctrl.seek(s); } catch (er) {} }
    } else if (state.preview || pos > 4000) state.seekWanted = 0;
    // end detection
    if (!state.started) {
      // ignore stale updates from the previous track until the new one is really rolling
      if (!d.isPaused && pos < 5000) state.started = true;
      state.lastPos = pos; state.pos = pos; updateTuneBtn(); return;
    }
    const nearEnd = state.lastPos > state.dur - 2500;
    if (state.started && !state.ended && ((pos >= state.dur - 400 && pos > 0) || (nearEnd && (pos < state.lastPos - 1500 || d.isPaused)))) {
      state.ended = true; onEnded();
    }
    state.lastPos = pos; state.pos = pos;
  }
  updateTuneBtn();
}
function onEnded() {
  const st = cur(), l = liveAt(st);
  if (state.live && l.idx !== state.playingIdx) { setTrack(l.idx); loadTrack(l.idx, l.off); return; }
  const n = (state.playingIdx + 1) % st.tracks.length;
  if (state.live && !state.preview && n === l.idx) { setTrack(n); loadTrack(n, l.off); return; }
  state.live = false;
  setTrack(n); loadTrack(n, 0);
}

/* ---------- controls ---------- */
function updateTuneBtn() {
  const b = $("tuneBtn"), on = state.tuned && !state.paused;
  b.classList.toggle("on", on);
  $("tuneLabel").textContent = !state.tuned ? "Tune in" : on ? "Listening" : "Resume";
  b.querySelector(".tune-icon").innerHTML = on
    ? '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M6.5 5h3.6v14H6.5zM13.9 5h3.6v14h-3.6z" fill="currentColor"/></svg>'
    : '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>';
  b.setAttribute("aria-label", on ? "Pause" : state.tuned ? "Resume" : "Tune in");
}
$("tuneBtn").addEventListener("click", () => {
  if (!state.tuned) {
    state.tuned = true; state.paused = false; state.tunedAt = Date.now();
    const l = liveAt(cur());
    if (state.live) { setTrack(l.idx); loadTrack(l.idx, l.off); } else loadTrack(state.idx, 0);
    updateTuneBtn(); toast(state.live ? `Tuned to ${cur().name}. You're live.` : "Playing");
    return;
  }
  if (!state.ctrl) return;
  try { state.ctrl.togglePlay(); } catch (e) {}
});
$("skipBtn").addEventListener("click", () => {
  const n = (state.idx + 1) % cur().tracks.length;
  jumpTo(n);
});
$("liveTag").addEventListener("click", () => { if (!state.live) goLive(); });
function goLive() {
  state.live = true; const l = liveAt(cur());
  setTrack(l.idx);
  if (state.tuned) loadTrack(l.idx, l.off);
  toast("Back on the live broadcast"); tick();
}
function jumpTo(i) {
  state.live = false; state.offsetBase = Date.now();
  setTrack(i);
  if (state.tuned) loadTrack(i, 0); else { state.tuned = true; state.tunedAt = Date.now(); state.paused = false; loadTrack(i, 0); updateTuneBtn(); }
  tick();
}
$("queue").addEventListener("click", (e) => { const b = e.target.closest("button[data-i]"); if (b) jumpTo(+b.dataset.i); });
$("rundown").addEventListener("click", (e) => { const b = e.target.closest("button[data-i]"); if (b) { jumpTo(+b.dataset.i); window.scrollTo({ top: 0, behavior: "smooth" }); } });
$("rundownBtn").addEventListener("click", () => {
  const r = $("rundown"), open = r.classList.toggle("hidden") === false;
  $("rundownBtn").setAttribute("aria-expanded", open);
  if (open) renderRundown();
});
function initStation() {
  const S = cur();
  $("stFreq").textContent = S.freq + " FM · Always on air"; $("stName").textContent = "The Program"; $("stWho").textContent = "";
  $("stBlurb").textContent = S.blurb; $("stSrc").innerHTML = srcLine(S.bsrc);
  $("deckStation").textContent = S.freq + " FM";
  $("rundownCount").textContent = `· ${S.tracks.length} records`;
  const mins = Math.round(S.total / 60);
  $("progStats").textContent = `One program of ${S.tracks.length} records, about ${Math.floor(mins / 60)} hr ${mins % 60} min, on a loop.`;
  state.live = true; lastQueueKey = "";
  const l = liveAt(S);
  state.idx = -2; setTrack(l.idx, false);
}

/* ---------- toast ---------- */
function setHint(html, kind) { const h = $("hint"); h.innerHTML = html; h.dataset.kind = html ? (kind || "tap") : ""; }
document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea/i.test(e.target.tagName)) return;
  if (e.code === "Space") { e.preventDefault(); $("tuneBtn").click(); }
  else if (e.key === "n" || e.key === "ArrowRight") $("skipBtn").click();
  else if (e.key === "l") { if (!state.live) goLive(); }
});
let toastT;
function toast(msg) { const el = $("toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2600); }

/* ---------- boot ---------- */
initStation();
updateTuneBtn();
tick();
setInterval(tick, 500);
window.__mr = state;
})();
