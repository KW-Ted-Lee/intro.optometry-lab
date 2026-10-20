/* ★ 九項計算（全部一步驟）＋實驗週的兩項計算。數字隨機，原創題。
   每題標註 star：1–9 對應期末複習「★ 九項計算總整理」；0 為實驗週的額外計算。 */
(function () {
  const { define, F } = (typeof window !== "undefined" ? window : globalThis).OBPractice;
  const cm = (v, d = 1) => (Math.abs(v) < 1e-9 ? "0" : (v < 0 ? "−" : "") + Math.abs(v).toFixed(d)) + " cm";
  const NICE = [100, 50, 40, 33, 25, 20, 12.5, 10];        // 常見焦距／距離（cm）
  const q4 = (v) => Math.round(v * 4 + (v < 0 ? -1e-9 : 1e-9)) / 4;
  const ax3 = (a) => String(a).padStart(3, "0");

  /* ---------- W05 比例換算 ---------- */
  define("w05", [
    { id: "5-1", star: 0, title: "模型比例換算", gen(r) {
      const ball = r.pick([8, 10, 12, 15]);                 // 保麗龍球直徑 cm
      const k = ball * 10 / 24;                             // 放大倍數
      const it = r.pick([["角膜直徑", 11, "mm"], ["視盤直徑", 1.5, "mm"], ["水晶體厚度", 4, "mm"], ["瞳孔直徑", 3, "mm"], ["中央窩直徑", 1.5, "mm"], ["前房深度", 3, "mm"]]);
      const ans = it[1] * k;
      return {
        q: `真實眼軸長約 24 mm。你的保麗龍球直徑是 <b>${ball} cm</b>，代表眼軸長。模型上的「${it[0]}」（真實約 ${it[1]} ${it[2]}）應該做多大？`,
        parts: [{ label: "放大倍數", type: "num", ans: k, unit: "倍", dp: 2, tol: 0.03 }, { label: it[0], type: "num", ans: ans, unit: "mm", dp: 1, tol: Math.max(0.3, ans * 0.02) }],
        steps: [
          { c: "先算放大倍數：模型直徑 ÷ 真實眼軸長，單位要一致（cm 換成 mm）。", e: `${ball} cm = ${ball * 10} mm；${ball * 10} ÷ 24 = ${k.toFixed(2)} 倍` },
          { c: "再把真實尺寸乘上同一個倍數。", e: `${it[1]} × ${k.toFixed(2)} = ${ans.toFixed(1)} mm` },
        ],
      };
    } },
  ]);

  /* ---------- ★1 F = 1/f ---------- */
  define("w06", [
    { id: "6-1", star: 1, title: "焦距 → 屈光度", gen(r) {
      const f = r.pick([100, 50, 40, 33.3, 25, 20, 12.5, 10, 8, 5]) * (r.rand() < 0.25 ? -1 : 1);
      const D = 100 / f;
      return {
        q: `一片鏡片的焦距是 <b>${cm(f)}</b>${f < 0 ? "（負號代表虛焦點在鏡片前方）" : ""}。它的屈光度是多少？`,
        parts: [{ label: "屈光度 F", type: "num", ans: D, unit: "D", dp: 2, tol: 0.03 }, { label: "鏡片種類", type: "choice", opts: ["凸透鏡（正）", "凹透鏡（負）"], ans: D > 0 ? 0 : 1 }],
        steps: [
          { c: "公分先除以 100 換成公尺。", e: `${cm(f)} = ${(f / 100).toFixed(3)} m` },
          { c: "取倒數：F = 1 / f。", e: `F = 1 / ${(f / 100).toFixed(3)} = ${F.D(D)}` },
          { c: D > 0 ? "正號：會聚光線、有實焦點，是凸透鏡。" : "負號：發散光線、只有虛焦點，是凹透鏡。" },
        ],
      };
    } },
    { id: "6-2", star: 1, title: "屈光度 → 焦點位置（反向題）", gen(r) {
      const D = r.pick([1, 2, 2.5, 4, 5, 8, 10]) * r.sign();
      const f = 100 / D;
      return {
        q: `一片 <b>${F.D(D)}</b> 的鏡片，${D > 0 ? "實" : "虛"}焦點在哪裡？請填焦距（公分，含正負號）並選出位置。`,
        parts: [{ label: "焦距 f", type: "num", ans: f, unit: "cm", dp: 1, tol: 0.2 }, { label: "焦點位置", type: "choice", opts: ["鏡片後方（實焦點）", "鏡片前方（虛焦點）"], ans: D > 0 ? 0 : 1 }],
        steps: [
          { c: "f = 1 / F，算出來是公尺。", e: `f = 1 / ${F.s(D)} = ${(1 / D).toFixed(3)} m` },
          { c: "換成公分。", e: `${(1 / D).toFixed(3)} m = ${cm(f)}` },
          { c: D > 0 ? "正值：光線真的交會在鏡片後方。" : "負號只代表方向：虛焦點在鏡片「前方」，要把發散光反向延長才找得到。" },
        ],
      };
    } },
  ]);

  /* ---------- W07 誤差百分比 ---------- */
  define("w07", [
    { id: "7-1", star: 0, title: "實測焦距與誤差百分比", gen(r) {
      const lab = r.pick([2, 5, 10]);
      const fTrue = 100 / lab;
      const fMeas = +(fTrue + r.pick([-1, 1]) * r.step(0.3, lab === 10 ? 0.8 : 2.5, 0.1)).toFixed(1);
      const Dm = 100 / fMeas, err = Math.abs(Dm - lab) / lab * 100;
      return {
        q: `單元 A：標示 <b>+${lab.toFixed(2)} D</b> 的凸透鏡，你量到的焦距是 <b>${fMeas.toFixed(1)} cm</b>。實測屈光度是多少？誤差百分比是多少？`,
        parts: [{ label: "實測 F", type: "num", ans: Dm, unit: "D", dp: 2, tol: 0.03 }, { label: "誤差", type: "num", ans: err, unit: "%", dp: 1, tol: 0.4 }],
        steps: [
          { c: "F = 1 / f（公尺）。", e: `F = 1 / ${(fMeas / 100).toFixed(3)} = ${F.D(Dm)}` },
          { c: "誤差百分比 = |實測 − 標示| ÷ 標示 × 100%。", e: `|${Dm.toFixed(2)} − ${lab.toFixed(2)}| ÷ ${lab.toFixed(2)} × 100% = ${err.toFixed(1)}%` },
          { c: lab === 10 ? "高度數鏡片焦距短，量錯幾公釐就是好幾個百分比。" : "低度數鏡片焦距長，同樣的量測誤差造成的百分比較小。" },
        ],
      };
    } },
  ]);

  /* ---------- ★2 遠點距離 ---------- */
  const farPoint = { id: "8-1", star: 2, title: "近視度數 → 遠點", gen(r) {
    const D = -r.pick([0.5, 1, 1.25, 2, 2.5, 3, 4, 5, 6, 8, 10]);
    const fp = -100 / D;
    return {
      q: `一位 <b>${F.D(D)}</b> 的近視者，不戴眼鏡時能看清楚的最遠距離（遠點）在眼前幾公分？`,
      parts: [{ label: "遠點距離", type: "num", ans: fp, unit: "cm", dp: 1, tol: Math.max(0.3, fp * 0.01) }],
      steps: [
        { c: "遠點距離（公尺）＝ 1 ÷ 度數（取絕對值）。", e: `1 ÷ ${Math.abs(D).toFixed(2)} = ${(fp / 100).toFixed(3)} m` },
        { c: "換成公分。", e: `${fp.toFixed(1)} cm（在眼前）` },
        { c: "度數越深，遠點越近。" },
      ],
    };
  } };
  const farPointRev = { id: "8-2", star: 2, title: "遠點 → 近視度數（反向題）", gen(r) {
    const d = r.pick([100, 66.7, 50, 40, 33, 25, 20, 16.7, 12.5, 10]);
    const raw = -100 / d, D = q4(raw);
    return {
      q: `某生裸眼只看得清 <b>${d} cm</b> 以內的東西。他大約是幾度的近視？（答案取到最接近的 0.25 D）`,
      parts: [{ label: "度數", type: "num", ans: D, unit: "D", dp: 2, tol: 0.13 }],
      steps: [
        { c: "看得清的最遠距離就是遠點。度數 ＝ 1 ÷ 遠點距離（公尺），近視加負號。", e: `1 ÷ ${(d / 100).toFixed(3)} = ${Math.abs(raw).toFixed(2)}` },
        { c: "取最接近的 0.25 D。", e: `約 ${F.D(D)}` },
      ],
    };
  } };
  define("w08", [farPoint, farPointRev]);
  define("w10", [Object.assign({}, farPoint, { id: "10-1" }), Object.assign({}, farPointRev, { id: "10-2" })]);

  /* ---------- ★6 光學十字、★7 三十法則 ---------- */
  define("w12", [
    { id: "12-1", star: 6, title: "光學十字 → 散光量與處方", gen(r) {
      const weak = r.step(-6, 2, 0.25), cyl = r.step(0.5, 3, 0.25), vertStrong = r.rand() < 0.6;
      const h = vertStrong ? weak : weak - cyl, v = vertStrong ? weak - cyl : weak;   // 負度數較多＝屈光力較強
      const axis = vertStrong ? 180 : 90;
      return {
        q: `光學十字：水平子午線 <b>${F.D(h)}</b>、垂直子午線 <b>${F.D(v)}</b>。求散光量、型別，並寫出負柱面處方。`,
        parts: [
          { label: "散光量", type: "num", ans: cyl, unit: "D", dp: 2, tol: 0.01 },
          { label: "型別", type: "choice", opts: ["順散 WTR", "逆散 ATR"], ans: vertStrong ? 0 : 1 },
          { label: "處方球面 S", type: "num", ans: weak, unit: "D", dp: 2, tol: 0.01 },
          { label: "處方柱面 C", type: "num", ans: -cyl, unit: "D", dp: 2, tol: 0.01 },
          { label: "軸度", type: "num", ans: axis, unit: "°", dp: 0, tol: 0.1 },
        ],
        steps: [
          { c: "散光量 ＝ 兩條主子午線相減，取絕對值。", e: `|${F.s(v)} − ${F.s(h)}| = ${cyl.toFixed(2)} D` },
          { c: `比較誰較強（較負）：${vertStrong ? "垂直" : "水平"}子午線較強，所以是${vertStrong ? "順散" : "逆散"}。` },
          { c: "負柱面處方：球面取「較弱」那條；柱面＝差值加負號；軸度＝較弱那條子午線的方向。", e: `${weak === 0 ? "pl" : F.s(weak)} / ${F.s(-cyl)} × ${axis}` },
        ],
      };
    } },
    { id: "12-2", star: 7, title: "散光鐘三十法則", gen(r) {
      const h = r.int(1, 6);
      const a = h * 30;
      return {
        q: `病人雲霧後看散光鐘，說 <b>${h} 點鐘</b>方向（也就是 ${h} 點與 ${h + 6} 點連成的那條線）最黑。負柱面的軸度大約是多少？`,
        parts: [{ label: "負柱面軸度", type: "num", ans: a, unit: "°", dp: 0, tol: 0.1 }],
        steps: [
          { c: "三十法則：最黑那條線的鐘面數字（取 1–6 之間較小的那個）× 30。", e: `${h} × 30 = ${a}°` },
          { c: "記得前提：要先雲霧，讓兩條焦線都在視網膜前方，判讀才可靠。" },
        ],
      };
    } },
  ]);

  /* ---------- ★8 SE、★9 正負柱面轉換 ---------- */
  define("w13", [
    { id: "13-1", star: 8, title: "等價球面 SE", gen(r) {
      const S = r.step(-6, 4, 0.25), C = -r.step(0.5, 4, 0.25), A = r.pick([180, 90]);
      const se = S + C / 2;
      return {
        q: `處方 <b>${S === 0 ? "pl" : F.s(S)} / ${F.s(C)} × ${ax3(A)}</b> 的等價球面 SE 是多少？`,
        parts: [{ label: "SE", type: "num", ans: se, unit: "D", dp: 3, tol: 0.006 }],
        steps: [
          { c: "SE ＝ S ＋ C ÷ 2。", e: `${F.s(S)} + (${F.s(C)} ÷ 2) = ${F.s(S)} + ${F.s(C / 2, 3)} = ${F.s(se, 3)} D` },
          { c: "SE 的物理意義：把最小模糊圈移到視網膜上所需的球面度數。" },
        ],
      };
    } },
    { id: "13-2", star: 9, title: "正負柱面轉換（軸 90／180）", gen(r) {
      const S = r.step(-6, 4, 0.25), C = r.sign() * r.step(0.5, 3, 0.25), A = r.pick([180, 90]);
      const nS = S + C, nC = -C, nA = A === 180 ? 90 : 180;
      return {
        q: `把 <b>${S === 0 ? "pl" : F.s(S)} / ${F.s(C)} × ${ax3(A)}</b> 轉換成另一種柱面寫法。`,
        parts: [{ label: "新球面", type: "num", ans: nS, unit: "D", dp: 2, tol: 0.01 }, { label: "新柱面", type: "num", ans: nC, unit: "D", dp: 2, tol: 0.01 }, { label: "新軸度", type: "num", ans: nA, unit: "°", dp: 0, tol: 0.1 }],
        steps: [
          { c: "步驟一：新球面 ＝ 原球面 ＋ 原柱面（代數相加）。", e: `${F.s(S)} + ${F.s(C)} = ${F.s(nS)}` },
          { c: "步驟二：柱面變號，數值不變。", e: `${F.s(C)} → ${F.s(nC)}` },
          { c: "步驟三：軸度 ± 90°，所以 180 ↔ 90。", e: `${A} → ${nA}` },
          { c: "答案", e: `${nS === 0 ? "pl" : F.s(nS)} / ${F.s(nC)} × ${ax3(nA)}` },
        ],
      };
    } },
    { id: "13-3", star: 0, title: "判斷五種成像位置", gen(r) {
      const cases = [
        () => [0, -r.step(0.5, 3, 0.25), 0],
        () => { const C = -r.step(0.5, 3, 0.25); return [-C, C, 1]; },
        () => [-r.step(0.5, 5, 0.25), -r.step(0.5, 3, 0.25), 2],
        () => { const C = -r.step(0.5, 2, 0.25); return [-C + r.step(0.5, 3, 0.25), C, 3]; },
        () => { const C = -r.step(1.5, 4, 0.25); return [r.step(0.25, -C - 0.5, 0.25), C, 4]; },
      ];
      const [S, C, k] = r.pick(cases)();
      const names = ["簡單近視型", "簡單遠視型", "複合近視型", "複合遠視型", "混合式"];
      const A = r.pick([180, 90]);
      return {
        q: `處方 <b>${S === 0 ? "pl" : F.s(S)} / ${F.s(C)} × ${ax3(A)}</b> 屬於哪一型散光？`,
        parts: [{ label: "型別", type: "choice", opts: names, ans: k }],
        steps: [
          { c: "看兩個數字：S，以及 S ＋ C（也就是兩條主子午線各自的屈光不正）。", e: `S = ${F.s(S)}；S + C = ${F.s(S + C)}` },
          { c: "其中一個是 0 → 簡單型；同負 → 複合近視；同正 → 複合遠視；一正一負 → 混合式。", e: `→ ${names[k]}` },
        ],
      };
    } },
  ]);

  /* ---------- ★3 調節需求、★4 AA、★5 Hofstetter 最小式 ---------- */
  define("w14", [
    { id: "14-1", star: 3, title: "調節需求 ＝ 1 / 距離", gen(r) {
      const d = r.pick([50, 40, 33, 25, 20, 10]);
      const D = 100 / d;
      return {
        q: `一位正視眼的人看眼前 <b>${d} cm</b> 的書，需要動用多少調節？`,
        parts: [{ label: "調節需求", type: "num", ans: D, unit: "D", dp: 2, tol: d === 33 ? 0.06 : 0.02 }],
        steps: [{ c: "調節需求 ＝ 1 ÷ 距離（公尺）。這條公式只適用於正視眼或已完全矯正的眼睛。", e: `1 ÷ ${(d / 100).toFixed(2)} = ${D.toFixed(2)} D` }],
      };
    } },
    { id: "14-2", star: 4, title: "近點 → 調節幅度 AA", gen(r) {
      const np = r.pick([5, 6, 7, 8, 10, 12.5, 15, 20, 25, 40, 50]);
      const AA = 100 / np;
      return {
        q: `用推進法量到一位已完全矯正者的近點在 <b>${np} cm</b>。他的調節幅度 AA 是多少？`,
        parts: [{ label: "AA", type: "num", ans: AA, unit: "D", dp: 2, tol: 0.03 }],
        steps: [{ c: "矯正後遠點在無限遠（0 D），所以 AA ＝ 1 ÷ 近點（公尺）。", e: `1 ÷ ${(np / 100).toFixed(3)} = ${AA.toFixed(2)} D` }],
      };
    } },
    { id: "14-3", star: 5, title: "Hofstetter 最小式", gen(r) {
      const age = r.int(10, 56);
      const AA = 15 - 0.25 * age, np = 100 / AA;
      return {
        q: `用 Hofstetter 最小式（臨床常用）估算 <b>${age} 歲</b>的調節幅度，並換算近點大約在幾公分。`,
        parts: [{ label: "最小 AA", type: "num", ans: AA, unit: "D", dp: 2, tol: 0.02 }, { label: "近點", type: "num", ans: np, unit: "cm", dp: 1, tol: Math.max(0.3, np * 0.015) }],
        steps: [
          { c: "最小 AA ＝ 15 − 0.25 × 年齡。（最大式 25 − 0.40 × 年齡、平均式 18.5 − 0.30 × 年齡也要認得，但臨床上用最小式。）", e: `15 − 0.25 × ${age} = 15 − ${(0.25 * age).toFixed(2)} = ${AA.toFixed(2)} D` },
          { c: "近點（公尺）＝ 1 ÷ AA。", e: `1 ÷ ${AA.toFixed(2)} = ${(np / 100).toFixed(3)} m ≈ ${np.toFixed(1)} cm` },
          { c: AA < 5 ? "AA 已低於 5.00 D：閱讀 40 cm 需要 2.50 D，超過一半的調節幅度，開始會有老花的感覺。" : "AA 還在 5.00 D 以上，閱讀 40 cm 只用到一半以內的調節，看近還算輕鬆。" },
        ],
      };
    } },
  ]);
})();
