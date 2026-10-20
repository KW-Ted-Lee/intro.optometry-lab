/* 練習題引擎：隨機數字的原創題、作答檢查、逐步詳解
   題型以 OBPractice.define(章節 id, [ { id, title, gen(r) } ]) 註冊；
   gen(r) 回傳 { q, parts, steps }：
     parts: [{ label, type: "num", ans, unit, dp }] 或 [{ label, type: "choice", opts: [...], ans: 索引 }]
     steps: [{ c: "觀念說明", e: "算式（可省略）" }]
   本檔不依賴其他檔案，可在 Node 中載入做驗算。 */
(function (root) {
  "use strict";
  const REG = {};

  /* ---------- 亂數與格式 ---------- */
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function makeR(seed) {
    const rnd = mulberry32(seed);
    const r = {
      rand: rnd,
      pick: (arr) => arr[Math.floor(rnd() * arr.length)],
      int: (a, b) => a + Math.floor(rnd() * (b - a + 1)),
      step: (a, b, s) => { const n = Math.round((b - a) / s); return +(a + s * Math.floor(rnd() * (n + 1))).toFixed(6); },
      sign: () => (rnd() < 0.5 ? -1 : 1),
    };
    return r;
  }
  const MINUS = "−";
  const F = {
    /* 有號數字：+1.23 / −1.23 */
    s(v, d = 2) { if (!isFinite(v)) return "∞"; const x = Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v; return (x > 0 ? "+" : x < 0 ? MINUS : "") + Math.abs(x).toFixed(d); },
    /* 無號數字 */
    u(v, d = 2) { if (!isFinite(v)) return "∞"; return Math.abs(v).toFixed(d); },
    /* 一般數字（負號用 −） */
    n(v, d = 2) { if (!isFinite(v)) return "∞"; const x = Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v; return (x < 0 ? MINUS : "") + Math.abs(x).toFixed(d); },
    D(v, d = 2) { return F.s(v, d) + " D"; },
    deg(v, d = 2) { return v.toFixed(d) + "°"; },
  };
  const deg = (rad) => rad * 180 / Math.PI, rad = (d) => d * Math.PI / 180;

  function define(ch, list) { REG[ch] = (REG[ch] || []).concat(list); }
  function generate(ch, idx, seed) { const t = REG[ch][idx]; return t.gen(makeR(seed)); }

  /* ---------- 作答判斷 ---------- */
  function parseNum(str) {
    if (str == null) return NaN;
    const t = String(str).trim().replace(/[−–—]/g, "-").replace(/＋/g, "+").replace(/\s+/g, "").replace(/(D|cm|mm|m|°|Δ|%|×|x)$/i, "");
    if (t === "") return NaN;
    return Number(t);
  }
  function tolOf(p) { const d = p.dp == null ? 2 : p.dp; return p.tol != null ? p.tol : Math.max(1.5 * Math.pow(10, -d), 0.015 * Math.abs(p.ans)); }
  function isRight(p, val) {
    if (p.type === "choice") return val === p.ans;
    const x = parseNum(val); if (!isFinite(x)) return false;
    return Math.abs(x - p.ans) <= tolOf(p);
  }

  /* ---------- 介面 ---------- */
  /* 算式美化：運算子後面的有號數字 → 負數加括號、正數去掉正號（例：+ −7.00 → + (−7.00)；/ +0.55 → / 0.55） */
  function tidy(e) { return e.replace(/ ([+−×\/]) ([+−])(\d[\d.]*)/g, (m, op, sg, num) => sg === "+" ? ` ${op} ${num}` : ` ${op} (${sg}${num})`); }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]); }
  function mount(elId, ch) {
    const root = document.getElementById(elId);
    if (!root || !REG[ch]) return;
    root.classList.add("practice");
    REG[ch].forEach((t, i) => root.appendChild(card(ch, i, t)));
  }
  function card(ch, idx, t) {
    const box = document.createElement("div"); box.className = "prob";
    let seed = (Math.random() * 1e9) | 0, data, shown = 0, counted = false;
    function render() {
      data = generate(ch, idx, seed); shown = 0; counted = false;
      box.innerHTML = `
        <div class="prob-head"><span class="prob-id">練習 ${esc(t.id)}</span><b>${esc(t.title)}</b><button type="button" class="btn ghost prob-new">換一組數字</button></div>
        <div class="prob-q">${data.q}</div>
        <div class="prob-parts">${data.parts.map((p, k) => partHTML(p, k)).join("")}</div>
        <div class="prob-actions"><button type="button" class="btn prob-check">檢查答案</button><button type="button" class="btn ghost prob-step">看下一步詳解</button><button type="button" class="btn ghost prob-all">看完整詳解</button><span class="prob-result"></span></div>
        <ol class="prob-steps"></ol>`;
      box.querySelector(".prob-new").onclick = () => { seed = (Math.random() * 1e9) | 0; render(); };
      box.querySelector(".prob-check").onclick = check;
      box.querySelector(".prob-step").onclick = () => reveal(shown + 1);
      box.querySelector(".prob-all").onclick = () => reveal(data.steps.length);
      box.querySelectorAll(".prob-part .opts button").forEach((b) => b.onclick = () => {
        const wrap = b.closest(".prob-part"); wrap.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true"); wrap.dataset.val = b.dataset.v;
      });
      box.querySelectorAll(".prob-part input").forEach((inp) => inp.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); }));
    }
    function partHTML(p, k) {
      const lab = `<span class="pl">${p.label}</span>`;
      if (p.type === "choice") return `<div class="prob-part" data-k="${k}">${lab}<div class="seg opts">${p.opts.map((o, j) => `<button type="button" data-v="${j}" aria-pressed="false">${o}</button>`).join("")}</div><span class="mark"></span></div>`;
      return `<div class="prob-part" data-k="${k}">${lab}<span class="inp"><input type="text" inputmode="decimal" autocomplete="off" aria-label="${esc(p.label.replace(/<[^>]+>/g, ""))}" id="p-${ch}-${idx}-${k}">${p.unit ? `<span class="unit">${p.unit}</span>` : ""}</span><span class="mark"></span></div>`;
    }
    function check() {
      let ok = 0;
      box.querySelectorAll(".prob-part").forEach((w) => {
        const p = data.parts[+w.dataset.k];
        const val = p.type === "choice" ? (w.dataset.val == null ? -1 : +w.dataset.val) : w.querySelector("input").value;
        const right = isRight(p, val);
        if (right) ok++;
        const ansTxt = p.type === "choice" ? p.opts[p.ans] : F.n(p.ans, p.dp == null ? 2 : p.dp) + (p.unit ? " " + p.unit : "");
        w.querySelector(".mark").innerHTML = right ? '<span class="pill ok">正確</span>' : (val === "" || val === -1 ? '<span class="pill info">未作答</span>' : `<span class="pill bad">再檢查</span>`);
        w.dataset.ans = ansTxt;
      });
      const res = box.querySelector(".prob-result");
      if (window.labTrack) labTrack("practice_check", { chapter: ch, problem: t.id || idx + 1, problem_title: String(t.title || "").replace(/<[^>]+>/g, ""), correct: ok, total: data.parts.length, all_correct: ok === data.parts.length });
      if (window.OL && OL.journal && t.star) { const all = ok === data.parts.length && !counted && !shown; OL.journal.starCheck(t.star, all); if (ok === data.parts.length) counted = true; }
      res.innerHTML = ok === data.parts.length ? '<span class="pill ok">全部正確</span>' : `答對 ${ok} / ${data.parts.length}　<button type="button" class="linkish">顯示正確答案</button>`;
      const lk = res.querySelector(".linkish");
      if (lk) lk.onclick = () => box.querySelectorAll(".prob-part").forEach((w) => { w.querySelector(".mark").innerHTML += ` <span class="ans">答案：${w.dataset.ans}</span>`; });
    }
    function reveal(n) {
      n = Math.min(n, data.steps.length);
      const ol = box.querySelector(".prob-steps");
      for (let i = shown; i < n; i++) {
        const st = data.steps[i]; const li = document.createElement("li");
        li.innerHTML = `<div class="sc">${st.c}</div>${st.e ? `<div class="se">${tidy(st.e)}</div>` : ""}`;
        ol.appendChild(li);
      }
      shown = n;
      if (shown >= data.steps.length) { box.querySelector(".prob-step").disabled = true; box.querySelector(".prob-all").disabled = true; }
    }
    render();
    return box;
  }

  const API = { tidy, define, generate, mount, makeR, F, deg, rad, isRight, parseNum, REG };
  root.OBPractice = API;
  if (typeof module !== "undefined") module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
