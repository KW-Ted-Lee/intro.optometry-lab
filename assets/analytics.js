/* =========================================================
   Google Analytics 4（瀏覽統計）＋ 同意提示
   - 同一個 kw-ted-lee.github.io 底下的所有網站共用這個檔案與同一個評估 ID，
     訪客在任一個網站按過「同意／不同意」，其他網站都會記得。
   - 還沒選：用 Google 的「同意模式」只送不含 cookie 的匿名統計。
   - 同意：正常記錄（使用 cookie）。不同意：完全不載入 Google Analytics。
   - 其他程式可呼叫 labTrack("事件名稱", { 參數 }) 送自訂事件；沒同意時會自動略過。
   ========================================================= */
(function () {
  "use strict";
  var GA_ID = "G-GQL7T22B8Z";
  var KEY = "kw-ga-consent";
  var TEXT = {
    zh: { msg: "本網站使用 Google Analytics 匿名統計瀏覽情形，用來改善教材，不會收集姓名、學號等個人資料。", yes: "同意", no: "不同意", settings: "瀏覽統計設定" },
    en: { msg: "This site uses Google Analytics to collect anonymous usage statistics that help us improve our teaching materials. No names or student IDs are collected.", yes: "Accept", no: "Decline", settings: "Analytics settings" },
    ja: { msg: "本サイトでは教材改善のため、Google Analytics で匿名の利用統計を取得しています。氏名や学籍番号などの個人情報は収集しません。", yes: "同意する", no: "同意しない", settings: "アクセス解析の設定" },
  };
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function lang() { var l = (document.documentElement.lang || "zh").toLowerCase(); return l.indexOf("en") === 0 ? "en" : l.indexOf("ja") === 0 ? "ja" : "zh"; }

  var choice = get();
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    window.gtag = gtag;
    gtag("consent", "default", { analytics_storage: choice === "granted" ? "granted" : "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    gtag("js", new Date());
    gtag("config", GA_ID);
    var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    (document.head || document.documentElement).appendChild(s);
  }
  if (choice === "denied") window["ga-disable-" + GA_ID] = true; else load();

  /* 自訂事件 */
  window.labTrack = function (name, params) {
    if (!loaded || get() === "denied") return;
    try { gtag("event", name, params || {}); } catch (e) {}
  };

  /* 同意提示 */
  var bar = null;
  function css() {
    if (document.getElementById("ga-consent-css")) return;
    var st = document.createElement("style"); st.id = "ga-consent-css";
    st.textContent = ".ga-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:80;max-width:720px;margin:0 auto;display:flex;gap:12px 16px;align-items:center;flex-wrap:wrap;" +
      "padding:14px 16px;border-radius:14px;border:1px solid var(--line,#ccc);background:var(--surface,#fff);color:var(--ink,#222);box-shadow:0 12px 32px -12px rgba(0,0,0,.35);font-size:14px;line-height:1.6}" +
      ".ga-consent p{margin:0;flex:1 1 260px}.ga-consent .ga-btns{display:flex;gap:8px;flex:none}" +
      ".ga-consent button{font:inherit;font-weight:700;font-size:14px;padding:7px 14px;border-radius:9px;cursor:pointer;border:1px solid var(--accent,#1d6a8a)}" +
      ".ga-consent .ga-yes{background:var(--accent,#1d6a8a);color:var(--accent-ink,#fff)}.ga-consent .ga-no{background:transparent;color:var(--accent,#1d6a8a)}";
    document.head.appendChild(st);
  }
  function render() {
    if (!bar) return;
    var t = TEXT[lang()];
    bar.innerHTML = '<p>' + t.msg + '</p><div class="ga-btns"><button type="button" class="ga-no">' + t.no + '</button><button type="button" class="ga-yes">' + t.yes + "</button></div>";
  }
  function show() {
    if (bar) return; css();
    bar = document.createElement("div"); bar.className = "ga-consent"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Analytics");
    render(); document.body.appendChild(bar);
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.classList.contains("ga-yes")) {
        set("granted"); choice = "granted"; window["ga-disable-" + GA_ID] = false; load();
        gtag("consent", "update", { analytics_storage: "granted" });
      } else {
        set("denied"); choice = "denied"; window["ga-disable-" + GA_ID] = true;
        if (loaded) gtag("consent", "update", { analytics_storage: "denied" });
      }
      bar.remove(); bar = null;
    });
  }
  /* 讓網頁可以重新打開提示（例如頁尾的「瀏覽統計設定」） */
  window.labConsent = { show: show, text: function () { return TEXT[lang()].settings; } };

  function init() {
    if (choice !== "granted" && choice !== "denied") show();
    /* 網頁切換語言時，提示文字跟著換 */
    if (window.MutationObserver) new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
