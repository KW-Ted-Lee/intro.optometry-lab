/* 眼球水平剖面圖（右眼，由上往下看；光線由左方進入）。
   以毫米為單位計算幾何，輸出 SVG 字串，供 W02 角膜、W03 調節、W05 模型標示等實驗共用。
   OLAnat.eye({ a: 調節 0–1, pupil: 瞳孔半徑 mm, pins: true|[keys], names: "zh"|"both"|false, hl: [keys], answers: {key: "名稱"} }) */
(function () {
  "use strict";
  const S = 12, CX = 395, CY = 180;             // 12 px/mm；球心
  const P = (deg, r) => { const t = deg * Math.PI / 180; return [CX - r * S * Math.cos(t), CY - r * S * Math.sin(t)]; };
  const X = (mm) => CX + mm * S, Y = (mm) => CY + mm * S;
  const f = (v) => v.toFixed(1);
  const pt = (p) => f(p[0]) + "," + f(p[1]);

  /* 14 個必標構造（W05）＋顯示用名稱。anchor 是構造上的點，side 決定標籤放左或右欄 */
  const STRUCT = [
    { k: "cornea", zh: "角膜", en: "Cornea", side: "L" },
    { k: "ac", zh: "前房", en: "Anterior chamber", side: "L" },
    { k: "pupil", zh: "瞳孔", en: "Pupil", side: "L" },
    { k: "iris", zh: "虹膜", en: "Iris", side: "L" },
    { k: "pc", zh: "後房", en: "Posterior chamber", side: "L" },
    { k: "lens", zh: "水晶體", en: "Crystalline lens", side: "L" },
    { k: "ciliary", zh: "睫狀體／懸韌帶", en: "Ciliary body", side: "L" },
    { k: "sclera", zh: "鞏膜", en: "Sclera", side: "R" },
    { k: "choroid", zh: "脈絡膜", en: "Choroid", side: "R" },
    { k: "retina", zh: "視網膜", en: "Retina", side: "R" },
    { k: "vitreous", zh: "玻璃體", en: "Vitreous humour", side: "R" },
    { k: "macula", zh: "黃斑部", en: "Macula", side: "R" },
    { k: "disc", zh: "視盤", en: "Optic disc", side: "R" },
    { k: "nerve", zh: "視神經", en: "Optic nerve", side: "R" },
  ];

  function geom(a, pupil) {
    a = Math.max(0, Math.min(1, a || 0));
    const g = {};
    // 角膜
    const limbY = 5.75, th0 = Math.asin(limbY / 12) * 180 / Math.PI;
    const limbX = -12 * Math.cos(th0 * Math.PI / 180);
    const sag = (R, h) => R - Math.sqrt(R * R - h * h);
    g.limb = [limbX, limbY];
    g.cornOutApex = limbX - sag(7.8, limbY);
    g.cornInX = limbX + 0.8; g.cornInY = 5.35;
    g.cornInApex = g.cornInX - sag(6.5, g.cornInY);
    g.th0 = th0;
    // 虹膜與水晶體
    g.irisX = g.cornInApex + 3.2;
    g.pupil = pupil == null ? 1.6 - 0.5 * a : pupil;
    const T = 3.6 + 0.8 * a, H = 4.5 - 0.25 * a, Rf = 10 - 4 * a, Rb = 6 - 0.5 * a;
    g.lensF = g.irisX + 0.55; g.lensB = g.lensF + T;
    g.lensH = H;
    g.eqF = g.lensF + sag(Rf, H); g.eqB = g.lensB - sag(Rb, H);
    if (g.eqB < g.eqF) { const m = (g.eqF + g.eqB) / 2; g.eqF = g.eqB = m; }
    g.Rf = Rf; g.Rb = Rb;
    // 睫狀體：沿內壁 22°–36°，頂點隨調節向內移
    g.cbApex = [g.eqF - 0.35, 6.05 - 0.55 * a];
    g.ora = 44;
    g.vitFrontX = -10.1 * Math.cos(g.ora * Math.PI / 180);
    return g;
  }

  function anchors(g) {
    const A = {};
    A.cornea = [X(g.cornOutApex + 0.35), Y(-2.6)];
    A.ac = [X((g.cornInApex + g.irisX) / 2 - 0.2), Y(2.4)];
    A.pupil = [X(g.irisX + 0.25), Y(0)];
    A.iris = [X(g.irisX + 0.25), Y(-(g.pupil + 5.1) / 2 - 0.2)];
    A.pc = [X(g.irisX + 0.75), Y(-5.0)];
    A.lens = [X((g.lensF + g.lensB) / 2), Y(-1.6)];
    A.ciliary = [X(g.cbApex[0] - 0.4), Y(g.cbApex[1] + 0.8)];
    A.sclera = P(118, 11.55);
    A.choroid = P(96, 10.85);
    A.retina = P(140, 10.35);
    A.vitreous = [X(1.5), Y(-3.2)];
    A.macula = P(180, 10.35);
    A.disc = P(195, 10.35);
    A.nerve = [X(13.6), Y(4.75)];
    return A;
  }

  function eye(o = {}) {
    const g = geom(o.a, o.pupil);
    const hl = new Set(o.hl || []);
    const cls = (k) => `an-${k}${hl.has(k) ? " an-hl" : ""}${o.hot ? " hot" : ""}`;
    const dk = (k) => `data-k="${k}"`;
    let s = `<circle cx="${CX}" cy="${CY}" r="${11.2 * S}" fill="var(--an-vitreous)"/>`;
    // 房水（前房＋後房）
    const aq = [
      `M${pt([X(g.cornInX), Y(-g.cornInY)])}`,
      `A${f(6.5 * S)} ${f(6.5 * S)} 0 0 0 ${pt([X(g.cornInX), Y(g.cornInY)])}`,
      `L${pt([X(g.vitFrontX), Y(6.0)])}`, `L${pt([X(g.vitFrontX), Y(-6.0)])}`, "Z"].join(" ");
    s += `<path class="${cls("ac")}" ${dk("ac")} d="${aq}" fill="var(--an-aqueous)"/>`;
    // 後房標示區（虹膜後、水晶體前；僅為點選用的透明區塊）
    // 玻璃體
    const vf = P(g.ora, 10.1), vb = P(-g.ora, 10.1);
    s += `<path class="${cls("vitreous")}" ${dk("vitreous")} d="M${pt(vf)} A${f(10.1 * S)} ${f(10.1 * S)} 0 1 1 ${pt(vb)} Z" fill="var(--an-vitreous)"/>`;
    // 視神經（先畫，讓眼球壁蓋住根部）
    const d0 = P(195, 10.2), d1 = P(195, 12.6);
    s += `<path class="${cls("nerve")}" ${dk("nerve")} d="M${pt(d0)} L${pt(d1)} Q${f(X(13.4))},${f(Y(4.0))} ${f(X(16.4))},${f(Y(4.3))}" fill="none" stroke="var(--an-nerve-edge)" stroke-width="${f(3.1 * S)}" stroke-linecap="butt"/>`;
    s += `<path ${dk("nerve")} class="${cls("nerve")}" d="M${pt(d0)} L${pt(d1)} Q${f(X(13.4))},${f(Y(4.0))} ${f(X(16.4))},${f(Y(4.3))}" fill="none" stroke="var(--an-nerve)" stroke-width="${f(2.6 * S)}" stroke-linecap="butt"/>`;
    // 鞏膜（環）
    const so = (t) => P(t, 12), si = (t) => P(t, 11.1);
    const t0 = g.th0, ti = 29.5;
    s += `<path class="${cls("sclera")}" ${dk("sclera")} fill-rule="evenodd" d="M${pt(so(t0))} A${12 * S} ${12 * S} 0 1 1 ${pt(so(-t0))} L${pt(si(-ti))} A${f(11.1 * S)} ${f(11.1 * S)} 0 1 0 ${pt(si(ti))} Z" fill="var(--an-sclera)" stroke="var(--an-line)" stroke-width="1"/>`;
    // 脈絡膜、視網膜（自鋸齒緣 36° 起），視盤處斷開
    const ring = (r1, r2, a1, a2) => { const p1 = P(a1, r1), p2 = P(a2, r1), p3 = P(a2, r2), p4 = P(a1, r2); return `M${pt(p1)} A${f(r1 * S)} ${f(r1 * S)} 0 ${Math.abs(a2 - a1) > 180 ? 1 : 0} 1 ${pt(p2)} L${pt(p3)} A${f(r2 * S)} ${f(r2 * S)} 0 ${Math.abs(a2 - a1) > 180 ? 1 : 0} 0 ${pt(p4)} Z`; };
    // 由上方 36° 沿後方到視盤上緣 192.5°，再由視盤下緣 197.5° 到下方 324°
    s += `<path class="${cls("choroid")}" ${dk("choroid")} d="${ring(11.1, 10.6, g.ora, 192.5)} ${ring(11.1, 10.6, 197.5, 360 - g.ora)}" fill="var(--an-choroid)"/>`;
    s += `<path class="${cls("retina")}" ${dk("retina")} d="${ring(10.6, 10.1, g.ora, 192.5)} ${ring(10.6, 10.1, 197.5, 360 - g.ora)}" fill="var(--an-retina)"/>`;
    // 鋸齒緣標記
    // 黃斑部與中央窩
    const m1 = P(173, 10.05), m2 = P(187, 10.05);
    s += `<path class="${cls("macula")}" ${dk("macula")} d="M${pt(m1)} A${f(10.05 * S)} ${f(10.05 * S)} 0 0 1 ${pt(m2)}" fill="none" stroke="var(--an-macula)" stroke-width="5" stroke-linecap="round"/>`;
    const fv = P(180, 10.0);
    s += `<circle ${dk("macula")} class="${cls("macula")}" cx="${f(fv[0] + 1)}" cy="${f(fv[1])}" r="2.2" fill="var(--an-choroid)"/>`;
    // 視盤
    const dd = P(195, 10.35);
    s += `<circle class="${cls("disc")}" ${dk("disc")} cx="${f(dd[0])}" cy="${f(dd[1])}" r="${f(0.75 * S)}" fill="var(--an-disc)" stroke="var(--an-nerve-edge)" stroke-width="1"/>`;
    // 睫狀體（上下兩塊）
    for (const sg of [-1, 1]) {
      const w1 = P(-sg * 29.5, 11.1), w2 = P(-sg * (g.ora + 1), 11.1);
      const ap = [X(g.cbApex[0]), Y(sg * g.cbApex[1])];
      s += `<path class="${cls("ciliary")}" ${dk("ciliary")} d="M${pt(w1)} L${pt([ap[0] - 3, ap[1] + sg * 2])} L${pt(ap)} L${pt([ap[0] + 5, ap[1] + sg * 3])} L${pt(w2)} Z" fill="var(--an-ciliary)" stroke="var(--an-line)" stroke-width="0.8" stroke-linejoin="round"/>`;
      // 懸韌帶：放鬆時下垂成弧線
      const eqx = (g.eqF + g.eqB) / 2;
      for (const dx of [-0.35, 0, 0.35]) {
        const z0 = [X(g.cbApex[0] + dx * 0.6), Y(sg * (g.cbApex[1] - 0.15))], z1 = [X(eqx + dx), Y(sg * (g.lensH - 0.05))];
        const slack = (o.a || 0) * 7;
        const mid = [(z0[0] + z1[0]) / 2 + slack, (z0[1] + z1[1]) / 2];
        s += `<path ${dk("ciliary")} class="${cls("ciliary")} an-zon" d="M${pt(z0)} Q${pt(mid)} ${pt(z1)}" fill="none" stroke="var(--an-zonule)" stroke-width="0.9"/>`;
      }
    }
    // 水晶體
    const lt = [X(g.eqF), Y(-g.lensH)], lb = [X(g.eqF), Y(g.lensH)], lbt = [X(g.eqB), Y(-g.lensH)], lbb = [X(g.eqB), Y(g.lensH)];
    s += `<path class="${cls("lens")}" ${dk("lens")} d="M${pt(lt)} A${f(g.Rf * S)} ${f(g.Rf * S)} 0 0 0 ${pt(lb)} L${pt(lbb)} A${f(g.Rb * S)} ${f(g.Rb * S)} 0 0 0 ${pt(lbt)} Z" fill="var(--an-lens)" stroke="var(--an-lens-edge)" stroke-width="1.2"/>`;
    // 虹膜（上下兩片），瞳孔＝中間空隙
    for (const sg of [-1, 1]) {
      const y1 = sg * 5.45, y2 = sg * g.pupil;
      s += `<path class="${cls("iris")}" ${dk("iris")} d="M${pt([X(g.irisX), Y(y1)])} L${pt([X(g.irisX + 0.55), Y(y1)])} L${pt([X(g.irisX + 0.55), Y(y2)])} L${pt([X(g.irisX + 0.1), Y(y2)])} Z" fill="var(--an-iris)"/>`;
    }
    s += `<rect class="${cls("pupil")}" ${dk("pupil")} x="${f(X(g.irisX) - 2)}" y="${f(Y(-g.pupil))}" width="${f(0.55 * S + 4)}" height="${f(2 * g.pupil * S)}" fill="transparent"/>`;
    // 後房（點選區）
    s += `<path class="${cls("pc")}" ${dk("pc")} d="M${pt([X(g.irisX + 0.55), Y(-5.2)])} L${pt([X(g.cbApex[0] - 0.2), Y(-g.cbApex[1])])} L${pt([X(g.eqF), Y(-g.lensH)])} L${pt([X(g.lensF + 0.2), Y(-g.pupil - 0.3)])} L${pt([X(g.irisX + 0.55), Y(-g.pupil - 0.3)])} Z M${pt([X(g.irisX + 0.55), Y(5.2)])} L${pt([X(g.cbApex[0] - 0.2), Y(g.cbApex[1])])} L${pt([X(g.eqF), Y(g.lensH)])} L${pt([X(g.lensF + 0.2), Y(g.pupil + 0.3)])} L${pt([X(g.irisX + 0.55), Y(g.pupil + 0.3)])} Z" fill="var(--an-pc)"/>`;
    // 角膜
    const lo = [X(g.limb[0]), Y(-g.limb[1])], lo2 = [X(g.limb[0]), Y(g.limb[1])];
    s += `<path class="${cls("cornea")}" ${dk("cornea")} d="M${pt(lo)} A${f(7.8 * S)} ${f(7.8 * S)} 0 0 0 ${pt(lo2)} L${pt([X(g.cornInX), Y(g.cornInY)])} A${f(6.5 * S)} ${f(6.5 * S)} 0 0 1 ${pt([X(g.cornInX), Y(-g.cornInY)])} Z" fill="var(--an-cornea)" stroke="var(--an-cornea-edge)" stroke-width="1.3"/>`;
    // 方位
    s += `<text x="${X(-14.2)}" y="${Y(10.6)}" font-size="11" fill="var(--muted)" text-anchor="middle">光線 →</text>`;
    s += `<text x="${X(9)}" y="${Y(13.6)}" font-size="11" fill="var(--muted)" text-anchor="middle">↓ 鼻側（右眼水平切面，上視）</text>`;

    // 標註針與名稱
    if (o.pins) {
      const A = anchors(g);
      const list = STRUCT.filter((t) => o.pins === true || o.pins.includes(t.k));
      const byY = (u, v) => A[u.k][1] - A[v.k][1];
      const L = list.filter((t) => t.side === "L").sort(byY), R = list.filter((t) => t.side === "R").sort(byY);
      const order = L.concat(R);
      const place = (arr, side) => arr.map((t, i) => {
        const n = order.indexOf(t) + 1;
        const py = 30 + i * (300 / Math.max(1, arr.length - 1 || 1));
        const px = side === "L" ? 245 : 640;
        const an = A[t.k];
        const name = o.names === "both" ? `${t.zh} ${t.en}` : o.names === "zh" ? t.zh : (o.answers && o.answers[t.k]) || "";
        const state = o.state && o.state[t.k] ? ` pin-${o.state[t.k]}` : "";
        const sel = o.sel === t.k ? " pin-sel" : "";
        return `<g class="pin${state}${sel}" data-pin="${t.k}" tabindex="0" role="button" aria-label="第 ${n} 號標籤">
          <line x1="${f(an[0])}" y1="${f(an[1])}" x2="${f(px + (side === "L" ? 11 : -11))}" y2="${f(py)}" stroke="var(--an-leader)" stroke-width="1"/>
          <circle cx="${f(an[0])}" cy="${f(an[1])}" r="2.6" fill="var(--an-leader)"/>
          <circle cx="${px}" cy="${f(py)}" r="11" class="pin-dot"/>
          <text x="${px}" y="${f(py + 4)}" text-anchor="middle" font-size="12" font-weight="700" class="pin-n">${n}</text>
          ${name ? `<text x="${side === "L" ? px - 17 : px + 17}" y="${f(py + 4)}" text-anchor="${side === "L" ? "end" : "start"}" font-size="12.5" class="pin-t">${name}</text>` : ""}
        </g>`;
      }).join("");
      s += place(L, "L") + place(R, "R");
    }
    return `<svg viewBox="${o.pins ? "0 0 820 360" : "205 15 420 340"}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${o.label || "眼球水平剖面示意圖"}">${s}</svg>`;
  }

  window.OLAnat = { eye, STRUCT, geom };
})();
