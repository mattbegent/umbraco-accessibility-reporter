var wp = Object.defineProperty;
var Tp = (e, t, r) => t in e ? wp(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ie = (e, t, r) => (Tp(e, typeof t != "symbol" ? t + "" : t, r), r);
import { LitElement as ei, html as pt, property as Ut, customElement as ti, css as Xl, unsafeHTML as Sp, state as qe, ifDefined as bp } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as ri } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT_TOKEN as Ep } from "@umbraco-cms/backoffice/notification";
const Dr = class Dr {
  static async runTest(t, r, n) {
    return new Promise(async (i, s) => {
      try {
        let a = function() {
          f && (f.src = "", f.remove(), f = null);
        };
        const o = new Request(r);
        await fetch(o);
        const l = "arTestIframe" + Dr.randomUUID(), c = t.getElementById(n ? "dashboard-ar-tests" : "contentcolumn");
        let f = document.createElement("iframe");
        const h = function(u) {
          u.data.testRunner && u.data.testRunner.name === "axe" && (a(), u.data ? i(u.data) : s(u), u = null, window.removeEventListener("message", h, !0));
        };
        window.addEventListener("message", h, !0), f.setAttribute("src", r), f.setAttribute("id", l), f.style.height = "800px", n ? f.style.width = c.clientWidth + "px" : (f.style.width = "1280px", f.style.zIndex = "1", f.style.position = "absolute"), setTimeout(() => {
          c.appendChild(f);
        }, 0), f.onload = function() {
          var u;
          if ((u = f == null ? void 0 : f.contentWindow) != null && u.document.body) {
            let d = f.contentWindow.document.createElement("script");
            d.type = "text/javascript", d.src = "/App_Plugins/AccessibilityReporter/libs/axe.min.js", f.contentWindow.document.body.appendChild(d), d = null;
          } else
            a(), s("Test page has no body.");
        };
      } catch (a) {
        s(a);
      }
    });
  }
  static sortIssuesByImpact(t, r) {
    return t.impact === r.impact ? r.nodes.length - t.nodes.length : Dr.impacts.indexOf(t.impact) > Dr.impacts.indexOf(r.impact) ? -1 : Dr.impacts.indexOf(t.impact) < Dr.impacts.indexOf(r.impact) ? 1 : 0;
  }
  static sortByViolations(t, r) {
    return r.nodes.length - t.nodes.length;
  }
  // https://www.deque.com/axe/core-documentation/api-documentation/
  static mapTagsToStandard(t) {
    var r = t.filter((i) => i.indexOf("cat.") === -1 && !i.startsWith("TT") && !i.startsWith("ACT")), n = r.map(Dr.axeTagToStandard);
    return n;
  }
  static upperCaseFirstLetter(t) {
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  static impactToTag(t) {
    switch (t) {
      case "serious":
      case "critical":
        return "danger";
      case "moderate":
        return "warning";
      default:
        return "default";
    }
  }
  static axeTagToStandard(t) {
    switch (t) {
      case "wcag2a":
        return "WCAG 2.0 A";
      case "wcag2aa":
        return "WCAG 2.0 AA";
      case "wcag2aaa":
        return "WCAG 2.0 AAA";
      case "wcag21a":
        return "WCAG 2.1 A";
      case "wcag21aa":
        return "WCAG 2.1 AA";
      case "wcag21aaa":
        return "WCAG 2.1 AAA";
      case "wcag22a":
        return "WCAG 2.2 A";
      case "wcag22aa":
        return "WCAG 2.2 AA";
      case "wcag22aaa":
        return "WCAG 2.2 AAA";
      case "best-practice":
        return "Best Practice";
      case "section508":
        return "Section 508";
    }
    return t.indexOf("wcag") !== -1 ? t.toUpperCase() : t.indexOf("section") !== -1 ? t.replace("section", "Section ") : t;
  }
  static getWCAGLevel(t) {
    for (let r = 0; r < t.length; r++)
      switch (t[r]) {
        case "wcagaaa":
          return "AAA";
        case "wcag2aa":
        case "wcag21aa":
        case "wcag22aa":
          return "AA";
        case "wcag2a":
        case "wcag21a":
        case "wcag22a":
          return "A";
        default:
          continue;
      }
    return "Other";
  }
  static getRule(t) {
    return axe.getRules().find((n) => n.ruleId = t);
  }
  static getBaseURL() {
    return location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");
  }
  static formatResultForSaving(t, r, n) {
    return {
      url: t.url,
      nodeId: r,
      culture: n,
      date: t.timestamp,
      violations: t.violations.map((i) => ({
        id: i.id,
        errors: i.nodes.length
      })),
      incomplete: t.violations.map((i) => ({
        id: i.id,
        errors: i.nodes.length
      })),
      passes: t.violations.map((i) => ({
        id: i.id,
        elements: i.nodes.length
      }))
    };
  }
  static saveToSessionStorage(t, r) {
    try {
      sessionStorage.setItem(t, JSON.stringify(r));
    } catch (n) {
      console.error(n);
    }
  }
  static getItemFromSessionStorage(t) {
    const r = sessionStorage.getItem(t);
    return r ? JSON.parse(r) : null;
  }
  static isAbsoluteURL(t) {
    return t.indexOf("http://") === 0 || t.indexOf("https://") === 0;
  }
  static getHostnameFromString(t) {
    return new URL(t).hostname;
  }
  static getPageScore(t) {
    let r = 100;
    for (let n = 0; n < t.violations.length; n++) {
      const i = t.violations[n];
      r -= Dr.getRuleWeight(i.id);
    }
    return Math.max(0, r);
  }
  // https://developer.chrome.com/docs/lighthouse/accessibility/scoring/
  static getRuleWeight(t) {
    switch (t) {
      case "accesskeys":
        return 7;
      case "aria-allowed-attr":
        return 10;
      case "aria-allowed-role":
        return 1;
      case "aria-command-name":
        return 7;
      case "aria-dialog-name":
        return 7;
      case "aria-hidden-body":
        return 10;
      case "aria-hidden-focus":
        return 7;
      case "aria-input-field-name":
        return 7;
      case "aria-meter-name":
        return 7;
      case "aria-progressbar-name":
        return 7;
      case "aria-required-attr":
        return 10;
      case "aria-required-children":
        return 10;
      case "aria-required-parent":
        return 10;
      case "aria-roles":
        return 7;
      case "aria-text":
        return 7;
      case "aria-toggle-field-name":
        return 7;
      case "aria-tooltip-name":
        return 7;
      case "aria-treeitem-name":
        return 7;
      case "aria-valid-attr-value":
        return 10;
      case "aria-valid-attr":
        return 10;
      case "button-name":
        return 10;
      case "bypass":
        return 7;
      case "color-contrast":
        return 7;
      case "definition-list":
        return 7;
      case "dlitem":
        return 7;
      case "document-title":
        return 7;
      case "duplicate-id-active":
        return 7;
      case "duplicate-id-aria":
        return 10;
      case "form-field-multiple-labels":
        return 3;
      case "frame-title":
        return 7;
      case "heading-order":
        return 3;
      case "html-has-lang":
        return 7;
      case "html-lang-valid":
        return 7;
      case "html-xml-lang-mismatch":
        return 3;
      case "image-alt":
        return 10;
      case "image-redundant-alt":
        return 1;
      case "input-button-name":
        return 10;
      case "input-image-alt":
        return 10;
      case "label-content-name-mismatch":
        return 7;
      case "label":
        return 7;
      case "link-in-text-block":
        return 7;
      case "link-name":
        return 7;
      case "list":
        return 7;
      case "listitem":
        return 7;
      case "meta-refresh":
        return 10;
      case "meta-viewport":
        return 10;
      case "object-alt":
        return 7;
      case "select-name":
        return 7;
      case "skip-link":
        return 3;
      case "tabindex":
        return 7;
      case "table-duplicate-name":
        return 1;
      case "table-fake-caption":
        return 7;
      case "td-has-header":
        return 10;
      case "td-headers-attr":
        return 7;
      case "th-has-data-cells":
        return 7;
      case "valid-lang":
        return 7;
      case "video-caption":
        return 10;
      default:
        return 0;
    }
  }
  static formatFileName(t) {
    return t.replace(/\s+/g, "-").toLowerCase();
  }
  static formatNumber(t) {
    return t.toLocaleString();
  }
  static randomUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(t) {
      var r = Math.random() * 16 | 0, n = t == "x" ? r : r & 3 | 8;
      return n.toString(16);
    });
  }
};
Dr.impacts = ["minor", "moderate", "serious", "critical"];
let Dt = Dr;
class ff {
  static async getIssues(t, r, n) {
    let i = new URL(t.apiUrl);
    if (i.searchParams.append("url", r), n && i.searchParams.append("language", n), t.testsToRun)
      for (let o = 0; o < t.testsToRun.length; o++)
        i.searchParams.append("tags", t.testsToRun[o]);
    return await (await fetch(i.toString())).json();
  }
  static async getConfig() {
    return {
      apiUrl: "",
      testBaseUrl: "",
      testsToRun: [
        "wcag2a",
        "wcag2aa",
        "wcag21a",
        "wcag21aa",
        "wcag22aa",
        "best-practice"
      ],
      userGroups: [
        "admin",
        "editor",
        "writer",
        "translator",
        "sensitiveData"
      ],
      runTestsAutomatically: !0,
      includeIfNoTemplate: !1,
      maxPages: 50
    };
  }
  static async getPages() {
    return [
      {
        guid: "1c9c08e6-3dda-44c5-aa85-08f2949a4658",
        id: 15370,
        name: "Homepage",
        docTypeAlias: "sitePage",
        url: "https://localhost:44318/"
      },
      {
        guid: "1c9c08e6-3dda-44c5-aa85-08f2949a4658",
        id: 15371,
        name: "404",
        docTypeAlias: "sitePage2",
        url: "https://localhost:44318/404"
      }
    ];
  }
}
/*!
 * @kurkle/color v0.3.2
 * https://github.com/kurkle/color#readme
 * (c) 2023 Jukka Kurkela
 * Released under the MIT License
 */
function Ws(e) {
  return e + 0.5 | 0;
}
const dn = (e, t, r) => Math.max(Math.min(e, r), t);
function ts(e) {
  return dn(Ws(e * 2.55), 0, 255);
}
function wn(e) {
  return dn(Ws(e * 255), 0, 255);
}
function jr(e) {
  return dn(Ws(e / 2.55) / 100, 0, 1);
}
function hf(e) {
  return dn(Ws(e * 100), 0, 100);
}
const ir = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 }, yl = [..."0123456789ABCDEF"], Ap = (e) => yl[e & 15], kp = (e) => yl[(e & 240) >> 4] + yl[e & 15], ra = (e) => (e & 240) >> 4 === (e & 15), Op = (e) => ra(e.r) && ra(e.g) && ra(e.b) && ra(e.a);
function Dp(e) {
  var t = e.length, r;
  return e[0] === "#" && (t === 4 || t === 5 ? r = {
    r: 255 & ir[e[1]] * 17,
    g: 255 & ir[e[2]] * 17,
    b: 255 & ir[e[3]] * 17,
    a: t === 5 ? ir[e[4]] * 17 : 255
  } : (t === 7 || t === 9) && (r = {
    r: ir[e[1]] << 4 | ir[e[2]],
    g: ir[e[3]] << 4 | ir[e[4]],
    b: ir[e[5]] << 4 | ir[e[6]],
    a: t === 9 ? ir[e[7]] << 4 | ir[e[8]] : 255
  })), r;
}
const Fp = (e, t) => e < 255 ? t(e) : "";
function Cp(e) {
  var t = Op(e) ? Ap : kp;
  return e ? "#" + t(e.r) + t(e.g) + t(e.b) + Fp(e.a, t) : void 0;
}
const Mp = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function O0(e, t, r) {
  const n = t * Math.min(r, 1 - r), i = (s, a = (s + e / 30) % 12) => r - n * Math.max(Math.min(a - 3, 9 - a, 1), -1);
  return [i(0), i(8), i(4)];
}
function Pp(e, t, r) {
  const n = (i, s = (i + e / 60) % 6) => r - r * t * Math.max(Math.min(s, 4 - s, 1), 0);
  return [n(5), n(3), n(1)];
}
function Rp(e, t, r) {
  const n = O0(e, 1, 0.5);
  let i;
  for (t + r > 1 && (i = 1 / (t + r), t *= i, r *= i), i = 0; i < 3; i++)
    n[i] *= 1 - t - r, n[i] += t;
  return n;
}
function Ip(e, t, r, n, i) {
  return e === i ? (t - r) / n + (t < r ? 6 : 0) : t === i ? (r - e) / n + 2 : (e - t) / n + 4;
}
function Kl(e) {
  const r = e.r / 255, n = e.g / 255, i = e.b / 255, s = Math.max(r, n, i), a = Math.min(r, n, i), o = (s + a) / 2;
  let l, c, f;
  return s !== a && (f = s - a, c = o > 0.5 ? f / (2 - s - a) : f / (s + a), l = Ip(r, n, i, f, s), l = l * 60 + 0.5), [l | 0, c || 0, o];
}
function ql(e, t, r, n) {
  return (Array.isArray(t) ? e(t[0], t[1], t[2]) : e(t, r, n)).map(wn);
}
function Zl(e, t, r) {
  return ql(O0, e, t, r);
}
function Lp(e, t, r) {
  return ql(Rp, e, t, r);
}
function Np(e, t, r) {
  return ql(Pp, e, t, r);
}
function D0(e) {
  return (e % 360 + 360) % 360;
}
function Bp(e) {
  const t = Mp.exec(e);
  let r = 255, n;
  if (!t)
    return;
  t[5] !== n && (r = t[6] ? ts(+t[5]) : wn(+t[5]));
  const i = D0(+t[2]), s = +t[3] / 100, a = +t[4] / 100;
  return t[1] === "hwb" ? n = Lp(i, s, a) : t[1] === "hsv" ? n = Np(i, s, a) : n = Zl(i, s, a), {
    r: n[0],
    g: n[1],
    b: n[2],
    a: r
  };
}
function Wp(e, t) {
  var r = Kl(e);
  r[0] = D0(r[0] + t), r = Zl(r), e.r = r[0], e.g = r[1], e.b = r[2];
}
function Up(e) {
  if (!e)
    return;
  const t = Kl(e), r = t[0], n = hf(t[1]), i = hf(t[2]);
  return e.a < 255 ? `hsla(${r}, ${n}%, ${i}%, ${jr(e.a)})` : `hsl(${r}, ${n}%, ${i}%)`;
}
const uf = {
  x: "dark",
  Z: "light",
  Y: "re",
  X: "blu",
  W: "gr",
  V: "medium",
  U: "slate",
  A: "ee",
  T: "ol",
  S: "or",
  B: "ra",
  C: "lateg",
  D: "ights",
  R: "in",
  Q: "turquois",
  E: "hi",
  P: "ro",
  O: "al",
  N: "le",
  M: "de",
  L: "yello",
  F: "en",
  K: "ch",
  G: "arks",
  H: "ea",
  I: "ightg",
  J: "wh"
}, df = {
  OiceXe: "f0f8ff",
  antiquewEte: "faebd7",
  aqua: "ffff",
  aquamarRe: "7fffd4",
  azuY: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "0",
  blanKedOmond: "ffebcd",
  Xe: "ff",
  XeviTet: "8a2be2",
  bPwn: "a52a2a",
  burlywood: "deb887",
  caMtXe: "5f9ea0",
  KartYuse: "7fff00",
  KocTate: "d2691e",
  cSO: "ff7f50",
  cSnflowerXe: "6495ed",
  cSnsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "ffff",
  xXe: "8b",
  xcyan: "8b8b",
  xgTMnPd: "b8860b",
  xWay: "a9a9a9",
  xgYF: "6400",
  xgYy: "a9a9a9",
  xkhaki: "bdb76b",
  xmagFta: "8b008b",
  xTivegYF: "556b2f",
  xSange: "ff8c00",
  xScEd: "9932cc",
  xYd: "8b0000",
  xsOmon: "e9967a",
  xsHgYF: "8fbc8f",
  xUXe: "483d8b",
  xUWay: "2f4f4f",
  xUgYy: "2f4f4f",
  xQe: "ced1",
  xviTet: "9400d3",
  dAppRk: "ff1493",
  dApskyXe: "bfff",
  dimWay: "696969",
  dimgYy: "696969",
  dodgerXe: "1e90ff",
  fiYbrick: "b22222",
  flSOwEte: "fffaf0",
  foYstWAn: "228b22",
  fuKsia: "ff00ff",
  gaRsbSo: "dcdcdc",
  ghostwEte: "f8f8ff",
  gTd: "ffd700",
  gTMnPd: "daa520",
  Way: "808080",
  gYF: "8000",
  gYFLw: "adff2f",
  gYy: "808080",
  honeyMw: "f0fff0",
  hotpRk: "ff69b4",
  RdianYd: "cd5c5c",
  Rdigo: "4b0082",
  ivSy: "fffff0",
  khaki: "f0e68c",
  lavFMr: "e6e6fa",
  lavFMrXsh: "fff0f5",
  lawngYF: "7cfc00",
  NmoncEffon: "fffacd",
  ZXe: "add8e6",
  ZcSO: "f08080",
  Zcyan: "e0ffff",
  ZgTMnPdLw: "fafad2",
  ZWay: "d3d3d3",
  ZgYF: "90ee90",
  ZgYy: "d3d3d3",
  ZpRk: "ffb6c1",
  ZsOmon: "ffa07a",
  ZsHgYF: "20b2aa",
  ZskyXe: "87cefa",
  ZUWay: "778899",
  ZUgYy: "778899",
  ZstAlXe: "b0c4de",
  ZLw: "ffffe0",
  lime: "ff00",
  limegYF: "32cd32",
  lRF: "faf0e6",
  magFta: "ff00ff",
  maPon: "800000",
  VaquamarRe: "66cdaa",
  VXe: "cd",
  VScEd: "ba55d3",
  VpurpN: "9370db",
  VsHgYF: "3cb371",
  VUXe: "7b68ee",
  VsprRggYF: "fa9a",
  VQe: "48d1cc",
  VviTetYd: "c71585",
  midnightXe: "191970",
  mRtcYam: "f5fffa",
  mistyPse: "ffe4e1",
  moccasR: "ffe4b5",
  navajowEte: "ffdead",
  navy: "80",
  Tdlace: "fdf5e6",
  Tive: "808000",
  TivedBb: "6b8e23",
  Sange: "ffa500",
  SangeYd: "ff4500",
  ScEd: "da70d6",
  pOegTMnPd: "eee8aa",
  pOegYF: "98fb98",
  pOeQe: "afeeee",
  pOeviTetYd: "db7093",
  papayawEp: "ffefd5",
  pHKpuff: "ffdab9",
  peru: "cd853f",
  pRk: "ffc0cb",
  plum: "dda0dd",
  powMrXe: "b0e0e6",
  purpN: "800080",
  YbeccapurpN: "663399",
  Yd: "ff0000",
  Psybrown: "bc8f8f",
  PyOXe: "4169e1",
  saddNbPwn: "8b4513",
  sOmon: "fa8072",
  sandybPwn: "f4a460",
  sHgYF: "2e8b57",
  sHshell: "fff5ee",
  siFna: "a0522d",
  silver: "c0c0c0",
  skyXe: "87ceeb",
  UXe: "6a5acd",
  UWay: "708090",
  UgYy: "708090",
  snow: "fffafa",
  sprRggYF: "ff7f",
  stAlXe: "4682b4",
  tan: "d2b48c",
  teO: "8080",
  tEstN: "d8bfd8",
  tomato: "ff6347",
  Qe: "40e0d0",
  viTet: "ee82ee",
  JHt: "f5deb3",
  wEte: "ffffff",
  wEtesmoke: "f5f5f5",
  Lw: "ffff00",
  LwgYF: "9acd32"
};
function zp() {
  const e = {}, t = Object.keys(df), r = Object.keys(uf);
  let n, i, s, a, o;
  for (n = 0; n < t.length; n++) {
    for (a = o = t[n], i = 0; i < r.length; i++)
      s = r[i], o = o.replace(s, uf[s]);
    s = parseInt(df[a], 16), e[o] = [s >> 16 & 255, s >> 8 & 255, s & 255];
  }
  return e;
}
let na;
function Hp(e) {
  na || (na = zp(), na.transparent = [0, 0, 0, 0]);
  const t = na[e.toLowerCase()];
  return t && {
    r: t[0],
    g: t[1],
    b: t[2],
    a: t.length === 4 ? t[3] : 255
  };
}
const Vp = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function Yp(e) {
  const t = Vp.exec(e);
  let r = 255, n, i, s;
  if (t) {
    if (t[7] !== n) {
      const a = +t[7];
      r = t[8] ? ts(a) : dn(a * 255, 0, 255);
    }
    return n = +t[1], i = +t[3], s = +t[5], n = 255 & (t[2] ? ts(n) : dn(n, 0, 255)), i = 255 & (t[4] ? ts(i) : dn(i, 0, 255)), s = 255 & (t[6] ? ts(s) : dn(s, 0, 255)), {
      r: n,
      g: i,
      b: s,
      a: r
    };
  }
}
function jp(e) {
  return e && (e.a < 255 ? `rgba(${e.r}, ${e.g}, ${e.b}, ${jr(e.a)})` : `rgb(${e.r}, ${e.g}, ${e.b})`);
}
const Xo = (e) => e <= 31308e-7 ? e * 12.92 : Math.pow(e, 1 / 2.4) * 1.055 - 0.055, ui = (e) => e <= 0.04045 ? e / 12.92 : Math.pow((e + 0.055) / 1.055, 2.4);
function $p(e, t, r) {
  const n = ui(jr(e.r)), i = ui(jr(e.g)), s = ui(jr(e.b));
  return {
    r: wn(Xo(n + r * (ui(jr(t.r)) - n))),
    g: wn(Xo(i + r * (ui(jr(t.g)) - i))),
    b: wn(Xo(s + r * (ui(jr(t.b)) - s))),
    a: e.a + r * (t.a - e.a)
  };
}
function ia(e, t, r) {
  if (e) {
    let n = Kl(e);
    n[t] = Math.max(0, Math.min(n[t] + n[t] * r, t === 0 ? 360 : 1)), n = Zl(n), e.r = n[0], e.g = n[1], e.b = n[2];
  }
}
function F0(e, t) {
  return e && Object.assign(t || {}, e);
}
function gf(e) {
  var t = { r: 0, g: 0, b: 0, a: 255 };
  return Array.isArray(e) ? e.length >= 3 && (t = { r: e[0], g: e[1], b: e[2], a: 255 }, e.length > 3 && (t.a = wn(e[3]))) : (t = F0(e, { r: 0, g: 0, b: 0, a: 1 }), t.a = wn(t.a)), t;
}
function Gp(e) {
  return e.charAt(0) === "r" ? Yp(e) : Bp(e);
}
class Ss {
  constructor(t) {
    if (t instanceof Ss)
      return t;
    const r = typeof t;
    let n;
    r === "object" ? n = gf(t) : r === "string" && (n = Dp(t) || Hp(t) || Gp(t)), this._rgb = n, this._valid = !!n;
  }
  get valid() {
    return this._valid;
  }
  get rgb() {
    var t = F0(this._rgb);
    return t && (t.a = jr(t.a)), t;
  }
  set rgb(t) {
    this._rgb = gf(t);
  }
  rgbString() {
    return this._valid ? jp(this._rgb) : void 0;
  }
  hexString() {
    return this._valid ? Cp(this._rgb) : void 0;
  }
  hslString() {
    return this._valid ? Up(this._rgb) : void 0;
  }
  mix(t, r) {
    if (t) {
      const n = this.rgb, i = t.rgb;
      let s;
      const a = r === s ? 0.5 : r, o = 2 * a - 1, l = n.a - i.a, c = ((o * l === -1 ? o : (o + l) / (1 + o * l)) + 1) / 2;
      s = 1 - c, n.r = 255 & c * n.r + s * i.r + 0.5, n.g = 255 & c * n.g + s * i.g + 0.5, n.b = 255 & c * n.b + s * i.b + 0.5, n.a = a * n.a + (1 - a) * i.a, this.rgb = n;
    }
    return this;
  }
  interpolate(t, r) {
    return t && (this._rgb = $p(this._rgb, t._rgb, r)), this;
  }
  clone() {
    return new Ss(this.rgb);
  }
  alpha(t) {
    return this._rgb.a = wn(t), this;
  }
  clearer(t) {
    const r = this._rgb;
    return r.a *= 1 - t, this;
  }
  greyscale() {
    const t = this._rgb, r = Ws(t.r * 0.3 + t.g * 0.59 + t.b * 0.11);
    return t.r = t.g = t.b = r, this;
  }
  opaquer(t) {
    const r = this._rgb;
    return r.a *= 1 + t, this;
  }
  negate() {
    const t = this._rgb;
    return t.r = 255 - t.r, t.g = 255 - t.g, t.b = 255 - t.b, this;
  }
  lighten(t) {
    return ia(this._rgb, 2, t), this;
  }
  darken(t) {
    return ia(this._rgb, 2, -t), this;
  }
  saturate(t) {
    return ia(this._rgb, 1, t), this;
  }
  desaturate(t) {
    return ia(this._rgb, 1, -t), this;
  }
  rotate(t) {
    return Wp(this._rgb, t), this;
  }
}
/*!
 * Chart.js v4.4.1
 * https://www.chartjs.org
 * (c) 2023 Chart.js Contributors
 * Released under the MIT License
 */
function Ur() {
}
const Xp = /* @__PURE__ */ (() => {
  let e = 0;
  return () => e++;
})();
function Te(e) {
  return e === null || typeof e > "u";
}
function He(e) {
  if (Array.isArray && Array.isArray(e))
    return !0;
  const t = Object.prototype.toString.call(e);
  return t.slice(0, 7) === "[object" && t.slice(-6) === "Array]";
}
function be(e) {
  return e !== null && Object.prototype.toString.call(e) === "[object Object]";
}
function nt(e) {
  return (typeof e == "number" || e instanceof Number) && isFinite(+e);
}
function Xt(e, t) {
  return nt(e) ? e : t;
}
function xe(e, t) {
  return typeof e > "u" ? t : e;
}
const Kp = (e, t) => typeof e == "string" && e.endsWith("%") ? parseFloat(e) / 100 : +e / t, C0 = (e, t) => typeof e == "string" && e.endsWith("%") ? parseFloat(e) / 100 * t : +e;
function Ne(e, t, r) {
  if (e && typeof e.call == "function")
    return e.apply(r, t);
}
function Me(e, t, r, n) {
  let i, s, a;
  if (He(e))
    if (s = e.length, n)
      for (i = s - 1; i >= 0; i--)
        t.call(r, e[i], i);
    else
      for (i = 0; i < s; i++)
        t.call(r, e[i], i);
  else if (be(e))
    for (a = Object.keys(e), s = a.length, i = 0; i < s; i++)
      t.call(r, e[a[i]], a[i]);
}
function Ua(e, t) {
  let r, n, i, s;
  if (!e || !t || e.length !== t.length)
    return !1;
  for (r = 0, n = e.length; r < n; ++r)
    if (i = e[r], s = t[r], i.datasetIndex !== s.datasetIndex || i.index !== s.index)
      return !1;
  return !0;
}
function za(e) {
  if (He(e))
    return e.map(za);
  if (be(e)) {
    const t = /* @__PURE__ */ Object.create(null), r = Object.keys(e), n = r.length;
    let i = 0;
    for (; i < n; ++i)
      t[r[i]] = za(e[r[i]]);
    return t;
  }
  return e;
}
function M0(e) {
  return [
    "__proto__",
    "prototype",
    "constructor"
  ].indexOf(e) === -1;
}
function qp(e, t, r, n) {
  if (!M0(e))
    return;
  const i = t[e], s = r[e];
  be(i) && be(s) ? Mr(i, s, n) : t[e] = za(s);
}
function Mr(e, t, r) {
  const n = He(t) ? t : [
    t
  ], i = n.length;
  if (!be(e))
    return e;
  r = r || {};
  const s = r.merger || qp;
  let a;
  for (let o = 0; o < i; ++o) {
    if (a = n[o], !be(a))
      continue;
    const l = Object.keys(a);
    for (let c = 0, f = l.length; c < f; ++c)
      s(l[c], e, a, r);
  }
  return e;
}
function as(e, t) {
  return Mr(e, t, {
    merger: Zp
  });
}
function Zp(e, t, r) {
  if (!M0(e))
    return;
  const n = t[e], i = r[e];
  be(n) && be(i) ? as(n, i) : Object.prototype.hasOwnProperty.call(t, e) || (t[e] = za(i));
}
const pf = {
  // Chart.helpers.core resolveObjectKey should resolve empty key to root object
  "": (e) => e,
  // default resolvers
  x: (e) => e.x,
  y: (e) => e.y
};
function Jp(e) {
  const t = e.split("."), r = [];
  let n = "";
  for (const i of t)
    n += i, n.endsWith("\\") ? n = n.slice(0, -1) + "." : (r.push(n), n = "");
  return r;
}
function Qp(e) {
  const t = Jp(e);
  return (r) => {
    for (const n of t) {
      if (n === "")
        break;
      r = r && r[n];
    }
    return r;
  };
}
function Sn(e, t) {
  return (pf[t] || (pf[t] = Qp(t)))(e);
}
function Jl(e) {
  return e.charAt(0).toUpperCase() + e.slice(1);
}
const bs = (e) => typeof e < "u", bn = (e) => typeof e == "function", mf = (e, t) => {
  if (e.size !== t.size)
    return !1;
  for (const r of e)
    if (!t.has(r))
      return !1;
  return !0;
};
function e1(e) {
  return e.type === "mouseup" || e.type === "click" || e.type === "contextmenu";
}
const Ye = Math.PI, Ve = 2 * Ye, t1 = Ve + Ye, Ha = Number.POSITIVE_INFINITY, r1 = Ye / 180, ot = Ye / 2, Pn = Ye / 4, xf = Ye * 2 / 3, gn = Math.log10, Cr = Math.sign;
function os(e, t, r) {
  return Math.abs(e - t) < r;
}
function _f(e) {
  const t = Math.round(e);
  e = os(e, t, e / 1e3) ? t : e;
  const r = Math.pow(10, Math.floor(gn(e))), n = e / r;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * r;
}
function n1(e) {
  const t = [], r = Math.sqrt(e);
  let n;
  for (n = 1; n < r; n++)
    e % n === 0 && (t.push(n), t.push(e / n));
  return r === (r | 0) && t.push(r), t.sort((i, s) => i - s).pop(), t;
}
function Ci(e) {
  return !isNaN(parseFloat(e)) && isFinite(e);
}
function i1(e, t) {
  const r = Math.round(e);
  return r - t <= e && r + t >= e;
}
function P0(e, t, r) {
  let n, i, s;
  for (n = 0, i = e.length; n < i; n++)
    s = e[n][r], isNaN(s) || (t.min = Math.min(t.min, s), t.max = Math.max(t.max, s));
}
function pr(e) {
  return e * (Ye / 180);
}
function Ql(e) {
  return e * (180 / Ye);
}
function vf(e) {
  if (!nt(e))
    return;
  let t = 1, r = 0;
  for (; Math.round(e * t) / t !== e; )
    t *= 10, r++;
  return r;
}
function R0(e, t) {
  const r = t.x - e.x, n = t.y - e.y, i = Math.sqrt(r * r + n * n);
  let s = Math.atan2(n, r);
  return s < -0.5 * Ye && (s += Ve), {
    angle: s,
    distance: i
  };
}
function wl(e, t) {
  return Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2));
}
function s1(e, t) {
  return (e - t + t1) % Ve - Ye;
}
function qt(e) {
  return (e % Ve + Ve) % Ve;
}
function Es(e, t, r, n) {
  const i = qt(e), s = qt(t), a = qt(r), o = qt(s - i), l = qt(a - i), c = qt(i - s), f = qt(i - a);
  return i === s || i === a || n && s === a || o > l && c < f;
}
function xt(e, t, r) {
  return Math.max(t, Math.min(r, e));
}
function a1(e) {
  return xt(e, -32768, 32767);
}
function Gr(e, t, r, n = 1e-6) {
  return e >= Math.min(t, r) - n && e <= Math.max(t, r) + n;
}
function ec(e, t, r) {
  r = r || ((a) => e[a] < t);
  let n = e.length - 1, i = 0, s;
  for (; n - i > 1; )
    s = i + n >> 1, r(s) ? i = s : n = s;
  return {
    lo: i,
    hi: n
  };
}
const Xr = (e, t, r, n) => ec(e, r, n ? (i) => {
  const s = e[i][t];
  return s < r || s === r && e[i + 1][t] === r;
} : (i) => e[i][t] < r), o1 = (e, t, r) => ec(e, r, (n) => e[n][t] >= r);
function l1(e, t, r) {
  let n = 0, i = e.length;
  for (; n < i && e[n] < t; )
    n++;
  for (; i > n && e[i - 1] > r; )
    i--;
  return n > 0 || i < e.length ? e.slice(n, i) : e;
}
const I0 = [
  "push",
  "pop",
  "shift",
  "splice",
  "unshift"
];
function c1(e, t) {
  if (e._chartjs) {
    e._chartjs.listeners.push(t);
    return;
  }
  Object.defineProperty(e, "_chartjs", {
    configurable: !0,
    enumerable: !1,
    value: {
      listeners: [
        t
      ]
    }
  }), I0.forEach((r) => {
    const n = "_onData" + Jl(r), i = e[r];
    Object.defineProperty(e, r, {
      configurable: !0,
      enumerable: !1,
      value(...s) {
        const a = i.apply(this, s);
        return e._chartjs.listeners.forEach((o) => {
          typeof o[n] == "function" && o[n](...s);
        }), a;
      }
    });
  });
}
function yf(e, t) {
  const r = e._chartjs;
  if (!r)
    return;
  const n = r.listeners, i = n.indexOf(t);
  i !== -1 && n.splice(i, 1), !(n.length > 0) && (I0.forEach((s) => {
    delete e[s];
  }), delete e._chartjs);
}
function L0(e) {
  const t = new Set(e);
  return t.size === e.length ? e : Array.from(t);
}
const N0 = function() {
  return typeof window > "u" ? function(e) {
    return e();
  } : window.requestAnimationFrame;
}();
function B0(e, t) {
  let r = [], n = !1;
  return function(...i) {
    r = i, n || (n = !0, N0.call(window, () => {
      n = !1, e.apply(t, r);
    }));
  };
}
function f1(e, t) {
  let r;
  return function(...n) {
    return t ? (clearTimeout(r), r = setTimeout(e, t, n)) : e.apply(this, n), t;
  };
}
const tc = (e) => e === "start" ? "left" : e === "end" ? "right" : "center", Ot = (e, t, r) => e === "start" ? t : e === "end" ? r : (t + r) / 2, h1 = (e, t, r, n) => e === (n ? "left" : "right") ? r : e === "center" ? (t + r) / 2 : t;
function W0(e, t, r) {
  const n = t.length;
  let i = 0, s = n;
  if (e._sorted) {
    const { iScale: a, _parsed: o } = e, l = a.axis, { min: c, max: f, minDefined: h, maxDefined: u } = a.getUserBounds();
    h && (i = xt(Math.min(
      // @ts-expect-error Need to type _parsed
      Xr(o, l, c).lo,
      // @ts-expect-error Need to fix types on _lookupByKey
      r ? n : Xr(t, l, a.getPixelForValue(c)).lo
    ), 0, n - 1)), u ? s = xt(Math.max(
      // @ts-expect-error Need to type _parsed
      Xr(o, a.axis, f, !0).hi + 1,
      // @ts-expect-error Need to fix types on _lookupByKey
      r ? 0 : Xr(t, l, a.getPixelForValue(f), !0).hi + 1
    ), i, n) - i : s = n - i;
  }
  return {
    start: i,
    count: s
  };
}
function U0(e) {
  const { xScale: t, yScale: r, _scaleRanges: n } = e, i = {
    xmin: t.min,
    xmax: t.max,
    ymin: r.min,
    ymax: r.max
  };
  if (!n)
    return e._scaleRanges = i, !0;
  const s = n.xmin !== t.min || n.xmax !== t.max || n.ymin !== r.min || n.ymax !== r.max;
  return Object.assign(n, i), s;
}
const sa = (e) => e === 0 || e === 1, wf = (e, t, r) => -(Math.pow(2, 10 * (e -= 1)) * Math.sin((e - t) * Ve / r)), Tf = (e, t, r) => Math.pow(2, -10 * e) * Math.sin((e - t) * Ve / r) + 1, ls = {
  linear: (e) => e,
  easeInQuad: (e) => e * e,
  easeOutQuad: (e) => -e * (e - 2),
  easeInOutQuad: (e) => (e /= 0.5) < 1 ? 0.5 * e * e : -0.5 * (--e * (e - 2) - 1),
  easeInCubic: (e) => e * e * e,
  easeOutCubic: (e) => (e -= 1) * e * e + 1,
  easeInOutCubic: (e) => (e /= 0.5) < 1 ? 0.5 * e * e * e : 0.5 * ((e -= 2) * e * e + 2),
  easeInQuart: (e) => e * e * e * e,
  easeOutQuart: (e) => -((e -= 1) * e * e * e - 1),
  easeInOutQuart: (e) => (e /= 0.5) < 1 ? 0.5 * e * e * e * e : -0.5 * ((e -= 2) * e * e * e - 2),
  easeInQuint: (e) => e * e * e * e * e,
  easeOutQuint: (e) => (e -= 1) * e * e * e * e + 1,
  easeInOutQuint: (e) => (e /= 0.5) < 1 ? 0.5 * e * e * e * e * e : 0.5 * ((e -= 2) * e * e * e * e + 2),
  easeInSine: (e) => -Math.cos(e * ot) + 1,
  easeOutSine: (e) => Math.sin(e * ot),
  easeInOutSine: (e) => -0.5 * (Math.cos(Ye * e) - 1),
  easeInExpo: (e) => e === 0 ? 0 : Math.pow(2, 10 * (e - 1)),
  easeOutExpo: (e) => e === 1 ? 1 : -Math.pow(2, -10 * e) + 1,
  easeInOutExpo: (e) => sa(e) ? e : e < 0.5 ? 0.5 * Math.pow(2, 10 * (e * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (e * 2 - 1)) + 2),
  easeInCirc: (e) => e >= 1 ? e : -(Math.sqrt(1 - e * e) - 1),
  easeOutCirc: (e) => Math.sqrt(1 - (e -= 1) * e),
  easeInOutCirc: (e) => (e /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - e * e) - 1) : 0.5 * (Math.sqrt(1 - (e -= 2) * e) + 1),
  easeInElastic: (e) => sa(e) ? e : wf(e, 0.075, 0.3),
  easeOutElastic: (e) => sa(e) ? e : Tf(e, 0.075, 0.3),
  easeInOutElastic(e) {
    return sa(e) ? e : e < 0.5 ? 0.5 * wf(e * 2, 0.1125, 0.45) : 0.5 + 0.5 * Tf(e * 2 - 1, 0.1125, 0.45);
  },
  easeInBack(e) {
    return e * e * ((1.70158 + 1) * e - 1.70158);
  },
  easeOutBack(e) {
    return (e -= 1) * e * ((1.70158 + 1) * e + 1.70158) + 1;
  },
  easeInOutBack(e) {
    let t = 1.70158;
    return (e /= 0.5) < 1 ? 0.5 * (e * e * (((t *= 1.525) + 1) * e - t)) : 0.5 * ((e -= 2) * e * (((t *= 1.525) + 1) * e + t) + 2);
  },
  easeInBounce: (e) => 1 - ls.easeOutBounce(1 - e),
  easeOutBounce(e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375 : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  },
  easeInOutBounce: (e) => e < 0.5 ? ls.easeInBounce(e * 2) * 0.5 : ls.easeOutBounce(e * 2 - 1) * 0.5 + 0.5
};
function rc(e) {
  if (e && typeof e == "object") {
    const t = e.toString();
    return t === "[object CanvasPattern]" || t === "[object CanvasGradient]";
  }
  return !1;
}
function Sf(e) {
  return rc(e) ? e : new Ss(e);
}
function Ko(e) {
  return rc(e) ? e : new Ss(e).saturate(0.5).darken(0.1).hexString();
}
const u1 = [
  "x",
  "y",
  "borderWidth",
  "radius",
  "tension"
], d1 = [
  "color",
  "borderColor",
  "backgroundColor"
];
function g1(e) {
  e.set("animation", {
    delay: void 0,
    duration: 1e3,
    easing: "easeOutQuart",
    fn: void 0,
    from: void 0,
    loop: void 0,
    to: void 0,
    type: void 0
  }), e.describe("animation", {
    _fallback: !1,
    _indexable: !1,
    _scriptable: (t) => t !== "onProgress" && t !== "onComplete" && t !== "fn"
  }), e.set("animations", {
    colors: {
      type: "color",
      properties: d1
    },
    numbers: {
      type: "number",
      properties: u1
    }
  }), e.describe("animations", {
    _fallback: "animation"
  }), e.set("transitions", {
    active: {
      animation: {
        duration: 400
      }
    },
    resize: {
      animation: {
        duration: 0
      }
    },
    show: {
      animations: {
        colors: {
          from: "transparent"
        },
        visible: {
          type: "boolean",
          duration: 0
        }
      }
    },
    hide: {
      animations: {
        colors: {
          to: "transparent"
        },
        visible: {
          type: "boolean",
          easing: "linear",
          fn: (t) => t | 0
        }
      }
    }
  });
}
function p1(e) {
  e.set("layout", {
    autoPadding: !0,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });
}
const bf = /* @__PURE__ */ new Map();
function m1(e, t) {
  t = t || {};
  const r = e + JSON.stringify(t);
  let n = bf.get(r);
  return n || (n = new Intl.NumberFormat(e, t), bf.set(r, n)), n;
}
function Us(e, t, r) {
  return m1(t, r).format(e);
}
const z0 = {
  values(e) {
    return He(e) ? e : "" + e;
  },
  numeric(e, t, r) {
    if (e === 0)
      return "0";
    const n = this.chart.options.locale;
    let i, s = e;
    if (r.length > 1) {
      const c = Math.max(Math.abs(r[0].value), Math.abs(r[r.length - 1].value));
      (c < 1e-4 || c > 1e15) && (i = "scientific"), s = x1(e, r);
    }
    const a = gn(Math.abs(s)), o = isNaN(a) ? 1 : Math.max(Math.min(-1 * Math.floor(a), 20), 0), l = {
      notation: i,
      minimumFractionDigits: o,
      maximumFractionDigits: o
    };
    return Object.assign(l, this.options.ticks.format), Us(e, n, l);
  },
  logarithmic(e, t, r) {
    if (e === 0)
      return "0";
    const n = r[t].significand || e / Math.pow(10, Math.floor(gn(e)));
    return [
      1,
      2,
      3,
      5,
      10,
      15
    ].includes(n) || t > 0.8 * r.length ? z0.numeric.call(this, e, t, r) : "";
  }
};
function x1(e, t) {
  let r = t.length > 3 ? t[2].value - t[1].value : t[1].value - t[0].value;
  return Math.abs(r) >= 1 && e !== Math.floor(e) && (r = e - Math.floor(e)), r;
}
var mo = {
  formatters: z0
};
function _1(e) {
  e.set("scale", {
    display: !0,
    offset: !1,
    reverse: !1,
    beginAtZero: !1,
    bounds: "ticks",
    clip: !0,
    grace: 0,
    grid: {
      display: !0,
      lineWidth: 1,
      drawOnChartArea: !0,
      drawTicks: !0,
      tickLength: 8,
      tickWidth: (t, r) => r.lineWidth,
      tickColor: (t, r) => r.color,
      offset: !1
    },
    border: {
      display: !0,
      dash: [],
      dashOffset: 0,
      width: 1
    },
    title: {
      display: !1,
      text: "",
      padding: {
        top: 4,
        bottom: 4
      }
    },
    ticks: {
      minRotation: 0,
      maxRotation: 50,
      mirror: !1,
      textStrokeWidth: 0,
      textStrokeColor: "",
      padding: 3,
      display: !0,
      autoSkip: !0,
      autoSkipPadding: 3,
      labelOffset: 0,
      callback: mo.formatters.values,
      minor: {},
      major: {},
      align: "center",
      crossAlign: "near",
      showLabelBackdrop: !1,
      backdropColor: "rgba(255, 255, 255, 0.75)",
      backdropPadding: 2
    }
  }), e.route("scale.ticks", "color", "", "color"), e.route("scale.grid", "color", "", "borderColor"), e.route("scale.border", "color", "", "borderColor"), e.route("scale.title", "color", "", "color"), e.describe("scale", {
    _fallback: !1,
    _scriptable: (t) => !t.startsWith("before") && !t.startsWith("after") && t !== "callback" && t !== "parser",
    _indexable: (t) => t !== "borderDash" && t !== "tickBorderDash" && t !== "dash"
  }), e.describe("scales", {
    _fallback: "scale"
  }), e.describe("scale.ticks", {
    _scriptable: (t) => t !== "backdropPadding" && t !== "callback",
    _indexable: (t) => t !== "backdropPadding"
  });
}
const Xn = /* @__PURE__ */ Object.create(null), Tl = /* @__PURE__ */ Object.create(null);
function cs(e, t) {
  if (!t)
    return e;
  const r = t.split(".");
  for (let n = 0, i = r.length; n < i; ++n) {
    const s = r[n];
    e = e[s] || (e[s] = /* @__PURE__ */ Object.create(null));
  }
  return e;
}
function qo(e, t, r) {
  return typeof t == "string" ? Mr(cs(e, t), r) : Mr(cs(e, ""), t);
}
class v1 {
  constructor(t, r) {
    this.animation = void 0, this.backgroundColor = "rgba(0,0,0,0.1)", this.borderColor = "rgba(0,0,0,0.1)", this.color = "#666", this.datasets = {}, this.devicePixelRatio = (n) => n.chart.platform.getDevicePixelRatio(), this.elements = {}, this.events = [
      "mousemove",
      "mouseout",
      "click",
      "touchstart",
      "touchmove"
    ], this.font = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 12,
      style: "normal",
      lineHeight: 1.2,
      weight: null
    }, this.hover = {}, this.hoverBackgroundColor = (n, i) => Ko(i.backgroundColor), this.hoverBorderColor = (n, i) => Ko(i.borderColor), this.hoverColor = (n, i) => Ko(i.color), this.indexAxis = "x", this.interaction = {
      mode: "nearest",
      intersect: !0,
      includeInvisible: !1
    }, this.maintainAspectRatio = !0, this.onHover = null, this.onClick = null, this.parsing = !0, this.plugins = {}, this.responsive = !0, this.scale = void 0, this.scales = {}, this.showLine = !0, this.drawActiveElementsOnTop = !0, this.describe(t), this.apply(r);
  }
  set(t, r) {
    return qo(this, t, r);
  }
  get(t) {
    return cs(this, t);
  }
  describe(t, r) {
    return qo(Tl, t, r);
  }
  override(t, r) {
    return qo(Xn, t, r);
  }
  route(t, r, n, i) {
    const s = cs(this, t), a = cs(this, n), o = "_" + r;
    Object.defineProperties(s, {
      [o]: {
        value: s[r],
        writable: !0
      },
      [r]: {
        enumerable: !0,
        get() {
          const l = this[o], c = a[i];
          return be(l) ? Object.assign({}, c, l) : xe(l, c);
        },
        set(l) {
          this[o] = l;
        }
      }
    });
  }
  apply(t) {
    t.forEach((r) => r(this));
  }
}
var Qe = /* @__PURE__ */ new v1({
  _scriptable: (e) => !e.startsWith("on"),
  _indexable: (e) => e !== "events",
  hover: {
    _fallback: "interaction"
  },
  interaction: {
    _scriptable: !1,
    _indexable: !1
  }
}, [
  g1,
  p1,
  _1
]);
function y1(e) {
  return !e || Te(e.size) || Te(e.family) ? null : (e.style ? e.style + " " : "") + (e.weight ? e.weight + " " : "") + e.size + "px " + e.family;
}
function Va(e, t, r, n, i) {
  let s = t[i];
  return s || (s = t[i] = e.measureText(i).width, r.push(i)), s > n && (n = s), n;
}
function w1(e, t, r, n) {
  n = n || {};
  let i = n.data = n.data || {}, s = n.garbageCollect = n.garbageCollect || [];
  n.font !== t && (i = n.data = {}, s = n.garbageCollect = [], n.font = t), e.save(), e.font = t;
  let a = 0;
  const o = r.length;
  let l, c, f, h, u;
  for (l = 0; l < o; l++)
    if (h = r[l], h != null && !He(h))
      a = Va(e, i, s, a, h);
    else if (He(h))
      for (c = 0, f = h.length; c < f; c++)
        u = h[c], u != null && !He(u) && (a = Va(e, i, s, a, u));
  e.restore();
  const d = s.length / 2;
  if (d > r.length) {
    for (l = 0; l < d; l++)
      delete i[s[l]];
    s.splice(0, d);
  }
  return a;
}
function Rn(e, t, r) {
  const n = e.currentDevicePixelRatio, i = r !== 0 ? Math.max(r / 2, 0.5) : 0;
  return Math.round((t - i) * n) / n + i;
}
function Ef(e, t) {
  t = t || e.getContext("2d"), t.save(), t.resetTransform(), t.clearRect(0, 0, e.width, e.height), t.restore();
}
function Sl(e, t, r, n) {
  H0(e, t, r, n, null);
}
function H0(e, t, r, n, i) {
  let s, a, o, l, c, f, h, u;
  const d = t.pointStyle, p = t.rotation, g = t.radius;
  let m = (p || 0) * r1;
  if (d && typeof d == "object" && (s = d.toString(), s === "[object HTMLImageElement]" || s === "[object HTMLCanvasElement]")) {
    e.save(), e.translate(r, n), e.rotate(m), e.drawImage(d, -d.width / 2, -d.height / 2, d.width, d.height), e.restore();
    return;
  }
  if (!(isNaN(g) || g <= 0)) {
    switch (e.beginPath(), d) {
      default:
        i ? e.ellipse(r, n, i / 2, g, 0, 0, Ve) : e.arc(r, n, g, 0, Ve), e.closePath();
        break;
      case "triangle":
        f = i ? i / 2 : g, e.moveTo(r + Math.sin(m) * f, n - Math.cos(m) * g), m += xf, e.lineTo(r + Math.sin(m) * f, n - Math.cos(m) * g), m += xf, e.lineTo(r + Math.sin(m) * f, n - Math.cos(m) * g), e.closePath();
        break;
      case "rectRounded":
        c = g * 0.516, l = g - c, a = Math.cos(m + Pn) * l, h = Math.cos(m + Pn) * (i ? i / 2 - c : l), o = Math.sin(m + Pn) * l, u = Math.sin(m + Pn) * (i ? i / 2 - c : l), e.arc(r - h, n - o, c, m - Ye, m - ot), e.arc(r + u, n - a, c, m - ot, m), e.arc(r + h, n + o, c, m, m + ot), e.arc(r - u, n + a, c, m + ot, m + Ye), e.closePath();
        break;
      case "rect":
        if (!p) {
          l = Math.SQRT1_2 * g, f = i ? i / 2 : l, e.rect(r - f, n - l, 2 * f, 2 * l);
          break;
        }
        m += Pn;
      case "rectRot":
        h = Math.cos(m) * (i ? i / 2 : g), a = Math.cos(m) * g, o = Math.sin(m) * g, u = Math.sin(m) * (i ? i / 2 : g), e.moveTo(r - h, n - o), e.lineTo(r + u, n - a), e.lineTo(r + h, n + o), e.lineTo(r - u, n + a), e.closePath();
        break;
      case "crossRot":
        m += Pn;
      case "cross":
        h = Math.cos(m) * (i ? i / 2 : g), a = Math.cos(m) * g, o = Math.sin(m) * g, u = Math.sin(m) * (i ? i / 2 : g), e.moveTo(r - h, n - o), e.lineTo(r + h, n + o), e.moveTo(r + u, n - a), e.lineTo(r - u, n + a);
        break;
      case "star":
        h = Math.cos(m) * (i ? i / 2 : g), a = Math.cos(m) * g, o = Math.sin(m) * g, u = Math.sin(m) * (i ? i / 2 : g), e.moveTo(r - h, n - o), e.lineTo(r + h, n + o), e.moveTo(r + u, n - a), e.lineTo(r - u, n + a), m += Pn, h = Math.cos(m) * (i ? i / 2 : g), a = Math.cos(m) * g, o = Math.sin(m) * g, u = Math.sin(m) * (i ? i / 2 : g), e.moveTo(r - h, n - o), e.lineTo(r + h, n + o), e.moveTo(r + u, n - a), e.lineTo(r - u, n + a);
        break;
      case "line":
        a = i ? i / 2 : Math.cos(m) * g, o = Math.sin(m) * g, e.moveTo(r - a, n - o), e.lineTo(r + a, n + o);
        break;
      case "dash":
        e.moveTo(r, n), e.lineTo(r + Math.cos(m) * (i ? i / 2 : g), n + Math.sin(m) * g);
        break;
      case !1:
        e.closePath();
        break;
    }
    e.fill(), t.borderWidth > 0 && e.stroke();
  }
}
function Kr(e, t, r) {
  return r = r || 0.5, !t || e && e.x > t.left - r && e.x < t.right + r && e.y > t.top - r && e.y < t.bottom + r;
}
function xo(e, t) {
  e.save(), e.beginPath(), e.rect(t.left, t.top, t.right - t.left, t.bottom - t.top), e.clip();
}
function _o(e) {
  e.restore();
}
function T1(e, t, r, n, i) {
  if (!t)
    return e.lineTo(r.x, r.y);
  if (i === "middle") {
    const s = (t.x + r.x) / 2;
    e.lineTo(s, t.y), e.lineTo(s, r.y);
  } else
    i === "after" != !!n ? e.lineTo(t.x, r.y) : e.lineTo(r.x, t.y);
  e.lineTo(r.x, r.y);
}
function S1(e, t, r, n) {
  if (!t)
    return e.lineTo(r.x, r.y);
  e.bezierCurveTo(n ? t.cp1x : t.cp2x, n ? t.cp1y : t.cp2y, n ? r.cp2x : r.cp1x, n ? r.cp2y : r.cp1y, r.x, r.y);
}
function b1(e, t) {
  t.translation && e.translate(t.translation[0], t.translation[1]), Te(t.rotation) || e.rotate(t.rotation), t.color && (e.fillStyle = t.color), t.textAlign && (e.textAlign = t.textAlign), t.textBaseline && (e.textBaseline = t.textBaseline);
}
function E1(e, t, r, n, i) {
  if (i.strikethrough || i.underline) {
    const s = e.measureText(n), a = t - s.actualBoundingBoxLeft, o = t + s.actualBoundingBoxRight, l = r - s.actualBoundingBoxAscent, c = r + s.actualBoundingBoxDescent, f = i.strikethrough ? (l + c) / 2 : c;
    e.strokeStyle = e.fillStyle, e.beginPath(), e.lineWidth = i.decorationWidth || 2, e.moveTo(a, f), e.lineTo(o, f), e.stroke();
  }
}
function A1(e, t) {
  const r = e.fillStyle;
  e.fillStyle = t.color, e.fillRect(t.left, t.top, t.width, t.height), e.fillStyle = r;
}
function Kn(e, t, r, n, i, s = {}) {
  const a = He(t) ? t : [
    t
  ], o = s.strokeWidth > 0 && s.strokeColor !== "";
  let l, c;
  for (e.save(), e.font = i.string, b1(e, s), l = 0; l < a.length; ++l)
    c = a[l], s.backdrop && A1(e, s.backdrop), o && (s.strokeColor && (e.strokeStyle = s.strokeColor), Te(s.strokeWidth) || (e.lineWidth = s.strokeWidth), e.strokeText(c, r, n, s.maxWidth)), e.fillText(c, r, n, s.maxWidth), E1(e, r, n, c, s), n += Number(i.lineHeight);
  e.restore();
}
function As(e, t) {
  const { x: r, y: n, w: i, h: s, radius: a } = t;
  e.arc(r + a.topLeft, n + a.topLeft, a.topLeft, 1.5 * Ye, Ye, !0), e.lineTo(r, n + s - a.bottomLeft), e.arc(r + a.bottomLeft, n + s - a.bottomLeft, a.bottomLeft, Ye, ot, !0), e.lineTo(r + i - a.bottomRight, n + s), e.arc(r + i - a.bottomRight, n + s - a.bottomRight, a.bottomRight, ot, 0, !0), e.lineTo(r + i, n + a.topRight), e.arc(r + i - a.topRight, n + a.topRight, a.topRight, 0, -ot, !0), e.lineTo(r + a.topLeft, n);
}
const k1 = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/, O1 = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
function D1(e, t) {
  const r = ("" + e).match(k1);
  if (!r || r[1] === "normal")
    return t * 1.2;
  switch (e = +r[2], r[3]) {
    case "px":
      return e;
    case "%":
      e /= 100;
      break;
  }
  return t * e;
}
const F1 = (e) => +e || 0;
function nc(e, t) {
  const r = {}, n = be(t), i = n ? Object.keys(t) : t, s = be(e) ? n ? (a) => xe(e[a], e[t[a]]) : (a) => e[a] : () => e;
  for (const a of i)
    r[a] = F1(s(a));
  return r;
}
function V0(e) {
  return nc(e, {
    top: "y",
    right: "x",
    bottom: "y",
    left: "x"
  });
}
function Yn(e) {
  return nc(e, [
    "topLeft",
    "topRight",
    "bottomLeft",
    "bottomRight"
  ]);
}
function Et(e) {
  const t = V0(e);
  return t.width = t.left + t.right, t.height = t.top + t.bottom, t;
}
function ft(e, t) {
  e = e || {}, t = t || Qe.font;
  let r = xe(e.size, t.size);
  typeof r == "string" && (r = parseInt(r, 10));
  let n = xe(e.style, t.style);
  n && !("" + n).match(O1) && (console.warn('Invalid font style specified: "' + n + '"'), n = void 0);
  const i = {
    family: xe(e.family, t.family),
    lineHeight: D1(xe(e.lineHeight, t.lineHeight), r),
    size: r,
    style: n,
    weight: xe(e.weight, t.weight),
    string: ""
  };
  return i.string = y1(i), i;
}
function ze(e, t, r, n) {
  let i = !0, s, a, o;
  for (s = 0, a = e.length; s < a; ++s)
    if (o = e[s], o !== void 0 && (t !== void 0 && typeof o == "function" && (o = o(t), i = !1), r !== void 0 && He(o) && (o = o[r % o.length], i = !1), o !== void 0))
      return n && !i && (n.cacheable = !1), o;
}
function C1(e, t, r) {
  const { min: n, max: i } = e, s = C0(t, (i - n) / 2), a = (o, l) => r && o === 0 ? 0 : o + l;
  return {
    min: a(n, -Math.abs(s)),
    max: a(i, s)
  };
}
function On(e, t) {
  return Object.assign(Object.create(e), t);
}
function ic(e, t = [
  ""
], r, n, i = () => e[0]) {
  const s = r || e;
  typeof n > "u" && (n = G0("_fallback", e));
  const a = {
    [Symbol.toStringTag]: "Object",
    _cacheable: !0,
    _scopes: e,
    _rootScopes: s,
    _fallback: n,
    _getTarget: i,
    override: (o) => ic([
      o,
      ...e
    ], t, s, n)
  };
  return new Proxy(a, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(o, l) {
      return delete o[l], delete o._keys, delete e[0][l], !0;
    },
    /**
    * A trap for getting property values.
    */
    get(o, l) {
      return j0(o, l, () => W1(l, t, e, o));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(o, l) {
      return Reflect.getOwnPropertyDescriptor(o._scopes[0], l);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(e[0]);
    },
    /**
    * A trap for the in operator.
    */
    has(o, l) {
      return kf(o).includes(l);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys(o) {
      return kf(o);
    },
    /**
    * A trap for setting property values.
    */
    set(o, l, c) {
      const f = o._storage || (o._storage = i());
      return o[l] = f[l] = c, delete o._keys, !0;
    }
  });
}
function Mi(e, t, r, n) {
  const i = {
    _cacheable: !1,
    _proxy: e,
    _context: t,
    _subProxy: r,
    _stack: /* @__PURE__ */ new Set(),
    _descriptors: Y0(e, n),
    setContext: (s) => Mi(e, s, r, n),
    override: (s) => Mi(e.override(s), t, r, n)
  };
  return new Proxy(i, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(s, a) {
      return delete s[a], delete e[a], !0;
    },
    /**
    * A trap for getting property values.
    */
    get(s, a, o) {
      return j0(s, a, () => P1(s, a, o));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(s, a) {
      return s._descriptors.allKeys ? Reflect.has(e, a) ? {
        enumerable: !0,
        configurable: !0
      } : void 0 : Reflect.getOwnPropertyDescriptor(e, a);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(e);
    },
    /**
    * A trap for the in operator.
    */
    has(s, a) {
      return Reflect.has(e, a);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys() {
      return Reflect.ownKeys(e);
    },
    /**
    * A trap for setting property values.
    */
    set(s, a, o) {
      return e[a] = o, delete s[a], !0;
    }
  });
}
function Y0(e, t = {
  scriptable: !0,
  indexable: !0
}) {
  const { _scriptable: r = t.scriptable, _indexable: n = t.indexable, _allKeys: i = t.allKeys } = e;
  return {
    allKeys: i,
    scriptable: r,
    indexable: n,
    isScriptable: bn(r) ? r : () => r,
    isIndexable: bn(n) ? n : () => n
  };
}
const M1 = (e, t) => e ? e + Jl(t) : t, sc = (e, t) => be(t) && e !== "adapters" && (Object.getPrototypeOf(t) === null || t.constructor === Object);
function j0(e, t, r) {
  if (Object.prototype.hasOwnProperty.call(e, t))
    return e[t];
  const n = r();
  return e[t] = n, n;
}
function P1(e, t, r) {
  const { _proxy: n, _context: i, _subProxy: s, _descriptors: a } = e;
  let o = n[t];
  return bn(o) && a.isScriptable(t) && (o = R1(t, o, e, r)), He(o) && o.length && (o = I1(t, o, e, a.isIndexable)), sc(t, o) && (o = Mi(o, i, s && s[t], a)), o;
}
function R1(e, t, r, n) {
  const { _proxy: i, _context: s, _subProxy: a, _stack: o } = r;
  if (o.has(e))
    throw new Error("Recursion detected: " + Array.from(o).join("->") + "->" + e);
  o.add(e);
  let l = t(s, a || n);
  return o.delete(e), sc(e, l) && (l = ac(i._scopes, i, e, l)), l;
}
function I1(e, t, r, n) {
  const { _proxy: i, _context: s, _subProxy: a, _descriptors: o } = r;
  if (typeof s.index < "u" && n(e))
    return t[s.index % t.length];
  if (be(t[0])) {
    const l = t, c = i._scopes.filter((f) => f !== l);
    t = [];
    for (const f of l) {
      const h = ac(c, i, e, f);
      t.push(Mi(h, s, a && a[e], o));
    }
  }
  return t;
}
function $0(e, t, r) {
  return bn(e) ? e(t, r) : e;
}
const L1 = (e, t) => e === !0 ? t : typeof e == "string" ? Sn(t, e) : void 0;
function N1(e, t, r, n, i) {
  for (const s of t) {
    const a = L1(r, s);
    if (a) {
      e.add(a);
      const o = $0(a._fallback, r, i);
      if (typeof o < "u" && o !== r && o !== n)
        return o;
    } else if (a === !1 && typeof n < "u" && r !== n)
      return null;
  }
  return !1;
}
function ac(e, t, r, n) {
  const i = t._rootScopes, s = $0(t._fallback, r, n), a = [
    ...e,
    ...i
  ], o = /* @__PURE__ */ new Set();
  o.add(n);
  let l = Af(o, a, r, s || r, n);
  return l === null || typeof s < "u" && s !== r && (l = Af(o, a, s, l, n), l === null) ? !1 : ic(Array.from(o), [
    ""
  ], i, s, () => B1(t, r, n));
}
function Af(e, t, r, n, i) {
  for (; r; )
    r = N1(e, t, r, n, i);
  return r;
}
function B1(e, t, r) {
  const n = e._getTarget();
  t in n || (n[t] = {});
  const i = n[t];
  return He(i) && be(r) ? r : i || {};
}
function W1(e, t, r, n) {
  let i;
  for (const s of t)
    if (i = G0(M1(s, e), r), typeof i < "u")
      return sc(e, i) ? ac(r, n, e, i) : i;
}
function G0(e, t) {
  for (const r of t) {
    if (!r)
      continue;
    const n = r[e];
    if (typeof n < "u")
      return n;
  }
}
function kf(e) {
  let t = e._keys;
  return t || (t = e._keys = U1(e._scopes)), t;
}
function U1(e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e)
    for (const n of Object.keys(r).filter((i) => !i.startsWith("_")))
      t.add(n);
  return Array.from(t);
}
function X0(e, t, r, n) {
  const { iScale: i } = e, { key: s = "r" } = this._parsing, a = new Array(n);
  let o, l, c, f;
  for (o = 0, l = n; o < l; ++o)
    c = o + r, f = t[c], a[o] = {
      r: i.parse(Sn(f, s), c)
    };
  return a;
}
const z1 = Number.EPSILON || 1e-14, Pi = (e, t) => t < e.length && !e[t].skip && e[t], K0 = (e) => e === "x" ? "y" : "x";
function H1(e, t, r, n) {
  const i = e.skip ? t : e, s = t, a = r.skip ? t : r, o = wl(s, i), l = wl(a, s);
  let c = o / (o + l), f = l / (o + l);
  c = isNaN(c) ? 0 : c, f = isNaN(f) ? 0 : f;
  const h = n * c, u = n * f;
  return {
    previous: {
      x: s.x - h * (a.x - i.x),
      y: s.y - h * (a.y - i.y)
    },
    next: {
      x: s.x + u * (a.x - i.x),
      y: s.y + u * (a.y - i.y)
    }
  };
}
function V1(e, t, r) {
  const n = e.length;
  let i, s, a, o, l, c = Pi(e, 0);
  for (let f = 0; f < n - 1; ++f)
    if (l = c, c = Pi(e, f + 1), !(!l || !c)) {
      if (os(t[f], 0, z1)) {
        r[f] = r[f + 1] = 0;
        continue;
      }
      i = r[f] / t[f], s = r[f + 1] / t[f], o = Math.pow(i, 2) + Math.pow(s, 2), !(o <= 9) && (a = 3 / Math.sqrt(o), r[f] = i * a * t[f], r[f + 1] = s * a * t[f]);
    }
}
function Y1(e, t, r = "x") {
  const n = K0(r), i = e.length;
  let s, a, o, l = Pi(e, 0);
  for (let c = 0; c < i; ++c) {
    if (a = o, o = l, l = Pi(e, c + 1), !o)
      continue;
    const f = o[r], h = o[n];
    a && (s = (f - a[r]) / 3, o[`cp1${r}`] = f - s, o[`cp1${n}`] = h - s * t[c]), l && (s = (l[r] - f) / 3, o[`cp2${r}`] = f + s, o[`cp2${n}`] = h + s * t[c]);
  }
}
function j1(e, t = "x") {
  const r = K0(t), n = e.length, i = Array(n).fill(0), s = Array(n);
  let a, o, l, c = Pi(e, 0);
  for (a = 0; a < n; ++a)
    if (o = l, l = c, c = Pi(e, a + 1), !!l) {
      if (c) {
        const f = c[t] - l[t];
        i[a] = f !== 0 ? (c[r] - l[r]) / f : 0;
      }
      s[a] = o ? c ? Cr(i[a - 1]) !== Cr(i[a]) ? 0 : (i[a - 1] + i[a]) / 2 : i[a - 1] : i[a];
    }
  V1(e, i, s), Y1(e, s, t);
}
function aa(e, t, r) {
  return Math.max(Math.min(e, r), t);
}
function $1(e, t) {
  let r, n, i, s, a, o = Kr(e[0], t);
  for (r = 0, n = e.length; r < n; ++r)
    a = s, s = o, o = r < n - 1 && Kr(e[r + 1], t), s && (i = e[r], a && (i.cp1x = aa(i.cp1x, t.left, t.right), i.cp1y = aa(i.cp1y, t.top, t.bottom)), o && (i.cp2x = aa(i.cp2x, t.left, t.right), i.cp2y = aa(i.cp2y, t.top, t.bottom)));
}
function G1(e, t, r, n, i) {
  let s, a, o, l;
  if (t.spanGaps && (e = e.filter((c) => !c.skip)), t.cubicInterpolationMode === "monotone")
    j1(e, i);
  else {
    let c = n ? e[e.length - 1] : e[0];
    for (s = 0, a = e.length; s < a; ++s)
      o = e[s], l = H1(c, o, e[Math.min(s + 1, a - (n ? 0 : 1)) % a], t.tension), o.cp1x = l.previous.x, o.cp1y = l.previous.y, o.cp2x = l.next.x, o.cp2y = l.next.y, c = o;
  }
  t.capBezierPoints && $1(e, r);
}
function oc() {
  return typeof window < "u" && typeof document < "u";
}
function lc(e) {
  let t = e.parentNode;
  return t && t.toString() === "[object ShadowRoot]" && (t = t.host), t;
}
function Ya(e, t, r) {
  let n;
  return typeof e == "string" ? (n = parseInt(e, 10), e.indexOf("%") !== -1 && (n = n / 100 * t.parentNode[r])) : n = e, n;
}
const vo = (e) => e.ownerDocument.defaultView.getComputedStyle(e, null);
function X1(e, t) {
  return vo(e).getPropertyValue(t);
}
const K1 = [
  "top",
  "right",
  "bottom",
  "left"
];
function jn(e, t, r) {
  const n = {};
  r = r ? "-" + r : "";
  for (let i = 0; i < 4; i++) {
    const s = K1[i];
    n[s] = parseFloat(e[t + "-" + s + r]) || 0;
  }
  return n.width = n.left + n.right, n.height = n.top + n.bottom, n;
}
const q1 = (e, t, r) => (e > 0 || t > 0) && (!r || !r.shadowRoot);
function Z1(e, t) {
  const r = e.touches, n = r && r.length ? r[0] : e, { offsetX: i, offsetY: s } = n;
  let a = !1, o, l;
  if (q1(i, s, e.target))
    o = i, l = s;
  else {
    const c = t.getBoundingClientRect();
    o = n.clientX - c.left, l = n.clientY - c.top, a = !0;
  }
  return {
    x: o,
    y: l,
    box: a
  };
}
function Bn(e, t) {
  if ("native" in e)
    return e;
  const { canvas: r, currentDevicePixelRatio: n } = t, i = vo(r), s = i.boxSizing === "border-box", a = jn(i, "padding"), o = jn(i, "border", "width"), { x: l, y: c, box: f } = Z1(e, r), h = a.left + (f && o.left), u = a.top + (f && o.top);
  let { width: d, height: p } = t;
  return s && (d -= a.width + o.width, p -= a.height + o.height), {
    x: Math.round((l - h) / d * r.width / n),
    y: Math.round((c - u) / p * r.height / n)
  };
}
function J1(e, t, r) {
  let n, i;
  if (t === void 0 || r === void 0) {
    const s = lc(e);
    if (!s)
      t = e.clientWidth, r = e.clientHeight;
    else {
      const a = s.getBoundingClientRect(), o = vo(s), l = jn(o, "border", "width"), c = jn(o, "padding");
      t = a.width - c.width - l.width, r = a.height - c.height - l.height, n = Ya(o.maxWidth, s, "clientWidth"), i = Ya(o.maxHeight, s, "clientHeight");
    }
  }
  return {
    width: t,
    height: r,
    maxWidth: n || Ha,
    maxHeight: i || Ha
  };
}
const oa = (e) => Math.round(e * 10) / 10;
function Q1(e, t, r, n) {
  const i = vo(e), s = jn(i, "margin"), a = Ya(i.maxWidth, e, "clientWidth") || Ha, o = Ya(i.maxHeight, e, "clientHeight") || Ha, l = J1(e, t, r);
  let { width: c, height: f } = l;
  if (i.boxSizing === "content-box") {
    const u = jn(i, "border", "width"), d = jn(i, "padding");
    c -= d.width + u.width, f -= d.height + u.height;
  }
  return c = Math.max(0, c - s.width), f = Math.max(0, n ? c / n : f - s.height), c = oa(Math.min(c, a, l.maxWidth)), f = oa(Math.min(f, o, l.maxHeight)), c && !f && (f = oa(c / 2)), (t !== void 0 || r !== void 0) && n && l.height && f > l.height && (f = l.height, c = oa(Math.floor(f * n))), {
    width: c,
    height: f
  };
}
function Of(e, t, r) {
  const n = t || 1, i = Math.floor(e.height * n), s = Math.floor(e.width * n);
  e.height = Math.floor(e.height), e.width = Math.floor(e.width);
  const a = e.canvas;
  return a.style && (r || !a.style.height && !a.style.width) && (a.style.height = `${e.height}px`, a.style.width = `${e.width}px`), e.currentDevicePixelRatio !== n || a.height !== i || a.width !== s ? (e.currentDevicePixelRatio = n, a.height = i, a.width = s, e.ctx.setTransform(n, 0, 0, n, 0, 0), !0) : !1;
}
const em = function() {
  let e = !1;
  try {
    const t = {
      get passive() {
        return e = !0, !1;
      }
    };
    oc() && (window.addEventListener("test", null, t), window.removeEventListener("test", null, t));
  } catch {
  }
  return e;
}();
function Df(e, t) {
  const r = X1(e, t), n = r && r.match(/^(\d+)(\.\d+)?px$/);
  return n ? +n[1] : void 0;
}
function Wn(e, t, r, n) {
  return {
    x: e.x + r * (t.x - e.x),
    y: e.y + r * (t.y - e.y)
  };
}
function tm(e, t, r, n) {
  return {
    x: e.x + r * (t.x - e.x),
    y: n === "middle" ? r < 0.5 ? e.y : t.y : n === "after" ? r < 1 ? e.y : t.y : r > 0 ? t.y : e.y
  };
}
function rm(e, t, r, n) {
  const i = {
    x: e.cp2x,
    y: e.cp2y
  }, s = {
    x: t.cp1x,
    y: t.cp1y
  }, a = Wn(e, i, r), o = Wn(i, s, r), l = Wn(s, t, r), c = Wn(a, o, r), f = Wn(o, l, r);
  return Wn(c, f, r);
}
const nm = function(e, t) {
  return {
    x(r) {
      return e + e + t - r;
    },
    setWidth(r) {
      t = r;
    },
    textAlign(r) {
      return r === "center" ? r : r === "right" ? "left" : "right";
    },
    xPlus(r, n) {
      return r - n;
    },
    leftForLtr(r, n) {
      return r - n;
    }
  };
}, im = function() {
  return {
    x(e) {
      return e;
    },
    setWidth(e) {
    },
    textAlign(e) {
      return e;
    },
    xPlus(e, t) {
      return e + t;
    },
    leftForLtr(e, t) {
      return e;
    }
  };
};
function Si(e, t, r) {
  return e ? nm(t, r) : im();
}
function q0(e, t) {
  let r, n;
  (t === "ltr" || t === "rtl") && (r = e.canvas.style, n = [
    r.getPropertyValue("direction"),
    r.getPropertyPriority("direction")
  ], r.setProperty("direction", t, "important"), e.prevTextDirection = n);
}
function Z0(e, t) {
  t !== void 0 && (delete e.prevTextDirection, e.canvas.style.setProperty("direction", t[0], t[1]));
}
function J0(e) {
  return e === "angle" ? {
    between: Es,
    compare: s1,
    normalize: qt
  } : {
    between: Gr,
    compare: (t, r) => t - r,
    normalize: (t) => t
  };
}
function Ff({ start: e, end: t, count: r, loop: n, style: i }) {
  return {
    start: e % r,
    end: t % r,
    loop: n && (t - e + 1) % r === 0,
    style: i
  };
}
function sm(e, t, r) {
  const { property: n, start: i, end: s } = r, { between: a, normalize: o } = J0(n), l = t.length;
  let { start: c, end: f, loop: h } = e, u, d;
  if (h) {
    for (c += l, f += l, u = 0, d = l; u < d && a(o(t[c % l][n]), i, s); ++u)
      c--, f--;
    c %= l, f %= l;
  }
  return f < c && (f += l), {
    start: c,
    end: f,
    loop: h,
    style: e.style
  };
}
function Q0(e, t, r) {
  if (!r)
    return [
      e
    ];
  const { property: n, start: i, end: s } = r, a = t.length, { compare: o, between: l, normalize: c } = J0(n), { start: f, end: h, loop: u, style: d } = sm(e, t, r), p = [];
  let g = !1, m = null, v, w, S;
  const D = () => l(i, S, v) && o(i, S) !== 0, P = () => o(s, v) === 0 || l(s, S, v), N = () => g || D(), O = () => !g || P();
  for (let I = f, R = f; I <= h; ++I)
    w = t[I % a], !w.skip && (v = c(w[n]), v !== S && (g = l(v, i, s), m === null && N() && (m = o(v, i) === 0 ? I : R), m !== null && O() && (p.push(Ff({
      start: m,
      end: I,
      loop: u,
      count: a,
      style: d
    })), m = null), R = I, S = v));
  return m !== null && p.push(Ff({
    start: m,
    end: h,
    loop: u,
    count: a,
    style: d
  })), p;
}
function eu(e, t) {
  const r = [], n = e.segments;
  for (let i = 0; i < n.length; i++) {
    const s = Q0(n[i], e.points, t);
    s.length && r.push(...s);
  }
  return r;
}
function am(e, t, r, n) {
  let i = 0, s = t - 1;
  if (r && !n)
    for (; i < t && !e[i].skip; )
      i++;
  for (; i < t && e[i].skip; )
    i++;
  for (i %= t, r && (s += i); s > i && e[s % t].skip; )
    s--;
  return s %= t, {
    start: i,
    end: s
  };
}
function om(e, t, r, n) {
  const i = e.length, s = [];
  let a = t, o = e[t], l;
  for (l = t + 1; l <= r; ++l) {
    const c = e[l % i];
    c.skip || c.stop ? o.skip || (n = !1, s.push({
      start: t % i,
      end: (l - 1) % i,
      loop: n
    }), t = a = c.stop ? l : null) : (a = l, o.skip && (t = l)), o = c;
  }
  return a !== null && s.push({
    start: t % i,
    end: a % i,
    loop: n
  }), s;
}
function lm(e, t) {
  const r = e.points, n = e.options.spanGaps, i = r.length;
  if (!i)
    return [];
  const s = !!e._loop, { start: a, end: o } = am(r, i, s, n);
  if (n === !0)
    return Cf(e, [
      {
        start: a,
        end: o,
        loop: s
      }
    ], r, t);
  const l = o < a ? o + i : o, c = !!e._fullLoop && a === 0 && o === i - 1;
  return Cf(e, om(r, a, l, c), r, t);
}
function Cf(e, t, r, n) {
  return !n || !n.setContext || !r ? t : cm(e, t, r, n);
}
function cm(e, t, r, n) {
  const i = e._chart.getContext(), s = Mf(e.options), { _datasetIndex: a, options: { spanGaps: o } } = e, l = r.length, c = [];
  let f = s, h = t[0].start, u = h;
  function d(p, g, m, v) {
    const w = o ? -1 : 1;
    if (p !== g) {
      for (p += l; r[p % l].skip; )
        p -= w;
      for (; r[g % l].skip; )
        g += w;
      p % l !== g % l && (c.push({
        start: p % l,
        end: g % l,
        loop: m,
        style: v
      }), f = v, h = g % l);
    }
  }
  for (const p of t) {
    h = o ? h : p.start;
    let g = r[h % l], m;
    for (u = h + 1; u <= p.end; u++) {
      const v = r[u % l];
      m = Mf(n.setContext(On(i, {
        type: "segment",
        p0: g,
        p1: v,
        p0DataIndex: (u - 1) % l,
        p1DataIndex: u % l,
        datasetIndex: a
      }))), fm(m, f) && d(h, u - 1, p.loop, f), g = v, f = m;
    }
    h < u - 1 && d(h, u - 1, p.loop, f);
  }
  return c;
}
function Mf(e) {
  return {
    backgroundColor: e.backgroundColor,
    borderCapStyle: e.borderCapStyle,
    borderDash: e.borderDash,
    borderDashOffset: e.borderDashOffset,
    borderJoinStyle: e.borderJoinStyle,
    borderWidth: e.borderWidth,
    borderColor: e.borderColor
  };
}
function fm(e, t) {
  if (!t)
    return !1;
  const r = [], n = function(i, s) {
    return rc(s) ? (r.includes(s) || r.push(s), r.indexOf(s)) : s;
  };
  return JSON.stringify(e, n) !== JSON.stringify(t, n);
}
/*!
 * Chart.js v4.4.1
 * https://www.chartjs.org
 * (c) 2023 Chart.js Contributors
 * Released under the MIT License
 */
class hm {
  constructor() {
    this._request = null, this._charts = /* @__PURE__ */ new Map(), this._running = !1, this._lastDate = void 0;
  }
  _notify(t, r, n, i) {
    const s = r.listeners[i], a = r.duration;
    s.forEach((o) => o({
      chart: t,
      initial: r.initial,
      numSteps: a,
      currentStep: Math.min(n - r.start, a)
    }));
  }
  _refresh() {
    this._request || (this._running = !0, this._request = N0.call(window, () => {
      this._update(), this._request = null, this._running && this._refresh();
    }));
  }
  _update(t = Date.now()) {
    let r = 0;
    this._charts.forEach((n, i) => {
      if (!n.running || !n.items.length)
        return;
      const s = n.items;
      let a = s.length - 1, o = !1, l;
      for (; a >= 0; --a)
        l = s[a], l._active ? (l._total > n.duration && (n.duration = l._total), l.tick(t), o = !0) : (s[a] = s[s.length - 1], s.pop());
      o && (i.draw(), this._notify(i, n, t, "progress")), s.length || (n.running = !1, this._notify(i, n, t, "complete"), n.initial = !1), r += s.length;
    }), this._lastDate = t, r === 0 && (this._running = !1);
  }
  _getAnims(t) {
    const r = this._charts;
    let n = r.get(t);
    return n || (n = {
      running: !1,
      initial: !0,
      items: [],
      listeners: {
        complete: [],
        progress: []
      }
    }, r.set(t, n)), n;
  }
  listen(t, r, n) {
    this._getAnims(t).listeners[r].push(n);
  }
  add(t, r) {
    !r || !r.length || this._getAnims(t).items.push(...r);
  }
  has(t) {
    return this._getAnims(t).items.length > 0;
  }
  start(t) {
    const r = this._charts.get(t);
    r && (r.running = !0, r.start = Date.now(), r.duration = r.items.reduce((n, i) => Math.max(n, i._duration), 0), this._refresh());
  }
  running(t) {
    if (!this._running)
      return !1;
    const r = this._charts.get(t);
    return !(!r || !r.running || !r.items.length);
  }
  stop(t) {
    const r = this._charts.get(t);
    if (!r || !r.items.length)
      return;
    const n = r.items;
    let i = n.length - 1;
    for (; i >= 0; --i)
      n[i].cancel();
    r.items = [], this._notify(t, r, Date.now(), "complete");
  }
  remove(t) {
    return this._charts.delete(t);
  }
}
var Hr = /* @__PURE__ */ new hm();
const Pf = "transparent", um = {
  boolean(e, t, r) {
    return r > 0.5 ? t : e;
  },
  color(e, t, r) {
    const n = Sf(e || Pf), i = n.valid && Sf(t || Pf);
    return i && i.valid ? i.mix(n, r).hexString() : t;
  },
  number(e, t, r) {
    return e + (t - e) * r;
  }
};
class dm {
  constructor(t, r, n, i) {
    const s = r[n];
    i = ze([
      t.to,
      i,
      s,
      t.from
    ]);
    const a = ze([
      t.from,
      s,
      i
    ]);
    this._active = !0, this._fn = t.fn || um[t.type || typeof a], this._easing = ls[t.easing] || ls.linear, this._start = Math.floor(Date.now() + (t.delay || 0)), this._duration = this._total = Math.floor(t.duration), this._loop = !!t.loop, this._target = r, this._prop = n, this._from = a, this._to = i, this._promises = void 0;
  }
  active() {
    return this._active;
  }
  update(t, r, n) {
    if (this._active) {
      this._notify(!1);
      const i = this._target[this._prop], s = n - this._start, a = this._duration - s;
      this._start = n, this._duration = Math.floor(Math.max(a, t.duration)), this._total += s, this._loop = !!t.loop, this._to = ze([
        t.to,
        r,
        i,
        t.from
      ]), this._from = ze([
        t.from,
        i,
        r
      ]);
    }
  }
  cancel() {
    this._active && (this.tick(Date.now()), this._active = !1, this._notify(!1));
  }
  tick(t) {
    const r = t - this._start, n = this._duration, i = this._prop, s = this._from, a = this._loop, o = this._to;
    let l;
    if (this._active = s !== o && (a || r < n), !this._active) {
      this._target[i] = o, this._notify(!0);
      return;
    }
    if (r < 0) {
      this._target[i] = s;
      return;
    }
    l = r / n % 2, l = a && l > 1 ? 2 - l : l, l = this._easing(Math.min(1, Math.max(0, l))), this._target[i] = this._fn(s, o, l);
  }
  wait() {
    const t = this._promises || (this._promises = []);
    return new Promise((r, n) => {
      t.push({
        res: r,
        rej: n
      });
    });
  }
  _notify(t) {
    const r = t ? "res" : "rej", n = this._promises || [];
    for (let i = 0; i < n.length; i++)
      n[i][r]();
  }
}
class tu {
  constructor(t, r) {
    this._chart = t, this._properties = /* @__PURE__ */ new Map(), this.configure(r);
  }
  configure(t) {
    if (!be(t))
      return;
    const r = Object.keys(Qe.animation), n = this._properties;
    Object.getOwnPropertyNames(t).forEach((i) => {
      const s = t[i];
      if (!be(s))
        return;
      const a = {};
      for (const o of r)
        a[o] = s[o];
      (He(s.properties) && s.properties || [
        i
      ]).forEach((o) => {
        (o === i || !n.has(o)) && n.set(o, a);
      });
    });
  }
  _animateOptions(t, r) {
    const n = r.options, i = pm(t, n);
    if (!i)
      return [];
    const s = this._createAnimations(i, n);
    return n.$shared && gm(t.options.$animations, n).then(() => {
      t.options = n;
    }, () => {
    }), s;
  }
  _createAnimations(t, r) {
    const n = this._properties, i = [], s = t.$animations || (t.$animations = {}), a = Object.keys(r), o = Date.now();
    let l;
    for (l = a.length - 1; l >= 0; --l) {
      const c = a[l];
      if (c.charAt(0) === "$")
        continue;
      if (c === "options") {
        i.push(...this._animateOptions(t, r));
        continue;
      }
      const f = r[c];
      let h = s[c];
      const u = n.get(c);
      if (h)
        if (u && h.active()) {
          h.update(u, f, o);
          continue;
        } else
          h.cancel();
      if (!u || !u.duration) {
        t[c] = f;
        continue;
      }
      s[c] = h = new dm(u, t, c, f), i.push(h);
    }
    return i;
  }
  update(t, r) {
    if (this._properties.size === 0) {
      Object.assign(t, r);
      return;
    }
    const n = this._createAnimations(t, r);
    if (n.length)
      return Hr.add(this._chart, n), !0;
  }
}
function gm(e, t) {
  const r = [], n = Object.keys(t);
  for (let i = 0; i < n.length; i++) {
    const s = e[n[i]];
    s && s.active() && r.push(s.wait());
  }
  return Promise.all(r);
}
function pm(e, t) {
  if (!t)
    return;
  let r = e.options;
  if (!r) {
    e.options = t;
    return;
  }
  return r.$shared && (e.options = r = Object.assign({}, r, {
    $shared: !1,
    $animations: {}
  })), r;
}
function Rf(e, t) {
  const r = e && e.options || {}, n = r.reverse, i = r.min === void 0 ? t : 0, s = r.max === void 0 ? t : 0;
  return {
    start: n ? s : i,
    end: n ? i : s
  };
}
function mm(e, t, r) {
  if (r === !1)
    return !1;
  const n = Rf(e, r), i = Rf(t, r);
  return {
    top: i.end,
    right: n.end,
    bottom: i.start,
    left: n.start
  };
}
function xm(e) {
  let t, r, n, i;
  return be(e) ? (t = e.top, r = e.right, n = e.bottom, i = e.left) : t = r = n = i = e, {
    top: t,
    right: r,
    bottom: n,
    left: i,
    disabled: e === !1
  };
}
function ru(e, t) {
  const r = [], n = e._getSortedDatasetMetas(t);
  let i, s;
  for (i = 0, s = n.length; i < s; ++i)
    r.push(n[i].index);
  return r;
}
function If(e, t, r, n = {}) {
  const i = e.keys, s = n.mode === "single";
  let a, o, l, c;
  if (t !== null) {
    for (a = 0, o = i.length; a < o; ++a) {
      if (l = +i[a], l === r) {
        if (n.all)
          continue;
        break;
      }
      c = e.values[l], nt(c) && (s || t === 0 || Cr(t) === Cr(c)) && (t += c);
    }
    return t;
  }
}
function _m(e) {
  const t = Object.keys(e), r = new Array(t.length);
  let n, i, s;
  for (n = 0, i = t.length; n < i; ++n)
    s = t[n], r[n] = {
      x: s,
      y: e[s]
    };
  return r;
}
function Lf(e, t) {
  const r = e && e.options.stacked;
  return r || r === void 0 && t.stack !== void 0;
}
function vm(e, t, r) {
  return `${e.id}.${t.id}.${r.stack || r.type}`;
}
function ym(e) {
  const { min: t, max: r, minDefined: n, maxDefined: i } = e.getUserBounds();
  return {
    min: n ? t : Number.NEGATIVE_INFINITY,
    max: i ? r : Number.POSITIVE_INFINITY
  };
}
function wm(e, t, r) {
  const n = e[t] || (e[t] = {});
  return n[r] || (n[r] = {});
}
function Nf(e, t, r, n) {
  for (const i of t.getMatchingVisibleMetas(n).reverse()) {
    const s = e[i.index];
    if (r && s > 0 || !r && s < 0)
      return i.index;
  }
  return null;
}
function Bf(e, t) {
  const { chart: r, _cachedMeta: n } = e, i = r._stacks || (r._stacks = {}), { iScale: s, vScale: a, index: o } = n, l = s.axis, c = a.axis, f = vm(s, a, n), h = t.length;
  let u;
  for (let d = 0; d < h; ++d) {
    const p = t[d], { [l]: g, [c]: m } = p, v = p._stacks || (p._stacks = {});
    u = v[c] = wm(i, f, g), u[o] = m, u._top = Nf(u, a, !0, n.type), u._bottom = Nf(u, a, !1, n.type);
    const w = u._visualValues || (u._visualValues = {});
    w[o] = m;
  }
}
function Zo(e, t) {
  const r = e.scales;
  return Object.keys(r).filter((n) => r[n].axis === t).shift();
}
function Tm(e, t) {
  return On(e, {
    active: !1,
    dataset: void 0,
    datasetIndex: t,
    index: t,
    mode: "default",
    type: "dataset"
  });
}
function Sm(e, t, r) {
  return On(e, {
    active: !1,
    dataIndex: t,
    parsed: void 0,
    raw: void 0,
    element: r,
    index: t,
    mode: "default",
    type: "data"
  });
}
function $i(e, t) {
  const r = e.controller.index, n = e.vScale && e.vScale.axis;
  if (n) {
    t = t || e._parsed;
    for (const i of t) {
      const s = i._stacks;
      if (!s || s[n] === void 0 || s[n][r] === void 0)
        return;
      delete s[n][r], s[n]._visualValues !== void 0 && s[n]._visualValues[r] !== void 0 && delete s[n]._visualValues[r];
    }
  }
}
const Jo = (e) => e === "reset" || e === "none", Wf = (e, t) => t ? e : Object.assign({}, e), bm = (e, t, r) => e && !t.hidden && t._stacked && {
  keys: ru(r, !0),
  values: null
};
class _r {
  constructor(t, r) {
    this.chart = t, this._ctx = t.ctx, this.index = r, this._cachedDataOpts = {}, this._cachedMeta = this.getMeta(), this._type = this._cachedMeta.type, this.options = void 0, this._parsing = !1, this._data = void 0, this._objectData = void 0, this._sharedOptions = void 0, this._drawStart = void 0, this._drawCount = void 0, this.enableOptionSharing = !1, this.supportsDecimation = !1, this.$context = void 0, this._syncList = [], this.datasetElementType = new.target.datasetElementType, this.dataElementType = new.target.dataElementType, this.initialize();
  }
  initialize() {
    const t = this._cachedMeta;
    this.configure(), this.linkScales(), t._stacked = Lf(t.vScale, t), this.addElements(), this.options.fill && !this.chart.isPluginEnabled("filler") && console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
  }
  updateIndex(t) {
    this.index !== t && $i(this._cachedMeta), this.index = t;
  }
  linkScales() {
    const t = this.chart, r = this._cachedMeta, n = this.getDataset(), i = (h, u, d, p) => h === "x" ? u : h === "r" ? p : d, s = r.xAxisID = xe(n.xAxisID, Zo(t, "x")), a = r.yAxisID = xe(n.yAxisID, Zo(t, "y")), o = r.rAxisID = xe(n.rAxisID, Zo(t, "r")), l = r.indexAxis, c = r.iAxisID = i(l, s, a, o), f = r.vAxisID = i(l, a, s, o);
    r.xScale = this.getScaleForId(s), r.yScale = this.getScaleForId(a), r.rScale = this.getScaleForId(o), r.iScale = this.getScaleForId(c), r.vScale = this.getScaleForId(f);
  }
  getDataset() {
    return this.chart.data.datasets[this.index];
  }
  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }
  getScaleForId(t) {
    return this.chart.scales[t];
  }
  _getOtherScale(t) {
    const r = this._cachedMeta;
    return t === r.iScale ? r.vScale : r.iScale;
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const t = this._cachedMeta;
    this._data && yf(this._data, this), t._stacked && $i(t);
  }
  _dataCheck() {
    const t = this.getDataset(), r = t.data || (t.data = []), n = this._data;
    if (be(r))
      this._data = _m(r);
    else if (n !== r) {
      if (n) {
        yf(n, this);
        const i = this._cachedMeta;
        $i(i), i._parsed = [];
      }
      r && Object.isExtensible(r) && c1(r, this), this._syncList = [], this._data = r;
    }
  }
  addElements() {
    const t = this._cachedMeta;
    this._dataCheck(), this.datasetElementType && (t.dataset = new this.datasetElementType());
  }
  buildOrUpdateElements(t) {
    const r = this._cachedMeta, n = this.getDataset();
    let i = !1;
    this._dataCheck();
    const s = r._stacked;
    r._stacked = Lf(r.vScale, r), r.stack !== n.stack && (i = !0, $i(r), r.stack = n.stack), this._resyncElements(t), (i || s !== r._stacked) && Bf(this, r._parsed);
  }
  configure() {
    const t = this.chart.config, r = t.datasetScopeKeys(this._type), n = t.getOptionScopes(this.getDataset(), r, !0);
    this.options = t.createResolver(n, this.getContext()), this._parsing = this.options.parsing, this._cachedDataOpts = {};
  }
  parse(t, r) {
    const { _cachedMeta: n, _data: i } = this, { iScale: s, _stacked: a } = n, o = s.axis;
    let l = t === 0 && r === i.length ? !0 : n._sorted, c = t > 0 && n._parsed[t - 1], f, h, u;
    if (this._parsing === !1)
      n._parsed = i, n._sorted = !0, u = i;
    else {
      He(i[t]) ? u = this.parseArrayData(n, i, t, r) : be(i[t]) ? u = this.parseObjectData(n, i, t, r) : u = this.parsePrimitiveData(n, i, t, r);
      const d = () => h[o] === null || c && h[o] < c[o];
      for (f = 0; f < r; ++f)
        n._parsed[f + t] = h = u[f], l && (d() && (l = !1), c = h);
      n._sorted = l;
    }
    a && Bf(this, u);
  }
  parsePrimitiveData(t, r, n, i) {
    const { iScale: s, vScale: a } = t, o = s.axis, l = a.axis, c = s.getLabels(), f = s === a, h = new Array(i);
    let u, d, p;
    for (u = 0, d = i; u < d; ++u)
      p = u + n, h[u] = {
        [o]: f || s.parse(c[p], p),
        [l]: a.parse(r[p], p)
      };
    return h;
  }
  parseArrayData(t, r, n, i) {
    const { xScale: s, yScale: a } = t, o = new Array(i);
    let l, c, f, h;
    for (l = 0, c = i; l < c; ++l)
      f = l + n, h = r[f], o[l] = {
        x: s.parse(h[0], f),
        y: a.parse(h[1], f)
      };
    return o;
  }
  parseObjectData(t, r, n, i) {
    const { xScale: s, yScale: a } = t, { xAxisKey: o = "x", yAxisKey: l = "y" } = this._parsing, c = new Array(i);
    let f, h, u, d;
    for (f = 0, h = i; f < h; ++f)
      u = f + n, d = r[u], c[f] = {
        x: s.parse(Sn(d, o), u),
        y: a.parse(Sn(d, l), u)
      };
    return c;
  }
  getParsed(t) {
    return this._cachedMeta._parsed[t];
  }
  getDataElement(t) {
    return this._cachedMeta.data[t];
  }
  applyStack(t, r, n) {
    const i = this.chart, s = this._cachedMeta, a = r[t.axis], o = {
      keys: ru(i, !0),
      values: r._stacks[t.axis]._visualValues
    };
    return If(o, a, s.index, {
      mode: n
    });
  }
  updateRangeFromParsed(t, r, n, i) {
    const s = n[r.axis];
    let a = s === null ? NaN : s;
    const o = i && n._stacks[r.axis];
    i && o && (i.values = o, a = If(i, s, this._cachedMeta.index)), t.min = Math.min(t.min, a), t.max = Math.max(t.max, a);
  }
  getMinMax(t, r) {
    const n = this._cachedMeta, i = n._parsed, s = n._sorted && t === n.iScale, a = i.length, o = this._getOtherScale(t), l = bm(r, n, this.chart), c = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    }, { min: f, max: h } = ym(o);
    let u, d;
    function p() {
      d = i[u];
      const g = d[o.axis];
      return !nt(d[t.axis]) || f > g || h < g;
    }
    for (u = 0; u < a && !(!p() && (this.updateRangeFromParsed(c, t, d, l), s)); ++u)
      ;
    if (s) {
      for (u = a - 1; u >= 0; --u)
        if (!p()) {
          this.updateRangeFromParsed(c, t, d, l);
          break;
        }
    }
    return c;
  }
  getAllParsedValues(t) {
    const r = this._cachedMeta._parsed, n = [];
    let i, s, a;
    for (i = 0, s = r.length; i < s; ++i)
      a = r[i][t.axis], nt(a) && n.push(a);
    return n;
  }
  getMaxOverflow() {
    return !1;
  }
  getLabelAndValue(t) {
    const r = this._cachedMeta, n = r.iScale, i = r.vScale, s = this.getParsed(t);
    return {
      label: n ? "" + n.getLabelForValue(s[n.axis]) : "",
      value: i ? "" + i.getLabelForValue(s[i.axis]) : ""
    };
  }
  _update(t) {
    const r = this._cachedMeta;
    this.update(t || "default"), r._clip = xm(xe(this.options.clip, mm(r.xScale, r.yScale, this.getMaxOverflow())));
  }
  update(t) {
  }
  draw() {
    const t = this._ctx, r = this.chart, n = this._cachedMeta, i = n.data || [], s = r.chartArea, a = [], o = this._drawStart || 0, l = this._drawCount || i.length - o, c = this.options.drawActiveElementsOnTop;
    let f;
    for (n.dataset && n.dataset.draw(t, s, o, l), f = o; f < o + l; ++f) {
      const h = i[f];
      h.hidden || (h.active && c ? a.push(h) : h.draw(t, s));
    }
    for (f = 0; f < a.length; ++f)
      a[f].draw(t, s);
  }
  getStyle(t, r) {
    const n = r ? "active" : "default";
    return t === void 0 && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(n) : this.resolveDataElementOptions(t || 0, n);
  }
  getContext(t, r, n) {
    const i = this.getDataset();
    let s;
    if (t >= 0 && t < this._cachedMeta.data.length) {
      const a = this._cachedMeta.data[t];
      s = a.$context || (a.$context = Sm(this.getContext(), t, a)), s.parsed = this.getParsed(t), s.raw = i.data[t], s.index = s.dataIndex = t;
    } else
      s = this.$context || (this.$context = Tm(this.chart.getContext(), this.index)), s.dataset = i, s.index = s.datasetIndex = this.index;
    return s.active = !!r, s.mode = n, s;
  }
  resolveDatasetElementOptions(t) {
    return this._resolveElementOptions(this.datasetElementType.id, t);
  }
  resolveDataElementOptions(t, r) {
    return this._resolveElementOptions(this.dataElementType.id, r, t);
  }
  _resolveElementOptions(t, r = "default", n) {
    const i = r === "active", s = this._cachedDataOpts, a = t + "-" + r, o = s[a], l = this.enableOptionSharing && bs(n);
    if (o)
      return Wf(o, l);
    const c = this.chart.config, f = c.datasetElementScopeKeys(this._type, t), h = i ? [
      `${t}Hover`,
      "hover",
      t,
      ""
    ] : [
      t,
      ""
    ], u = c.getOptionScopes(this.getDataset(), f), d = Object.keys(Qe.elements[t]), p = () => this.getContext(n, i, r), g = c.resolveNamedOptions(u, d, p, h);
    return g.$shared && (g.$shared = l, s[a] = Object.freeze(Wf(g, l))), g;
  }
  _resolveAnimations(t, r, n) {
    const i = this.chart, s = this._cachedDataOpts, a = `animation-${r}`, o = s[a];
    if (o)
      return o;
    let l;
    if (i.options.animation !== !1) {
      const f = this.chart.config, h = f.datasetAnimationScopeKeys(this._type, r), u = f.getOptionScopes(this.getDataset(), h);
      l = f.createResolver(u, this.getContext(t, n, r));
    }
    const c = new tu(i, l && l.animations);
    return l && l._cacheable && (s[a] = Object.freeze(c)), c;
  }
  getSharedOptions(t) {
    if (t.$shared)
      return this._sharedOptions || (this._sharedOptions = Object.assign({}, t));
  }
  includeOptions(t, r) {
    return !r || Jo(t) || this.chart._animationsDisabled;
  }
  _getSharedOptions(t, r) {
    const n = this.resolveDataElementOptions(t, r), i = this._sharedOptions, s = this.getSharedOptions(n), a = this.includeOptions(r, s) || s !== i;
    return this.updateSharedOptions(s, r, n), {
      sharedOptions: s,
      includeOptions: a
    };
  }
  updateElement(t, r, n, i) {
    Jo(i) ? Object.assign(t, n) : this._resolveAnimations(r, i).update(t, n);
  }
  updateSharedOptions(t, r, n) {
    t && !Jo(r) && this._resolveAnimations(void 0, r).update(t, n);
  }
  _setStyle(t, r, n, i) {
    t.active = i;
    const s = this.getStyle(r, i);
    this._resolveAnimations(r, n, i).update(t, {
      options: !i && this.getSharedOptions(s) || s
    });
  }
  removeHoverStyle(t, r, n) {
    this._setStyle(t, n, "active", !1);
  }
  setHoverStyle(t, r, n) {
    this._setStyle(t, n, "active", !0);
  }
  _removeDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !1);
  }
  _setDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !0);
  }
  _resyncElements(t) {
    const r = this._data, n = this._cachedMeta.data;
    for (const [o, l, c] of this._syncList)
      this[o](l, c);
    this._syncList = [];
    const i = n.length, s = r.length, a = Math.min(s, i);
    a && this.parse(0, a), s > i ? this._insertElements(i, s - i, t) : s < i && this._removeElements(s, i - s);
  }
  _insertElements(t, r, n = !0) {
    const i = this._cachedMeta, s = i.data, a = t + r;
    let o;
    const l = (c) => {
      for (c.length += r, o = c.length - 1; o >= a; o--)
        c[o] = c[o - r];
    };
    for (l(s), o = t; o < a; ++o)
      s[o] = new this.dataElementType();
    this._parsing && l(i._parsed), this.parse(t, r), n && this.updateElements(s, t, r, "reset");
  }
  updateElements(t, r, n, i) {
  }
  _removeElements(t, r) {
    const n = this._cachedMeta;
    if (this._parsing) {
      const i = n._parsed.splice(t, r);
      n._stacked && $i(n, i);
    }
    n.data.splice(t, r);
  }
  _sync(t) {
    if (this._parsing)
      this._syncList.push(t);
    else {
      const [r, n, i] = t;
      this[r](n, i);
    }
    this.chart._dataChanges.push([
      this.index,
      ...t
    ]);
  }
  _onDataPush() {
    const t = arguments.length;
    this._sync([
      "_insertElements",
      this.getDataset().data.length - t,
      t
    ]);
  }
  _onDataPop() {
    this._sync([
      "_removeElements",
      this._cachedMeta.data.length - 1,
      1
    ]);
  }
  _onDataShift() {
    this._sync([
      "_removeElements",
      0,
      1
    ]);
  }
  _onDataSplice(t, r) {
    r && this._sync([
      "_removeElements",
      t,
      r
    ]);
    const n = arguments.length - 2;
    n && this._sync([
      "_insertElements",
      t,
      n
    ]);
  }
  _onDataUnshift() {
    this._sync([
      "_insertElements",
      0,
      arguments.length
    ]);
  }
}
ie(_r, "defaults", {}), ie(_r, "datasetElementType", null), ie(_r, "dataElementType", null);
function Em(e, t) {
  if (!e._cache.$bar) {
    const r = e.getMatchingVisibleMetas(t);
    let n = [];
    for (let i = 0, s = r.length; i < s; i++)
      n = n.concat(r[i].controller.getAllParsedValues(e));
    e._cache.$bar = L0(n.sort((i, s) => i - s));
  }
  return e._cache.$bar;
}
function Am(e) {
  const t = e.iScale, r = Em(t, e.type);
  let n = t._length, i, s, a, o;
  const l = () => {
    a === 32767 || a === -32768 || (bs(o) && (n = Math.min(n, Math.abs(a - o) || n)), o = a);
  };
  for (i = 0, s = r.length; i < s; ++i)
    a = t.getPixelForValue(r[i]), l();
  for (o = void 0, i = 0, s = t.ticks.length; i < s; ++i)
    a = t.getPixelForTick(i), l();
  return n;
}
function km(e, t, r, n) {
  const i = r.barThickness;
  let s, a;
  return Te(i) ? (s = t.min * r.categoryPercentage, a = r.barPercentage) : (s = i * n, a = 1), {
    chunk: s / n,
    ratio: a,
    start: t.pixels[e] - s / 2
  };
}
function Om(e, t, r, n) {
  const i = t.pixels, s = i[e];
  let a = e > 0 ? i[e - 1] : null, o = e < i.length - 1 ? i[e + 1] : null;
  const l = r.categoryPercentage;
  a === null && (a = s - (o === null ? t.end - t.start : o - s)), o === null && (o = s + s - a);
  const c = s - (s - Math.min(a, o)) / 2 * l;
  return {
    chunk: Math.abs(o - a) / 2 * l / n,
    ratio: r.barPercentage,
    start: c
  };
}
function Dm(e, t, r, n) {
  const i = r.parse(e[0], n), s = r.parse(e[1], n), a = Math.min(i, s), o = Math.max(i, s);
  let l = a, c = o;
  Math.abs(a) > Math.abs(o) && (l = o, c = a), t[r.axis] = c, t._custom = {
    barStart: l,
    barEnd: c,
    start: i,
    end: s,
    min: a,
    max: o
  };
}
function nu(e, t, r, n) {
  return He(e) ? Dm(e, t, r, n) : t[r.axis] = r.parse(e, n), t;
}
function Uf(e, t, r, n) {
  const i = e.iScale, s = e.vScale, a = i.getLabels(), o = i === s, l = [];
  let c, f, h, u;
  for (c = r, f = r + n; c < f; ++c)
    u = t[c], h = {}, h[i.axis] = o || i.parse(a[c], c), l.push(nu(u, h, s, c));
  return l;
}
function Qo(e) {
  return e && e.barStart !== void 0 && e.barEnd !== void 0;
}
function Fm(e, t, r) {
  return e !== 0 ? Cr(e) : (t.isHorizontal() ? 1 : -1) * (t.min >= r ? 1 : -1);
}
function Cm(e) {
  let t, r, n, i, s;
  return e.horizontal ? (t = e.base > e.x, r = "left", n = "right") : (t = e.base < e.y, r = "bottom", n = "top"), t ? (i = "end", s = "start") : (i = "start", s = "end"), {
    start: r,
    end: n,
    reverse: t,
    top: i,
    bottom: s
  };
}
function Mm(e, t, r, n) {
  let i = t.borderSkipped;
  const s = {};
  if (!i) {
    e.borderSkipped = s;
    return;
  }
  if (i === !0) {
    e.borderSkipped = {
      top: !0,
      right: !0,
      bottom: !0,
      left: !0
    };
    return;
  }
  const { start: a, end: o, reverse: l, top: c, bottom: f } = Cm(e);
  i === "middle" && r && (e.enableBorderRadius = !0, (r._top || 0) === n ? i = c : (r._bottom || 0) === n ? i = f : (s[zf(f, a, o, l)] = !0, i = c)), s[zf(i, a, o, l)] = !0, e.borderSkipped = s;
}
function zf(e, t, r, n) {
  return n ? (e = Pm(e, t, r), e = Hf(e, r, t)) : e = Hf(e, t, r), e;
}
function Pm(e, t, r) {
  return e === t ? r : e === r ? t : e;
}
function Hf(e, t, r) {
  return e === "start" ? t : e === "end" ? r : e;
}
function Rm(e, { inflateAmount: t }, r) {
  e.inflateAmount = t === "auto" ? r === 1 ? 0.33 : 0 : t;
}
class Fa extends _r {
  parsePrimitiveData(t, r, n, i) {
    return Uf(t, r, n, i);
  }
  parseArrayData(t, r, n, i) {
    return Uf(t, r, n, i);
  }
  parseObjectData(t, r, n, i) {
    const { iScale: s, vScale: a } = t, { xAxisKey: o = "x", yAxisKey: l = "y" } = this._parsing, c = s.axis === "x" ? o : l, f = a.axis === "x" ? o : l, h = [];
    let u, d, p, g;
    for (u = n, d = n + i; u < d; ++u)
      g = r[u], p = {}, p[s.axis] = s.parse(Sn(g, c), u), h.push(nu(Sn(g, f), p, a, u));
    return h;
  }
  updateRangeFromParsed(t, r, n, i) {
    super.updateRangeFromParsed(t, r, n, i);
    const s = n._custom;
    s && r === this._cachedMeta.vScale && (t.min = Math.min(t.min, s.min), t.max = Math.max(t.max, s.max));
  }
  getMaxOverflow() {
    return 0;
  }
  getLabelAndValue(t) {
    const r = this._cachedMeta, { iScale: n, vScale: i } = r, s = this.getParsed(t), a = s._custom, o = Qo(a) ? "[" + a.start + ", " + a.end + "]" : "" + i.getLabelForValue(s[i.axis]);
    return {
      label: "" + n.getLabelForValue(s[n.axis]),
      value: o
    };
  }
  initialize() {
    this.enableOptionSharing = !0, super.initialize();
    const t = this._cachedMeta;
    t.stack = this.getDataset().stack;
  }
  update(t) {
    const r = this._cachedMeta;
    this.updateElements(r.data, 0, r.data.length, t);
  }
  updateElements(t, r, n, i) {
    const s = i === "reset", { index: a, _cachedMeta: { vScale: o } } = this, l = o.getBasePixel(), c = o.isHorizontal(), f = this._getRuler(), { sharedOptions: h, includeOptions: u } = this._getSharedOptions(r, i);
    for (let d = r; d < r + n; d++) {
      const p = this.getParsed(d), g = s || Te(p[o.axis]) ? {
        base: l,
        head: l
      } : this._calculateBarValuePixels(d), m = this._calculateBarIndexPixels(d, f), v = (p._stacks || {})[o.axis], w = {
        horizontal: c,
        base: g.base,
        enableBorderRadius: !v || Qo(p._custom) || a === v._top || a === v._bottom,
        x: c ? g.head : m.center,
        y: c ? m.center : g.head,
        height: c ? m.size : Math.abs(g.size),
        width: c ? Math.abs(g.size) : m.size
      };
      u && (w.options = h || this.resolveDataElementOptions(d, t[d].active ? "active" : i));
      const S = w.options || t[d].options;
      Mm(w, S, v, a), Rm(w, S, f.ratio), this.updateElement(t[d], d, w, i);
    }
  }
  _getStacks(t, r) {
    const { iScale: n } = this._cachedMeta, i = n.getMatchingVisibleMetas(this._type).filter((l) => l.controller.options.grouped), s = n.options.stacked, a = [], o = (l) => {
      const c = l.controller.getParsed(r), f = c && c[l.vScale.axis];
      if (Te(f) || isNaN(f))
        return !0;
    };
    for (const l of i)
      if (!(r !== void 0 && o(l)) && ((s === !1 || a.indexOf(l.stack) === -1 || s === void 0 && l.stack === void 0) && a.push(l.stack), l.index === t))
        break;
    return a.length || a.push(void 0), a;
  }
  _getStackCount(t) {
    return this._getStacks(void 0, t).length;
  }
  _getStackIndex(t, r, n) {
    const i = this._getStacks(t, n), s = r !== void 0 ? i.indexOf(r) : -1;
    return s === -1 ? i.length - 1 : s;
  }
  _getRuler() {
    const t = this.options, r = this._cachedMeta, n = r.iScale, i = [];
    let s, a;
    for (s = 0, a = r.data.length; s < a; ++s)
      i.push(n.getPixelForValue(this.getParsed(s)[n.axis], s));
    const o = t.barThickness;
    return {
      min: o || Am(r),
      pixels: i,
      start: n._startPixel,
      end: n._endPixel,
      stackCount: this._getStackCount(),
      scale: n,
      grouped: t.grouped,
      ratio: o ? 1 : t.categoryPercentage * t.barPercentage
    };
  }
  _calculateBarValuePixels(t) {
    const { _cachedMeta: { vScale: r, _stacked: n, index: i }, options: { base: s, minBarLength: a } } = this, o = s || 0, l = this.getParsed(t), c = l._custom, f = Qo(c);
    let h = l[r.axis], u = 0, d = n ? this.applyStack(r, l, n) : h, p, g;
    d !== h && (u = d - h, d = h), f && (h = c.barStart, d = c.barEnd - c.barStart, h !== 0 && Cr(h) !== Cr(c.barEnd) && (u = 0), u += h);
    const m = !Te(s) && !f ? s : u;
    let v = r.getPixelForValue(m);
    if (this.chart.getDataVisibility(t) ? p = r.getPixelForValue(u + d) : p = v, g = p - v, Math.abs(g) < a) {
      g = Fm(g, r, o) * a, h === o && (v -= g / 2);
      const w = r.getPixelForDecimal(0), S = r.getPixelForDecimal(1), D = Math.min(w, S), P = Math.max(w, S);
      v = Math.max(Math.min(v, P), D), p = v + g, n && !f && (l._stacks[r.axis]._visualValues[i] = r.getValueForPixel(p) - r.getValueForPixel(v));
    }
    if (v === r.getPixelForValue(o)) {
      const w = Cr(g) * r.getLineWidthForValue(o) / 2;
      v += w, g -= w;
    }
    return {
      size: g,
      base: v,
      head: p,
      center: p + g / 2
    };
  }
  _calculateBarIndexPixels(t, r) {
    const n = r.scale, i = this.options, s = i.skipNull, a = xe(i.maxBarThickness, 1 / 0);
    let o, l;
    if (r.grouped) {
      const c = s ? this._getStackCount(t) : r.stackCount, f = i.barThickness === "flex" ? Om(t, r, i, c) : km(t, r, i, c), h = this._getStackIndex(this.index, this._cachedMeta.stack, s ? t : void 0);
      o = f.start + f.chunk * h + f.chunk / 2, l = Math.min(a, f.chunk * f.ratio);
    } else
      o = n.getPixelForValue(this.getParsed(t)[n.axis], t), l = Math.min(a, r.min * r.ratio);
    return {
      base: o - l / 2,
      head: o + l / 2,
      center: o,
      size: l
    };
  }
  draw() {
    const t = this._cachedMeta, r = t.vScale, n = t.data, i = n.length;
    let s = 0;
    for (; s < i; ++s)
      this.getParsed(s)[r.axis] !== null && n[s].draw(this._ctx);
  }
}
ie(Fa, "id", "bar"), ie(Fa, "defaults", {
  datasetElementType: !1,
  dataElementType: "bar",
  categoryPercentage: 0.8,
  barPercentage: 0.9,
  grouped: !0,
  animations: {
    numbers: {
      type: "number",
      properties: [
        "x",
        "y",
        "base",
        "width",
        "height"
      ]
    }
  }
}), ie(Fa, "overrides", {
  scales: {
    _index_: {
      type: "category",
      offset: !0,
      grid: {
        offset: !0
      }
    },
    _value_: {
      type: "linear",
      beginAtZero: !0
    }
  }
});
class Ca extends _r {
  initialize() {
    this.enableOptionSharing = !0, super.initialize();
  }
  parsePrimitiveData(t, r, n, i) {
    const s = super.parsePrimitiveData(t, r, n, i);
    for (let a = 0; a < s.length; a++)
      s[a]._custom = this.resolveDataElementOptions(a + n).radius;
    return s;
  }
  parseArrayData(t, r, n, i) {
    const s = super.parseArrayData(t, r, n, i);
    for (let a = 0; a < s.length; a++) {
      const o = r[n + a];
      s[a]._custom = xe(o[2], this.resolveDataElementOptions(a + n).radius);
    }
    return s;
  }
  parseObjectData(t, r, n, i) {
    const s = super.parseObjectData(t, r, n, i);
    for (let a = 0; a < s.length; a++) {
      const o = r[n + a];
      s[a]._custom = xe(o && o.r && +o.r, this.resolveDataElementOptions(a + n).radius);
    }
    return s;
  }
  getMaxOverflow() {
    const t = this._cachedMeta.data;
    let r = 0;
    for (let n = t.length - 1; n >= 0; --n)
      r = Math.max(r, t[n].size(this.resolveDataElementOptions(n)) / 2);
    return r > 0 && r;
  }
  getLabelAndValue(t) {
    const r = this._cachedMeta, n = this.chart.data.labels || [], { xScale: i, yScale: s } = r, a = this.getParsed(t), o = i.getLabelForValue(a.x), l = s.getLabelForValue(a.y), c = a._custom;
    return {
      label: n[t] || "",
      value: "(" + o + ", " + l + (c ? ", " + c : "") + ")"
    };
  }
  update(t) {
    const r = this._cachedMeta.data;
    this.updateElements(r, 0, r.length, t);
  }
  updateElements(t, r, n, i) {
    const s = i === "reset", { iScale: a, vScale: o } = this._cachedMeta, { sharedOptions: l, includeOptions: c } = this._getSharedOptions(r, i), f = a.axis, h = o.axis;
    for (let u = r; u < r + n; u++) {
      const d = t[u], p = !s && this.getParsed(u), g = {}, m = g[f] = s ? a.getPixelForDecimal(0.5) : a.getPixelForValue(p[f]), v = g[h] = s ? o.getBasePixel() : o.getPixelForValue(p[h]);
      g.skip = isNaN(m) || isNaN(v), c && (g.options = l || this.resolveDataElementOptions(u, d.active ? "active" : i), s && (g.options.radius = 0)), this.updateElement(d, u, g, i);
    }
  }
  resolveDataElementOptions(t, r) {
    const n = this.getParsed(t);
    let i = super.resolveDataElementOptions(t, r);
    i.$shared && (i = Object.assign({}, i, {
      $shared: !1
    }));
    const s = i.radius;
    return r !== "active" && (i.radius = 0), i.radius += xe(n && n._custom, s), i;
  }
}
ie(Ca, "id", "bubble"), ie(Ca, "defaults", {
  datasetElementType: !1,
  dataElementType: "point",
  animations: {
    numbers: {
      type: "number",
      properties: [
        "x",
        "y",
        "borderWidth",
        "radius"
      ]
    }
  }
}), ie(Ca, "overrides", {
  scales: {
    x: {
      type: "linear"
    },
    y: {
      type: "linear"
    }
  }
});
function Im(e, t, r) {
  let n = 1, i = 1, s = 0, a = 0;
  if (t < Ve) {
    const o = e, l = o + t, c = Math.cos(o), f = Math.sin(o), h = Math.cos(l), u = Math.sin(l), d = (S, D, P) => Es(S, o, l, !0) ? 1 : Math.max(D, D * r, P, P * r), p = (S, D, P) => Es(S, o, l, !0) ? -1 : Math.min(D, D * r, P, P * r), g = d(0, c, h), m = d(ot, f, u), v = p(Ye, c, h), w = p(Ye + ot, f, u);
    n = (g - v) / 2, i = (m - w) / 2, s = -(g + v) / 2, a = -(m + w) / 2;
  }
  return {
    ratioX: n,
    ratioY: i,
    offsetX: s,
    offsetY: a
  };
}
class Hn extends _r {
  constructor(t, r) {
    super(t, r), this.enableOptionSharing = !0, this.innerRadius = void 0, this.outerRadius = void 0, this.offsetX = void 0, this.offsetY = void 0;
  }
  linkScales() {
  }
  parse(t, r) {
    const n = this.getDataset().data, i = this._cachedMeta;
    if (this._parsing === !1)
      i._parsed = n;
    else {
      let s = (l) => +n[l];
      if (be(n[t])) {
        const { key: l = "value" } = this._parsing;
        s = (c) => +Sn(n[c], l);
      }
      let a, o;
      for (a = t, o = t + r; a < o; ++a)
        i._parsed[a] = s(a);
    }
  }
  _getRotation() {
    return pr(this.options.rotation - 90);
  }
  _getCircumference() {
    return pr(this.options.circumference);
  }
  _getRotationExtents() {
    let t = Ve, r = -Ve;
    for (let n = 0; n < this.chart.data.datasets.length; ++n)
      if (this.chart.isDatasetVisible(n) && this.chart.getDatasetMeta(n).type === this._type) {
        const i = this.chart.getDatasetMeta(n).controller, s = i._getRotation(), a = i._getCircumference();
        t = Math.min(t, s), r = Math.max(r, s + a);
      }
    return {
      rotation: t,
      circumference: r - t
    };
  }
  update(t) {
    const r = this.chart, { chartArea: n } = r, i = this._cachedMeta, s = i.data, a = this.getMaxBorderWidth() + this.getMaxOffset(s) + this.options.spacing, o = Math.max((Math.min(n.width, n.height) - a) / 2, 0), l = Math.min(Kp(this.options.cutout, o), 1), c = this._getRingWeight(this.index), { circumference: f, rotation: h } = this._getRotationExtents(), { ratioX: u, ratioY: d, offsetX: p, offsetY: g } = Im(h, f, l), m = (n.width - a) / u, v = (n.height - a) / d, w = Math.max(Math.min(m, v) / 2, 0), S = C0(this.options.radius, w), D = Math.max(S * l, 0), P = (S - D) / this._getVisibleDatasetWeightTotal();
    this.offsetX = p * S, this.offsetY = g * S, i.total = this.calculateTotal(), this.outerRadius = S - P * this._getRingWeightOffset(this.index), this.innerRadius = Math.max(this.outerRadius - P * c, 0), this.updateElements(s, 0, s.length, t);
  }
  _circumference(t, r) {
    const n = this.options, i = this._cachedMeta, s = this._getCircumference();
    return r && n.animation.animateRotate || !this.chart.getDataVisibility(t) || i._parsed[t] === null || i.data[t].hidden ? 0 : this.calculateCircumference(i._parsed[t] * s / Ve);
  }
  updateElements(t, r, n, i) {
    const s = i === "reset", a = this.chart, o = a.chartArea, c = a.options.animation, f = (o.left + o.right) / 2, h = (o.top + o.bottom) / 2, u = s && c.animateScale, d = u ? 0 : this.innerRadius, p = u ? 0 : this.outerRadius, { sharedOptions: g, includeOptions: m } = this._getSharedOptions(r, i);
    let v = this._getRotation(), w;
    for (w = 0; w < r; ++w)
      v += this._circumference(w, s);
    for (w = r; w < r + n; ++w) {
      const S = this._circumference(w, s), D = t[w], P = {
        x: f + this.offsetX,
        y: h + this.offsetY,
        startAngle: v,
        endAngle: v + S,
        circumference: S,
        outerRadius: p,
        innerRadius: d
      };
      m && (P.options = g || this.resolveDataElementOptions(w, D.active ? "active" : i)), v += S, this.updateElement(D, w, P, i);
    }
  }
  calculateTotal() {
    const t = this._cachedMeta, r = t.data;
    let n = 0, i;
    for (i = 0; i < r.length; i++) {
      const s = t._parsed[i];
      s !== null && !isNaN(s) && this.chart.getDataVisibility(i) && !r[i].hidden && (n += Math.abs(s));
    }
    return n;
  }
  calculateCircumference(t) {
    const r = this._cachedMeta.total;
    return r > 0 && !isNaN(t) ? Ve * (Math.abs(t) / r) : 0;
  }
  getLabelAndValue(t) {
    const r = this._cachedMeta, n = this.chart, i = n.data.labels || [], s = Us(r._parsed[t], n.options.locale);
    return {
      label: i[t] || "",
      value: s
    };
  }
  getMaxBorderWidth(t) {
    let r = 0;
    const n = this.chart;
    let i, s, a, o, l;
    if (!t) {
      for (i = 0, s = n.data.datasets.length; i < s; ++i)
        if (n.isDatasetVisible(i)) {
          a = n.getDatasetMeta(i), t = a.data, o = a.controller;
          break;
        }
    }
    if (!t)
      return 0;
    for (i = 0, s = t.length; i < s; ++i)
      l = o.resolveDataElementOptions(i), l.borderAlign !== "inner" && (r = Math.max(r, l.borderWidth || 0, l.hoverBorderWidth || 0));
    return r;
  }
  getMaxOffset(t) {
    let r = 0;
    for (let n = 0, i = t.length; n < i; ++n) {
      const s = this.resolveDataElementOptions(n);
      r = Math.max(r, s.offset || 0, s.hoverOffset || 0);
    }
    return r;
  }
  _getRingWeightOffset(t) {
    let r = 0;
    for (let n = 0; n < t; ++n)
      this.chart.isDatasetVisible(n) && (r += this._getRingWeight(n));
    return r;
  }
  _getRingWeight(t) {
    return Math.max(xe(this.chart.data.datasets[t].weight, 1), 0);
  }
  _getVisibleDatasetWeightTotal() {
    return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
  }
}
ie(Hn, "id", "doughnut"), ie(Hn, "defaults", {
  datasetElementType: !1,
  dataElementType: "arc",
  animation: {
    animateRotate: !0,
    animateScale: !1
  },
  animations: {
    numbers: {
      type: "number",
      properties: [
        "circumference",
        "endAngle",
        "innerRadius",
        "outerRadius",
        "startAngle",
        "x",
        "y",
        "offset",
        "borderWidth",
        "spacing"
      ]
    }
  },
  cutout: "50%",
  rotation: 0,
  circumference: 360,
  radius: "100%",
  spacing: 0,
  indexAxis: "r"
}), ie(Hn, "descriptors", {
  _scriptable: (t) => t !== "spacing",
  _indexable: (t) => t !== "spacing" && !t.startsWith("borderDash") && !t.startsWith("hoverBorderDash")
}), ie(Hn, "overrides", {
  aspectRatio: 1,
  plugins: {
    legend: {
      labels: {
        generateLabels(t) {
          const r = t.data;
          if (r.labels.length && r.datasets.length) {
            const { labels: { pointStyle: n, color: i } } = t.legend.options;
            return r.labels.map((s, a) => {
              const l = t.getDatasetMeta(0).controller.getStyle(a);
              return {
                text: s,
                fillStyle: l.backgroundColor,
                strokeStyle: l.borderColor,
                fontColor: i,
                lineWidth: l.borderWidth,
                pointStyle: n,
                hidden: !t.getDataVisibility(a),
                index: a
              };
            });
          }
          return [];
        }
      },
      onClick(t, r, n) {
        n.chart.toggleDataVisibility(r.index), n.chart.update();
      }
    }
  }
});
class Ma extends _r {
  initialize() {
    this.enableOptionSharing = !0, this.supportsDecimation = !0, super.initialize();
  }
  update(t) {
    const r = this._cachedMeta, { dataset: n, data: i = [], _dataset: s } = r, a = this.chart._animationsDisabled;
    let { start: o, count: l } = W0(r, i, a);
    this._drawStart = o, this._drawCount = l, U0(r) && (o = 0, l = i.length), n._chart = this.chart, n._datasetIndex = this.index, n._decimated = !!s._decimated, n.points = i;
    const c = this.resolveDatasetElementOptions(t);
    this.options.showLine || (c.borderWidth = 0), c.segment = this.options.segment, this.updateElement(n, void 0, {
      animated: !a,
      options: c
    }, t), this.updateElements(i, o, l, t);
  }
  updateElements(t, r, n, i) {
    const s = i === "reset", { iScale: a, vScale: o, _stacked: l, _dataset: c } = this._cachedMeta, { sharedOptions: f, includeOptions: h } = this._getSharedOptions(r, i), u = a.axis, d = o.axis, { spanGaps: p, segment: g } = this.options, m = Ci(p) ? p : Number.POSITIVE_INFINITY, v = this.chart._animationsDisabled || s || i === "none", w = r + n, S = t.length;
    let D = r > 0 && this.getParsed(r - 1);
    for (let P = 0; P < S; ++P) {
      const N = t[P], O = v ? N : {};
      if (P < r || P >= w) {
        O.skip = !0;
        continue;
      }
      const I = this.getParsed(P), R = Te(I[d]), z = O[u] = a.getPixelForValue(I[u], P), H = O[d] = s || R ? o.getBasePixel() : o.getPixelForValue(l ? this.applyStack(o, I, l) : I[d], P);
      O.skip = isNaN(z) || isNaN(H) || R, O.stop = P > 0 && Math.abs(I[u] - D[u]) > m, g && (O.parsed = I, O.raw = c.data[P]), h && (O.options = f || this.resolveDataElementOptions(P, N.active ? "active" : i)), v || this.updateElement(N, P, O, i), D = I;
    }
  }
  getMaxOverflow() {
    const t = this._cachedMeta, r = t.dataset, n = r.options && r.options.borderWidth || 0, i = t.data || [];
    if (!i.length)
      return n;
    const s = i[0].size(this.resolveDataElementOptions(0)), a = i[i.length - 1].size(this.resolveDataElementOptions(i.length - 1));
    return Math.max(n, s, a) / 2;
  }
  draw() {
    const t = this._cachedMeta;
    t.dataset.updateControlPoints(this.chart.chartArea, t.iScale.axis), super.draw();
  }
}
ie(Ma, "id", "line"), ie(Ma, "defaults", {
  datasetElementType: "line",
  dataElementType: "point",
  showLine: !0,
  spanGaps: !1
}), ie(Ma, "overrides", {
  scales: {
    _index_: {
      type: "category"
    },
    _value_: {
      type: "linear"
    }
  }
});
class fs extends _r {
  constructor(t, r) {
    super(t, r), this.innerRadius = void 0, this.outerRadius = void 0;
  }
  getLabelAndValue(t) {
    const r = this._cachedMeta, n = this.chart, i = n.data.labels || [], s = Us(r._parsed[t].r, n.options.locale);
    return {
      label: i[t] || "",
      value: s
    };
  }
  parseObjectData(t, r, n, i) {
    return X0.bind(this)(t, r, n, i);
  }
  update(t) {
    const r = this._cachedMeta.data;
    this._updateRadius(), this.updateElements(r, 0, r.length, t);
  }
  getMinMax() {
    const t = this._cachedMeta, r = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    };
    return t.data.forEach((n, i) => {
      const s = this.getParsed(i).r;
      !isNaN(s) && this.chart.getDataVisibility(i) && (s < r.min && (r.min = s), s > r.max && (r.max = s));
    }), r;
  }
  _updateRadius() {
    const t = this.chart, r = t.chartArea, n = t.options, i = Math.min(r.right - r.left, r.bottom - r.top), s = Math.max(i / 2, 0), a = Math.max(n.cutoutPercentage ? s / 100 * n.cutoutPercentage : 1, 0), o = (s - a) / t.getVisibleDatasetCount();
    this.outerRadius = s - o * this.index, this.innerRadius = this.outerRadius - o;
  }
  updateElements(t, r, n, i) {
    const s = i === "reset", a = this.chart, l = a.options.animation, c = this._cachedMeta.rScale, f = c.xCenter, h = c.yCenter, u = c.getIndexAngle(0) - 0.5 * Ye;
    let d = u, p;
    const g = 360 / this.countVisibleElements();
    for (p = 0; p < r; ++p)
      d += this._computeAngle(p, i, g);
    for (p = r; p < r + n; p++) {
      const m = t[p];
      let v = d, w = d + this._computeAngle(p, i, g), S = a.getDataVisibility(p) ? c.getDistanceFromCenterForValue(this.getParsed(p).r) : 0;
      d = w, s && (l.animateScale && (S = 0), l.animateRotate && (v = w = u));
      const D = {
        x: f,
        y: h,
        innerRadius: 0,
        outerRadius: S,
        startAngle: v,
        endAngle: w,
        options: this.resolveDataElementOptions(p, m.active ? "active" : i)
      };
      this.updateElement(m, p, D, i);
    }
  }
  countVisibleElements() {
    const t = this._cachedMeta;
    let r = 0;
    return t.data.forEach((n, i) => {
      !isNaN(this.getParsed(i).r) && this.chart.getDataVisibility(i) && r++;
    }), r;
  }
  _computeAngle(t, r, n) {
    return this.chart.getDataVisibility(t) ? pr(this.resolveDataElementOptions(t, r).angle || n) : 0;
  }
}
ie(fs, "id", "polarArea"), ie(fs, "defaults", {
  dataElementType: "arc",
  animation: {
    animateRotate: !0,
    animateScale: !0
  },
  animations: {
    numbers: {
      type: "number",
      properties: [
        "x",
        "y",
        "startAngle",
        "endAngle",
        "innerRadius",
        "outerRadius"
      ]
    }
  },
  indexAxis: "r",
  startAngle: 0
}), ie(fs, "overrides", {
  aspectRatio: 1,
  plugins: {
    legend: {
      labels: {
        generateLabels(t) {
          const r = t.data;
          if (r.labels.length && r.datasets.length) {
            const { labels: { pointStyle: n, color: i } } = t.legend.options;
            return r.labels.map((s, a) => {
              const l = t.getDatasetMeta(0).controller.getStyle(a);
              return {
                text: s,
                fillStyle: l.backgroundColor,
                strokeStyle: l.borderColor,
                fontColor: i,
                lineWidth: l.borderWidth,
                pointStyle: n,
                hidden: !t.getDataVisibility(a),
                index: a
              };
            });
          }
          return [];
        }
      },
      onClick(t, r, n) {
        n.chart.toggleDataVisibility(r.index), n.chart.update();
      }
    }
  },
  scales: {
    r: {
      type: "radialLinear",
      angleLines: {
        display: !1
      },
      beginAtZero: !0,
      grid: {
        circular: !0
      },
      pointLabels: {
        display: !1
      },
      startAngle: 0
    }
  }
});
class bl extends Hn {
}
ie(bl, "id", "pie"), ie(bl, "defaults", {
  cutout: 0,
  rotation: 0,
  circumference: 360,
  radius: "100%"
});
class Pa extends _r {
  getLabelAndValue(t) {
    const r = this._cachedMeta.vScale, n = this.getParsed(t);
    return {
      label: r.getLabels()[t],
      value: "" + r.getLabelForValue(n[r.axis])
    };
  }
  parseObjectData(t, r, n, i) {
    return X0.bind(this)(t, r, n, i);
  }
  update(t) {
    const r = this._cachedMeta, n = r.dataset, i = r.data || [], s = r.iScale.getLabels();
    if (n.points = i, t !== "resize") {
      const a = this.resolveDatasetElementOptions(t);
      this.options.showLine || (a.borderWidth = 0);
      const o = {
        _loop: !0,
        _fullLoop: s.length === i.length,
        options: a
      };
      this.updateElement(n, void 0, o, t);
    }
    this.updateElements(i, 0, i.length, t);
  }
  updateElements(t, r, n, i) {
    const s = this._cachedMeta.rScale, a = i === "reset";
    for (let o = r; o < r + n; o++) {
      const l = t[o], c = this.resolveDataElementOptions(o, l.active ? "active" : i), f = s.getPointPositionForValue(o, this.getParsed(o).r), h = a ? s.xCenter : f.x, u = a ? s.yCenter : f.y, d = {
        x: h,
        y: u,
        angle: f.angle,
        skip: isNaN(h) || isNaN(u),
        options: c
      };
      this.updateElement(l, o, d, i);
    }
  }
}
ie(Pa, "id", "radar"), ie(Pa, "defaults", {
  datasetElementType: "line",
  dataElementType: "point",
  indexAxis: "r",
  showLine: !0,
  elements: {
    line: {
      fill: "start"
    }
  }
}), ie(Pa, "overrides", {
  aspectRatio: 1,
  scales: {
    r: {
      type: "radialLinear"
    }
  }
});
class Ra extends _r {
  getLabelAndValue(t) {
    const r = this._cachedMeta, n = this.chart.data.labels || [], { xScale: i, yScale: s } = r, a = this.getParsed(t), o = i.getLabelForValue(a.x), l = s.getLabelForValue(a.y);
    return {
      label: n[t] || "",
      value: "(" + o + ", " + l + ")"
    };
  }
  update(t) {
    const r = this._cachedMeta, { data: n = [] } = r, i = this.chart._animationsDisabled;
    let { start: s, count: a } = W0(r, n, i);
    if (this._drawStart = s, this._drawCount = a, U0(r) && (s = 0, a = n.length), this.options.showLine) {
      this.datasetElementType || this.addElements();
      const { dataset: o, _dataset: l } = r;
      o._chart = this.chart, o._datasetIndex = this.index, o._decimated = !!l._decimated, o.points = n;
      const c = this.resolveDatasetElementOptions(t);
      c.segment = this.options.segment, this.updateElement(o, void 0, {
        animated: !i,
        options: c
      }, t);
    } else
      this.datasetElementType && (delete r.dataset, this.datasetElementType = !1);
    this.updateElements(n, s, a, t);
  }
  addElements() {
    const { showLine: t } = this.options;
    !this.datasetElementType && t && (this.datasetElementType = this.chart.registry.getElement("line")), super.addElements();
  }
  updateElements(t, r, n, i) {
    const s = i === "reset", { iScale: a, vScale: o, _stacked: l, _dataset: c } = this._cachedMeta, f = this.resolveDataElementOptions(r, i), h = this.getSharedOptions(f), u = this.includeOptions(i, h), d = a.axis, p = o.axis, { spanGaps: g, segment: m } = this.options, v = Ci(g) ? g : Number.POSITIVE_INFINITY, w = this.chart._animationsDisabled || s || i === "none";
    let S = r > 0 && this.getParsed(r - 1);
    for (let D = r; D < r + n; ++D) {
      const P = t[D], N = this.getParsed(D), O = w ? P : {}, I = Te(N[p]), R = O[d] = a.getPixelForValue(N[d], D), z = O[p] = s || I ? o.getBasePixel() : o.getPixelForValue(l ? this.applyStack(o, N, l) : N[p], D);
      O.skip = isNaN(R) || isNaN(z) || I, O.stop = D > 0 && Math.abs(N[d] - S[d]) > v, m && (O.parsed = N, O.raw = c.data[D]), u && (O.options = h || this.resolveDataElementOptions(D, P.active ? "active" : i)), w || this.updateElement(P, D, O, i), S = N;
    }
    this.updateSharedOptions(h, i, f);
  }
  getMaxOverflow() {
    const t = this._cachedMeta, r = t.data || [];
    if (!this.options.showLine) {
      let o = 0;
      for (let l = r.length - 1; l >= 0; --l)
        o = Math.max(o, r[l].size(this.resolveDataElementOptions(l)) / 2);
      return o > 0 && o;
    }
    const n = t.dataset, i = n.options && n.options.borderWidth || 0;
    if (!r.length)
      return i;
    const s = r[0].size(this.resolveDataElementOptions(0)), a = r[r.length - 1].size(this.resolveDataElementOptions(r.length - 1));
    return Math.max(i, s, a) / 2;
  }
}
ie(Ra, "id", "scatter"), ie(Ra, "defaults", {
  datasetElementType: !1,
  dataElementType: "point",
  showLine: !1,
  fill: !1
}), ie(Ra, "overrides", {
  interaction: {
    mode: "point"
  },
  scales: {
    x: {
      type: "linear"
    },
    y: {
      type: "linear"
    }
  }
});
var Lm = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  BarController: Fa,
  BubbleController: Ca,
  DoughnutController: Hn,
  LineController: Ma,
  PieController: bl,
  PolarAreaController: fs,
  RadarController: Pa,
  ScatterController: Ra
});
function In() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
class cc {
  constructor(t) {
    ie(this, "options");
    this.options = t || {};
  }
  /**
  * Override default date adapter methods.
  * Accepts type parameter to define options type.
  * @example
  * Chart._adapters._date.override<{myAdapterOption: string}>({
  *   init() {
  *     console.log(this.options.myAdapterOption);
  *   }
  * })
  */
  static override(t) {
    Object.assign(cc.prototype, t);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {
  }
  formats() {
    return In();
  }
  parse() {
    return In();
  }
  format() {
    return In();
  }
  add() {
    return In();
  }
  diff() {
    return In();
  }
  startOf() {
    return In();
  }
  endOf() {
    return In();
  }
}
var Nm = {
  _date: cc
};
function Bm(e, t, r, n) {
  const { controller: i, data: s, _sorted: a } = e, o = i._cachedMeta.iScale;
  if (o && t === o.axis && t !== "r" && a && s.length) {
    const l = o._reversePixels ? o1 : Xr;
    if (n) {
      if (i._sharedOptions) {
        const c = s[0], f = typeof c.getRange == "function" && c.getRange(t);
        if (f) {
          const h = l(s, t, r - f), u = l(s, t, r + f);
          return {
            lo: h.lo,
            hi: u.hi
          };
        }
      }
    } else
      return l(s, t, r);
  }
  return {
    lo: 0,
    hi: s.length - 1
  };
}
function zs(e, t, r, n, i) {
  const s = e.getSortedVisibleDatasetMetas(), a = r[t];
  for (let o = 0, l = s.length; o < l; ++o) {
    const { index: c, data: f } = s[o], { lo: h, hi: u } = Bm(s[o], t, a, i);
    for (let d = h; d <= u; ++d) {
      const p = f[d];
      p.skip || n(p, c, d);
    }
  }
}
function Wm(e) {
  const t = e.indexOf("x") !== -1, r = e.indexOf("y") !== -1;
  return function(n, i) {
    const s = t ? Math.abs(n.x - i.x) : 0, a = r ? Math.abs(n.y - i.y) : 0;
    return Math.sqrt(Math.pow(s, 2) + Math.pow(a, 2));
  };
}
function el(e, t, r, n, i) {
  const s = [];
  return !i && !e.isPointInArea(t) || zs(e, r, t, function(o, l, c) {
    !i && !Kr(o, e.chartArea, 0) || o.inRange(t.x, t.y, n) && s.push({
      element: o,
      datasetIndex: l,
      index: c
    });
  }, !0), s;
}
function Um(e, t, r, n) {
  let i = [];
  function s(a, o, l) {
    const { startAngle: c, endAngle: f } = a.getProps([
      "startAngle",
      "endAngle"
    ], n), { angle: h } = R0(a, {
      x: t.x,
      y: t.y
    });
    Es(h, c, f) && i.push({
      element: a,
      datasetIndex: o,
      index: l
    });
  }
  return zs(e, r, t, s), i;
}
function zm(e, t, r, n, i, s) {
  let a = [];
  const o = Wm(r);
  let l = Number.POSITIVE_INFINITY;
  function c(f, h, u) {
    const d = f.inRange(t.x, t.y, i);
    if (n && !d)
      return;
    const p = f.getCenterPoint(i);
    if (!(!!s || e.isPointInArea(p)) && !d)
      return;
    const m = o(t, p);
    m < l ? (a = [
      {
        element: f,
        datasetIndex: h,
        index: u
      }
    ], l = m) : m === l && a.push({
      element: f,
      datasetIndex: h,
      index: u
    });
  }
  return zs(e, r, t, c), a;
}
function tl(e, t, r, n, i, s) {
  return !s && !e.isPointInArea(t) ? [] : r === "r" && !n ? Um(e, t, r, i) : zm(e, t, r, n, i, s);
}
function Vf(e, t, r, n, i) {
  const s = [], a = r === "x" ? "inXRange" : "inYRange";
  let o = !1;
  return zs(e, r, t, (l, c, f) => {
    l[a](t[r], i) && (s.push({
      element: l,
      datasetIndex: c,
      index: f
    }), o = o || l.inRange(t.x, t.y, i));
  }), n && !o ? [] : s;
}
var Hm = {
  evaluateInteractionItems: zs,
  modes: {
    index(e, t, r, n) {
      const i = Bn(t, e), s = r.axis || "x", a = r.includeInvisible || !1, o = r.intersect ? el(e, i, s, n, a) : tl(e, i, s, !1, n, a), l = [];
      return o.length ? (e.getSortedVisibleDatasetMetas().forEach((c) => {
        const f = o[0].index, h = c.data[f];
        h && !h.skip && l.push({
          element: h,
          datasetIndex: c.index,
          index: f
        });
      }), l) : [];
    },
    dataset(e, t, r, n) {
      const i = Bn(t, e), s = r.axis || "xy", a = r.includeInvisible || !1;
      let o = r.intersect ? el(e, i, s, n, a) : tl(e, i, s, !1, n, a);
      if (o.length > 0) {
        const l = o[0].datasetIndex, c = e.getDatasetMeta(l).data;
        o = [];
        for (let f = 0; f < c.length; ++f)
          o.push({
            element: c[f],
            datasetIndex: l,
            index: f
          });
      }
      return o;
    },
    point(e, t, r, n) {
      const i = Bn(t, e), s = r.axis || "xy", a = r.includeInvisible || !1;
      return el(e, i, s, n, a);
    },
    nearest(e, t, r, n) {
      const i = Bn(t, e), s = r.axis || "xy", a = r.includeInvisible || !1;
      return tl(e, i, s, r.intersect, n, a);
    },
    x(e, t, r, n) {
      const i = Bn(t, e);
      return Vf(e, i, "x", r.intersect, n);
    },
    y(e, t, r, n) {
      const i = Bn(t, e);
      return Vf(e, i, "y", r.intersect, n);
    }
  }
};
const iu = [
  "left",
  "top",
  "right",
  "bottom"
];
function Gi(e, t) {
  return e.filter((r) => r.pos === t);
}
function Yf(e, t) {
  return e.filter((r) => iu.indexOf(r.pos) === -1 && r.box.axis === t);
}
function Xi(e, t) {
  return e.sort((r, n) => {
    const i = t ? n : r, s = t ? r : n;
    return i.weight === s.weight ? i.index - s.index : i.weight - s.weight;
  });
}
function Vm(e) {
  const t = [];
  let r, n, i, s, a, o;
  for (r = 0, n = (e || []).length; r < n; ++r)
    i = e[r], { position: s, options: { stack: a, stackWeight: o = 1 } } = i, t.push({
      index: r,
      box: i,
      pos: s,
      horizontal: i.isHorizontal(),
      weight: i.weight,
      stack: a && s + a,
      stackWeight: o
    });
  return t;
}
function Ym(e) {
  const t = {};
  for (const r of e) {
    const { stack: n, pos: i, stackWeight: s } = r;
    if (!n || !iu.includes(i))
      continue;
    const a = t[n] || (t[n] = {
      count: 0,
      placed: 0,
      weight: 0,
      size: 0
    });
    a.count++, a.weight += s;
  }
  return t;
}
function jm(e, t) {
  const r = Ym(e), { vBoxMaxWidth: n, hBoxMaxHeight: i } = t;
  let s, a, o;
  for (s = 0, a = e.length; s < a; ++s) {
    o = e[s];
    const { fullSize: l } = o.box, c = r[o.stack], f = c && o.stackWeight / c.weight;
    o.horizontal ? (o.width = f ? f * n : l && t.availableWidth, o.height = i) : (o.width = n, o.height = f ? f * i : l && t.availableHeight);
  }
  return r;
}
function $m(e) {
  const t = Vm(e), r = Xi(t.filter((c) => c.box.fullSize), !0), n = Xi(Gi(t, "left"), !0), i = Xi(Gi(t, "right")), s = Xi(Gi(t, "top"), !0), a = Xi(Gi(t, "bottom")), o = Yf(t, "x"), l = Yf(t, "y");
  return {
    fullSize: r,
    leftAndTop: n.concat(s),
    rightAndBottom: i.concat(l).concat(a).concat(o),
    chartArea: Gi(t, "chartArea"),
    vertical: n.concat(i).concat(l),
    horizontal: s.concat(a).concat(o)
  };
}
function jf(e, t, r, n) {
  return Math.max(e[r], t[r]) + Math.max(e[n], t[n]);
}
function su(e, t) {
  e.top = Math.max(e.top, t.top), e.left = Math.max(e.left, t.left), e.bottom = Math.max(e.bottom, t.bottom), e.right = Math.max(e.right, t.right);
}
function Gm(e, t, r, n) {
  const { pos: i, box: s } = r, a = e.maxPadding;
  if (!be(i)) {
    r.size && (e[i] -= r.size);
    const h = n[r.stack] || {
      size: 0,
      count: 1
    };
    h.size = Math.max(h.size, r.horizontal ? s.height : s.width), r.size = h.size / h.count, e[i] += r.size;
  }
  s.getPadding && su(a, s.getPadding());
  const o = Math.max(0, t.outerWidth - jf(a, e, "left", "right")), l = Math.max(0, t.outerHeight - jf(a, e, "top", "bottom")), c = o !== e.w, f = l !== e.h;
  return e.w = o, e.h = l, r.horizontal ? {
    same: c,
    other: f
  } : {
    same: f,
    other: c
  };
}
function Xm(e) {
  const t = e.maxPadding;
  function r(n) {
    const i = Math.max(t[n] - e[n], 0);
    return e[n] += i, i;
  }
  e.y += r("top"), e.x += r("left"), r("right"), r("bottom");
}
function Km(e, t) {
  const r = t.maxPadding;
  function n(i) {
    const s = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    return i.forEach((a) => {
      s[a] = Math.max(t[a], r[a]);
    }), s;
  }
  return n(e ? [
    "left",
    "right"
  ] : [
    "top",
    "bottom"
  ]);
}
function rs(e, t, r, n) {
  const i = [];
  let s, a, o, l, c, f;
  for (s = 0, a = e.length, c = 0; s < a; ++s) {
    o = e[s], l = o.box, l.update(o.width || t.w, o.height || t.h, Km(o.horizontal, t));
    const { same: h, other: u } = Gm(t, r, o, n);
    c |= h && i.length, f = f || u, l.fullSize || i.push(o);
  }
  return c && rs(i, t, r, n) || f;
}
function la(e, t, r, n, i) {
  e.top = r, e.left = t, e.right = t + n, e.bottom = r + i, e.width = n, e.height = i;
}
function $f(e, t, r, n) {
  const i = r.padding;
  let { x: s, y: a } = t;
  for (const o of e) {
    const l = o.box, c = n[o.stack] || {
      count: 1,
      placed: 0,
      weight: 1
    }, f = o.stackWeight / c.weight || 1;
    if (o.horizontal) {
      const h = t.w * f, u = c.size || l.height;
      bs(c.start) && (a = c.start), l.fullSize ? la(l, i.left, a, r.outerWidth - i.right - i.left, u) : la(l, t.left + c.placed, a, h, u), c.start = a, c.placed += h, a = l.bottom;
    } else {
      const h = t.h * f, u = c.size || l.width;
      bs(c.start) && (s = c.start), l.fullSize ? la(l, s, i.top, u, r.outerHeight - i.bottom - i.top) : la(l, s, t.top + c.placed, u, h), c.start = s, c.placed += h, s = l.right;
    }
  }
  t.x = s, t.y = a;
}
var Ft = {
  addBox(e, t) {
    e.boxes || (e.boxes = []), t.fullSize = t.fullSize || !1, t.position = t.position || "top", t.weight = t.weight || 0, t._layers = t._layers || function() {
      return [
        {
          z: 0,
          draw(r) {
            t.draw(r);
          }
        }
      ];
    }, e.boxes.push(t);
  },
  removeBox(e, t) {
    const r = e.boxes ? e.boxes.indexOf(t) : -1;
    r !== -1 && e.boxes.splice(r, 1);
  },
  configure(e, t, r) {
    t.fullSize = r.fullSize, t.position = r.position, t.weight = r.weight;
  },
  update(e, t, r, n) {
    if (!e)
      return;
    const i = Et(e.options.layout.padding), s = Math.max(t - i.width, 0), a = Math.max(r - i.height, 0), o = $m(e.boxes), l = o.vertical, c = o.horizontal;
    Me(e.boxes, (g) => {
      typeof g.beforeLayout == "function" && g.beforeLayout();
    });
    const f = l.reduce((g, m) => m.box.options && m.box.options.display === !1 ? g : g + 1, 0) || 1, h = Object.freeze({
      outerWidth: t,
      outerHeight: r,
      padding: i,
      availableWidth: s,
      availableHeight: a,
      vBoxMaxWidth: s / 2 / f,
      hBoxMaxHeight: a / 2
    }), u = Object.assign({}, i);
    su(u, Et(n));
    const d = Object.assign({
      maxPadding: u,
      w: s,
      h: a,
      x: i.left,
      y: i.top
    }, i), p = jm(l.concat(c), h);
    rs(o.fullSize, d, h, p), rs(l, d, h, p), rs(c, d, h, p) && rs(l, d, h, p), Xm(d), $f(o.leftAndTop, d, h, p), d.x += d.w, d.y += d.h, $f(o.rightAndBottom, d, h, p), e.chartArea = {
      left: d.left,
      top: d.top,
      right: d.left + d.w,
      bottom: d.top + d.h,
      height: d.h,
      width: d.w
    }, Me(o.chartArea, (g) => {
      const m = g.box;
      Object.assign(m, e.chartArea), m.update(d.w, d.h, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });
    });
  }
};
class au {
  acquireContext(t, r) {
  }
  releaseContext(t) {
    return !1;
  }
  addEventListener(t, r, n) {
  }
  removeEventListener(t, r, n) {
  }
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(t, r, n, i) {
    return r = Math.max(0, r || t.width), n = n || t.height, {
      width: r,
      height: Math.max(0, i ? Math.floor(r / i) : n)
    };
  }
  isAttached(t) {
    return !0;
  }
  updateConfig(t) {
  }
}
class qm extends au {
  acquireContext(t) {
    return t && t.getContext && t.getContext("2d") || null;
  }
  updateConfig(t) {
    t.options.animation = !1;
  }
}
const Ia = "$chartjs", Zm = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
  pointerenter: "mouseenter",
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointerleave: "mouseout",
  pointerout: "mouseout"
}, Gf = (e) => e === null || e === "";
function Jm(e, t) {
  const r = e.style, n = e.getAttribute("height"), i = e.getAttribute("width");
  if (e[Ia] = {
    initial: {
      height: n,
      width: i,
      style: {
        display: r.display,
        height: r.height,
        width: r.width
      }
    }
  }, r.display = r.display || "block", r.boxSizing = r.boxSizing || "border-box", Gf(i)) {
    const s = Df(e, "width");
    s !== void 0 && (e.width = s);
  }
  if (Gf(n))
    if (e.style.height === "")
      e.height = e.width / (t || 2);
    else {
      const s = Df(e, "height");
      s !== void 0 && (e.height = s);
    }
  return e;
}
const ou = em ? {
  passive: !0
} : !1;
function Qm(e, t, r) {
  e.addEventListener(t, r, ou);
}
function ex(e, t, r) {
  e.canvas.removeEventListener(t, r, ou);
}
function tx(e, t) {
  const r = Zm[e.type] || e.type, { x: n, y: i } = Bn(e, t);
  return {
    type: r,
    chart: t,
    native: e,
    x: n !== void 0 ? n : null,
    y: i !== void 0 ? i : null
  };
}
function ja(e, t) {
  for (const r of e)
    if (r === t || r.contains(t))
      return !0;
}
function rx(e, t, r) {
  const n = e.canvas, i = new MutationObserver((s) => {
    let a = !1;
    for (const o of s)
      a = a || ja(o.addedNodes, n), a = a && !ja(o.removedNodes, n);
    a && r();
  });
  return i.observe(document, {
    childList: !0,
    subtree: !0
  }), i;
}
function nx(e, t, r) {
  const n = e.canvas, i = new MutationObserver((s) => {
    let a = !1;
    for (const o of s)
      a = a || ja(o.removedNodes, n), a = a && !ja(o.addedNodes, n);
    a && r();
  });
  return i.observe(document, {
    childList: !0,
    subtree: !0
  }), i;
}
const ks = /* @__PURE__ */ new Map();
let Xf = 0;
function lu() {
  const e = window.devicePixelRatio;
  e !== Xf && (Xf = e, ks.forEach((t, r) => {
    r.currentDevicePixelRatio !== e && t();
  }));
}
function ix(e, t) {
  ks.size || window.addEventListener("resize", lu), ks.set(e, t);
}
function sx(e) {
  ks.delete(e), ks.size || window.removeEventListener("resize", lu);
}
function ax(e, t, r) {
  const n = e.canvas, i = n && lc(n);
  if (!i)
    return;
  const s = B0((o, l) => {
    const c = i.clientWidth;
    r(o, l), c < i.clientWidth && r();
  }, window), a = new ResizeObserver((o) => {
    const l = o[0], c = l.contentRect.width, f = l.contentRect.height;
    c === 0 && f === 0 || s(c, f);
  });
  return a.observe(i), ix(e, s), a;
}
function rl(e, t, r) {
  r && r.disconnect(), t === "resize" && sx(e);
}
function ox(e, t, r) {
  const n = e.canvas, i = B0((s) => {
    e.ctx !== null && r(tx(s, e));
  }, e);
  return Qm(n, t, i), i;
}
class lx extends au {
  acquireContext(t, r) {
    const n = t && t.getContext && t.getContext("2d");
    return n && n.canvas === t ? (Jm(t, r), n) : null;
  }
  releaseContext(t) {
    const r = t.canvas;
    if (!r[Ia])
      return !1;
    const n = r[Ia].initial;
    [
      "height",
      "width"
    ].forEach((s) => {
      const a = n[s];
      Te(a) ? r.removeAttribute(s) : r.setAttribute(s, a);
    });
    const i = n.style || {};
    return Object.keys(i).forEach((s) => {
      r.style[s] = i[s];
    }), r.width = r.width, delete r[Ia], !0;
  }
  addEventListener(t, r, n) {
    this.removeEventListener(t, r);
    const i = t.$proxies || (t.$proxies = {}), a = {
      attach: rx,
      detach: nx,
      resize: ax
    }[r] || ox;
    i[r] = a(t, r, n);
  }
  removeEventListener(t, r) {
    const n = t.$proxies || (t.$proxies = {}), i = n[r];
    if (!i)
      return;
    ({
      attach: rl,
      detach: rl,
      resize: rl
    }[r] || ex)(t, r, i), n[r] = void 0;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(t, r, n, i) {
    return Q1(t, r, n, i);
  }
  isAttached(t) {
    const r = lc(t);
    return !!(r && r.isConnected);
  }
}
function cx(e) {
  return !oc() || typeof OffscreenCanvas < "u" && e instanceof OffscreenCanvas ? qm : lx;
}
class yr {
  constructor() {
    ie(this, "x");
    ie(this, "y");
    ie(this, "active", !1);
    ie(this, "options");
    ie(this, "$animations");
  }
  tooltipPosition(t) {
    const { x: r, y: n } = this.getProps([
      "x",
      "y"
    ], t);
    return {
      x: r,
      y: n
    };
  }
  hasValue() {
    return Ci(this.x) && Ci(this.y);
  }
  getProps(t, r) {
    const n = this.$animations;
    if (!r || !n)
      return this;
    const i = {};
    return t.forEach((s) => {
      i[s] = n[s] && n[s].active() ? n[s]._to : this[s];
    }), i;
  }
}
ie(yr, "defaults", {}), ie(yr, "defaultRoutes");
function fx(e, t) {
  const r = e.options.ticks, n = hx(e), i = Math.min(r.maxTicksLimit || n, n), s = r.major.enabled ? dx(t) : [], a = s.length, o = s[0], l = s[a - 1], c = [];
  if (a > i)
    return gx(t, c, s, a / i), c;
  const f = ux(s, t, i);
  if (a > 0) {
    let h, u;
    const d = a > 1 ? Math.round((l - o) / (a - 1)) : null;
    for (ca(t, c, f, Te(d) ? 0 : o - d, o), h = 0, u = a - 1; h < u; h++)
      ca(t, c, f, s[h], s[h + 1]);
    return ca(t, c, f, l, Te(d) ? t.length : l + d), c;
  }
  return ca(t, c, f), c;
}
function hx(e) {
  const t = e.options.offset, r = e._tickSize(), n = e._length / r + (t ? 0 : 1), i = e._maxLength / r;
  return Math.floor(Math.min(n, i));
}
function ux(e, t, r) {
  const n = px(e), i = t.length / r;
  if (!n)
    return Math.max(i, 1);
  const s = n1(n);
  for (let a = 0, o = s.length - 1; a < o; a++) {
    const l = s[a];
    if (l > i)
      return l;
  }
  return Math.max(i, 1);
}
function dx(e) {
  const t = [];
  let r, n;
  for (r = 0, n = e.length; r < n; r++)
    e[r].major && t.push(r);
  return t;
}
function gx(e, t, r, n) {
  let i = 0, s = r[0], a;
  for (n = Math.ceil(n), a = 0; a < e.length; a++)
    a === s && (t.push(e[a]), i++, s = r[i * n]);
}
function ca(e, t, r, n, i) {
  const s = xe(n, 0), a = Math.min(xe(i, e.length), e.length);
  let o = 0, l, c, f;
  for (r = Math.ceil(r), i && (l = i - n, r = l / Math.floor(l / r)), f = s; f < 0; )
    o++, f = Math.round(s + o * r);
  for (c = Math.max(s, 0); c < a; c++)
    c === f && (t.push(e[c]), o++, f = Math.round(s + o * r));
}
function px(e) {
  const t = e.length;
  let r, n;
  if (t < 2)
    return !1;
  for (n = e[0], r = 1; r < t; ++r)
    if (e[r] - e[r - 1] !== n)
      return !1;
  return n;
}
const mx = (e) => e === "left" ? "right" : e === "right" ? "left" : e, Kf = (e, t, r) => t === "top" || t === "left" ? e[t] + r : e[t] - r, qf = (e, t) => Math.min(t || e, e);
function Zf(e, t) {
  const r = [], n = e.length / t, i = e.length;
  let s = 0;
  for (; s < i; s += n)
    r.push(e[Math.floor(s)]);
  return r;
}
function xx(e, t, r) {
  const n = e.ticks.length, i = Math.min(t, n - 1), s = e._startPixel, a = e._endPixel, o = 1e-6;
  let l = e.getPixelForTick(i), c;
  if (!(r && (n === 1 ? c = Math.max(l - s, a - l) : t === 0 ? c = (e.getPixelForTick(1) - l) / 2 : c = (l - e.getPixelForTick(i - 1)) / 2, l += i < t ? c : -c, l < s - o || l > a + o)))
    return l;
}
function _x(e, t) {
  Me(e, (r) => {
    const n = r.gc, i = n.length / 2;
    let s;
    if (i > t) {
      for (s = 0; s < i; ++s)
        delete r.data[n[s]];
      n.splice(0, i);
    }
  });
}
function Ki(e) {
  return e.drawTicks ? e.tickLength : 0;
}
function Jf(e, t) {
  if (!e.display)
    return 0;
  const r = ft(e.font, t), n = Et(e.padding);
  return (He(e.text) ? e.text.length : 1) * r.lineHeight + n.height;
}
function vx(e, t) {
  return On(e, {
    scale: t,
    type: "scale"
  });
}
function yx(e, t, r) {
  return On(e, {
    tick: r,
    index: t,
    type: "tick"
  });
}
function wx(e, t, r) {
  let n = tc(e);
  return (r && t !== "right" || !r && t === "right") && (n = mx(n)), n;
}
function Tx(e, t, r, n) {
  const { top: i, left: s, bottom: a, right: o, chart: l } = e, { chartArea: c, scales: f } = l;
  let h = 0, u, d, p;
  const g = a - i, m = o - s;
  if (e.isHorizontal()) {
    if (d = Ot(n, s, o), be(r)) {
      const v = Object.keys(r)[0], w = r[v];
      p = f[v].getPixelForValue(w) + g - t;
    } else
      r === "center" ? p = (c.bottom + c.top) / 2 + g - t : p = Kf(e, r, t);
    u = o - s;
  } else {
    if (be(r)) {
      const v = Object.keys(r)[0], w = r[v];
      d = f[v].getPixelForValue(w) - m + t;
    } else
      r === "center" ? d = (c.left + c.right) / 2 - m + t : d = Kf(e, r, t);
    p = Ot(n, a, i), h = r === "left" ? -ot : ot;
  }
  return {
    titleX: d,
    titleY: p,
    maxWidth: u,
    rotation: h
  };
}
class ni extends yr {
  constructor(t) {
    super(), this.id = t.id, this.type = t.type, this.options = void 0, this.ctx = t.ctx, this.chart = t.chart, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, this.maxWidth = void 0, this.maxHeight = void 0, this.paddingTop = void 0, this.paddingBottom = void 0, this.paddingLeft = void 0, this.paddingRight = void 0, this.axis = void 0, this.labelRotation = void 0, this.min = void 0, this.max = void 0, this._range = void 0, this.ticks = [], this._gridLineItems = null, this._labelItems = null, this._labelSizes = null, this._length = 0, this._maxLength = 0, this._longestTextCache = {}, this._startPixel = void 0, this._endPixel = void 0, this._reversePixels = !1, this._userMax = void 0, this._userMin = void 0, this._suggestedMax = void 0, this._suggestedMin = void 0, this._ticksLength = 0, this._borderValue = 0, this._cache = {}, this._dataLimitsCached = !1, this.$context = void 0;
  }
  init(t) {
    this.options = t.setContext(this.getContext()), this.axis = t.axis, this._userMin = this.parse(t.min), this._userMax = this.parse(t.max), this._suggestedMin = this.parse(t.suggestedMin), this._suggestedMax = this.parse(t.suggestedMax);
  }
  parse(t, r) {
    return t;
  }
  getUserBounds() {
    let { _userMin: t, _userMax: r, _suggestedMin: n, _suggestedMax: i } = this;
    return t = Xt(t, Number.POSITIVE_INFINITY), r = Xt(r, Number.NEGATIVE_INFINITY), n = Xt(n, Number.POSITIVE_INFINITY), i = Xt(i, Number.NEGATIVE_INFINITY), {
      min: Xt(t, n),
      max: Xt(r, i),
      minDefined: nt(t),
      maxDefined: nt(r)
    };
  }
  getMinMax(t) {
    let { min: r, max: n, minDefined: i, maxDefined: s } = this.getUserBounds(), a;
    if (i && s)
      return {
        min: r,
        max: n
      };
    const o = this.getMatchingVisibleMetas();
    for (let l = 0, c = o.length; l < c; ++l)
      a = o[l].controller.getMinMax(this, t), i || (r = Math.min(r, a.min)), s || (n = Math.max(n, a.max));
    return r = s && r > n ? n : r, n = i && r > n ? r : n, {
      min: Xt(r, Xt(n, r)),
      max: Xt(n, Xt(r, n))
    };
  }
  getPadding() {
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0
    };
  }
  getTicks() {
    return this.ticks;
  }
  getLabels() {
    const t = this.chart.data;
    return this.options.labels || (this.isHorizontal() ? t.xLabels : t.yLabels) || t.labels || [];
  }
  getLabelItems(t = this.chart.chartArea) {
    return this._labelItems || (this._labelItems = this._computeLabelItems(t));
  }
  beforeLayout() {
    this._cache = {}, this._dataLimitsCached = !1;
  }
  beforeUpdate() {
    Ne(this.options.beforeUpdate, [
      this
    ]);
  }
  update(t, r, n) {
    const { beginAtZero: i, grace: s, ticks: a } = this.options, o = a.sampleSize;
    this.beforeUpdate(), this.maxWidth = t, this.maxHeight = r, this._margins = n = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, n), this.ticks = null, this._labelSizes = null, this._gridLineItems = null, this._labelItems = null, this.beforeSetDimensions(), this.setDimensions(), this.afterSetDimensions(), this._maxLength = this.isHorizontal() ? this.width + n.left + n.right : this.height + n.top + n.bottom, this._dataLimitsCached || (this.beforeDataLimits(), this.determineDataLimits(), this.afterDataLimits(), this._range = C1(this, s, i), this._dataLimitsCached = !0), this.beforeBuildTicks(), this.ticks = this.buildTicks() || [], this.afterBuildTicks();
    const l = o < this.ticks.length;
    this._convertTicksToLabels(l ? Zf(this.ticks, o) : this.ticks), this.configure(), this.beforeCalculateLabelRotation(), this.calculateLabelRotation(), this.afterCalculateLabelRotation(), a.display && (a.autoSkip || a.source === "auto") && (this.ticks = fx(this, this.ticks), this._labelSizes = null, this.afterAutoSkip()), l && this._convertTicksToLabels(this.ticks), this.beforeFit(), this.fit(), this.afterFit(), this.afterUpdate();
  }
  configure() {
    let t = this.options.reverse, r, n;
    this.isHorizontal() ? (r = this.left, n = this.right) : (r = this.top, n = this.bottom, t = !t), this._startPixel = r, this._endPixel = n, this._reversePixels = t, this._length = n - r, this._alignToPixels = this.options.alignToPixels;
  }
  afterUpdate() {
    Ne(this.options.afterUpdate, [
      this
    ]);
  }
  beforeSetDimensions() {
    Ne(this.options.beforeSetDimensions, [
      this
    ]);
  }
  setDimensions() {
    this.isHorizontal() ? (this.width = this.maxWidth, this.left = 0, this.right = this.width) : (this.height = this.maxHeight, this.top = 0, this.bottom = this.height), this.paddingLeft = 0, this.paddingTop = 0, this.paddingRight = 0, this.paddingBottom = 0;
  }
  afterSetDimensions() {
    Ne(this.options.afterSetDimensions, [
      this
    ]);
  }
  _callHooks(t) {
    this.chart.notifyPlugins(t, this.getContext()), Ne(this.options[t], [
      this
    ]);
  }
  beforeDataLimits() {
    this._callHooks("beforeDataLimits");
  }
  determineDataLimits() {
  }
  afterDataLimits() {
    this._callHooks("afterDataLimits");
  }
  beforeBuildTicks() {
    this._callHooks("beforeBuildTicks");
  }
  buildTicks() {
    return [];
  }
  afterBuildTicks() {
    this._callHooks("afterBuildTicks");
  }
  beforeTickToLabelConversion() {
    Ne(this.options.beforeTickToLabelConversion, [
      this
    ]);
  }
  generateTickLabels(t) {
    const r = this.options.ticks;
    let n, i, s;
    for (n = 0, i = t.length; n < i; n++)
      s = t[n], s.label = Ne(r.callback, [
        s.value,
        n,
        t
      ], this);
  }
  afterTickToLabelConversion() {
    Ne(this.options.afterTickToLabelConversion, [
      this
    ]);
  }
  beforeCalculateLabelRotation() {
    Ne(this.options.beforeCalculateLabelRotation, [
      this
    ]);
  }
  calculateLabelRotation() {
    const t = this.options, r = t.ticks, n = qf(this.ticks.length, t.ticks.maxTicksLimit), i = r.minRotation || 0, s = r.maxRotation;
    let a = i, o, l, c;
    if (!this._isVisible() || !r.display || i >= s || n <= 1 || !this.isHorizontal()) {
      this.labelRotation = i;
      return;
    }
    const f = this._getLabelSizes(), h = f.widest.width, u = f.highest.height, d = xt(this.chart.width - h, 0, this.maxWidth);
    o = t.offset ? this.maxWidth / n : d / (n - 1), h + 6 > o && (o = d / (n - (t.offset ? 0.5 : 1)), l = this.maxHeight - Ki(t.grid) - r.padding - Jf(t.title, this.chart.options.font), c = Math.sqrt(h * h + u * u), a = Ql(Math.min(Math.asin(xt((f.highest.height + 6) / o, -1, 1)), Math.asin(xt(l / c, -1, 1)) - Math.asin(xt(u / c, -1, 1)))), a = Math.max(i, Math.min(s, a))), this.labelRotation = a;
  }
  afterCalculateLabelRotation() {
    Ne(this.options.afterCalculateLabelRotation, [
      this
    ]);
  }
  afterAutoSkip() {
  }
  beforeFit() {
    Ne(this.options.beforeFit, [
      this
    ]);
  }
  fit() {
    const t = {
      width: 0,
      height: 0
    }, { chart: r, options: { ticks: n, title: i, grid: s } } = this, a = this._isVisible(), o = this.isHorizontal();
    if (a) {
      const l = Jf(i, r.options.font);
      if (o ? (t.width = this.maxWidth, t.height = Ki(s) + l) : (t.height = this.maxHeight, t.width = Ki(s) + l), n.display && this.ticks.length) {
        const { first: c, last: f, widest: h, highest: u } = this._getLabelSizes(), d = n.padding * 2, p = pr(this.labelRotation), g = Math.cos(p), m = Math.sin(p);
        if (o) {
          const v = n.mirror ? 0 : m * h.width + g * u.height;
          t.height = Math.min(this.maxHeight, t.height + v + d);
        } else {
          const v = n.mirror ? 0 : g * h.width + m * u.height;
          t.width = Math.min(this.maxWidth, t.width + v + d);
        }
        this._calculatePadding(c, f, m, g);
      }
    }
    this._handleMargins(), o ? (this.width = this._length = r.width - this._margins.left - this._margins.right, this.height = t.height) : (this.width = t.width, this.height = this._length = r.height - this._margins.top - this._margins.bottom);
  }
  _calculatePadding(t, r, n, i) {
    const { ticks: { align: s, padding: a }, position: o } = this.options, l = this.labelRotation !== 0, c = o !== "top" && this.axis === "x";
    if (this.isHorizontal()) {
      const f = this.getPixelForTick(0) - this.left, h = this.right - this.getPixelForTick(this.ticks.length - 1);
      let u = 0, d = 0;
      l ? c ? (u = i * t.width, d = n * r.height) : (u = n * t.height, d = i * r.width) : s === "start" ? d = r.width : s === "end" ? u = t.width : s !== "inner" && (u = t.width / 2, d = r.width / 2), this.paddingLeft = Math.max((u - f + a) * this.width / (this.width - f), 0), this.paddingRight = Math.max((d - h + a) * this.width / (this.width - h), 0);
    } else {
      let f = r.height / 2, h = t.height / 2;
      s === "start" ? (f = 0, h = t.height) : s === "end" && (f = r.height, h = 0), this.paddingTop = f + a, this.paddingBottom = h + a;
    }
  }
  _handleMargins() {
    this._margins && (this._margins.left = Math.max(this.paddingLeft, this._margins.left), this._margins.top = Math.max(this.paddingTop, this._margins.top), this._margins.right = Math.max(this.paddingRight, this._margins.right), this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom));
  }
  afterFit() {
    Ne(this.options.afterFit, [
      this
    ]);
  }
  isHorizontal() {
    const { axis: t, position: r } = this.options;
    return r === "top" || r === "bottom" || t === "x";
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(t) {
    this.beforeTickToLabelConversion(), this.generateTickLabels(t);
    let r, n;
    for (r = 0, n = t.length; r < n; r++)
      Te(t[r].label) && (t.splice(r, 1), n--, r--);
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let t = this._labelSizes;
    if (!t) {
      const r = this.options.ticks.sampleSize;
      let n = this.ticks;
      r < n.length && (n = Zf(n, r)), this._labelSizes = t = this._computeLabelSizes(n, n.length, this.options.ticks.maxTicksLimit);
    }
    return t;
  }
  _computeLabelSizes(t, r, n) {
    const { ctx: i, _longestTextCache: s } = this, a = [], o = [], l = Math.floor(r / qf(r, n));
    let c = 0, f = 0, h, u, d, p, g, m, v, w, S, D, P;
    for (h = 0; h < r; h += l) {
      if (p = t[h].label, g = this._resolveTickFontOptions(h), i.font = m = g.string, v = s[m] = s[m] || {
        data: {},
        gc: []
      }, w = g.lineHeight, S = D = 0, !Te(p) && !He(p))
        S = Va(i, v.data, v.gc, S, p), D = w;
      else if (He(p))
        for (u = 0, d = p.length; u < d; ++u)
          P = p[u], !Te(P) && !He(P) && (S = Va(i, v.data, v.gc, S, P), D += w);
      a.push(S), o.push(D), c = Math.max(S, c), f = Math.max(D, f);
    }
    _x(s, r);
    const N = a.indexOf(c), O = o.indexOf(f), I = (R) => ({
      width: a[R] || 0,
      height: o[R] || 0
    });
    return {
      first: I(0),
      last: I(r - 1),
      widest: I(N),
      highest: I(O),
      widths: a,
      heights: o
    };
  }
  getLabelForValue(t) {
    return t;
  }
  getPixelForValue(t, r) {
    return NaN;
  }
  getValueForPixel(t) {
  }
  getPixelForTick(t) {
    const r = this.ticks;
    return t < 0 || t > r.length - 1 ? null : this.getPixelForValue(r[t].value);
  }
  getPixelForDecimal(t) {
    this._reversePixels && (t = 1 - t);
    const r = this._startPixel + t * this._length;
    return a1(this._alignToPixels ? Rn(this.chart, r, 0) : r);
  }
  getDecimalForPixel(t) {
    const r = (t - this._startPixel) / this._length;
    return this._reversePixels ? 1 - r : r;
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const { min: t, max: r } = this;
    return t < 0 && r < 0 ? r : t > 0 && r > 0 ? t : 0;
  }
  getContext(t) {
    const r = this.ticks || [];
    if (t >= 0 && t < r.length) {
      const n = r[t];
      return n.$context || (n.$context = yx(this.getContext(), t, n));
    }
    return this.$context || (this.$context = vx(this.chart.getContext(), this));
  }
  _tickSize() {
    const t = this.options.ticks, r = pr(this.labelRotation), n = Math.abs(Math.cos(r)), i = Math.abs(Math.sin(r)), s = this._getLabelSizes(), a = t.autoSkipPadding || 0, o = s ? s.widest.width + a : 0, l = s ? s.highest.height + a : 0;
    return this.isHorizontal() ? l * n > o * i ? o / n : l / i : l * i < o * n ? l / n : o / i;
  }
  _isVisible() {
    const t = this.options.display;
    return t !== "auto" ? !!t : this.getMatchingVisibleMetas().length > 0;
  }
  _computeGridLineItems(t) {
    const r = this.axis, n = this.chart, i = this.options, { grid: s, position: a, border: o } = i, l = s.offset, c = this.isHorizontal(), h = this.ticks.length + (l ? 1 : 0), u = Ki(s), d = [], p = o.setContext(this.getContext()), g = p.display ? p.width : 0, m = g / 2, v = function(de) {
      return Rn(n, de, g);
    };
    let w, S, D, P, N, O, I, R, z, H, V, ee;
    if (a === "top")
      w = v(this.bottom), O = this.bottom - u, R = w - m, H = v(t.top) + m, ee = t.bottom;
    else if (a === "bottom")
      w = v(this.top), H = t.top, ee = v(t.bottom) - m, O = w + m, R = this.top + u;
    else if (a === "left")
      w = v(this.right), N = this.right - u, I = w - m, z = v(t.left) + m, V = t.right;
    else if (a === "right")
      w = v(this.left), z = t.left, V = v(t.right) - m, N = w + m, I = this.left + u;
    else if (r === "x") {
      if (a === "center")
        w = v((t.top + t.bottom) / 2 + 0.5);
      else if (be(a)) {
        const de = Object.keys(a)[0], pe = a[de];
        w = v(this.chart.scales[de].getPixelForValue(pe));
      }
      H = t.top, ee = t.bottom, O = w + m, R = O + u;
    } else if (r === "y") {
      if (a === "center")
        w = v((t.left + t.right) / 2);
      else if (be(a)) {
        const de = Object.keys(a)[0], pe = a[de];
        w = v(this.chart.scales[de].getPixelForValue(pe));
      }
      N = w - m, I = N - u, z = t.left, V = t.right;
    }
    const ge = xe(i.ticks.maxTicksLimit, h), ae = Math.max(1, Math.ceil(h / ge));
    for (S = 0; S < h; S += ae) {
      const de = this.getContext(S), pe = s.setContext(de), Ue = o.setContext(de), ye = pe.lineWidth, et = pe.color, lt = Ue.dash || [], M = Ue.dashOffset, C = pe.tickWidth, x = pe.tickColor, k = pe.tickBorderDash || [], F = pe.tickBorderDashOffset;
      D = xx(this, S, l), D !== void 0 && (P = Rn(n, D, ye), c ? N = I = z = V = P : O = R = H = ee = P, d.push({
        tx1: N,
        ty1: O,
        tx2: I,
        ty2: R,
        x1: z,
        y1: H,
        x2: V,
        y2: ee,
        width: ye,
        color: et,
        borderDash: lt,
        borderDashOffset: M,
        tickWidth: C,
        tickColor: x,
        tickBorderDash: k,
        tickBorderDashOffset: F
      }));
    }
    return this._ticksLength = h, this._borderValue = w, d;
  }
  _computeLabelItems(t) {
    const r = this.axis, n = this.options, { position: i, ticks: s } = n, a = this.isHorizontal(), o = this.ticks, { align: l, crossAlign: c, padding: f, mirror: h } = s, u = Ki(n.grid), d = u + f, p = h ? -f : d, g = -pr(this.labelRotation), m = [];
    let v, w, S, D, P, N, O, I, R, z, H, V, ee = "middle";
    if (i === "top")
      N = this.bottom - p, O = this._getXAxisLabelAlignment();
    else if (i === "bottom")
      N = this.top + p, O = this._getXAxisLabelAlignment();
    else if (i === "left") {
      const ae = this._getYAxisLabelAlignment(u);
      O = ae.textAlign, P = ae.x;
    } else if (i === "right") {
      const ae = this._getYAxisLabelAlignment(u);
      O = ae.textAlign, P = ae.x;
    } else if (r === "x") {
      if (i === "center")
        N = (t.top + t.bottom) / 2 + d;
      else if (be(i)) {
        const ae = Object.keys(i)[0], de = i[ae];
        N = this.chart.scales[ae].getPixelForValue(de) + d;
      }
      O = this._getXAxisLabelAlignment();
    } else if (r === "y") {
      if (i === "center")
        P = (t.left + t.right) / 2 - d;
      else if (be(i)) {
        const ae = Object.keys(i)[0], de = i[ae];
        P = this.chart.scales[ae].getPixelForValue(de);
      }
      O = this._getYAxisLabelAlignment(u).textAlign;
    }
    r === "y" && (l === "start" ? ee = "top" : l === "end" && (ee = "bottom"));
    const ge = this._getLabelSizes();
    for (v = 0, w = o.length; v < w; ++v) {
      S = o[v], D = S.label;
      const ae = s.setContext(this.getContext(v));
      I = this.getPixelForTick(v) + s.labelOffset, R = this._resolveTickFontOptions(v), z = R.lineHeight, H = He(D) ? D.length : 1;
      const de = H / 2, pe = ae.color, Ue = ae.textStrokeColor, ye = ae.textStrokeWidth;
      let et = O;
      a ? (P = I, O === "inner" && (v === w - 1 ? et = this.options.reverse ? "left" : "right" : v === 0 ? et = this.options.reverse ? "right" : "left" : et = "center"), i === "top" ? c === "near" || g !== 0 ? V = -H * z + z / 2 : c === "center" ? V = -ge.highest.height / 2 - de * z + z : V = -ge.highest.height + z / 2 : c === "near" || g !== 0 ? V = z / 2 : c === "center" ? V = ge.highest.height / 2 - de * z : V = ge.highest.height - H * z, h && (V *= -1), g !== 0 && !ae.showLabelBackdrop && (P += z / 2 * Math.sin(g))) : (N = I, V = (1 - H) * z / 2);
      let lt;
      if (ae.showLabelBackdrop) {
        const M = Et(ae.backdropPadding), C = ge.heights[v], x = ge.widths[v];
        let k = V - M.top, F = 0 - M.left;
        switch (ee) {
          case "middle":
            k -= C / 2;
            break;
          case "bottom":
            k -= C;
            break;
        }
        switch (O) {
          case "center":
            F -= x / 2;
            break;
          case "right":
            F -= x;
            break;
          case "inner":
            v === w - 1 ? F -= x : v > 0 && (F -= x / 2);
            break;
        }
        lt = {
          left: F,
          top: k,
          width: x + M.width,
          height: C + M.height,
          color: ae.backdropColor
        };
      }
      m.push({
        label: D,
        font: R,
        textOffset: V,
        options: {
          rotation: g,
          color: pe,
          strokeColor: Ue,
          strokeWidth: ye,
          textAlign: et,
          textBaseline: ee,
          translation: [
            P,
            N
          ],
          backdrop: lt
        }
      });
    }
    return m;
  }
  _getXAxisLabelAlignment() {
    const { position: t, ticks: r } = this.options;
    if (-pr(this.labelRotation))
      return t === "top" ? "left" : "right";
    let i = "center";
    return r.align === "start" ? i = "left" : r.align === "end" ? i = "right" : r.align === "inner" && (i = "inner"), i;
  }
  _getYAxisLabelAlignment(t) {
    const { position: r, ticks: { crossAlign: n, mirror: i, padding: s } } = this.options, a = this._getLabelSizes(), o = t + s, l = a.widest.width;
    let c, f;
    return r === "left" ? i ? (f = this.right + s, n === "near" ? c = "left" : n === "center" ? (c = "center", f += l / 2) : (c = "right", f += l)) : (f = this.right - o, n === "near" ? c = "right" : n === "center" ? (c = "center", f -= l / 2) : (c = "left", f = this.left)) : r === "right" ? i ? (f = this.left + s, n === "near" ? c = "right" : n === "center" ? (c = "center", f -= l / 2) : (c = "left", f -= l)) : (f = this.left + o, n === "near" ? c = "left" : n === "center" ? (c = "center", f += l / 2) : (c = "right", f = this.right)) : c = "right", {
      textAlign: c,
      x: f
    };
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror)
      return;
    const t = this.chart, r = this.options.position;
    if (r === "left" || r === "right")
      return {
        top: 0,
        left: this.left,
        bottom: t.height,
        right: this.right
      };
    if (r === "top" || r === "bottom")
      return {
        top: this.top,
        left: 0,
        bottom: this.bottom,
        right: t.width
      };
  }
  drawBackground() {
    const { ctx: t, options: { backgroundColor: r }, left: n, top: i, width: s, height: a } = this;
    r && (t.save(), t.fillStyle = r, t.fillRect(n, i, s, a), t.restore());
  }
  getLineWidthForValue(t) {
    const r = this.options.grid;
    if (!this._isVisible() || !r.display)
      return 0;
    const i = this.ticks.findIndex((s) => s.value === t);
    return i >= 0 ? r.setContext(this.getContext(i)).lineWidth : 0;
  }
  drawGrid(t) {
    const r = this.options.grid, n = this.ctx, i = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(t));
    let s, a;
    const o = (l, c, f) => {
      !f.width || !f.color || (n.save(), n.lineWidth = f.width, n.strokeStyle = f.color, n.setLineDash(f.borderDash || []), n.lineDashOffset = f.borderDashOffset, n.beginPath(), n.moveTo(l.x, l.y), n.lineTo(c.x, c.y), n.stroke(), n.restore());
    };
    if (r.display)
      for (s = 0, a = i.length; s < a; ++s) {
        const l = i[s];
        r.drawOnChartArea && o({
          x: l.x1,
          y: l.y1
        }, {
          x: l.x2,
          y: l.y2
        }, l), r.drawTicks && o({
          x: l.tx1,
          y: l.ty1
        }, {
          x: l.tx2,
          y: l.ty2
        }, {
          color: l.tickColor,
          width: l.tickWidth,
          borderDash: l.tickBorderDash,
          borderDashOffset: l.tickBorderDashOffset
        });
      }
  }
  drawBorder() {
    const { chart: t, ctx: r, options: { border: n, grid: i } } = this, s = n.setContext(this.getContext()), a = n.display ? s.width : 0;
    if (!a)
      return;
    const o = i.setContext(this.getContext(0)).lineWidth, l = this._borderValue;
    let c, f, h, u;
    this.isHorizontal() ? (c = Rn(t, this.left, a) - a / 2, f = Rn(t, this.right, o) + o / 2, h = u = l) : (h = Rn(t, this.top, a) - a / 2, u = Rn(t, this.bottom, o) + o / 2, c = f = l), r.save(), r.lineWidth = s.width, r.strokeStyle = s.color, r.beginPath(), r.moveTo(c, h), r.lineTo(f, u), r.stroke(), r.restore();
  }
  drawLabels(t) {
    if (!this.options.ticks.display)
      return;
    const n = this.ctx, i = this._computeLabelArea();
    i && xo(n, i);
    const s = this.getLabelItems(t);
    for (const a of s) {
      const o = a.options, l = a.font, c = a.label, f = a.textOffset;
      Kn(n, c, 0, f, l, o);
    }
    i && _o(n);
  }
  drawTitle() {
    const { ctx: t, options: { position: r, title: n, reverse: i } } = this;
    if (!n.display)
      return;
    const s = ft(n.font), a = Et(n.padding), o = n.align;
    let l = s.lineHeight / 2;
    r === "bottom" || r === "center" || be(r) ? (l += a.bottom, He(n.text) && (l += s.lineHeight * (n.text.length - 1))) : l += a.top;
    const { titleX: c, titleY: f, maxWidth: h, rotation: u } = Tx(this, l, r, o);
    Kn(t, n.text, 0, 0, s, {
      color: n.color,
      maxWidth: h,
      rotation: u,
      textAlign: wx(o, r, i),
      textBaseline: "middle",
      translation: [
        c,
        f
      ]
    });
  }
  draw(t) {
    this._isVisible() && (this.drawBackground(), this.drawGrid(t), this.drawBorder(), this.drawTitle(), this.drawLabels(t));
  }
  _layers() {
    const t = this.options, r = t.ticks && t.ticks.z || 0, n = xe(t.grid && t.grid.z, -1), i = xe(t.border && t.border.z, 0);
    return !this._isVisible() || this.draw !== ni.prototype.draw ? [
      {
        z: r,
        draw: (s) => {
          this.draw(s);
        }
      }
    ] : [
      {
        z: n,
        draw: (s) => {
          this.drawBackground(), this.drawGrid(s), this.drawTitle();
        }
      },
      {
        z: i,
        draw: () => {
          this.drawBorder();
        }
      },
      {
        z: r,
        draw: (s) => {
          this.drawLabels(s);
        }
      }
    ];
  }
  getMatchingVisibleMetas(t) {
    const r = this.chart.getSortedVisibleDatasetMetas(), n = this.axis + "AxisID", i = [];
    let s, a;
    for (s = 0, a = r.length; s < a; ++s) {
      const o = r[s];
      o[n] === this.id && (!t || o.type === t) && i.push(o);
    }
    return i;
  }
  _resolveTickFontOptions(t) {
    const r = this.options.ticks.setContext(this.getContext(t));
    return ft(r.font);
  }
  _maxDigits() {
    const t = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / t;
  }
}
class fa {
  constructor(t, r, n) {
    this.type = t, this.scope = r, this.override = n, this.items = /* @__PURE__ */ Object.create(null);
  }
  isForType(t) {
    return Object.prototype.isPrototypeOf.call(this.type.prototype, t.prototype);
  }
  register(t) {
    const r = Object.getPrototypeOf(t);
    let n;
    Ex(r) && (n = this.register(r));
    const i = this.items, s = t.id, a = this.scope + "." + s;
    if (!s)
      throw new Error("class does not have id: " + t);
    return s in i || (i[s] = t, Sx(t, a, n), this.override && Qe.override(t.id, t.overrides)), a;
  }
  get(t) {
    return this.items[t];
  }
  unregister(t) {
    const r = this.items, n = t.id, i = this.scope;
    n in r && delete r[n], i && n in Qe[i] && (delete Qe[i][n], this.override && delete Xn[n]);
  }
}
function Sx(e, t, r) {
  const n = Mr(/* @__PURE__ */ Object.create(null), [
    r ? Qe.get(r) : {},
    Qe.get(t),
    e.defaults
  ]);
  Qe.set(t, n), e.defaultRoutes && bx(t, e.defaultRoutes), e.descriptors && Qe.describe(t, e.descriptors);
}
function bx(e, t) {
  Object.keys(t).forEach((r) => {
    const n = r.split("."), i = n.pop(), s = [
      e
    ].concat(n).join("."), a = t[r].split("."), o = a.pop(), l = a.join(".");
    Qe.route(s, i, l, o);
  });
}
function Ex(e) {
  return "id" in e && "defaults" in e;
}
class Ax {
  constructor() {
    this.controllers = new fa(_r, "datasets", !0), this.elements = new fa(yr, "elements"), this.plugins = new fa(Object, "plugins"), this.scales = new fa(ni, "scales"), this._typedRegistries = [
      this.controllers,
      this.scales,
      this.elements
    ];
  }
  add(...t) {
    this._each("register", t);
  }
  remove(...t) {
    this._each("unregister", t);
  }
  addControllers(...t) {
    this._each("register", t, this.controllers);
  }
  addElements(...t) {
    this._each("register", t, this.elements);
  }
  addPlugins(...t) {
    this._each("register", t, this.plugins);
  }
  addScales(...t) {
    this._each("register", t, this.scales);
  }
  getController(t) {
    return this._get(t, this.controllers, "controller");
  }
  getElement(t) {
    return this._get(t, this.elements, "element");
  }
  getPlugin(t) {
    return this._get(t, this.plugins, "plugin");
  }
  getScale(t) {
    return this._get(t, this.scales, "scale");
  }
  removeControllers(...t) {
    this._each("unregister", t, this.controllers);
  }
  removeElements(...t) {
    this._each("unregister", t, this.elements);
  }
  removePlugins(...t) {
    this._each("unregister", t, this.plugins);
  }
  removeScales(...t) {
    this._each("unregister", t, this.scales);
  }
  _each(t, r, n) {
    [
      ...r
    ].forEach((i) => {
      const s = n || this._getRegistryForType(i);
      n || s.isForType(i) || s === this.plugins && i.id ? this._exec(t, s, i) : Me(i, (a) => {
        const o = n || this._getRegistryForType(a);
        this._exec(t, o, a);
      });
    });
  }
  _exec(t, r, n) {
    const i = Jl(t);
    Ne(n["before" + i], [], n), r[t](n), Ne(n["after" + i], [], n);
  }
  _getRegistryForType(t) {
    for (let r = 0; r < this._typedRegistries.length; r++) {
      const n = this._typedRegistries[r];
      if (n.isForType(t))
        return n;
    }
    return this.plugins;
  }
  _get(t, r, n) {
    const i = r.get(t);
    if (i === void 0)
      throw new Error('"' + t + '" is not a registered ' + n + ".");
    return i;
  }
}
var Or = /* @__PURE__ */ new Ax();
class kx {
  constructor() {
    this._init = [];
  }
  notify(t, r, n, i) {
    r === "beforeInit" && (this._init = this._createDescriptors(t, !0), this._notify(this._init, t, "install"));
    const s = i ? this._descriptors(t).filter(i) : this._descriptors(t), a = this._notify(s, t, r, n);
    return r === "afterDestroy" && (this._notify(s, t, "stop"), this._notify(this._init, t, "uninstall")), a;
  }
  _notify(t, r, n, i) {
    i = i || {};
    for (const s of t) {
      const a = s.plugin, o = a[n], l = [
        r,
        i,
        s.options
      ];
      if (Ne(o, l, a) === !1 && i.cancelable)
        return !1;
    }
    return !0;
  }
  invalidate() {
    Te(this._cache) || (this._oldCache = this._cache, this._cache = void 0);
  }
  _descriptors(t) {
    if (this._cache)
      return this._cache;
    const r = this._cache = this._createDescriptors(t);
    return this._notifyStateChanges(t), r;
  }
  _createDescriptors(t, r) {
    const n = t && t.config, i = xe(n.options && n.options.plugins, {}), s = Ox(n);
    return i === !1 && !r ? [] : Fx(t, s, i, r);
  }
  _notifyStateChanges(t) {
    const r = this._oldCache || [], n = this._cache, i = (s, a) => s.filter((o) => !a.some((l) => o.plugin.id === l.plugin.id));
    this._notify(i(r, n), t, "stop"), this._notify(i(n, r), t, "start");
  }
}
function Ox(e) {
  const t = {}, r = [], n = Object.keys(Or.plugins.items);
  for (let s = 0; s < n.length; s++)
    r.push(Or.getPlugin(n[s]));
  const i = e.plugins || [];
  for (let s = 0; s < i.length; s++) {
    const a = i[s];
    r.indexOf(a) === -1 && (r.push(a), t[a.id] = !0);
  }
  return {
    plugins: r,
    localIds: t
  };
}
function Dx(e, t) {
  return !t && e === !1 ? null : e === !0 ? {} : e;
}
function Fx(e, { plugins: t, localIds: r }, n, i) {
  const s = [], a = e.getContext();
  for (const o of t) {
    const l = o.id, c = Dx(n[l], i);
    c !== null && s.push({
      plugin: o,
      options: Cx(e.config, {
        plugin: o,
        local: r[l]
      }, c, a)
    });
  }
  return s;
}
function Cx(e, { plugin: t, local: r }, n, i) {
  const s = e.pluginScopeKeys(t), a = e.getOptionScopes(n, s);
  return r && t.defaults && a.push(t.defaults), e.createResolver(a, i, [
    ""
  ], {
    scriptable: !1,
    indexable: !1,
    allKeys: !0
  });
}
function El(e, t) {
  const r = Qe.datasets[e] || {};
  return ((t.datasets || {})[e] || {}).indexAxis || t.indexAxis || r.indexAxis || "x";
}
function Mx(e, t) {
  let r = e;
  return e === "_index_" ? r = t : e === "_value_" && (r = t === "x" ? "y" : "x"), r;
}
function Px(e, t) {
  return e === t ? "_index_" : "_value_";
}
function Qf(e) {
  if (e === "x" || e === "y" || e === "r")
    return e;
}
function Rx(e) {
  if (e === "top" || e === "bottom")
    return "x";
  if (e === "left" || e === "right")
    return "y";
}
function Al(e, ...t) {
  if (Qf(e))
    return e;
  for (const r of t) {
    const n = r.axis || Rx(r.position) || e.length > 1 && Qf(e[0].toLowerCase());
    if (n)
      return n;
  }
  throw new Error(`Cannot determine type of '${e}' axis. Please provide 'axis' or 'position' option.`);
}
function eh(e, t, r) {
  if (r[t + "AxisID"] === e)
    return {
      axis: t
    };
}
function Ix(e, t) {
  if (t.data && t.data.datasets) {
    const r = t.data.datasets.filter((n) => n.xAxisID === e || n.yAxisID === e);
    if (r.length)
      return eh(e, "x", r[0]) || eh(e, "y", r[0]);
  }
  return {};
}
function Lx(e, t) {
  const r = Xn[e.type] || {
    scales: {}
  }, n = t.scales || {}, i = El(e.type, t), s = /* @__PURE__ */ Object.create(null);
  return Object.keys(n).forEach((a) => {
    const o = n[a];
    if (!be(o))
      return console.error(`Invalid scale configuration for scale: ${a}`);
    if (o._proxy)
      return console.warn(`Ignoring resolver passed as options for scale: ${a}`);
    const l = Al(a, o, Ix(a, e), Qe.scales[o.type]), c = Px(l, i), f = r.scales || {};
    s[a] = as(/* @__PURE__ */ Object.create(null), [
      {
        axis: l
      },
      o,
      f[l],
      f[c]
    ]);
  }), e.data.datasets.forEach((a) => {
    const o = a.type || e.type, l = a.indexAxis || El(o, t), f = (Xn[o] || {}).scales || {};
    Object.keys(f).forEach((h) => {
      const u = Mx(h, l), d = a[u + "AxisID"] || u;
      s[d] = s[d] || /* @__PURE__ */ Object.create(null), as(s[d], [
        {
          axis: u
        },
        n[d],
        f[h]
      ]);
    });
  }), Object.keys(s).forEach((a) => {
    const o = s[a];
    as(o, [
      Qe.scales[o.type],
      Qe.scale
    ]);
  }), s;
}
function cu(e) {
  const t = e.options || (e.options = {});
  t.plugins = xe(t.plugins, {}), t.scales = Lx(e, t);
}
function fu(e) {
  return e = e || {}, e.datasets = e.datasets || [], e.labels = e.labels || [], e;
}
function Nx(e) {
  return e = e || {}, e.data = fu(e.data), cu(e), e;
}
const th = /* @__PURE__ */ new Map(), hu = /* @__PURE__ */ new Set();
function ha(e, t) {
  let r = th.get(e);
  return r || (r = t(), th.set(e, r), hu.add(r)), r;
}
const qi = (e, t, r) => {
  const n = Sn(t, r);
  n !== void 0 && e.add(n);
};
class Bx {
  constructor(t) {
    this._config = Nx(t), this._scopeCache = /* @__PURE__ */ new Map(), this._resolverCache = /* @__PURE__ */ new Map();
  }
  get platform() {
    return this._config.platform;
  }
  get type() {
    return this._config.type;
  }
  set type(t) {
    this._config.type = t;
  }
  get data() {
    return this._config.data;
  }
  set data(t) {
    this._config.data = fu(t);
  }
  get options() {
    return this._config.options;
  }
  set options(t) {
    this._config.options = t;
  }
  get plugins() {
    return this._config.plugins;
  }
  update() {
    const t = this._config;
    this.clearCache(), cu(t);
  }
  clearCache() {
    this._scopeCache.clear(), this._resolverCache.clear();
  }
  datasetScopeKeys(t) {
    return ha(t, () => [
      [
        `datasets.${t}`,
        ""
      ]
    ]);
  }
  datasetAnimationScopeKeys(t, r) {
    return ha(`${t}.transition.${r}`, () => [
      [
        `datasets.${t}.transitions.${r}`,
        `transitions.${r}`
      ],
      [
        `datasets.${t}`,
        ""
      ]
    ]);
  }
  datasetElementScopeKeys(t, r) {
    return ha(`${t}-${r}`, () => [
      [
        `datasets.${t}.elements.${r}`,
        `datasets.${t}`,
        `elements.${r}`,
        ""
      ]
    ]);
  }
  pluginScopeKeys(t) {
    const r = t.id, n = this.type;
    return ha(`${n}-plugin-${r}`, () => [
      [
        `plugins.${r}`,
        ...t.additionalOptionScopes || []
      ]
    ]);
  }
  _cachedScopes(t, r) {
    const n = this._scopeCache;
    let i = n.get(t);
    return (!i || r) && (i = /* @__PURE__ */ new Map(), n.set(t, i)), i;
  }
  getOptionScopes(t, r, n) {
    const { options: i, type: s } = this, a = this._cachedScopes(t, n), o = a.get(r);
    if (o)
      return o;
    const l = /* @__PURE__ */ new Set();
    r.forEach((f) => {
      t && (l.add(t), f.forEach((h) => qi(l, t, h))), f.forEach((h) => qi(l, i, h)), f.forEach((h) => qi(l, Xn[s] || {}, h)), f.forEach((h) => qi(l, Qe, h)), f.forEach((h) => qi(l, Tl, h));
    });
    const c = Array.from(l);
    return c.length === 0 && c.push(/* @__PURE__ */ Object.create(null)), hu.has(r) && a.set(r, c), c;
  }
  chartOptionScopes() {
    const { options: t, type: r } = this;
    return [
      t,
      Xn[r] || {},
      Qe.datasets[r] || {},
      {
        type: r
      },
      Qe,
      Tl
    ];
  }
  resolveNamedOptions(t, r, n, i = [
    ""
  ]) {
    const s = {
      $shared: !0
    }, { resolver: a, subPrefixes: o } = rh(this._resolverCache, t, i);
    let l = a;
    if (Ux(a, r)) {
      s.$shared = !1, n = bn(n) ? n() : n;
      const c = this.createResolver(t, n, o);
      l = Mi(a, n, c);
    }
    for (const c of r)
      s[c] = l[c];
    return s;
  }
  createResolver(t, r, n = [
    ""
  ], i) {
    const { resolver: s } = rh(this._resolverCache, t, n);
    return be(r) ? Mi(s, r, void 0, i) : s;
  }
}
function rh(e, t, r) {
  let n = e.get(t);
  n || (n = /* @__PURE__ */ new Map(), e.set(t, n));
  const i = r.join();
  let s = n.get(i);
  return s || (s = {
    resolver: ic(t, r),
    subPrefixes: r.filter((o) => !o.toLowerCase().includes("hover"))
  }, n.set(i, s)), s;
}
const Wx = (e) => be(e) && Object.getOwnPropertyNames(e).some((t) => bn(e[t]));
function Ux(e, t) {
  const { isScriptable: r, isIndexable: n } = Y0(e);
  for (const i of t) {
    const s = r(i), a = n(i), o = (a || s) && e[i];
    if (s && (bn(o) || Wx(o)) || a && He(o))
      return !0;
  }
  return !1;
}
var zx = "4.4.1";
const Hx = [
  "top",
  "bottom",
  "left",
  "right",
  "chartArea"
];
function nh(e, t) {
  return e === "top" || e === "bottom" || Hx.indexOf(e) === -1 && t === "x";
}
function ih(e, t) {
  return function(r, n) {
    return r[e] === n[e] ? r[t] - n[t] : r[e] - n[e];
  };
}
function sh(e) {
  const t = e.chart, r = t.options.animation;
  t.notifyPlugins("afterRender"), Ne(r && r.onComplete, [
    e
  ], t);
}
function Vx(e) {
  const t = e.chart, r = t.options.animation;
  Ne(r && r.onProgress, [
    e
  ], t);
}
function uu(e) {
  return oc() && typeof e == "string" ? e = document.getElementById(e) : e && e.length && (e = e[0]), e && e.canvas && (e = e.canvas), e;
}
const La = {}, ah = (e) => {
  const t = uu(e);
  return Object.values(La).filter((r) => r.canvas === t).pop();
};
function Yx(e, t, r) {
  const n = Object.keys(e);
  for (const i of n) {
    const s = +i;
    if (s >= t) {
      const a = e[i];
      delete e[i], (r > 0 || s > t) && (e[s + r] = a);
    }
  }
}
function jx(e, t, r, n) {
  return !r || e.type === "mouseout" ? null : n ? t : e;
}
function ua(e, t, r) {
  return e.options.clip ? e[r] : t[r];
}
function $x(e, t) {
  const { xScale: r, yScale: n } = e;
  return r && n ? {
    left: ua(r, t, "left"),
    right: ua(r, t, "right"),
    top: ua(n, t, "top"),
    bottom: ua(n, t, "bottom")
  } : t;
}
class $r {
  static register(...t) {
    Or.add(...t), oh();
  }
  static unregister(...t) {
    Or.remove(...t), oh();
  }
  constructor(t, r) {
    const n = this.config = new Bx(r), i = uu(t), s = ah(i);
    if (s)
      throw new Error("Canvas is already in use. Chart with ID '" + s.id + "' must be destroyed before the canvas with ID '" + s.canvas.id + "' can be reused.");
    const a = n.createResolver(n.chartOptionScopes(), this.getContext());
    this.platform = new (n.platform || cx(i))(), this.platform.updateConfig(n);
    const o = this.platform.acquireContext(i, a.aspectRatio), l = o && o.canvas, c = l && l.height, f = l && l.width;
    if (this.id = Xp(), this.ctx = o, this.canvas = l, this.width = f, this.height = c, this._options = a, this._aspectRatio = this.aspectRatio, this._layers = [], this._metasets = [], this._stacks = void 0, this.boxes = [], this.currentDevicePixelRatio = void 0, this.chartArea = void 0, this._active = [], this._lastEvent = void 0, this._listeners = {}, this._responsiveListeners = void 0, this._sortedMetasets = [], this.scales = {}, this._plugins = new kx(), this.$proxies = {}, this._hiddenIndices = {}, this.attached = !1, this._animationsDisabled = void 0, this.$context = void 0, this._doResize = f1((h) => this.update(h), a.resizeDelay || 0), this._dataChanges = [], La[this.id] = this, !o || !l) {
      console.error("Failed to create chart: can't acquire context from the given item");
      return;
    }
    Hr.listen(this, "complete", sh), Hr.listen(this, "progress", Vx), this._initialize(), this.attached && this.update();
  }
  get aspectRatio() {
    const { options: { aspectRatio: t, maintainAspectRatio: r }, width: n, height: i, _aspectRatio: s } = this;
    return Te(t) ? r && s ? s : i ? n / i : null : t;
  }
  get data() {
    return this.config.data;
  }
  set data(t) {
    this.config.data = t;
  }
  get options() {
    return this._options;
  }
  set options(t) {
    this.config.options = t;
  }
  get registry() {
    return Or;
  }
  _initialize() {
    return this.notifyPlugins("beforeInit"), this.options.responsive ? this.resize() : Of(this, this.options.devicePixelRatio), this.bindEvents(), this.notifyPlugins("afterInit"), this;
  }
  clear() {
    return Ef(this.canvas, this.ctx), this;
  }
  stop() {
    return Hr.stop(this), this;
  }
  resize(t, r) {
    Hr.running(this) ? this._resizeBeforeDraw = {
      width: t,
      height: r
    } : this._resize(t, r);
  }
  _resize(t, r) {
    const n = this.options, i = this.canvas, s = n.maintainAspectRatio && this.aspectRatio, a = this.platform.getMaximumSize(i, t, r, s), o = n.devicePixelRatio || this.platform.getDevicePixelRatio(), l = this.width ? "resize" : "attach";
    this.width = a.width, this.height = a.height, this._aspectRatio = this.aspectRatio, Of(this, o, !0) && (this.notifyPlugins("resize", {
      size: a
    }), Ne(n.onResize, [
      this,
      a
    ], this), this.attached && this._doResize(l) && this.render());
  }
  ensureScalesHaveIDs() {
    const r = this.options.scales || {};
    Me(r, (n, i) => {
      n.id = i;
    });
  }
  buildOrUpdateScales() {
    const t = this.options, r = t.scales, n = this.scales, i = Object.keys(n).reduce((a, o) => (a[o] = !1, a), {});
    let s = [];
    r && (s = s.concat(Object.keys(r).map((a) => {
      const o = r[a], l = Al(a, o), c = l === "r", f = l === "x";
      return {
        options: o,
        dposition: c ? "chartArea" : f ? "bottom" : "left",
        dtype: c ? "radialLinear" : f ? "category" : "linear"
      };
    }))), Me(s, (a) => {
      const o = a.options, l = o.id, c = Al(l, o), f = xe(o.type, a.dtype);
      (o.position === void 0 || nh(o.position, c) !== nh(a.dposition)) && (o.position = a.dposition), i[l] = !0;
      let h = null;
      if (l in n && n[l].type === f)
        h = n[l];
      else {
        const u = Or.getScale(f);
        h = new u({
          id: l,
          type: f,
          ctx: this.ctx,
          chart: this
        }), n[h.id] = h;
      }
      h.init(o, t);
    }), Me(i, (a, o) => {
      a || delete n[o];
    }), Me(n, (a) => {
      Ft.configure(this, a, a.options), Ft.addBox(this, a);
    });
  }
  _updateMetasets() {
    const t = this._metasets, r = this.data.datasets.length, n = t.length;
    if (t.sort((i, s) => i.index - s.index), n > r) {
      for (let i = r; i < n; ++i)
        this._destroyDatasetMeta(i);
      t.splice(r, n - r);
    }
    this._sortedMetasets = t.slice(0).sort(ih("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const { _metasets: t, data: { datasets: r } } = this;
    t.length > r.length && delete this._stacks, t.forEach((n, i) => {
      r.filter((s) => s === n._dataset).length === 0 && this._destroyDatasetMeta(i);
    });
  }
  buildOrUpdateControllers() {
    const t = [], r = this.data.datasets;
    let n, i;
    for (this._removeUnreferencedMetasets(), n = 0, i = r.length; n < i; n++) {
      const s = r[n];
      let a = this.getDatasetMeta(n);
      const o = s.type || this.config.type;
      if (a.type && a.type !== o && (this._destroyDatasetMeta(n), a = this.getDatasetMeta(n)), a.type = o, a.indexAxis = s.indexAxis || El(o, this.options), a.order = s.order || 0, a.index = n, a.label = "" + s.label, a.visible = this.isDatasetVisible(n), a.controller)
        a.controller.updateIndex(n), a.controller.linkScales();
      else {
        const l = Or.getController(o), { datasetElementType: c, dataElementType: f } = Qe.datasets[o];
        Object.assign(l, {
          dataElementType: Or.getElement(f),
          datasetElementType: c && Or.getElement(c)
        }), a.controller = new l(this, n), t.push(a.controller);
      }
    }
    return this._updateMetasets(), t;
  }
  _resetElements() {
    Me(this.data.datasets, (t, r) => {
      this.getDatasetMeta(r).controller.reset();
    }, this);
  }
  reset() {
    this._resetElements(), this.notifyPlugins("reset");
  }
  update(t) {
    const r = this.config;
    r.update();
    const n = this._options = r.createResolver(r.chartOptionScopes(), this.getContext()), i = this._animationsDisabled = !n.animation;
    if (this._updateScales(), this._checkEventBindings(), this._updateHiddenIndices(), this._plugins.invalidate(), this.notifyPlugins("beforeUpdate", {
      mode: t,
      cancelable: !0
    }) === !1)
      return;
    const s = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let a = 0;
    for (let c = 0, f = this.data.datasets.length; c < f; c++) {
      const { controller: h } = this.getDatasetMeta(c), u = !i && s.indexOf(h) === -1;
      h.buildOrUpdateElements(u), a = Math.max(+h.getMaxOverflow(), a);
    }
    a = this._minPadding = n.layout.autoPadding ? a : 0, this._updateLayout(a), i || Me(s, (c) => {
      c.reset();
    }), this._updateDatasets(t), this.notifyPlugins("afterUpdate", {
      mode: t
    }), this._layers.sort(ih("z", "_idx"));
    const { _active: o, _lastEvent: l } = this;
    l ? this._eventHandler(l, !0) : o.length && this._updateHoverStyles(o, o, !0), this.render();
  }
  _updateScales() {
    Me(this.scales, (t) => {
      Ft.removeBox(this, t);
    }), this.ensureScalesHaveIDs(), this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const t = this.options, r = new Set(Object.keys(this._listeners)), n = new Set(t.events);
    (!mf(r, n) || !!this._responsiveListeners !== t.responsive) && (this.unbindEvents(), this.bindEvents());
  }
  _updateHiddenIndices() {
    const { _hiddenIndices: t } = this, r = this._getUniformDataChanges() || [];
    for (const { method: n, start: i, count: s } of r) {
      const a = n === "_removeElements" ? -s : s;
      Yx(t, i, a);
    }
  }
  _getUniformDataChanges() {
    const t = this._dataChanges;
    if (!t || !t.length)
      return;
    this._dataChanges = [];
    const r = this.data.datasets.length, n = (s) => new Set(t.filter((a) => a[0] === s).map((a, o) => o + "," + a.splice(1).join(","))), i = n(0);
    for (let s = 1; s < r; s++)
      if (!mf(i, n(s)))
        return;
    return Array.from(i).map((s) => s.split(",")).map((s) => ({
      method: s[1],
      start: +s[2],
      count: +s[3]
    }));
  }
  _updateLayout(t) {
    if (this.notifyPlugins("beforeLayout", {
      cancelable: !0
    }) === !1)
      return;
    Ft.update(this, this.width, this.height, t);
    const r = this.chartArea, n = r.width <= 0 || r.height <= 0;
    this._layers = [], Me(this.boxes, (i) => {
      n && i.position === "chartArea" || (i.configure && i.configure(), this._layers.push(...i._layers()));
    }, this), this._layers.forEach((i, s) => {
      i._idx = s;
    }), this.notifyPlugins("afterLayout");
  }
  _updateDatasets(t) {
    if (this.notifyPlugins("beforeDatasetsUpdate", {
      mode: t,
      cancelable: !0
    }) !== !1) {
      for (let r = 0, n = this.data.datasets.length; r < n; ++r)
        this.getDatasetMeta(r).controller.configure();
      for (let r = 0, n = this.data.datasets.length; r < n; ++r)
        this._updateDataset(r, bn(t) ? t({
          datasetIndex: r
        }) : t);
      this.notifyPlugins("afterDatasetsUpdate", {
        mode: t
      });
    }
  }
  _updateDataset(t, r) {
    const n = this.getDatasetMeta(t), i = {
      meta: n,
      index: t,
      mode: r,
      cancelable: !0
    };
    this.notifyPlugins("beforeDatasetUpdate", i) !== !1 && (n.controller._update(r), i.cancelable = !1, this.notifyPlugins("afterDatasetUpdate", i));
  }
  render() {
    this.notifyPlugins("beforeRender", {
      cancelable: !0
    }) !== !1 && (Hr.has(this) ? this.attached && !Hr.running(this) && Hr.start(this) : (this.draw(), sh({
      chart: this
    })));
  }
  draw() {
    let t;
    if (this._resizeBeforeDraw) {
      const { width: n, height: i } = this._resizeBeforeDraw;
      this._resize(n, i), this._resizeBeforeDraw = null;
    }
    if (this.clear(), this.width <= 0 || this.height <= 0 || this.notifyPlugins("beforeDraw", {
      cancelable: !0
    }) === !1)
      return;
    const r = this._layers;
    for (t = 0; t < r.length && r[t].z <= 0; ++t)
      r[t].draw(this.chartArea);
    for (this._drawDatasets(); t < r.length; ++t)
      r[t].draw(this.chartArea);
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(t) {
    const r = this._sortedMetasets, n = [];
    let i, s;
    for (i = 0, s = r.length; i < s; ++i) {
      const a = r[i];
      (!t || a.visible) && n.push(a);
    }
    return n;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(!0);
  }
  _drawDatasets() {
    if (this.notifyPlugins("beforeDatasetsDraw", {
      cancelable: !0
    }) === !1)
      return;
    const t = this.getSortedVisibleDatasetMetas();
    for (let r = t.length - 1; r >= 0; --r)
      this._drawDataset(t[r]);
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(t) {
    const r = this.ctx, n = t._clip, i = !n.disabled, s = $x(t, this.chartArea), a = {
      meta: t,
      index: t.index,
      cancelable: !0
    };
    this.notifyPlugins("beforeDatasetDraw", a) !== !1 && (i && xo(r, {
      left: n.left === !1 ? 0 : s.left - n.left,
      right: n.right === !1 ? this.width : s.right + n.right,
      top: n.top === !1 ? 0 : s.top - n.top,
      bottom: n.bottom === !1 ? this.height : s.bottom + n.bottom
    }), t.controller.draw(), i && _o(r), a.cancelable = !1, this.notifyPlugins("afterDatasetDraw", a));
  }
  isPointInArea(t) {
    return Kr(t, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(t, r, n, i) {
    const s = Hm.modes[r];
    return typeof s == "function" ? s(this, t, n, i) : [];
  }
  getDatasetMeta(t) {
    const r = this.data.datasets[t], n = this._metasets;
    let i = n.filter((s) => s && s._dataset === r).pop();
    return i || (i = {
      type: null,
      data: [],
      dataset: null,
      controller: null,
      hidden: null,
      xAxisID: null,
      yAxisID: null,
      order: r && r.order || 0,
      index: t,
      _dataset: r,
      _parsed: [],
      _sorted: !1
    }, n.push(i)), i;
  }
  getContext() {
    return this.$context || (this.$context = On(null, {
      chart: this,
      type: "chart"
    }));
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(t) {
    const r = this.data.datasets[t];
    if (!r)
      return !1;
    const n = this.getDatasetMeta(t);
    return typeof n.hidden == "boolean" ? !n.hidden : !r.hidden;
  }
  setDatasetVisibility(t, r) {
    const n = this.getDatasetMeta(t);
    n.hidden = !r;
  }
  toggleDataVisibility(t) {
    this._hiddenIndices[t] = !this._hiddenIndices[t];
  }
  getDataVisibility(t) {
    return !this._hiddenIndices[t];
  }
  _updateVisibility(t, r, n) {
    const i = n ? "show" : "hide", s = this.getDatasetMeta(t), a = s.controller._resolveAnimations(void 0, i);
    bs(r) ? (s.data[r].hidden = !n, this.update()) : (this.setDatasetVisibility(t, n), a.update(s, {
      visible: n
    }), this.update((o) => o.datasetIndex === t ? i : void 0));
  }
  hide(t, r) {
    this._updateVisibility(t, r, !1);
  }
  show(t, r) {
    this._updateVisibility(t, r, !0);
  }
  _destroyDatasetMeta(t) {
    const r = this._metasets[t];
    r && r.controller && r.controller._destroy(), delete this._metasets[t];
  }
  _stop() {
    let t, r;
    for (this.stop(), Hr.remove(this), t = 0, r = this.data.datasets.length; t < r; ++t)
      this._destroyDatasetMeta(t);
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const { canvas: t, ctx: r } = this;
    this._stop(), this.config.clearCache(), t && (this.unbindEvents(), Ef(t, r), this.platform.releaseContext(r), this.canvas = null, this.ctx = null), delete La[this.id], this.notifyPlugins("afterDestroy");
  }
  toBase64Image(...t) {
    return this.canvas.toDataURL(...t);
  }
  bindEvents() {
    this.bindUserEvents(), this.options.responsive ? this.bindResponsiveEvents() : this.attached = !0;
  }
  bindUserEvents() {
    const t = this._listeners, r = this.platform, n = (s, a) => {
      r.addEventListener(this, s, a), t[s] = a;
    }, i = (s, a, o) => {
      s.offsetX = a, s.offsetY = o, this._eventHandler(s);
    };
    Me(this.options.events, (s) => n(s, i));
  }
  bindResponsiveEvents() {
    this._responsiveListeners || (this._responsiveListeners = {});
    const t = this._responsiveListeners, r = this.platform, n = (l, c) => {
      r.addEventListener(this, l, c), t[l] = c;
    }, i = (l, c) => {
      t[l] && (r.removeEventListener(this, l, c), delete t[l]);
    }, s = (l, c) => {
      this.canvas && this.resize(l, c);
    };
    let a;
    const o = () => {
      i("attach", o), this.attached = !0, this.resize(), n("resize", s), n("detach", a);
    };
    a = () => {
      this.attached = !1, i("resize", s), this._stop(), this._resize(0, 0), n("attach", o);
    }, r.isAttached(this.canvas) ? o() : a();
  }
  unbindEvents() {
    Me(this._listeners, (t, r) => {
      this.platform.removeEventListener(this, r, t);
    }), this._listeners = {}, Me(this._responsiveListeners, (t, r) => {
      this.platform.removeEventListener(this, r, t);
    }), this._responsiveListeners = void 0;
  }
  updateHoverStyle(t, r, n) {
    const i = n ? "set" : "remove";
    let s, a, o, l;
    for (r === "dataset" && (s = this.getDatasetMeta(t[0].datasetIndex), s.controller["_" + i + "DatasetHoverStyle"]()), o = 0, l = t.length; o < l; ++o) {
      a = t[o];
      const c = a && this.getDatasetMeta(a.datasetIndex).controller;
      c && c[i + "HoverStyle"](a.element, a.datasetIndex, a.index);
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t) {
    const r = this._active || [], n = t.map(({ datasetIndex: s, index: a }) => {
      const o = this.getDatasetMeta(s);
      if (!o)
        throw new Error("No dataset found at index " + s);
      return {
        datasetIndex: s,
        element: o.data[a],
        index: a
      };
    });
    !Ua(n, r) && (this._active = n, this._lastEvent = null, this._updateHoverStyles(n, r));
  }
  notifyPlugins(t, r, n) {
    return this._plugins.notify(this, t, r, n);
  }
  isPluginEnabled(t) {
    return this._plugins._cache.filter((r) => r.plugin.id === t).length === 1;
  }
  _updateHoverStyles(t, r, n) {
    const i = this.options.hover, s = (l, c) => l.filter((f) => !c.some((h) => f.datasetIndex === h.datasetIndex && f.index === h.index)), a = s(r, t), o = n ? t : s(t, r);
    a.length && this.updateHoverStyle(a, i.mode, !1), o.length && i.mode && this.updateHoverStyle(o, i.mode, !0);
  }
  _eventHandler(t, r) {
    const n = {
      event: t,
      replay: r,
      cancelable: !0,
      inChartArea: this.isPointInArea(t)
    }, i = (a) => (a.options.events || this.options.events).includes(t.native.type);
    if (this.notifyPlugins("beforeEvent", n, i) === !1)
      return;
    const s = this._handleEvent(t, r, n.inChartArea);
    return n.cancelable = !1, this.notifyPlugins("afterEvent", n, i), (s || n.changed) && this.render(), this;
  }
  _handleEvent(t, r, n) {
    const { _active: i = [], options: s } = this, a = r, o = this._getActiveElements(t, i, n, a), l = e1(t), c = jx(t, this._lastEvent, n, l);
    n && (this._lastEvent = null, Ne(s.onHover, [
      t,
      o,
      this
    ], this), l && Ne(s.onClick, [
      t,
      o,
      this
    ], this));
    const f = !Ua(o, i);
    return (f || r) && (this._active = o, this._updateHoverStyles(o, i, r)), this._lastEvent = c, f;
  }
  _getActiveElements(t, r, n, i) {
    if (t.type === "mouseout")
      return [];
    if (!n)
      return r;
    const s = this.options.hover;
    return this.getElementsAtEventForMode(t, s.mode, s, i);
  }
}
ie($r, "defaults", Qe), ie($r, "instances", La), ie($r, "overrides", Xn), ie($r, "registry", Or), ie($r, "version", zx), ie($r, "getChart", ah);
function oh() {
  return Me($r.instances, (e) => e._plugins.invalidate());
}
function Gx(e, t, r) {
  const { startAngle: n, pixelMargin: i, x: s, y: a, outerRadius: o, innerRadius: l } = t;
  let c = i / o;
  e.beginPath(), e.arc(s, a, o, n - c, r + c), l > i ? (c = i / l, e.arc(s, a, l, r + c, n - c, !0)) : e.arc(s, a, i, r + ot, n - ot), e.closePath(), e.clip();
}
function Xx(e) {
  return nc(e, [
    "outerStart",
    "outerEnd",
    "innerStart",
    "innerEnd"
  ]);
}
function Kx(e, t, r, n) {
  const i = Xx(e.options.borderRadius), s = (r - t) / 2, a = Math.min(s, n * t / 2), o = (l) => {
    const c = (r - Math.min(s, l)) * n / 2;
    return xt(l, 0, Math.min(s, c));
  };
  return {
    outerStart: o(i.outerStart),
    outerEnd: o(i.outerEnd),
    innerStart: xt(i.innerStart, 0, a),
    innerEnd: xt(i.innerEnd, 0, a)
  };
}
function di(e, t, r, n) {
  return {
    x: r + e * Math.cos(t),
    y: n + e * Math.sin(t)
  };
}
function $a(e, t, r, n, i, s) {
  const { x: a, y: o, startAngle: l, pixelMargin: c, innerRadius: f } = t, h = Math.max(t.outerRadius + n + r - c, 0), u = f > 0 ? f + n + r + c : 0;
  let d = 0;
  const p = i - l;
  if (n) {
    const ae = f > 0 ? f - n : 0, de = h > 0 ? h - n : 0, pe = (ae + de) / 2, Ue = pe !== 0 ? p * pe / (pe + n) : p;
    d = (p - Ue) / 2;
  }
  const g = Math.max(1e-3, p * h - r / Ye) / h, m = (p - g) / 2, v = l + m + d, w = i - m - d, { outerStart: S, outerEnd: D, innerStart: P, innerEnd: N } = Kx(t, u, h, w - v), O = h - S, I = h - D, R = v + S / O, z = w - D / I, H = u + P, V = u + N, ee = v + P / H, ge = w - N / V;
  if (e.beginPath(), s) {
    const ae = (R + z) / 2;
    if (e.arc(a, o, h, R, ae), e.arc(a, o, h, ae, z), D > 0) {
      const ye = di(I, z, a, o);
      e.arc(ye.x, ye.y, D, z, w + ot);
    }
    const de = di(V, w, a, o);
    if (e.lineTo(de.x, de.y), N > 0) {
      const ye = di(V, ge, a, o);
      e.arc(ye.x, ye.y, N, w + ot, ge + Math.PI);
    }
    const pe = (w - N / u + (v + P / u)) / 2;
    if (e.arc(a, o, u, w - N / u, pe, !0), e.arc(a, o, u, pe, v + P / u, !0), P > 0) {
      const ye = di(H, ee, a, o);
      e.arc(ye.x, ye.y, P, ee + Math.PI, v - ot);
    }
    const Ue = di(O, v, a, o);
    if (e.lineTo(Ue.x, Ue.y), S > 0) {
      const ye = di(O, R, a, o);
      e.arc(ye.x, ye.y, S, v - ot, R);
    }
  } else {
    e.moveTo(a, o);
    const ae = Math.cos(R) * h + a, de = Math.sin(R) * h + o;
    e.lineTo(ae, de);
    const pe = Math.cos(z) * h + a, Ue = Math.sin(z) * h + o;
    e.lineTo(pe, Ue);
  }
  e.closePath();
}
function qx(e, t, r, n, i) {
  const { fullCircles: s, startAngle: a, circumference: o } = t;
  let l = t.endAngle;
  if (s) {
    $a(e, t, r, n, l, i);
    for (let c = 0; c < s; ++c)
      e.fill();
    isNaN(o) || (l = a + (o % Ve || Ve));
  }
  return $a(e, t, r, n, l, i), e.fill(), l;
}
function Zx(e, t, r, n, i) {
  const { fullCircles: s, startAngle: a, circumference: o, options: l } = t, { borderWidth: c, borderJoinStyle: f, borderDash: h, borderDashOffset: u } = l, d = l.borderAlign === "inner";
  if (!c)
    return;
  e.setLineDash(h || []), e.lineDashOffset = u, d ? (e.lineWidth = c * 2, e.lineJoin = f || "round") : (e.lineWidth = c, e.lineJoin = f || "bevel");
  let p = t.endAngle;
  if (s) {
    $a(e, t, r, n, p, i);
    for (let g = 0; g < s; ++g)
      e.stroke();
    isNaN(o) || (p = a + (o % Ve || Ve));
  }
  d && Gx(e, t, p), s || ($a(e, t, r, n, p, i), e.stroke());
}
class yi extends yr {
  constructor(r) {
    super();
    ie(this, "circumference");
    ie(this, "endAngle");
    ie(this, "fullCircles");
    ie(this, "innerRadius");
    ie(this, "outerRadius");
    ie(this, "pixelMargin");
    ie(this, "startAngle");
    this.options = void 0, this.circumference = void 0, this.startAngle = void 0, this.endAngle = void 0, this.innerRadius = void 0, this.outerRadius = void 0, this.pixelMargin = 0, this.fullCircles = 0, r && Object.assign(this, r);
  }
  inRange(r, n, i) {
    const s = this.getProps([
      "x",
      "y"
    ], i), { angle: a, distance: o } = R0(s, {
      x: r,
      y: n
    }), { startAngle: l, endAngle: c, innerRadius: f, outerRadius: h, circumference: u } = this.getProps([
      "startAngle",
      "endAngle",
      "innerRadius",
      "outerRadius",
      "circumference"
    ], i), d = (this.options.spacing + this.options.borderWidth) / 2, g = xe(u, c - l) >= Ve || Es(a, l, c), m = Gr(o, f + d, h + d);
    return g && m;
  }
  getCenterPoint(r) {
    const { x: n, y: i, startAngle: s, endAngle: a, innerRadius: o, outerRadius: l } = this.getProps([
      "x",
      "y",
      "startAngle",
      "endAngle",
      "innerRadius",
      "outerRadius"
    ], r), { offset: c, spacing: f } = this.options, h = (s + a) / 2, u = (o + l + f + c) / 2;
    return {
      x: n + Math.cos(h) * u,
      y: i + Math.sin(h) * u
    };
  }
  tooltipPosition(r) {
    return this.getCenterPoint(r);
  }
  draw(r) {
    const { options: n, circumference: i } = this, s = (n.offset || 0) / 4, a = (n.spacing || 0) / 2, o = n.circular;
    if (this.pixelMargin = n.borderAlign === "inner" ? 0.33 : 0, this.fullCircles = i > Ve ? Math.floor(i / Ve) : 0, i === 0 || this.innerRadius < 0 || this.outerRadius < 0)
      return;
    r.save();
    const l = (this.startAngle + this.endAngle) / 2;
    r.translate(Math.cos(l) * s, Math.sin(l) * s);
    const c = 1 - Math.sin(Math.min(Ye, i || 0)), f = s * c;
    r.fillStyle = n.backgroundColor, r.strokeStyle = n.borderColor, qx(r, this, f, a, o), Zx(r, this, f, a, o), r.restore();
  }
}
ie(yi, "id", "arc"), ie(yi, "defaults", {
  borderAlign: "center",
  borderColor: "#fff",
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: void 0,
  borderRadius: 0,
  borderWidth: 2,
  offset: 0,
  spacing: 0,
  angle: void 0,
  circular: !0
}), ie(yi, "defaultRoutes", {
  backgroundColor: "backgroundColor"
}), ie(yi, "descriptors", {
  _scriptable: !0,
  _indexable: (r) => r !== "borderDash"
});
function du(e, t, r = t) {
  e.lineCap = xe(r.borderCapStyle, t.borderCapStyle), e.setLineDash(xe(r.borderDash, t.borderDash)), e.lineDashOffset = xe(r.borderDashOffset, t.borderDashOffset), e.lineJoin = xe(r.borderJoinStyle, t.borderJoinStyle), e.lineWidth = xe(r.borderWidth, t.borderWidth), e.strokeStyle = xe(r.borderColor, t.borderColor);
}
function Jx(e, t, r) {
  e.lineTo(r.x, r.y);
}
function Qx(e) {
  return e.stepped ? T1 : e.tension || e.cubicInterpolationMode === "monotone" ? S1 : Jx;
}
function gu(e, t, r = {}) {
  const n = e.length, { start: i = 0, end: s = n - 1 } = r, { start: a, end: o } = t, l = Math.max(i, a), c = Math.min(s, o), f = i < a && s < a || i > o && s > o;
  return {
    count: n,
    start: l,
    loop: t.loop,
    ilen: c < l && !f ? n + c - l : c - l
  };
}
function e_(e, t, r, n) {
  const { points: i, options: s } = t, { count: a, start: o, loop: l, ilen: c } = gu(i, r, n), f = Qx(s);
  let { move: h = !0, reverse: u } = n || {}, d, p, g;
  for (d = 0; d <= c; ++d)
    p = i[(o + (u ? c - d : d)) % a], !p.skip && (h ? (e.moveTo(p.x, p.y), h = !1) : f(e, g, p, u, s.stepped), g = p);
  return l && (p = i[(o + (u ? c : 0)) % a], f(e, g, p, u, s.stepped)), !!l;
}
function t_(e, t, r, n) {
  const i = t.points, { count: s, start: a, ilen: o } = gu(i, r, n), { move: l = !0, reverse: c } = n || {};
  let f = 0, h = 0, u, d, p, g, m, v;
  const w = (D) => (a + (c ? o - D : D)) % s, S = () => {
    g !== m && (e.lineTo(f, m), e.lineTo(f, g), e.lineTo(f, v));
  };
  for (l && (d = i[w(0)], e.moveTo(d.x, d.y)), u = 0; u <= o; ++u) {
    if (d = i[w(u)], d.skip)
      continue;
    const D = d.x, P = d.y, N = D | 0;
    N === p ? (P < g ? g = P : P > m && (m = P), f = (h * f + D) / ++h) : (S(), e.lineTo(D, P), p = N, h = 0, g = m = P), v = P;
  }
  S();
}
function kl(e) {
  const t = e.options, r = t.borderDash && t.borderDash.length;
  return !e._decimated && !e._loop && !t.tension && t.cubicInterpolationMode !== "monotone" && !t.stepped && !r ? t_ : e_;
}
function r_(e) {
  return e.stepped ? tm : e.tension || e.cubicInterpolationMode === "monotone" ? rm : Wn;
}
function n_(e, t, r, n) {
  let i = t._path;
  i || (i = t._path = new Path2D(), t.path(i, r, n) && i.closePath()), du(e, t.options), e.stroke(i);
}
function i_(e, t, r, n) {
  const { segments: i, options: s } = t, a = kl(t);
  for (const o of i)
    du(e, s, o.style), e.beginPath(), a(e, t, o, {
      start: r,
      end: r + n - 1
    }) && e.closePath(), e.stroke();
}
const s_ = typeof Path2D == "function";
function a_(e, t, r, n) {
  s_ && !t.options.segment ? n_(e, t, r, n) : i_(e, t, r, n);
}
class pn extends yr {
  constructor(t) {
    super(), this.animated = !0, this.options = void 0, this._chart = void 0, this._loop = void 0, this._fullLoop = void 0, this._path = void 0, this._points = void 0, this._segments = void 0, this._decimated = !1, this._pointsUpdated = !1, this._datasetIndex = void 0, t && Object.assign(this, t);
  }
  updateControlPoints(t, r) {
    const n = this.options;
    if ((n.tension || n.cubicInterpolationMode === "monotone") && !n.stepped && !this._pointsUpdated) {
      const i = n.spanGaps ? this._loop : this._fullLoop;
      G1(this._points, n, t, i, r), this._pointsUpdated = !0;
    }
  }
  set points(t) {
    this._points = t, delete this._segments, delete this._path, this._pointsUpdated = !1;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments || (this._segments = lm(this, this.options.segment));
  }
  first() {
    const t = this.segments, r = this.points;
    return t.length && r[t[0].start];
  }
  last() {
    const t = this.segments, r = this.points, n = t.length;
    return n && r[t[n - 1].end];
  }
  interpolate(t, r) {
    const n = this.options, i = t[r], s = this.points, a = eu(this, {
      property: r,
      start: i,
      end: i
    });
    if (!a.length)
      return;
    const o = [], l = r_(n);
    let c, f;
    for (c = 0, f = a.length; c < f; ++c) {
      const { start: h, end: u } = a[c], d = s[h], p = s[u];
      if (d === p) {
        o.push(d);
        continue;
      }
      const g = Math.abs((i - d[r]) / (p[r] - d[r])), m = l(d, p, g, n.stepped);
      m[r] = t[r], o.push(m);
    }
    return o.length === 1 ? o[0] : o;
  }
  pathSegment(t, r, n) {
    return kl(this)(t, this, r, n);
  }
  path(t, r, n) {
    const i = this.segments, s = kl(this);
    let a = this._loop;
    r = r || 0, n = n || this.points.length - r;
    for (const o of i)
      a &= s(t, this, o, {
        start: r,
        end: r + n - 1
      });
    return !!a;
  }
  draw(t, r, n, i) {
    const s = this.options || {};
    (this.points || []).length && s.borderWidth && (t.save(), a_(t, this, n, i), t.restore()), this.animated && (this._pointsUpdated = !1, this._path = void 0);
  }
}
ie(pn, "id", "line"), ie(pn, "defaults", {
  borderCapStyle: "butt",
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: "miter",
  borderWidth: 3,
  capBezierPoints: !0,
  cubicInterpolationMode: "default",
  fill: !1,
  spanGaps: !1,
  stepped: !1,
  tension: 0
}), ie(pn, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
}), ie(pn, "descriptors", {
  _scriptable: !0,
  _indexable: (t) => t !== "borderDash" && t !== "fill"
});
function lh(e, t, r, n) {
  const i = e.options, { [r]: s } = e.getProps([
    r
  ], n);
  return Math.abs(t - s) < i.radius + i.hitRadius;
}
class hs extends yr {
  constructor(r) {
    super();
    ie(this, "parsed");
    ie(this, "skip");
    ie(this, "stop");
    this.options = void 0, this.parsed = void 0, this.skip = void 0, this.stop = void 0, r && Object.assign(this, r);
  }
  inRange(r, n, i) {
    const s = this.options, { x: a, y: o } = this.getProps([
      "x",
      "y"
    ], i);
    return Math.pow(r - a, 2) + Math.pow(n - o, 2) < Math.pow(s.hitRadius + s.radius, 2);
  }
  inXRange(r, n) {
    return lh(this, r, "x", n);
  }
  inYRange(r, n) {
    return lh(this, r, "y", n);
  }
  getCenterPoint(r) {
    const { x: n, y: i } = this.getProps([
      "x",
      "y"
    ], r);
    return {
      x: n,
      y: i
    };
  }
  size(r) {
    r = r || this.options || {};
    let n = r.radius || 0;
    n = Math.max(n, n && r.hoverRadius || 0);
    const i = n && r.borderWidth || 0;
    return (n + i) * 2;
  }
  draw(r, n) {
    const i = this.options;
    this.skip || i.radius < 0.1 || !Kr(this, n, this.size(i) / 2) || (r.strokeStyle = i.borderColor, r.lineWidth = i.borderWidth, r.fillStyle = i.backgroundColor, Sl(r, i, this.x, this.y));
  }
  getRange() {
    const r = this.options || {};
    return r.radius + r.hitRadius;
  }
}
ie(hs, "id", "point"), /**
* @type {any}
*/
ie(hs, "defaults", {
  borderWidth: 1,
  hitRadius: 1,
  hoverBorderWidth: 1,
  hoverRadius: 4,
  pointStyle: "circle",
  radius: 3,
  rotation: 0
}), /**
* @type {any}
*/
ie(hs, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
});
function pu(e, t) {
  const { x: r, y: n, base: i, width: s, height: a } = e.getProps([
    "x",
    "y",
    "base",
    "width",
    "height"
  ], t);
  let o, l, c, f, h;
  return e.horizontal ? (h = a / 2, o = Math.min(r, i), l = Math.max(r, i), c = n - h, f = n + h) : (h = s / 2, o = r - h, l = r + h, c = Math.min(n, i), f = Math.max(n, i)), {
    left: o,
    top: c,
    right: l,
    bottom: f
  };
}
function mn(e, t, r, n) {
  return e ? 0 : xt(t, r, n);
}
function o_(e, t, r) {
  const n = e.options.borderWidth, i = e.borderSkipped, s = V0(n);
  return {
    t: mn(i.top, s.top, 0, r),
    r: mn(i.right, s.right, 0, t),
    b: mn(i.bottom, s.bottom, 0, r),
    l: mn(i.left, s.left, 0, t)
  };
}
function l_(e, t, r) {
  const { enableBorderRadius: n } = e.getProps([
    "enableBorderRadius"
  ]), i = e.options.borderRadius, s = Yn(i), a = Math.min(t, r), o = e.borderSkipped, l = n || be(i);
  return {
    topLeft: mn(!l || o.top || o.left, s.topLeft, 0, a),
    topRight: mn(!l || o.top || o.right, s.topRight, 0, a),
    bottomLeft: mn(!l || o.bottom || o.left, s.bottomLeft, 0, a),
    bottomRight: mn(!l || o.bottom || o.right, s.bottomRight, 0, a)
  };
}
function c_(e) {
  const t = pu(e), r = t.right - t.left, n = t.bottom - t.top, i = o_(e, r / 2, n / 2), s = l_(e, r / 2, n / 2);
  return {
    outer: {
      x: t.left,
      y: t.top,
      w: r,
      h: n,
      radius: s
    },
    inner: {
      x: t.left + i.l,
      y: t.top + i.t,
      w: r - i.l - i.r,
      h: n - i.t - i.b,
      radius: {
        topLeft: Math.max(0, s.topLeft - Math.max(i.t, i.l)),
        topRight: Math.max(0, s.topRight - Math.max(i.t, i.r)),
        bottomLeft: Math.max(0, s.bottomLeft - Math.max(i.b, i.l)),
        bottomRight: Math.max(0, s.bottomRight - Math.max(i.b, i.r))
      }
    }
  };
}
function nl(e, t, r, n) {
  const i = t === null, s = r === null, o = e && !(i && s) && pu(e, n);
  return o && (i || Gr(t, o.left, o.right)) && (s || Gr(r, o.top, o.bottom));
}
function f_(e) {
  return e.topLeft || e.topRight || e.bottomLeft || e.bottomRight;
}
function h_(e, t) {
  e.rect(t.x, t.y, t.w, t.h);
}
function il(e, t, r = {}) {
  const n = e.x !== r.x ? -t : 0, i = e.y !== r.y ? -t : 0, s = (e.x + e.w !== r.x + r.w ? t : 0) - n, a = (e.y + e.h !== r.y + r.h ? t : 0) - i;
  return {
    x: e.x + n,
    y: e.y + i,
    w: e.w + s,
    h: e.h + a,
    radius: e.radius
  };
}
class us extends yr {
  constructor(t) {
    super(), this.options = void 0, this.horizontal = void 0, this.base = void 0, this.width = void 0, this.height = void 0, this.inflateAmount = void 0, t && Object.assign(this, t);
  }
  draw(t) {
    const { inflateAmount: r, options: { borderColor: n, backgroundColor: i } } = this, { inner: s, outer: a } = c_(this), o = f_(a.radius) ? As : h_;
    t.save(), (a.w !== s.w || a.h !== s.h) && (t.beginPath(), o(t, il(a, r, s)), t.clip(), o(t, il(s, -r, a)), t.fillStyle = n, t.fill("evenodd")), t.beginPath(), o(t, il(s, r)), t.fillStyle = i, t.fill(), t.restore();
  }
  inRange(t, r, n) {
    return nl(this, t, r, n);
  }
  inXRange(t, r) {
    return nl(this, t, null, r);
  }
  inYRange(t, r) {
    return nl(this, null, t, r);
  }
  getCenterPoint(t) {
    const { x: r, y: n, base: i, horizontal: s } = this.getProps([
      "x",
      "y",
      "base",
      "horizontal"
    ], t);
    return {
      x: s ? (r + i) / 2 : r,
      y: s ? n : (n + i) / 2
    };
  }
  getRange(t) {
    return t === "x" ? this.width / 2 : this.height / 2;
  }
}
ie(us, "id", "bar"), ie(us, "defaults", {
  borderSkipped: "start",
  borderWidth: 0,
  borderRadius: 0,
  inflateAmount: "auto",
  pointStyle: void 0
}), ie(us, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
});
var u_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ArcElement: yi,
  BarElement: us,
  LineElement: pn,
  PointElement: hs
});
const Ol = [
  "rgb(54, 162, 235)",
  "rgb(255, 99, 132)",
  "rgb(255, 159, 64)",
  "rgb(255, 205, 86)",
  "rgb(75, 192, 192)",
  "rgb(153, 102, 255)",
  "rgb(201, 203, 207)"
  // grey
], ch = /* @__PURE__ */ Ol.map((e) => e.replace("rgb(", "rgba(").replace(")", ", 0.5)"));
function mu(e) {
  return Ol[e % Ol.length];
}
function xu(e) {
  return ch[e % ch.length];
}
function d_(e, t) {
  return e.borderColor = mu(t), e.backgroundColor = xu(t), ++t;
}
function g_(e, t) {
  return e.backgroundColor = e.data.map(() => mu(t++)), t;
}
function p_(e, t) {
  return e.backgroundColor = e.data.map(() => xu(t++)), t;
}
function m_(e) {
  let t = 0;
  return (r, n) => {
    const i = e.getDatasetMeta(n).controller;
    i instanceof Hn ? t = g_(r, t) : i instanceof fs ? t = p_(r, t) : i && (t = d_(r, t));
  };
}
function fh(e) {
  let t;
  for (t in e)
    if (e[t].borderColor || e[t].backgroundColor)
      return !0;
  return !1;
}
function x_(e) {
  return e && (e.borderColor || e.backgroundColor);
}
var __ = {
  id: "colors",
  defaults: {
    enabled: !0,
    forceOverride: !1
  },
  beforeLayout(e, t, r) {
    if (!r.enabled)
      return;
    const { data: { datasets: n }, options: i } = e.config, { elements: s } = i;
    if (!r.forceOverride && (fh(n) || x_(i) || s && fh(s)))
      return;
    const a = m_(e);
    n.forEach(a);
  }
};
function v_(e, t, r, n, i) {
  const s = i.samples || n;
  if (s >= r)
    return e.slice(t, t + r);
  const a = [], o = (r - 2) / (s - 2);
  let l = 0;
  const c = t + r - 1;
  let f = t, h, u, d, p, g;
  for (a[l++] = e[f], h = 0; h < s - 2; h++) {
    let m = 0, v = 0, w;
    const S = Math.floor((h + 1) * o) + 1 + t, D = Math.min(Math.floor((h + 2) * o) + 1, r) + t, P = D - S;
    for (w = S; w < D; w++)
      m += e[w].x, v += e[w].y;
    m /= P, v /= P;
    const N = Math.floor(h * o) + 1 + t, O = Math.min(Math.floor((h + 1) * o) + 1, r) + t, { x: I, y: R } = e[f];
    for (d = p = -1, w = N; w < O; w++)
      p = 0.5 * Math.abs((I - m) * (e[w].y - R) - (I - e[w].x) * (v - R)), p > d && (d = p, u = e[w], g = w);
    a[l++] = u, f = g;
  }
  return a[l++] = e[c], a;
}
function y_(e, t, r, n) {
  let i = 0, s = 0, a, o, l, c, f, h, u, d, p, g;
  const m = [], v = t + r - 1, w = e[t].x, D = e[v].x - w;
  for (a = t; a < t + r; ++a) {
    o = e[a], l = (o.x - w) / D * n, c = o.y;
    const P = l | 0;
    if (P === f)
      c < p ? (p = c, h = a) : c > g && (g = c, u = a), i = (s * i + o.x) / ++s;
    else {
      const N = a - 1;
      if (!Te(h) && !Te(u)) {
        const O = Math.min(h, u), I = Math.max(h, u);
        O !== d && O !== N && m.push({
          ...e[O],
          x: i
        }), I !== d && I !== N && m.push({
          ...e[I],
          x: i
        });
      }
      a > 0 && N !== d && m.push(e[N]), m.push(o), f = P, s = 0, p = g = c, h = u = d = a;
    }
  }
  return m;
}
function _u(e) {
  if (e._decimated) {
    const t = e._data;
    delete e._decimated, delete e._data, Object.defineProperty(e, "data", {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: t
    });
  }
}
function hh(e) {
  e.data.datasets.forEach((t) => {
    _u(t);
  });
}
function w_(e, t) {
  const r = t.length;
  let n = 0, i;
  const { iScale: s } = e, { min: a, max: o, minDefined: l, maxDefined: c } = s.getUserBounds();
  return l && (n = xt(Xr(t, s.axis, a).lo, 0, r - 1)), c ? i = xt(Xr(t, s.axis, o).hi + 1, n, r) - n : i = r - n, {
    start: n,
    count: i
  };
}
var T_ = {
  id: "decimation",
  defaults: {
    algorithm: "min-max",
    enabled: !1
  },
  beforeElementsUpdate: (e, t, r) => {
    if (!r.enabled) {
      hh(e);
      return;
    }
    const n = e.width;
    e.data.datasets.forEach((i, s) => {
      const { _data: a, indexAxis: o } = i, l = e.getDatasetMeta(s), c = a || i.data;
      if (ze([
        o,
        e.options.indexAxis
      ]) === "y" || !l.controller.supportsDecimation)
        return;
      const f = e.scales[l.xAxisID];
      if (f.type !== "linear" && f.type !== "time" || e.options.parsing)
        return;
      let { start: h, count: u } = w_(l, c);
      const d = r.threshold || 4 * n;
      if (u <= d) {
        _u(i);
        return;
      }
      Te(a) && (i._data = c, delete i.data, Object.defineProperty(i, "data", {
        configurable: !0,
        enumerable: !0,
        get: function() {
          return this._decimated;
        },
        set: function(g) {
          this._data = g;
        }
      }));
      let p;
      switch (r.algorithm) {
        case "lttb":
          p = v_(c, h, u, n, r);
          break;
        case "min-max":
          p = y_(c, h, u, n);
          break;
        default:
          throw new Error(`Unsupported decimation algorithm '${r.algorithm}'`);
      }
      i._decimated = p;
    });
  },
  destroy(e) {
    hh(e);
  }
};
function S_(e, t, r) {
  const n = e.segments, i = e.points, s = t.points, a = [];
  for (const o of n) {
    let { start: l, end: c } = o;
    c = fc(l, c, i);
    const f = Dl(r, i[l], i[c], o.loop);
    if (!t.segments) {
      a.push({
        source: o,
        target: f,
        start: i[l],
        end: i[c]
      });
      continue;
    }
    const h = eu(t, f);
    for (const u of h) {
      const d = Dl(r, s[u.start], s[u.end], u.loop), p = Q0(o, i, d);
      for (const g of p)
        a.push({
          source: g,
          target: u,
          start: {
            [r]: uh(f, d, "start", Math.max)
          },
          end: {
            [r]: uh(f, d, "end", Math.min)
          }
        });
    }
  }
  return a;
}
function Dl(e, t, r, n) {
  if (n)
    return;
  let i = t[e], s = r[e];
  return e === "angle" && (i = qt(i), s = qt(s)), {
    property: e,
    start: i,
    end: s
  };
}
function b_(e, t) {
  const { x: r = null, y: n = null } = e || {}, i = t.points, s = [];
  return t.segments.forEach(({ start: a, end: o }) => {
    o = fc(a, o, i);
    const l = i[a], c = i[o];
    n !== null ? (s.push({
      x: l.x,
      y: n
    }), s.push({
      x: c.x,
      y: n
    })) : r !== null && (s.push({
      x: r,
      y: l.y
    }), s.push({
      x: r,
      y: c.y
    }));
  }), s;
}
function fc(e, t, r) {
  for (; t > e; t--) {
    const n = r[t];
    if (!isNaN(n.x) && !isNaN(n.y))
      break;
  }
  return t;
}
function uh(e, t, r, n) {
  return e && t ? n(e[r], t[r]) : e ? e[r] : t ? t[r] : 0;
}
function vu(e, t) {
  let r = [], n = !1;
  return He(e) ? (n = !0, r = e) : r = b_(e, t), r.length ? new pn({
    points: r,
    options: {
      tension: 0
    },
    _loop: n,
    _fullLoop: n
  }) : null;
}
function dh(e) {
  return e && e.fill !== !1;
}
function E_(e, t, r) {
  let i = e[t].fill;
  const s = [
    t
  ];
  let a;
  if (!r)
    return i;
  for (; i !== !1 && s.indexOf(i) === -1; ) {
    if (!nt(i))
      return i;
    if (a = e[i], !a)
      return !1;
    if (a.visible)
      return i;
    s.push(i), i = a.fill;
  }
  return !1;
}
function A_(e, t, r) {
  const n = F_(e);
  if (be(n))
    return isNaN(n.value) ? !1 : n;
  let i = parseFloat(n);
  return nt(i) && Math.floor(i) === i ? k_(n[0], t, i, r) : [
    "origin",
    "start",
    "end",
    "stack",
    "shape"
  ].indexOf(n) >= 0 && n;
}
function k_(e, t, r, n) {
  return (e === "-" || e === "+") && (r = t + r), r === t || r < 0 || r >= n ? !1 : r;
}
function O_(e, t) {
  let r = null;
  return e === "start" ? r = t.bottom : e === "end" ? r = t.top : be(e) ? r = t.getPixelForValue(e.value) : t.getBasePixel && (r = t.getBasePixel()), r;
}
function D_(e, t, r) {
  let n;
  return e === "start" ? n = r : e === "end" ? n = t.options.reverse ? t.min : t.max : be(e) ? n = e.value : n = t.getBaseValue(), n;
}
function F_(e) {
  const t = e.options, r = t.fill;
  let n = xe(r && r.target, r);
  return n === void 0 && (n = !!t.backgroundColor), n === !1 || n === null ? !1 : n === !0 ? "origin" : n;
}
function C_(e) {
  const { scale: t, index: r, line: n } = e, i = [], s = n.segments, a = n.points, o = M_(t, r);
  o.push(vu({
    x: null,
    y: t.bottom
  }, n));
  for (let l = 0; l < s.length; l++) {
    const c = s[l];
    for (let f = c.start; f <= c.end; f++)
      P_(i, a[f], o);
  }
  return new pn({
    points: i,
    options: {}
  });
}
function M_(e, t) {
  const r = [], n = e.getMatchingVisibleMetas("line");
  for (let i = 0; i < n.length; i++) {
    const s = n[i];
    if (s.index === t)
      break;
    s.hidden || r.unshift(s.dataset);
  }
  return r;
}
function P_(e, t, r) {
  const n = [];
  for (let i = 0; i < r.length; i++) {
    const s = r[i], { first: a, last: o, point: l } = R_(s, t, "x");
    if (!(!l || a && o)) {
      if (a)
        n.unshift(l);
      else if (e.push(l), !o)
        break;
    }
  }
  e.push(...n);
}
function R_(e, t, r) {
  const n = e.interpolate(t, r);
  if (!n)
    return {};
  const i = n[r], s = e.segments, a = e.points;
  let o = !1, l = !1;
  for (let c = 0; c < s.length; c++) {
    const f = s[c], h = a[f.start][r], u = a[f.end][r];
    if (Gr(i, h, u)) {
      o = i === h, l = i === u;
      break;
    }
  }
  return {
    first: o,
    last: l,
    point: n
  };
}
class yu {
  constructor(t) {
    this.x = t.x, this.y = t.y, this.radius = t.radius;
  }
  pathSegment(t, r, n) {
    const { x: i, y: s, radius: a } = this;
    return r = r || {
      start: 0,
      end: Ve
    }, t.arc(i, s, a, r.end, r.start, !0), !n.bounds;
  }
  interpolate(t) {
    const { x: r, y: n, radius: i } = this, s = t.angle;
    return {
      x: r + Math.cos(s) * i,
      y: n + Math.sin(s) * i,
      angle: s
    };
  }
}
function I_(e) {
  const { chart: t, fill: r, line: n } = e;
  if (nt(r))
    return L_(t, r);
  if (r === "stack")
    return C_(e);
  if (r === "shape")
    return !0;
  const i = N_(e);
  return i instanceof yu ? i : vu(i, n);
}
function L_(e, t) {
  const r = e.getDatasetMeta(t);
  return r && e.isDatasetVisible(t) ? r.dataset : null;
}
function N_(e) {
  return (e.scale || {}).getPointPositionForValue ? W_(e) : B_(e);
}
function B_(e) {
  const { scale: t = {}, fill: r } = e, n = O_(r, t);
  if (nt(n)) {
    const i = t.isHorizontal();
    return {
      x: i ? n : null,
      y: i ? null : n
    };
  }
  return null;
}
function W_(e) {
  const { scale: t, fill: r } = e, n = t.options, i = t.getLabels().length, s = n.reverse ? t.max : t.min, a = D_(r, t, s), o = [];
  if (n.grid.circular) {
    const l = t.getPointPositionForValue(0, s);
    return new yu({
      x: l.x,
      y: l.y,
      radius: t.getDistanceFromCenterForValue(a)
    });
  }
  for (let l = 0; l < i; ++l)
    o.push(t.getPointPositionForValue(l, a));
  return o;
}
function sl(e, t, r) {
  const n = I_(t), { line: i, scale: s, axis: a } = t, o = i.options, l = o.fill, c = o.backgroundColor, { above: f = c, below: h = c } = l || {};
  n && i.points.length && (xo(e, r), U_(e, {
    line: i,
    target: n,
    above: f,
    below: h,
    area: r,
    scale: s,
    axis: a
  }), _o(e));
}
function U_(e, t) {
  const { line: r, target: n, above: i, below: s, area: a, scale: o } = t, l = r._loop ? "angle" : t.axis;
  e.save(), l === "x" && s !== i && (gh(e, n, a.top), ph(e, {
    line: r,
    target: n,
    color: i,
    scale: o,
    property: l
  }), e.restore(), e.save(), gh(e, n, a.bottom)), ph(e, {
    line: r,
    target: n,
    color: s,
    scale: o,
    property: l
  }), e.restore();
}
function gh(e, t, r) {
  const { segments: n, points: i } = t;
  let s = !0, a = !1;
  e.beginPath();
  for (const o of n) {
    const { start: l, end: c } = o, f = i[l], h = i[fc(l, c, i)];
    s ? (e.moveTo(f.x, f.y), s = !1) : (e.lineTo(f.x, r), e.lineTo(f.x, f.y)), a = !!t.pathSegment(e, o, {
      move: a
    }), a ? e.closePath() : e.lineTo(h.x, r);
  }
  e.lineTo(t.first().x, r), e.closePath(), e.clip();
}
function ph(e, t) {
  const { line: r, target: n, property: i, color: s, scale: a } = t, o = S_(r, n, i);
  for (const { source: l, target: c, start: f, end: h } of o) {
    const { style: { backgroundColor: u = s } = {} } = l, d = n !== !0;
    e.save(), e.fillStyle = u, z_(e, a, d && Dl(i, f, h)), e.beginPath();
    const p = !!r.pathSegment(e, l);
    let g;
    if (d) {
      p ? e.closePath() : mh(e, n, h, i);
      const m = !!n.pathSegment(e, c, {
        move: p,
        reverse: !0
      });
      g = p && m, g || mh(e, n, f, i);
    }
    e.closePath(), e.fill(g ? "evenodd" : "nonzero"), e.restore();
  }
}
function z_(e, t, r) {
  const { top: n, bottom: i } = t.chart.chartArea, { property: s, start: a, end: o } = r || {};
  s === "x" && (e.beginPath(), e.rect(a, n, o - a, i - n), e.clip());
}
function mh(e, t, r, n) {
  const i = t.interpolate(r, n);
  i && e.lineTo(i.x, i.y);
}
var H_ = {
  id: "filler",
  afterDatasetsUpdate(e, t, r) {
    const n = (e.data.datasets || []).length, i = [];
    let s, a, o, l;
    for (a = 0; a < n; ++a)
      s = e.getDatasetMeta(a), o = s.dataset, l = null, o && o.options && o instanceof pn && (l = {
        visible: e.isDatasetVisible(a),
        index: a,
        fill: A_(o, a, n),
        chart: e,
        axis: s.controller.options.indexAxis,
        scale: s.vScale,
        line: o
      }), s.$filler = l, i.push(l);
    for (a = 0; a < n; ++a)
      l = i[a], !(!l || l.fill === !1) && (l.fill = E_(i, a, r.propagate));
  },
  beforeDraw(e, t, r) {
    const n = r.drawTime === "beforeDraw", i = e.getSortedVisibleDatasetMetas(), s = e.chartArea;
    for (let a = i.length - 1; a >= 0; --a) {
      const o = i[a].$filler;
      o && (o.line.updateControlPoints(s, o.axis), n && o.fill && sl(e.ctx, o, s));
    }
  },
  beforeDatasetsDraw(e, t, r) {
    if (r.drawTime !== "beforeDatasetsDraw")
      return;
    const n = e.getSortedVisibleDatasetMetas();
    for (let i = n.length - 1; i >= 0; --i) {
      const s = n[i].$filler;
      dh(s) && sl(e.ctx, s, e.chartArea);
    }
  },
  beforeDatasetDraw(e, t, r) {
    const n = t.meta.$filler;
    !dh(n) || r.drawTime !== "beforeDatasetDraw" || sl(e.ctx, n, e.chartArea);
  },
  defaults: {
    propagate: !0,
    drawTime: "beforeDatasetDraw"
  }
};
const xh = (e, t) => {
  let { boxHeight: r = t, boxWidth: n = t } = e;
  return e.usePointStyle && (r = Math.min(r, t), n = e.pointStyleWidth || Math.min(n, t)), {
    boxWidth: n,
    boxHeight: r,
    itemHeight: Math.max(t, r)
  };
}, V_ = (e, t) => e !== null && t !== null && e.datasetIndex === t.datasetIndex && e.index === t.index;
class _h extends yr {
  constructor(t) {
    super(), this._added = !1, this.legendHitBoxes = [], this._hoveredItem = null, this.doughnutMode = !1, this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this.legendItems = void 0, this.columnSizes = void 0, this.lineWidths = void 0, this.maxHeight = void 0, this.maxWidth = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.height = void 0, this.width = void 0, this._margins = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0;
  }
  update(t, r, n) {
    this.maxWidth = t, this.maxHeight = r, this._margins = n, this.setDimensions(), this.buildLabels(), this.fit();
  }
  setDimensions() {
    this.isHorizontal() ? (this.width = this.maxWidth, this.left = this._margins.left, this.right = this.width) : (this.height = this.maxHeight, this.top = this._margins.top, this.bottom = this.height);
  }
  buildLabels() {
    const t = this.options.labels || {};
    let r = Ne(t.generateLabels, [
      this.chart
    ], this) || [];
    t.filter && (r = r.filter((n) => t.filter(n, this.chart.data))), t.sort && (r = r.sort((n, i) => t.sort(n, i, this.chart.data))), this.options.reverse && r.reverse(), this.legendItems = r;
  }
  fit() {
    const { options: t, ctx: r } = this;
    if (!t.display) {
      this.width = this.height = 0;
      return;
    }
    const n = t.labels, i = ft(n.font), s = i.size, a = this._computeTitleHeight(), { boxWidth: o, itemHeight: l } = xh(n, s);
    let c, f;
    r.font = i.string, this.isHorizontal() ? (c = this.maxWidth, f = this._fitRows(a, s, o, l) + 10) : (f = this.maxHeight, c = this._fitCols(a, i, o, l) + 10), this.width = Math.min(c, t.maxWidth || this.maxWidth), this.height = Math.min(f, t.maxHeight || this.maxHeight);
  }
  _fitRows(t, r, n, i) {
    const { ctx: s, maxWidth: a, options: { labels: { padding: o } } } = this, l = this.legendHitBoxes = [], c = this.lineWidths = [
      0
    ], f = i + o;
    let h = t;
    s.textAlign = "left", s.textBaseline = "middle";
    let u = -1, d = -f;
    return this.legendItems.forEach((p, g) => {
      const m = n + r / 2 + s.measureText(p.text).width;
      (g === 0 || c[c.length - 1] + m + 2 * o > a) && (h += f, c[c.length - (g > 0 ? 0 : 1)] = 0, d += f, u++), l[g] = {
        left: 0,
        top: d,
        row: u,
        width: m,
        height: i
      }, c[c.length - 1] += m + o;
    }), h;
  }
  _fitCols(t, r, n, i) {
    const { ctx: s, maxHeight: a, options: { labels: { padding: o } } } = this, l = this.legendHitBoxes = [], c = this.columnSizes = [], f = a - t;
    let h = o, u = 0, d = 0, p = 0, g = 0;
    return this.legendItems.forEach((m, v) => {
      const { itemWidth: w, itemHeight: S } = Y_(n, r, s, m, i);
      v > 0 && d + S + 2 * o > f && (h += u + o, c.push({
        width: u,
        height: d
      }), p += u + o, g++, u = d = 0), l[v] = {
        left: p,
        top: d,
        col: g,
        width: w,
        height: S
      }, u = Math.max(u, w), d += S + o;
    }), h += u, c.push({
      width: u,
      height: d
    }), h;
  }
  adjustHitBoxes() {
    if (!this.options.display)
      return;
    const t = this._computeTitleHeight(), { legendHitBoxes: r, options: { align: n, labels: { padding: i }, rtl: s } } = this, a = Si(s, this.left, this.width);
    if (this.isHorizontal()) {
      let o = 0, l = Ot(n, this.left + i, this.right - this.lineWidths[o]);
      for (const c of r)
        o !== c.row && (o = c.row, l = Ot(n, this.left + i, this.right - this.lineWidths[o])), c.top += this.top + t + i, c.left = a.leftForLtr(a.x(l), c.width), l += c.width + i;
    } else {
      let o = 0, l = Ot(n, this.top + t + i, this.bottom - this.columnSizes[o].height);
      for (const c of r)
        c.col !== o && (o = c.col, l = Ot(n, this.top + t + i, this.bottom - this.columnSizes[o].height)), c.top = l, c.left += this.left + i, c.left = a.leftForLtr(a.x(c.left), c.width), l += c.height + i;
    }
  }
  isHorizontal() {
    return this.options.position === "top" || this.options.position === "bottom";
  }
  draw() {
    if (this.options.display) {
      const t = this.ctx;
      xo(t, this), this._draw(), _o(t);
    }
  }
  _draw() {
    const { options: t, columnSizes: r, lineWidths: n, ctx: i } = this, { align: s, labels: a } = t, o = Qe.color, l = Si(t.rtl, this.left, this.width), c = ft(a.font), { padding: f } = a, h = c.size, u = h / 2;
    let d;
    this.drawTitle(), i.textAlign = l.textAlign("left"), i.textBaseline = "middle", i.lineWidth = 0.5, i.font = c.string;
    const { boxWidth: p, boxHeight: g, itemHeight: m } = xh(a, h), v = function(N, O, I) {
      if (isNaN(p) || p <= 0 || isNaN(g) || g < 0)
        return;
      i.save();
      const R = xe(I.lineWidth, 1);
      if (i.fillStyle = xe(I.fillStyle, o), i.lineCap = xe(I.lineCap, "butt"), i.lineDashOffset = xe(I.lineDashOffset, 0), i.lineJoin = xe(I.lineJoin, "miter"), i.lineWidth = R, i.strokeStyle = xe(I.strokeStyle, o), i.setLineDash(xe(I.lineDash, [])), a.usePointStyle) {
        const z = {
          radius: g * Math.SQRT2 / 2,
          pointStyle: I.pointStyle,
          rotation: I.rotation,
          borderWidth: R
        }, H = l.xPlus(N, p / 2), V = O + u;
        H0(i, z, H, V, a.pointStyleWidth && p);
      } else {
        const z = O + Math.max((h - g) / 2, 0), H = l.leftForLtr(N, p), V = Yn(I.borderRadius);
        i.beginPath(), Object.values(V).some((ee) => ee !== 0) ? As(i, {
          x: H,
          y: z,
          w: p,
          h: g,
          radius: V
        }) : i.rect(H, z, p, g), i.fill(), R !== 0 && i.stroke();
      }
      i.restore();
    }, w = function(N, O, I) {
      Kn(i, I.text, N, O + m / 2, c, {
        strikethrough: I.hidden,
        textAlign: l.textAlign(I.textAlign)
      });
    }, S = this.isHorizontal(), D = this._computeTitleHeight();
    S ? d = {
      x: Ot(s, this.left + f, this.right - n[0]),
      y: this.top + f + D,
      line: 0
    } : d = {
      x: this.left + f,
      y: Ot(s, this.top + D + f, this.bottom - r[0].height),
      line: 0
    }, q0(this.ctx, t.textDirection);
    const P = m + f;
    this.legendItems.forEach((N, O) => {
      i.strokeStyle = N.fontColor, i.fillStyle = N.fontColor;
      const I = i.measureText(N.text).width, R = l.textAlign(N.textAlign || (N.textAlign = a.textAlign)), z = p + u + I;
      let H = d.x, V = d.y;
      l.setWidth(this.width), S ? O > 0 && H + z + f > this.right && (V = d.y += P, d.line++, H = d.x = Ot(s, this.left + f, this.right - n[d.line])) : O > 0 && V + P > this.bottom && (H = d.x = H + r[d.line].width + f, d.line++, V = d.y = Ot(s, this.top + D + f, this.bottom - r[d.line].height));
      const ee = l.x(H);
      if (v(ee, V, N), H = h1(R, H + p + u, S ? H + z : this.right, t.rtl), w(l.x(H), V, N), S)
        d.x += z + f;
      else if (typeof N.text != "string") {
        const ge = c.lineHeight;
        d.y += wu(N, ge) + f;
      } else
        d.y += P;
    }), Z0(this.ctx, t.textDirection);
  }
  drawTitle() {
    const t = this.options, r = t.title, n = ft(r.font), i = Et(r.padding);
    if (!r.display)
      return;
    const s = Si(t.rtl, this.left, this.width), a = this.ctx, o = r.position, l = n.size / 2, c = i.top + l;
    let f, h = this.left, u = this.width;
    if (this.isHorizontal())
      u = Math.max(...this.lineWidths), f = this.top + c, h = Ot(t.align, h, this.right - u);
    else {
      const p = this.columnSizes.reduce((g, m) => Math.max(g, m.height), 0);
      f = c + Ot(t.align, this.top, this.bottom - p - t.labels.padding - this._computeTitleHeight());
    }
    const d = Ot(o, h, h + u);
    a.textAlign = s.textAlign(tc(o)), a.textBaseline = "middle", a.strokeStyle = r.color, a.fillStyle = r.color, a.font = n.string, Kn(a, r.text, d, f, n);
  }
  _computeTitleHeight() {
    const t = this.options.title, r = ft(t.font), n = Et(t.padding);
    return t.display ? r.lineHeight + n.height : 0;
  }
  _getLegendItemAt(t, r) {
    let n, i, s;
    if (Gr(t, this.left, this.right) && Gr(r, this.top, this.bottom)) {
      for (s = this.legendHitBoxes, n = 0; n < s.length; ++n)
        if (i = s[n], Gr(t, i.left, i.left + i.width) && Gr(r, i.top, i.top + i.height))
          return this.legendItems[n];
    }
    return null;
  }
  handleEvent(t) {
    const r = this.options;
    if (!G_(t.type, r))
      return;
    const n = this._getLegendItemAt(t.x, t.y);
    if (t.type === "mousemove" || t.type === "mouseout") {
      const i = this._hoveredItem, s = V_(i, n);
      i && !s && Ne(r.onLeave, [
        t,
        i,
        this
      ], this), this._hoveredItem = n, n && !s && Ne(r.onHover, [
        t,
        n,
        this
      ], this);
    } else
      n && Ne(r.onClick, [
        t,
        n,
        this
      ], this);
  }
}
function Y_(e, t, r, n, i) {
  const s = j_(n, e, t, r), a = $_(i, n, t.lineHeight);
  return {
    itemWidth: s,
    itemHeight: a
  };
}
function j_(e, t, r, n) {
  let i = e.text;
  return i && typeof i != "string" && (i = i.reduce((s, a) => s.length > a.length ? s : a)), t + r.size / 2 + n.measureText(i).width;
}
function $_(e, t, r) {
  let n = e;
  return typeof t.text != "string" && (n = wu(t, r)), n;
}
function wu(e, t) {
  const r = e.text ? e.text.length : 0;
  return t * r;
}
function G_(e, t) {
  return !!((e === "mousemove" || e === "mouseout") && (t.onHover || t.onLeave) || t.onClick && (e === "click" || e === "mouseup"));
}
var X_ = {
  id: "legend",
  _element: _h,
  start(e, t, r) {
    const n = e.legend = new _h({
      ctx: e.ctx,
      options: r,
      chart: e
    });
    Ft.configure(e, n, r), Ft.addBox(e, n);
  },
  stop(e) {
    Ft.removeBox(e, e.legend), delete e.legend;
  },
  beforeUpdate(e, t, r) {
    const n = e.legend;
    Ft.configure(e, n, r), n.options = r;
  },
  afterUpdate(e) {
    const t = e.legend;
    t.buildLabels(), t.adjustHitBoxes();
  },
  afterEvent(e, t) {
    t.replay || e.legend.handleEvent(t.event);
  },
  defaults: {
    display: !0,
    position: "top",
    align: "center",
    fullSize: !0,
    reverse: !1,
    weight: 1e3,
    onClick(e, t, r) {
      const n = t.datasetIndex, i = r.chart;
      i.isDatasetVisible(n) ? (i.hide(n), t.hidden = !0) : (i.show(n), t.hidden = !1);
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: (e) => e.chart.options.color,
      boxWidth: 40,
      padding: 10,
      generateLabels(e) {
        const t = e.data.datasets, { labels: { usePointStyle: r, pointStyle: n, textAlign: i, color: s, useBorderRadius: a, borderRadius: o } } = e.legend.options;
        return e._getSortedDatasetMetas().map((l) => {
          const c = l.controller.getStyle(r ? 0 : void 0), f = Et(c.borderWidth);
          return {
            text: t[l.index].label,
            fillStyle: c.backgroundColor,
            fontColor: s,
            hidden: !l.visible,
            lineCap: c.borderCapStyle,
            lineDash: c.borderDash,
            lineDashOffset: c.borderDashOffset,
            lineJoin: c.borderJoinStyle,
            lineWidth: (f.width + f.height) / 4,
            strokeStyle: c.borderColor,
            pointStyle: n || c.pointStyle,
            rotation: c.rotation,
            textAlign: i || c.textAlign,
            borderRadius: a && (o || c.borderRadius),
            datasetIndex: l.index
          };
        }, this);
      }
    },
    title: {
      color: (e) => e.chart.options.color,
      display: !1,
      position: "center",
      text: ""
    }
  },
  descriptors: {
    _scriptable: (e) => !e.startsWith("on"),
    labels: {
      _scriptable: (e) => ![
        "generateLabels",
        "filter",
        "sort"
      ].includes(e)
    }
  }
};
class hc extends yr {
  constructor(t) {
    super(), this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this._padding = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0;
  }
  update(t, r) {
    const n = this.options;
    if (this.left = 0, this.top = 0, !n.display) {
      this.width = this.height = this.right = this.bottom = 0;
      return;
    }
    this.width = this.right = t, this.height = this.bottom = r;
    const i = He(n.text) ? n.text.length : 1;
    this._padding = Et(n.padding);
    const s = i * ft(n.font).lineHeight + this._padding.height;
    this.isHorizontal() ? this.height = s : this.width = s;
  }
  isHorizontal() {
    const t = this.options.position;
    return t === "top" || t === "bottom";
  }
  _drawArgs(t) {
    const { top: r, left: n, bottom: i, right: s, options: a } = this, o = a.align;
    let l = 0, c, f, h;
    return this.isHorizontal() ? (f = Ot(o, n, s), h = r + t, c = s - n) : (a.position === "left" ? (f = n + t, h = Ot(o, i, r), l = Ye * -0.5) : (f = s - t, h = Ot(o, r, i), l = Ye * 0.5), c = i - r), {
      titleX: f,
      titleY: h,
      maxWidth: c,
      rotation: l
    };
  }
  draw() {
    const t = this.ctx, r = this.options;
    if (!r.display)
      return;
    const n = ft(r.font), s = n.lineHeight / 2 + this._padding.top, { titleX: a, titleY: o, maxWidth: l, rotation: c } = this._drawArgs(s);
    Kn(t, r.text, 0, 0, n, {
      color: r.color,
      maxWidth: l,
      rotation: c,
      textAlign: tc(r.align),
      textBaseline: "middle",
      translation: [
        a,
        o
      ]
    });
  }
}
function K_(e, t) {
  const r = new hc({
    ctx: e.ctx,
    options: t,
    chart: e
  });
  Ft.configure(e, r, t), Ft.addBox(e, r), e.titleBlock = r;
}
var q_ = {
  id: "title",
  _element: hc,
  start(e, t, r) {
    K_(e, r);
  },
  stop(e) {
    const t = e.titleBlock;
    Ft.removeBox(e, t), delete e.titleBlock;
  },
  beforeUpdate(e, t, r) {
    const n = e.titleBlock;
    Ft.configure(e, n, r), n.options = r;
  },
  defaults: {
    align: "center",
    display: !1,
    font: {
      weight: "bold"
    },
    fullSize: !0,
    padding: 10,
    position: "top",
    text: "",
    weight: 2e3
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: !0,
    _indexable: !1
  }
};
const da = /* @__PURE__ */ new WeakMap();
var Z_ = {
  id: "subtitle",
  start(e, t, r) {
    const n = new hc({
      ctx: e.ctx,
      options: r,
      chart: e
    });
    Ft.configure(e, n, r), Ft.addBox(e, n), da.set(e, n);
  },
  stop(e) {
    Ft.removeBox(e, da.get(e)), da.delete(e);
  },
  beforeUpdate(e, t, r) {
    const n = da.get(e);
    Ft.configure(e, n, r), n.options = r;
  },
  defaults: {
    align: "center",
    display: !1,
    font: {
      weight: "normal"
    },
    fullSize: !0,
    padding: 0,
    position: "top",
    text: "",
    weight: 1500
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: !0,
    _indexable: !1
  }
};
const ns = {
  average(e) {
    if (!e.length)
      return !1;
    let t, r, n = 0, i = 0, s = 0;
    for (t = 0, r = e.length; t < r; ++t) {
      const a = e[t].element;
      if (a && a.hasValue()) {
        const o = a.tooltipPosition();
        n += o.x, i += o.y, ++s;
      }
    }
    return {
      x: n / s,
      y: i / s
    };
  },
  nearest(e, t) {
    if (!e.length)
      return !1;
    let r = t.x, n = t.y, i = Number.POSITIVE_INFINITY, s, a, o;
    for (s = 0, a = e.length; s < a; ++s) {
      const l = e[s].element;
      if (l && l.hasValue()) {
        const c = l.getCenterPoint(), f = wl(t, c);
        f < i && (i = f, o = l);
      }
    }
    if (o) {
      const l = o.tooltipPosition();
      r = l.x, n = l.y;
    }
    return {
      x: r,
      y: n
    };
  }
};
function Er(e, t) {
  return t && (He(t) ? Array.prototype.push.apply(e, t) : e.push(t)), e;
}
function Vr(e) {
  return (typeof e == "string" || e instanceof String) && e.indexOf(`
`) > -1 ? e.split(`
`) : e;
}
function J_(e, t) {
  const { element: r, datasetIndex: n, index: i } = t, s = e.getDatasetMeta(n).controller, { label: a, value: o } = s.getLabelAndValue(i);
  return {
    chart: e,
    label: a,
    parsed: s.getParsed(i),
    raw: e.data.datasets[n].data[i],
    formattedValue: o,
    dataset: s.getDataset(),
    dataIndex: i,
    datasetIndex: n,
    element: r
  };
}
function vh(e, t) {
  const r = e.chart.ctx, { body: n, footer: i, title: s } = e, { boxWidth: a, boxHeight: o } = t, l = ft(t.bodyFont), c = ft(t.titleFont), f = ft(t.footerFont), h = s.length, u = i.length, d = n.length, p = Et(t.padding);
  let g = p.height, m = 0, v = n.reduce((D, P) => D + P.before.length + P.lines.length + P.after.length, 0);
  if (v += e.beforeBody.length + e.afterBody.length, h && (g += h * c.lineHeight + (h - 1) * t.titleSpacing + t.titleMarginBottom), v) {
    const D = t.displayColors ? Math.max(o, l.lineHeight) : l.lineHeight;
    g += d * D + (v - d) * l.lineHeight + (v - 1) * t.bodySpacing;
  }
  u && (g += t.footerMarginTop + u * f.lineHeight + (u - 1) * t.footerSpacing);
  let w = 0;
  const S = function(D) {
    m = Math.max(m, r.measureText(D).width + w);
  };
  return r.save(), r.font = c.string, Me(e.title, S), r.font = l.string, Me(e.beforeBody.concat(e.afterBody), S), w = t.displayColors ? a + 2 + t.boxPadding : 0, Me(n, (D) => {
    Me(D.before, S), Me(D.lines, S), Me(D.after, S);
  }), w = 0, r.font = f.string, Me(e.footer, S), r.restore(), m += p.width, {
    width: m,
    height: g
  };
}
function Q_(e, t) {
  const { y: r, height: n } = t;
  return r < n / 2 ? "top" : r > e.height - n / 2 ? "bottom" : "center";
}
function ev(e, t, r, n) {
  const { x: i, width: s } = n, a = r.caretSize + r.caretPadding;
  if (e === "left" && i + s + a > t.width || e === "right" && i - s - a < 0)
    return !0;
}
function tv(e, t, r, n) {
  const { x: i, width: s } = r, { width: a, chartArea: { left: o, right: l } } = e;
  let c = "center";
  return n === "center" ? c = i <= (o + l) / 2 ? "left" : "right" : i <= s / 2 ? c = "left" : i >= a - s / 2 && (c = "right"), ev(c, e, t, r) && (c = "center"), c;
}
function yh(e, t, r) {
  const n = r.yAlign || t.yAlign || Q_(e, r);
  return {
    xAlign: r.xAlign || t.xAlign || tv(e, t, r, n),
    yAlign: n
  };
}
function rv(e, t) {
  let { x: r, width: n } = e;
  return t === "right" ? r -= n : t === "center" && (r -= n / 2), r;
}
function nv(e, t, r) {
  let { y: n, height: i } = e;
  return t === "top" ? n += r : t === "bottom" ? n -= i + r : n -= i / 2, n;
}
function wh(e, t, r, n) {
  const { caretSize: i, caretPadding: s, cornerRadius: a } = e, { xAlign: o, yAlign: l } = r, c = i + s, { topLeft: f, topRight: h, bottomLeft: u, bottomRight: d } = Yn(a);
  let p = rv(t, o);
  const g = nv(t, l, c);
  return l === "center" ? o === "left" ? p += c : o === "right" && (p -= c) : o === "left" ? p -= Math.max(f, u) + i : o === "right" && (p += Math.max(h, d) + i), {
    x: xt(p, 0, n.width - t.width),
    y: xt(g, 0, n.height - t.height)
  };
}
function ga(e, t, r) {
  const n = Et(r.padding);
  return t === "center" ? e.x + e.width / 2 : t === "right" ? e.x + e.width - n.right : e.x + n.left;
}
function Th(e) {
  return Er([], Vr(e));
}
function iv(e, t, r) {
  return On(e, {
    tooltip: t,
    tooltipItems: r,
    type: "tooltip"
  });
}
function Sh(e, t) {
  const r = t && t.dataset && t.dataset.tooltip && t.dataset.tooltip.callbacks;
  return r ? e.override(r) : e;
}
const Tu = {
  beforeTitle: Ur,
  title(e) {
    if (e.length > 0) {
      const t = e[0], r = t.chart.data.labels, n = r ? r.length : 0;
      if (this && this.options && this.options.mode === "dataset")
        return t.dataset.label || "";
      if (t.label)
        return t.label;
      if (n > 0 && t.dataIndex < n)
        return r[t.dataIndex];
    }
    return "";
  },
  afterTitle: Ur,
  beforeBody: Ur,
  beforeLabel: Ur,
  label(e) {
    if (this && this.options && this.options.mode === "dataset")
      return e.label + ": " + e.formattedValue || e.formattedValue;
    let t = e.dataset.label || "";
    t && (t += ": ");
    const r = e.formattedValue;
    return Te(r) || (t += r), t;
  },
  labelColor(e) {
    const r = e.chart.getDatasetMeta(e.datasetIndex).controller.getStyle(e.dataIndex);
    return {
      borderColor: r.borderColor,
      backgroundColor: r.backgroundColor,
      borderWidth: r.borderWidth,
      borderDash: r.borderDash,
      borderDashOffset: r.borderDashOffset,
      borderRadius: 0
    };
  },
  labelTextColor() {
    return this.options.bodyColor;
  },
  labelPointStyle(e) {
    const r = e.chart.getDatasetMeta(e.datasetIndex).controller.getStyle(e.dataIndex);
    return {
      pointStyle: r.pointStyle,
      rotation: r.rotation
    };
  },
  afterLabel: Ur,
  afterBody: Ur,
  beforeFooter: Ur,
  footer: Ur,
  afterFooter: Ur
};
function zt(e, t, r, n) {
  const i = e[t].call(r, n);
  return typeof i > "u" ? Tu[t].call(r, n) : i;
}
class Fl extends yr {
  constructor(t) {
    super(), this.opacity = 0, this._active = [], this._eventPosition = void 0, this._size = void 0, this._cachedAnimations = void 0, this._tooltipItems = [], this.$animations = void 0, this.$context = void 0, this.chart = t.chart, this.options = t.options, this.dataPoints = void 0, this.title = void 0, this.beforeBody = void 0, this.body = void 0, this.afterBody = void 0, this.footer = void 0, this.xAlign = void 0, this.yAlign = void 0, this.x = void 0, this.y = void 0, this.height = void 0, this.width = void 0, this.caretX = void 0, this.caretY = void 0, this.labelColors = void 0, this.labelPointStyles = void 0, this.labelTextColors = void 0;
  }
  initialize(t) {
    this.options = t, this._cachedAnimations = void 0, this.$context = void 0;
  }
  _resolveAnimations() {
    const t = this._cachedAnimations;
    if (t)
      return t;
    const r = this.chart, n = this.options.setContext(this.getContext()), i = n.enabled && r.options.animation && n.animations, s = new tu(this.chart, i);
    return i._cacheable && (this._cachedAnimations = Object.freeze(s)), s;
  }
  getContext() {
    return this.$context || (this.$context = iv(this.chart.getContext(), this, this._tooltipItems));
  }
  getTitle(t, r) {
    const { callbacks: n } = r, i = zt(n, "beforeTitle", this, t), s = zt(n, "title", this, t), a = zt(n, "afterTitle", this, t);
    let o = [];
    return o = Er(o, Vr(i)), o = Er(o, Vr(s)), o = Er(o, Vr(a)), o;
  }
  getBeforeBody(t, r) {
    return Th(zt(r.callbacks, "beforeBody", this, t));
  }
  getBody(t, r) {
    const { callbacks: n } = r, i = [];
    return Me(t, (s) => {
      const a = {
        before: [],
        lines: [],
        after: []
      }, o = Sh(n, s);
      Er(a.before, Vr(zt(o, "beforeLabel", this, s))), Er(a.lines, zt(o, "label", this, s)), Er(a.after, Vr(zt(o, "afterLabel", this, s))), i.push(a);
    }), i;
  }
  getAfterBody(t, r) {
    return Th(zt(r.callbacks, "afterBody", this, t));
  }
  getFooter(t, r) {
    const { callbacks: n } = r, i = zt(n, "beforeFooter", this, t), s = zt(n, "footer", this, t), a = zt(n, "afterFooter", this, t);
    let o = [];
    return o = Er(o, Vr(i)), o = Er(o, Vr(s)), o = Er(o, Vr(a)), o;
  }
  _createItems(t) {
    const r = this._active, n = this.chart.data, i = [], s = [], a = [];
    let o = [], l, c;
    for (l = 0, c = r.length; l < c; ++l)
      o.push(J_(this.chart, r[l]));
    return t.filter && (o = o.filter((f, h, u) => t.filter(f, h, u, n))), t.itemSort && (o = o.sort((f, h) => t.itemSort(f, h, n))), Me(o, (f) => {
      const h = Sh(t.callbacks, f);
      i.push(zt(h, "labelColor", this, f)), s.push(zt(h, "labelPointStyle", this, f)), a.push(zt(h, "labelTextColor", this, f));
    }), this.labelColors = i, this.labelPointStyles = s, this.labelTextColors = a, this.dataPoints = o, o;
  }
  update(t, r) {
    const n = this.options.setContext(this.getContext()), i = this._active;
    let s, a = [];
    if (!i.length)
      this.opacity !== 0 && (s = {
        opacity: 0
      });
    else {
      const o = ns[n.position].call(this, i, this._eventPosition);
      a = this._createItems(n), this.title = this.getTitle(a, n), this.beforeBody = this.getBeforeBody(a, n), this.body = this.getBody(a, n), this.afterBody = this.getAfterBody(a, n), this.footer = this.getFooter(a, n);
      const l = this._size = vh(this, n), c = Object.assign({}, o, l), f = yh(this.chart, n, c), h = wh(n, c, f, this.chart);
      this.xAlign = f.xAlign, this.yAlign = f.yAlign, s = {
        opacity: 1,
        x: h.x,
        y: h.y,
        width: l.width,
        height: l.height,
        caretX: o.x,
        caretY: o.y
      };
    }
    this._tooltipItems = a, this.$context = void 0, s && this._resolveAnimations().update(this, s), t && n.external && n.external.call(this, {
      chart: this.chart,
      tooltip: this,
      replay: r
    });
  }
  drawCaret(t, r, n, i) {
    const s = this.getCaretPosition(t, n, i);
    r.lineTo(s.x1, s.y1), r.lineTo(s.x2, s.y2), r.lineTo(s.x3, s.y3);
  }
  getCaretPosition(t, r, n) {
    const { xAlign: i, yAlign: s } = this, { caretSize: a, cornerRadius: o } = n, { topLeft: l, topRight: c, bottomLeft: f, bottomRight: h } = Yn(o), { x: u, y: d } = t, { width: p, height: g } = r;
    let m, v, w, S, D, P;
    return s === "center" ? (D = d + g / 2, i === "left" ? (m = u, v = m - a, S = D + a, P = D - a) : (m = u + p, v = m + a, S = D - a, P = D + a), w = m) : (i === "left" ? v = u + Math.max(l, f) + a : i === "right" ? v = u + p - Math.max(c, h) - a : v = this.caretX, s === "top" ? (S = d, D = S - a, m = v - a, w = v + a) : (S = d + g, D = S + a, m = v + a, w = v - a), P = S), {
      x1: m,
      x2: v,
      x3: w,
      y1: S,
      y2: D,
      y3: P
    };
  }
  drawTitle(t, r, n) {
    const i = this.title, s = i.length;
    let a, o, l;
    if (s) {
      const c = Si(n.rtl, this.x, this.width);
      for (t.x = ga(this, n.titleAlign, n), r.textAlign = c.textAlign(n.titleAlign), r.textBaseline = "middle", a = ft(n.titleFont), o = n.titleSpacing, r.fillStyle = n.titleColor, r.font = a.string, l = 0; l < s; ++l)
        r.fillText(i[l], c.x(t.x), t.y + a.lineHeight / 2), t.y += a.lineHeight + o, l + 1 === s && (t.y += n.titleMarginBottom - o);
    }
  }
  _drawColorBox(t, r, n, i, s) {
    const a = this.labelColors[n], o = this.labelPointStyles[n], { boxHeight: l, boxWidth: c } = s, f = ft(s.bodyFont), h = ga(this, "left", s), u = i.x(h), d = l < f.lineHeight ? (f.lineHeight - l) / 2 : 0, p = r.y + d;
    if (s.usePointStyle) {
      const g = {
        radius: Math.min(c, l) / 2,
        pointStyle: o.pointStyle,
        rotation: o.rotation,
        borderWidth: 1
      }, m = i.leftForLtr(u, c) + c / 2, v = p + l / 2;
      t.strokeStyle = s.multiKeyBackground, t.fillStyle = s.multiKeyBackground, Sl(t, g, m, v), t.strokeStyle = a.borderColor, t.fillStyle = a.backgroundColor, Sl(t, g, m, v);
    } else {
      t.lineWidth = be(a.borderWidth) ? Math.max(...Object.values(a.borderWidth)) : a.borderWidth || 1, t.strokeStyle = a.borderColor, t.setLineDash(a.borderDash || []), t.lineDashOffset = a.borderDashOffset || 0;
      const g = i.leftForLtr(u, c), m = i.leftForLtr(i.xPlus(u, 1), c - 2), v = Yn(a.borderRadius);
      Object.values(v).some((w) => w !== 0) ? (t.beginPath(), t.fillStyle = s.multiKeyBackground, As(t, {
        x: g,
        y: p,
        w: c,
        h: l,
        radius: v
      }), t.fill(), t.stroke(), t.fillStyle = a.backgroundColor, t.beginPath(), As(t, {
        x: m,
        y: p + 1,
        w: c - 2,
        h: l - 2,
        radius: v
      }), t.fill()) : (t.fillStyle = s.multiKeyBackground, t.fillRect(g, p, c, l), t.strokeRect(g, p, c, l), t.fillStyle = a.backgroundColor, t.fillRect(m, p + 1, c - 2, l - 2));
    }
    t.fillStyle = this.labelTextColors[n];
  }
  drawBody(t, r, n) {
    const { body: i } = this, { bodySpacing: s, bodyAlign: a, displayColors: o, boxHeight: l, boxWidth: c, boxPadding: f } = n, h = ft(n.bodyFont);
    let u = h.lineHeight, d = 0;
    const p = Si(n.rtl, this.x, this.width), g = function(I) {
      r.fillText(I, p.x(t.x + d), t.y + u / 2), t.y += u + s;
    }, m = p.textAlign(a);
    let v, w, S, D, P, N, O;
    for (r.textAlign = a, r.textBaseline = "middle", r.font = h.string, t.x = ga(this, m, n), r.fillStyle = n.bodyColor, Me(this.beforeBody, g), d = o && m !== "right" ? a === "center" ? c / 2 + f : c + 2 + f : 0, D = 0, N = i.length; D < N; ++D) {
      for (v = i[D], w = this.labelTextColors[D], r.fillStyle = w, Me(v.before, g), S = v.lines, o && S.length && (this._drawColorBox(r, t, D, p, n), u = Math.max(h.lineHeight, l)), P = 0, O = S.length; P < O; ++P)
        g(S[P]), u = h.lineHeight;
      Me(v.after, g);
    }
    d = 0, u = h.lineHeight, Me(this.afterBody, g), t.y -= s;
  }
  drawFooter(t, r, n) {
    const i = this.footer, s = i.length;
    let a, o;
    if (s) {
      const l = Si(n.rtl, this.x, this.width);
      for (t.x = ga(this, n.footerAlign, n), t.y += n.footerMarginTop, r.textAlign = l.textAlign(n.footerAlign), r.textBaseline = "middle", a = ft(n.footerFont), r.fillStyle = n.footerColor, r.font = a.string, o = 0; o < s; ++o)
        r.fillText(i[o], l.x(t.x), t.y + a.lineHeight / 2), t.y += a.lineHeight + n.footerSpacing;
    }
  }
  drawBackground(t, r, n, i) {
    const { xAlign: s, yAlign: a } = this, { x: o, y: l } = t, { width: c, height: f } = n, { topLeft: h, topRight: u, bottomLeft: d, bottomRight: p } = Yn(i.cornerRadius);
    r.fillStyle = i.backgroundColor, r.strokeStyle = i.borderColor, r.lineWidth = i.borderWidth, r.beginPath(), r.moveTo(o + h, l), a === "top" && this.drawCaret(t, r, n, i), r.lineTo(o + c - u, l), r.quadraticCurveTo(o + c, l, o + c, l + u), a === "center" && s === "right" && this.drawCaret(t, r, n, i), r.lineTo(o + c, l + f - p), r.quadraticCurveTo(o + c, l + f, o + c - p, l + f), a === "bottom" && this.drawCaret(t, r, n, i), r.lineTo(o + d, l + f), r.quadraticCurveTo(o, l + f, o, l + f - d), a === "center" && s === "left" && this.drawCaret(t, r, n, i), r.lineTo(o, l + h), r.quadraticCurveTo(o, l, o + h, l), r.closePath(), r.fill(), i.borderWidth > 0 && r.stroke();
  }
  _updateAnimationTarget(t) {
    const r = this.chart, n = this.$animations, i = n && n.x, s = n && n.y;
    if (i || s) {
      const a = ns[t.position].call(this, this._active, this._eventPosition);
      if (!a)
        return;
      const o = this._size = vh(this, t), l = Object.assign({}, a, this._size), c = yh(r, t, l), f = wh(t, l, c, r);
      (i._to !== f.x || s._to !== f.y) && (this.xAlign = c.xAlign, this.yAlign = c.yAlign, this.width = o.width, this.height = o.height, this.caretX = a.x, this.caretY = a.y, this._resolveAnimations().update(this, f));
    }
  }
  _willRender() {
    return !!this.opacity;
  }
  draw(t) {
    const r = this.options.setContext(this.getContext());
    let n = this.opacity;
    if (!n)
      return;
    this._updateAnimationTarget(r);
    const i = {
      width: this.width,
      height: this.height
    }, s = {
      x: this.x,
      y: this.y
    };
    n = Math.abs(n) < 1e-3 ? 0 : n;
    const a = Et(r.padding), o = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
    r.enabled && o && (t.save(), t.globalAlpha = n, this.drawBackground(s, t, i, r), q0(t, r.textDirection), s.y += a.top, this.drawTitle(s, t, r), this.drawBody(s, t, r), this.drawFooter(s, t, r), Z0(t, r.textDirection), t.restore());
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t, r) {
    const n = this._active, i = t.map(({ datasetIndex: o, index: l }) => {
      const c = this.chart.getDatasetMeta(o);
      if (!c)
        throw new Error("Cannot find a dataset at index " + o);
      return {
        datasetIndex: o,
        element: c.data[l],
        index: l
      };
    }), s = !Ua(n, i), a = this._positionChanged(i, r);
    (s || a) && (this._active = i, this._eventPosition = r, this._ignoreReplayEvents = !0, this.update(!0));
  }
  handleEvent(t, r, n = !0) {
    if (r && this._ignoreReplayEvents)
      return !1;
    this._ignoreReplayEvents = !1;
    const i = this.options, s = this._active || [], a = this._getActiveElements(t, s, r, n), o = this._positionChanged(a, t), l = r || !Ua(a, s) || o;
    return l && (this._active = a, (i.enabled || i.external) && (this._eventPosition = {
      x: t.x,
      y: t.y
    }, this.update(!0, r))), l;
  }
  _getActiveElements(t, r, n, i) {
    const s = this.options;
    if (t.type === "mouseout")
      return [];
    if (!i)
      return r.filter((o) => this.chart.data.datasets[o.datasetIndex] && this.chart.getDatasetMeta(o.datasetIndex).controller.getParsed(o.index) !== void 0);
    const a = this.chart.getElementsAtEventForMode(t, s.mode, s, n);
    return s.reverse && a.reverse(), a;
  }
  _positionChanged(t, r) {
    const { caretX: n, caretY: i, options: s } = this, a = ns[s.position].call(this, t, r);
    return a !== !1 && (n !== a.x || i !== a.y);
  }
}
ie(Fl, "positioners", ns);
var sv = {
  id: "tooltip",
  _element: Fl,
  positioners: ns,
  afterInit(e, t, r) {
    r && (e.tooltip = new Fl({
      chart: e,
      options: r
    }));
  },
  beforeUpdate(e, t, r) {
    e.tooltip && e.tooltip.initialize(r);
  },
  reset(e, t, r) {
    e.tooltip && e.tooltip.initialize(r);
  },
  afterDraw(e) {
    const t = e.tooltip;
    if (t && t._willRender()) {
      const r = {
        tooltip: t
      };
      if (e.notifyPlugins("beforeTooltipDraw", {
        ...r,
        cancelable: !0
      }) === !1)
        return;
      t.draw(e.ctx), e.notifyPlugins("afterTooltipDraw", r);
    }
  },
  afterEvent(e, t) {
    if (e.tooltip) {
      const r = t.replay;
      e.tooltip.handleEvent(t.event, r, t.inChartArea) && (t.changed = !0);
    }
  },
  defaults: {
    enabled: !0,
    external: null,
    position: "average",
    backgroundColor: "rgba(0,0,0,0.8)",
    titleColor: "#fff",
    titleFont: {
      weight: "bold"
    },
    titleSpacing: 2,
    titleMarginBottom: 6,
    titleAlign: "left",
    bodyColor: "#fff",
    bodySpacing: 2,
    bodyFont: {},
    bodyAlign: "left",
    footerColor: "#fff",
    footerSpacing: 2,
    footerMarginTop: 6,
    footerFont: {
      weight: "bold"
    },
    footerAlign: "left",
    padding: 6,
    caretPadding: 2,
    caretSize: 5,
    cornerRadius: 6,
    boxHeight: (e, t) => t.bodyFont.size,
    boxWidth: (e, t) => t.bodyFont.size,
    multiKeyBackground: "#fff",
    displayColors: !0,
    boxPadding: 0,
    borderColor: "rgba(0,0,0,0)",
    borderWidth: 0,
    animation: {
      duration: 400,
      easing: "easeOutQuart"
    },
    animations: {
      numbers: {
        type: "number",
        properties: [
          "x",
          "y",
          "width",
          "height",
          "caretX",
          "caretY"
        ]
      },
      opacity: {
        easing: "linear",
        duration: 200
      }
    },
    callbacks: Tu
  },
  defaultRoutes: {
    bodyFont: "font",
    footerFont: "font",
    titleFont: "font"
  },
  descriptors: {
    _scriptable: (e) => e !== "filter" && e !== "itemSort" && e !== "external",
    _indexable: !1,
    callbacks: {
      _scriptable: !1,
      _indexable: !1
    },
    animation: {
      _fallback: !1
    },
    animations: {
      _fallback: "animation"
    }
  },
  additionalOptionScopes: [
    "interaction"
  ]
}, av = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  Colors: __,
  Decimation: T_,
  Filler: H_,
  Legend: X_,
  SubTitle: Z_,
  Title: q_,
  Tooltip: sv
});
const ov = (e, t, r, n) => (typeof t == "string" ? (r = e.push(t) - 1, n.unshift({
  index: r,
  label: t
})) : isNaN(t) && (r = null), r);
function lv(e, t, r, n) {
  const i = e.indexOf(t);
  if (i === -1)
    return ov(e, t, r, n);
  const s = e.lastIndexOf(t);
  return i !== s ? r : i;
}
const cv = (e, t) => e === null ? null : xt(Math.round(e), 0, t);
function bh(e) {
  const t = this.getLabels();
  return e >= 0 && e < t.length ? t[e] : e;
}
class Cl extends ni {
  constructor(t) {
    super(t), this._startValue = void 0, this._valueRange = 0, this._addedLabels = [];
  }
  init(t) {
    const r = this._addedLabels;
    if (r.length) {
      const n = this.getLabels();
      for (const { index: i, label: s } of r)
        n[i] === s && n.splice(i, 1);
      this._addedLabels = [];
    }
    super.init(t);
  }
  parse(t, r) {
    if (Te(t))
      return null;
    const n = this.getLabels();
    return r = isFinite(r) && n[r] === t ? r : lv(n, t, xe(r, t), this._addedLabels), cv(r, n.length - 1);
  }
  determineDataLimits() {
    const { minDefined: t, maxDefined: r } = this.getUserBounds();
    let { min: n, max: i } = this.getMinMax(!0);
    this.options.bounds === "ticks" && (t || (n = 0), r || (i = this.getLabels().length - 1)), this.min = n, this.max = i;
  }
  buildTicks() {
    const t = this.min, r = this.max, n = this.options.offset, i = [];
    let s = this.getLabels();
    s = t === 0 && r === s.length - 1 ? s : s.slice(t, r + 1), this._valueRange = Math.max(s.length - (n ? 0 : 1), 1), this._startValue = this.min - (n ? 0.5 : 0);
    for (let a = t; a <= r; a++)
      i.push({
        value: a
      });
    return i;
  }
  getLabelForValue(t) {
    return bh.call(this, t);
  }
  configure() {
    super.configure(), this.isHorizontal() || (this._reversePixels = !this._reversePixels);
  }
  getPixelForValue(t) {
    return typeof t != "number" && (t = this.parse(t)), t === null ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getPixelForTick(t) {
    const r = this.ticks;
    return t < 0 || t > r.length - 1 ? null : this.getPixelForValue(r[t].value);
  }
  getValueForPixel(t) {
    return Math.round(this._startValue + this.getDecimalForPixel(t) * this._valueRange);
  }
  getBasePixel() {
    return this.bottom;
  }
}
ie(Cl, "id", "category"), ie(Cl, "defaults", {
  ticks: {
    callback: bh
  }
});
function fv(e, t) {
  const r = [], { bounds: i, step: s, min: a, max: o, precision: l, count: c, maxTicks: f, maxDigits: h, includeBounds: u } = e, d = s || 1, p = f - 1, { min: g, max: m } = t, v = !Te(a), w = !Te(o), S = !Te(c), D = (m - g) / (h + 1);
  let P = _f((m - g) / p / d) * d, N, O, I, R;
  if (P < 1e-14 && !v && !w)
    return [
      {
        value: g
      },
      {
        value: m
      }
    ];
  R = Math.ceil(m / P) - Math.floor(g / P), R > p && (P = _f(R * P / p / d) * d), Te(l) || (N = Math.pow(10, l), P = Math.ceil(P * N) / N), i === "ticks" ? (O = Math.floor(g / P) * P, I = Math.ceil(m / P) * P) : (O = g, I = m), v && w && s && i1((o - a) / s, P / 1e3) ? (R = Math.round(Math.min((o - a) / P, f)), P = (o - a) / R, O = a, I = o) : S ? (O = v ? a : O, I = w ? o : I, R = c - 1, P = (I - O) / R) : (R = (I - O) / P, os(R, Math.round(R), P / 1e3) ? R = Math.round(R) : R = Math.ceil(R));
  const z = Math.max(vf(P), vf(O));
  N = Math.pow(10, Te(l) ? z : l), O = Math.round(O * N) / N, I = Math.round(I * N) / N;
  let H = 0;
  for (v && (u && O !== a ? (r.push({
    value: a
  }), O < a && H++, os(Math.round((O + H * P) * N) / N, a, Eh(a, D, e)) && H++) : O < a && H++); H < R; ++H) {
    const V = Math.round((O + H * P) * N) / N;
    if (w && V > o)
      break;
    r.push({
      value: V
    });
  }
  return w && u && I !== o ? r.length && os(r[r.length - 1].value, o, Eh(o, D, e)) ? r[r.length - 1].value = o : r.push({
    value: o
  }) : (!w || I === o) && r.push({
    value: I
  }), r;
}
function Eh(e, t, { horizontal: r, minRotation: n }) {
  const i = pr(n), s = (r ? Math.sin(i) : Math.cos(i)) || 1e-3, a = 0.75 * t * ("" + e).length;
  return Math.min(t / s, a);
}
class Ga extends ni {
  constructor(t) {
    super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._endValue = void 0, this._valueRange = 0;
  }
  parse(t, r) {
    return Te(t) || (typeof t == "number" || t instanceof Number) && !isFinite(+t) ? null : +t;
  }
  handleTickRangeOptions() {
    const { beginAtZero: t } = this.options, { minDefined: r, maxDefined: n } = this.getUserBounds();
    let { min: i, max: s } = this;
    const a = (l) => i = r ? i : l, o = (l) => s = n ? s : l;
    if (t) {
      const l = Cr(i), c = Cr(s);
      l < 0 && c < 0 ? o(0) : l > 0 && c > 0 && a(0);
    }
    if (i === s) {
      let l = s === 0 ? 1 : Math.abs(s * 0.05);
      o(s + l), t || a(i - l);
    }
    this.min = i, this.max = s;
  }
  getTickLimit() {
    const t = this.options.ticks;
    let { maxTicksLimit: r, stepSize: n } = t, i;
    return n ? (i = Math.ceil(this.max / n) - Math.floor(this.min / n) + 1, i > 1e3 && (console.warn(`scales.${this.id}.ticks.stepSize: ${n} would result generating up to ${i} ticks. Limiting to 1000.`), i = 1e3)) : (i = this.computeTickLimit(), r = r || 11), r && (i = Math.min(r, i)), i;
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const t = this.options, r = t.ticks;
    let n = this.getTickLimit();
    n = Math.max(2, n);
    const i = {
      maxTicks: n,
      bounds: t.bounds,
      min: t.min,
      max: t.max,
      precision: r.precision,
      step: r.stepSize,
      count: r.count,
      maxDigits: this._maxDigits(),
      horizontal: this.isHorizontal(),
      minRotation: r.minRotation || 0,
      includeBounds: r.includeBounds !== !1
    }, s = this._range || this, a = fv(i, s);
    return t.bounds === "ticks" && P0(a, this, "value"), t.reverse ? (a.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), a;
  }
  configure() {
    const t = this.ticks;
    let r = this.min, n = this.max;
    if (super.configure(), this.options.offset && t.length) {
      const i = (n - r) / Math.max(t.length - 1, 1) / 2;
      r -= i, n += i;
    }
    this._startValue = r, this._endValue = n, this._valueRange = n - r;
  }
  getLabelForValue(t) {
    return Us(t, this.chart.options.locale, this.options.ticks.format);
  }
}
class Ml extends Ga {
  determineDataLimits() {
    const { min: t, max: r } = this.getMinMax(!0);
    this.min = nt(t) ? t : 0, this.max = nt(r) ? r : 1, this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const t = this.isHorizontal(), r = t ? this.width : this.height, n = pr(this.options.ticks.minRotation), i = (t ? Math.sin(n) : Math.cos(n)) || 1e-3, s = this._resolveTickFontOptions(0);
    return Math.ceil(r / Math.min(40, s.lineHeight / i));
  }
  getPixelForValue(t) {
    return t === null ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getValueForPixel(t) {
    return this._startValue + this.getDecimalForPixel(t) * this._valueRange;
  }
}
ie(Ml, "id", "linear"), ie(Ml, "defaults", {
  ticks: {
    callback: mo.formatters.numeric
  }
});
const Os = (e) => Math.floor(gn(e)), Ln = (e, t) => Math.pow(10, Os(e) + t);
function Ah(e) {
  return e / Math.pow(10, Os(e)) === 1;
}
function kh(e, t, r) {
  const n = Math.pow(10, r), i = Math.floor(e / n);
  return Math.ceil(t / n) - i;
}
function hv(e, t) {
  const r = t - e;
  let n = Os(r);
  for (; kh(e, t, n) > 10; )
    n++;
  for (; kh(e, t, n) < 10; )
    n--;
  return Math.min(n, Os(e));
}
function uv(e, { min: t, max: r }) {
  t = Xt(e.min, t);
  const n = [], i = Os(t);
  let s = hv(t, r), a = s < 0 ? Math.pow(10, Math.abs(s)) : 1;
  const o = Math.pow(10, s), l = i > s ? Math.pow(10, i) : 0, c = Math.round((t - l) * a) / a, f = Math.floor((t - l) / o / 10) * o * 10;
  let h = Math.floor((c - f) / Math.pow(10, s)), u = Xt(e.min, Math.round((l + f + h * Math.pow(10, s)) * a) / a);
  for (; u < r; )
    n.push({
      value: u,
      major: Ah(u),
      significand: h
    }), h >= 10 ? h = h < 15 ? 15 : 20 : h++, h >= 20 && (s++, h = 2, a = s >= 0 ? 1 : a), u = Math.round((l + f + h * Math.pow(10, s)) * a) / a;
  const d = Xt(e.max, u);
  return n.push({
    value: d,
    major: Ah(d),
    significand: h
  }), n;
}
class Pl extends ni {
  constructor(t) {
    super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._valueRange = 0;
  }
  parse(t, r) {
    const n = Ga.prototype.parse.apply(this, [
      t,
      r
    ]);
    if (n === 0) {
      this._zero = !0;
      return;
    }
    return nt(n) && n > 0 ? n : null;
  }
  determineDataLimits() {
    const { min: t, max: r } = this.getMinMax(!0);
    this.min = nt(t) ? Math.max(0, t) : null, this.max = nt(r) ? Math.max(0, r) : null, this.options.beginAtZero && (this._zero = !0), this._zero && this.min !== this._suggestedMin && !nt(this._userMin) && (this.min = t === Ln(this.min, 0) ? Ln(this.min, -1) : Ln(this.min, 0)), this.handleTickRangeOptions();
  }
  handleTickRangeOptions() {
    const { minDefined: t, maxDefined: r } = this.getUserBounds();
    let n = this.min, i = this.max;
    const s = (o) => n = t ? n : o, a = (o) => i = r ? i : o;
    n === i && (n <= 0 ? (s(1), a(10)) : (s(Ln(n, -1)), a(Ln(i, 1)))), n <= 0 && s(Ln(i, -1)), i <= 0 && a(Ln(n, 1)), this.min = n, this.max = i;
  }
  buildTicks() {
    const t = this.options, r = {
      min: this._userMin,
      max: this._userMax
    }, n = uv(r, this);
    return t.bounds === "ticks" && P0(n, this, "value"), t.reverse ? (n.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), n;
  }
  getLabelForValue(t) {
    return t === void 0 ? "0" : Us(t, this.chart.options.locale, this.options.ticks.format);
  }
  configure() {
    const t = this.min;
    super.configure(), this._startValue = gn(t), this._valueRange = gn(this.max) - gn(t);
  }
  getPixelForValue(t) {
    return (t === void 0 || t === 0) && (t = this.min), t === null || isNaN(t) ? NaN : this.getPixelForDecimal(t === this.min ? 0 : (gn(t) - this._startValue) / this._valueRange);
  }
  getValueForPixel(t) {
    const r = this.getDecimalForPixel(t);
    return Math.pow(10, this._startValue + r * this._valueRange);
  }
}
ie(Pl, "id", "logarithmic"), ie(Pl, "defaults", {
  ticks: {
    callback: mo.formatters.logarithmic,
    major: {
      enabled: !0
    }
  }
});
function Rl(e) {
  const t = e.ticks;
  if (t.display && e.display) {
    const r = Et(t.backdropPadding);
    return xe(t.font && t.font.size, Qe.font.size) + r.height;
  }
  return 0;
}
function dv(e, t, r) {
  return r = He(r) ? r : [
    r
  ], {
    w: w1(e, t.string, r),
    h: r.length * t.lineHeight
  };
}
function Oh(e, t, r, n, i) {
  return e === n || e === i ? {
    start: t - r / 2,
    end: t + r / 2
  } : e < n || e > i ? {
    start: t - r,
    end: t
  } : {
    start: t,
    end: t + r
  };
}
function gv(e) {
  const t = {
    l: e.left + e._padding.left,
    r: e.right - e._padding.right,
    t: e.top + e._padding.top,
    b: e.bottom - e._padding.bottom
  }, r = Object.assign({}, t), n = [], i = [], s = e._pointLabels.length, a = e.options.pointLabels, o = a.centerPointLabels ? Ye / s : 0;
  for (let l = 0; l < s; l++) {
    const c = a.setContext(e.getPointLabelContext(l));
    i[l] = c.padding;
    const f = e.getPointPosition(l, e.drawingArea + i[l], o), h = ft(c.font), u = dv(e.ctx, h, e._pointLabels[l]);
    n[l] = u;
    const d = qt(e.getIndexAngle(l) + o), p = Math.round(Ql(d)), g = Oh(p, f.x, u.w, 0, 180), m = Oh(p, f.y, u.h, 90, 270);
    pv(r, t, d, g, m);
  }
  e.setCenterPoint(t.l - r.l, r.r - t.r, t.t - r.t, r.b - t.b), e._pointLabelItems = _v(e, n, i);
}
function pv(e, t, r, n, i) {
  const s = Math.abs(Math.sin(r)), a = Math.abs(Math.cos(r));
  let o = 0, l = 0;
  n.start < t.l ? (o = (t.l - n.start) / s, e.l = Math.min(e.l, t.l - o)) : n.end > t.r && (o = (n.end - t.r) / s, e.r = Math.max(e.r, t.r + o)), i.start < t.t ? (l = (t.t - i.start) / a, e.t = Math.min(e.t, t.t - l)) : i.end > t.b && (l = (i.end - t.b) / a, e.b = Math.max(e.b, t.b + l));
}
function mv(e, t, r) {
  const n = e.drawingArea, { extra: i, additionalAngle: s, padding: a, size: o } = r, l = e.getPointPosition(t, n + i + a, s), c = Math.round(Ql(qt(l.angle + ot))), f = wv(l.y, o.h, c), h = vv(c), u = yv(l.x, o.w, h);
  return {
    visible: !0,
    x: l.x,
    y: f,
    textAlign: h,
    left: u,
    top: f,
    right: u + o.w,
    bottom: f + o.h
  };
}
function xv(e, t) {
  if (!t)
    return !0;
  const { left: r, top: n, right: i, bottom: s } = e;
  return !(Kr({
    x: r,
    y: n
  }, t) || Kr({
    x: r,
    y: s
  }, t) || Kr({
    x: i,
    y: n
  }, t) || Kr({
    x: i,
    y: s
  }, t));
}
function _v(e, t, r) {
  const n = [], i = e._pointLabels.length, s = e.options, { centerPointLabels: a, display: o } = s.pointLabels, l = {
    extra: Rl(s) / 2,
    additionalAngle: a ? Ye / i : 0
  };
  let c;
  for (let f = 0; f < i; f++) {
    l.padding = r[f], l.size = t[f];
    const h = mv(e, f, l);
    n.push(h), o === "auto" && (h.visible = xv(h, c), h.visible && (c = h));
  }
  return n;
}
function vv(e) {
  return e === 0 || e === 180 ? "center" : e < 180 ? "left" : "right";
}
function yv(e, t, r) {
  return r === "right" ? e -= t : r === "center" && (e -= t / 2), e;
}
function wv(e, t, r) {
  return r === 90 || r === 270 ? e -= t / 2 : (r > 270 || r < 90) && (e -= t), e;
}
function Tv(e, t, r) {
  const { left: n, top: i, right: s, bottom: a } = r, { backdropColor: o } = t;
  if (!Te(o)) {
    const l = Yn(t.borderRadius), c = Et(t.backdropPadding);
    e.fillStyle = o;
    const f = n - c.left, h = i - c.top, u = s - n + c.width, d = a - i + c.height;
    Object.values(l).some((p) => p !== 0) ? (e.beginPath(), As(e, {
      x: f,
      y: h,
      w: u,
      h: d,
      radius: l
    }), e.fill()) : e.fillRect(f, h, u, d);
  }
}
function Sv(e, t) {
  const { ctx: r, options: { pointLabels: n } } = e;
  for (let i = t - 1; i >= 0; i--) {
    const s = e._pointLabelItems[i];
    if (!s.visible)
      continue;
    const a = n.setContext(e.getPointLabelContext(i));
    Tv(r, a, s);
    const o = ft(a.font), { x: l, y: c, textAlign: f } = s;
    Kn(r, e._pointLabels[i], l, c + o.lineHeight / 2, o, {
      color: a.color,
      textAlign: f,
      textBaseline: "middle"
    });
  }
}
function Su(e, t, r, n) {
  const { ctx: i } = e;
  if (r)
    i.arc(e.xCenter, e.yCenter, t, 0, Ve);
  else {
    let s = e.getPointPosition(0, t);
    i.moveTo(s.x, s.y);
    for (let a = 1; a < n; a++)
      s = e.getPointPosition(a, t), i.lineTo(s.x, s.y);
  }
}
function bv(e, t, r, n, i) {
  const s = e.ctx, a = t.circular, { color: o, lineWidth: l } = t;
  !a && !n || !o || !l || r < 0 || (s.save(), s.strokeStyle = o, s.lineWidth = l, s.setLineDash(i.dash), s.lineDashOffset = i.dashOffset, s.beginPath(), Su(e, r, a, n), s.closePath(), s.stroke(), s.restore());
}
function Ev(e, t, r) {
  return On(e, {
    label: r,
    index: t,
    type: "pointLabel"
  });
}
class is extends Ga {
  constructor(t) {
    super(t), this.xCenter = void 0, this.yCenter = void 0, this.drawingArea = void 0, this._pointLabels = [], this._pointLabelItems = [];
  }
  setDimensions() {
    const t = this._padding = Et(Rl(this.options) / 2), r = this.width = this.maxWidth - t.width, n = this.height = this.maxHeight - t.height;
    this.xCenter = Math.floor(this.left + r / 2 + t.left), this.yCenter = Math.floor(this.top + n / 2 + t.top), this.drawingArea = Math.floor(Math.min(r, n) / 2);
  }
  determineDataLimits() {
    const { min: t, max: r } = this.getMinMax(!1);
    this.min = nt(t) && !isNaN(t) ? t : 0, this.max = nt(r) && !isNaN(r) ? r : 0, this.handleTickRangeOptions();
  }
  computeTickLimit() {
    return Math.ceil(this.drawingArea / Rl(this.options));
  }
  generateTickLabels(t) {
    Ga.prototype.generateTickLabels.call(this, t), this._pointLabels = this.getLabels().map((r, n) => {
      const i = Ne(this.options.pointLabels.callback, [
        r,
        n
      ], this);
      return i || i === 0 ? i : "";
    }).filter((r, n) => this.chart.getDataVisibility(n));
  }
  fit() {
    const t = this.options;
    t.display && t.pointLabels.display ? gv(this) : this.setCenterPoint(0, 0, 0, 0);
  }
  setCenterPoint(t, r, n, i) {
    this.xCenter += Math.floor((t - r) / 2), this.yCenter += Math.floor((n - i) / 2), this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(t, r, n, i));
  }
  getIndexAngle(t) {
    const r = Ve / (this._pointLabels.length || 1), n = this.options.startAngle || 0;
    return qt(t * r + pr(n));
  }
  getDistanceFromCenterForValue(t) {
    if (Te(t))
      return NaN;
    const r = this.drawingArea / (this.max - this.min);
    return this.options.reverse ? (this.max - t) * r : (t - this.min) * r;
  }
  getValueForDistanceFromCenter(t) {
    if (Te(t))
      return NaN;
    const r = t / (this.drawingArea / (this.max - this.min));
    return this.options.reverse ? this.max - r : this.min + r;
  }
  getPointLabelContext(t) {
    const r = this._pointLabels || [];
    if (t >= 0 && t < r.length) {
      const n = r[t];
      return Ev(this.getContext(), t, n);
    }
  }
  getPointPosition(t, r, n = 0) {
    const i = this.getIndexAngle(t) - ot + n;
    return {
      x: Math.cos(i) * r + this.xCenter,
      y: Math.sin(i) * r + this.yCenter,
      angle: i
    };
  }
  getPointPositionForValue(t, r) {
    return this.getPointPosition(t, this.getDistanceFromCenterForValue(r));
  }
  getBasePosition(t) {
    return this.getPointPositionForValue(t || 0, this.getBaseValue());
  }
  getPointLabelPosition(t) {
    const { left: r, top: n, right: i, bottom: s } = this._pointLabelItems[t];
    return {
      left: r,
      top: n,
      right: i,
      bottom: s
    };
  }
  drawBackground() {
    const { backgroundColor: t, grid: { circular: r } } = this.options;
    if (t) {
      const n = this.ctx;
      n.save(), n.beginPath(), Su(this, this.getDistanceFromCenterForValue(this._endValue), r, this._pointLabels.length), n.closePath(), n.fillStyle = t, n.fill(), n.restore();
    }
  }
  drawGrid() {
    const t = this.ctx, r = this.options, { angleLines: n, grid: i, border: s } = r, a = this._pointLabels.length;
    let o, l, c;
    if (r.pointLabels.display && Sv(this, a), i.display && this.ticks.forEach((f, h) => {
      if (h !== 0) {
        l = this.getDistanceFromCenterForValue(f.value);
        const u = this.getContext(h), d = i.setContext(u), p = s.setContext(u);
        bv(this, d, l, a, p);
      }
    }), n.display) {
      for (t.save(), o = a - 1; o >= 0; o--) {
        const f = n.setContext(this.getPointLabelContext(o)), { color: h, lineWidth: u } = f;
        !u || !h || (t.lineWidth = u, t.strokeStyle = h, t.setLineDash(f.borderDash), t.lineDashOffset = f.borderDashOffset, l = this.getDistanceFromCenterForValue(r.ticks.reverse ? this.min : this.max), c = this.getPointPosition(o, l), t.beginPath(), t.moveTo(this.xCenter, this.yCenter), t.lineTo(c.x, c.y), t.stroke());
      }
      t.restore();
    }
  }
  drawBorder() {
  }
  drawLabels() {
    const t = this.ctx, r = this.options, n = r.ticks;
    if (!n.display)
      return;
    const i = this.getIndexAngle(0);
    let s, a;
    t.save(), t.translate(this.xCenter, this.yCenter), t.rotate(i), t.textAlign = "center", t.textBaseline = "middle", this.ticks.forEach((o, l) => {
      if (l === 0 && !r.reverse)
        return;
      const c = n.setContext(this.getContext(l)), f = ft(c.font);
      if (s = this.getDistanceFromCenterForValue(this.ticks[l].value), c.showLabelBackdrop) {
        t.font = f.string, a = t.measureText(o.label).width, t.fillStyle = c.backdropColor;
        const h = Et(c.backdropPadding);
        t.fillRect(-a / 2 - h.left, -s - f.size / 2 - h.top, a + h.width, f.size + h.height);
      }
      Kn(t, o.label, 0, -s, f, {
        color: c.color,
        strokeColor: c.textStrokeColor,
        strokeWidth: c.textStrokeWidth
      });
    }), t.restore();
  }
  drawTitle() {
  }
}
ie(is, "id", "radialLinear"), ie(is, "defaults", {
  display: !0,
  animate: !0,
  position: "chartArea",
  angleLines: {
    display: !0,
    lineWidth: 1,
    borderDash: [],
    borderDashOffset: 0
  },
  grid: {
    circular: !1
  },
  startAngle: 0,
  ticks: {
    showLabelBackdrop: !0,
    callback: mo.formatters.numeric
  },
  pointLabels: {
    backdropColor: void 0,
    backdropPadding: 2,
    display: !0,
    font: {
      size: 10
    },
    callback(t) {
      return t;
    },
    padding: 5,
    centerPointLabels: !1
  }
}), ie(is, "defaultRoutes", {
  "angleLines.color": "borderColor",
  "pointLabels.color": "color",
  "ticks.color": "color"
}), ie(is, "descriptors", {
  angleLines: {
    _fallback: "grid"
  }
});
const yo = {
  millisecond: {
    common: !0,
    size: 1,
    steps: 1e3
  },
  second: {
    common: !0,
    size: 1e3,
    steps: 60
  },
  minute: {
    common: !0,
    size: 6e4,
    steps: 60
  },
  hour: {
    common: !0,
    size: 36e5,
    steps: 24
  },
  day: {
    common: !0,
    size: 864e5,
    steps: 30
  },
  week: {
    common: !1,
    size: 6048e5,
    steps: 4
  },
  month: {
    common: !0,
    size: 2628e6,
    steps: 12
  },
  quarter: {
    common: !1,
    size: 7884e6,
    steps: 4
  },
  year: {
    common: !0,
    size: 3154e7
  }
}, Yt = /* @__PURE__ */ Object.keys(yo);
function Dh(e, t) {
  return e - t;
}
function Fh(e, t) {
  if (Te(t))
    return null;
  const r = e._adapter, { parser: n, round: i, isoWeekday: s } = e._parseOpts;
  let a = t;
  return typeof n == "function" && (a = n(a)), nt(a) || (a = typeof n == "string" ? r.parse(a, n) : r.parse(a)), a === null ? null : (i && (a = i === "week" && (Ci(s) || s === !0) ? r.startOf(a, "isoWeek", s) : r.startOf(a, i)), +a);
}
function Ch(e, t, r, n) {
  const i = Yt.length;
  for (let s = Yt.indexOf(e); s < i - 1; ++s) {
    const a = yo[Yt[s]], o = a.steps ? a.steps : Number.MAX_SAFE_INTEGER;
    if (a.common && Math.ceil((r - t) / (o * a.size)) <= n)
      return Yt[s];
  }
  return Yt[i - 1];
}
function Av(e, t, r, n, i) {
  for (let s = Yt.length - 1; s >= Yt.indexOf(r); s--) {
    const a = Yt[s];
    if (yo[a].common && e._adapter.diff(i, n, a) >= t - 1)
      return a;
  }
  return Yt[r ? Yt.indexOf(r) : 0];
}
function kv(e) {
  for (let t = Yt.indexOf(e) + 1, r = Yt.length; t < r; ++t)
    if (yo[Yt[t]].common)
      return Yt[t];
}
function Mh(e, t, r) {
  if (!r)
    e[t] = !0;
  else if (r.length) {
    const { lo: n, hi: i } = ec(r, t), s = r[n] >= t ? r[n] : r[i];
    e[s] = !0;
  }
}
function Ov(e, t, r, n) {
  const i = e._adapter, s = +i.startOf(t[0].value, n), a = t[t.length - 1].value;
  let o, l;
  for (o = s; o <= a; o = +i.add(o, 1, n))
    l = r[o], l >= 0 && (t[l].major = !0);
  return t;
}
function Ph(e, t, r) {
  const n = [], i = {}, s = t.length;
  let a, o;
  for (a = 0; a < s; ++a)
    o = t[a], i[o] = a, n.push({
      value: o,
      major: !1
    });
  return s === 0 || !r ? n : Ov(e, n, i, r);
}
class Ds extends ni {
  constructor(t) {
    super(t), this._cache = {
      data: [],
      labels: [],
      all: []
    }, this._unit = "day", this._majorUnit = void 0, this._offsets = {}, this._normalized = !1, this._parseOpts = void 0;
  }
  init(t, r = {}) {
    const n = t.time || (t.time = {}), i = this._adapter = new Nm._date(t.adapters.date);
    i.init(r), as(n.displayFormats, i.formats()), this._parseOpts = {
      parser: n.parser,
      round: n.round,
      isoWeekday: n.isoWeekday
    }, super.init(t), this._normalized = r.normalized;
  }
  parse(t, r) {
    return t === void 0 ? null : Fh(this, t);
  }
  beforeLayout() {
    super.beforeLayout(), this._cache = {
      data: [],
      labels: [],
      all: []
    };
  }
  determineDataLimits() {
    const t = this.options, r = this._adapter, n = t.time.unit || "day";
    let { min: i, max: s, minDefined: a, maxDefined: o } = this.getUserBounds();
    function l(c) {
      !a && !isNaN(c.min) && (i = Math.min(i, c.min)), !o && !isNaN(c.max) && (s = Math.max(s, c.max));
    }
    (!a || !o) && (l(this._getLabelBounds()), (t.bounds !== "ticks" || t.ticks.source !== "labels") && l(this.getMinMax(!1))), i = nt(i) && !isNaN(i) ? i : +r.startOf(Date.now(), n), s = nt(s) && !isNaN(s) ? s : +r.endOf(Date.now(), n) + 1, this.min = Math.min(i, s - 1), this.max = Math.max(i + 1, s);
  }
  _getLabelBounds() {
    const t = this.getLabelTimestamps();
    let r = Number.POSITIVE_INFINITY, n = Number.NEGATIVE_INFINITY;
    return t.length && (r = t[0], n = t[t.length - 1]), {
      min: r,
      max: n
    };
  }
  buildTicks() {
    const t = this.options, r = t.time, n = t.ticks, i = n.source === "labels" ? this.getLabelTimestamps() : this._generate();
    t.bounds === "ticks" && i.length && (this.min = this._userMin || i[0], this.max = this._userMax || i[i.length - 1]);
    const s = this.min, a = this.max, o = l1(i, s, a);
    return this._unit = r.unit || (n.autoSkip ? Ch(r.minUnit, this.min, this.max, this._getLabelCapacity(s)) : Av(this, o.length, r.minUnit, this.min, this.max)), this._majorUnit = !n.major.enabled || this._unit === "year" ? void 0 : kv(this._unit), this.initOffsets(i), t.reverse && o.reverse(), Ph(this, o, this._majorUnit);
  }
  afterAutoSkip() {
    this.options.offsetAfterAutoskip && this.initOffsets(this.ticks.map((t) => +t.value));
  }
  initOffsets(t = []) {
    let r = 0, n = 0, i, s;
    this.options.offset && t.length && (i = this.getDecimalForValue(t[0]), t.length === 1 ? r = 1 - i : r = (this.getDecimalForValue(t[1]) - i) / 2, s = this.getDecimalForValue(t[t.length - 1]), t.length === 1 ? n = s : n = (s - this.getDecimalForValue(t[t.length - 2])) / 2);
    const a = t.length < 3 ? 0.5 : 0.25;
    r = xt(r, 0, a), n = xt(n, 0, a), this._offsets = {
      start: r,
      end: n,
      factor: 1 / (r + 1 + n)
    };
  }
  _generate() {
    const t = this._adapter, r = this.min, n = this.max, i = this.options, s = i.time, a = s.unit || Ch(s.minUnit, r, n, this._getLabelCapacity(r)), o = xe(i.ticks.stepSize, 1), l = a === "week" ? s.isoWeekday : !1, c = Ci(l) || l === !0, f = {};
    let h = r, u, d;
    if (c && (h = +t.startOf(h, "isoWeek", l)), h = +t.startOf(h, c ? "day" : a), t.diff(n, r, a) > 1e5 * o)
      throw new Error(r + " and " + n + " are too far apart with stepSize of " + o + " " + a);
    const p = i.ticks.source === "data" && this.getDataTimestamps();
    for (u = h, d = 0; u < n; u = +t.add(u, o, a), d++)
      Mh(f, u, p);
    return (u === n || i.bounds === "ticks" || d === 1) && Mh(f, u, p), Object.keys(f).sort(Dh).map((g) => +g);
  }
  getLabelForValue(t) {
    const r = this._adapter, n = this.options.time;
    return n.tooltipFormat ? r.format(t, n.tooltipFormat) : r.format(t, n.displayFormats.datetime);
  }
  format(t, r) {
    const i = this.options.time.displayFormats, s = this._unit, a = r || i[s];
    return this._adapter.format(t, a);
  }
  _tickFormatFunction(t, r, n, i) {
    const s = this.options, a = s.ticks.callback;
    if (a)
      return Ne(a, [
        t,
        r,
        n
      ], this);
    const o = s.time.displayFormats, l = this._unit, c = this._majorUnit, f = l && o[l], h = c && o[c], u = n[r], d = c && h && u && u.major;
    return this._adapter.format(t, i || (d ? h : f));
  }
  generateTickLabels(t) {
    let r, n, i;
    for (r = 0, n = t.length; r < n; ++r)
      i = t[r], i.label = this._tickFormatFunction(i.value, r, t);
  }
  getDecimalForValue(t) {
    return t === null ? NaN : (t - this.min) / (this.max - this.min);
  }
  getPixelForValue(t) {
    const r = this._offsets, n = this.getDecimalForValue(t);
    return this.getPixelForDecimal((r.start + n) * r.factor);
  }
  getValueForPixel(t) {
    const r = this._offsets, n = this.getDecimalForPixel(t) / r.factor - r.end;
    return this.min + n * (this.max - this.min);
  }
  _getLabelSize(t) {
    const r = this.options.ticks, n = this.ctx.measureText(t).width, i = pr(this.isHorizontal() ? r.maxRotation : r.minRotation), s = Math.cos(i), a = Math.sin(i), o = this._resolveTickFontOptions(0).size;
    return {
      w: n * s + o * a,
      h: n * a + o * s
    };
  }
  _getLabelCapacity(t) {
    const r = this.options.time, n = r.displayFormats, i = n[r.unit] || n.millisecond, s = this._tickFormatFunction(t, 0, Ph(this, [
      t
    ], this._majorUnit), i), a = this._getLabelSize(s), o = Math.floor(this.isHorizontal() ? this.width / a.w : this.height / a.h) - 1;
    return o > 0 ? o : 1;
  }
  getDataTimestamps() {
    let t = this._cache.data || [], r, n;
    if (t.length)
      return t;
    const i = this.getMatchingVisibleMetas();
    if (this._normalized && i.length)
      return this._cache.data = i[0].controller.getAllParsedValues(this);
    for (r = 0, n = i.length; r < n; ++r)
      t = t.concat(i[r].controller.getAllParsedValues(this));
    return this._cache.data = this.normalize(t);
  }
  getLabelTimestamps() {
    const t = this._cache.labels || [];
    let r, n;
    if (t.length)
      return t;
    const i = this.getLabels();
    for (r = 0, n = i.length; r < n; ++r)
      t.push(Fh(this, i[r]));
    return this._cache.labels = this._normalized ? t : this.normalize(t);
  }
  normalize(t) {
    return L0(t.sort(Dh));
  }
}
ie(Ds, "id", "time"), ie(Ds, "defaults", {
  bounds: "data",
  adapters: {},
  time: {
    parser: !1,
    unit: !1,
    round: !1,
    isoWeekday: !1,
    minUnit: "millisecond",
    displayFormats: {}
  },
  ticks: {
    source: "auto",
    callback: !1,
    major: {
      enabled: !1
    }
  }
});
function pa(e, t, r) {
  let n = 0, i = e.length - 1, s, a, o, l;
  r ? (t >= e[n].pos && t <= e[i].pos && ({ lo: n, hi: i } = Xr(e, "pos", t)), { pos: s, time: o } = e[n], { pos: a, time: l } = e[i]) : (t >= e[n].time && t <= e[i].time && ({ lo: n, hi: i } = Xr(e, "time", t)), { time: s, pos: o } = e[n], { time: a, pos: l } = e[i]);
  const c = a - s;
  return c ? o + (l - o) * (t - s) / c : o;
}
class Il extends Ds {
  constructor(t) {
    super(t), this._table = [], this._minPos = void 0, this._tableRange = void 0;
  }
  initOffsets() {
    const t = this._getTimestampsForTable(), r = this._table = this.buildLookupTable(t);
    this._minPos = pa(r, this.min), this._tableRange = pa(r, this.max) - this._minPos, super.initOffsets(t);
  }
  buildLookupTable(t) {
    const { min: r, max: n } = this, i = [], s = [];
    let a, o, l, c, f;
    for (a = 0, o = t.length; a < o; ++a)
      c = t[a], c >= r && c <= n && i.push(c);
    if (i.length < 2)
      return [
        {
          time: r,
          pos: 0
        },
        {
          time: n,
          pos: 1
        }
      ];
    for (a = 0, o = i.length; a < o; ++a)
      f = i[a + 1], l = i[a - 1], c = i[a], Math.round((f + l) / 2) !== c && s.push({
        time: c,
        pos: a / (o - 1)
      });
    return s;
  }
  _generate() {
    const t = this.min, r = this.max;
    let n = super.getDataTimestamps();
    return (!n.includes(t) || !n.length) && n.splice(0, 0, t), (!n.includes(r) || n.length === 1) && n.push(r), n.sort((i, s) => i - s);
  }
  _getTimestampsForTable() {
    let t = this._cache.all || [];
    if (t.length)
      return t;
    const r = this.getDataTimestamps(), n = this.getLabelTimestamps();
    return r.length && n.length ? t = this.normalize(r.concat(n)) : t = r.length ? r : n, t = this._cache.all = t, t;
  }
  getDecimalForValue(t) {
    return (pa(this._table, t) - this._minPos) / this._tableRange;
  }
  getValueForPixel(t) {
    const r = this._offsets, n = this.getDecimalForPixel(t) / r.factor - r.end;
    return pa(this._table, n * this._tableRange + this._minPos, !0);
  }
}
ie(Il, "id", "timeseries"), ie(Il, "defaults", Ds.defaults);
var Dv = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  CategoryScale: Cl,
  LinearScale: Ml,
  LogarithmicScale: Pl,
  RadialLinearScale: is,
  TimeScale: Ds,
  TimeSeriesScale: Il
});
const Fv = [
  Lm,
  u_,
  av,
  Dv
];
$r.register(...Fv);
/*!
 * chartjs-plugin-datalabels v2.2.0
 * https://chartjs-plugin-datalabels.netlify.app
 * (c) 2017-2022 chartjs-plugin-datalabels contributors
 * Released under the MIT license
 */
var Rh = function() {
  if (typeof window < "u") {
    if (window.devicePixelRatio)
      return window.devicePixelRatio;
    var e = window.screen;
    if (e)
      return (e.deviceXDPI || 1) / (e.logicalXDPI || 1);
  }
  return 1;
}(), ds = {
  // @todo move this in Chart.helpers.toTextLines
  toTextLines: function(e) {
    var t = [], r;
    for (e = [].concat(e); e.length; )
      r = e.pop(), typeof r == "string" ? t.unshift.apply(t, r.split(`
`)) : Array.isArray(r) ? e.push.apply(e, r) : Te(e) || t.unshift("" + r);
    return t;
  },
  // @todo move this in Chart.helpers.canvas.textSize
  // @todo cache calls of measureText if font doesn't change?!
  textSize: function(e, t, r) {
    var n = [].concat(t), i = n.length, s = e.font, a = 0, o;
    for (e.font = r.string, o = 0; o < i; ++o)
      a = Math.max(e.measureText(n[o]).width, a);
    return e.font = s, {
      height: i * r.lineHeight,
      width: a
    };
  },
  /**
   * Returns value bounded by min and max. This is equivalent to max(min, min(value, max)).
   * @todo move this method in Chart.helpers.bound
   * https://doc.qt.io/qt-5/qtglobal.html#qBound
   */
  bound: function(e, t, r) {
    return Math.max(e, Math.min(t, r));
  },
  /**
   * Returns an array of pair [value, state] where state is:
   * * -1: value is only in a0 (removed)
   * *  1: value is only in a1 (added)
   */
  arrayDiff: function(e, t) {
    var r = e.slice(), n = [], i, s, a, o;
    for (i = 0, a = t.length; i < a; ++i)
      o = t[i], s = r.indexOf(o), s === -1 ? n.push([o, 1]) : r.splice(s, 1);
    for (i = 0, a = r.length; i < a; ++i)
      n.push([r[i], -1]);
    return n;
  },
  /**
   * https://github.com/chartjs/chartjs-plugin-datalabels/issues/70
   */
  rasterize: function(e) {
    return Math.round(e * Rh) / Rh;
  }
};
function al(e, t) {
  var r = t.x, n = t.y;
  if (r === null)
    return { x: 0, y: -1 };
  if (n === null)
    return { x: 1, y: 0 };
  var i = e.x - r, s = e.y - n, a = Math.sqrt(i * i + s * s);
  return {
    x: a ? i / a : 0,
    y: a ? s / a : -1
  };
}
function Cv(e, t, r, n, i) {
  switch (i) {
    case "center":
      r = n = 0;
      break;
    case "bottom":
      r = 0, n = 1;
      break;
    case "right":
      r = 1, n = 0;
      break;
    case "left":
      r = -1, n = 0;
      break;
    case "top":
      r = 0, n = -1;
      break;
    case "start":
      r = -r, n = -n;
      break;
    case "end":
      break;
    default:
      i *= Math.PI / 180, r = Math.cos(i), n = Math.sin(i);
      break;
  }
  return {
    x: e,
    y: t,
    vx: r,
    vy: n
  };
}
var Mv = 0, bu = 1, Eu = 2, Au = 4, ku = 8;
function ma(e, t, r) {
  var n = Mv;
  return e < r.left ? n |= bu : e > r.right && (n |= Eu), t < r.top ? n |= ku : t > r.bottom && (n |= Au), n;
}
function Pv(e, t) {
  for (var r = e.x0, n = e.y0, i = e.x1, s = e.y1, a = ma(r, n, t), o = ma(i, s, t), l, c, f; !(!(a | o) || a & o); )
    l = a || o, l & ku ? (c = r + (i - r) * (t.top - n) / (s - n), f = t.top) : l & Au ? (c = r + (i - r) * (t.bottom - n) / (s - n), f = t.bottom) : l & Eu ? (f = n + (s - n) * (t.right - r) / (i - r), c = t.right) : l & bu && (f = n + (s - n) * (t.left - r) / (i - r), c = t.left), l === a ? (r = c, n = f, a = ma(r, n, t)) : (i = c, s = f, o = ma(i, s, t));
  return {
    x0: r,
    x1: i,
    y0: n,
    y1: s
  };
}
function xa(e, t) {
  var r = t.anchor, n = e, i, s;
  return t.clamp && (n = Pv(n, t.area)), r === "start" ? (i = n.x0, s = n.y0) : r === "end" ? (i = n.x1, s = n.y1) : (i = (n.x0 + n.x1) / 2, s = (n.y0 + n.y1) / 2), Cv(i, s, e.vx, e.vy, t.align);
}
var _a = {
  arc: function(e, t) {
    var r = (e.startAngle + e.endAngle) / 2, n = Math.cos(r), i = Math.sin(r), s = e.innerRadius, a = e.outerRadius;
    return xa({
      x0: e.x + n * s,
      y0: e.y + i * s,
      x1: e.x + n * a,
      y1: e.y + i * a,
      vx: n,
      vy: i
    }, t);
  },
  point: function(e, t) {
    var r = al(e, t.origin), n = r.x * e.options.radius, i = r.y * e.options.radius;
    return xa({
      x0: e.x - n,
      y0: e.y - i,
      x1: e.x + n,
      y1: e.y + i,
      vx: r.x,
      vy: r.y
    }, t);
  },
  bar: function(e, t) {
    var r = al(e, t.origin), n = e.x, i = e.y, s = 0, a = 0;
    return e.horizontal ? (n = Math.min(e.x, e.base), s = Math.abs(e.base - e.x)) : (i = Math.min(e.y, e.base), a = Math.abs(e.base - e.y)), xa({
      x0: n,
      y0: i + a,
      x1: n + s,
      y1: i,
      vx: r.x,
      vy: r.y
    }, t);
  },
  fallback: function(e, t) {
    var r = al(e, t.origin);
    return xa({
      x0: e.x,
      y0: e.y,
      x1: e.x + (e.width || 0),
      y1: e.y + (e.height || 0),
      vx: r.x,
      vy: r.y
    }, t);
  }
}, qr = ds.rasterize;
function Rv(e) {
  var t = e.borderWidth || 0, r = e.padding, n = e.size.height, i = e.size.width, s = -i / 2, a = -n / 2;
  return {
    frame: {
      x: s - r.left - t,
      y: a - r.top - t,
      w: i + r.width + t * 2,
      h: n + r.height + t * 2
    },
    text: {
      x: s,
      y: a,
      w: i,
      h: n
    }
  };
}
function Iv(e, t) {
  var r = t.chart.getDatasetMeta(t.datasetIndex).vScale;
  if (!r)
    return null;
  if (r.xCenter !== void 0 && r.yCenter !== void 0)
    return { x: r.xCenter, y: r.yCenter };
  var n = r.getBasePixel();
  return e.horizontal ? { x: n, y: null } : { x: null, y: n };
}
function Lv(e) {
  return e instanceof yi ? _a.arc : e instanceof hs ? _a.point : e instanceof us ? _a.bar : _a.fallback;
}
function Nv(e, t, r, n, i, s) {
  var a = Math.PI / 2;
  if (s) {
    var o = Math.min(s, i / 2, n / 2), l = t + o, c = r + o, f = t + n - o, h = r + i - o;
    e.moveTo(t, c), l < f && c < h ? (e.arc(l, c, o, -Math.PI, -a), e.arc(f, c, o, -a, 0), e.arc(f, h, o, 0, a), e.arc(l, h, o, a, Math.PI)) : l < f ? (e.moveTo(l, r), e.arc(f, c, o, -a, a), e.arc(l, c, o, a, Math.PI + a)) : c < h ? (e.arc(l, c, o, -Math.PI, 0), e.arc(l, h, o, 0, Math.PI)) : e.arc(l, c, o, -Math.PI, Math.PI), e.closePath(), e.moveTo(t, r);
  } else
    e.rect(t, r, n, i);
}
function Bv(e, t, r) {
  var n = r.backgroundColor, i = r.borderColor, s = r.borderWidth;
  !n && (!i || !s) || (e.beginPath(), Nv(
    e,
    qr(t.x) + s / 2,
    qr(t.y) + s / 2,
    qr(t.w) - s,
    qr(t.h) - s,
    r.borderRadius
  ), e.closePath(), n && (e.fillStyle = n, e.fill()), i && s && (e.strokeStyle = i, e.lineWidth = s, e.lineJoin = "miter", e.stroke()));
}
function Wv(e, t, r) {
  var n = r.lineHeight, i = e.w, s = e.x, a = e.y + n / 2;
  return t === "center" ? s += i / 2 : (t === "end" || t === "right") && (s += i), {
    h: n,
    w: i,
    x: s,
    y: a
  };
}
function Uv(e, t, r) {
  var n = e.shadowBlur, i = r.stroked, s = qr(r.x), a = qr(r.y), o = qr(r.w);
  i && e.strokeText(t, s, a, o), r.filled && (n && i && (e.shadowBlur = 0), e.fillText(t, s, a, o), n && i && (e.shadowBlur = n));
}
function zv(e, t, r, n) {
  var i = n.textAlign, s = n.color, a = !!s, o = n.font, l = t.length, c = n.textStrokeColor, f = n.textStrokeWidth, h = c && f, u;
  if (!(!l || !a && !h))
    for (r = Wv(r, i, o), e.font = o.string, e.textAlign = i, e.textBaseline = "middle", e.shadowBlur = n.textShadowBlur, e.shadowColor = n.textShadowColor, a && (e.fillStyle = s), h && (e.lineJoin = "round", e.lineWidth = f, e.strokeStyle = c), u = 0, l = t.length; u < l; ++u)
      Uv(e, t[u], {
        stroked: h,
        filled: a,
        w: r.w,
        x: r.x,
        y: r.y + r.h * u
      });
}
var Ou = function(e, t, r, n) {
  var i = this;
  i._config = e, i._index = n, i._model = null, i._rects = null, i._ctx = t, i._el = r;
};
Mr(Ou.prototype, {
  /**
   * @private
   */
  _modelize: function(e, t, r, n) {
    var i = this, s = i._index, a = ft(ze([r.font, {}], n, s)), o = ze([r.color, Qe.color], n, s);
    return {
      align: ze([r.align, "center"], n, s),
      anchor: ze([r.anchor, "center"], n, s),
      area: n.chart.chartArea,
      backgroundColor: ze([r.backgroundColor, null], n, s),
      borderColor: ze([r.borderColor, null], n, s),
      borderRadius: ze([r.borderRadius, 0], n, s),
      borderWidth: ze([r.borderWidth, 0], n, s),
      clamp: ze([r.clamp, !1], n, s),
      clip: ze([r.clip, !1], n, s),
      color: o,
      display: e,
      font: a,
      lines: t,
      offset: ze([r.offset, 4], n, s),
      opacity: ze([r.opacity, 1], n, s),
      origin: Iv(i._el, n),
      padding: Et(ze([r.padding, 4], n, s)),
      positioner: Lv(i._el),
      rotation: ze([r.rotation, 0], n, s) * (Math.PI / 180),
      size: ds.textSize(i._ctx, t, a),
      textAlign: ze([r.textAlign, "start"], n, s),
      textShadowBlur: ze([r.textShadowBlur, 0], n, s),
      textShadowColor: ze([r.textShadowColor, o], n, s),
      textStrokeColor: ze([r.textStrokeColor, o], n, s),
      textStrokeWidth: ze([r.textStrokeWidth, 0], n, s)
    };
  },
  update: function(e) {
    var t = this, r = null, n = null, i = t._index, s = t._config, a, o, l, c = ze([s.display, !0], e, i);
    c && (a = e.dataset.data[i], o = xe(Ne(s.formatter, [a, e]), a), l = Te(o) ? [] : ds.toTextLines(o), l.length && (r = t._modelize(c, l, s, e), n = Rv(r))), t._model = r, t._rects = n;
  },
  geometry: function() {
    return this._rects ? this._rects.frame : {};
  },
  rotation: function() {
    return this._model ? this._model.rotation : 0;
  },
  visible: function() {
    return this._model && this._model.opacity;
  },
  model: function() {
    return this._model;
  },
  draw: function(e, t) {
    var r = this, n = e.ctx, i = r._model, s = r._rects, a;
    this.visible() && (n.save(), i.clip && (a = i.area, n.beginPath(), n.rect(
      a.left,
      a.top,
      a.right - a.left,
      a.bottom - a.top
    ), n.clip()), n.globalAlpha = ds.bound(0, i.opacity, 1), n.translate(qr(t.x), qr(t.y)), n.rotate(i.rotation), Bv(n, s.frame, i), zv(n, i.lines, s.text, i), n.restore());
  }
});
var Hv = Number.MIN_SAFE_INTEGER || -9007199254740991, Vv = Number.MAX_SAFE_INTEGER || 9007199254740991;
function Zi(e, t, r) {
  var n = Math.cos(r), i = Math.sin(r), s = t.x, a = t.y;
  return {
    x: s + n * (e.x - s) - i * (e.y - a),
    y: a + i * (e.x - s) + n * (e.y - a)
  };
}
function Ih(e, t) {
  var r = Vv, n = Hv, i = t.origin, s, a, o, l, c;
  for (s = 0; s < e.length; ++s)
    a = e[s], o = a.x - i.x, l = a.y - i.y, c = t.vx * o + t.vy * l, r = Math.min(r, c), n = Math.max(n, c);
  return {
    min: r,
    max: n
  };
}
function va(e, t) {
  var r = t.x - e.x, n = t.y - e.y, i = Math.sqrt(r * r + n * n);
  return {
    vx: (t.x - e.x) / i,
    vy: (t.y - e.y) / i,
    origin: e,
    ln: i
  };
}
var Du = function() {
  this._rotation = 0, this._rect = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  };
};
Mr(Du.prototype, {
  center: function() {
    var e = this._rect;
    return {
      x: e.x + e.w / 2,
      y: e.y + e.h / 2
    };
  },
  update: function(e, t, r) {
    this._rotation = r, this._rect = {
      x: t.x + e.x,
      y: t.y + e.y,
      w: t.w,
      h: t.h
    };
  },
  contains: function(e) {
    var t = this, r = 1, n = t._rect;
    return e = Zi(e, t.center(), -t._rotation), !(e.x < n.x - r || e.y < n.y - r || e.x > n.x + n.w + r * 2 || e.y > n.y + n.h + r * 2);
  },
  // Separating Axis Theorem
  // https://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169
  intersects: function(e) {
    var t = this._points(), r = e._points(), n = [
      va(t[0], t[1]),
      va(t[0], t[3])
    ], i, s, a;
    for (this._rotation !== e._rotation && n.push(
      va(r[0], r[1]),
      va(r[0], r[3])
    ), i = 0; i < n.length; ++i)
      if (s = Ih(t, n[i]), a = Ih(r, n[i]), s.max < a.min || a.max < s.min)
        return !1;
    return !0;
  },
  /**
   * @private
   */
  _points: function() {
    var e = this, t = e._rect, r = e._rotation, n = e.center();
    return [
      Zi({ x: t.x, y: t.y }, n, r),
      Zi({ x: t.x + t.w, y: t.y }, n, r),
      Zi({ x: t.x + t.w, y: t.y + t.h }, n, r),
      Zi({ x: t.x, y: t.y + t.h }, n, r)
    ];
  }
});
function Fu(e, t, r) {
  var n = t.positioner(e, t), i = n.vx, s = n.vy;
  if (!i && !s)
    return { x: n.x, y: n.y };
  var a = r.w, o = r.h, l = t.rotation, c = Math.abs(a / 2 * Math.cos(l)) + Math.abs(o / 2 * Math.sin(l)), f = Math.abs(a / 2 * Math.sin(l)) + Math.abs(o / 2 * Math.cos(l)), h = 1 / Math.max(Math.abs(i), Math.abs(s));
  return c *= i * h, f *= s * h, c += t.offset * i, f += t.offset * s, {
    x: n.x + c,
    y: n.y + f
  };
}
function Yv(e, t) {
  var r, n, i, s;
  for (r = e.length - 1; r >= 0; --r)
    for (i = e[r].$layout, n = r - 1; n >= 0 && i._visible; --n)
      s = e[n].$layout, s._visible && i._box.intersects(s._box) && t(i, s);
  return e;
}
function jv(e) {
  var t, r, n, i, s, a, o;
  for (t = 0, r = e.length; t < r; ++t)
    n = e[t], i = n.$layout, i._visible && (o = new Proxy(n._el, { get: (l, c) => l.getProps([c], !0)[c] }), s = n.geometry(), a = Fu(o, n.model(), s), i._box.update(a, s, n.rotation()));
  return Yv(e, function(l, c) {
    var f = l._hidable, h = c._hidable;
    f && h || h ? c._visible = !1 : f && (l._visible = !1);
  });
}
var gs = {
  prepare: function(e) {
    var t = [], r, n, i, s, a;
    for (r = 0, i = e.length; r < i; ++r)
      for (n = 0, s = e[r].length; n < s; ++n)
        a = e[r][n], t.push(a), a.$layout = {
          _box: new Du(),
          _hidable: !1,
          _visible: !0,
          _set: r,
          _idx: a._index
        };
    return t.sort(function(o, l) {
      var c = o.$layout, f = l.$layout;
      return c._idx === f._idx ? f._set - c._set : f._idx - c._idx;
    }), this.update(t), t;
  },
  update: function(e) {
    var t = !1, r, n, i, s, a;
    for (r = 0, n = e.length; r < n; ++r)
      i = e[r], s = i.model(), a = i.$layout, a._hidable = s && s.display === "auto", a._visible = i.visible(), t |= a._hidable;
    t && jv(e);
  },
  lookup: function(e, t) {
    var r, n;
    for (r = e.length - 1; r >= 0; --r)
      if (n = e[r].$layout, n && n._visible && n._box.contains(t))
        return e[r];
    return null;
  },
  draw: function(e, t) {
    var r, n, i, s, a, o;
    for (r = 0, n = t.length; r < n; ++r)
      i = t[r], s = i.$layout, s._visible && (a = i.geometry(), o = Fu(i._el, i.model(), a), s._box.update(o, a, i.rotation()), i.draw(e, o));
  }
}, $v = function(e) {
  if (Te(e))
    return null;
  var t = e, r, n, i;
  if (be(e))
    if (!Te(e.label))
      t = e.label;
    else if (!Te(e.r))
      t = e.r;
    else
      for (t = "", r = Object.keys(e), i = 0, n = r.length; i < n; ++i)
        t += (i !== 0 ? ", " : "") + r[i] + ": " + e[r[i]];
  return "" + t;
}, Gv = {
  align: "center",
  anchor: "center",
  backgroundColor: null,
  borderColor: null,
  borderRadius: 0,
  borderWidth: 0,
  clamp: !1,
  clip: !1,
  color: void 0,
  display: !0,
  font: {
    family: void 0,
    lineHeight: 1.2,
    size: void 0,
    style: void 0,
    weight: null
  },
  formatter: $v,
  labels: void 0,
  listeners: {},
  offset: 4,
  opacity: 1,
  padding: {
    top: 4,
    right: 4,
    bottom: 4,
    left: 4
  },
  rotation: 0,
  textAlign: "start",
  textStrokeColor: void 0,
  textStrokeWidth: 0,
  textShadowBlur: 0,
  textShadowColor: void 0
}, Ht = "$datalabels", Cu = "$default";
function Xv(e, t) {
  var r = e.datalabels, n = {}, i = [], s, a;
  return r === !1 ? null : (r === !0 && (r = {}), t = Mr({}, [t, r]), s = t.labels || {}, a = Object.keys(s), delete t.labels, a.length ? a.forEach(function(o) {
    s[o] && i.push(Mr({}, [
      t,
      s[o],
      { _key: o }
    ]));
  }) : i.push(t), n = i.reduce(function(o, l) {
    return Me(l.listeners || {}, function(c, f) {
      o[f] = o[f] || {}, o[f][l._key || Cu] = c;
    }), delete l.listeners, o;
  }, {}), {
    labels: i,
    listeners: n
  });
}
function Ll(e, t, r, n) {
  if (t) {
    var i = r.$context, s = r.$groups, a;
    t[s._set] && (a = t[s._set][s._key], a && Ne(a, [i, n]) === !0 && (e[Ht]._dirty = !0, r.update(i)));
  }
}
function Kv(e, t, r, n, i) {
  var s, a;
  !r && !n || (r ? n ? r !== n && (a = s = !0) : a = !0 : s = !0, a && Ll(e, t.leave, r, i), s && Ll(e, t.enter, n, i));
}
function qv(e, t) {
  var r = e[Ht], n = r._listeners, i, s;
  if (!(!n.enter && !n.leave)) {
    if (t.type === "mousemove")
      s = gs.lookup(r._labels, t);
    else if (t.type !== "mouseout")
      return;
    i = r._hovered, r._hovered = s, Kv(e, n, i, s, t);
  }
}
function Zv(e, t) {
  var r = e[Ht], n = r._listeners.click, i = n && gs.lookup(r._labels, t);
  i && Ll(e, n, i, t);
}
var Jv = {
  id: "datalabels",
  defaults: Gv,
  beforeInit: function(e) {
    e[Ht] = {
      _actives: []
    };
  },
  beforeUpdate: function(e) {
    var t = e[Ht];
    t._listened = !1, t._listeners = {}, t._datasets = [], t._labels = [];
  },
  afterDatasetUpdate: function(e, t, r) {
    var n = t.index, i = e[Ht], s = i._datasets[n] = [], a = e.isDatasetVisible(n), o = e.data.datasets[n], l = Xv(o, r), c = t.meta.data || [], f = e.ctx, h, u, d, p, g, m, v, w;
    for (f.save(), h = 0, d = c.length; h < d; ++h)
      if (v = c[h], v[Ht] = [], a && v && e.getDataVisibility(h) && !v.skip)
        for (u = 0, p = l.labels.length; u < p; ++u)
          g = l.labels[u], m = g._key, w = new Ou(g, f, v, h), w.$groups = {
            _set: n,
            _key: m || Cu
          }, w.$context = {
            active: !1,
            chart: e,
            dataIndex: h,
            dataset: o,
            datasetIndex: n
          }, w.update(w.$context), v[Ht].push(w), s.push(w);
    f.restore(), Mr(i._listeners, l.listeners, {
      merger: function(S, D, P) {
        D[S] = D[S] || {}, D[S][t.index] = P[S], i._listened = !0;
      }
    });
  },
  afterUpdate: function(e) {
    e[Ht]._labels = gs.prepare(e[Ht]._datasets);
  },
  // Draw labels on top of all dataset elements
  // https://github.com/chartjs/chartjs-plugin-datalabels/issues/29
  // https://github.com/chartjs/chartjs-plugin-datalabels/issues/32
  afterDatasetsDraw: function(e) {
    gs.draw(e, e[Ht]._labels);
  },
  beforeEvent: function(e, t) {
    if (e[Ht]._listened) {
      var r = t.event;
      switch (r.type) {
        case "mousemove":
        case "mouseout":
          qv(e, r);
          break;
        case "click":
          Zv(e, r);
          break;
      }
    }
  },
  afterEvent: function(e) {
    var t = e[Ht], r = t._actives, n = t._actives = e.getActiveElements(), i = ds.arrayDiff(r, n), s, a, o, l, c, f, h;
    for (s = 0, a = i.length; s < a; ++s)
      if (c = i[s], c[1])
        for (h = c[0].element[Ht] || [], o = 0, l = h.length; o < l; ++o)
          f = h[o], f.$context.active = c[1] === 1, f.update(f.$context);
    (t._dirty || i.length) && (gs.update(t._labels), e.render()), delete t._dirty;
  }
}, Qv = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function e2(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Mu = { exports: {} };
(function(e, t) {
  (function(r, n) {
    e.exports = n();
  })(Qv, function() {
    var r = "rgba(100, 100, 100, 0.7)", n = "rgba(255, 255, 255, 0.8)", i = "round", s = function(C, x) {
      if (!(C instanceof x))
        throw new TypeError("Cannot call a class as a function");
    }, a = /* @__PURE__ */ function() {
      function C(x, k) {
        for (var F = 0; F < k.length; F++) {
          var Y = k[F];
          Y.enumerable = Y.enumerable || !1, Y.configurable = !0, "value" in Y && (Y.writable = !0), Object.defineProperty(x, Y.key, Y);
        }
      }
      return function(x, k, F) {
        return k && C(x.prototype, k), F && C(x, F), x;
      };
    }(), o = Object.assign || function(C) {
      for (var x = 1; x < arguments.length; x++) {
        var k = arguments[x];
        for (var F in k)
          Object.prototype.hasOwnProperty.call(k, F) && (C[F] = k[F]);
      }
      return C;
    }, l = function(C, x) {
      if (typeof x != "function" && x !== null)
        throw new TypeError("Super expression must either be null or a function, not " + typeof x);
      C.prototype = Object.create(x && x.prototype, {
        constructor: {
          value: C,
          enumerable: !1,
          writable: !0,
          configurable: !0
        }
      }), x && (Object.setPrototypeOf ? Object.setPrototypeOf(C, x) : C.__proto__ = x);
    }, c = function(C, x) {
      if (!C)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      return x && (typeof x == "object" || typeof x == "function") ? x : C;
    }, f = function() {
      function C() {
        var x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 20, k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : r, F = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : n;
        return s(this, C), this._canvas = document.createElement("canvas"), this._context = this._canvas.getContext("2d"), this._canvas.width = x, this._canvas.height = x, this._context.fillStyle = k, this._context.fillRect(0, 0, this._canvas.width, this._canvas.height), this._size = x, this._patternColor = F, this;
      }
      return a(C, [{
        key: "setStrokeProps",
        value: function() {
          this._context.strokeStyle = this._patternColor, this._context.lineWidth = this._size / 10, this._context.lineJoin = i, this._context.lineCap = i;
        }
      }, {
        key: "setFillProps",
        value: function() {
          this._context.fillStyle = this._patternColor;
        }
      }]), C;
    }(), h = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          return this._context.beginPath(), this.setStrokeProps(), this.drawPlus(), this.drawPlus(F, F), this._context.stroke(), this._canvas;
        }
      }, {
        key: "drawPlus",
        value: function() {
          var F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, Z = this._size, K = Z / 2, j = Z / 4;
          this._context.moveTo(j + F, 0 + Y), this._context.lineTo(j + F, K + Y), this._context.moveTo(0 + F, j + Y), this._context.lineTo(K + F, j + Y), this._context.closePath();
        }
      }]), x;
    }(f), u = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          return this._context.beginPath(), this.setStrokeProps(), this.drawCross(), this.drawCross(F, F), this._context.stroke(), this._canvas;
        }
      }, {
        key: "drawCross",
        value: function() {
          var F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, Z = this._size, K = Z / 2, j = 2;
          this._context.moveTo(F + j, Y + j), this._context.lineTo(K - j + F, K - j + Y), this._context.moveTo(F + j, K - j + Y), this._context.lineTo(K - j + F, Y + j), this._context.closePath();
        }
      }]), x;
    }(f), d = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          return this._context.beginPath(), this.setStrokeProps(), this.drawDash(), this.drawDash(F, F), this._context.stroke(), this._canvas;
        }
      }, {
        key: "drawDash",
        value: function() {
          var F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, Z = this._size, K = Z / 2, j = 2;
          this._context.moveTo(F + j, Y + j), this._context.lineTo(K - j + F, K - j + Y), this._context.closePath();
        }
      }]), x;
    }(f), p = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          this._context.beginPath(), this.setStrokeProps();
          var Y = new u();
          Y.drawCross.call(this);
          var Z = new d();
          return Z.drawDash.call(this, F, F), this._context.stroke(), this._canvas;
        }
      }]), x;
    }(f), g = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          return this._context.beginPath(), this.setFillProps(), this.drawDot(), this.drawDot(F, F), this._context.fill(), this._canvas;
        }
      }, {
        key: "drawDot",
        value: function() {
          var F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, Z = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : this._size / 10, K = this._size, j = K / 4, Ae = j + F, we = j + Y;
          this._context.moveTo(Ae + j, we), this._context.arc(Ae, we, Z, 0, 2 * Math.PI), this._context.closePath();
        }
      }]), x;
    }(f), m = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          this._context.beginPath(), this.setStrokeProps();
          var Y = new d();
          Y.drawDash.call(this, F, F), this._context.closePath(), this._context.stroke(), this.setFillProps();
          var Z = new g();
          return Z.drawDot.call(this), this._context.fill(), this._canvas;
        }
      }]), x;
    }(f), v = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2, Y = this._size / 5;
          return this._context.beginPath(), this.setFillProps(), this.drawDot(0, 0, Y), this.drawDot(F, F, Y), this._context.fill(), this._canvas;
        }
      }]), x;
    }(g), w = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2, Y = this._size / 5;
          return this._context.beginPath(), this.setStrokeProps(), this.drawDot(0, 0, Y), this.drawDot(F, F, Y), this._context.stroke(), this._canvas;
        }
      }]), x;
    }(g), S = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          return this._context.beginPath(), this.setStrokeProps(), this.drawLine(), this.drawLine(F, F), this._context.stroke(), this._canvas;
        }
      }, {
        key: "drawLine",
        value: function() {
          var F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, Y = this._size, Z = Y / 4;
          this._context.moveTo(0, Z + F), this._context.lineTo(this._size, Z + F), this._context.closePath();
        }
      }]), x;
    }(f), D = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          return this._context.translate(this._size, 0), this._context.rotate(90 * Math.PI / 180), S.prototype.drawTile.call(this), this._canvas;
        }
      }]), x;
    }(S), P = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          return this._context.beginPath(), this.setStrokeProps(), this.drawWeave(0, 0), this._context.stroke(), this._canvas;
        }
      }, {
        key: "drawWeave",
        value: function(F, Y) {
          var Z = this._size, K = Z / 2;
          this._context.moveTo(F + 1, Y + 1), this._context.lineTo(K - 1, K - 1), this._context.moveTo(K + 1, Z - 1), this._context.lineTo(Z - 1, K + 1), this._context.closePath();
        }
      }]), x;
    }(f), N = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          return this._context.beginPath(), this.setStrokeProps(), this.drawZigzag(), this.drawZigzag(this._size / 2), this._context.stroke(), this._canvas;
        }
      }, {
        key: "drawZigzag",
        value: function() {
          var F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = this._size, Z = Y / 4, K = Y / 2, j = Y / 10;
          this._context.moveTo(0, j + F), this._context.lineTo(Z, K - j + F), this._context.lineTo(K, j + F), this._context.lineTo(Y - Z, K - j + F), this._context.lineTo(Y, j + F);
        }
      }]), x;
    }(f), O = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          return this._context.translate(this._size, 0), this._context.rotate(90 * Math.PI / 180), N.prototype.drawTile.call(this), this._canvas;
        }
      }]), x;
    }(N), I = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          return this._context.beginPath(), this.setStrokeProps(), this.drawDiagonalLine(), this.drawDiagonalLine(F, F), this._context.stroke(), this._canvas;
        }
      }, {
        key: "drawDiagonalLine",
        value: function() {
          var F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, Z = this._size, K = Z / 2, j = 1;
          this._context.moveTo(K - j - F, j * -1 + Y), this._context.lineTo(Z + 1 - F, K + 1 + Y), this._context.closePath();
        }
      }]), x;
    }(f), R = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          return this._context.translate(this._size, 0), this._context.rotate(90 * Math.PI / 180), I.prototype.drawTile.call(this), this._canvas;
        }
      }]), x;
    }(I), z = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          return this._context.beginPath(), this.setFillProps(), this.drawSquare(), this.drawSquare(F, F), this._context.fill(), this._canvas;
        }
      }, {
        key: "drawSquare",
        value: function() {
          var F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, Z = this._size, K = Z / 2, j = Z / 20;
          this._context.fillRect(F + j, Y + j, K - j * 2, K - j * 2), this._context.closePath();
        }
      }]), x;
    }(f), H = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          return this._context.beginPath(), this.setStrokeProps(), this.drawBox(), this.drawBox(F, F), this._context.stroke(), this._canvas;
        }
      }, {
        key: "drawBox",
        value: function() {
          var F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, Z = this._size, K = Z / 2, j = Z / 20;
          this._context.strokeRect(F + j, Y + j, K - j * 4, K - j * 4), this._context.closePath();
        }
      }]), x;
    }(f), V = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          return this._context.beginPath(), this.setFillProps(), this.drawTriangle(), this.drawTriangle(F, F), this._context.fill(), this._canvas;
        }
      }, {
        key: "drawTriangle",
        value: function() {
          var F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, Z = this._size, K = Z / 2, j = Z / 4;
          this._context.moveTo(j + F, Y), this._context.lineTo(K + F, K + Y), this._context.lineTo(F, K + Y), this._context.closePath();
        }
      }]), x;
    }(f), ee = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size;
          return this._context.translate(F, F), this._context.rotate(180 * Math.PI / 180), V.prototype.drawTile.call(this), this._canvas;
        }
      }]), x;
    }(V), ge = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          return this._context.beginPath(), this.setFillProps(), this.drawDiamond(), this.drawDiamond(F, F), this._context.fill(), this._canvas;
        }
      }, {
        key: "drawDiamond",
        value: function() {
          var F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, Z = this._size, K = Z / 2, j = Z / 4;
          this._context.moveTo(j + F, Y), this._context.lineTo(K + F, j + Y), this._context.lineTo(j + F, K + Y), this._context.lineTo(F, j + Y), this._context.closePath();
        }
      }]), x;
    }(f), ae = function(C) {
      l(x, C);
      function x() {
        return s(this, x), c(this, (x.__proto__ || Object.getPrototypeOf(x)).apply(this, arguments));
      }
      return a(x, [{
        key: "drawTile",
        value: function() {
          var F = this._size / 2;
          return this._context.beginPath(), this.setStrokeProps(), this.drawDiamond(), this.drawDiamond(F, F), this._context.stroke(), this._canvas;
        }
      }, {
        key: "drawDiamond",
        value: function() {
          var F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, Z = this._size, K = Z / 2 - 1, j = Z / 4;
          this._context.moveTo(j + F, Y + 1), this._context.lineTo(K + F, j + Y), this._context.lineTo(j + F, K + Y), this._context.lineTo(F + 1, j + Y), this._context.closePath();
        }
      }]), x;
    }(ge), de = {
      plus: h,
      cross: u,
      dash: d,
      "cross-dash": p,
      dot: g,
      "dot-dash": m,
      disc: v,
      ring: w,
      line: S,
      "line-vertical": D,
      weave: P,
      zigzag: N,
      "zigzag-vertical": O,
      diagonal: I,
      "diagonal-right-left": R,
      square: z,
      box: H,
      triangle: V,
      "triangle-inverted": ee,
      diamond: ge,
      "diamond-box": ae
    }, pe = {
      circle: de.disc,
      "triangle-vertical": de["triangle-inverted"],
      "line-horizontal": de.line,
      "line-diagonal-lr": de.diagonal,
      "line-diagonal-rl": de["diagonal-right-left"],
      "zigzag-horizontal": de.zigzag,
      "diamond-outline": de["diamond-box"]
    }, Ue = [];
    function ye() {
      var C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [], x = Object.keys(de);
      C.forEach(function(F) {
        x.splice(x.indexOf(F), 1);
      });
      var k = Math.floor(Math.random() * x.length);
      return x[k];
    }
    o(Ue, de, pe);
    function et() {
      var C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "square", x = arguments[1], k = arguments[2], F = arguments[3], Y = document.createElement("canvas"), Z = Y.getContext("2d"), K = F * 2, j = Ue[C], Ae = new j(F, x, k), we = Z.createPattern(Ae.drawTile(), "repeat");
      return Y.width = K, Y.height = K, we.shapeType = C, we;
    }
    function lt(C) {
      var x = void 0, k = void 0;
      return C.map(function(F, Y, Z) {
        var K = void 0;
        return Y === 0 ? (K = ye(), k = K, x = k) : Y === Z.length - 1 ? K = ye([k, x]) : (K = ye([k]), k = K), et(K, F);
      });
    }
    var M = {
      draw: et,
      generate: lt
    };
    return M;
  });
})(Mu);
var t2 = Mu.exports;
const r2 = /* @__PURE__ */ e2(t2);
var n2 = Object.defineProperty, i2 = Object.getOwnPropertyDescriptor, Hs = (e, t, r, n) => {
  for (var i = n > 1 ? void 0 : n ? i2(t, r) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (i = (n ? a(t, r, i) : a(i)) || i);
  return n && i && n2(t, r, i), i;
};
let Ri = class extends ri(ei) {
  connectedCallback() {
    super.connectedCallback(), setTimeout(() => {
      this.initChart();
    }, 100);
  }
  initChart() {
    if (!this.shadowRoot)
      return;
    const e = this.shadowRoot.querySelector("canvas"), t = {
      size: "15px",
      lineHeight: 1,
      family: "Lato"
    };
    let r = {
      type: this.type,
      data: this.data,
      plugins: [Jv]
    };
    if (this.type === "pie") {
      for (let n = 0; n < r.data.datasets.length; n++)
        r.data.datasets[n].backgroundColor = r.data.datasets[n].backgroundColor.map((i, s) => {
          const a = r.data.patterns[s];
          return a ? r2.draw(a, i) : i;
        });
      r.options = {}, r.options.plugins = {
        tooltip: {
          enabled: !0
        },
        datalabels: {
          clip: !0,
          backgroundColor: "#FFF",
          color: "#000",
          borderColor: "#000",
          borderWidth: 2,
          font: t,
          align: "top",
          display: "auto",
          formatter: (n, i) => {
            if (n) {
              const s = i.dataIndex;
              return n + " " + i.chart.data.labels[s];
            } else
              return null;
          }
        }
      };
    }
    this.type === "bar" && (r.options = {
      scales: {
        y: {
          ticks: {
            precision: 0
          }
        }
      },
      plugins: {
        tooltip: {
          enabled: !0
        },
        legend: {
          display: !1
        },
        datalabels: {
          backgroundColor: "#FFF",
          color: "#000",
          font: t,
          borderColor: "#000",
          borderWidth: 2,
          padding: {
            left: 6,
            right: 6,
            top: 2,
            bottom: 2
          }
        }
      }
    }), new $r(e, r);
  }
  render() {
    return pt`
		<div class="chart-container" style="position: relative; height: ${this.height}px; width: ${this.width}px; margin: 0 auto;">
            <canvas></canvas>
        </div>
		`;
  }
};
Hs([
  Ut({ attribute: !1 })
], Ri.prototype, "data", 2);
Hs([
  Ut()
], Ri.prototype, "type", 2);
Hs([
  Ut()
], Ri.prototype, "height", 2);
Hs([
  Ut()
], Ri.prototype, "width", 2);
Ri = Hs([
  ti("ar-chart")
], Ri);
var s2 = Object.defineProperty, a2 = Object.getOwnPropertyDescriptor, wo = (e, t, r, n) => {
  for (var i = n > 1 ? void 0 : n ? a2(t, r) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (i = (n ? a(t, r, i) : a(i)) || i);
  return n && i && s2(t, r, i), i;
};
let Ii = class extends ri(ei) {
  getCSSClass(e) {
    return e > 89 ? "c-score--pass" : e > 49 ? "c-score--average" : "c-score--fail";
  }
  render() {
    return pt`
			<div class="c-score ${this.getCSSClass(this.score)} ${this.large ? "c-score--large" : ""}">
                <svg viewBox="0 0 36 36" class="c-score__inner">
                    <path class="c-score__background"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path class="c-score__fill"
                        stroke-dasharray="${this.score}, 100"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <div class="c-score__text">
                    <span class="c-score__text-number">${this.score}</span>
                    ${this.hideScoreText ? "" : pt`<span class="c-score__text-title">Score</span>`}
                </div>
            </div>
		`;
  }
};
Ii.styles = [
  Xl`
		.c-score {
			position: relative;
			width: 130px;
			height: 130px;
			margin: 0 auto;
		}

		.c-score__inner {
			display: block;
			width: 100%;
			height: 100%;
		}

		.c-score__background {
			fill: none;
			stroke: #eee;
			stroke-width: 1.75;
		}

		.c-score__fill {
			fill: none;
			stroke: none;
			stroke-width: 1.75;
			stroke-linecap: round;
			animation: progress 1000ms ease-out forwards;
		}

		@keyframes progress {
			0% {
				stroke-dasharray: 0 100;
			}
		}

		.c-score__text {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			margin: auto;
			z-index: 1;
			font-weight: 700;
		}

		.c-score__text-number {
			font-size: 34px;
		}

		.c-score__text-title {
			font-size: 16px;
			margin-top: 10px;
		}

		.c-score--pass .c-score__fill {
			stroke: #1C824A;
		}

		.c-score--average .c-score__fill {
			stroke: #f79c37;
		}

		.c-score--fail .c-score__fill {
			stroke: #d42054;
		}

		.c-score--large {
			width: 150px;
			height: 150px;
		}
		.c-score--large .c-score__text-number {
			font-size: 4rem;
		}
		`
];
wo([
  Ut()
], Ii.prototype, "score", 2);
wo([
  Ut({ type: Boolean })
], Ii.prototype, "large", 2);
wo([
  Ut({ type: Boolean })
], Ii.prototype, "hideScoreText", 2);
Ii = wo([
  ti("ar-score")
], Ii);
var o2 = Object.defineProperty, l2 = Object.getOwnPropertyDescriptor, c2 = (e, t, r, n) => {
  for (var i = n > 1 ? void 0 : n ? l2(t, r) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (i = (n ? a(t, r, i) : a(i)) || i);
  return n && i && o2(t, r, i), i;
};
let Lh = class extends ri(ei) {
  render() {
    return pt`
			<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="enable-background:new 0 0 24 24" viewBox="0 0 24 24" width="42" height="42">
				<path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" style="fill:#ffffff;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
				<path d="m7 9 5 1m5-1-5 1m0 0v3m0 0-2 5m2-5 2 5" style="fill:none;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
				<path d="M12 8.5c-.7 0-1.2-.6-1.2-1.3S11.3 6 12 6s1.2.6 1.2 1.2-.5 1.3-1.2 1.3z" style="fill:#443b52" />
			</svg>
		`;
  }
};
Lh = c2([
  ti("ar-logo")
], Lh);
const To = Xl`

    .c-title__group {
        display: grid;
        grid-template-columns: 40px 1fr;
        gap: 10px;
        align-items: center;
    }

    .c-title {
        font-size: 17.25px;
        margin: 0;
        font-weight: 700;
        line-height: 1.3;
    }

    .c-title__link {
        text-decoration: underline;
        text-underline-position: below;
    }

    .c-title__link:hover,
    .c-title__link:focus {
        text-decoration: none;
    }

    .c-accordion-header {
		display: flex;
		width: 100%;
		align-items: center;
		border: none;
		padding: 0;
		background-color: transparent;
		font-family: inherit;
		font-size: 17.25px;
		font-weight: inherit;
		font-size: inherit;
	}

	.c-detail-button {
		pointer-events: none;
		border: none;
		padding: 0;
		background-color: transparent;
		font-family: inherit;
		font-size: inherit;
		font-weight: inherit;
		font-size: inherit;
		white-space: nowrap;
		text-decoration: none;
    	color: inherit;
		line-height: 1;
	}

	.c-detail-button__group {
		display: flex;
		align-items: center;
	}

	.c-detail-button__text {
		margin-left: 5px;
	}

	.c-table__container {
		overflow-x: auto;
	}

	.c-table__container uui-table-head-cell {
		font-size: 14px;
	}

	.c-summary {
		text-align: center;
	}

	.c-summary__container {
		display: grid;
		gap: 20px;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		max-width: 600px;
		overflow-x: auto;
		margin-bottom: 20px;
	}

	.c-summary__circle {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 5px solid #d42054;
		height: 117px;
		width: 117px;
		border-radius: 100%;
		margin: 0 auto 10px auto;
		font-weight: 700;
		font-size: 34px;
	}

	.c-summary--passed .c-summary__circle {
		border-color: #1C824A;
	}

	.c-summary--incomplete .c-summary__circle {
		border-color: #f79c37;
	}

	.c-summary--info .c-summary__circle {
		border-color: #1b264f;
	}

	.c-summary__title {
		text-align: center;
		font-weight: 700;
		font-size: 16px;
		margin-top: 10px;
	}

	@media (max-width: 768px) {
		.c-summary__time {
			display: block;
			margin-top: 10px;
		}
	}

	.c-summary__button {
		margin-right: 10px;
	}

	.c-detail__title {
		font-size: 15px;
		font-weight: 700;
	}

	.c-checklist__item {
		margin: 0 0 1.5rem 0;
	}

	.c-tag {
		margin-bottom: 0.5rem;
	}

	.c-title__group {
		display: grid;
		grid-template-columns: 40px 1fr;
		gap: 10px;
		align-items: center;
	}

	.c-title {
		font-size: 17.25px;
		margin: 0;
		font-weight: 700;
		line-height: 1.3;
	}

	.c-title__link {
		text-decoration: underline;
		text-underline-position: below;
	}

	.c-title__link:hover,
	.c-title__link:focus {
		text-decoration: none;
	}

	.c-paragraph {
		margin: 0 0 1rem 0;
	}

	.c-paragraph__spaced {
		margin: 0 0 2rem 0;
	}

	.c-bold {
		font-weight: 700;;
	}

	.c-circle {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 2px solid currentColor;
		height: 32px;
		width: 32px;
		border-radius: 100%;
		font-weight: 700;
		font-size: 16px;
	}

	.c-circle--failed {
		border-color: #d42054;
	}

	.c-circle--incomplete {
		border-color: #f79c37;
	}

	.c-circle--passed {
		border-color: #1C824A;
	}

	/* The default Umbraco font Lato renders differently between operating systems, so we are using the system default to vertically align */
	.c-circle__text {
		margin-top: 3px;
	}

	.mac .c-circle__text {
		margin-top: 0;
	}

	.c-incident-number {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid currentColor;
		height: 24px;
		width: 24px;
		border-radius: 100%;
		font-weight: 700;
		font-size: 14px;
	}

	.c-incident-number--serious,
	.c-incident-number--critical {
		border-color: #d42054;
	}

	.c-incident-number--moderate {
		border-color: #fad634;
	}

	.c-incident-number__text {
		margin-top: 2px;
	}

	.mac .c-incident-number__text {
		margin-top: 0;
	}

	/* Fix Umbraco Colors */

	.umb-sub-views-nav-item .badge.-type-alert {
		background-color: #d42054;
	}

	.c-uui-tag--positive {
		background-color: #1C824A;
	}

	/* Dashboard */

	.c-dashboard-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 24px;
		margin-bottom: 1rem;
	}

	.c-dashboard-grid__full-row {
		grid-column: 1 / 4;
	}

	.c-dashboard-grid__23 {
		grid-column: 2 / 4;
	}

	.c-dashboard-number {
		font-size: 5rem;
		line-height: 1;
		text-align: center;
		font-weight: bold;
		margin: 2rem 0 0 0;
	}

	.c-dashboard-number__info {
		font-size: 1rem;
		text-align: center;
		font-weight: bold;
		margin: 1rem 0 0 0;
	}

	.c-detail-button--active {
		pointer-events: all;
	}

	.c-test-container {
		width: 100%;
		min-height: 800px;
		margin-top: 1rem;
	}

	.u-mb20 {
		margin-bottom: 20px;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
	
  `;
var f2 = Object.defineProperty, h2 = Object.getOwnPropertyDescriptor, Pu = (e, t, r, n) => {
  for (var i = n > 1 ? void 0 : n ? h2(t, r) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (i = (n ? a(t, r, i) : a(i)) || i);
  return n && i && f2(t, r, i), i;
};
let Xa = class extends ri(ei) {
  constructor() {
    super(...arguments), this.onRunTests = () => {
    };
  }
  render() {
    return pt`
		<uui-scroll-container>
			<uui-box>
				<div slot="headline" class="c-title__group">
					<ar-logo></ar-logo>
					<h2 class="c-title">Accessibility Reporter</h2>
				</div>
				<p>Start running accessibility tests against multiple pages by using the button below.</p>
				<p style="margin-bottom: 20px;">While the tests are running please stay on this page.</p>
				<uui-button look="primary" color="default" @click="${this.onRunTests}" label="Run accessibility tests on current live pages" class="c-summary__button">Run tests</uui-button>
			</uui-box>
		</uui-scroll-container>
		`;
  }
};
Xa.styles = [
  To
];
Pu([
  Ut()
], Xa.prototype, "onRunTests", 2);
Xa = Pu([
  ti("ar-pre-test")
], Xa);
var u2 = Object.defineProperty, d2 = Object.getOwnPropertyDescriptor, Vs = (e, t, r, n) => {
  for (var i = n > 1 ? void 0 : n ? d2(t, r) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (i = (n ? a(t, r, i) : a(i)) || i);
  return n && i && u2(t, r, i), i;
};
let qn = class extends ri(ei) {
  constructor() {
    super(...arguments), this.onStopTests = () => {
    };
  }
  render() {
    return pt`
		<uui-scroll-container>
			<uui-box>
				<div slot="headline" class="c-title__group">
					<ar-logo></ar-logo>
					<h2 class="c-title" aria-live="polite">Running accessibility tests ${this.currentTestUrl ? pt`on` : null} ${this.currentTestUrl} ${this.currentTestNumber ? pt`(${this.currentTestNumber}/${this.testPagesTotal})` : ""}</h2>
				</div>
				<p class="alert alert-info">Please stay on this page while the tests are running.</p>
				<uui-button look="primary" color="default" @click="${this.onStopTests}"  label="Cancel running accessibility tests" class="u-mb20">Cancel running tests</uui-button>
				<uui-loader-bar animationDuration="1.5" style="color: #443b52"></uui-loader-bar>
				<slot></slot>
			</uui-box>
		</uui-scroll-container>
		`;
  }
};
qn.styles = [
  To
];
Vs([
  Ut({ type: String })
], qn.prototype, "currentTestUrl", 2);
Vs([
  Ut({ type: Number })
], qn.prototype, "currentTestNumber", 2);
Vs([
  Ut({ type: Number })
], qn.prototype, "testPagesTotal", 2);
Vs([
  Ut()
], qn.prototype, "onStopTests", 2);
qn = Vs([
  ti("ar-running-tests")
], qn);
/*! xlsx.js (C) 2013-present SheetJS -- http://sheetjs.com */
var Ka = {};
Ka.version = "0.18.5";
var Ru = 1252, g2 = [874, 932, 936, 949, 950, 1250, 1251, 1252, 1253, 1254, 1255, 1256, 1257, 1258, 1e4], Iu = function(e) {
  g2.indexOf(e) != -1 && (Ru = e);
};
function p2() {
  Iu(1252);
}
var Fs = function(e) {
  Iu(e);
};
function m2() {
  Fs(1200), p2();
}
function x2(e) {
  for (var t = [], r = 0; r < e.length >> 1; ++r)
    t[r] = String.fromCharCode(e.charCodeAt(2 * r + 1) + (e.charCodeAt(2 * r) << 8));
  return t.join("");
}
var ya = function(t) {
  return String.fromCharCode(t);
}, Nh = function(t) {
  return String.fromCharCode(t);
}, Un, xn = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function Cs(e) {
  for (var t = "", r = 0, n = 0, i = 0, s = 0, a = 0, o = 0, l = 0, c = 0; c < e.length; )
    r = e.charCodeAt(c++), s = r >> 2, n = e.charCodeAt(c++), a = (r & 3) << 4 | n >> 4, i = e.charCodeAt(c++), o = (n & 15) << 2 | i >> 6, l = i & 63, isNaN(n) ? o = l = 64 : isNaN(i) && (l = 64), t += xn.charAt(s) + xn.charAt(a) + xn.charAt(o) + xn.charAt(l);
  return t;
}
function sn(e) {
  var t = "", r = 0, n = 0, i = 0, s = 0, a = 0, o = 0, l = 0;
  e = e.replace(/[^\w\+\/\=]/g, "");
  for (var c = 0; c < e.length; )
    s = xn.indexOf(e.charAt(c++)), a = xn.indexOf(e.charAt(c++)), r = s << 2 | a >> 4, t += String.fromCharCode(r), o = xn.indexOf(e.charAt(c++)), n = (a & 15) << 4 | o >> 2, o !== 64 && (t += String.fromCharCode(n)), l = xn.indexOf(e.charAt(c++)), i = (o & 3) << 6 | l, l !== 64 && (t += String.fromCharCode(i));
  return t;
}
var Fe = /* @__PURE__ */ function() {
  return typeof Buffer < "u" && typeof process < "u" && typeof process.versions < "u" && !!process.versions.node;
}(), cn = /* @__PURE__ */ function() {
  if (typeof Buffer < "u") {
    var e = !Buffer.from;
    if (!e)
      try {
        Buffer.from("foo", "utf8");
      } catch {
        e = !0;
      }
    return e ? function(t, r) {
      return r ? new Buffer(t, r) : new Buffer(t);
    } : Buffer.from.bind(Buffer);
  }
  return function() {
  };
}();
function Zn(e) {
  return Fe ? Buffer.alloc ? Buffer.alloc(e) : new Buffer(e) : typeof Uint8Array < "u" ? new Uint8Array(e) : new Array(e);
}
function Bh(e) {
  return Fe ? Buffer.allocUnsafe ? Buffer.allocUnsafe(e) : new Buffer(e) : typeof Uint8Array < "u" ? new Uint8Array(e) : new Array(e);
}
var gr = function(t) {
  return Fe ? cn(t, "binary") : t.split("").map(function(r) {
    return r.charCodeAt(0) & 255;
  });
};
function So(e) {
  if (typeof ArrayBuffer > "u")
    return gr(e);
  for (var t = new ArrayBuffer(e.length), r = new Uint8Array(t), n = 0; n != e.length; ++n)
    r[n] = e.charCodeAt(n) & 255;
  return t;
}
function Ys(e) {
  if (Array.isArray(e))
    return e.map(function(n) {
      return String.fromCharCode(n);
    }).join("");
  for (var t = [], r = 0; r < e.length; ++r)
    t[r] = String.fromCharCode(e[r]);
  return t.join("");
}
function _2(e) {
  if (typeof Uint8Array > "u")
    throw new Error("Unsupported");
  return new Uint8Array(e);
}
var Tt = Fe ? function(e) {
  return Buffer.concat(e.map(function(t) {
    return Buffer.isBuffer(t) ? t : cn(t);
  }));
} : function(e) {
  if (typeof Uint8Array < "u") {
    var t = 0, r = 0;
    for (t = 0; t < e.length; ++t)
      r += e[t].length;
    var n = new Uint8Array(r), i = 0;
    for (t = 0, r = 0; t < e.length; r += i, ++t)
      if (i = e[t].length, e[t] instanceof Uint8Array)
        n.set(e[t], r);
      else {
        if (typeof e[t] == "string")
          throw "wtf";
        n.set(new Uint8Array(e[t]), r);
      }
    return n;
  }
  return [].concat.apply([], e.map(function(s) {
    return Array.isArray(s) ? s : [].slice.call(s);
  }));
};
function v2(e) {
  for (var t = [], r = 0, n = e.length + 250, i = Zn(e.length + 255), s = 0; s < e.length; ++s) {
    var a = e.charCodeAt(s);
    if (a < 128)
      i[r++] = a;
    else if (a < 2048)
      i[r++] = 192 | a >> 6 & 31, i[r++] = 128 | a & 63;
    else if (a >= 55296 && a < 57344) {
      a = (a & 1023) + 64;
      var o = e.charCodeAt(++s) & 1023;
      i[r++] = 240 | a >> 8 & 7, i[r++] = 128 | a >> 2 & 63, i[r++] = 128 | o >> 6 & 15 | (a & 3) << 4, i[r++] = 128 | o & 63;
    } else
      i[r++] = 224 | a >> 12 & 15, i[r++] = 128 | a >> 6 & 63, i[r++] = 128 | a & 63;
    r > n && (t.push(i.slice(0, r)), r = 0, i = Zn(65535), n = 65530);
  }
  return t.push(i.slice(0, r)), Tt(t);
}
var ps = /\u0000/g, wa = /[\u0001-\u0006]/g;
function bi(e) {
  for (var t = "", r = e.length - 1; r >= 0; )
    t += e.charAt(r--);
  return t;
}
function mr(e, t) {
  var r = "" + e;
  return r.length >= t ? r : rt("0", t - r.length) + r;
}
function uc(e, t) {
  var r = "" + e;
  return r.length >= t ? r : rt(" ", t - r.length) + r;
}
function qa(e, t) {
  var r = "" + e;
  return r.length >= t ? r : r + rt(" ", t - r.length);
}
function y2(e, t) {
  var r = "" + Math.round(e);
  return r.length >= t ? r : rt("0", t - r.length) + r;
}
function w2(e, t) {
  var r = "" + e;
  return r.length >= t ? r : rt("0", t - r.length) + r;
}
var Wh = /* @__PURE__ */ Math.pow(2, 32);
function gi(e, t) {
  if (e > Wh || e < -Wh)
    return y2(e, t);
  var r = Math.round(e);
  return w2(r, t);
}
function Za(e, t) {
  return t = t || 0, e.length >= 7 + t && (e.charCodeAt(t) | 32) === 103 && (e.charCodeAt(t + 1) | 32) === 101 && (e.charCodeAt(t + 2) | 32) === 110 && (e.charCodeAt(t + 3) | 32) === 101 && (e.charCodeAt(t + 4) | 32) === 114 && (e.charCodeAt(t + 5) | 32) === 97 && (e.charCodeAt(t + 6) | 32) === 108;
}
var Uh = [
  ["Sun", "Sunday"],
  ["Mon", "Monday"],
  ["Tue", "Tuesday"],
  ["Wed", "Wednesday"],
  ["Thu", "Thursday"],
  ["Fri", "Friday"],
  ["Sat", "Saturday"]
], ol = [
  ["J", "Jan", "January"],
  ["F", "Feb", "February"],
  ["M", "Mar", "March"],
  ["A", "Apr", "April"],
  ["M", "May", "May"],
  ["J", "Jun", "June"],
  ["J", "Jul", "July"],
  ["A", "Aug", "August"],
  ["S", "Sep", "September"],
  ["O", "Oct", "October"],
  ["N", "Nov", "November"],
  ["D", "Dec", "December"]
];
function T2(e) {
  return e || (e = {}), e[0] = "General", e[1] = "0", e[2] = "0.00", e[3] = "#,##0", e[4] = "#,##0.00", e[9] = "0%", e[10] = "0.00%", e[11] = "0.00E+00", e[12] = "# ?/?", e[13] = "# ??/??", e[14] = "m/d/yy", e[15] = "d-mmm-yy", e[16] = "d-mmm", e[17] = "mmm-yy", e[18] = "h:mm AM/PM", e[19] = "h:mm:ss AM/PM", e[20] = "h:mm", e[21] = "h:mm:ss", e[22] = "m/d/yy h:mm", e[37] = "#,##0 ;(#,##0)", e[38] = "#,##0 ;[Red](#,##0)", e[39] = "#,##0.00;(#,##0.00)", e[40] = "#,##0.00;[Red](#,##0.00)", e[45] = "mm:ss", e[46] = "[h]:mm:ss", e[47] = "mmss.0", e[48] = "##0.0E+0", e[49] = "@", e[56] = '"上午/下午 "hh"時"mm"分"ss"秒 "', e;
}
var it = {
  0: "General",
  1: "0",
  2: "0.00",
  3: "#,##0",
  4: "#,##0.00",
  9: "0%",
  10: "0.00%",
  11: "0.00E+00",
  12: "# ?/?",
  13: "# ??/??",
  14: "m/d/yy",
  15: "d-mmm-yy",
  16: "d-mmm",
  17: "mmm-yy",
  18: "h:mm AM/PM",
  19: "h:mm:ss AM/PM",
  20: "h:mm",
  21: "h:mm:ss",
  22: "m/d/yy h:mm",
  37: "#,##0 ;(#,##0)",
  38: "#,##0 ;[Red](#,##0)",
  39: "#,##0.00;(#,##0.00)",
  40: "#,##0.00;[Red](#,##0.00)",
  45: "mm:ss",
  46: "[h]:mm:ss",
  47: "mmss.0",
  48: "##0.0E+0",
  49: "@",
  56: '"上午/下午 "hh"時"mm"分"ss"秒 "'
}, zh = {
  5: 37,
  6: 38,
  7: 39,
  8: 40,
  //  5 -> 37 ...  8 -> 40
  23: 0,
  24: 0,
  25: 0,
  26: 0,
  // 23 ->  0 ... 26 ->  0
  27: 14,
  28: 14,
  29: 14,
  30: 14,
  31: 14,
  // 27 -> 14 ... 31 -> 14
  50: 14,
  51: 14,
  52: 14,
  53: 14,
  54: 14,
  // 50 -> 14 ... 58 -> 14
  55: 14,
  56: 14,
  57: 14,
  58: 14,
  59: 1,
  60: 2,
  61: 3,
  62: 4,
  // 59 ->  1 ... 62 ->  4
  67: 9,
  68: 10,
  // 67 ->  9 ... 68 -> 10
  69: 12,
  70: 13,
  71: 14,
  // 69 -> 12 ... 71 -> 14
  72: 14,
  73: 15,
  74: 16,
  75: 17,
  // 72 -> 14 ... 75 -> 17
  76: 20,
  77: 21,
  78: 22,
  // 76 -> 20 ... 78 -> 22
  79: 45,
  80: 46,
  81: 47,
  // 79 -> 45 ... 81 -> 47
  82: 0
  // 82 ->  0 ... 65536 -> 0 (omitted)
}, S2 = {
  //  5 -- Currency,   0 decimal, black negative
  5: '"$"#,##0_);\\("$"#,##0\\)',
  63: '"$"#,##0_);\\("$"#,##0\\)',
  //  6 -- Currency,   0 decimal, red   negative
  6: '"$"#,##0_);[Red]\\("$"#,##0\\)',
  64: '"$"#,##0_);[Red]\\("$"#,##0\\)',
  //  7 -- Currency,   2 decimal, black negative
  7: '"$"#,##0.00_);\\("$"#,##0.00\\)',
  65: '"$"#,##0.00_);\\("$"#,##0.00\\)',
  //  8 -- Currency,   2 decimal, red   negative
  8: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',
  66: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',
  // 41 -- Accounting, 0 decimal, No Symbol
  41: '_(* #,##0_);_(* \\(#,##0\\);_(* "-"_);_(@_)',
  // 42 -- Accounting, 0 decimal, $  Symbol
  42: '_("$"* #,##0_);_("$"* \\(#,##0\\);_("$"* "-"_);_(@_)',
  // 43 -- Accounting, 2 decimal, No Symbol
  43: '_(* #,##0.00_);_(* \\(#,##0.00\\);_(* "-"??_);_(@_)',
  // 44 -- Accounting, 2 decimal, $  Symbol
  44: '_("$"* #,##0.00_);_("$"* \\(#,##0.00\\);_("$"* "-"??_);_(@_)'
};
function Ja(e, t, r) {
  for (var n = e < 0 ? -1 : 1, i = e * n, s = 0, a = 1, o = 0, l = 1, c = 0, f = 0, h = Math.floor(i); c < t && (h = Math.floor(i), o = h * a + s, f = h * c + l, !(i - h < 5e-8)); )
    i = 1 / (i - h), s = a, a = o, l = c, c = f;
  if (f > t && (c > t ? (f = l, o = s) : (f = c, o = a)), !r)
    return [0, n * o, f];
  var u = Math.floor(n * o / f);
  return [u, n * o - u * f, f];
}
function Ta(e, t, r) {
  if (e > 2958465 || e < 0)
    return null;
  var n = e | 0, i = Math.floor(86400 * (e - n)), s = 0, a = [], o = { D: n, T: i, u: 86400 * (e - n) - i, y: 0, m: 0, d: 0, H: 0, M: 0, S: 0, q: 0 };
  if (Math.abs(o.u) < 1e-6 && (o.u = 0), t && t.date1904 && (n += 1462), o.u > 0.9999 && (o.u = 0, ++i == 86400 && (o.T = i = 0, ++n, ++o.D)), n === 60)
    a = r ? [1317, 10, 29] : [1900, 2, 29], s = 3;
  else if (n === 0)
    a = r ? [1317, 8, 29] : [1900, 1, 0], s = 6;
  else {
    n > 60 && --n;
    var l = new Date(1900, 0, 1);
    l.setDate(l.getDate() + n - 1), a = [l.getFullYear(), l.getMonth() + 1, l.getDate()], s = l.getDay(), n < 60 && (s = (s + 6) % 7), r && (s = F2(l, a));
  }
  return o.y = a[0], o.m = a[1], o.d = a[2], o.S = i % 60, i = Math.floor(i / 60), o.M = i % 60, i = Math.floor(i / 60), o.H = i, o.q = s, o;
}
var Lu = /* @__PURE__ */ new Date(1899, 11, 31, 0, 0, 0), b2 = /* @__PURE__ */ Lu.getTime(), E2 = /* @__PURE__ */ new Date(1900, 2, 1, 0, 0, 0);
function Nu(e, t) {
  var r = /* @__PURE__ */ e.getTime();
  return t ? r -= 1461 * 24 * 60 * 60 * 1e3 : e >= E2 && (r += 24 * 60 * 60 * 1e3), (r - (b2 + (/* @__PURE__ */ e.getTimezoneOffset() - /* @__PURE__ */ Lu.getTimezoneOffset()) * 6e4)) / (24 * 60 * 60 * 1e3);
}
function dc(e) {
  return e.indexOf(".") == -1 ? e : e.replace(/(?:\.0*|(\.\d*[1-9])0+)$/, "$1");
}
function A2(e) {
  return e.indexOf("E") == -1 ? e : e.replace(/(?:\.0*|(\.\d*[1-9])0+)[Ee]/, "$1E").replace(/(E[+-])(\d)$/, "$10$2");
}
function k2(e) {
  var t = e < 0 ? 12 : 11, r = dc(e.toFixed(12));
  return r.length <= t || (r = e.toPrecision(10), r.length <= t) ? r : e.toExponential(5);
}
function O2(e) {
  var t = dc(e.toFixed(11));
  return t.length > (e < 0 ? 12 : 11) || t === "0" || t === "-0" ? e.toPrecision(6) : t;
}
function D2(e) {
  var t = Math.floor(Math.log(Math.abs(e)) * Math.LOG10E), r;
  return t >= -4 && t <= -1 ? r = e.toPrecision(10 + t) : Math.abs(t) <= 9 ? r = k2(e) : t === 10 ? r = e.toFixed(10).substr(0, 12) : r = O2(e), dc(A2(r.toUpperCase()));
}
function Nl(e, t) {
  switch (typeof e) {
    case "string":
      return e;
    case "boolean":
      return e ? "TRUE" : "FALSE";
    case "number":
      return (e | 0) === e ? e.toString(10) : D2(e);
    case "undefined":
      return "";
    case "object":
      if (e == null)
        return "";
      if (e instanceof Date)
        return En(14, Nu(e, t && t.date1904), t);
  }
  throw new Error("unsupported value in General format: " + e);
}
function F2(e, t) {
  t[0] -= 581;
  var r = e.getDay();
  return e < 60 && (r = (r + 6) % 7), r;
}
function C2(e, t, r, n) {
  var i = "", s = 0, a = 0, o = r.y, l, c = 0;
  switch (e) {
    case 98:
      o = r.y + 543;
    case 121:
      switch (t.length) {
        case 1:
        case 2:
          l = o % 100, c = 2;
          break;
        default:
          l = o % 1e4, c = 4;
          break;
      }
      break;
    case 109:
      switch (t.length) {
        case 1:
        case 2:
          l = r.m, c = t.length;
          break;
        case 3:
          return ol[r.m - 1][1];
        case 5:
          return ol[r.m - 1][0];
        default:
          return ol[r.m - 1][2];
      }
      break;
    case 100:
      switch (t.length) {
        case 1:
        case 2:
          l = r.d, c = t.length;
          break;
        case 3:
          return Uh[r.q][0];
        default:
          return Uh[r.q][1];
      }
      break;
    case 104:
      switch (t.length) {
        case 1:
        case 2:
          l = 1 + (r.H + 11) % 12, c = t.length;
          break;
        default:
          throw "bad hour format: " + t;
      }
      break;
    case 72:
      switch (t.length) {
        case 1:
        case 2:
          l = r.H, c = t.length;
          break;
        default:
          throw "bad hour format: " + t;
      }
      break;
    case 77:
      switch (t.length) {
        case 1:
        case 2:
          l = r.M, c = t.length;
          break;
        default:
          throw "bad minute format: " + t;
      }
      break;
    case 115:
      if (t != "s" && t != "ss" && t != ".0" && t != ".00" && t != ".000")
        throw "bad second format: " + t;
      return r.u === 0 && (t == "s" || t == "ss") ? mr(r.S, t.length) : (n >= 2 ? a = n === 3 ? 1e3 : 100 : a = n === 1 ? 10 : 1, s = Math.round(a * (r.S + r.u)), s >= 60 * a && (s = 0), t === "s" ? s === 0 ? "0" : "" + s / a : (i = mr(s, 2 + n), t === "ss" ? i.substr(0, 2) : "." + i.substr(2, t.length - 1)));
    case 90:
      switch (t) {
        case "[h]":
        case "[hh]":
          l = r.D * 24 + r.H;
          break;
        case "[m]":
        case "[mm]":
          l = (r.D * 24 + r.H) * 60 + r.M;
          break;
        case "[s]":
        case "[ss]":
          l = ((r.D * 24 + r.H) * 60 + r.M) * 60 + Math.round(r.S + r.u);
          break;
        default:
          throw "bad abstime format: " + t;
      }
      c = t.length === 3 ? 1 : 2;
      break;
    case 101:
      l = o, c = 1;
      break;
  }
  var f = c > 0 ? mr(l, c) : "";
  return f;
}
function _n(e) {
  var t = 3;
  if (e.length <= t)
    return e;
  for (var r = e.length % t, n = e.substr(0, r); r != e.length; r += t)
    n += (n.length > 0 ? "," : "") + e.substr(r, t);
  return n;
}
var Bu = /%/g;
function M2(e, t, r) {
  var n = t.replace(Bu, ""), i = t.length - n.length;
  return en(e, n, r * Math.pow(10, 2 * i)) + rt("%", i);
}
function P2(e, t, r) {
  for (var n = t.length - 1; t.charCodeAt(n - 1) === 44; )
    --n;
  return en(e, t.substr(0, n), r / Math.pow(10, 3 * (t.length - n)));
}
function Wu(e, t) {
  var r, n = e.indexOf("E") - e.indexOf(".") - 1;
  if (e.match(/^#+0.0E\+0$/)) {
    if (t == 0)
      return "0.0E+0";
    if (t < 0)
      return "-" + Wu(e, -t);
    var i = e.indexOf(".");
    i === -1 && (i = e.indexOf("E"));
    var s = Math.floor(Math.log(t) * Math.LOG10E) % i;
    if (s < 0 && (s += i), r = (t / Math.pow(10, s)).toPrecision(n + 1 + (i + s) % i), r.indexOf("e") === -1) {
      var a = Math.floor(Math.log(t) * Math.LOG10E);
      for (r.indexOf(".") === -1 ? r = r.charAt(0) + "." + r.substr(1) + "E+" + (a - r.length + s) : r += "E+" + (a - s); r.substr(0, 2) === "0."; )
        r = r.charAt(0) + r.substr(2, i) + "." + r.substr(2 + i), r = r.replace(/^0+([1-9])/, "$1").replace(/^0+\./, "0.");
      r = r.replace(/\+-/, "-");
    }
    r = r.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/, function(o, l, c, f) {
      return l + c + f.substr(0, (i + s) % i) + "." + f.substr(s) + "E";
    });
  } else
    r = t.toExponential(n);
  return e.match(/E\+00$/) && r.match(/e[+-]\d$/) && (r = r.substr(0, r.length - 1) + "0" + r.charAt(r.length - 1)), e.match(/E\-/) && r.match(/e\+/) && (r = r.replace(/e\+/, "e")), r.replace("e", "E");
}
var Uu = /# (\?+)( ?)\/( ?)(\d+)/;
function R2(e, t, r) {
  var n = parseInt(e[4], 10), i = Math.round(t * n), s = Math.floor(i / n), a = i - s * n, o = n;
  return r + (s === 0 ? "" : "" + s) + " " + (a === 0 ? rt(" ", e[1].length + 1 + e[4].length) : uc(a, e[1].length) + e[2] + "/" + e[3] + mr(o, e[4].length));
}
function I2(e, t, r) {
  return r + (t === 0 ? "" : "" + t) + rt(" ", e[1].length + 2 + e[4].length);
}
var zu = /^#*0*\.([0#]+)/, Hu = /\).*[0#]/, Vu = /\(###\) ###\\?-####/;
function Nt(e) {
  for (var t = "", r, n = 0; n != e.length; ++n)
    switch (r = e.charCodeAt(n)) {
      case 35:
        break;
      case 63:
        t += " ";
        break;
      case 48:
        t += "0";
        break;
      default:
        t += String.fromCharCode(r);
    }
  return t;
}
function Hh(e, t) {
  var r = Math.pow(10, t);
  return "" + Math.round(e * r) / r;
}
function Vh(e, t) {
  var r = e - Math.floor(e), n = Math.pow(10, t);
  return t < ("" + Math.round(r * n)).length ? 0 : Math.round(r * n);
}
function L2(e, t) {
  return t < ("" + Math.round((e - Math.floor(e)) * Math.pow(10, t))).length ? 1 : 0;
}
function N2(e) {
  return e < 2147483647 && e > -2147483648 ? "" + (e >= 0 ? e | 0 : e - 1 | 0) : "" + Math.floor(e);
}
function sr(e, t, r) {
  if (e.charCodeAt(0) === 40 && !t.match(Hu)) {
    var n = t.replace(/\( */, "").replace(/ \)/, "").replace(/\)/, "");
    return r >= 0 ? sr("n", n, r) : "(" + sr("n", n, -r) + ")";
  }
  if (t.charCodeAt(t.length - 1) === 44)
    return P2(e, t, r);
  if (t.indexOf("%") !== -1)
    return M2(e, t, r);
  if (t.indexOf("E") !== -1)
    return Wu(t, r);
  if (t.charCodeAt(0) === 36)
    return "$" + sr(e, t.substr(t.charAt(1) == " " ? 2 : 1), r);
  var i, s, a, o, l = Math.abs(r), c = r < 0 ? "-" : "";
  if (t.match(/^00+$/))
    return c + gi(l, t.length);
  if (t.match(/^[#?]+$/))
    return i = gi(r, 0), i === "0" && (i = ""), i.length > t.length ? i : Nt(t.substr(0, t.length - i.length)) + i;
  if (s = t.match(Uu))
    return R2(s, l, c);
  if (t.match(/^#+0+$/))
    return c + gi(l, t.length - t.indexOf("0"));
  if (s = t.match(zu))
    return i = Hh(r, s[1].length).replace(/^([^\.]+)$/, "$1." + Nt(s[1])).replace(/\.$/, "." + Nt(s[1])).replace(/\.(\d*)$/, function(p, g) {
      return "." + g + rt("0", Nt(
        /*::(*/
        s[1]
      ).length - g.length);
    }), t.indexOf("0.") !== -1 ? i : i.replace(/^0\./, ".");
  if (t = t.replace(/^#+([0.])/, "$1"), s = t.match(/^(0*)\.(#*)$/))
    return c + Hh(l, s[2].length).replace(/\.(\d*[1-9])0*$/, ".$1").replace(/^(-?\d*)$/, "$1.").replace(/^0\./, s[1].length ? "0." : ".");
  if (s = t.match(/^#{1,3},##0(\.?)$/))
    return c + _n(gi(l, 0));
  if (s = t.match(/^#,##0\.([#0]*0)$/))
    return r < 0 ? "-" + sr(e, t, -r) : _n("" + (Math.floor(r) + L2(r, s[1].length))) + "." + mr(Vh(r, s[1].length), s[1].length);
  if (s = t.match(/^#,#*,#0/))
    return sr(e, t.replace(/^#,#*,/, ""), r);
  if (s = t.match(/^([0#]+)(\\?-([0#]+))+$/))
    return i = bi(sr(e, t.replace(/[\\-]/g, ""), r)), a = 0, bi(bi(t.replace(/\\/g, "")).replace(/[0#]/g, function(p) {
      return a < i.length ? i.charAt(a++) : p === "0" ? "0" : "";
    }));
  if (t.match(Vu))
    return i = sr(e, "##########", r), "(" + i.substr(0, 3) + ") " + i.substr(3, 3) + "-" + i.substr(6);
  var f = "";
  if (s = t.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/))
    return a = Math.min(
      /*::String(*/
      s[4].length,
      7
    ), o = Ja(l, Math.pow(10, a) - 1, !1), i = "" + c, f = en(
      "n",
      /*::String(*/
      s[1],
      o[1]
    ), f.charAt(f.length - 1) == " " && (f = f.substr(0, f.length - 1) + "0"), i += f + /*::String(*/
    s[2] + "/" + /*::String(*/
    s[3], f = qa(o[2], a), f.length < s[4].length && (f = Nt(s[4].substr(s[4].length - f.length)) + f), i += f, i;
  if (s = t.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/))
    return a = Math.min(Math.max(s[1].length, s[4].length), 7), o = Ja(l, Math.pow(10, a) - 1, !0), c + (o[0] || (o[1] ? "" : "0")) + " " + (o[1] ? uc(o[1], a) + s[2] + "/" + s[3] + qa(o[2], a) : rt(" ", 2 * a + 1 + s[2].length + s[3].length));
  if (s = t.match(/^[#0?]+$/))
    return i = gi(r, 0), t.length <= i.length ? i : Nt(t.substr(0, t.length - i.length)) + i;
  if (s = t.match(/^([#0?]+)\.([#0]+)$/)) {
    i = "" + r.toFixed(Math.min(s[2].length, 10)).replace(/([^0])0+$/, "$1"), a = i.indexOf(".");
    var h = t.indexOf(".") - a, u = t.length - i.length - h;
    return Nt(t.substr(0, h) + i + t.substr(t.length - u));
  }
  if (s = t.match(/^00,000\.([#0]*0)$/))
    return a = Vh(r, s[1].length), r < 0 ? "-" + sr(e, t, -r) : _n(N2(r)).replace(/^\d,\d{3}$/, "0$&").replace(/^\d*$/, function(p) {
      return "00," + (p.length < 3 ? mr(0, 3 - p.length) : "") + p;
    }) + "." + mr(a, s[1].length);
  switch (t) {
    case "###,##0.00":
      return sr(e, "#,##0.00", r);
    case "###,###":
    case "##,###":
    case "#,###":
      var d = _n(gi(l, 0));
      return d !== "0" ? c + d : "";
    case "###,###.00":
      return sr(e, "###,##0.00", r).replace(/^0\./, ".");
    case "#,###.00":
      return sr(e, "#,##0.00", r).replace(/^0\./, ".");
  }
  throw new Error("unsupported format |" + t + "|");
}
function B2(e, t, r) {
  for (var n = t.length - 1; t.charCodeAt(n - 1) === 44; )
    --n;
  return en(e, t.substr(0, n), r / Math.pow(10, 3 * (t.length - n)));
}
function W2(e, t, r) {
  var n = t.replace(Bu, ""), i = t.length - n.length;
  return en(e, n, r * Math.pow(10, 2 * i)) + rt("%", i);
}
function Yu(e, t) {
  var r, n = e.indexOf("E") - e.indexOf(".") - 1;
  if (e.match(/^#+0.0E\+0$/)) {
    if (t == 0)
      return "0.0E+0";
    if (t < 0)
      return "-" + Yu(e, -t);
    var i = e.indexOf(".");
    i === -1 && (i = e.indexOf("E"));
    var s = Math.floor(Math.log(t) * Math.LOG10E) % i;
    if (s < 0 && (s += i), r = (t / Math.pow(10, s)).toPrecision(n + 1 + (i + s) % i), !r.match(/[Ee]/)) {
      var a = Math.floor(Math.log(t) * Math.LOG10E);
      r.indexOf(".") === -1 ? r = r.charAt(0) + "." + r.substr(1) + "E+" + (a - r.length + s) : r += "E+" + (a - s), r = r.replace(/\+-/, "-");
    }
    r = r.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/, function(o, l, c, f) {
      return l + c + f.substr(0, (i + s) % i) + "." + f.substr(s) + "E";
    });
  } else
    r = t.toExponential(n);
  return e.match(/E\+00$/) && r.match(/e[+-]\d$/) && (r = r.substr(0, r.length - 1) + "0" + r.charAt(r.length - 1)), e.match(/E\-/) && r.match(/e\+/) && (r = r.replace(/e\+/, "e")), r.replace("e", "E");
}
function Ar(e, t, r) {
  if (e.charCodeAt(0) === 40 && !t.match(Hu)) {
    var n = t.replace(/\( */, "").replace(/ \)/, "").replace(/\)/, "");
    return r >= 0 ? Ar("n", n, r) : "(" + Ar("n", n, -r) + ")";
  }
  if (t.charCodeAt(t.length - 1) === 44)
    return B2(e, t, r);
  if (t.indexOf("%") !== -1)
    return W2(e, t, r);
  if (t.indexOf("E") !== -1)
    return Yu(t, r);
  if (t.charCodeAt(0) === 36)
    return "$" + Ar(e, t.substr(t.charAt(1) == " " ? 2 : 1), r);
  var i, s, a, o, l = Math.abs(r), c = r < 0 ? "-" : "";
  if (t.match(/^00+$/))
    return c + mr(l, t.length);
  if (t.match(/^[#?]+$/))
    return i = "" + r, r === 0 && (i = ""), i.length > t.length ? i : Nt(t.substr(0, t.length - i.length)) + i;
  if (s = t.match(Uu))
    return I2(s, l, c);
  if (t.match(/^#+0+$/))
    return c + mr(l, t.length - t.indexOf("0"));
  if (s = t.match(zu))
    return i = ("" + r).replace(/^([^\.]+)$/, "$1." + Nt(s[1])).replace(/\.$/, "." + Nt(s[1])), i = i.replace(/\.(\d*)$/, function(p, g) {
      return "." + g + rt("0", Nt(s[1]).length - g.length);
    }), t.indexOf("0.") !== -1 ? i : i.replace(/^0\./, ".");
  if (t = t.replace(/^#+([0.])/, "$1"), s = t.match(/^(0*)\.(#*)$/))
    return c + ("" + l).replace(/\.(\d*[1-9])0*$/, ".$1").replace(/^(-?\d*)$/, "$1.").replace(/^0\./, s[1].length ? "0." : ".");
  if (s = t.match(/^#{1,3},##0(\.?)$/))
    return c + _n("" + l);
  if (s = t.match(/^#,##0\.([#0]*0)$/))
    return r < 0 ? "-" + Ar(e, t, -r) : _n("" + r) + "." + rt("0", s[1].length);
  if (s = t.match(/^#,#*,#0/))
    return Ar(e, t.replace(/^#,#*,/, ""), r);
  if (s = t.match(/^([0#]+)(\\?-([0#]+))+$/))
    return i = bi(Ar(e, t.replace(/[\\-]/g, ""), r)), a = 0, bi(bi(t.replace(/\\/g, "")).replace(/[0#]/g, function(p) {
      return a < i.length ? i.charAt(a++) : p === "0" ? "0" : "";
    }));
  if (t.match(Vu))
    return i = Ar(e, "##########", r), "(" + i.substr(0, 3) + ") " + i.substr(3, 3) + "-" + i.substr(6);
  var f = "";
  if (s = t.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/))
    return a = Math.min(
      /*::String(*/
      s[4].length,
      7
    ), o = Ja(l, Math.pow(10, a) - 1, !1), i = "" + c, f = en(
      "n",
      /*::String(*/
      s[1],
      o[1]
    ), f.charAt(f.length - 1) == " " && (f = f.substr(0, f.length - 1) + "0"), i += f + /*::String(*/
    s[2] + "/" + /*::String(*/
    s[3], f = qa(o[2], a), f.length < s[4].length && (f = Nt(s[4].substr(s[4].length - f.length)) + f), i += f, i;
  if (s = t.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/))
    return a = Math.min(Math.max(s[1].length, s[4].length), 7), o = Ja(l, Math.pow(10, a) - 1, !0), c + (o[0] || (o[1] ? "" : "0")) + " " + (o[1] ? uc(o[1], a) + s[2] + "/" + s[3] + qa(o[2], a) : rt(" ", 2 * a + 1 + s[2].length + s[3].length));
  if (s = t.match(/^[#0?]+$/))
    return i = "" + r, t.length <= i.length ? i : Nt(t.substr(0, t.length - i.length)) + i;
  if (s = t.match(/^([#0]+)\.([#0]+)$/)) {
    i = "" + r.toFixed(Math.min(s[2].length, 10)).replace(/([^0])0+$/, "$1"), a = i.indexOf(".");
    var h = t.indexOf(".") - a, u = t.length - i.length - h;
    return Nt(t.substr(0, h) + i + t.substr(t.length - u));
  }
  if (s = t.match(/^00,000\.([#0]*0)$/))
    return r < 0 ? "-" + Ar(e, t, -r) : _n("" + r).replace(/^\d,\d{3}$/, "0$&").replace(/^\d*$/, function(p) {
      return "00," + (p.length < 3 ? mr(0, 3 - p.length) : "") + p;
    }) + "." + mr(0, s[1].length);
  switch (t) {
    case "###,###":
    case "##,###":
    case "#,###":
      var d = _n("" + l);
      return d !== "0" ? c + d : "";
    default:
      if (t.match(/\.[0#?]*$/))
        return Ar(e, t.slice(0, t.lastIndexOf(".")), r) + Nt(t.slice(t.lastIndexOf(".")));
  }
  throw new Error("unsupported format |" + t + "|");
}
function en(e, t, r) {
  return (r | 0) === r ? Ar(e, t, r) : sr(e, t, r);
}
function U2(e) {
  for (var t = [], r = !1, n = 0, i = 0; n < e.length; ++n)
    switch (
      /*cc=*/
      e.charCodeAt(n)
    ) {
      case 34:
        r = !r;
        break;
      case 95:
      case 42:
      case 92:
        ++n;
        break;
      case 59:
        t[t.length] = e.substr(i, n - i), i = n + 1;
    }
  if (t[t.length] = e.substr(i), r === !0)
    throw new Error("Format |" + e + "| unterminated string ");
  return t;
}
var ju = /\[[HhMmSs\u0E0A\u0E19\u0E17]*\]/;
function $u(e) {
  for (var t = 0, r = "", n = ""; t < e.length; )
    switch (r = e.charAt(t)) {
      case "G":
        Za(e, t) && (t += 6), t++;
        break;
      case '"':
        for (
          ;
          /*cc=*/
          e.charCodeAt(++t) !== 34 && t < e.length;
        )
          ;
        ++t;
        break;
      case "\\":
        t += 2;
        break;
      case "_":
        t += 2;
        break;
      case "@":
        ++t;
        break;
      case "B":
      case "b":
        if (e.charAt(t + 1) === "1" || e.charAt(t + 1) === "2")
          return !0;
      case "M":
      case "D":
      case "Y":
      case "H":
      case "S":
      case "E":
      case "m":
      case "d":
      case "y":
      case "h":
      case "s":
      case "e":
      case "g":
        return !0;
      case "A":
      case "a":
      case "上":
        if (e.substr(t, 3).toUpperCase() === "A/P" || e.substr(t, 5).toUpperCase() === "AM/PM" || e.substr(t, 5).toUpperCase() === "上午/下午")
          return !0;
        ++t;
        break;
      case "[":
        for (n = r; e.charAt(t++) !== "]" && t < e.length; )
          n += e.charAt(t);
        if (n.match(ju))
          return !0;
        break;
      case ".":
      case "0":
      case "#":
        for (; t < e.length && ("0#?.,E+-%".indexOf(r = e.charAt(++t)) > -1 || r == "\\" && e.charAt(t + 1) == "-" && "0#".indexOf(e.charAt(t + 2)) > -1); )
          ;
        break;
      case "?":
        for (; e.charAt(++t) === r; )
          ;
        break;
      case "*":
        ++t, (e.charAt(t) == " " || e.charAt(t) == "*") && ++t;
        break;
      case "(":
      case ")":
        ++t;
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        for (; t < e.length && "0123456789".indexOf(e.charAt(++t)) > -1; )
          ;
        break;
      case " ":
        ++t;
        break;
      default:
        ++t;
        break;
    }
  return !1;
}
function z2(e, t, r, n) {
  for (var i = [], s = "", a = 0, o = "", l = "t", c, f, h, u = "H"; a < e.length; )
    switch (o = e.charAt(a)) {
      case "G":
        if (!Za(e, a))
          throw new Error("unrecognized character " + o + " in " + e);
        i[i.length] = { t: "G", v: "General" }, a += 7;
        break;
      case '"':
        for (s = ""; (h = e.charCodeAt(++a)) !== 34 && a < e.length; )
          s += String.fromCharCode(h);
        i[i.length] = { t: "t", v: s }, ++a;
        break;
      case "\\":
        var d = e.charAt(++a), p = d === "(" || d === ")" ? d : "t";
        i[i.length] = { t: p, v: d }, ++a;
        break;
      case "_":
        i[i.length] = { t: "t", v: " " }, a += 2;
        break;
      case "@":
        i[i.length] = { t: "T", v: t }, ++a;
        break;
      case "B":
      case "b":
        if (e.charAt(a + 1) === "1" || e.charAt(a + 1) === "2") {
          if (c == null && (c = Ta(t, r, e.charAt(a + 1) === "2"), c == null))
            return "";
          i[i.length] = { t: "X", v: e.substr(a, 2) }, l = o, a += 2;
          break;
        }
      case "M":
      case "D":
      case "Y":
      case "H":
      case "S":
      case "E":
        o = o.toLowerCase();
      case "m":
      case "d":
      case "y":
      case "h":
      case "s":
      case "e":
      case "g":
        if (t < 0 || c == null && (c = Ta(t, r), c == null))
          return "";
        for (s = o; ++a < e.length && e.charAt(a).toLowerCase() === o; )
          s += o;
        o === "m" && l.toLowerCase() === "h" && (o = "M"), o === "h" && (o = u), i[i.length] = { t: o, v: s }, l = o;
        break;
      case "A":
      case "a":
      case "上":
        var g = { t: o, v: o };
        if (c == null && (c = Ta(t, r)), e.substr(a, 3).toUpperCase() === "A/P" ? (c != null && (g.v = c.H >= 12 ? "P" : "A"), g.t = "T", u = "h", a += 3) : e.substr(a, 5).toUpperCase() === "AM/PM" ? (c != null && (g.v = c.H >= 12 ? "PM" : "AM"), g.t = "T", a += 5, u = "h") : e.substr(a, 5).toUpperCase() === "上午/下午" ? (c != null && (g.v = c.H >= 12 ? "下午" : "上午"), g.t = "T", a += 5, u = "h") : (g.t = "t", ++a), c == null && g.t === "T")
          return "";
        i[i.length] = g, l = o;
        break;
      case "[":
        for (s = o; e.charAt(a++) !== "]" && a < e.length; )
          s += e.charAt(a);
        if (s.slice(-1) !== "]")
          throw 'unterminated "[" block: |' + s + "|";
        if (s.match(ju)) {
          if (c == null && (c = Ta(t, r), c == null))
            return "";
          i[i.length] = { t: "Z", v: s.toLowerCase() }, l = s.charAt(1);
        } else
          s.indexOf("$") > -1 && (s = (s.match(/\$([^-\[\]]*)/) || [])[1] || "$", $u(e) || (i[i.length] = { t: "t", v: s }));
        break;
      case ".":
        if (c != null) {
          for (s = o; ++a < e.length && (o = e.charAt(a)) === "0"; )
            s += o;
          i[i.length] = { t: "s", v: s };
          break;
        }
      case "0":
      case "#":
        for (s = o; ++a < e.length && "0#?.,E+-%".indexOf(o = e.charAt(a)) > -1; )
          s += o;
        i[i.length] = { t: "n", v: s };
        break;
      case "?":
        for (s = o; e.charAt(++a) === o; )
          s += o;
        i[i.length] = { t: o, v: s }, l = o;
        break;
      case "*":
        ++a, (e.charAt(a) == " " || e.charAt(a) == "*") && ++a;
        break;
      case "(":
      case ")":
        i[i.length] = { t: n === 1 ? "t" : o, v: o }, ++a;
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        for (s = o; a < e.length && "0123456789".indexOf(e.charAt(++a)) > -1; )
          s += e.charAt(a);
        i[i.length] = { t: "D", v: s };
        break;
      case " ":
        i[i.length] = { t: o, v: o }, ++a;
        break;
      case "$":
        i[i.length] = { t: "t", v: "$" }, ++a;
        break;
      default:
        if (",$-+/():!^&'~{}<>=€acfijklopqrtuvwxzP".indexOf(o) === -1)
          throw new Error("unrecognized character " + o + " in " + e);
        i[i.length] = { t: "t", v: o }, ++a;
        break;
    }
  var m = 0, v = 0, w;
  for (a = i.length - 1, l = "t"; a >= 0; --a)
    switch (i[a].t) {
      case "h":
      case "H":
        i[a].t = u, l = "h", m < 1 && (m = 1);
        break;
      case "s":
        (w = i[a].v.match(/\.0+$/)) && (v = Math.max(v, w[0].length - 1)), m < 3 && (m = 3);
      case "d":
      case "y":
      case "M":
      case "e":
        l = i[a].t;
        break;
      case "m":
        l === "s" && (i[a].t = "M", m < 2 && (m = 2));
        break;
      case "X":
        break;
      case "Z":
        m < 1 && i[a].v.match(/[Hh]/) && (m = 1), m < 2 && i[a].v.match(/[Mm]/) && (m = 2), m < 3 && i[a].v.match(/[Ss]/) && (m = 3);
    }
  switch (m) {
    case 0:
      break;
    case 1:
      c.u >= 0.5 && (c.u = 0, ++c.S), c.S >= 60 && (c.S = 0, ++c.M), c.M >= 60 && (c.M = 0, ++c.H);
      break;
    case 2:
      c.u >= 0.5 && (c.u = 0, ++c.S), c.S >= 60 && (c.S = 0, ++c.M);
      break;
  }
  var S = "", D;
  for (a = 0; a < i.length; ++a)
    switch (i[a].t) {
      case "t":
      case "T":
      case " ":
      case "D":
        break;
      case "X":
        i[a].v = "", i[a].t = ";";
        break;
      case "d":
      case "m":
      case "y":
      case "h":
      case "H":
      case "M":
      case "s":
      case "e":
      case "b":
      case "Z":
        i[a].v = C2(i[a].t.charCodeAt(0), i[a].v, c, v), i[a].t = "t";
        break;
      case "n":
      case "?":
        for (D = a + 1; i[D] != null && ((o = i[D].t) === "?" || o === "D" || (o === " " || o === "t") && i[D + 1] != null && (i[D + 1].t === "?" || i[D + 1].t === "t" && i[D + 1].v === "/") || i[a].t === "(" && (o === " " || o === "n" || o === ")") || o === "t" && (i[D].v === "/" || i[D].v === " " && i[D + 1] != null && i[D + 1].t == "?")); )
          i[a].v += i[D].v, i[D] = { v: "", t: ";" }, ++D;
        S += i[a].v, a = D - 1;
        break;
      case "G":
        i[a].t = "t", i[a].v = Nl(t, r);
        break;
    }
  var P = "", N, O;
  if (S.length > 0) {
    S.charCodeAt(0) == 40 ? (N = t < 0 && S.charCodeAt(0) === 45 ? -t : t, O = en("n", S, N)) : (N = t < 0 && n > 1 ? -t : t, O = en("n", S, N), N < 0 && i[0] && i[0].t == "t" && (O = O.substr(1), i[0].v = "-" + i[0].v)), D = O.length - 1;
    var I = i.length;
    for (a = 0; a < i.length; ++a)
      if (i[a] != null && i[a].t != "t" && i[a].v.indexOf(".") > -1) {
        I = a;
        break;
      }
    var R = i.length;
    if (I === i.length && O.indexOf("E") === -1) {
      for (a = i.length - 1; a >= 0; --a)
        i[a] == null || "n?".indexOf(i[a].t) === -1 || (D >= i[a].v.length - 1 ? (D -= i[a].v.length, i[a].v = O.substr(D + 1, i[a].v.length)) : D < 0 ? i[a].v = "" : (i[a].v = O.substr(0, D + 1), D = -1), i[a].t = "t", R = a);
      D >= 0 && R < i.length && (i[R].v = O.substr(0, D + 1) + i[R].v);
    } else if (I !== i.length && O.indexOf("E") === -1) {
      for (D = O.indexOf(".") - 1, a = I; a >= 0; --a)
        if (!(i[a] == null || "n?".indexOf(i[a].t) === -1)) {
          for (f = i[a].v.indexOf(".") > -1 && a === I ? i[a].v.indexOf(".") - 1 : i[a].v.length - 1, P = i[a].v.substr(f + 1); f >= 0; --f)
            D >= 0 && (i[a].v.charAt(f) === "0" || i[a].v.charAt(f) === "#") && (P = O.charAt(D--) + P);
          i[a].v = P, i[a].t = "t", R = a;
        }
      for (D >= 0 && R < i.length && (i[R].v = O.substr(0, D + 1) + i[R].v), D = O.indexOf(".") + 1, a = I; a < i.length; ++a)
        if (!(i[a] == null || "n?(".indexOf(i[a].t) === -1 && a !== I)) {
          for (f = i[a].v.indexOf(".") > -1 && a === I ? i[a].v.indexOf(".") + 1 : 0, P = i[a].v.substr(0, f); f < i[a].v.length; ++f)
            D < O.length && (P += O.charAt(D++));
          i[a].v = P, i[a].t = "t", R = a;
        }
    }
  }
  for (a = 0; a < i.length; ++a)
    i[a] != null && "n?".indexOf(i[a].t) > -1 && (N = n > 1 && t < 0 && a > 0 && i[a - 1].v === "-" ? -t : t, i[a].v = en(i[a].t, i[a].v, N), i[a].t = "t");
  var z = "";
  for (a = 0; a !== i.length; ++a)
    i[a] != null && (z += i[a].v);
  return z;
}
var Yh = /\[(=|>[=]?|<[>=]?)(-?\d+(?:\.\d*)?)\]/;
function jh(e, t) {
  if (t == null)
    return !1;
  var r = parseFloat(t[2]);
  switch (t[1]) {
    case "=":
      if (e == r)
        return !0;
      break;
    case ">":
      if (e > r)
        return !0;
      break;
    case "<":
      if (e < r)
        return !0;
      break;
    case "<>":
      if (e != r)
        return !0;
      break;
    case ">=":
      if (e >= r)
        return !0;
      break;
    case "<=":
      if (e <= r)
        return !0;
      break;
  }
  return !1;
}
function H2(e, t) {
  var r = U2(e), n = r.length, i = r[n - 1].indexOf("@");
  if (n < 4 && i > -1 && --n, r.length > 4)
    throw new Error("cannot find right format for |" + r.join("|") + "|");
  if (typeof t != "number")
    return [4, r.length === 4 || i > -1 ? r[r.length - 1] : "@"];
  switch (r.length) {
    case 1:
      r = i > -1 ? ["General", "General", "General", r[0]] : [r[0], r[0], r[0], "@"];
      break;
    case 2:
      r = i > -1 ? [r[0], r[0], r[0], r[1]] : [r[0], r[1], r[0], "@"];
      break;
    case 3:
      r = i > -1 ? [r[0], r[1], r[0], r[2]] : [r[0], r[1], r[2], "@"];
      break;
  }
  var s = t > 0 ? r[0] : t < 0 ? r[1] : r[2];
  if (r[0].indexOf("[") === -1 && r[1].indexOf("[") === -1)
    return [n, s];
  if (r[0].match(/\[[=<>]/) != null || r[1].match(/\[[=<>]/) != null) {
    var a = r[0].match(Yh), o = r[1].match(Yh);
    return jh(t, a) ? [n, r[0]] : jh(t, o) ? [n, r[1]] : [n, r[a != null && o != null ? 2 : 1]];
  }
  return [n, s];
}
function En(e, t, r) {
  r == null && (r = {});
  var n = "";
  switch (typeof e) {
    case "string":
      e == "m/d/yy" && r.dateNF ? n = r.dateNF : n = e;
      break;
    case "number":
      e == 14 && r.dateNF ? n = r.dateNF : n = (r.table != null ? r.table : it)[e], n == null && (n = r.table && r.table[zh[e]] || it[zh[e]]), n == null && (n = S2[e] || "General");
      break;
  }
  if (Za(n, 0))
    return Nl(t, r);
  t instanceof Date && (t = Nu(t, r.date1904));
  var i = H2(n, t);
  if (Za(i[1]))
    return Nl(t, r);
  if (t === !0)
    t = "TRUE";
  else if (t === !1)
    t = "FALSE";
  else if (t === "" || t == null)
    return "";
  return z2(i[1], t, r, i[0]);
}
function Gu(e, t) {
  if (typeof t != "number") {
    t = +t || -1;
    for (var r = 0; r < 392; ++r) {
      if (it[r] == null) {
        t < 0 && (t = r);
        continue;
      }
      if (it[r] == e) {
        t = r;
        break;
      }
    }
    t < 0 && (t = 391);
  }
  return it[t] = e, t;
}
function bo(e) {
  for (var t = 0; t != 392; ++t)
    e[t] !== void 0 && Gu(e[t], t);
}
function Eo() {
  it = T2();
}
var Xu = /[dD]+|[mM]+|[yYeE]+|[Hh]+|[Ss]+/g;
function V2(e) {
  var t = typeof e == "number" ? it[e] : e;
  return t = t.replace(Xu, "(\\d+)"), new RegExp("^" + t + "$");
}
function Y2(e, t, r) {
  var n = -1, i = -1, s = -1, a = -1, o = -1, l = -1;
  (t.match(Xu) || []).forEach(function(h, u) {
    var d = parseInt(r[u + 1], 10);
    switch (h.toLowerCase().charAt(0)) {
      case "y":
        n = d;
        break;
      case "d":
        s = d;
        break;
      case "h":
        a = d;
        break;
      case "s":
        l = d;
        break;
      case "m":
        a >= 0 ? o = d : i = d;
        break;
    }
  }), l >= 0 && o == -1 && i >= 0 && (o = i, i = -1);
  var c = ("" + (n >= 0 ? n : (/* @__PURE__ */ new Date()).getFullYear())).slice(-4) + "-" + ("00" + (i >= 1 ? i : 1)).slice(-2) + "-" + ("00" + (s >= 1 ? s : 1)).slice(-2);
  c.length == 7 && (c = "0" + c), c.length == 8 && (c = "20" + c);
  var f = ("00" + (a >= 0 ? a : 0)).slice(-2) + ":" + ("00" + (o >= 0 ? o : 0)).slice(-2) + ":" + ("00" + (l >= 0 ? l : 0)).slice(-2);
  return a == -1 && o == -1 && l == -1 ? c : n == -1 && i == -1 && s == -1 ? f : c + "T" + f;
}
var j2 = /* @__PURE__ */ function() {
  var e = {};
  e.version = "1.2.0";
  function t() {
    for (var O = 0, I = new Array(256), R = 0; R != 256; ++R)
      O = R, O = O & 1 ? -306674912 ^ O >>> 1 : O >>> 1, O = O & 1 ? -306674912 ^ O >>> 1 : O >>> 1, O = O & 1 ? -306674912 ^ O >>> 1 : O >>> 1, O = O & 1 ? -306674912 ^ O >>> 1 : O >>> 1, O = O & 1 ? -306674912 ^ O >>> 1 : O >>> 1, O = O & 1 ? -306674912 ^ O >>> 1 : O >>> 1, O = O & 1 ? -306674912 ^ O >>> 1 : O >>> 1, O = O & 1 ? -306674912 ^ O >>> 1 : O >>> 1, I[R] = O;
    return typeof Int32Array < "u" ? new Int32Array(I) : I;
  }
  var r = t();
  function n(O) {
    var I = 0, R = 0, z = 0, H = typeof Int32Array < "u" ? new Int32Array(4096) : new Array(4096);
    for (z = 0; z != 256; ++z)
      H[z] = O[z];
    for (z = 0; z != 256; ++z)
      for (R = O[z], I = 256 + z; I < 4096; I += 256)
        R = H[I] = R >>> 8 ^ O[R & 255];
    var V = [];
    for (z = 1; z != 16; ++z)
      V[z - 1] = typeof Int32Array < "u" ? H.subarray(z * 256, z * 256 + 256) : H.slice(z * 256, z * 256 + 256);
    return V;
  }
  var i = n(r), s = i[0], a = i[1], o = i[2], l = i[3], c = i[4], f = i[5], h = i[6], u = i[7], d = i[8], p = i[9], g = i[10], m = i[11], v = i[12], w = i[13], S = i[14];
  function D(O, I) {
    for (var R = I ^ -1, z = 0, H = O.length; z < H; )
      R = R >>> 8 ^ r[(R ^ O.charCodeAt(z++)) & 255];
    return ~R;
  }
  function P(O, I) {
    for (var R = I ^ -1, z = O.length - 15, H = 0; H < z; )
      R = S[O[H++] ^ R & 255] ^ w[O[H++] ^ R >> 8 & 255] ^ v[O[H++] ^ R >> 16 & 255] ^ m[O[H++] ^ R >>> 24] ^ g[O[H++]] ^ p[O[H++]] ^ d[O[H++]] ^ u[O[H++]] ^ h[O[H++]] ^ f[O[H++]] ^ c[O[H++]] ^ l[O[H++]] ^ o[O[H++]] ^ a[O[H++]] ^ s[O[H++]] ^ r[O[H++]];
    for (z += 15; H < z; )
      R = R >>> 8 ^ r[(R ^ O[H++]) & 255];
    return ~R;
  }
  function N(O, I) {
    for (var R = I ^ -1, z = 0, H = O.length, V = 0, ee = 0; z < H; )
      V = O.charCodeAt(z++), V < 128 ? R = R >>> 8 ^ r[(R ^ V) & 255] : V < 2048 ? (R = R >>> 8 ^ r[(R ^ (192 | V >> 6 & 31)) & 255], R = R >>> 8 ^ r[(R ^ (128 | V & 63)) & 255]) : V >= 55296 && V < 57344 ? (V = (V & 1023) + 64, ee = O.charCodeAt(z++) & 1023, R = R >>> 8 ^ r[(R ^ (240 | V >> 8 & 7)) & 255], R = R >>> 8 ^ r[(R ^ (128 | V >> 2 & 63)) & 255], R = R >>> 8 ^ r[(R ^ (128 | ee >> 6 & 15 | (V & 3) << 4)) & 255], R = R >>> 8 ^ r[(R ^ (128 | ee & 63)) & 255]) : (R = R >>> 8 ^ r[(R ^ (224 | V >> 12 & 15)) & 255], R = R >>> 8 ^ r[(R ^ (128 | V >> 6 & 63)) & 255], R = R >>> 8 ^ r[(R ^ (128 | V & 63)) & 255]);
    return ~R;
  }
  return e.table = r, e.bstr = D, e.buf = P, e.str = N, e;
}(), Be = /* @__PURE__ */ function() {
  var t = {};
  t.version = "1.2.1";
  function r(_, b) {
    for (var y = _.split("/"), T = b.split("/"), E = 0, A = 0, B = Math.min(y.length, T.length); E < B; ++E) {
      if (A = y[E].length - T[E].length)
        return A;
      if (y[E] != T[E])
        return y[E] < T[E] ? -1 : 1;
    }
    return y.length - T.length;
  }
  function n(_) {
    if (_.charAt(_.length - 1) == "/")
      return _.slice(0, -1).indexOf("/") === -1 ? _ : n(_.slice(0, -1));
    var b = _.lastIndexOf("/");
    return b === -1 ? _ : _.slice(0, b + 1);
  }
  function i(_) {
    if (_.charAt(_.length - 1) == "/")
      return i(_.slice(0, -1));
    var b = _.lastIndexOf("/");
    return b === -1 ? _ : _.slice(b + 1);
  }
  function s(_, b) {
    typeof b == "string" && (b = new Date(b));
    var y = b.getHours();
    y = y << 6 | b.getMinutes(), y = y << 5 | b.getSeconds() >>> 1, _.write_shift(2, y);
    var T = b.getFullYear() - 1980;
    T = T << 4 | b.getMonth() + 1, T = T << 5 | b.getDate(), _.write_shift(2, T);
  }
  function a(_) {
    var b = _.read_shift(2) & 65535, y = _.read_shift(2) & 65535, T = /* @__PURE__ */ new Date(), E = y & 31;
    y >>>= 5;
    var A = y & 15;
    y >>>= 4, T.setMilliseconds(0), T.setFullYear(y + 1980), T.setMonth(A - 1), T.setDate(E);
    var B = b & 31;
    b >>>= 5;
    var X = b & 63;
    return b >>>= 6, T.setHours(b), T.setMinutes(X), T.setSeconds(B << 1), T;
  }
  function o(_) {
    Zt(_, 0);
    for (var b = (
      /*::(*/
      {}
    ), y = 0; _.l <= _.length - 4; ) {
      var T = _.read_shift(2), E = _.read_shift(2), A = _.l + E, B = {};
      switch (T) {
        case 21589:
          y = _.read_shift(1), y & 1 && (B.mtime = _.read_shift(4)), E > 5 && (y & 2 && (B.atime = _.read_shift(4)), y & 4 && (B.ctime = _.read_shift(4))), B.mtime && (B.mt = new Date(B.mtime * 1e3));
          break;
      }
      _.l = A, b[T] = B;
    }
    return b;
  }
  var l;
  function c() {
    return l || (l = {});
  }
  function f(_, b) {
    if (_[0] == 80 && _[1] == 75)
      return cf(_, b);
    if ((_[0] | 32) == 109 && (_[1] | 32) == 105)
      return pp(_, b);
    if (_.length < 512)
      throw new Error("CFB file size " + _.length + " < 512");
    var y = 3, T = 512, E = 0, A = 0, B = 0, X = 0, L = 0, W = [], U = (
      /*::(*/
      _.slice(0, 512)
    );
    Zt(U, 0);
    var J = h(U);
    switch (y = J[0], y) {
      case 3:
        T = 512;
        break;
      case 4:
        T = 4096;
        break;
      case 0:
        if (J[1] == 0)
          return cf(_, b);
      default:
        throw new Error("Major Version: Expected 3 or 4 saw " + y);
    }
    T !== 512 && (U = /*::(*/
    _.slice(0, T), Zt(
      U,
      28
      /* blob.l */
    ));
    var se = _.slice(0, T);
    u(U, y);
    var ce = U.read_shift(4, "i");
    if (y === 3 && ce !== 0)
      throw new Error("# Directory Sectors: Expected 0 saw " + ce);
    U.l += 4, B = U.read_shift(4, "i"), U.l += 4, U.chk("00100000", "Mini Stream Cutoff Size: "), X = U.read_shift(4, "i"), E = U.read_shift(4, "i"), L = U.read_shift(4, "i"), A = U.read_shift(4, "i");
    for (var te = -1, le = 0; le < 109 && (te = U.read_shift(4, "i"), !(te < 0)); ++le)
      W[le] = te;
    var me = d(_, T);
    m(L, A, me, T, W);
    var Ze = w(me, B, W, T);
    Ze[B].name = "!Directory", E > 0 && X !== ee && (Ze[X].name = "!MiniFAT"), Ze[W[0]].name = "!FAT", Ze.fat_addrs = W, Ze.ssz = T;
    var Je = {}, kt = [], Vi = [], Yi = [];
    S(B, Ze, me, kt, E, Je, Vi, X), p(Vi, Yi, kt), kt.shift();
    var ji = {
      FileIndex: Vi,
      FullPaths: Yi
    };
    return b && b.raw && (ji.raw = { header: se, sectors: me }), ji;
  }
  function h(_) {
    if (_[_.l] == 80 && _[_.l + 1] == 75)
      return [0, 0];
    _.chk(ge, "Header Signature: "), _.l += 16;
    var b = _.read_shift(2, "u");
    return [_.read_shift(2, "u"), b];
  }
  function u(_, b) {
    var y = 9;
    switch (_.l += 2, y = _.read_shift(2)) {
      case 9:
        if (b != 3)
          throw new Error("Sector Shift: Expected 9 saw " + y);
        break;
      case 12:
        if (b != 4)
          throw new Error("Sector Shift: Expected 12 saw " + y);
        break;
      default:
        throw new Error("Sector Shift: Expected 9 or 12 saw " + y);
    }
    _.chk("0600", "Mini Sector Shift: "), _.chk("000000000000", "Reserved: ");
  }
  function d(_, b) {
    for (var y = Math.ceil(_.length / b) - 1, T = [], E = 1; E < y; ++E)
      T[E - 1] = _.slice(E * b, (E + 1) * b);
    return T[y - 1] = _.slice(y * b), T;
  }
  function p(_, b, y) {
    for (var T = 0, E = 0, A = 0, B = 0, X = 0, L = y.length, W = [], U = []; T < L; ++T)
      W[T] = U[T] = T, b[T] = y[T];
    for (; X < U.length; ++X)
      T = U[X], E = _[T].L, A = _[T].R, B = _[T].C, W[T] === T && (E !== -1 && W[E] !== E && (W[T] = W[E]), A !== -1 && W[A] !== A && (W[T] = W[A])), B !== -1 && (W[B] = T), E !== -1 && T != W[T] && (W[E] = W[T], U.lastIndexOf(E) < X && U.push(E)), A !== -1 && T != W[T] && (W[A] = W[T], U.lastIndexOf(A) < X && U.push(A));
    for (T = 1; T < L; ++T)
      W[T] === T && (A !== -1 && W[A] !== A ? W[T] = W[A] : E !== -1 && W[E] !== E && (W[T] = W[E]));
    for (T = 1; T < L; ++T)
      if (_[T].type !== 0) {
        if (X = T, X != W[X])
          do
            X = W[X], b[T] = b[X] + "/" + b[T];
          while (X !== 0 && W[X] !== -1 && X != W[X]);
        W[T] = -1;
      }
    for (b[0] += "/", T = 1; T < L; ++T)
      _[T].type !== 2 && (b[T] += "/");
  }
  function g(_, b, y) {
    for (var T = _.start, E = _.size, A = [], B = T; y && E > 0 && B >= 0; )
      A.push(b.slice(B * V, B * V + V)), E -= V, B = zn(y, B * 4);
    return A.length === 0 ? G(0) : Tt(A).slice(0, _.size);
  }
  function m(_, b, y, T, E) {
    var A = ee;
    if (_ === ee) {
      if (b !== 0)
        throw new Error("DIFAT chain shorter than expected");
    } else if (_ !== -1) {
      var B = y[_], X = (T >>> 2) - 1;
      if (!B)
        return;
      for (var L = 0; L < X && (A = zn(B, L * 4)) !== ee; ++L)
        E.push(A);
      m(zn(B, T - 4), b - 1, y, T, E);
    }
  }
  function v(_, b, y, T, E) {
    var A = [], B = [];
    E || (E = []);
    var X = T - 1, L = 0, W = 0;
    for (L = b; L >= 0; ) {
      E[L] = !0, A[A.length] = L, B.push(_[L]);
      var U = y[Math.floor(L * 4 / T)];
      if (W = L * 4 & X, T < 4 + W)
        throw new Error("FAT boundary crossed: " + L + " 4 " + T);
      if (!_[U])
        break;
      L = zn(_[U], W);
    }
    return { nodes: A, data: Qh([B]) };
  }
  function w(_, b, y, T) {
    var E = _.length, A = [], B = [], X = [], L = [], W = T - 1, U = 0, J = 0, se = 0, ce = 0;
    for (U = 0; U < E; ++U)
      if (X = [], se = U + b, se >= E && (se -= E), !B[se]) {
        L = [];
        var te = [];
        for (J = se; J >= 0; ) {
          te[J] = !0, B[J] = !0, X[X.length] = J, L.push(_[J]);
          var le = y[Math.floor(J * 4 / T)];
          if (ce = J * 4 & W, T < 4 + ce)
            throw new Error("FAT boundary crossed: " + J + " 4 " + T);
          if (!_[le] || (J = zn(_[le], ce), te[J]))
            break;
        }
        A[se] = { nodes: X, data: Qh([L]) };
      }
    return A;
  }
  function S(_, b, y, T, E, A, B, X) {
    for (var L = 0, W = T.length ? 2 : 0, U = b[_].data, J = 0, se = 0, ce; J < U.length; J += 128) {
      var te = (
        /*::(*/
        U.slice(J, J + 128)
      );
      Zt(te, 64), se = te.read_shift(2), ce = _c(te, 0, se - W), T.push(ce);
      var le = {
        name: ce,
        type: te.read_shift(1),
        color: te.read_shift(1),
        L: te.read_shift(4, "i"),
        R: te.read_shift(4, "i"),
        C: te.read_shift(4, "i"),
        clsid: te.read_shift(16),
        state: te.read_shift(4, "i"),
        start: 0,
        size: 0
      }, me = te.read_shift(2) + te.read_shift(2) + te.read_shift(2) + te.read_shift(2);
      me !== 0 && (le.ct = D(te, te.l - 8));
      var Ze = te.read_shift(2) + te.read_shift(2) + te.read_shift(2) + te.read_shift(2);
      Ze !== 0 && (le.mt = D(te, te.l - 8)), le.start = te.read_shift(4, "i"), le.size = te.read_shift(4, "i"), le.size < 0 && le.start < 0 && (le.size = le.type = 0, le.start = ee, le.name = ""), le.type === 5 ? (L = le.start, E > 0 && L !== ee && (b[L].name = "!StreamData")) : le.size >= 4096 ? (le.storage = "fat", b[le.start] === void 0 && (b[le.start] = v(y, le.start, b.fat_addrs, b.ssz)), b[le.start].name = le.name, le.content = b[le.start].data.slice(0, le.size)) : (le.storage = "minifat", le.size < 0 ? le.size = 0 : L !== ee && le.start !== ee && b[L] && (le.content = g(le, b[L].data, (b[X] || {}).data))), le.content && Zt(le.content, 0), A[ce] = le, B.push(le);
    }
  }
  function D(_, b) {
    return new Date((Qt(_, b + 4) / 1e7 * Math.pow(2, 32) + Qt(_, b) / 1e7 - 11644473600) * 1e3);
  }
  function P(_, b) {
    return c(), f(l.readFileSync(_), b);
  }
  function N(_, b) {
    var y = b && b.type;
    switch (y || Fe && Buffer.isBuffer(_) && (y = "buffer"), y || "base64") {
      case "file":
        return P(_, b);
      case "base64":
        return f(gr(sn(_)), b);
      case "binary":
        return f(gr(_), b);
    }
    return f(
      /*::typeof blob == 'string' ? new Buffer(blob, 'utf-8') : */
      _,
      b
    );
  }
  function O(_, b) {
    var y = b || {}, T = y.root || "Root Entry";
    if (_.FullPaths || (_.FullPaths = []), _.FileIndex || (_.FileIndex = []), _.FullPaths.length !== _.FileIndex.length)
      throw new Error("inconsistent CFB structure");
    _.FullPaths.length === 0 && (_.FullPaths[0] = T + "/", _.FileIndex[0] = { name: T, type: 5 }), y.CLSID && (_.FileIndex[0].clsid = y.CLSID), I(_);
  }
  function I(_) {
    var b = "Sh33tJ5";
    if (!Be.find(_, "/" + b)) {
      var y = G(4);
      y[0] = 55, y[1] = y[3] = 50, y[2] = 54, _.FileIndex.push({ name: b, type: 2, content: y, size: 4, L: 69, R: 69, C: 69 }), _.FullPaths.push(_.FullPaths[0] + b), R(_);
    }
  }
  function R(_, b) {
    O(_);
    for (var y = !1, T = !1, E = _.FullPaths.length - 1; E >= 0; --E) {
      var A = _.FileIndex[E];
      switch (A.type) {
        case 0:
          T ? y = !0 : (_.FileIndex.pop(), _.FullPaths.pop());
          break;
        case 1:
        case 2:
        case 5:
          T = !0, isNaN(A.R * A.L * A.C) && (y = !0), A.R > -1 && A.L > -1 && A.R == A.L && (y = !0);
          break;
        default:
          y = !0;
          break;
      }
    }
    if (!(!y && !b)) {
      var B = new Date(1987, 1, 19), X = 0, L = Object.create ? /* @__PURE__ */ Object.create(null) : {}, W = [];
      for (E = 0; E < _.FullPaths.length; ++E)
        L[_.FullPaths[E]] = !0, _.FileIndex[E].type !== 0 && W.push([_.FullPaths[E], _.FileIndex[E]]);
      for (E = 0; E < W.length; ++E) {
        var U = n(W[E][0]);
        T = L[U], T || (W.push([U, {
          name: i(U).replace("/", ""),
          type: 1,
          clsid: de,
          ct: B,
          mt: B,
          content: null
        }]), L[U] = !0);
      }
      for (W.sort(function(ce, te) {
        return r(ce[0], te[0]);
      }), _.FullPaths = [], _.FileIndex = [], E = 0; E < W.length; ++E)
        _.FullPaths[E] = W[E][0], _.FileIndex[E] = W[E][1];
      for (E = 0; E < W.length; ++E) {
        var J = _.FileIndex[E], se = _.FullPaths[E];
        if (J.name = i(se).replace("/", ""), J.L = J.R = J.C = -(J.color = 1), J.size = J.content ? J.content.length : 0, J.start = 0, J.clsid = J.clsid || de, E === 0)
          J.C = W.length > 1 ? 1 : -1, J.size = 0, J.type = 5;
        else if (se.slice(-1) == "/") {
          for (X = E + 1; X < W.length && n(_.FullPaths[X]) != se; ++X)
            ;
          for (J.C = X >= W.length ? -1 : X, X = E + 1; X < W.length && n(_.FullPaths[X]) != n(se); ++X)
            ;
          J.R = X >= W.length ? -1 : X, J.type = 1;
        } else
          n(_.FullPaths[E + 1] || "") == n(se) && (J.R = E + 1), J.type = 2;
      }
    }
  }
  function z(_, b) {
    var y = b || {};
    if (y.fileType == "mad")
      return mp(_, y);
    switch (R(_), y.fileType) {
      case "zip":
        return cp(_, y);
    }
    var T = function(ce) {
      for (var te = 0, le = 0, me = 0; me < ce.FileIndex.length; ++me) {
        var Ze = ce.FileIndex[me];
        if (Ze.content) {
          var Je = Ze.content.length;
          Je > 0 && (Je < 4096 ? te += Je + 63 >> 6 : le += Je + 511 >> 9);
        }
      }
      for (var kt = ce.FullPaths.length + 3 >> 2, Vi = te + 7 >> 3, Yi = te + 127 >> 7, ji = Vi + le + kt + Yi, Mn = ji + 127 >> 7, Go = Mn <= 109 ? 0 : Math.ceil((Mn - 109) / 127); ji + Mn + Go + 127 >> 7 > Mn; )
        Go = ++Mn <= 109 ? 0 : Math.ceil((Mn - 109) / 127);
      var Wr = [1, Go, Mn, Yi, kt, le, te, 0];
      return ce.FileIndex[0].size = te << 6, Wr[7] = (ce.FileIndex[0].start = Wr[0] + Wr[1] + Wr[2] + Wr[3] + Wr[4] + Wr[5]) + (Wr[6] + 7 >> 3), Wr;
    }(_), E = G(T[7] << 9), A = 0, B = 0;
    {
      for (A = 0; A < 8; ++A)
        E.write_shift(1, ae[A]);
      for (A = 0; A < 8; ++A)
        E.write_shift(2, 0);
      for (E.write_shift(2, 62), E.write_shift(2, 3), E.write_shift(2, 65534), E.write_shift(2, 9), E.write_shift(2, 6), A = 0; A < 3; ++A)
        E.write_shift(2, 0);
      for (E.write_shift(4, 0), E.write_shift(4, T[2]), E.write_shift(4, T[0] + T[1] + T[2] + T[3] - 1), E.write_shift(4, 0), E.write_shift(4, 4096), E.write_shift(4, T[3] ? T[0] + T[1] + T[2] - 1 : ee), E.write_shift(4, T[3]), E.write_shift(-4, T[1] ? T[0] - 1 : ee), E.write_shift(4, T[1]), A = 0; A < 109; ++A)
        E.write_shift(-4, A < T[2] ? T[1] + A : -1);
    }
    if (T[1])
      for (B = 0; B < T[1]; ++B) {
        for (; A < 236 + B * 127; ++A)
          E.write_shift(-4, A < T[2] ? T[1] + A : -1);
        E.write_shift(-4, B === T[1] - 1 ? ee : B + 1);
      }
    var X = function(ce) {
      for (B += ce; A < B - 1; ++A)
        E.write_shift(-4, A + 1);
      ce && (++A, E.write_shift(-4, ee));
    };
    for (B = A = 0, B += T[1]; A < B; ++A)
      E.write_shift(-4, pe.DIFSECT);
    for (B += T[2]; A < B; ++A)
      E.write_shift(-4, pe.FATSECT);
    X(T[3]), X(T[4]);
    for (var L = 0, W = 0, U = _.FileIndex[0]; L < _.FileIndex.length; ++L)
      U = _.FileIndex[L], U.content && (W = U.content.length, !(W < 4096) && (U.start = B, X(W + 511 >> 9)));
    for (X(T[6] + 7 >> 3); E.l & 511; )
      E.write_shift(-4, pe.ENDOFCHAIN);
    for (B = A = 0, L = 0; L < _.FileIndex.length; ++L)
      U = _.FileIndex[L], U.content && (W = U.content.length, !(!W || W >= 4096) && (U.start = B, X(W + 63 >> 6)));
    for (; E.l & 511; )
      E.write_shift(-4, pe.ENDOFCHAIN);
    for (A = 0; A < T[4] << 2; ++A) {
      var J = _.FullPaths[A];
      if (!J || J.length === 0) {
        for (L = 0; L < 17; ++L)
          E.write_shift(4, 0);
        for (L = 0; L < 3; ++L)
          E.write_shift(4, -1);
        for (L = 0; L < 12; ++L)
          E.write_shift(4, 0);
        continue;
      }
      U = _.FileIndex[A], A === 0 && (U.start = U.size ? U.start - 1 : ee);
      var se = A === 0 && y.root || U.name;
      if (W = 2 * (se.length + 1), E.write_shift(64, se, "utf16le"), E.write_shift(2, W), E.write_shift(1, U.type), E.write_shift(1, U.color), E.write_shift(-4, U.L), E.write_shift(-4, U.R), E.write_shift(-4, U.C), U.clsid)
        E.write_shift(16, U.clsid, "hex");
      else
        for (L = 0; L < 4; ++L)
          E.write_shift(4, 0);
      E.write_shift(4, U.state || 0), E.write_shift(4, 0), E.write_shift(4, 0), E.write_shift(4, 0), E.write_shift(4, 0), E.write_shift(4, U.start), E.write_shift(4, U.size), E.write_shift(4, 0);
    }
    for (A = 1; A < _.FileIndex.length; ++A)
      if (U = _.FileIndex[A], U.size >= 4096)
        if (E.l = U.start + 1 << 9, Fe && Buffer.isBuffer(U.content))
          U.content.copy(E, E.l, 0, U.size), E.l += U.size + 511 & -512;
        else {
          for (L = 0; L < U.size; ++L)
            E.write_shift(1, U.content[L]);
          for (; L & 511; ++L)
            E.write_shift(1, 0);
        }
    for (A = 1; A < _.FileIndex.length; ++A)
      if (U = _.FileIndex[A], U.size > 0 && U.size < 4096)
        if (Fe && Buffer.isBuffer(U.content))
          U.content.copy(E, E.l, 0, U.size), E.l += U.size + 63 & -64;
        else {
          for (L = 0; L < U.size; ++L)
            E.write_shift(1, U.content[L]);
          for (; L & 63; ++L)
            E.write_shift(1, 0);
        }
    if (Fe)
      E.l = E.length;
    else
      for (; E.l < E.length; )
        E.write_shift(1, 0);
    return E;
  }
  function H(_, b) {
    var y = _.FullPaths.map(function(L) {
      return L.toUpperCase();
    }), T = y.map(function(L) {
      var W = L.split("/");
      return W[W.length - (L.slice(-1) == "/" ? 2 : 1)];
    }), E = !1;
    b.charCodeAt(0) === 47 ? (E = !0, b = y[0].slice(0, -1) + b) : E = b.indexOf("/") !== -1;
    var A = b.toUpperCase(), B = E === !0 ? y.indexOf(A) : T.indexOf(A);
    if (B !== -1)
      return _.FileIndex[B];
    var X = !A.match(wa);
    for (A = A.replace(ps, ""), X && (A = A.replace(wa, "!")), B = 0; B < y.length; ++B)
      if ((X ? y[B].replace(wa, "!") : y[B]).replace(ps, "") == A || (X ? T[B].replace(wa, "!") : T[B]).replace(ps, "") == A)
        return _.FileIndex[B];
    return null;
  }
  var V = 64, ee = -2, ge = "d0cf11e0a1b11ae1", ae = [208, 207, 17, 224, 161, 177, 26, 225], de = "00000000000000000000000000000000", pe = {
    /* 2.1 Compund File Sector Numbers and Types */
    MAXREGSECT: -6,
    DIFSECT: -4,
    FATSECT: -3,
    ENDOFCHAIN: ee,
    FREESECT: -1,
    /* 2.2 Compound File Header */
    HEADER_SIGNATURE: ge,
    HEADER_MINOR_VERSION: "3e00",
    MAXREGSID: -6,
    NOSTREAM: -1,
    HEADER_CLSID: de,
    /* 2.6.1 Compound File Directory Entry */
    EntryTypes: ["unknown", "storage", "stream", "lockbytes", "property", "root"]
  };
  function Ue(_, b, y) {
    c();
    var T = z(_, y);
    l.writeFileSync(b, T);
  }
  function ye(_) {
    for (var b = new Array(_.length), y = 0; y < _.length; ++y)
      b[y] = String.fromCharCode(_[y]);
    return b.join("");
  }
  function et(_, b) {
    var y = z(_, b);
    switch (b && b.type || "buffer") {
      case "file":
        return c(), l.writeFileSync(b.filename, y), y;
      case "binary":
        return typeof y == "string" ? y : ye(y);
      case "base64":
        return Cs(typeof y == "string" ? y : ye(y));
      case "buffer":
        if (Fe)
          return Buffer.isBuffer(y) ? y : cn(y);
      case "array":
        return typeof y == "string" ? gr(y) : y;
    }
    return y;
  }
  var lt;
  function M(_) {
    try {
      var b = _.InflateRaw, y = new b();
      if (y._processChunk(new Uint8Array([3, 0]), y._finishFlushFlag), y.bytesRead)
        lt = _;
      else
        throw new Error("zlib does not expose bytesRead");
    } catch (T) {
      console.error("cannot use native zlib: " + (T.message || T));
    }
  }
  function C(_, b) {
    if (!lt)
      return of(_, b);
    var y = lt.InflateRaw, T = new y(), E = T._processChunk(_.slice(_.l), T._finishFlushFlag);
    return _.l += T.bytesRead, E;
  }
  function x(_) {
    return lt ? lt.deflateRawSync(_) : ef(_);
  }
  var k = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258], Y = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
  function Z(_) {
    var b = (_ << 1 | _ << 11) & 139536 | (_ << 5 | _ << 15) & 558144;
    return (b >> 16 | b >> 8 | b) & 255;
  }
  for (var K = typeof Uint8Array < "u", j = K ? new Uint8Array(256) : [], Ae = 0; Ae < 256; ++Ae)
    j[Ae] = Z(Ae);
  function we(_, b) {
    var y = j[_ & 255];
    return b <= 8 ? y >>> 8 - b : (y = y << 8 | j[_ >> 8 & 255], b <= 16 ? y >>> 16 - b : (y = y << 8 | j[_ >> 16 & 255], y >>> 24 - b));
  }
  function Lt(_, b) {
    var y = b & 7, T = b >>> 3;
    return (_[T] | (y <= 6 ? 0 : _[T + 1] << 8)) >>> y & 3;
  }
  function Ce(_, b) {
    var y = b & 7, T = b >>> 3;
    return (_[T] | (y <= 5 ? 0 : _[T + 1] << 8)) >>> y & 7;
  }
  function Nr(_, b) {
    var y = b & 7, T = b >>> 3;
    return (_[T] | (y <= 4 ? 0 : _[T + 1] << 8)) >>> y & 15;
  }
  function tt(_, b) {
    var y = b & 7, T = b >>> 3;
    return (_[T] | (y <= 3 ? 0 : _[T + 1] << 8)) >>> y & 31;
  }
  function he(_, b) {
    var y = b & 7, T = b >>> 3;
    return (_[T] | (y <= 1 ? 0 : _[T + 1] << 8)) >>> y & 127;
  }
  function nr(_, b, y) {
    var T = b & 7, E = b >>> 3, A = (1 << y) - 1, B = _[E] >>> T;
    return y < 8 - T || (B |= _[E + 1] << 8 - T, y < 16 - T) || (B |= _[E + 2] << 16 - T, y < 24 - T) || (B |= _[E + 3] << 24 - T), B & A;
  }
  function Br(_, b, y) {
    var T = b & 7, E = b >>> 3;
    return T <= 5 ? _[E] |= (y & 7) << T : (_[E] |= y << T & 255, _[E + 1] = (y & 7) >> 8 - T), b + 3;
  }
  function Fn(_, b, y) {
    var T = b & 7, E = b >>> 3;
    return y = (y & 1) << T, _[E] |= y, b + 1;
  }
  function hi(_, b, y) {
    var T = b & 7, E = b >>> 3;
    return y <<= T, _[E] |= y & 255, y >>>= 8, _[E + 1] = y, b + 8;
  }
  function Qc(_, b, y) {
    var T = b & 7, E = b >>> 3;
    return y <<= T, _[E] |= y & 255, y >>>= 8, _[E + 1] = y & 255, _[E + 2] = y >>> 8, b + 16;
  }
  function Vo(_, b) {
    var y = _.length, T = 2 * y > b ? 2 * y : b + 5, E = 0;
    if (y >= b)
      return _;
    if (Fe) {
      var A = Bh(T);
      if (_.copy)
        _.copy(A);
      else
        for (; E < _.length; ++E)
          A[E] = _[E];
      return A;
    } else if (K) {
      var B = new Uint8Array(T);
      if (B.set)
        B.set(_);
      else
        for (; E < y; ++E)
          B[E] = _[E];
      return B;
    }
    return _.length = T, _;
  }
  function br(_) {
    for (var b = new Array(_), y = 0; y < _; ++y)
      b[y] = 0;
    return b;
  }
  function ea(_, b, y) {
    var T = 1, E = 0, A = 0, B = 0, X = 0, L = _.length, W = K ? new Uint16Array(32) : br(32);
    for (A = 0; A < 32; ++A)
      W[A] = 0;
    for (A = L; A < y; ++A)
      _[A] = 0;
    L = _.length;
    var U = K ? new Uint16Array(L) : br(L);
    for (A = 0; A < L; ++A)
      W[E = _[A]]++, T < E && (T = E), U[A] = 0;
    for (W[0] = 0, A = 1; A <= T; ++A)
      W[A + 16] = X = X + W[A - 1] << 1;
    for (A = 0; A < L; ++A)
      X = _[A], X != 0 && (U[A] = W[X + 16]++);
    var J = 0;
    for (A = 0; A < L; ++A)
      if (J = _[A], J != 0)
        for (X = we(U[A], T) >> T - J, B = (1 << T + 4 - J) - 1; B >= 0; --B)
          b[X | B << J] = J & 15 | A << 4;
    return T;
  }
  var Yo = K ? new Uint16Array(512) : br(512), jo = K ? new Uint16Array(32) : br(32);
  if (!K) {
    for (var Cn = 0; Cn < 512; ++Cn)
      Yo[Cn] = 0;
    for (Cn = 0; Cn < 32; ++Cn)
      jo[Cn] = 0;
  }
  (function() {
    for (var _ = [], b = 0; b < 32; b++)
      _.push(5);
    ea(_, jo, 32);
    var y = [];
    for (b = 0; b <= 143; b++)
      y.push(8);
    for (; b <= 255; b++)
      y.push(9);
    for (; b <= 279; b++)
      y.push(7);
    for (; b <= 287; b++)
      y.push(8);
    ea(y, Yo, 288);
  })();
  var sp = /* @__PURE__ */ function() {
    for (var b = K ? new Uint8Array(32768) : [], y = 0, T = 0; y < Y.length - 1; ++y)
      for (; T < Y[y + 1]; ++T)
        b[T] = y;
    for (; T < 32768; ++T)
      b[T] = 29;
    var E = K ? new Uint8Array(259) : [];
    for (y = 0, T = 0; y < F.length - 1; ++y)
      for (; T < F[y + 1]; ++T)
        E[T] = y;
    function A(X, L) {
      for (var W = 0; W < X.length; ) {
        var U = Math.min(65535, X.length - W), J = W + U == X.length;
        for (L.write_shift(1, +J), L.write_shift(2, U), L.write_shift(2, ~U & 65535); U-- > 0; )
          L[L.l++] = X[W++];
      }
      return L.l;
    }
    function B(X, L) {
      for (var W = 0, U = 0, J = K ? new Uint16Array(32768) : []; U < X.length; ) {
        var se = (
          /* data.length - boff; */
          Math.min(65535, X.length - U)
        );
        if (se < 10) {
          for (W = Br(L, W, +(U + se == X.length)), W & 7 && (W += 8 - (W & 7)), L.l = W / 8 | 0, L.write_shift(2, se), L.write_shift(2, ~se & 65535); se-- > 0; )
            L[L.l++] = X[U++];
          W = L.l * 8;
          continue;
        }
        W = Br(L, W, +(U + se == X.length) + 2);
        for (var ce = 0; se-- > 0; ) {
          var te = X[U];
          ce = (ce << 5 ^ te) & 32767;
          var le = -1, me = 0;
          if ((le = J[ce]) && (le |= U & -32768, le > U && (le -= 32768), le < U))
            for (; X[le + me] == X[U + me] && me < 250; )
              ++me;
          if (me > 2) {
            te = E[me], te <= 22 ? W = hi(L, W, j[te + 1] >> 1) - 1 : (hi(L, W, 3), W += 5, hi(L, W, j[te - 23] >> 5), W += 3);
            var Ze = te < 8 ? 0 : te - 4 >> 2;
            Ze > 0 && (Qc(L, W, me - F[te]), W += Ze), te = b[U - le], W = hi(L, W, j[te] >> 3), W -= 3;
            var Je = te < 4 ? 0 : te - 2 >> 1;
            Je > 0 && (Qc(L, W, U - le - Y[te]), W += Je);
            for (var kt = 0; kt < me; ++kt)
              J[ce] = U & 32767, ce = (ce << 5 ^ X[U]) & 32767, ++U;
            se -= me - 1;
          } else
            te <= 143 ? te = te + 48 : W = Fn(L, W, 1), W = hi(L, W, j[te]), J[ce] = U & 32767, ++U;
        }
        W = hi(L, W, 0) - 1;
      }
      return L.l = (W + 7) / 8 | 0, L.l;
    }
    return function(L, W) {
      return L.length < 8 ? A(L, W) : B(L, W);
    };
  }();
  function ef(_) {
    var b = G(50 + Math.floor(_.length * 1.1)), y = sp(_, b);
    return b.slice(0, y);
  }
  var tf = K ? new Uint16Array(32768) : br(32768), rf = K ? new Uint16Array(32768) : br(32768), nf = K ? new Uint16Array(128) : br(128), sf = 1, af = 1;
  function ap(_, b) {
    var y = tt(_, b) + 257;
    b += 5;
    var T = tt(_, b) + 1;
    b += 5;
    var E = Nr(_, b) + 4;
    b += 4;
    for (var A = 0, B = K ? new Uint8Array(19) : br(19), X = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], L = 1, W = K ? new Uint8Array(8) : br(8), U = K ? new Uint8Array(8) : br(8), J = B.length, se = 0; se < E; ++se)
      B[k[se]] = A = Ce(_, b), L < A && (L = A), W[A]++, b += 3;
    var ce = 0;
    for (W[0] = 0, se = 1; se <= L; ++se)
      U[se] = ce = ce + W[se - 1] << 1;
    for (se = 0; se < J; ++se)
      (ce = B[se]) != 0 && (X[se] = U[ce]++);
    var te = 0;
    for (se = 0; se < J; ++se)
      if (te = B[se], te != 0) {
        ce = j[X[se]] >> 8 - te;
        for (var le = (1 << 7 - te) - 1; le >= 0; --le)
          nf[ce | le << te] = te & 7 | se << 3;
      }
    var me = [];
    for (L = 1; me.length < y + T; )
      switch (ce = nf[he(_, b)], b += ce & 7, ce >>>= 3) {
        case 16:
          for (A = 3 + Lt(_, b), b += 2, ce = me[me.length - 1]; A-- > 0; )
            me.push(ce);
          break;
        case 17:
          for (A = 3 + Ce(_, b), b += 3; A-- > 0; )
            me.push(0);
          break;
        case 18:
          for (A = 11 + he(_, b), b += 7; A-- > 0; )
            me.push(0);
          break;
        default:
          me.push(ce), L < ce && (L = ce);
          break;
      }
    var Ze = me.slice(0, y), Je = me.slice(y);
    for (se = y; se < 286; ++se)
      Ze[se] = 0;
    for (se = T; se < 30; ++se)
      Je[se] = 0;
    return sf = ea(Ze, tf, 286), af = ea(Je, rf, 30), b;
  }
  function op(_, b) {
    if (_[0] == 3 && !(_[1] & 3))
      return [Zn(b), 2];
    for (var y = 0, T = 0, E = Bh(b || 1 << 18), A = 0, B = E.length >>> 0, X = 0, L = 0; !(T & 1); ) {
      if (T = Ce(_, y), y += 3, T >>> 1)
        T >> 1 == 1 ? (X = 9, L = 5) : (y = ap(_, y), X = sf, L = af);
      else {
        y & 7 && (y += 8 - (y & 7));
        var W = _[y >>> 3] | _[(y >>> 3) + 1] << 8;
        if (y += 32, W > 0)
          for (!b && B < A + W && (E = Vo(E, A + W), B = E.length); W-- > 0; )
            E[A++] = _[y >>> 3], y += 8;
        continue;
      }
      for (; ; ) {
        !b && B < A + 32767 && (E = Vo(E, A + 32767), B = E.length);
        var U = nr(_, y, X), J = T >>> 1 == 1 ? Yo[U] : tf[U];
        if (y += J & 15, J >>>= 4, !(J >>> 8 & 255))
          E[A++] = J;
        else {
          if (J == 256)
            break;
          J -= 257;
          var se = J < 8 ? 0 : J - 4 >> 2;
          se > 5 && (se = 0);
          var ce = A + F[J];
          se > 0 && (ce += nr(_, y, se), y += se), U = nr(_, y, L), J = T >>> 1 == 1 ? jo[U] : rf[U], y += J & 15, J >>>= 4;
          var te = J < 4 ? 0 : J - 2 >> 1, le = Y[J];
          for (te > 0 && (le += nr(_, y, te), y += te), !b && B < ce && (E = Vo(E, ce + 100), B = E.length); A < ce; )
            E[A] = E[A - le], ++A;
        }
      }
    }
    return b ? [E, y + 7 >>> 3] : [E.slice(0, A), y + 7 >>> 3];
  }
  function of(_, b) {
    var y = _.slice(_.l || 0), T = op(y, b);
    return _.l += T[1], T[0];
  }
  function lf(_, b) {
    if (_)
      typeof console < "u" && console.error(b);
    else
      throw new Error(b);
  }
  function cf(_, b) {
    var y = (
      /*::(*/
      _
    );
    Zt(y, 0);
    var T = [], E = [], A = {
      FileIndex: T,
      FullPaths: E
    };
    O(A, { root: b.root });
    for (var B = y.length - 4; (y[B] != 80 || y[B + 1] != 75 || y[B + 2] != 5 || y[B + 3] != 6) && B >= 0; )
      --B;
    y.l = B + 4, y.l += 4;
    var X = y.read_shift(2);
    y.l += 6;
    var L = y.read_shift(4);
    for (y.l = L, B = 0; B < X; ++B) {
      y.l += 20;
      var W = y.read_shift(4), U = y.read_shift(4), J = y.read_shift(2), se = y.read_shift(2), ce = y.read_shift(2);
      y.l += 8;
      var te = y.read_shift(4), le = o(
        /*::(*/
        y.slice(y.l + J, y.l + J + se)
        /*:: :any)*/
      );
      y.l += J + se + ce;
      var me = y.l;
      y.l = te + 4, lp(y, W, U, A, le), y.l = me;
    }
    return A;
  }
  function lp(_, b, y, T, E) {
    _.l += 2;
    var A = _.read_shift(2), B = _.read_shift(2), X = a(_);
    if (A & 8257)
      throw new Error("Unsupported ZIP encryption");
    for (var L = _.read_shift(4), W = _.read_shift(4), U = _.read_shift(4), J = _.read_shift(2), se = _.read_shift(2), ce = "", te = 0; te < J; ++te)
      ce += String.fromCharCode(_[_.l++]);
    if (se) {
      var le = o(
        /*::(*/
        _.slice(_.l, _.l + se)
        /*:: :any)*/
      );
      (le[21589] || {}).mt && (X = le[21589].mt), ((E || {})[21589] || {}).mt && (X = E[21589].mt);
    }
    _.l += se;
    var me = _.slice(_.l, _.l + W);
    switch (B) {
      case 8:
        me = C(_, U);
        break;
      case 0:
        break;
      default:
        throw new Error("Unsupported ZIP Compression method " + B);
    }
    var Ze = !1;
    A & 8 && (L = _.read_shift(4), L == 134695760 && (L = _.read_shift(4), Ze = !0), W = _.read_shift(4), U = _.read_shift(4)), W != b && lf(Ze, "Bad compressed size: " + b + " != " + W), U != y && lf(Ze, "Bad uncompressed size: " + y + " != " + U), $o(T, ce, me, { unsafe: !0, mt: X });
  }
  function cp(_, b) {
    var y = b || {}, T = [], E = [], A = G(1), B = y.compression ? 8 : 0, X = 0, L = 0, W = 0, U = 0, J = 0, se = _.FullPaths[0], ce = se, te = _.FileIndex[0], le = [], me = 0;
    for (L = 1; L < _.FullPaths.length; ++L)
      if (ce = _.FullPaths[L].slice(se.length), te = _.FileIndex[L], !(!te.size || !te.content || ce == "Sh33tJ5")) {
        var Ze = U, Je = G(ce.length);
        for (W = 0; W < ce.length; ++W)
          Je.write_shift(1, ce.charCodeAt(W) & 127);
        Je = Je.slice(0, Je.l), le[J] = j2.buf(
          /*::((*/
          te.content,
          0
        );
        var kt = te.content;
        B == 8 && (kt = x(kt)), A = G(30), A.write_shift(4, 67324752), A.write_shift(2, 20), A.write_shift(2, X), A.write_shift(2, B), te.mt ? s(A, te.mt) : A.write_shift(4, 0), A.write_shift(-4, le[J]), A.write_shift(4, kt.length), A.write_shift(
          4,
          /*::(*/
          te.content.length
        ), A.write_shift(2, Je.length), A.write_shift(2, 0), U += A.length, T.push(A), U += Je.length, T.push(Je), U += kt.length, T.push(kt), A = G(46), A.write_shift(4, 33639248), A.write_shift(2, 0), A.write_shift(2, 20), A.write_shift(2, X), A.write_shift(2, B), A.write_shift(4, 0), A.write_shift(-4, le[J]), A.write_shift(4, kt.length), A.write_shift(
          4,
          /*::(*/
          te.content.length
        ), A.write_shift(2, Je.length), A.write_shift(2, 0), A.write_shift(2, 0), A.write_shift(2, 0), A.write_shift(2, 0), A.write_shift(4, 0), A.write_shift(4, Ze), me += A.l, E.push(A), me += Je.length, E.push(Je), ++J;
      }
    return A = G(22), A.write_shift(4, 101010256), A.write_shift(2, 0), A.write_shift(2, 0), A.write_shift(2, J), A.write_shift(2, J), A.write_shift(4, me), A.write_shift(4, U), A.write_shift(2, 0), Tt([Tt(T), Tt(E), A]);
  }
  var ta = {
    htm: "text/html",
    xml: "text/xml",
    gif: "image/gif",
    jpg: "image/jpeg",
    png: "image/png",
    mso: "application/x-mso",
    thmx: "application/vnd.ms-officetheme",
    sh33tj5: "application/octet-stream"
  };
  function fp(_, b) {
    if (_.ctype)
      return _.ctype;
    var y = _.name || "", T = y.match(/\.([^\.]+)$/);
    return T && ta[T[1]] || b && (T = (y = b).match(/[\.\\]([^\.\\])+$/), T && ta[T[1]]) ? ta[T[1]] : "application/octet-stream";
  }
  function hp(_) {
    for (var b = Cs(_), y = [], T = 0; T < b.length; T += 76)
      y.push(b.slice(T, T + 76));
    return y.join(`\r
`) + `\r
`;
  }
  function up(_) {
    var b = _.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7E-\xFF=]/g, function(W) {
      var U = W.charCodeAt(0).toString(16).toUpperCase();
      return "=" + (U.length == 1 ? "0" + U : U);
    });
    b = b.replace(/ $/mg, "=20").replace(/\t$/mg, "=09"), b.charAt(0) == `
` && (b = "=0D" + b.slice(1)), b = b.replace(/\r(?!\n)/mg, "=0D").replace(/\n\n/mg, `
=0A`).replace(/([^\r\n])\n/mg, "$1=0A");
    for (var y = [], T = b.split(`\r
`), E = 0; E < T.length; ++E) {
      var A = T[E];
      if (A.length == 0) {
        y.push("");
        continue;
      }
      for (var B = 0; B < A.length; ) {
        var X = 76, L = A.slice(B, B + X);
        L.charAt(X - 1) == "=" ? X-- : L.charAt(X - 2) == "=" ? X -= 2 : L.charAt(X - 3) == "=" && (X -= 3), L = A.slice(B, B + X), B += X, B < A.length && (L += "="), y.push(L);
      }
    }
    return y.join(`\r
`);
  }
  function dp(_) {
    for (var b = [], y = 0; y < _.length; ++y) {
      for (var T = _[y]; y <= _.length && T.charAt(T.length - 1) == "="; )
        T = T.slice(0, T.length - 1) + _[++y];
      b.push(T);
    }
    for (var E = 0; E < b.length; ++E)
      b[E] = b[E].replace(/[=][0-9A-Fa-f]{2}/g, function(A) {
        return String.fromCharCode(parseInt(A.slice(1), 16));
      });
    return gr(b.join(`\r
`));
  }
  function gp(_, b, y) {
    for (var T = "", E = "", A = "", B, X = 0; X < 10; ++X) {
      var L = b[X];
      if (!L || L.match(/^\s*$/))
        break;
      var W = L.match(/^(.*?):\s*([^\s].*)$/);
      if (W)
        switch (W[1].toLowerCase()) {
          case "content-location":
            T = W[2].trim();
            break;
          case "content-type":
            A = W[2].trim();
            break;
          case "content-transfer-encoding":
            E = W[2].trim();
            break;
        }
    }
    switch (++X, E.toLowerCase()) {
      case "base64":
        B = gr(sn(b.slice(X).join("")));
        break;
      case "quoted-printable":
        B = dp(b.slice(X));
        break;
      default:
        throw new Error("Unsupported Content-Transfer-Encoding " + E);
    }
    var U = $o(_, T.slice(y.length), B, { unsafe: !0 });
    A && (U.ctype = A);
  }
  function pp(_, b) {
    if (ye(_.slice(0, 13)).toLowerCase() != "mime-version:")
      throw new Error("Unsupported MAD header");
    var y = b && b.root || "", T = (Fe && Buffer.isBuffer(_) ? _.toString("binary") : ye(_)).split(`\r
`), E = 0, A = "";
    for (E = 0; E < T.length; ++E)
      if (A = T[E], !!/^Content-Location:/i.test(A) && (A = A.slice(A.indexOf("file")), y || (y = A.slice(0, A.lastIndexOf("/") + 1)), A.slice(0, y.length) != y))
        for (; y.length > 0 && (y = y.slice(0, y.length - 1), y = y.slice(0, y.lastIndexOf("/") + 1), A.slice(0, y.length) != y); )
          ;
    var B = (T[1] || "").match(/boundary="(.*?)"/);
    if (!B)
      throw new Error("MAD cannot find boundary");
    var X = "--" + (B[1] || ""), L = [], W = [], U = {
      FileIndex: L,
      FullPaths: W
    };
    O(U);
    var J, se = 0;
    for (E = 0; E < T.length; ++E) {
      var ce = T[E];
      ce !== X && ce !== X + "--" || (se++ && gp(U, T.slice(J, E), y), J = E);
    }
    return U;
  }
  function mp(_, b) {
    var y = b || {}, T = y.boundary || "SheetJS";
    T = "------=" + T;
    for (var E = [
      "MIME-Version: 1.0",
      'Content-Type: multipart/related; boundary="' + T.slice(2) + '"',
      "",
      "",
      ""
    ], A = _.FullPaths[0], B = A, X = _.FileIndex[0], L = 1; L < _.FullPaths.length; ++L)
      if (B = _.FullPaths[L].slice(A.length), X = _.FileIndex[L], !(!X.size || !X.content || B == "Sh33tJ5")) {
        B = B.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7E-\xFF]/g, function(me) {
          return "_x" + me.charCodeAt(0).toString(16) + "_";
        }).replace(/[\u0080-\uFFFF]/g, function(me) {
          return "_u" + me.charCodeAt(0).toString(16) + "_";
        });
        for (var W = X.content, U = Fe && Buffer.isBuffer(W) ? W.toString("binary") : ye(W), J = 0, se = Math.min(1024, U.length), ce = 0, te = 0; te <= se; ++te)
          (ce = U.charCodeAt(te)) >= 32 && ce < 128 && ++J;
        var le = J >= se * 4 / 5;
        E.push(T), E.push("Content-Location: " + (y.root || "file:///C:/SheetJS/") + B), E.push("Content-Transfer-Encoding: " + (le ? "quoted-printable" : "base64")), E.push("Content-Type: " + fp(X, B)), E.push(""), E.push(le ? up(U) : hp(U));
      }
    return E.push(T + `--\r
`), E.join(`\r
`);
  }
  function xp(_) {
    var b = {};
    return O(b, _), b;
  }
  function $o(_, b, y, T) {
    var E = T && T.unsafe;
    E || O(_);
    var A = !E && Be.find(_, b);
    if (!A) {
      var B = _.FullPaths[0];
      b.slice(0, B.length) == B ? B = b : (B.slice(-1) != "/" && (B += "/"), B = (B + b).replace("//", "/")), A = { name: i(b), type: 2 }, _.FileIndex.push(A), _.FullPaths.push(B), E || Be.utils.cfb_gc(_);
    }
    return A.content = y, A.size = y ? y.length : 0, T && (T.CLSID && (A.clsid = T.CLSID), T.mt && (A.mt = T.mt), T.ct && (A.ct = T.ct)), A;
  }
  function _p(_, b) {
    O(_);
    var y = Be.find(_, b);
    if (y) {
      for (var T = 0; T < _.FileIndex.length; ++T)
        if (_.FileIndex[T] == y)
          return _.FileIndex.splice(T, 1), _.FullPaths.splice(T, 1), !0;
    }
    return !1;
  }
  function vp(_, b, y) {
    O(_);
    var T = Be.find(_, b);
    if (T) {
      for (var E = 0; E < _.FileIndex.length; ++E)
        if (_.FileIndex[E] == T)
          return _.FileIndex[E].name = i(y), _.FullPaths[E] = y, !0;
    }
    return !1;
  }
  function yp(_) {
    R(_, !0);
  }
  return t.find = H, t.read = N, t.parse = f, t.write = et, t.writeFile = Ue, t.utils = {
    cfb_new: xp,
    cfb_add: $o,
    cfb_del: _p,
    cfb_mov: vp,
    cfb_gc: yp,
    ReadShift: xs,
    CheckField: ud,
    prep_blob: Zt,
    bconcat: Tt,
    use_zlib: M,
    _deflateRaw: ef,
    _inflateRaw: of,
    consts: pe
  }, t;
}();
function $2(e) {
  return typeof e == "string" ? So(e) : Array.isArray(e) ? _2(e) : e;
}
function js(e, t, r) {
  if (typeof Deno < "u") {
    if (r && typeof t == "string")
      switch (r) {
        case "utf8":
          t = new TextEncoder(r).encode(t);
          break;
        case "binary":
          t = So(t);
          break;
        default:
          throw new Error("Unsupported encoding " + r);
      }
    return Deno.writeFileSync(e, t);
  }
  var n = r == "utf8" ? Zr(t) : t;
  if (typeof IE_SaveFile < "u")
    return IE_SaveFile(n, e);
  if (typeof Blob < "u") {
    var i = new Blob([$2(n)], { type: "application/octet-stream" });
    if (typeof navigator < "u" && navigator.msSaveBlob)
      return navigator.msSaveBlob(i, e);
    if (typeof saveAs < "u")
      return saveAs(i, e);
    if (typeof URL < "u" && typeof document < "u" && document.createElement && URL.createObjectURL) {
      var s = URL.createObjectURL(i);
      if (typeof chrome == "object" && typeof (chrome.downloads || {}).download == "function")
        return URL.revokeObjectURL && typeof setTimeout < "u" && setTimeout(function() {
          URL.revokeObjectURL(s);
        }, 6e4), chrome.downloads.download({ url: s, filename: e, saveAs: !0 });
      var a = document.createElement("a");
      if (a.download != null)
        return a.download = e, a.href = s, document.body.appendChild(a), a.click(), document.body.removeChild(a), URL.revokeObjectURL && typeof setTimeout < "u" && setTimeout(function() {
          URL.revokeObjectURL(s);
        }, 6e4), s;
    }
  }
  if (typeof $ < "u" && typeof File < "u" && typeof Folder < "u")
    try {
      var o = File(e);
      return o.open("w"), o.encoding = "binary", Array.isArray(t) && (t = Ys(t)), o.write(t), o.close(), t;
    } catch (l) {
      if (!l.message || !l.message.match(/onstruct/))
        throw l;
    }
  throw new Error("cannot save file " + e);
}
function At(e) {
  for (var t = Object.keys(e), r = [], n = 0; n < t.length; ++n)
    Object.prototype.hasOwnProperty.call(e, t[n]) && r.push(t[n]);
  return r;
}
function $h(e, t) {
  for (var r = [], n = At(e), i = 0; i !== n.length; ++i)
    r[e[n[i]][t]] == null && (r[e[n[i]][t]] = n[i]);
  return r;
}
function gc(e) {
  for (var t = [], r = At(e), n = 0; n !== r.length; ++n)
    t[e[r[n]]] = r[n];
  return t;
}
function Ao(e) {
  for (var t = [], r = At(e), n = 0; n !== r.length; ++n)
    t[e[r[n]]] = parseInt(r[n], 10);
  return t;
}
function G2(e) {
  for (var t = [], r = At(e), n = 0; n !== r.length; ++n)
    t[e[r[n]]] == null && (t[e[r[n]]] = []), t[e[r[n]]].push(r[n]);
  return t;
}
var Qa = /* @__PURE__ */ new Date(1899, 11, 30, 0, 0, 0);
function $t(e, t) {
  var r = /* @__PURE__ */ e.getTime();
  t && (r -= 1462 * 24 * 60 * 60 * 1e3);
  var n = /* @__PURE__ */ Qa.getTime() + (/* @__PURE__ */ e.getTimezoneOffset() - /* @__PURE__ */ Qa.getTimezoneOffset()) * 6e4;
  return (r - n) / (24 * 60 * 60 * 1e3);
}
var Ku = /* @__PURE__ */ new Date(), X2 = /* @__PURE__ */ Qa.getTime() + (/* @__PURE__ */ Ku.getTimezoneOffset() - /* @__PURE__ */ Qa.getTimezoneOffset()) * 6e4, Gh = /* @__PURE__ */ Ku.getTimezoneOffset();
function qu(e) {
  var t = /* @__PURE__ */ new Date();
  return t.setTime(e * 24 * 60 * 60 * 1e3 + X2), t.getTimezoneOffset() !== Gh && t.setTime(t.getTime() + (t.getTimezoneOffset() - Gh) * 6e4), t;
}
var Xh = /* @__PURE__ */ new Date("2017-02-19T19:06:09.000Z"), Zu = /* @__PURE__ */ isNaN(/* @__PURE__ */ Xh.getFullYear()) ? /* @__PURE__ */ new Date("2/19/17") : Xh, K2 = /* @__PURE__ */ Zu.getFullYear() == 2017;
function Wt(e, t) {
  var r = new Date(e);
  if (K2)
    return t > 0 ? r.setTime(r.getTime() + r.getTimezoneOffset() * 60 * 1e3) : t < 0 && r.setTime(r.getTime() - r.getTimezoneOffset() * 60 * 1e3), r;
  if (e instanceof Date)
    return e;
  if (Zu.getFullYear() == 1917 && !isNaN(r.getFullYear())) {
    var n = r.getFullYear();
    return e.indexOf("" + n) > -1 || r.setFullYear(r.getFullYear() + 100), r;
  }
  var i = e.match(/\d+/g) || ["2017", "2", "19", "0", "0", "0"], s = new Date(+i[0], +i[1] - 1, +i[2], +i[3] || 0, +i[4] || 0, +i[5] || 0);
  return e.indexOf("Z") > -1 && (s = new Date(s.getTime() - s.getTimezoneOffset() * 60 * 1e3)), s;
}
function ko(e, t) {
  if (Fe && Buffer.isBuffer(e)) {
    if (t) {
      if (e[0] == 255 && e[1] == 254)
        return Zr(e.slice(2).toString("utf16le"));
      if (e[1] == 254 && e[2] == 255)
        return Zr(x2(e.slice(2).toString("binary")));
    }
    return e.toString("binary");
  }
  if (typeof TextDecoder < "u")
    try {
      if (t) {
        if (e[0] == 255 && e[1] == 254)
          return Zr(new TextDecoder("utf-16le").decode(e.slice(2)));
        if (e[0] == 254 && e[1] == 255)
          return Zr(new TextDecoder("utf-16be").decode(e.slice(2)));
      }
      var r = {
        "€": "",
        "‚": "",
        ƒ: "",
        "„": "",
        "…": "",
        "†": "",
        "‡": "",
        "ˆ": "",
        "‰": "",
        Š: "",
        "‹": "",
        Œ: "",
        Ž: "",
        "‘": "",
        "’": "",
        "“": "",
        "”": "",
        "•": "",
        "–": "",
        "—": "",
        "˜": "",
        "™": "",
        š: "",
        "›": "",
        œ: "",
        ž: "",
        Ÿ: ""
      };
      return Array.isArray(e) && (e = new Uint8Array(e)), new TextDecoder("latin1").decode(e).replace(/[€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]/g, function(s) {
        return r[s] || s;
      });
    } catch {
    }
  for (var n = [], i = 0; i != e.length; ++i)
    n.push(String.fromCharCode(e[i]));
  return n.join("");
}
function Gt(e) {
  if (typeof JSON < "u" && !Array.isArray(e))
    return JSON.parse(JSON.stringify(e));
  if (typeof e != "object" || e == null)
    return e;
  if (e instanceof Date)
    return new Date(e.getTime());
  var t = {};
  for (var r in e)
    Object.prototype.hasOwnProperty.call(e, r) && (t[r] = Gt(e[r]));
  return t;
}
function rt(e, t) {
  for (var r = ""; r.length < t; )
    r += e;
  return r;
}
function tn(e) {
  var t = Number(e);
  if (!isNaN(t))
    return isFinite(t) ? t : NaN;
  if (!/\d/.test(e))
    return t;
  var r = 1, n = e.replace(/([\d]),([\d])/g, "$1$2").replace(/[$]/g, "").replace(/[%]/g, function() {
    return r *= 100, "";
  });
  return !isNaN(t = Number(n)) || (n = n.replace(/[(](.*)[)]/, function(i, s) {
    return r = -r, s;
  }), !isNaN(t = Number(n))) ? t / r : t;
}
var q2 = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
function Ms(e) {
  var t = new Date(e), r = /* @__PURE__ */ new Date(NaN), n = t.getYear(), i = t.getMonth(), s = t.getDate();
  if (isNaN(s))
    return r;
  var a = e.toLowerCase();
  if (a.match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/)) {
    if (a = a.replace(/[^a-z]/g, "").replace(/([^a-z]|^)[ap]m?([^a-z]|$)/, ""), a.length > 3 && q2.indexOf(a) == -1)
      return r;
  } else if (a.match(/[a-z]/))
    return r;
  return n < 0 || n > 8099 ? r : (i > 0 || s > 1) && n != 101 ? t : e.match(/[^-0-9:,\/\\]/) ? r : t;
}
function ve(e, t, r) {
  if (e.FullPaths) {
    if (typeof r == "string") {
      var n;
      return Fe ? n = cn(r) : n = v2(r), Be.utils.cfb_add(e, t, n);
    }
    Be.utils.cfb_add(e, t, r);
  } else
    e.file(t, r);
}
function pc() {
  return Be.utils.cfb_new();
}
var ut = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r
`, Z2 = {
  "&quot;": '"',
  "&apos;": "'",
  "&gt;": ">",
  "&lt;": "<",
  "&amp;": "&"
}, mc = /* @__PURE__ */ gc(Z2), xc = /[&<>'"]/g, J2 = /[\u0000-\u0008\u000b-\u001f]/g;
function Ie(e) {
  var t = e + "";
  return t.replace(xc, function(r) {
    return mc[r];
  }).replace(J2, function(r) {
    return "_x" + ("000" + r.charCodeAt(0).toString(16)).slice(-4) + "_";
  });
}
function Kh(e) {
  return Ie(e).replace(/ /g, "_x0020_");
}
var Ju = /[\u0000-\u001f]/g;
function Q2(e) {
  var t = e + "";
  return t.replace(xc, function(r) {
    return mc[r];
  }).replace(/\n/g, "<br/>").replace(Ju, function(r) {
    return "&#x" + ("000" + r.charCodeAt(0).toString(16)).slice(-4) + ";";
  });
}
function ey(e) {
  var t = e + "";
  return t.replace(xc, function(r) {
    return mc[r];
  }).replace(Ju, function(r) {
    return "&#x" + r.charCodeAt(0).toString(16).toUpperCase() + ";";
  });
}
function ty(e) {
  return e.replace(/(\r\n|[\r\n])/g, "&#10;");
}
function ry(e) {
  switch (e) {
    case 1:
    case !0:
    case "1":
    case "true":
    case "TRUE":
      return !0;
    default:
      return !1;
  }
}
function ll(e) {
  for (var t = "", r = 0, n = 0, i = 0, s = 0, a = 0, o = 0; r < e.length; ) {
    if (n = e.charCodeAt(r++), n < 128) {
      t += String.fromCharCode(n);
      continue;
    }
    if (i = e.charCodeAt(r++), n > 191 && n < 224) {
      a = (n & 31) << 6, a |= i & 63, t += String.fromCharCode(a);
      continue;
    }
    if (s = e.charCodeAt(r++), n < 240) {
      t += String.fromCharCode((n & 15) << 12 | (i & 63) << 6 | s & 63);
      continue;
    }
    a = e.charCodeAt(r++), o = ((n & 7) << 18 | (i & 63) << 12 | (s & 63) << 6 | a & 63) - 65536, t += String.fromCharCode(55296 + (o >>> 10 & 1023)), t += String.fromCharCode(56320 + (o & 1023));
  }
  return t;
}
function qh(e) {
  var t = Zn(2 * e.length), r, n, i = 1, s = 0, a = 0, o;
  for (n = 0; n < e.length; n += i)
    i = 1, (o = e.charCodeAt(n)) < 128 ? r = o : o < 224 ? (r = (o & 31) * 64 + (e.charCodeAt(n + 1) & 63), i = 2) : o < 240 ? (r = (o & 15) * 4096 + (e.charCodeAt(n + 1) & 63) * 64 + (e.charCodeAt(n + 2) & 63), i = 3) : (i = 4, r = (o & 7) * 262144 + (e.charCodeAt(n + 1) & 63) * 4096 + (e.charCodeAt(n + 2) & 63) * 64 + (e.charCodeAt(n + 3) & 63), r -= 65536, a = 55296 + (r >>> 10 & 1023), r = 56320 + (r & 1023)), a !== 0 && (t[s++] = a & 255, t[s++] = a >>> 8, a = 0), t[s++] = r % 256, t[s++] = r >>> 8;
  return t.slice(0, s).toString("ucs2");
}
function Zh(e) {
  return cn(e, "binary").toString("utf8");
}
var Sa = "foo bar bazâð£", ms = Fe && (/* @__PURE__ */ Zh(Sa) == /* @__PURE__ */ ll(Sa) && Zh || /* @__PURE__ */ qh(Sa) == /* @__PURE__ */ ll(Sa) && qh) || ll, Zr = Fe ? function(e) {
  return cn(e, "utf8").toString("binary");
} : function(e) {
  for (var t = [], r = 0, n = 0, i = 0; r < e.length; )
    switch (n = e.charCodeAt(r++), !0) {
      case n < 128:
        t.push(String.fromCharCode(n));
        break;
      case n < 2048:
        t.push(String.fromCharCode(192 + (n >> 6))), t.push(String.fromCharCode(128 + (n & 63)));
        break;
      case (n >= 55296 && n < 57344):
        n -= 55296, i = e.charCodeAt(r++) - 56320 + (n << 10), t.push(String.fromCharCode(240 + (i >> 18 & 7))), t.push(String.fromCharCode(144 + (i >> 12 & 63))), t.push(String.fromCharCode(128 + (i >> 6 & 63))), t.push(String.fromCharCode(128 + (i & 63)));
        break;
      default:
        t.push(String.fromCharCode(224 + (n >> 12))), t.push(String.fromCharCode(128 + (n >> 6 & 63))), t.push(String.fromCharCode(128 + (n & 63)));
    }
  return t.join("");
}, ny = /* @__PURE__ */ function() {
  var e = [
    ["nbsp", " "],
    ["middot", "·"],
    ["quot", '"'],
    ["apos", "'"],
    ["gt", ">"],
    ["lt", "<"],
    ["amp", "&"]
  ].map(function(t) {
    return [new RegExp("&" + t[0] + ";", "ig"), t[1]];
  });
  return function(r) {
    for (var n = r.replace(/^[\t\n\r ]+/, "").replace(/[\t\n\r ]+$/, "").replace(/>\s+/g, ">").replace(/\s+</g, "<").replace(/[\t\n\r ]+/g, " ").replace(/<\s*[bB][rR]\s*\/?>/g, `
`).replace(/<[^>]*>/g, ""), i = 0; i < e.length; ++i)
      n = n.replace(e[i][0], e[i][1]);
    return n;
  };
}(), Qu = /(^\s|\s$|\n)/;
function St(e, t) {
  return "<" + e + (t.match(Qu) ? ' xml:space="preserve"' : "") + ">" + t + "</" + e + ">";
}
function Ps(e) {
  return At(e).map(function(t) {
    return " " + t + '="' + e[t] + '"';
  }).join("");
}
function re(e, t, r) {
  return "<" + e + (r != null ? Ps(r) : "") + (t != null ? (t.match(Qu) ? ' xml:space="preserve"' : "") + ">" + t + "</" + e : "/") + ">";
}
function Bl(e, t) {
  try {
    return e.toISOString().replace(/\.\d*/, "");
  } catch (r) {
    if (t)
      throw r;
  }
  return "";
}
function iy(e, t) {
  switch (typeof e) {
    case "string":
      var r = re("vt:lpwstr", Ie(e));
      return t && (r = r.replace(/&quot;/g, "_x0022_")), r;
    case "number":
      return re((e | 0) == e ? "vt:i4" : "vt:r8", Ie(String(e)));
    case "boolean":
      return re("vt:bool", e ? "true" : "false");
  }
  if (e instanceof Date)
    return re("vt:filetime", Bl(e));
  throw new Error("Unable to serialize " + e);
}
var mt = {
  CORE_PROPS: "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
  CUST_PROPS: "http://schemas.openxmlformats.org/officeDocument/2006/custom-properties",
  EXT_PROPS: "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties",
  CT: "http://schemas.openxmlformats.org/package/2006/content-types",
  RELS: "http://schemas.openxmlformats.org/package/2006/relationships",
  TCMNT: "http://schemas.microsoft.com/office/spreadsheetml/2018/threadedcomments",
  dc: "http://purl.org/dc/elements/1.1/",
  dcterms: "http://purl.org/dc/terms/",
  dcmitype: "http://purl.org/dc/dcmitype/",
  mx: "http://schemas.microsoft.com/office/mac/excel/2008/main",
  r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
  sjs: "http://schemas.openxmlformats.org/package/2006/sheetjs/core-properties",
  vt: "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes",
  xsi: "http://www.w3.org/2001/XMLSchema-instance",
  xsd: "http://www.w3.org/2001/XMLSchema"
}, Ni = [
  "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
  "http://purl.oclc.org/ooxml/spreadsheetml/main",
  "http://schemas.microsoft.com/office/excel/2006/main",
  "http://schemas.microsoft.com/office/excel/2006/2"
], Jt = {
  o: "urn:schemas-microsoft-com:office:office",
  x: "urn:schemas-microsoft-com:office:excel",
  ss: "urn:schemas-microsoft-com:office:spreadsheet",
  dt: "uuid:C2F41010-65B3-11d1-A29F-00AA00C14882",
  mv: "http://macVmlSchemaUri",
  v: "urn:schemas-microsoft-com:vml",
  html: "http://www.w3.org/TR/REC-html40"
};
function sy(e, t) {
  for (var r = 1 - 2 * (e[t + 7] >>> 7), n = ((e[t + 7] & 127) << 4) + (e[t + 6] >>> 4 & 15), i = e[t + 6] & 15, s = 5; s >= 0; --s)
    i = i * 256 + e[t + s];
  return n == 2047 ? i == 0 ? r * (1 / 0) : NaN : (n == 0 ? n = -1022 : (n -= 1023, i += Math.pow(2, 52)), r * Math.pow(2, n - 52) * i);
}
function ay(e, t, r) {
  var n = (t < 0 || 1 / t == -1 / 0 ? 1 : 0) << 7, i = 0, s = 0, a = n ? -t : t;
  isFinite(a) ? a == 0 ? i = s = 0 : (i = Math.floor(Math.log(a) / Math.LN2), s = a * Math.pow(2, 52 - i), i <= -1023 && (!isFinite(s) || s < Math.pow(2, 52)) ? i = -1022 : (s -= Math.pow(2, 52), i += 1023)) : (i = 2047, s = isNaN(t) ? 26985 : 0);
  for (var o = 0; o <= 5; ++o, s /= 256)
    e[r + o] = s & 255;
  e[r + 6] = (i & 15) << 4 | s & 15, e[r + 7] = i >> 4 | n;
}
var Jh = function(e) {
  for (var t = [], r = 10240, n = 0; n < e[0].length; ++n)
    if (e[0][n])
      for (var i = 0, s = e[0][n].length; i < s; i += r)
        t.push.apply(t, e[0][n].slice(i, i + r));
  return t;
}, Qh = Fe ? function(e) {
  return e[0].length > 0 && Buffer.isBuffer(e[0][0]) ? Buffer.concat(e[0].map(function(t) {
    return Buffer.isBuffer(t) ? t : cn(t);
  })) : Jh(e);
} : Jh, e0 = function(e, t, r) {
  for (var n = [], i = t; i < r; i += 2)
    n.push(String.fromCharCode(ss(e, i)));
  return n.join("").replace(ps, "");
}, _c = Fe ? function(e, t, r) {
  return Buffer.isBuffer(e) ? e.toString("utf16le", t, r).replace(ps, "") : e0(e, t, r);
} : e0, t0 = function(e, t, r) {
  for (var n = [], i = t; i < t + r; ++i)
    n.push(("0" + e[i].toString(16)).slice(-2));
  return n.join("");
}, ed = Fe ? function(e, t, r) {
  return Buffer.isBuffer(e) ? e.toString("hex", t, t + r) : t0(e, t, r);
} : t0, r0 = function(e, t, r) {
  for (var n = [], i = t; i < r; i++)
    n.push(String.fromCharCode(_i(e, i)));
  return n.join("");
}, $s = Fe ? function(t, r, n) {
  return Buffer.isBuffer(t) ? t.toString("utf8", r, n) : r0(t, r, n);
} : r0, td = function(e, t) {
  var r = Qt(e, t);
  return r > 0 ? $s(e, t + 4, t + 4 + r - 1) : "";
}, rd = td, nd = function(e, t) {
  var r = Qt(e, t);
  return r > 0 ? $s(e, t + 4, t + 4 + r - 1) : "";
}, id = nd, sd = function(e, t) {
  var r = 2 * Qt(e, t);
  return r > 0 ? $s(e, t + 4, t + 4 + r - 1) : "";
}, ad = sd, od = function(t, r) {
  var n = Qt(t, r);
  return n > 0 ? _c(t, r + 4, r + 4 + n) : "";
}, ld = od, cd = function(e, t) {
  var r = Qt(e, t);
  return r > 0 ? $s(e, t + 4, t + 4 + r) : "";
}, fd = cd, hd = function(e, t) {
  return sy(e, t);
}, eo = hd, vc = function(t) {
  return Array.isArray(t) || typeof Uint8Array < "u" && t instanceof Uint8Array;
};
Fe && (rd = function(t, r) {
  if (!Buffer.isBuffer(t))
    return td(t, r);
  var n = t.readUInt32LE(r);
  return n > 0 ? t.toString("utf8", r + 4, r + 4 + n - 1) : "";
}, id = function(t, r) {
  if (!Buffer.isBuffer(t))
    return nd(t, r);
  var n = t.readUInt32LE(r);
  return n > 0 ? t.toString("utf8", r + 4, r + 4 + n - 1) : "";
}, ad = function(t, r) {
  if (!Buffer.isBuffer(t))
    return sd(t, r);
  var n = 2 * t.readUInt32LE(r);
  return t.toString("utf16le", r + 4, r + 4 + n - 1);
}, ld = function(t, r) {
  if (!Buffer.isBuffer(t))
    return od(t, r);
  var n = t.readUInt32LE(r);
  return t.toString("utf16le", r + 4, r + 4 + n);
}, fd = function(t, r) {
  if (!Buffer.isBuffer(t))
    return cd(t, r);
  var n = t.readUInt32LE(r);
  return t.toString("utf8", r + 4, r + 4 + n);
}, eo = function(t, r) {
  return Buffer.isBuffer(t) ? t.readDoubleLE(r) : hd(t, r);
}, vc = function(t) {
  return Buffer.isBuffer(t) || Array.isArray(t) || typeof Uint8Array < "u" && t instanceof Uint8Array;
});
var _i = function(e, t) {
  return e[t];
}, ss = function(e, t) {
  return e[t + 1] * 256 + e[t];
}, oy = function(e, t) {
  var r = e[t + 1] * 256 + e[t];
  return r < 32768 ? r : (65535 - r + 1) * -1;
}, Qt = function(e, t) {
  return e[t + 3] * (1 << 24) + (e[t + 2] << 16) + (e[t + 1] << 8) + e[t];
}, zn = function(e, t) {
  return e[t + 3] << 24 | e[t + 2] << 16 | e[t + 1] << 8 | e[t];
}, ly = function(e, t) {
  return e[t] << 24 | e[t + 1] << 16 | e[t + 2] << 8 | e[t + 3];
};
function xs(e, t) {
  var r = "", n, i, s = [], a, o, l, c;
  switch (t) {
    case "dbcs":
      if (c = this.l, Fe && Buffer.isBuffer(this))
        r = this.slice(this.l, this.l + 2 * e).toString("utf16le");
      else
        for (l = 0; l < e; ++l)
          r += String.fromCharCode(ss(this, c)), c += 2;
      e *= 2;
      break;
    case "utf8":
      r = $s(this, this.l, this.l + e);
      break;
    case "utf16le":
      e *= 2, r = _c(this, this.l, this.l + e);
      break;
    case "wstr":
      return xs.call(this, e, "dbcs");
    case "lpstr-ansi":
      r = rd(this, this.l), e = 4 + Qt(this, this.l);
      break;
    case "lpstr-cp":
      r = id(this, this.l), e = 4 + Qt(this, this.l);
      break;
    case "lpwstr":
      r = ad(this, this.l), e = 4 + 2 * Qt(this, this.l);
      break;
    case "lpp4":
      e = 4 + Qt(this, this.l), r = ld(this, this.l), e & 2 && (e += 2);
      break;
    case "8lpp4":
      e = 4 + Qt(this, this.l), r = fd(this, this.l), e & 3 && (e += 4 - (e & 3));
      break;
    case "cstr":
      for (e = 0, r = ""; (a = _i(this, this.l + e++)) !== 0; )
        s.push(ya(a));
      r = s.join("");
      break;
    case "_wstr":
      for (e = 0, r = ""; (a = ss(this, this.l + e)) !== 0; )
        s.push(ya(a)), e += 2;
      e += 2, r = s.join("");
      break;
    case "dbcs-cont":
      for (r = "", c = this.l, l = 0; l < e; ++l) {
        if (this.lens && this.lens.indexOf(c) !== -1)
          return a = _i(this, c), this.l = c + 1, o = xs.call(this, e - l, a ? "dbcs-cont" : "sbcs-cont"), s.join("") + o;
        s.push(ya(ss(this, c))), c += 2;
      }
      r = s.join(""), e *= 2;
      break;
    case "cpstr":
    case "sbcs-cont":
      for (r = "", c = this.l, l = 0; l != e; ++l) {
        if (this.lens && this.lens.indexOf(c) !== -1)
          return a = _i(this, c), this.l = c + 1, o = xs.call(this, e - l, a ? "dbcs-cont" : "sbcs-cont"), s.join("") + o;
        s.push(ya(_i(this, c))), c += 1;
      }
      r = s.join("");
      break;
    default:
      switch (e) {
        case 1:
          return n = _i(this, this.l), this.l++, n;
        case 2:
          return n = (t === "i" ? oy : ss)(this, this.l), this.l += 2, n;
        case 4:
        case -4:
          return t === "i" || !(this[this.l + 3] & 128) ? (n = (e > 0 ? zn : ly)(this, this.l), this.l += 4, n) : (i = Qt(this, this.l), this.l += 4, i);
        case 8:
        case -8:
          if (t === "f")
            return e == 8 ? i = eo(this, this.l) : i = eo([this[this.l + 7], this[this.l + 6], this[this.l + 5], this[this.l + 4], this[this.l + 3], this[this.l + 2], this[this.l + 1], this[this.l + 0]], 0), this.l += 8, i;
          e = 8;
        case 16:
          r = ed(this, this.l, e);
          break;
      }
  }
  return this.l += e, r;
}
var cy = function(e, t, r) {
  e[r] = t & 255, e[r + 1] = t >>> 8 & 255, e[r + 2] = t >>> 16 & 255, e[r + 3] = t >>> 24 & 255;
}, fy = function(e, t, r) {
  e[r] = t & 255, e[r + 1] = t >> 8 & 255, e[r + 2] = t >> 16 & 255, e[r + 3] = t >> 24 & 255;
}, hy = function(e, t, r) {
  e[r] = t & 255, e[r + 1] = t >>> 8 & 255;
};
function uy(e, t, r) {
  var n = 0, i = 0;
  if (r === "dbcs") {
    for (i = 0; i != t.length; ++i)
      hy(this, t.charCodeAt(i), this.l + 2 * i);
    n = 2 * t.length;
  } else if (r === "sbcs") {
    for (t = t.replace(/[^\x00-\x7F]/g, "_"), i = 0; i != t.length; ++i)
      this[this.l + i] = t.charCodeAt(i) & 255;
    n = t.length;
  } else if (r === "hex") {
    for (; i < e; ++i)
      this[this.l++] = parseInt(t.slice(2 * i, 2 * i + 2), 16) || 0;
    return this;
  } else if (r === "utf16le") {
    var s = Math.min(this.l + e, this.length);
    for (i = 0; i < Math.min(t.length, e); ++i) {
      var a = t.charCodeAt(i);
      this[this.l++] = a & 255, this[this.l++] = a >> 8;
    }
    for (; this.l < s; )
      this[this.l++] = 0;
    return this;
  } else
    switch (e) {
      case 1:
        n = 1, this[this.l] = t & 255;
        break;
      case 2:
        n = 2, this[this.l] = t & 255, t >>>= 8, this[this.l + 1] = t & 255;
        break;
      case 3:
        n = 3, this[this.l] = t & 255, t >>>= 8, this[this.l + 1] = t & 255, t >>>= 8, this[this.l + 2] = t & 255;
        break;
      case 4:
        n = 4, cy(this, t, this.l);
        break;
      case 8:
        if (n = 8, r === "f") {
          ay(this, t, this.l);
          break;
        }
      case 16:
        break;
      case -4:
        n = 4, fy(this, t, this.l);
        break;
    }
  return this.l += n, this;
}
function ud(e, t) {
  var r = ed(this, this.l, e.length >> 1);
  if (r !== e)
    throw new Error(t + "Expected " + e + " saw " + r);
  this.l += e.length >> 1;
}
function Zt(e, t) {
  e.l = t, e.read_shift = /*::(*/
  xs, e.chk = ud, e.write_shift = uy;
}
function Pr(e, t) {
  e.l += t;
}
function G(e) {
  var t = Zn(e);
  return Zt(t, 0), t;
}
function jt() {
  var e = [], t = Fe ? 256 : 2048, r = function(c) {
    var f = G(c);
    return Zt(f, 0), f;
  }, n = r(t), i = function() {
    n && (n.length > n.l && (n = n.slice(0, n.l), n.l = n.length), n.length > 0 && e.push(n), n = null);
  }, s = function(c) {
    return n && c < n.length - n.l ? n : (i(), n = r(Math.max(c + 1, t)));
  }, a = function() {
    return i(), Tt(e);
  }, o = function(c) {
    i(), n = c, n.l == null && (n.l = n.length), s(t);
  };
  return { next: s, push: o, end: a, _bufs: e };
}
function q(e, t, r, n) {
  var i = +t, s;
  if (!isNaN(i)) {
    n || (n = sA[i].p || (r || []).length || 0), s = 1 + (i >= 128 ? 1 : 0) + 1, n >= 128 && ++s, n >= 16384 && ++s, n >= 2097152 && ++s;
    var a = e.next(s);
    i <= 127 ? a.write_shift(1, i) : (a.write_shift(1, (i & 127) + 128), a.write_shift(1, i >> 7));
    for (var o = 0; o != 4; ++o)
      if (n >= 128)
        a.write_shift(1, (n & 127) + 128), n >>= 7;
      else {
        a.write_shift(1, n);
        break;
      }
    /*:: length != null &&*/
    n > 0 && vc(r) && e.push(r);
  }
}
function _s(e, t, r) {
  var n = Gt(e);
  if (t.s ? (n.cRel && (n.c += t.s.c), n.rRel && (n.r += t.s.r)) : (n.cRel && (n.c += t.c), n.rRel && (n.r += t.r)), !r || r.biff < 12) {
    for (; n.c >= 256; )
      n.c -= 256;
    for (; n.r >= 65536; )
      n.r -= 65536;
  }
  return n;
}
function n0(e, t, r) {
  var n = Gt(e);
  return n.s = _s(n.s, t.s, r), n.e = _s(n.e, t.s, r), n;
}
function vs(e, t) {
  if (e.cRel && e.c < 0)
    for (e = Gt(e); e.c < 0; )
      e.c += t > 8 ? 16384 : 256;
  if (e.rRel && e.r < 0)
    for (e = Gt(e); e.r < 0; )
      e.r += t > 8 ? 1048576 : t > 5 ? 65536 : 16384;
  var r = Le(e);
  return !e.cRel && e.cRel != null && (r = py(r)), !e.rRel && e.rRel != null && (r = dy(r)), r;
}
function cl(e, t) {
  return e.s.r == 0 && !e.s.rRel && e.e.r == (t.biff >= 12 ? 1048575 : t.biff >= 8 ? 65536 : 16384) && !e.e.rRel ? (e.s.cRel ? "" : "$") + Ct(e.s.c) + ":" + (e.e.cRel ? "" : "$") + Ct(e.e.c) : e.s.c == 0 && !e.s.cRel && e.e.c == (t.biff >= 12 ? 16383 : 255) && !e.e.cRel ? (e.s.rRel ? "" : "$") + bt(e.s.r) + ":" + (e.e.rRel ? "" : "$") + bt(e.e.r) : vs(e.s, t.biff) + ":" + vs(e.e, t.biff);
}
function yc(e) {
  return parseInt(gy(e), 10) - 1;
}
function bt(e) {
  return "" + (e + 1);
}
function dy(e) {
  return e.replace(/([A-Z]|^)(\d+)$/, "$1$$$2");
}
function gy(e) {
  return e.replace(/\$(\d+)$/, "$1");
}
function wc(e) {
  for (var t = my(e), r = 0, n = 0; n !== t.length; ++n)
    r = 26 * r + t.charCodeAt(n) - 64;
  return r - 1;
}
function Ct(e) {
  if (e < 0)
    throw new Error("invalid column " + e);
  var t = "";
  for (++e; e; e = Math.floor((e - 1) / 26))
    t = String.fromCharCode((e - 1) % 26 + 65) + t;
  return t;
}
function py(e) {
  return e.replace(/^([A-Z])/, "$$$1");
}
function my(e) {
  return e.replace(/^\$([A-Z])/, "$1");
}
function xy(e) {
  return e.replace(/(\$?[A-Z]*)(\$?\d*)/, "$1,$2").split(",");
}
function _t(e) {
  for (var t = 0, r = 0, n = 0; n < e.length; ++n) {
    var i = e.charCodeAt(n);
    i >= 48 && i <= 57 ? t = 10 * t + (i - 48) : i >= 65 && i <= 90 && (r = 26 * r + (i - 64));
  }
  return { c: r - 1, r: t - 1 };
}
function Le(e) {
  for (var t = e.c + 1, r = ""; t; t = (t - 1) / 26 | 0)
    r = String.fromCharCode((t - 1) % 26 + 65) + r;
  return r + (e.r + 1);
}
function tr(e) {
  var t = e.indexOf(":");
  return t == -1 ? { s: _t(e), e: _t(e) } : { s: _t(e.slice(0, t)), e: _t(e.slice(t + 1)) };
}
function ht(e, t) {
  return typeof t > "u" || typeof t == "number" ? ht(e.s, e.e) : (typeof e != "string" && (e = Le(e)), typeof t != "string" && (t = Le(t)), e == t ? e : e + ":" + t);
}
function je(e) {
  var t = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } }, r = 0, n = 0, i = 0, s = e.length;
  for (r = 0; n < s && !((i = e.charCodeAt(n) - 64) < 1 || i > 26); ++n)
    r = 26 * r + i;
  for (t.s.c = --r, r = 0; n < s && !((i = e.charCodeAt(n) - 48) < 0 || i > 9); ++n)
    r = 10 * r + i;
  if (t.s.r = --r, n === s || i != 10)
    return t.e.c = t.s.c, t.e.r = t.s.r, t;
  for (++n, r = 0; n != s && !((i = e.charCodeAt(n) - 64) < 1 || i > 26); ++n)
    r = 26 * r + i;
  for (t.e.c = --r, r = 0; n != s && !((i = e.charCodeAt(n) - 48) < 0 || i > 9); ++n)
    r = 10 * r + i;
  return t.e.r = --r, t;
}
function i0(e, t) {
  var r = e.t == "d" && t instanceof Date;
  if (e.z != null)
    try {
      return e.w = En(e.z, r ? $t(t) : t);
    } catch {
    }
  try {
    return e.w = En((e.XF || {}).numFmtId || (r ? 14 : 0), r ? $t(t) : t);
  } catch {
    return "" + t;
  }
}
function an(e, t, r) {
  return e == null || e.t == null || e.t == "z" ? "" : e.w !== void 0 ? e.w : (e.t == "d" && !e.z && r && r.dateNF && (e.z = r.dateNF), e.t == "e" ? Gs[e.v] || e.v : t == null ? i0(e, e.v) : i0(e, t));
}
function ii(e, t) {
  var r = t && t.sheet ? t.sheet : "Sheet1", n = {};
  return n[r] = e, { SheetNames: [r], Sheets: n };
}
function dd(e, t, r) {
  var n = r || {}, i = e ? Array.isArray(e) : n.dense, s = e || (i ? [] : {}), a = 0, o = 0;
  if (s && n.origin != null) {
    if (typeof n.origin == "number")
      a = n.origin;
    else {
      var l = typeof n.origin == "string" ? _t(n.origin) : n.origin;
      a = l.r, o = l.c;
    }
    s["!ref"] || (s["!ref"] = "A1:A1");
  }
  var c = { s: { c: 1e7, r: 1e7 }, e: { c: 0, r: 0 } };
  if (s["!ref"]) {
    var f = je(s["!ref"]);
    c.s.c = f.s.c, c.s.r = f.s.r, c.e.c = Math.max(c.e.c, f.e.c), c.e.r = Math.max(c.e.r, f.e.r), a == -1 && (c.e.r = a = f.e.r + 1);
  }
  for (var h = 0; h != t.length; ++h)
    if (t[h]) {
      if (!Array.isArray(t[h]))
        throw new Error("aoa_to_sheet expects an array of arrays");
      for (var u = 0; u != t[h].length; ++u)
        if (!(typeof t[h][u] > "u")) {
          var d = { v: t[h][u] }, p = a + h, g = o + u;
          if (c.s.r > p && (c.s.r = p), c.s.c > g && (c.s.c = g), c.e.r < p && (c.e.r = p), c.e.c < g && (c.e.c = g), t[h][u] && typeof t[h][u] == "object" && !Array.isArray(t[h][u]) && !(t[h][u] instanceof Date))
            d = t[h][u];
          else if (Array.isArray(d.v) && (d.f = t[h][u][1], d.v = d.v[0]), d.v === null)
            if (d.f)
              d.t = "n";
            else if (n.nullError)
              d.t = "e", d.v = 0;
            else if (n.sheetStubs)
              d.t = "z";
            else
              continue;
          else
            typeof d.v == "number" ? d.t = "n" : typeof d.v == "boolean" ? d.t = "b" : d.v instanceof Date ? (d.z = n.dateNF || it[14], n.cellDates ? (d.t = "d", d.w = En(d.z, $t(d.v))) : (d.t = "n", d.v = $t(d.v), d.w = En(d.z, d.v))) : d.t = "s";
          if (i)
            s[p] || (s[p] = []), s[p][g] && s[p][g].z && (d.z = s[p][g].z), s[p][g] = d;
          else {
            var m = Le({ c: g, r: p });
            s[m] && s[m].z && (d.z = s[m].z), s[m] = d;
          }
        }
    }
  return c.s.c < 1e7 && (s["!ref"] = ht(c)), s;
}
function Bi(e, t) {
  return dd(null, e, t);
}
function _y(e) {
  return e.read_shift(4, "i");
}
function vr(e, t) {
  return t || (t = G(4)), t.write_shift(4, e), t;
}
function Mt(e) {
  var t = e.read_shift(4);
  return t === 0 ? "" : e.read_shift(t, "dbcs");
}
function vt(e, t) {
  var r = !1;
  return t == null && (r = !0, t = G(4 + 2 * e.length)), t.write_shift(4, e.length), e.length > 0 && t.write_shift(0, e, "dbcs"), r ? t.slice(0, t.l) : t;
}
function vy(e) {
  return { ich: e.read_shift(2), ifnt: e.read_shift(2) };
}
function yy(e, t) {
  return t || (t = G(4)), t.write_shift(2, e.ich || 0), t.write_shift(2, e.ifnt || 0), t;
}
function Tc(e, t) {
  var r = e.l, n = e.read_shift(1), i = Mt(e), s = [], a = { t: i, h: i };
  if (n & 1) {
    for (var o = e.read_shift(4), l = 0; l != o; ++l)
      s.push(vy(e));
    a.r = s;
  } else
    a.r = [{ ich: 0, ifnt: 0 }];
  return e.l = r + t, a;
}
function wy(e, t) {
  var r = !1;
  return t == null && (r = !0, t = G(15 + 4 * e.t.length)), t.write_shift(1, 0), vt(e.t, t), r ? t.slice(0, t.l) : t;
}
var Ty = Tc;
function Sy(e, t) {
  var r = !1;
  return t == null && (r = !0, t = G(23 + 4 * e.t.length)), t.write_shift(1, 1), vt(e.t, t), t.write_shift(4, 1), yy({ ich: 0, ifnt: 0 }, t), r ? t.slice(0, t.l) : t;
}
function cr(e) {
  var t = e.read_shift(4), r = e.read_shift(2);
  return r += e.read_shift(1) << 16, e.l++, { c: t, iStyleRef: r };
}
function si(e, t) {
  return t == null && (t = G(8)), t.write_shift(-4, e.c), t.write_shift(3, e.iStyleRef || e.s), t.write_shift(1, 0), t;
}
function ai(e) {
  var t = e.read_shift(2);
  return t += e.read_shift(1) << 16, e.l++, { c: -1, iStyleRef: t };
}
function oi(e, t) {
  return t == null && (t = G(4)), t.write_shift(3, e.iStyleRef || e.s), t.write_shift(1, 0), t;
}
var by = Mt, gd = vt;
function Sc(e) {
  var t = e.read_shift(4);
  return t === 0 || t === 4294967295 ? "" : e.read_shift(t, "dbcs");
}
function to(e, t) {
  var r = !1;
  return t == null && (r = !0, t = G(127)), t.write_shift(4, e.length > 0 ? e.length : 4294967295), e.length > 0 && t.write_shift(0, e, "dbcs"), r ? t.slice(0, t.l) : t;
}
var Ey = Mt, Wl = Sc, bc = to;
function pd(e) {
  var t = e.slice(e.l, e.l + 4), r = t[0] & 1, n = t[0] & 2;
  e.l += 4;
  var i = n === 0 ? eo([0, 0, 0, 0, t[0] & 252, t[1], t[2], t[3]], 0) : zn(t, 0) >> 2;
  return r ? i / 100 : i;
}
function md(e, t) {
  t == null && (t = G(4));
  var r = 0, n = 0, i = e * 100;
  if (e == (e | 0) && e >= -(1 << 29) && e < 1 << 29 ? n = 1 : i == (i | 0) && i >= -(1 << 29) && i < 1 << 29 && (n = 1, r = 1), n)
    t.write_shift(-4, ((r ? i : e) << 2) + (r + 2));
  else
    throw new Error("unsupported RkNumber " + e);
}
function xd(e) {
  var t = { s: {}, e: {} };
  return t.s.r = e.read_shift(4), t.e.r = e.read_shift(4), t.s.c = e.read_shift(4), t.e.c = e.read_shift(4), t;
}
function Ay(e, t) {
  return t || (t = G(16)), t.write_shift(4, e.s.r), t.write_shift(4, e.e.r), t.write_shift(4, e.s.c), t.write_shift(4, e.e.c), t;
}
var li = xd, Wi = Ay;
function Ui(e) {
  if (e.length - e.l < 8)
    throw "XLS Xnum Buffer underflow";
  return e.read_shift(8, "f");
}
function Jn(e, t) {
  return (t || G(8)).write_shift(8, e, "f");
}
function ky(e) {
  var t = {}, r = e.read_shift(1), n = r >>> 1, i = e.read_shift(1), s = e.read_shift(2, "i"), a = e.read_shift(1), o = e.read_shift(1), l = e.read_shift(1);
  switch (e.l++, n) {
    case 0:
      t.auto = 1;
      break;
    case 1:
      t.index = i;
      var c = Ly[i];
      c && (t.rgb = p0(c));
      break;
    case 2:
      t.rgb = p0([a, o, l]);
      break;
    case 3:
      t.theme = i;
      break;
  }
  return s != 0 && (t.tint = s > 0 ? s / 32767 : s / 32768), t;
}
function ro(e, t) {
  if (t || (t = G(8)), !e || e.auto)
    return t.write_shift(4, 0), t.write_shift(4, 0), t;
  e.index != null ? (t.write_shift(1, 2), t.write_shift(1, e.index)) : e.theme != null ? (t.write_shift(1, 6), t.write_shift(1, e.theme)) : (t.write_shift(1, 5), t.write_shift(1, 0));
  var r = e.tint || 0;
  if (r > 0 ? r *= 32767 : r < 0 && (r *= 32768), t.write_shift(2, r), !e.rgb || e.theme != null)
    t.write_shift(2, 0), t.write_shift(1, 0), t.write_shift(1, 0);
  else {
    var n = e.rgb || "FFFFFF";
    typeof n == "number" && (n = ("000000" + n.toString(16)).slice(-6)), t.write_shift(1, parseInt(n.slice(0, 2), 16)), t.write_shift(1, parseInt(n.slice(2, 4), 16)), t.write_shift(1, parseInt(n.slice(4, 6), 16)), t.write_shift(1, 255);
  }
  return t;
}
function Oy(e) {
  var t = e.read_shift(1);
  e.l++;
  var r = {
    fBold: t & 1,
    fItalic: t & 2,
    fUnderline: t & 4,
    fStrikeout: t & 8,
    fOutline: t & 16,
    fShadow: t & 32,
    fCondense: t & 64,
    fExtend: t & 128
  };
  return r;
}
function Dy(e, t) {
  t || (t = G(2));
  var r = (e.italic ? 2 : 0) | (e.strike ? 8 : 0) | (e.outline ? 16 : 0) | (e.shadow ? 32 : 0) | (e.condense ? 64 : 0) | (e.extend ? 128 : 0);
  return t.write_shift(1, r), t.write_shift(1, 0), t;
}
var _d = 2, Kt = 3, ba = 11, no = 19, Ea = 64, Fy = 65, Cy = 71, My = 4108, Py = 4126, wt = 80, s0 = {
  /*::[*/
  1: { n: "CodePage", t: _d },
  /*::[*/
  2: { n: "Category", t: wt },
  /*::[*/
  3: { n: "PresentationFormat", t: wt },
  /*::[*/
  4: { n: "ByteCount", t: Kt },
  /*::[*/
  5: { n: "LineCount", t: Kt },
  /*::[*/
  6: { n: "ParagraphCount", t: Kt },
  /*::[*/
  7: { n: "SlideCount", t: Kt },
  /*::[*/
  8: { n: "NoteCount", t: Kt },
  /*::[*/
  9: { n: "HiddenCount", t: Kt },
  /*::[*/
  10: { n: "MultimediaClipCount", t: Kt },
  /*::[*/
  11: { n: "ScaleCrop", t: ba },
  /*::[*/
  12: {
    n: "HeadingPairs",
    t: My
    /* VT_VECTOR | VT_VARIANT */
  },
  /*::[*/
  13: {
    n: "TitlesOfParts",
    t: Py
    /* VT_VECTOR | VT_LPSTR */
  },
  /*::[*/
  14: { n: "Manager", t: wt },
  /*::[*/
  15: { n: "Company", t: wt },
  /*::[*/
  16: { n: "LinksUpToDate", t: ba },
  /*::[*/
  17: { n: "CharacterCount", t: Kt },
  /*::[*/
  19: { n: "SharedDoc", t: ba },
  /*::[*/
  22: { n: "HyperlinksChanged", t: ba },
  /*::[*/
  23: { n: "AppVersion", t: Kt, p: "version" },
  /*::[*/
  24: { n: "DigSig", t: Fy },
  /*::[*/
  26: { n: "ContentType", t: wt },
  /*::[*/
  27: { n: "ContentStatus", t: wt },
  /*::[*/
  28: { n: "Language", t: wt },
  /*::[*/
  29: { n: "Version", t: wt },
  /*::[*/
  255: {},
  /* [MS-OLEPS] 2.18 */
  /*::[*/
  2147483648: { n: "Locale", t: no },
  /*::[*/
  2147483651: { n: "Behavior", t: no },
  /*::[*/
  1919054434: {}
}, a0 = {
  /*::[*/
  1: { n: "CodePage", t: _d },
  /*::[*/
  2: { n: "Title", t: wt },
  /*::[*/
  3: { n: "Subject", t: wt },
  /*::[*/
  4: { n: "Author", t: wt },
  /*::[*/
  5: { n: "Keywords", t: wt },
  /*::[*/
  6: { n: "Comments", t: wt },
  /*::[*/
  7: { n: "Template", t: wt },
  /*::[*/
  8: { n: "LastAuthor", t: wt },
  /*::[*/
  9: { n: "RevNumber", t: wt },
  /*::[*/
  10: { n: "EditTime", t: Ea },
  /*::[*/
  11: { n: "LastPrinted", t: Ea },
  /*::[*/
  12: { n: "CreatedDate", t: Ea },
  /*::[*/
  13: { n: "ModifiedDate", t: Ea },
  /*::[*/
  14: { n: "PageCount", t: Kt },
  /*::[*/
  15: { n: "WordCount", t: Kt },
  /*::[*/
  16: { n: "CharCount", t: Kt },
  /*::[*/
  17: { n: "Thumbnail", t: Cy },
  /*::[*/
  18: { n: "Application", t: wt },
  /*::[*/
  19: { n: "DocSecurity", t: Kt },
  /*::[*/
  255: {},
  /* [MS-OLEPS] 2.18 */
  /*::[*/
  2147483648: { n: "Locale", t: no },
  /*::[*/
  2147483651: { n: "Behavior", t: no },
  /*::[*/
  1919054434: {}
};
function Ry(e) {
  return e.map(function(t) {
    return [t >> 16 & 255, t >> 8 & 255, t & 255];
  });
}
var Iy = /* @__PURE__ */ Ry([
  /* Color Constants */
  0,
  16777215,
  16711680,
  65280,
  255,
  16776960,
  16711935,
  65535,
  /* Overridable Defaults */
  0,
  16777215,
  16711680,
  65280,
  255,
  16776960,
  16711935,
  65535,
  8388608,
  32768,
  128,
  8421376,
  8388736,
  32896,
  12632256,
  8421504,
  10066431,
  10040166,
  16777164,
  13434879,
  6684774,
  16744576,
  26316,
  13421823,
  128,
  16711935,
  16776960,
  65535,
  8388736,
  8388608,
  32896,
  255,
  52479,
  13434879,
  13434828,
  16777113,
  10079487,
  16751052,
  13408767,
  16764057,
  3368703,
  3394764,
  10079232,
  16763904,
  16750848,
  16737792,
  6710937,
  9868950,
  13158,
  3381606,
  13056,
  3355392,
  10040064,
  10040166,
  3355545,
  3355443,
  /* Other entries to appease BIFF8/12 */
  16777215,
  /* 0x40 icvForeground ?? */
  0,
  /* 0x41 icvBackground ?? */
  0,
  /* 0x42 icvFrame ?? */
  0,
  /* 0x43 icv3D ?? */
  0,
  /* 0x44 icv3DText ?? */
  0,
  /* 0x45 icv3DHilite ?? */
  0,
  /* 0x46 icv3DShadow ?? */
  0,
  /* 0x47 icvHilite ?? */
  0,
  /* 0x48 icvCtlText ?? */
  0,
  /* 0x49 icvCtlScrl ?? */
  0,
  /* 0x4A icvCtlInv ?? */
  0,
  /* 0x4B icvCtlBody ?? */
  0,
  /* 0x4C icvCtlFrame ?? */
  0,
  /* 0x4D icvCtlFore ?? */
  0,
  /* 0x4E icvCtlBack ?? */
  0,
  /* 0x4F icvCtlNeutral */
  0,
  /* 0x50 icvInfoBk ?? */
  0
  /* 0x51 icvInfoText ?? */
]), Ly = /* @__PURE__ */ Gt(Iy), Gs = {
  /*::[*/
  0: "#NULL!",
  /*::[*/
  7: "#DIV/0!",
  /*::[*/
  15: "#VALUE!",
  /*::[*/
  23: "#REF!",
  /*::[*/
  29: "#NAME?",
  /*::[*/
  36: "#NUM!",
  /*::[*/
  42: "#N/A",
  /*::[*/
  43: "#GETTING_DATA",
  /*::[*/
  255: "#WTF?"
}, Ny = {
  /* Workbook */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": "workbooks",
  "application/vnd.ms-excel.sheet.macroEnabled.main+xml": "workbooks",
  "application/vnd.ms-excel.sheet.binary.macroEnabled.main": "workbooks",
  "application/vnd.ms-excel.addin.macroEnabled.main+xml": "workbooks",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": "workbooks",
  /* Worksheet */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": "sheets",
  "application/vnd.ms-excel.worksheet": "sheets",
  "application/vnd.ms-excel.binIndexWs": "TODO",
  /* Binary Index */
  /* Chartsheet */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": "charts",
  "application/vnd.ms-excel.chartsheet": "charts",
  /* Macrosheet */
  "application/vnd.ms-excel.macrosheet+xml": "macros",
  "application/vnd.ms-excel.macrosheet": "macros",
  "application/vnd.ms-excel.intlmacrosheet": "TODO",
  "application/vnd.ms-excel.binIndexMs": "TODO",
  /* Binary Index */
  /* Dialogsheet */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": "dialogs",
  "application/vnd.ms-excel.dialogsheet": "dialogs",
  /* Shared Strings */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml": "strs",
  "application/vnd.ms-excel.sharedStrings": "strs",
  /* Styles */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": "styles",
  "application/vnd.ms-excel.styles": "styles",
  /* File Properties */
  "application/vnd.openxmlformats-package.core-properties+xml": "coreprops",
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": "custprops",
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": "extprops",
  /* Custom Data Properties */
  "application/vnd.openxmlformats-officedocument.customXmlProperties+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.customProperty": "TODO",
  /* Comments */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": "comments",
  "application/vnd.ms-excel.comments": "comments",
  "application/vnd.ms-excel.threadedcomments+xml": "threadedcomments",
  "application/vnd.ms-excel.person+xml": "people",
  /* Metadata (Stock/Geography and Dynamic Array) */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetMetadata+xml": "metadata",
  "application/vnd.ms-excel.sheetMetadata": "metadata",
  /* PivotTable */
  "application/vnd.ms-excel.pivotTable": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotTable+xml": "TODO",
  /* Chart Objects */
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": "TODO",
  /* Chart Colors */
  "application/vnd.ms-office.chartcolorstyle+xml": "TODO",
  /* Chart Style */
  "application/vnd.ms-office.chartstyle+xml": "TODO",
  /* Chart Advanced */
  "application/vnd.ms-office.chartex+xml": "TODO",
  /* Calculation Chain */
  "application/vnd.ms-excel.calcChain": "calcchains",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcChain+xml": "calcchains",
  /* Printer Settings */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.printerSettings": "TODO",
  /* ActiveX */
  "application/vnd.ms-office.activeX": "TODO",
  "application/vnd.ms-office.activeX+xml": "TODO",
  /* Custom Toolbars */
  "application/vnd.ms-excel.attachedToolbars": "TODO",
  /* External Data Connections */
  "application/vnd.ms-excel.connections": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": "TODO",
  /* External Links */
  "application/vnd.ms-excel.externalLink": "links",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externalLink+xml": "links",
  /* PivotCache */
  "application/vnd.ms-excel.pivotCacheDefinition": "TODO",
  "application/vnd.ms-excel.pivotCacheRecords": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheDefinition+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheRecords+xml": "TODO",
  /* Query Table */
  "application/vnd.ms-excel.queryTable": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.queryTable+xml": "TODO",
  /* Shared Workbook */
  "application/vnd.ms-excel.userNames": "TODO",
  "application/vnd.ms-excel.revisionHeaders": "TODO",
  "application/vnd.ms-excel.revisionLog": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionHeaders+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionLog+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.userNames+xml": "TODO",
  /* Single Cell Table */
  "application/vnd.ms-excel.tableSingleCells": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tableSingleCells+xml": "TODO",
  /* Slicer */
  "application/vnd.ms-excel.slicer": "TODO",
  "application/vnd.ms-excel.slicerCache": "TODO",
  "application/vnd.ms-excel.slicer+xml": "TODO",
  "application/vnd.ms-excel.slicerCache+xml": "TODO",
  /* Sort Map */
  "application/vnd.ms-excel.wsSortMap": "TODO",
  /* Table */
  "application/vnd.ms-excel.table": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": "TODO",
  /* Themes */
  "application/vnd.openxmlformats-officedocument.theme+xml": "themes",
  /* Theme Override */
  "application/vnd.openxmlformats-officedocument.themeOverride+xml": "TODO",
  /* Timeline */
  "application/vnd.ms-excel.Timeline+xml": "TODO",
  /* verify */
  "application/vnd.ms-excel.TimelineCache+xml": "TODO",
  /* verify */
  /* VBA */
  "application/vnd.ms-office.vbaProject": "vba",
  "application/vnd.ms-office.vbaProjectSignature": "TODO",
  /* Volatile Dependencies */
  "application/vnd.ms-office.volatileDependencies": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatileDependencies+xml": "TODO",
  /* Control Properties */
  "application/vnd.ms-excel.controlproperties+xml": "TODO",
  /* Data Model */
  "application/vnd.openxmlformats-officedocument.model+data": "TODO",
  /* Survey */
  "application/vnd.ms-excel.Survey+xml": "TODO",
  /* Drawing */
  "application/vnd.openxmlformats-officedocument.drawing+xml": "drawings",
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.drawingml.diagramColors+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.drawingml.diagramData+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.drawingml.diagramLayout+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.drawingml.diagramStyle+xml": "TODO",
  /* VML */
  "application/vnd.openxmlformats-officedocument.vmlDrawing": "TODO",
  "application/vnd.openxmlformats-package.relationships+xml": "rels",
  "application/vnd.openxmlformats-officedocument.oleObject": "TODO",
  /* Image */
  "image/png": "TODO",
  sheet: "js"
}, Aa = {
  workbooks: {
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
    xlsm: "application/vnd.ms-excel.sheet.macroEnabled.main+xml",
    xlsb: "application/vnd.ms-excel.sheet.binary.macroEnabled.main",
    xlam: "application/vnd.ms-excel.addin.macroEnabled.main+xml",
    xltx: "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml"
  },
  strs: {
    /* Shared Strings */
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml",
    xlsb: "application/vnd.ms-excel.sharedStrings"
  },
  comments: {
    /* Comments */
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml",
    xlsb: "application/vnd.ms-excel.comments"
  },
  sheets: {
    /* Worksheet */
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
    xlsb: "application/vnd.ms-excel.worksheet"
  },
  charts: {
    /* Chartsheet */
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml",
    xlsb: "application/vnd.ms-excel.chartsheet"
  },
  dialogs: {
    /* Dialogsheet */
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml",
    xlsb: "application/vnd.ms-excel.dialogsheet"
  },
  macros: {
    /* Macrosheet (Excel 4.0 Macros) */
    xlsx: "application/vnd.ms-excel.macrosheet+xml",
    xlsb: "application/vnd.ms-excel.macrosheet"
  },
  metadata: {
    /* Metadata (Stock/Geography and Dynamic Array) */
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetMetadata+xml",
    xlsb: "application/vnd.ms-excel.sheetMetadata"
  },
  styles: {
    /* Styles */
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml",
    xlsb: "application/vnd.ms-excel.styles"
  }
};
function vd() {
  return {
    workbooks: [],
    sheets: [],
    charts: [],
    dialogs: [],
    macros: [],
    rels: [],
    strs: [],
    comments: [],
    threadedcomments: [],
    links: [],
    coreprops: [],
    extprops: [],
    custprops: [],
    themes: [],
    styles: [],
    calcchains: [],
    vba: [],
    drawings: [],
    metadata: [],
    people: [],
    TODO: [],
    xmlns: ""
  };
}
function yd(e, t) {
  var r = G2(Ny), n = [], i;
  n[n.length] = ut, n[n.length] = re("Types", null, {
    xmlns: mt.CT,
    "xmlns:xsd": mt.xsd,
    "xmlns:xsi": mt.xsi
  }), n = n.concat([
    ["xml", "application/xml"],
    ["bin", "application/vnd.ms-excel.sheet.binary.macroEnabled.main"],
    ["vml", "application/vnd.openxmlformats-officedocument.vmlDrawing"],
    ["data", "application/vnd.openxmlformats-officedocument.model+data"],
    /* from test files */
    ["bmp", "image/bmp"],
    ["png", "image/png"],
    ["gif", "image/gif"],
    ["emf", "image/x-emf"],
    ["wmf", "image/x-wmf"],
    ["jpg", "image/jpeg"],
    ["jpeg", "image/jpeg"],
    ["tif", "image/tiff"],
    ["tiff", "image/tiff"],
    ["pdf", "application/pdf"],
    ["rels", "application/vnd.openxmlformats-package.relationships+xml"]
  ].map(function(l) {
    return re("Default", null, { Extension: l[0], ContentType: l[1] });
  }));
  var s = function(l) {
    e[l] && e[l].length > 0 && (i = e[l][0], n[n.length] = re("Override", null, {
      PartName: (i[0] == "/" ? "" : "/") + i,
      ContentType: Aa[l][t.bookType] || Aa[l].xlsx
    }));
  }, a = function(l) {
    (e[l] || []).forEach(function(c) {
      n[n.length] = re("Override", null, {
        PartName: (c[0] == "/" ? "" : "/") + c,
        ContentType: Aa[l][t.bookType] || Aa[l].xlsx
      });
    });
  }, o = function(l) {
    (e[l] || []).forEach(function(c) {
      n[n.length] = re("Override", null, {
        PartName: (c[0] == "/" ? "" : "/") + c,
        ContentType: r[l][0]
      });
    });
  };
  return s("workbooks"), a("sheets"), a("charts"), o("themes"), ["strs", "styles"].forEach(s), ["coreprops", "extprops", "custprops"].forEach(o), o("vba"), o("comments"), o("threadedcomments"), o("drawings"), a("metadata"), o("people"), n.length > 2 && (n[n.length] = "</Types>", n[1] = n[1].replace("/>", ">")), n.join("");
}
var ke = {
  WB: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
  SHEET: "http://sheetjs.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
  HLINK: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
  VML: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing",
  XPATH: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLinkPath",
  XMISS: "http://schemas.microsoft.com/office/2006/relationships/xlExternalLinkPath/xlPathMissing",
  XLINK: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLink",
  CXML: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml",
  CXMLP: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXmlProps",
  CMNT: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments",
  CORE_PROPS: "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties",
  EXT_PROPS: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties",
  CUST_PROPS: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties",
  SST: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings",
  STY: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",
  THEME: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme",
  CHART: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart",
  CHARTEX: "http://schemas.microsoft.com/office/2014/relationships/chartEx",
  CS: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chartsheet",
  WS: [
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",
    "http://purl.oclc.org/ooxml/officeDocument/relationships/worksheet"
  ],
  DS: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/dialogsheet",
  MS: "http://schemas.microsoft.com/office/2006/relationships/xlMacrosheet",
  IMG: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
  DRAW: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing",
  XLMETA: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sheetMetadata",
  TCMNT: "http://schemas.microsoft.com/office/2017/10/relationships/threadedComment",
  PEOPLE: "http://schemas.microsoft.com/office/2017/10/relationships/person",
  VBA: "http://schemas.microsoft.com/office/2006/relationships/vbaProject"
};
function wd(e) {
  var t = e.lastIndexOf("/");
  return e.slice(0, t + 1) + "_rels/" + e.slice(t + 1) + ".rels";
}
function Ei(e) {
  var t = [ut, re("Relationships", null, {
    //'xmlns:ns0': XMLNS.RELS,
    xmlns: mt.RELS
  })];
  return At(e["!id"]).forEach(function(r) {
    t[t.length] = re("Relationship", null, e["!id"][r]);
  }), t.length > 2 && (t[t.length] = "</Relationships>", t[1] = t[1].replace("/>", ">")), t.join("");
}
function Re(e, t, r, n, i, s) {
  if (i || (i = {}), e["!id"] || (e["!id"] = {}), e["!idx"] || (e["!idx"] = 1), t < 0)
    for (t = e["!idx"]; e["!id"]["rId" + t]; ++t)
      ;
  if (e["!idx"] = t + 1, i.Id = "rId" + t, i.Type = n, i.Target = r, s ? i.TargetMode = s : [ke.HLINK, ke.XPATH, ke.XMISS].indexOf(i.Type) > -1 && (i.TargetMode = "External"), e["!id"][i.Id])
    throw new Error("Cannot rewrite rId " + t);
  return e["!id"][i.Id] = i, e[("/" + i.Target).replace("//", "/")] = i, t;
}
function By(e) {
  var t = [ut];
  t.push(`<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
`), t.push(`  <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/>
`);
  for (var r = 0; r < e.length; ++r)
    t.push('  <manifest:file-entry manifest:full-path="' + e[r][0] + '" manifest:media-type="' + e[r][1] + `"/>
`);
  return t.push("</manifest:manifest>"), t.join("");
}
function o0(e, t, r) {
  return [
    '  <rdf:Description rdf:about="' + e + `">
`,
    '    <rdf:type rdf:resource="http://docs.oasis-open.org/ns/office/1.2/meta/' + (r || "odf") + "#" + t + `"/>
`,
    `  </rdf:Description>
`
  ].join("");
}
function Wy(e, t) {
  return [
    '  <rdf:Description rdf:about="' + e + `">
`,
    '    <ns0:hasPart xmlns:ns0="http://docs.oasis-open.org/ns/office/1.2/meta/pkg#" rdf:resource="' + t + `"/>
`,
    `  </rdf:Description>
`
  ].join("");
}
function Uy(e) {
  var t = [ut];
  t.push(`<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
`);
  for (var r = 0; r != e.length; ++r)
    t.push(o0(e[r][0], e[r][1])), t.push(Wy("", e[r][0]));
  return t.push(o0("", "Document", "pkg")), t.push("</rdf:RDF>"), t.join("");
}
function Td() {
  return '<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xlink="http://www.w3.org/1999/xlink" office:version="1.2"><office:meta><meta:generator>SheetJS ' + Ka.version + "</meta:generator></office:meta></office:document-meta>";
}
var $n = [
  ["cp:category", "Category"],
  ["cp:contentStatus", "ContentStatus"],
  ["cp:keywords", "Keywords"],
  ["cp:lastModifiedBy", "LastAuthor"],
  ["cp:lastPrinted", "LastPrinted"],
  ["cp:revision", "RevNumber"],
  ["cp:version", "Version"],
  ["dc:creator", "Author"],
  ["dc:description", "Comments"],
  ["dc:identifier", "Identifier"],
  ["dc:language", "Language"],
  ["dc:subject", "Subject"],
  ["dc:title", "Title"],
  ["dcterms:created", "CreatedDate", "date"],
  ["dcterms:modified", "ModifiedDate", "date"]
];
function fl(e, t, r, n, i) {
  i[e] != null || t == null || t === "" || (i[e] = t, t = Ie(t), n[n.length] = r ? re(e, t, r) : St(e, t));
}
function Sd(e, t) {
  var r = t || {}, n = [ut, re("cp:coreProperties", null, {
    //'xmlns': XMLNS.CORE_PROPS,
    "xmlns:cp": mt.CORE_PROPS,
    "xmlns:dc": mt.dc,
    "xmlns:dcterms": mt.dcterms,
    "xmlns:dcmitype": mt.dcmitype,
    "xmlns:xsi": mt.xsi
  })], i = {};
  if (!e && !r.Props)
    return n.join("");
  e && (e.CreatedDate != null && fl("dcterms:created", typeof e.CreatedDate == "string" ? e.CreatedDate : Bl(e.CreatedDate, r.WTF), { "xsi:type": "dcterms:W3CDTF" }, n, i), e.ModifiedDate != null && fl("dcterms:modified", typeof e.ModifiedDate == "string" ? e.ModifiedDate : Bl(e.ModifiedDate, r.WTF), { "xsi:type": "dcterms:W3CDTF" }, n, i));
  for (var s = 0; s != $n.length; ++s) {
    var a = $n[s], o = r.Props && r.Props[a[1]] != null ? r.Props[a[1]] : e ? e[a[1]] : null;
    o === !0 ? o = "1" : o === !1 ? o = "0" : typeof o == "number" && (o = String(o)), o != null && fl(a[0], o, null, n, i);
  }
  return n.length > 2 && (n[n.length] = "</cp:coreProperties>", n[1] = n[1].replace("/>", ">")), n.join("");
}
var Ai = [
  ["Application", "Application", "string"],
  ["AppVersion", "AppVersion", "string"],
  ["Company", "Company", "string"],
  ["DocSecurity", "DocSecurity", "string"],
  ["Manager", "Manager", "string"],
  ["HyperlinksChanged", "HyperlinksChanged", "bool"],
  ["SharedDoc", "SharedDoc", "bool"],
  ["LinksUpToDate", "LinksUpToDate", "bool"],
  ["ScaleCrop", "ScaleCrop", "bool"],
  ["HeadingPairs", "HeadingPairs", "raw"],
  ["TitlesOfParts", "TitlesOfParts", "raw"]
], bd = [
  "Worksheets",
  "SheetNames",
  "NamedRanges",
  "DefinedNames",
  "Chartsheets",
  "ChartNames"
];
function Ed(e) {
  var t = [], r = re;
  return e || (e = {}), e.Application = "SheetJS", t[t.length] = ut, t[t.length] = re("Properties", null, {
    xmlns: mt.EXT_PROPS,
    "xmlns:vt": mt.vt
  }), Ai.forEach(function(n) {
    if (e[n[1]] !== void 0) {
      var i;
      switch (n[2]) {
        case "string":
          i = Ie(String(e[n[1]]));
          break;
        case "bool":
          i = e[n[1]] ? "true" : "false";
          break;
      }
      i !== void 0 && (t[t.length] = r(n[0], i));
    }
  }), t[t.length] = r("HeadingPairs", r("vt:vector", r("vt:variant", "<vt:lpstr>Worksheets</vt:lpstr>") + r("vt:variant", r("vt:i4", String(e.Worksheets))), { size: 2, baseType: "variant" })), t[t.length] = r("TitlesOfParts", r("vt:vector", e.SheetNames.map(function(n) {
    return "<vt:lpstr>" + Ie(n) + "</vt:lpstr>";
  }).join(""), { size: e.Worksheets, baseType: "lpstr" })), t.length > 2 && (t[t.length] = "</Properties>", t[1] = t[1].replace("/>", ">")), t.join("");
}
function Ad(e) {
  var t = [ut, re("Properties", null, {
    xmlns: mt.CUST_PROPS,
    "xmlns:vt": mt.vt
  })];
  if (!e)
    return t.join("");
  var r = 1;
  return At(e).forEach(function(i) {
    ++r, t[t.length] = re("property", iy(e[i], !0), {
      fmtid: "{D5CDD505-2E9C-101B-9397-08002B2CF9AE}",
      pid: r,
      name: Ie(i)
    });
  }), t.length > 2 && (t[t.length] = "</Properties>", t[1] = t[1].replace("/>", ">")), t.join("");
}
var l0 = {
  Title: "Title",
  Subject: "Subject",
  Author: "Author",
  Keywords: "Keywords",
  Comments: "Description",
  LastAuthor: "LastAuthor",
  RevNumber: "Revision",
  Application: "AppName",
  /* TotalTime: 'TotalTime', */
  LastPrinted: "LastPrinted",
  CreatedDate: "Created",
  ModifiedDate: "LastSaved",
  /* Pages */
  /* Words */
  /* Characters */
  Category: "Category",
  /* PresentationFormat */
  Manager: "Manager",
  Company: "Company",
  /* Guid */
  /* HyperlinkBase */
  /* Bytes */
  /* Lines */
  /* Paragraphs */
  /* CharactersWithSpaces */
  AppVersion: "Version",
  ContentStatus: "ContentStatus",
  /* NOTE: missing from schema */
  Identifier: "Identifier",
  /* NOTE: missing from schema */
  Language: "Language"
  /* NOTE: missing from schema */
};
function zy(e, t) {
  var r = [];
  return At(l0).map(function(n) {
    for (var i = 0; i < $n.length; ++i)
      if ($n[i][1] == n)
        return $n[i];
    for (i = 0; i < Ai.length; ++i)
      if (Ai[i][1] == n)
        return Ai[i];
    throw n;
  }).forEach(function(n) {
    if (e[n[1]] != null) {
      var i = t && t.Props && t.Props[n[1]] != null ? t.Props[n[1]] : e[n[1]];
      switch (n[2]) {
        case "date":
          i = new Date(i).toISOString().replace(/\.\d*Z/, "Z");
          break;
      }
      typeof i == "number" ? i = String(i) : i === !0 || i === !1 ? i = i ? "1" : "0" : i instanceof Date && (i = new Date(i).toISOString().replace(/\.\d*Z/, "")), r.push(St(l0[n[1]] || n[1], i));
    }
  }), re("DocumentProperties", r.join(""), { xmlns: Jt.o });
}
function Hy(e, t) {
  var r = ["Worksheets", "SheetNames"], n = "CustomDocumentProperties", i = [];
  return e && At(e).forEach(function(s) {
    if (Object.prototype.hasOwnProperty.call(e, s)) {
      for (var a = 0; a < $n.length; ++a)
        if (s == $n[a][1])
          return;
      for (a = 0; a < Ai.length; ++a)
        if (s == Ai[a][1])
          return;
      for (a = 0; a < r.length; ++a)
        if (s == r[a])
          return;
      var o = e[s], l = "string";
      typeof o == "number" ? (l = "float", o = String(o)) : o === !0 || o === !1 ? (l = "boolean", o = o ? "1" : "0") : o = String(o), i.push(re(Kh(s), o, { "dt:dt": l }));
    }
  }), t && At(t).forEach(function(s) {
    if (Object.prototype.hasOwnProperty.call(t, s) && !(e && Object.prototype.hasOwnProperty.call(e, s))) {
      var a = t[s], o = "string";
      typeof a == "number" ? (o = "float", a = String(a)) : a === !0 || a === !1 ? (o = "boolean", a = a ? "1" : "0") : a instanceof Date ? (o = "dateTime.tz", a = a.toISOString()) : a = String(a), i.push(re(Kh(s), a, { "dt:dt": o }));
    }
  }), "<" + n + ' xmlns="' + Jt.o + '">' + i.join("") + "</" + n + ">";
}
function Vy(e) {
  var t = typeof e == "string" ? new Date(Date.parse(e)) : e, r = t.getTime() / 1e3 + 11644473600, n = r % Math.pow(2, 32), i = (r - n) / Math.pow(2, 32);
  n *= 1e7, i *= 1e7;
  var s = n / Math.pow(2, 32) | 0;
  s > 0 && (n = n % Math.pow(2, 32), i += s);
  var a = G(8);
  return a.write_shift(4, n), a.write_shift(4, i), a;
}
function c0(e, t) {
  var r = G(4), n = G(4);
  switch (r.write_shift(4, e == 80 ? 31 : e), e) {
    case 3:
      n.write_shift(-4, t);
      break;
    case 5:
      n = G(8), n.write_shift(8, t, "f");
      break;
    case 11:
      n.write_shift(4, t ? 1 : 0);
      break;
    case 64:
      n = Vy(t);
      break;
    case 31:
    case 80:
      for (n = G(4 + 2 * (t.length + 1) + (t.length % 2 ? 0 : 2)), n.write_shift(4, t.length + 1), n.write_shift(0, t, "dbcs"); n.l != n.length; )
        n.write_shift(1, 0);
      break;
    default:
      throw new Error("TypedPropertyValue unrecognized type " + e + " " + t);
  }
  return Tt([r, n]);
}
var kd = ["CodePage", "Thumbnail", "_PID_LINKBASE", "_PID_HLINKS", "SystemIdentifier", "FMTID"];
function Yy(e) {
  switch (typeof e) {
    case "boolean":
      return 11;
    case "number":
      return (e | 0) == e ? 3 : 5;
    case "string":
      return 31;
    case "object":
      if (e instanceof Date)
        return 64;
      break;
  }
  return -1;
}
function f0(e, t, r) {
  var n = G(8), i = [], s = [], a = 8, o = 0, l = G(8), c = G(8);
  if (l.write_shift(4, 2), l.write_shift(4, 1200), c.write_shift(4, 1), s.push(l), i.push(c), a += 8 + l.length, !t) {
    c = G(8), c.write_shift(4, 0), i.unshift(c);
    var f = [G(4)];
    for (f[0].write_shift(4, e.length), o = 0; o < e.length; ++o) {
      var h = e[o][0];
      for (l = G(8 + 2 * (h.length + 1) + (h.length % 2 ? 0 : 2)), l.write_shift(4, o + 2), l.write_shift(4, h.length + 1), l.write_shift(0, h, "dbcs"); l.l != l.length; )
        l.write_shift(1, 0);
      f.push(l);
    }
    l = Tt(f), s.unshift(l), a += 8 + l.length;
  }
  for (o = 0; o < e.length; ++o)
    if (!(t && !t[e[o][0]]) && !(kd.indexOf(e[o][0]) > -1 || bd.indexOf(e[o][0]) > -1) && e[o][1] != null) {
      var u = e[o][1], d = 0;
      if (t) {
        d = +t[e[o][0]];
        var p = r[d];
        if (p.p == "version" && typeof u == "string") {
          var g = u.split(".");
          u = (+g[0] << 16) + (+g[1] || 0);
        }
        l = c0(p.t, u);
      } else {
        var m = Yy(u);
        m == -1 && (m = 31, u = String(u)), l = c0(m, u);
      }
      s.push(l), c = G(8), c.write_shift(4, t ? d : 2 + o), i.push(c), a += 8 + l.length;
    }
  var v = 8 * (s.length + 1);
  for (o = 0; o < s.length; ++o)
    i[o].write_shift(4, v), v += s[o].length;
  return n.write_shift(4, a), n.write_shift(4, s.length), Tt([n].concat(i).concat(s));
}
function h0(e, t, r, n, i, s) {
  var a = G(i ? 68 : 48), o = [a];
  a.write_shift(2, 65534), a.write_shift(2, 0), a.write_shift(4, 842412599), a.write_shift(16, Be.utils.consts.HEADER_CLSID, "hex"), a.write_shift(4, i ? 2 : 1), a.write_shift(16, t, "hex"), a.write_shift(4, i ? 68 : 48);
  var l = f0(e, r, n);
  if (o.push(l), i) {
    var c = f0(i, null, null);
    a.write_shift(16, s, "hex"), a.write_shift(4, 68 + l.length), o.push(c);
  }
  return Tt(o);
}
function jy(e, t) {
  t || (t = G(e));
  for (var r = 0; r < e; ++r)
    t.write_shift(1, 0);
  return t;
}
function $y(e, t) {
  return e.read_shift(t) === 1;
}
function Bt(e, t) {
  return t || (t = G(2)), t.write_shift(2, +!!e), t;
}
function Od(e) {
  return e.read_shift(2, "u");
}
function or(e, t) {
  return t || (t = G(2)), t.write_shift(2, e), t;
}
function Dd(e, t, r) {
  return r || (r = G(2)), r.write_shift(1, t == "e" ? +e : +!!e), r.write_shift(1, t == "e" ? 1 : 0), r;
}
function Fd(e, t, r) {
  var n = e.read_shift(r && r.biff >= 12 ? 2 : 1), i = "sbcs-cont";
  if (r && r.biff >= 8, !r || r.biff == 8) {
    var s = e.read_shift(1);
    s && (i = "dbcs-cont");
  } else
    r.biff == 12 && (i = "wstr");
  r.biff >= 2 && r.biff <= 5 && (i = "cpstr");
  var a = n ? e.read_shift(n, i) : "";
  return a;
}
function Gy(e) {
  var t = e.t || "", r = G(3);
  r.write_shift(2, t.length), r.write_shift(1, 1);
  var n = G(2 * t.length);
  n.write_shift(2 * t.length, t, "utf16le");
  var i = [r, n];
  return Tt(i);
}
function Xy(e, t, r) {
  var n;
  if (r) {
    if (r.biff >= 2 && r.biff <= 5)
      return e.read_shift(t, "cpstr");
    if (r.biff >= 12)
      return e.read_shift(t, "dbcs-cont");
  }
  var i = e.read_shift(1);
  return i === 0 ? n = e.read_shift(t, "sbcs-cont") : n = e.read_shift(t, "dbcs-cont"), n;
}
function Ky(e, t, r) {
  var n = e.read_shift(r && r.biff == 2 ? 1 : 2);
  return n === 0 ? (e.l++, "") : Xy(e, n, r);
}
function qy(e, t, r) {
  if (r.biff > 5)
    return Ky(e, t, r);
  var n = e.read_shift(1);
  return n === 0 ? (e.l++, "") : e.read_shift(n, r.biff <= 4 || !e.lens ? "cpstr" : "sbcs-cont");
}
function Cd(e, t, r) {
  return r || (r = G(3 + 2 * e.length)), r.write_shift(2, e.length), r.write_shift(1, 1), r.write_shift(31, e, "utf16le"), r;
}
function u0(e, t) {
  t || (t = G(6 + e.length * 2)), t.write_shift(4, 1 + e.length);
  for (var r = 0; r < e.length; ++r)
    t.write_shift(2, e.charCodeAt(r));
  return t.write_shift(2, 0), t;
}
function Zy(e) {
  var t = G(512), r = 0, n = e.Target;
  n.slice(0, 7) == "file://" && (n = n.slice(7));
  var i = n.indexOf("#"), s = i > -1 ? 31 : 23;
  switch (n.charAt(0)) {
    case "#":
      s = 28;
      break;
    case ".":
      s &= -3;
      break;
  }
  t.write_shift(4, 2), t.write_shift(4, s);
  var a = [8, 6815827, 6619237, 4849780, 83];
  for (r = 0; r < a.length; ++r)
    t.write_shift(4, a[r]);
  if (s == 28)
    n = n.slice(1), u0(n, t);
  else if (s & 2) {
    for (a = "e0 c9 ea 79 f9 ba ce 11 8c 82 00 aa 00 4b a9 0b".split(" "), r = 0; r < a.length; ++r)
      t.write_shift(1, parseInt(a[r], 16));
    var o = i > -1 ? n.slice(0, i) : n;
    for (t.write_shift(4, 2 * (o.length + 1)), r = 0; r < o.length; ++r)
      t.write_shift(2, o.charCodeAt(r));
    t.write_shift(2, 0), s & 8 && u0(i > -1 ? n.slice(i + 1) : "", t);
  } else {
    for (a = "03 03 00 00 00 00 00 00 c0 00 00 00 00 00 00 46".split(" "), r = 0; r < a.length; ++r)
      t.write_shift(1, parseInt(a[r], 16));
    for (var l = 0; n.slice(l * 3, l * 3 + 3) == "../" || n.slice(l * 3, l * 3 + 3) == "..\\"; )
      ++l;
    for (t.write_shift(2, l), t.write_shift(4, n.length - 3 * l + 1), r = 0; r < n.length - 3 * l; ++r)
      t.write_shift(1, n.charCodeAt(r + 3 * l) & 255);
    for (t.write_shift(1, 0), t.write_shift(2, 65535), t.write_shift(2, 57005), r = 0; r < 6; ++r)
      t.write_shift(4, 0);
  }
  return t.slice(0, t.l);
}
function Qn(e, t, r, n) {
  return n || (n = G(6)), n.write_shift(2, e), n.write_shift(2, t), n.write_shift(2, r || 0), n;
}
function Jy(e, t, r) {
  var n = r.biff > 8 ? 4 : 2, i = e.read_shift(n), s = e.read_shift(n, "i"), a = e.read_shift(n, "i");
  return [i, s, a];
}
function Qy(e) {
  var t = e.read_shift(2), r = e.read_shift(2), n = e.read_shift(2), i = e.read_shift(2);
  return { s: { c: n, r: t }, e: { c: i, r } };
}
function Md(e, t) {
  return t || (t = G(8)), t.write_shift(2, e.s.r), t.write_shift(2, e.e.r), t.write_shift(2, e.s.c), t.write_shift(2, e.e.c), t;
}
function Ec(e, t, r) {
  var n = 1536, i = 16;
  switch (r.bookType) {
    case "biff8":
      break;
    case "biff5":
      n = 1280, i = 8;
      break;
    case "biff4":
      n = 4, i = 6;
      break;
    case "biff3":
      n = 3, i = 6;
      break;
    case "biff2":
      n = 2, i = 4;
      break;
    case "xla":
      break;
    default:
      throw new Error("unsupported BIFF version");
  }
  var s = G(i);
  return s.write_shift(2, n), s.write_shift(2, t), i > 4 && s.write_shift(2, 29282), i > 6 && s.write_shift(2, 1997), i > 8 && (s.write_shift(2, 49161), s.write_shift(2, 1), s.write_shift(2, 1798), s.write_shift(2, 0)), s;
}
function ew(e, t) {
  var r = !t || t.biff == 8, n = G(r ? 112 : 54);
  for (n.write_shift(t.biff == 8 ? 2 : 1, 7), r && n.write_shift(1, 0), n.write_shift(4, 859007059), n.write_shift(4, 5458548 | (r ? 0 : 536870912)); n.l < n.length; )
    n.write_shift(1, r ? 0 : 32);
  return n;
}
function tw(e, t) {
  var r = !t || t.biff >= 8 ? 2 : 1, n = G(8 + r * e.name.length);
  n.write_shift(4, e.pos), n.write_shift(1, e.hs || 0), n.write_shift(1, e.dt), n.write_shift(1, e.name.length), t.biff >= 8 && n.write_shift(1, 1), n.write_shift(r * e.name.length, e.name, t.biff < 8 ? "sbcs" : "utf16le");
  var i = n.slice(0, n.l);
  return i.l = n.l, i;
}
function rw(e, t) {
  var r = G(8);
  r.write_shift(4, e.Count), r.write_shift(4, e.Unique);
  for (var n = [], i = 0; i < e.length; ++i)
    n[i] = Gy(e[i]);
  var s = Tt([r].concat(n));
  return s.parts = [r.length].concat(n.map(function(a) {
    return a.length;
  })), s;
}
function nw() {
  var e = G(18);
  return e.write_shift(2, 0), e.write_shift(2, 0), e.write_shift(2, 29280), e.write_shift(2, 17600), e.write_shift(2, 56), e.write_shift(2, 0), e.write_shift(2, 0), e.write_shift(2, 1), e.write_shift(2, 500), e;
}
function iw(e) {
  var t = G(18), r = 1718;
  return e && e.RTL && (r |= 64), t.write_shift(2, r), t.write_shift(4, 0), t.write_shift(4, 64), t.write_shift(4, 0), t.write_shift(4, 0), t;
}
function sw(e, t) {
  var r = e.name || "Arial", n = t && t.biff == 5, i = n ? 15 + r.length : 16 + 2 * r.length, s = G(i);
  return s.write_shift(2, (e.sz || 12) * 20), s.write_shift(4, 0), s.write_shift(2, 400), s.write_shift(4, 0), s.write_shift(2, 0), s.write_shift(1, r.length), n || s.write_shift(1, 1), s.write_shift((n ? 1 : 2) * r.length, r, n ? "sbcs" : "utf16le"), s;
}
function aw(e, t, r, n) {
  var i = G(10);
  return Qn(e, t, n, i), i.write_shift(4, r), i;
}
function ow(e, t, r, n, i) {
  var s = !i || i.biff == 8, a = G(8 + +s + (1 + s) * r.length);
  return Qn(e, t, n, a), a.write_shift(2, r.length), s && a.write_shift(1, 1), a.write_shift((1 + s) * r.length, r, s ? "utf16le" : "sbcs"), a;
}
function lw(e, t, r, n) {
  var i = r && r.biff == 5;
  n || (n = G(i ? 3 + t.length : 5 + 2 * t.length)), n.write_shift(2, e), n.write_shift(i ? 1 : 2, t.length), i || n.write_shift(1, 1), n.write_shift((i ? 1 : 2) * t.length, t, i ? "sbcs" : "utf16le");
  var s = n.length > n.l ? n.slice(0, n.l) : n;
  return s.l == null && (s.l = s.length), s;
}
function cw(e, t) {
  var r = t.biff == 8 || !t.biff ? 4 : 2, n = G(2 * r + 6);
  return n.write_shift(r, e.s.r), n.write_shift(r, e.e.r + 1), n.write_shift(2, e.s.c), n.write_shift(2, e.e.c + 1), n.write_shift(2, 0), n;
}
function d0(e, t, r, n) {
  var i = r && r.biff == 5;
  n || (n = G(i ? 16 : 20)), n.write_shift(2, 0), e.style ? (n.write_shift(2, e.numFmtId || 0), n.write_shift(2, 65524)) : (n.write_shift(2, e.numFmtId || 0), n.write_shift(2, t << 4));
  var s = 0;
  return e.numFmtId > 0 && i && (s |= 1024), n.write_shift(4, s), n.write_shift(4, 0), i || n.write_shift(4, 0), n.write_shift(2, 0), n;
}
function fw(e) {
  var t = G(8);
  return t.write_shift(4, 0), t.write_shift(2, e[0] ? e[0] + 1 : 0), t.write_shift(2, e[1] ? e[1] + 1 : 0), t;
}
function hw(e, t, r, n, i, s) {
  var a = G(8);
  return Qn(e, t, n, a), Dd(r, s, a), a;
}
function uw(e, t, r, n) {
  var i = G(14);
  return Qn(e, t, n, i), Jn(r, i), i;
}
function dw(e, t, r) {
  if (r.biff < 8)
    return gw(e, t, r);
  for (var n = [], i = e.l + t, s = e.read_shift(r.biff > 8 ? 4 : 2); s-- !== 0; )
    n.push(Jy(e, r.biff > 8 ? 12 : 6, r));
  if (e.l != i)
    throw new Error("Bad ExternSheet: " + e.l + " != " + i);
  return n;
}
function gw(e, t, r) {
  e[e.l + 1] == 3 && e[e.l]++;
  var n = Fd(e, t, r);
  return n.charCodeAt(0) == 3 ? n.slice(1) : n;
}
function pw(e) {
  var t = G(2 + e.length * 8);
  t.write_shift(2, e.length);
  for (var r = 0; r < e.length; ++r)
    Md(e[r], t);
  return t;
}
function mw(e) {
  var t = G(24), r = _t(e[0]);
  t.write_shift(2, r.r), t.write_shift(2, r.r), t.write_shift(2, r.c), t.write_shift(2, r.c);
  for (var n = "d0 c9 ea 79 f9 ba ce 11 8c 82 00 aa 00 4b a9 0b".split(" "), i = 0; i < 16; ++i)
    t.write_shift(1, parseInt(n[i], 16));
  return Tt([t, Zy(e[1])]);
}
function xw(e) {
  var t = e[1].Tooltip, r = G(10 + 2 * (t.length + 1));
  r.write_shift(2, 2048);
  var n = _t(e[0]);
  r.write_shift(2, n.r), r.write_shift(2, n.r), r.write_shift(2, n.c), r.write_shift(2, n.c);
  for (var i = 0; i < t.length; ++i)
    r.write_shift(2, t.charCodeAt(i));
  return r.write_shift(2, 0), r;
}
function _w(e) {
  return e || (e = G(4)), e.write_shift(2, 1), e.write_shift(2, 1), e;
}
function vw(e, t, r) {
  if (!r.cellStyles)
    return Pr(e, t);
  var n = r && r.biff >= 12 ? 4 : 2, i = e.read_shift(n), s = e.read_shift(n), a = e.read_shift(n), o = e.read_shift(n), l = e.read_shift(2);
  n == 2 && (e.l += 2);
  var c = { s: i, e: s, w: a, ixfe: o, flags: l };
  return (r.biff >= 5 || !r.biff) && (c.level = l >> 8 & 7), c;
}
function yw(e, t) {
  var r = G(12);
  r.write_shift(2, t), r.write_shift(2, t), r.write_shift(2, e.width * 256), r.write_shift(2, 0);
  var n = 0;
  return e.hidden && (n |= 1), r.write_shift(1, n), n = e.level || 0, r.write_shift(1, n), r.write_shift(2, 0), r;
}
function ww(e) {
  for (var t = G(2 * e), r = 0; r < e; ++r)
    t.write_shift(2, r + 1);
  return t;
}
function Tw(e, t, r) {
  var n = G(15);
  return Ks(n, e, t), n.write_shift(8, r, "f"), n;
}
function Sw(e, t, r) {
  var n = G(9);
  return Ks(n, e, t), n.write_shift(2, r), n;
}
var bw = /* @__PURE__ */ function() {
  var e = {
    /* Code Pages Supported by Visual FoxPro */
    /*::[*/
    1: 437,
    /*::[*/
    2: 850,
    /*::[*/
    3: 1252,
    /*::[*/
    4: 1e4,
    /*::[*/
    100: 852,
    /*::[*/
    101: 866,
    /*::[*/
    102: 865,
    /*::[*/
    103: 861,
    /*::[*/
    104: 895,
    /*::[*/
    105: 620,
    /*::[*/
    106: 737,
    /*::[*/
    107: 857,
    /*::[*/
    120: 950,
    /*::[*/
    121: 949,
    /*::[*/
    122: 936,
    /*::[*/
    123: 932,
    /*::[*/
    124: 874,
    /*::[*/
    125: 1255,
    /*::[*/
    126: 1256,
    /*::[*/
    150: 10007,
    /*::[*/
    151: 10029,
    /*::[*/
    152: 10006,
    /*::[*/
    200: 1250,
    /*::[*/
    201: 1251,
    /*::[*/
    202: 1254,
    /*::[*/
    203: 1253,
    /* shapefile DBF extension */
    /*::[*/
    0: 20127,
    /*::[*/
    8: 865,
    /*::[*/
    9: 437,
    /*::[*/
    10: 850,
    /*::[*/
    11: 437,
    /*::[*/
    13: 437,
    /*::[*/
    14: 850,
    /*::[*/
    15: 437,
    /*::[*/
    16: 850,
    /*::[*/
    17: 437,
    /*::[*/
    18: 850,
    /*::[*/
    19: 932,
    /*::[*/
    20: 850,
    /*::[*/
    21: 437,
    /*::[*/
    22: 850,
    /*::[*/
    23: 865,
    /*::[*/
    24: 437,
    /*::[*/
    25: 437,
    /*::[*/
    26: 850,
    /*::[*/
    27: 437,
    /*::[*/
    28: 863,
    /*::[*/
    29: 850,
    /*::[*/
    31: 852,
    /*::[*/
    34: 852,
    /*::[*/
    35: 852,
    /*::[*/
    36: 860,
    /*::[*/
    37: 850,
    /*::[*/
    38: 866,
    /*::[*/
    55: 850,
    /*::[*/
    64: 852,
    /*::[*/
    77: 936,
    /*::[*/
    78: 949,
    /*::[*/
    79: 950,
    /*::[*/
    80: 874,
    /*::[*/
    87: 1252,
    /*::[*/
    88: 1252,
    /*::[*/
    89: 1252,
    /*::[*/
    108: 863,
    /*::[*/
    134: 737,
    /*::[*/
    135: 852,
    /*::[*/
    136: 857,
    /*::[*/
    204: 1257,
    /*::[*/
    255: 16969
  }, t = gc({
    /*::[*/
    1: 437,
    /*::[*/
    2: 850,
    /*::[*/
    3: 1252,
    /*::[*/
    4: 1e4,
    /*::[*/
    100: 852,
    /*::[*/
    101: 866,
    /*::[*/
    102: 865,
    /*::[*/
    103: 861,
    /*::[*/
    104: 895,
    /*::[*/
    105: 620,
    /*::[*/
    106: 737,
    /*::[*/
    107: 857,
    /*::[*/
    120: 950,
    /*::[*/
    121: 949,
    /*::[*/
    122: 936,
    /*::[*/
    123: 932,
    /*::[*/
    124: 874,
    /*::[*/
    125: 1255,
    /*::[*/
    126: 1256,
    /*::[*/
    150: 10007,
    /*::[*/
    151: 10029,
    /*::[*/
    152: 10006,
    /*::[*/
    200: 1250,
    /*::[*/
    201: 1251,
    /*::[*/
    202: 1254,
    /*::[*/
    203: 1253,
    /*::[*/
    0: 20127
  });
  function r(o, l) {
    var c = [], f = Zn(1);
    switch (l.type) {
      case "base64":
        f = gr(sn(o));
        break;
      case "binary":
        f = gr(o);
        break;
      case "buffer":
      case "array":
        f = o;
        break;
    }
    Zt(f, 0);
    var h = f.read_shift(1), u = !!(h & 136), d = !1, p = !1;
    switch (h) {
      case 2:
        break;
      case 3:
        break;
      case 48:
        d = !0, u = !0;
        break;
      case 49:
        d = !0, u = !0;
        break;
      case 131:
        break;
      case 139:
        break;
      case 140:
        p = !0;
        break;
      case 245:
        break;
      default:
        throw new Error("DBF Unsupported Version: " + h.toString(16));
    }
    var g = 0, m = 521;
    h == 2 && (g = f.read_shift(2)), f.l += 3, h != 2 && (g = f.read_shift(4)), g > 1048576 && (g = 1e6), h != 2 && (m = f.read_shift(2));
    var v = f.read_shift(2), w = l.codepage || 1252;
    h != 2 && (f.l += 16, f.read_shift(1), f[f.l] !== 0 && (w = e[f[f.l]]), f.l += 1, f.l += 2), p && (f.l += 36);
    for (var S = [], D = {}, P = Math.min(f.length, h == 2 ? 521 : m - 10 - (d ? 264 : 0)), N = p ? 32 : 11; f.l < P && f[f.l] != 13; )
      switch (D = {}, D.name = Un.utils.decode(w, f.slice(f.l, f.l + N)).replace(/[\u0000\r\n].*$/g, ""), f.l += N, D.type = String.fromCharCode(f.read_shift(1)), h != 2 && !p && (D.offset = f.read_shift(4)), D.len = f.read_shift(1), h == 2 && (D.offset = f.read_shift(2)), D.dec = f.read_shift(1), D.name.length && S.push(D), h != 2 && (f.l += p ? 13 : 14), D.type) {
        case "B":
          (!d || D.len != 8) && l.WTF && console.log("Skipping " + D.name + ":" + D.type);
          break;
        case "G":
        case "P":
          l.WTF && console.log("Skipping " + D.name + ":" + D.type);
          break;
        case "+":
        case "0":
        case "@":
        case "C":
        case "D":
        case "F":
        case "I":
        case "L":
        case "M":
        case "N":
        case "O":
        case "T":
        case "Y":
          break;
        default:
          throw new Error("Unknown Field Type: " + D.type);
      }
    if (f[f.l] !== 13 && (f.l = m - 1), f.read_shift(1) !== 13)
      throw new Error("DBF Terminator not found " + f.l + " " + f[f.l]);
    f.l = m;
    var O = 0, I = 0;
    for (c[0] = [], I = 0; I != S.length; ++I)
      c[0][I] = S[I].name;
    for (; g-- > 0; ) {
      if (f[f.l] === 42) {
        f.l += v;
        continue;
      }
      for (++f.l, c[++O] = [], I = 0, I = 0; I != S.length; ++I) {
        var R = f.slice(f.l, f.l + S[I].len);
        f.l += S[I].len, Zt(R, 0);
        var z = Un.utils.decode(w, R);
        switch (S[I].type) {
          case "C":
            z.trim().length && (c[O][I] = z.replace(/\s+$/, ""));
            break;
          case "D":
            z.length === 8 ? c[O][I] = new Date(+z.slice(0, 4), +z.slice(4, 6) - 1, +z.slice(6, 8)) : c[O][I] = z;
            break;
          case "F":
            c[O][I] = parseFloat(z.trim());
            break;
          case "+":
          case "I":
            c[O][I] = p ? R.read_shift(-4, "i") ^ 2147483648 : R.read_shift(4, "i");
            break;
          case "L":
            switch (z.trim().toUpperCase()) {
              case "Y":
              case "T":
                c[O][I] = !0;
                break;
              case "N":
              case "F":
                c[O][I] = !1;
                break;
              case "":
              case "?":
                break;
              default:
                throw new Error("DBF Unrecognized L:|" + z + "|");
            }
            break;
          case "M":
            if (!u)
              throw new Error("DBF Unexpected MEMO for type " + h.toString(16));
            c[O][I] = "##MEMO##" + (p ? parseInt(z.trim(), 10) : R.read_shift(4));
            break;
          case "N":
            z = z.replace(/\u0000/g, "").trim(), z && z != "." && (c[O][I] = +z || 0);
            break;
          case "@":
            c[O][I] = new Date(R.read_shift(-8, "f") - 621356832e5);
            break;
          case "T":
            c[O][I] = new Date((R.read_shift(4) - 2440588) * 864e5 + R.read_shift(4));
            break;
          case "Y":
            c[O][I] = R.read_shift(4, "i") / 1e4 + R.read_shift(4, "i") / 1e4 * Math.pow(2, 32);
            break;
          case "O":
            c[O][I] = -R.read_shift(-8, "f");
            break;
          case "B":
            if (d && S[I].len == 8) {
              c[O][I] = R.read_shift(8, "f");
              break;
            }
          case "G":
          case "P":
            R.l += S[I].len;
            break;
          case "0":
            if (S[I].name === "_NullFlags")
              break;
          default:
            throw new Error("DBF Unsupported data type " + S[I].type);
        }
      }
    }
    if (h != 2 && f.l < f.length && f[f.l++] != 26)
      throw new Error("DBF EOF Marker missing " + (f.l - 1) + " of " + f.length + " " + f[f.l - 1].toString(16));
    return l && l.sheetRows && (c = c.slice(0, l.sheetRows)), l.DBF = S, c;
  }
  function n(o, l) {
    var c = l || {};
    c.dateNF || (c.dateNF = "yyyymmdd");
    var f = Bi(r(o, c), c);
    return f["!cols"] = c.DBF.map(function(h) {
      return {
        wch: h.len,
        DBF: h
      };
    }), delete c.DBF, f;
  }
  function i(o, l) {
    try {
      return ii(n(o, l), l);
    } catch (c) {
      if (l && l.WTF)
        throw c;
    }
    return { SheetNames: [], Sheets: {} };
  }
  var s = { B: 8, C: 250, L: 1, D: 8, "?": 0, "": 0 };
  function a(o, l) {
    var c = l || {};
    if (+c.codepage >= 0 && Fs(+c.codepage), c.type == "string")
      throw new Error("Cannot write DBF to JS string");
    var f = jt(), h = lo(o, { header: 1, raw: !0, cellDates: !0 }), u = h[0], d = h.slice(1), p = o["!cols"] || [], g = 0, m = 0, v = 0, w = 1;
    for (g = 0; g < u.length; ++g) {
      if (((p[g] || {}).DBF || {}).name) {
        u[g] = p[g].DBF.name, ++v;
        continue;
      }
      if (u[g] != null) {
        if (++v, typeof u[g] == "number" && (u[g] = u[g].toString(10)), typeof u[g] != "string")
          throw new Error("DBF Invalid column name " + u[g] + " |" + typeof u[g] + "|");
        if (u.indexOf(u[g]) !== g) {
          for (m = 0; m < 1024; ++m)
            if (u.indexOf(u[g] + "_" + m) == -1) {
              u[g] += "_" + m;
              break;
            }
        }
      }
    }
    var S = je(o["!ref"]), D = [], P = [], N = [];
    for (g = 0; g <= S.e.c - S.s.c; ++g) {
      var O = "", I = "", R = 0, z = [];
      for (m = 0; m < d.length; ++m)
        d[m][g] != null && z.push(d[m][g]);
      if (z.length == 0 || u[g] == null) {
        D[g] = "?";
        continue;
      }
      for (m = 0; m < z.length; ++m) {
        switch (typeof z[m]) {
          case "number":
            I = "B";
            break;
          case "string":
            I = "C";
            break;
          case "boolean":
            I = "L";
            break;
          case "object":
            I = z[m] instanceof Date ? "D" : "C";
            break;
          default:
            I = "C";
        }
        R = Math.max(R, String(z[m]).length), O = O && O != I ? "C" : I;
      }
      R > 250 && (R = 250), I = ((p[g] || {}).DBF || {}).type, I == "C" && p[g].DBF.len > R && (R = p[g].DBF.len), O == "B" && I == "N" && (O = "N", N[g] = p[g].DBF.dec, R = p[g].DBF.len), P[g] = O == "C" || I == "N" ? R : s[O] || 0, w += P[g], D[g] = O;
    }
    var H = f.next(32);
    for (H.write_shift(4, 318902576), H.write_shift(4, d.length), H.write_shift(2, 296 + 32 * v), H.write_shift(2, w), g = 0; g < 4; ++g)
      H.write_shift(4, 0);
    for (H.write_shift(4, 0 | (+t[
      /*::String(*/
      Ru
      /*::)*/
    ] || 3) << 8), g = 0, m = 0; g < u.length; ++g)
      if (u[g] != null) {
        var V = f.next(32), ee = (u[g].slice(-10) + "\0\0\0\0\0\0\0\0\0\0\0").slice(0, 11);
        V.write_shift(1, ee, "sbcs"), V.write_shift(1, D[g] == "?" ? "C" : D[g], "sbcs"), V.write_shift(4, m), V.write_shift(1, P[g] || s[D[g]] || 0), V.write_shift(1, N[g] || 0), V.write_shift(1, 2), V.write_shift(4, 0), V.write_shift(1, 0), V.write_shift(4, 0), V.write_shift(4, 0), m += P[g] || s[D[g]] || 0;
      }
    var ge = f.next(264);
    for (ge.write_shift(4, 13), g = 0; g < 65; ++g)
      ge.write_shift(4, 0);
    for (g = 0; g < d.length; ++g) {
      var ae = f.next(w);
      for (ae.write_shift(1, 0), m = 0; m < u.length; ++m)
        if (u[m] != null)
          switch (D[m]) {
            case "L":
              ae.write_shift(1, d[g][m] == null ? 63 : d[g][m] ? 84 : 70);
              break;
            case "B":
              ae.write_shift(8, d[g][m] || 0, "f");
              break;
            case "N":
              var de = "0";
              for (typeof d[g][m] == "number" && (de = d[g][m].toFixed(N[m] || 0)), v = 0; v < P[m] - de.length; ++v)
                ae.write_shift(1, 32);
              ae.write_shift(1, de, "sbcs");
              break;
            case "D":
              d[g][m] ? (ae.write_shift(4, ("0000" + d[g][m].getFullYear()).slice(-4), "sbcs"), ae.write_shift(2, ("00" + (d[g][m].getMonth() + 1)).slice(-2), "sbcs"), ae.write_shift(2, ("00" + d[g][m].getDate()).slice(-2), "sbcs")) : ae.write_shift(8, "00000000", "sbcs");
              break;
            case "C":
              var pe = String(d[g][m] != null ? d[g][m] : "").slice(0, P[m]);
              for (ae.write_shift(1, pe, "sbcs"), v = 0; v < P[m] - pe.length; ++v)
                ae.write_shift(1, 32);
              break;
          }
    }
    return f.next(1).write_shift(1, 26), f.end();
  }
  return {
    to_workbook: i,
    to_sheet: n,
    from_sheet: a
  };
}(), Ew = /* @__PURE__ */ function() {
  var e = {
    AA: "À",
    BA: "Á",
    CA: "Â",
    DA: 195,
    HA: "Ä",
    JA: 197,
    AE: "È",
    BE: "É",
    CE: "Ê",
    HE: "Ë",
    AI: "Ì",
    BI: "Í",
    CI: "Î",
    HI: "Ï",
    AO: "Ò",
    BO: "Ó",
    CO: "Ô",
    DO: 213,
    HO: "Ö",
    AU: "Ù",
    BU: "Ú",
    CU: "Û",
    HU: "Ü",
    Aa: "à",
    Ba: "á",
    Ca: "â",
    Da: 227,
    Ha: "ä",
    Ja: 229,
    Ae: "è",
    Be: "é",
    Ce: "ê",
    He: "ë",
    Ai: "ì",
    Bi: "í",
    Ci: "î",
    Hi: "ï",
    Ao: "ò",
    Bo: "ó",
    Co: "ô",
    Do: 245,
    Ho: "ö",
    Au: "ù",
    Bu: "ú",
    Cu: "û",
    Hu: "ü",
    KC: "Ç",
    Kc: "ç",
    q: "æ",
    z: "œ",
    a: "Æ",
    j: "Œ",
    DN: 209,
    Dn: 241,
    Hy: 255,
    S: 169,
    c: 170,
    R: 174,
    "B ": 180,
    /*::[*/
    0: 176,
    /*::[*/
    1: 177,
    /*::[*/
    2: 178,
    /*::[*/
    3: 179,
    /*::[*/
    5: 181,
    /*::[*/
    6: 182,
    /*::[*/
    7: 183,
    Q: 185,
    k: 186,
    b: 208,
    i: 216,
    l: 222,
    s: 240,
    y: 248,
    "!": 161,
    '"': 162,
    "#": 163,
    "(": 164,
    "%": 165,
    "'": 167,
    "H ": 168,
    "+": 171,
    ";": 187,
    "<": 188,
    "=": 189,
    ">": 190,
    "?": 191,
    "{": 223
  }, t = new RegExp("\x1BN(" + At(e).join("|").replace(/\|\|\|/, "|\\||").replace(/([?()+])/g, "\\$1") + "|\\|)", "gm"), r = function(u, d) {
    var p = e[d];
    return typeof p == "number" ? Nh(p) : p;
  }, n = function(u, d, p) {
    var g = d.charCodeAt(0) - 32 << 4 | p.charCodeAt(0) - 48;
    return g == 59 ? u : Nh(g);
  };
  e["|"] = 254;
  function i(u, d) {
    switch (d.type) {
      case "base64":
        return s(sn(u), d);
      case "binary":
        return s(u, d);
      case "buffer":
        return s(Fe && Buffer.isBuffer(u) ? u.toString("binary") : Ys(u), d);
      case "array":
        return s(ko(u), d);
    }
    throw new Error("Unrecognized type " + d.type);
  }
  function s(u, d) {
    var p = u.split(/[\n\r]+/), g = -1, m = -1, v = 0, w = 0, S = [], D = [], P = null, N = {}, O = [], I = [], R = [], z = 0, H;
    for (+d.codepage >= 0 && Fs(+d.codepage); v !== p.length; ++v) {
      z = 0;
      var V = p[v].trim().replace(/\x1B([\x20-\x2F])([\x30-\x3F])/g, n).replace(t, r), ee = V.replace(/;;/g, "\0").split(";").map(function(k) {
        return k.replace(/\u0000/g, ";");
      }), ge = ee[0], ae;
      if (V.length > 0)
        switch (ge) {
          case "ID":
            break;
          case "E":
            break;
          case "B":
            break;
          case "O":
            break;
          case "W":
            break;
          case "P":
            ee[1].charAt(0) == "P" && D.push(V.slice(3).replace(/;;/g, ";"));
            break;
          case "C":
            var de = !1, pe = !1, Ue = !1, ye = !1, et = -1, lt = -1;
            for (w = 1; w < ee.length; ++w)
              switch (ee[w].charAt(0)) {
                case "A":
                  break;
                case "X":
                  m = parseInt(ee[w].slice(1)) - 1, pe = !0;
                  break;
                case "Y":
                  for (g = parseInt(ee[w].slice(1)) - 1, pe || (m = 0), H = S.length; H <= g; ++H)
                    S[H] = [];
                  break;
                case "K":
                  ae = ee[w].slice(1), ae.charAt(0) === '"' ? ae = ae.slice(1, ae.length - 1) : ae === "TRUE" ? ae = !0 : ae === "FALSE" ? ae = !1 : isNaN(tn(ae)) ? isNaN(Ms(ae).getDate()) || (ae = Wt(ae)) : (ae = tn(ae), P !== null && $u(P) && (ae = qu(ae))), de = !0;
                  break;
                case "E":
                  ye = !0;
                  var M = ST(ee[w].slice(1), { r: g, c: m });
                  S[g][m] = [S[g][m], M];
                  break;
                case "S":
                  Ue = !0, S[g][m] = [S[g][m], "S5S"];
                  break;
                case "G":
                  break;
                case "R":
                  et = parseInt(ee[w].slice(1)) - 1;
                  break;
                case "C":
                  lt = parseInt(ee[w].slice(1)) - 1;
                  break;
                default:
                  if (d && d.WTF)
                    throw new Error("SYLK bad record " + V);
              }
            if (de && (S[g][m] && S[g][m].length == 2 ? S[g][m][0] = ae : S[g][m] = ae, P = null), Ue) {
              if (ye)
                throw new Error("SYLK shared formula cannot have own formula");
              var C = et > -1 && S[et][lt];
              if (!C || !C[1])
                throw new Error("SYLK shared formula cannot find base");
              S[g][m][1] = bT(C[1], { r: g - et, c: m - lt });
            }
            break;
          case "F":
            var x = 0;
            for (w = 1; w < ee.length; ++w)
              switch (ee[w].charAt(0)) {
                case "X":
                  m = parseInt(ee[w].slice(1)) - 1, ++x;
                  break;
                case "Y":
                  for (g = parseInt(ee[w].slice(1)) - 1, H = S.length; H <= g; ++H)
                    S[H] = [];
                  break;
                case "M":
                  z = parseInt(ee[w].slice(1)) / 20;
                  break;
                case "F":
                  break;
                case "G":
                  break;
                case "P":
                  P = D[parseInt(ee[w].slice(1))];
                  break;
                case "S":
                  break;
                case "D":
                  break;
                case "N":
                  break;
                case "W":
                  for (R = ee[w].slice(1).split(" "), H = parseInt(R[0], 10); H <= parseInt(R[1], 10); ++H)
                    z = parseInt(R[2], 10), I[H - 1] = z === 0 ? { hidden: !0 } : { wch: z }, Ac(I[H - 1]);
                  break;
                case "C":
                  m = parseInt(ee[w].slice(1)) - 1, I[m] || (I[m] = {});
                  break;
                case "R":
                  g = parseInt(ee[w].slice(1)) - 1, O[g] || (O[g] = {}), z > 0 ? (O[g].hpt = z, O[g].hpx = Nd(z)) : z === 0 && (O[g].hidden = !0);
                  break;
                default:
                  if (d && d.WTF)
                    throw new Error("SYLK bad record " + V);
              }
            x < 1 && (P = null);
            break;
          default:
            if (d && d.WTF)
              throw new Error("SYLK bad record " + V);
        }
    }
    return O.length > 0 && (N["!rows"] = O), I.length > 0 && (N["!cols"] = I), d && d.sheetRows && (S = S.slice(0, d.sheetRows)), [S, N];
  }
  function a(u, d) {
    var p = i(u, d), g = p[0], m = p[1], v = Bi(g, d);
    return At(m).forEach(function(w) {
      v[w] = m[w];
    }), v;
  }
  function o(u, d) {
    return ii(a(u, d), d);
  }
  function l(u, d, p, g) {
    var m = "C;Y" + (p + 1) + ";X" + (g + 1) + ";K";
    switch (u.t) {
      case "n":
        m += u.v || 0, u.f && !u.F && (m += ";E" + Oc(u.f, { r: p, c: g }));
        break;
      case "b":
        m += u.v ? "TRUE" : "FALSE";
        break;
      case "e":
        m += u.w || u.v;
        break;
      case "d":
        m += '"' + (u.w || u.v) + '"';
        break;
      case "s":
        m += '"' + u.v.replace(/"/g, "").replace(/;/g, ";;") + '"';
        break;
    }
    return m;
  }
  function c(u, d) {
    d.forEach(function(p, g) {
      var m = "F;W" + (g + 1) + " " + (g + 1) + " ";
      p.hidden ? m += "0" : (typeof p.width == "number" && !p.wpx && (p.wpx = io(p.width)), typeof p.wpx == "number" && !p.wch && (p.wch = so(p.wpx)), typeof p.wch == "number" && (m += Math.round(p.wch))), m.charAt(m.length - 1) != " " && u.push(m);
    });
  }
  function f(u, d) {
    d.forEach(function(p, g) {
      var m = "F;";
      p.hidden ? m += "M0;" : p.hpt ? m += "M" + 20 * p.hpt + ";" : p.hpx && (m += "M" + 20 * ao(p.hpx) + ";"), m.length > 2 && u.push(m + "R" + (g + 1));
    });
  }
  function h(u, d) {
    var p = ["ID;PWXL;N;E"], g = [], m = je(u["!ref"]), v, w = Array.isArray(u), S = `\r
`;
    p.push("P;PGeneral"), p.push("F;P0;DG0G8;M255"), u["!cols"] && c(p, u["!cols"]), u["!rows"] && f(p, u["!rows"]), p.push("B;Y" + (m.e.r - m.s.r + 1) + ";X" + (m.e.c - m.s.c + 1) + ";D" + [m.s.c, m.s.r, m.e.c, m.e.r].join(" "));
    for (var D = m.s.r; D <= m.e.r; ++D)
      for (var P = m.s.c; P <= m.e.c; ++P) {
        var N = Le({ r: D, c: P });
        v = w ? (u[D] || [])[P] : u[N], !(!v || v.v == null && (!v.f || v.F)) && g.push(l(v, u, D, P));
      }
    return p.join(S) + S + g.join(S) + S + "E" + S;
  }
  return {
    to_workbook: o,
    to_sheet: a,
    from_sheet: h
  };
}(), Aw = /* @__PURE__ */ function() {
  function e(s, a) {
    switch (a.type) {
      case "base64":
        return t(sn(s), a);
      case "binary":
        return t(s, a);
      case "buffer":
        return t(Fe && Buffer.isBuffer(s) ? s.toString("binary") : Ys(s), a);
      case "array":
        return t(ko(s), a);
    }
    throw new Error("Unrecognized type " + a.type);
  }
  function t(s, a) {
    for (var o = s.split(`
`), l = -1, c = -1, f = 0, h = []; f !== o.length; ++f) {
      if (o[f].trim() === "BOT") {
        h[++l] = [], c = 0;
        continue;
      }
      if (!(l < 0)) {
        var u = o[f].trim().split(","), d = u[0], p = u[1];
        ++f;
        for (var g = o[f] || ""; (g.match(/["]/g) || []).length & 1 && f < o.length - 1; )
          g += `
` + o[++f];
        switch (g = g.trim(), +d) {
          case -1:
            if (g === "BOT") {
              h[++l] = [], c = 0;
              continue;
            } else if (g !== "EOD")
              throw new Error("Unrecognized DIF special command " + g);
            break;
          case 0:
            g === "TRUE" ? h[l][c] = !0 : g === "FALSE" ? h[l][c] = !1 : isNaN(tn(p)) ? isNaN(Ms(p).getDate()) ? h[l][c] = p : h[l][c] = Wt(p) : h[l][c] = tn(p), ++c;
            break;
          case 1:
            g = g.slice(1, g.length - 1), g = g.replace(/""/g, '"'), g && g.match(/^=".*"$/) && (g = g.slice(2, -1)), h[l][c++] = g !== "" ? g : null;
            break;
        }
        if (g === "EOD")
          break;
      }
    }
    return a && a.sheetRows && (h = h.slice(0, a.sheetRows)), h;
  }
  function r(s, a) {
    return Bi(e(s, a), a);
  }
  function n(s, a) {
    return ii(r(s, a), a);
  }
  var i = /* @__PURE__ */ function() {
    var s = function(l, c, f, h, u) {
      l.push(c), l.push(f + "," + h), l.push('"' + u.replace(/"/g, '""') + '"');
    }, a = function(l, c, f, h) {
      l.push(c + "," + f), l.push(c == 1 ? '"' + h.replace(/"/g, '""') + '"' : h);
    };
    return function(l) {
      var c = [], f = je(l["!ref"]), h, u = Array.isArray(l);
      s(c, "TABLE", 0, 1, "sheetjs"), s(c, "VECTORS", 0, f.e.r - f.s.r + 1, ""), s(c, "TUPLES", 0, f.e.c - f.s.c + 1, ""), s(c, "DATA", 0, 0, "");
      for (var d = f.s.r; d <= f.e.r; ++d) {
        a(c, -1, 0, "BOT");
        for (var p = f.s.c; p <= f.e.c; ++p) {
          var g = Le({ r: d, c: p });
          if (h = u ? (l[d] || [])[p] : l[g], !h) {
            a(c, 1, 0, "");
            continue;
          }
          switch (h.t) {
            case "n":
              var m = h.w;
              !m && h.v != null && (m = h.v), m == null ? h.f && !h.F ? a(c, 1, 0, "=" + h.f) : a(c, 1, 0, "") : a(c, 0, m, "V");
              break;
            case "b":
              a(c, 0, h.v ? 1 : 0, h.v ? "TRUE" : "FALSE");
              break;
            case "s":
              a(c, 1, 0, isNaN(h.v) ? h.v : '="' + h.v + '"');
              break;
            case "d":
              h.w || (h.w = En(h.z || it[14], $t(Wt(h.v)))), a(c, 0, h.w, "V");
              break;
            default:
              a(c, 1, 0, "");
          }
        }
      }
      a(c, -1, 0, "EOD");
      var v = `\r
`, w = c.join(v);
      return w;
    };
  }();
  return {
    to_workbook: n,
    to_sheet: r,
    from_sheet: i
  };
}(), Pd = /* @__PURE__ */ function() {
  function e(h) {
    return h.replace(/\\b/g, "\\").replace(/\\c/g, ":").replace(/\\n/g, `
`);
  }
  function t(h) {
    return h.replace(/\\/g, "\\b").replace(/:/g, "\\c").replace(/\n/g, "\\n");
  }
  function r(h, u) {
    for (var d = h.split(`
`), p = -1, g = -1, m = 0, v = []; m !== d.length; ++m) {
      var w = d[m].trim().split(":");
      if (w[0] === "cell") {
        var S = _t(w[1]);
        if (v.length <= S.r)
          for (p = v.length; p <= S.r; ++p)
            v[p] || (v[p] = []);
        switch (p = S.r, g = S.c, w[2]) {
          case "t":
            v[p][g] = e(w[3]);
            break;
          case "v":
            v[p][g] = +w[3];
            break;
          case "vtf":
            var D = w[w.length - 1];
          case "vtc":
            switch (w[3]) {
              case "nl":
                v[p][g] = !!+w[4];
                break;
              default:
                v[p][g] = +w[4];
                break;
            }
            w[2] == "vtf" && (v[p][g] = [v[p][g], D]);
        }
      }
    }
    return u && u.sheetRows && (v = v.slice(0, u.sheetRows)), v;
  }
  function n(h, u) {
    return Bi(r(h, u), u);
  }
  function i(h, u) {
    return ii(n(h, u), u);
  }
  var s = [
    "socialcalc:version:1.5",
    "MIME-Version: 1.0",
    "Content-Type: multipart/mixed; boundary=SocialCalcSpreadsheetControlSave"
  ].join(`
`), a = [
    "--SocialCalcSpreadsheetControlSave",
    "Content-type: text/plain; charset=UTF-8"
  ].join(`
`) + `
`, o = [
    "# SocialCalc Spreadsheet Control Save",
    "part:sheet"
  ].join(`
`), l = "--SocialCalcSpreadsheetControlSave--";
  function c(h) {
    if (!h || !h["!ref"])
      return "";
    for (var u = [], d = [], p, g = "", m = tr(h["!ref"]), v = Array.isArray(h), w = m.s.r; w <= m.e.r; ++w)
      for (var S = m.s.c; S <= m.e.c; ++S)
        if (g = Le({ r: w, c: S }), p = v ? (h[w] || [])[S] : h[g], !(!p || p.v == null || p.t === "z")) {
          switch (d = ["cell", g, "t"], p.t) {
            case "s":
            case "str":
              d.push(t(p.v));
              break;
            case "n":
              p.f ? (d[2] = "vtf", d[3] = "n", d[4] = p.v, d[5] = t(p.f)) : (d[2] = "v", d[3] = p.v);
              break;
            case "b":
              d[2] = "vt" + (p.f ? "f" : "c"), d[3] = "nl", d[4] = p.v ? "1" : "0", d[5] = t(p.f || (p.v ? "TRUE" : "FALSE"));
              break;
            case "d":
              var D = $t(Wt(p.v));
              d[2] = "vtc", d[3] = "nd", d[4] = "" + D, d[5] = p.w || En(p.z || it[14], D);
              break;
            case "e":
              continue;
          }
          u.push(d.join(":"));
        }
    return u.push("sheet:c:" + (m.e.c - m.s.c + 1) + ":r:" + (m.e.r - m.s.r + 1) + ":tvf:1"), u.push("valueformat:1:text-wiki"), u.join(`
`);
  }
  function f(h) {
    return [s, a, o, a, c(h), l].join(`
`);
  }
  return {
    to_workbook: i,
    to_sheet: n,
    from_sheet: f
  };
}(), kw = /* @__PURE__ */ function() {
  function e(f, h, u, d, p) {
    p.raw ? h[u][d] = f : f === "" || (f === "TRUE" ? h[u][d] = !0 : f === "FALSE" ? h[u][d] = !1 : isNaN(tn(f)) ? isNaN(Ms(f).getDate()) ? h[u][d] = f : h[u][d] = Wt(f) : h[u][d] = tn(f));
  }
  function t(f, h) {
    var u = h || {}, d = [];
    if (!f || f.length === 0)
      return d;
    for (var p = f.split(/[\r\n]/), g = p.length - 1; g >= 0 && p[g].length === 0; )
      --g;
    for (var m = 10, v = 0, w = 0; w <= g; ++w)
      v = p[w].indexOf(" "), v == -1 ? v = p[w].length : v++, m = Math.max(m, v);
    for (w = 0; w <= g; ++w) {
      d[w] = [];
      var S = 0;
      for (e(p[w].slice(0, m).trim(), d, w, S, u), S = 1; S <= (p[w].length - m) / 10 + 1; ++S)
        e(p[w].slice(m + (S - 1) * 10, m + S * 10).trim(), d, w, S, u);
    }
    return u.sheetRows && (d = d.slice(0, u.sheetRows)), d;
  }
  var r = {
    /*::[*/
    44: ",",
    /*::[*/
    9: "	",
    /*::[*/
    59: ";",
    /*::[*/
    124: "|"
  }, n = {
    /*::[*/
    44: 3,
    /*::[*/
    9: 2,
    /*::[*/
    59: 1,
    /*::[*/
    124: 0
  };
  function i(f) {
    for (var h = {}, u = !1, d = 0, p = 0; d < f.length; ++d)
      (p = f.charCodeAt(d)) == 34 ? u = !u : !u && p in r && (h[p] = (h[p] || 0) + 1);
    p = [];
    for (d in h)
      Object.prototype.hasOwnProperty.call(h, d) && p.push([h[d], d]);
    if (!p.length) {
      h = n;
      for (d in h)
        Object.prototype.hasOwnProperty.call(h, d) && p.push([h[d], d]);
    }
    return p.sort(function(g, m) {
      return g[0] - m[0] || n[g[1]] - n[m[1]];
    }), r[p.pop()[1]] || 44;
  }
  function s(f, h) {
    var u = h || {}, d = "", p = u.dense ? [] : {}, g = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };
    f.slice(0, 4) == "sep=" ? f.charCodeAt(5) == 13 && f.charCodeAt(6) == 10 ? (d = f.charAt(4), f = f.slice(7)) : f.charCodeAt(5) == 13 || f.charCodeAt(5) == 10 ? (d = f.charAt(4), f = f.slice(6)) : d = i(f.slice(0, 1024)) : u && u.FS ? d = u.FS : d = i(f.slice(0, 1024));
    var m = 0, v = 0, w = 0, S = 0, D = 0, P = d.charCodeAt(0), N = !1, O = 0, I = f.charCodeAt(0);
    f = f.replace(/\r\n/mg, `
`);
    var R = u.dateNF != null ? V2(u.dateNF) : null;
    function z() {
      var H = f.slice(S, D), V = {};
      if (H.charAt(0) == '"' && H.charAt(H.length - 1) == '"' && (H = H.slice(1, -1).replace(/""/g, '"')), H.length === 0)
        V.t = "z";
      else if (u.raw)
        V.t = "s", V.v = H;
      else if (H.trim().length === 0)
        V.t = "s", V.v = H;
      else if (H.charCodeAt(0) == 61)
        H.charCodeAt(1) == 34 && H.charCodeAt(H.length - 1) == 34 ? (V.t = "s", V.v = H.slice(2, -1).replace(/""/g, '"')) : ET(H) ? (V.t = "n", V.f = H.slice(1)) : (V.t = "s", V.v = H);
      else if (H == "TRUE")
        V.t = "b", V.v = !0;
      else if (H == "FALSE")
        V.t = "b", V.v = !1;
      else if (!isNaN(w = tn(H)))
        V.t = "n", u.cellText !== !1 && (V.w = H), V.v = w;
      else if (!isNaN(Ms(H).getDate()) || R && H.match(R)) {
        V.z = u.dateNF || it[14];
        var ee = 0;
        R && H.match(R) && (H = Y2(H, u.dateNF, H.match(R) || []), ee = 1), u.cellDates ? (V.t = "d", V.v = Wt(H, ee)) : (V.t = "n", V.v = $t(Wt(H, ee))), u.cellText !== !1 && (V.w = En(V.z, V.v instanceof Date ? $t(V.v) : V.v)), u.cellNF || delete V.z;
      } else
        V.t = "s", V.v = H;
      if (V.t == "z" || (u.dense ? (p[m] || (p[m] = []), p[m][v] = V) : p[Le({ c: v, r: m })] = V), S = D + 1, I = f.charCodeAt(S), g.e.c < v && (g.e.c = v), g.e.r < m && (g.e.r = m), O == P)
        ++v;
      else if (v = 0, ++m, u.sheetRows && u.sheetRows <= m)
        return !0;
    }
    e:
      for (; D < f.length; ++D)
        switch (O = f.charCodeAt(D)) {
          case 34:
            I === 34 && (N = !N);
            break;
          case P:
          case 10:
          case 13:
            if (!N && z())
              break e;
            break;
        }
    return D - S > 0 && z(), p["!ref"] = ht(g), p;
  }
  function a(f, h) {
    return !(h && h.PRN) || h.FS || f.slice(0, 4) == "sep=" || f.indexOf("	") >= 0 || f.indexOf(",") >= 0 || f.indexOf(";") >= 0 ? s(f, h) : Bi(t(f, h), h);
  }
  function o(f, h) {
    var u = "", d = h.type == "string" ? [0, 0, 0, 0] : WA(f, h);
    switch (h.type) {
      case "base64":
        u = sn(f);
        break;
      case "binary":
        u = f;
        break;
      case "buffer":
        h.codepage == 65001 ? u = f.toString("utf8") : h.codepage && typeof Un < "u" ? u = Un.utils.decode(h.codepage, f) : u = Fe && Buffer.isBuffer(f) ? f.toString("binary") : Ys(f);
        break;
      case "array":
        u = ko(f);
        break;
      case "string":
        u = f;
        break;
      default:
        throw new Error("Unrecognized type " + h.type);
    }
    return d[0] == 239 && d[1] == 187 && d[2] == 191 ? u = ms(u.slice(3)) : h.type != "string" && h.type != "buffer" && h.codepage == 65001 ? u = ms(u) : h.type == "binary" && typeof Un < "u" && h.codepage && (u = Un.utils.decode(h.codepage, Un.utils.encode(28591, u))), u.slice(0, 19) == "socialcalc:version:" ? Pd.to_sheet(h.type == "string" ? u : ms(u), h) : a(u, h);
  }
  function l(f, h) {
    return ii(o(f, h), h);
  }
  function c(f) {
    for (var h = [], u = je(f["!ref"]), d, p = Array.isArray(f), g = u.s.r; g <= u.e.r; ++g) {
      for (var m = [], v = u.s.c; v <= u.e.c; ++v) {
        var w = Le({ r: g, c: v });
        if (d = p ? (f[g] || [])[v] : f[w], !d || d.v == null) {
          m.push("          ");
          continue;
        }
        for (var S = (d.w || (an(d), d.w) || "").slice(0, 10); S.length < 10; )
          S += " ";
        m.push(S + (v === 0 ? " " : ""));
      }
      h.push(m.join(""));
    }
    return h.join(`
`);
  }
  return {
    to_workbook: l,
    to_sheet: o,
    from_sheet: c
  };
}(), g0 = /* @__PURE__ */ function() {
  function e(M, C, x) {
    if (M) {
      Zt(M, M.l || 0);
      for (var k = x.Enum || et; M.l < M.length; ) {
        var F = M.read_shift(2), Y = k[F] || k[65535], Z = M.read_shift(2), K = M.l + Z, j = Y.f && Y.f(M, Z, x);
        if (M.l = K, C(j, Y, F))
          return;
      }
    }
  }
  function t(M, C) {
    switch (C.type) {
      case "base64":
        return r(gr(sn(M)), C);
      case "binary":
        return r(gr(M), C);
      case "buffer":
      case "array":
        return r(M, C);
    }
    throw "Unsupported type " + C.type;
  }
  function r(M, C) {
    if (!M)
      return M;
    var x = C || {}, k = x.dense ? [] : {}, F = "Sheet1", Y = "", Z = 0, K = {}, j = [], Ae = [], we = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }, Lt = x.sheetRows || 0;
    if (M[2] == 0 && (M[3] == 8 || M[3] == 9) && M.length >= 16 && M[14] == 5 && M[15] === 108)
      throw new Error("Unsupported Works 3 for Mac file");
    if (M[2] == 2)
      x.Enum = et, e(M, function(he, nr, Br) {
        switch (Br) {
          case 0:
            x.vers = he, he >= 4096 && (x.qpro = !0);
            break;
          case 6:
            we = he;
            break;
          case 204:
            he && (Y = he);
            break;
          case 222:
            Y = he;
            break;
          case 15:
          case 51:
            x.qpro || (he[1].v = he[1].v.slice(1));
          case 13:
          case 14:
          case 16:
            Br == 14 && (he[2] & 112) == 112 && (he[2] & 15) > 1 && (he[2] & 15) < 15 && (he[1].z = x.dateNF || it[14], x.cellDates && (he[1].t = "d", he[1].v = qu(he[1].v))), x.qpro && he[3] > Z && (k["!ref"] = ht(we), K[F] = k, j.push(F), k = x.dense ? [] : {}, we = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }, Z = he[3], F = Y || "Sheet" + (Z + 1), Y = "");
            var Fn = x.dense ? (k[he[0].r] || [])[he[0].c] : k[Le(he[0])];
            if (Fn) {
              Fn.t = he[1].t, Fn.v = he[1].v, he[1].z != null && (Fn.z = he[1].z), he[1].f != null && (Fn.f = he[1].f);
              break;
            }
            x.dense ? (k[he[0].r] || (k[he[0].r] = []), k[he[0].r][he[0].c] = he[1]) : k[Le(he[0])] = he[1];
            break;
        }
      }, x);
    else if (M[2] == 26 || M[2] == 14)
      x.Enum = lt, M[2] == 14 && (x.qpro = !0, M.l = 0), e(M, function(he, nr, Br) {
        switch (Br) {
          case 204:
            F = he;
            break;
          case 22:
            he[1].v = he[1].v.slice(1);
          case 23:
          case 24:
          case 25:
          case 37:
          case 39:
          case 40:
            if (he[3] > Z && (k["!ref"] = ht(we), K[F] = k, j.push(F), k = x.dense ? [] : {}, we = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }, Z = he[3], F = "Sheet" + (Z + 1)), Lt > 0 && he[0].r >= Lt)
              break;
            x.dense ? (k[he[0].r] || (k[he[0].r] = []), k[he[0].r][he[0].c] = he[1]) : k[Le(he[0])] = he[1], we.e.c < he[0].c && (we.e.c = he[0].c), we.e.r < he[0].r && (we.e.r = he[0].r);
            break;
          case 27:
            he[14e3] && (Ae[he[14e3][0]] = he[14e3][1]);
            break;
          case 1537:
            Ae[he[0]] = he[1], he[0] == Z && (F = he[1]);
            break;
        }
      }, x);
    else
      throw new Error("Unrecognized LOTUS BOF " + M[2]);
    if (k["!ref"] = ht(we), K[Y || F] = k, j.push(Y || F), !Ae.length)
      return { SheetNames: j, Sheets: K };
    for (var Ce = {}, Nr = [], tt = 0; tt < Ae.length; ++tt)
      K[j[tt]] ? (Nr.push(Ae[tt] || j[tt]), Ce[Ae[tt]] = K[Ae[tt]] || K[j[tt]]) : (Nr.push(Ae[tt]), Ce[Ae[tt]] = { "!ref": "A1" });
    return { SheetNames: Nr, Sheets: Ce };
  }
  function n(M, C) {
    var x = C || {};
    if (+x.codepage >= 0 && Fs(+x.codepage), x.type == "string")
      throw new Error("Cannot write WK1 to JS string");
    var k = jt(), F = je(M["!ref"]), Y = Array.isArray(M), Z = [];
    ne(k, 0, s(1030)), ne(k, 6, l(F));
    for (var K = Math.min(F.e.r, 8191), j = F.s.r; j <= K; ++j)
      for (var Ae = bt(j), we = F.s.c; we <= F.e.c; ++we) {
        j === F.s.r && (Z[we] = Ct(we));
        var Lt = Z[we] + Ae, Ce = Y ? (M[j] || [])[we] : M[Lt];
        if (!(!Ce || Ce.t == "z"))
          if (Ce.t == "n")
            (Ce.v | 0) == Ce.v && Ce.v >= -32768 && Ce.v <= 32767 ? ne(k, 13, d(j, we, Ce.v)) : ne(k, 14, g(j, we, Ce.v));
          else {
            var Nr = an(Ce);
            ne(k, 15, h(j, we, Nr.slice(0, 239)));
          }
      }
    return ne(k, 1), k.end();
  }
  function i(M, C) {
    var x = C || {};
    if (+x.codepage >= 0 && Fs(+x.codepage), x.type == "string")
      throw new Error("Cannot write WK3 to JS string");
    var k = jt();
    ne(k, 0, a(M));
    for (var F = 0, Y = 0; F < M.SheetNames.length; ++F)
      (M.Sheets[M.SheetNames[F]] || {})["!ref"] && ne(k, 27, ye(M.SheetNames[F], Y++));
    var Z = 0;
    for (F = 0; F < M.SheetNames.length; ++F) {
      var K = M.Sheets[M.SheetNames[F]];
      if (!(!K || !K["!ref"])) {
        for (var j = je(K["!ref"]), Ae = Array.isArray(K), we = [], Lt = Math.min(j.e.r, 8191), Ce = j.s.r; Ce <= Lt; ++Ce)
          for (var Nr = bt(Ce), tt = j.s.c; tt <= j.e.c; ++tt) {
            Ce === j.s.r && (we[tt] = Ct(tt));
            var he = we[tt] + Nr, nr = Ae ? (K[Ce] || [])[tt] : K[he];
            if (!(!nr || nr.t == "z"))
              if (nr.t == "n")
                ne(k, 23, z(Ce, tt, Z, nr.v));
              else {
                var Br = an(nr);
                ne(k, 22, O(Ce, tt, Z, Br.slice(0, 239)));
              }
          }
        ++Z;
      }
    }
    return ne(k, 1), k.end();
  }
  function s(M) {
    var C = G(2);
    return C.write_shift(2, M), C;
  }
  function a(M) {
    var C = G(26);
    C.write_shift(2, 4096), C.write_shift(2, 4), C.write_shift(4, 0);
    for (var x = 0, k = 0, F = 0, Y = 0; Y < M.SheetNames.length; ++Y) {
      var Z = M.SheetNames[Y], K = M.Sheets[Z];
      if (!(!K || !K["!ref"])) {
        ++F;
        var j = tr(K["!ref"]);
        x < j.e.r && (x = j.e.r), k < j.e.c && (k = j.e.c);
      }
    }
    return x > 8191 && (x = 8191), C.write_shift(2, x), C.write_shift(1, F), C.write_shift(1, k), C.write_shift(2, 0), C.write_shift(2, 0), C.write_shift(1, 1), C.write_shift(1, 2), C.write_shift(4, 0), C.write_shift(4, 0), C;
  }
  function o(M, C, x) {
    var k = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };
    return C == 8 && x.qpro ? (k.s.c = M.read_shift(1), M.l++, k.s.r = M.read_shift(2), k.e.c = M.read_shift(1), M.l++, k.e.r = M.read_shift(2), k) : (k.s.c = M.read_shift(2), k.s.r = M.read_shift(2), C == 12 && x.qpro && (M.l += 2), k.e.c = M.read_shift(2), k.e.r = M.read_shift(2), C == 12 && x.qpro && (M.l += 2), k.s.c == 65535 && (k.s.c = k.e.c = k.s.r = k.e.r = 0), k);
  }
  function l(M) {
    var C = G(8);
    return C.write_shift(2, M.s.c), C.write_shift(2, M.s.r), C.write_shift(2, M.e.c), C.write_shift(2, M.e.r), C;
  }
  function c(M, C, x) {
    var k = [{ c: 0, r: 0 }, { t: "n", v: 0 }, 0, 0];
    return x.qpro && x.vers != 20768 ? (k[0].c = M.read_shift(1), k[3] = M.read_shift(1), k[0].r = M.read_shift(2), M.l += 2) : (k[2] = M.read_shift(1), k[0].c = M.read_shift(2), k[0].r = M.read_shift(2)), k;
  }
  function f(M, C, x) {
    var k = M.l + C, F = c(M, C, x);
    if (F[1].t = "s", x.vers == 20768) {
      M.l++;
      var Y = M.read_shift(1);
      return F[1].v = M.read_shift(Y, "utf8"), F;
    }
    return x.qpro && M.l++, F[1].v = M.read_shift(k - M.l, "cstr"), F;
  }
  function h(M, C, x) {
    var k = G(7 + x.length);
    k.write_shift(1, 255), k.write_shift(2, C), k.write_shift(2, M), k.write_shift(1, 39);
    for (var F = 0; F < k.length; ++F) {
      var Y = x.charCodeAt(F);
      k.write_shift(1, Y >= 128 ? 95 : Y);
    }
    return k.write_shift(1, 0), k;
  }
  function u(M, C, x) {
    var k = c(M, C, x);
    return k[1].v = M.read_shift(2, "i"), k;
  }
  function d(M, C, x) {
    var k = G(7);
    return k.write_shift(1, 255), k.write_shift(2, C), k.write_shift(2, M), k.write_shift(2, x, "i"), k;
  }
  function p(M, C, x) {
    var k = c(M, C, x);
    return k[1].v = M.read_shift(8, "f"), k;
  }
  function g(M, C, x) {
    var k = G(13);
    return k.write_shift(1, 255), k.write_shift(2, C), k.write_shift(2, M), k.write_shift(8, x, "f"), k;
  }
  function m(M, C, x) {
    var k = M.l + C, F = c(M, C, x);
    if (F[1].v = M.read_shift(8, "f"), x.qpro)
      M.l = k;
    else {
      var Y = M.read_shift(2);
      D(M.slice(M.l, M.l + Y), F), M.l += Y;
    }
    return F;
  }
  function v(M, C, x) {
    var k = C & 32768;
    return C &= -32769, C = (k ? M : 0) + (C >= 8192 ? C - 16384 : C), (k ? "" : "$") + (x ? Ct(C) : bt(C));
  }
  var w = {
    51: ["FALSE", 0],
    52: ["TRUE", 0],
    70: ["LEN", 1],
    80: ["SUM", 69],
    81: ["AVERAGEA", 69],
    82: ["COUNTA", 69],
    83: ["MINA", 69],
    84: ["MAXA", 69],
    111: ["T", 1]
  }, S = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    // eslint-disable-line no-mixed-spaces-and-tabs
    "",
    "+",
    "-",
    "*",
    "/",
    "^",
    "=",
    "<>",
    // eslint-disable-line no-mixed-spaces-and-tabs
    "<=",
    ">=",
    "<",
    ">",
    "",
    "",
    "",
    "",
    // eslint-disable-line no-mixed-spaces-and-tabs
    "&",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
    // eslint-disable-line no-mixed-spaces-and-tabs
  ];
  function D(M, C) {
    Zt(M, 0);
    for (var x = [], k = 0, F = "", Y = "", Z = "", K = ""; M.l < M.length; ) {
      var j = M[M.l++];
      switch (j) {
        case 0:
          x.push(M.read_shift(8, "f"));
          break;
        case 1:
          Y = v(C[0].c, M.read_shift(2), !0), F = v(C[0].r, M.read_shift(2), !1), x.push(Y + F);
          break;
        case 2:
          {
            var Ae = v(C[0].c, M.read_shift(2), !0), we = v(C[0].r, M.read_shift(2), !1);
            Y = v(C[0].c, M.read_shift(2), !0), F = v(C[0].r, M.read_shift(2), !1), x.push(Ae + we + ":" + Y + F);
          }
          break;
        case 3:
          if (M.l < M.length) {
            console.error("WK1 premature formula end");
            return;
          }
          break;
        case 4:
          x.push("(" + x.pop() + ")");
          break;
        case 5:
          x.push(M.read_shift(2));
          break;
        case 6:
          {
            for (var Lt = ""; j = M[M.l++]; )
              Lt += String.fromCharCode(j);
            x.push('"' + Lt.replace(/"/g, '""') + '"');
          }
          break;
        case 8:
          x.push("-" + x.pop());
          break;
        case 23:
          x.push("+" + x.pop());
          break;
        case 22:
          x.push("NOT(" + x.pop() + ")");
          break;
        case 20:
        case 21:
          K = x.pop(), Z = x.pop(), x.push(["AND", "OR"][j - 20] + "(" + Z + "," + K + ")");
          break;
        default:
          if (j < 32 && S[j])
            K = x.pop(), Z = x.pop(), x.push(Z + S[j] + K);
          else if (w[j]) {
            if (k = w[j][1], k == 69 && (k = M[M.l++]), k > x.length) {
              console.error("WK1 bad formula parse 0x" + j.toString(16) + ":|" + x.join("|") + "|");
              return;
            }
            var Ce = x.slice(-k);
            x.length -= k, x.push(w[j][0] + "(" + Ce.join(",") + ")");
          } else
            return j <= 7 ? console.error("WK1 invalid opcode " + j.toString(16)) : j <= 24 ? console.error("WK1 unsupported op " + j.toString(16)) : j <= 30 ? console.error("WK1 invalid opcode " + j.toString(16)) : j <= 115 ? console.error("WK1 unsupported function opcode " + j.toString(16)) : console.error("WK1 unrecognized opcode " + j.toString(16));
      }
    }
    x.length == 1 ? C[1].f = "" + x[0] : console.error("WK1 bad formula parse |" + x.join("|") + "|");
  }
  function P(M) {
    var C = [{ c: 0, r: 0 }, { t: "n", v: 0 }, 0];
    return C[0].r = M.read_shift(2), C[3] = M[M.l++], C[0].c = M[M.l++], C;
  }
  function N(M, C) {
    var x = P(M);
    return x[1].t = "s", x[1].v = M.read_shift(C - 4, "cstr"), x;
  }
  function O(M, C, x, k) {
    var F = G(6 + k.length);
    F.write_shift(2, M), F.write_shift(1, x), F.write_shift(1, C), F.write_shift(1, 39);
    for (var Y = 0; Y < k.length; ++Y) {
      var Z = k.charCodeAt(Y);
      F.write_shift(1, Z >= 128 ? 95 : Z);
    }
    return F.write_shift(1, 0), F;
  }
  function I(M, C) {
    var x = P(M);
    x[1].v = M.read_shift(2);
    var k = x[1].v >> 1;
    if (x[1].v & 1)
      switch (k & 7) {
        case 0:
          k = (k >> 3) * 5e3;
          break;
        case 1:
          k = (k >> 3) * 500;
          break;
        case 2:
          k = (k >> 3) / 20;
          break;
        case 3:
          k = (k >> 3) / 200;
          break;
        case 4:
          k = (k >> 3) / 2e3;
          break;
        case 5:
          k = (k >> 3) / 2e4;
          break;
        case 6:
          k = (k >> 3) / 16;
          break;
        case 7:
          k = (k >> 3) / 64;
          break;
      }
    return x[1].v = k, x;
  }
  function R(M, C) {
    var x = P(M), k = M.read_shift(4), F = M.read_shift(4), Y = M.read_shift(2);
    if (Y == 65535)
      return k === 0 && F === 3221225472 ? (x[1].t = "e", x[1].v = 15) : k === 0 && F === 3489660928 ? (x[1].t = "e", x[1].v = 42) : x[1].v = 0, x;
    var Z = Y & 32768;
    return Y = (Y & 32767) - 16446, x[1].v = (1 - Z * 2) * (F * Math.pow(2, Y + 32) + k * Math.pow(2, Y)), x;
  }
  function z(M, C, x, k) {
    var F = G(14);
    if (F.write_shift(2, M), F.write_shift(1, x), F.write_shift(1, C), k == 0)
      return F.write_shift(4, 0), F.write_shift(4, 0), F.write_shift(2, 65535), F;
    var Y = 0, Z = 0, K = 0, j = 0;
    return k < 0 && (Y = 1, k = -k), Z = Math.log2(k) | 0, k /= Math.pow(2, Z - 31), j = k >>> 0, j & 2147483648 || (k /= 2, ++Z, j = k >>> 0), k -= j, j |= 2147483648, j >>>= 0, k *= Math.pow(2, 32), K = k >>> 0, F.write_shift(4, K), F.write_shift(4, j), Z += 16383 + (Y ? 32768 : 0), F.write_shift(2, Z), F;
  }
  function H(M, C) {
    var x = R(M);
    return M.l += C - 14, x;
  }
  function V(M, C) {
    var x = P(M), k = M.read_shift(4);
    return x[1].v = k >> 6, x;
  }
  function ee(M, C) {
    var x = P(M), k = M.read_shift(8, "f");
    return x[1].v = k, x;
  }
  function ge(M, C) {
    var x = ee(M);
    return M.l += C - 10, x;
  }
  function ae(M, C) {
    return M[M.l + C - 1] == 0 ? M.read_shift(C, "cstr") : "";
  }
  function de(M, C) {
    var x = M[M.l++];
    x > C - 1 && (x = C - 1);
    for (var k = ""; k.length < x; )
      k += String.fromCharCode(M[M.l++]);
    return k;
  }
  function pe(M, C, x) {
    if (!(!x.qpro || C < 21)) {
      var k = M.read_shift(1);
      M.l += 17, M.l += 1, M.l += 2;
      var F = M.read_shift(C - 21, "cstr");
      return [k, F];
    }
  }
  function Ue(M, C) {
    for (var x = {}, k = M.l + C; M.l < k; ) {
      var F = M.read_shift(2);
      if (F == 14e3) {
        for (x[F] = [0, ""], x[F][0] = M.read_shift(2); M[M.l]; )
          x[F][1] += String.fromCharCode(M[M.l]), M.l++;
        M.l++;
      }
    }
    return x;
  }
  function ye(M, C) {
    var x = G(5 + M.length);
    x.write_shift(2, 14e3), x.write_shift(2, C);
    for (var k = 0; k < M.length; ++k) {
      var F = M.charCodeAt(k);
      x[x.l++] = F > 127 ? 95 : F;
    }
    return x[x.l++] = 0, x;
  }
  var et = {
    /*::[*/
    0: { n: "BOF", f: Od },
    /*::[*/
    1: { n: "EOF" },
    /*::[*/
    2: { n: "CALCMODE" },
    /*::[*/
    3: { n: "CALCORDER" },
    /*::[*/
    4: { n: "SPLIT" },
    /*::[*/
    5: { n: "SYNC" },
    /*::[*/
    6: { n: "RANGE", f: o },
    /*::[*/
    7: { n: "WINDOW1" },
    /*::[*/
    8: { n: "COLW1" },
    /*::[*/
    9: { n: "WINTWO" },
    /*::[*/
    10: { n: "COLW2" },
    /*::[*/
    11: { n: "NAME" },
    /*::[*/
    12: { n: "BLANK" },
    /*::[*/
    13: { n: "INTEGER", f: u },
    /*::[*/
    14: { n: "NUMBER", f: p },
    /*::[*/
    15: { n: "LABEL", f },
    /*::[*/
    16: { n: "FORMULA", f: m },
    /*::[*/
    24: { n: "TABLE" },
    /*::[*/
    25: { n: "ORANGE" },
    /*::[*/
    26: { n: "PRANGE" },
    /*::[*/
    27: { n: "SRANGE" },
    /*::[*/
    28: { n: "FRANGE" },
    /*::[*/
    29: { n: "KRANGE1" },
    /*::[*/
    32: { n: "HRANGE" },
    /*::[*/
    35: { n: "KRANGE2" },
    /*::[*/
    36: { n: "PROTEC" },
    /*::[*/
    37: { n: "FOOTER" },
    /*::[*/
    38: { n: "HEADER" },
    /*::[*/
    39: { n: "SETUP" },
    /*::[*/
    40: { n: "MARGINS" },
    /*::[*/
    41: { n: "LABELFMT" },
    /*::[*/
    42: { n: "TITLES" },
    /*::[*/
    43: { n: "SHEETJS" },
    /*::[*/
    45: { n: "GRAPH" },
    /*::[*/
    46: { n: "NGRAPH" },
    /*::[*/
    47: { n: "CALCCOUNT" },
    /*::[*/
    48: { n: "UNFORMATTED" },
    /*::[*/
    49: { n: "CURSORW12" },
    /*::[*/
    50: { n: "WINDOW" },
    /*::[*/
    51: { n: "STRING", f },
    /*::[*/
    55: { n: "PASSWORD" },
    /*::[*/
    56: { n: "LOCKED" },
    /*::[*/
    60: { n: "QUERY" },
    /*::[*/
    61: { n: "QUERYNAME" },
    /*::[*/
    62: { n: "PRINT" },
    /*::[*/
    63: { n: "PRINTNAME" },
    /*::[*/
    64: { n: "GRAPH2" },
    /*::[*/
    65: { n: "GRAPHNAME" },
    /*::[*/
    66: { n: "ZOOM" },
    /*::[*/
    67: { n: "SYMSPLIT" },
    /*::[*/
    68: { n: "NSROWS" },
    /*::[*/
    69: { n: "NSCOLS" },
    /*::[*/
    70: { n: "RULER" },
    /*::[*/
    71: { n: "NNAME" },
    /*::[*/
    72: { n: "ACOMM" },
    /*::[*/
    73: { n: "AMACRO" },
    /*::[*/
    74: { n: "PARSE" },
    /*::[*/
    102: { n: "PRANGES??" },
    /*::[*/
    103: { n: "RRANGES??" },
    /*::[*/
    104: { n: "FNAME??" },
    /*::[*/
    105: { n: "MRANGES??" },
    /*::[*/
    204: { n: "SHEETNAMECS", f: ae },
    /*::[*/
    222: { n: "SHEETNAMELP", f: de },
    /*::[*/
    65535: { n: "" }
  }, lt = {
    /*::[*/
    0: { n: "BOF" },
    /*::[*/
    1: { n: "EOF" },
    /*::[*/
    2: { n: "PASSWORD" },
    /*::[*/
    3: { n: "CALCSET" },
    /*::[*/
    4: { n: "WINDOWSET" },
    /*::[*/
    5: { n: "SHEETCELLPTR" },
    /*::[*/
    6: { n: "SHEETLAYOUT" },
    /*::[*/
    7: { n: "COLUMNWIDTH" },
    /*::[*/
    8: { n: "HIDDENCOLUMN" },
    /*::[*/
    9: { n: "USERRANGE" },
    /*::[*/
    10: { n: "SYSTEMRANGE" },
    /*::[*/
    11: { n: "ZEROFORCE" },
    /*::[*/
    12: { n: "SORTKEYDIR" },
    /*::[*/
    13: { n: "FILESEAL" },
    /*::[*/
    14: { n: "DATAFILLNUMS" },
    /*::[*/
    15: { n: "PRINTMAIN" },
    /*::[*/
    16: { n: "PRINTSTRING" },
    /*::[*/
    17: { n: "GRAPHMAIN" },
    /*::[*/
    18: { n: "GRAPHSTRING" },
    /*::[*/
    19: { n: "??" },
    /*::[*/
    20: { n: "ERRCELL" },
    /*::[*/
    21: { n: "NACELL" },
    /*::[*/
    22: { n: "LABEL16", f: N },
    /*::[*/
    23: { n: "NUMBER17", f: R },
    /*::[*/
    24: { n: "NUMBER18", f: I },
    /*::[*/
    25: { n: "FORMULA19", f: H },
    /*::[*/
    26: { n: "FORMULA1A" },
    /*::[*/
    27: { n: "XFORMAT", f: Ue },
    /*::[*/
    28: { n: "DTLABELMISC" },
    /*::[*/
    29: { n: "DTLABELCELL" },
    /*::[*/
    30: { n: "GRAPHWINDOW" },
    /*::[*/
    31: { n: "CPA" },
    /*::[*/
    32: { n: "LPLAUTO" },
    /*::[*/
    33: { n: "QUERY" },
    /*::[*/
    34: { n: "HIDDENSHEET" },
    /*::[*/
    35: { n: "??" },
    /*::[*/
    37: { n: "NUMBER25", f: V },
    /*::[*/
    38: { n: "??" },
    /*::[*/
    39: { n: "NUMBER27", f: ee },
    /*::[*/
    40: { n: "FORMULA28", f: ge },
    /*::[*/
    142: { n: "??" },
    /*::[*/
    147: { n: "??" },
    /*::[*/
    150: { n: "??" },
    /*::[*/
    151: { n: "??" },
    /*::[*/
    152: { n: "??" },
    /*::[*/
    153: { n: "??" },
    /*::[*/
    154: { n: "??" },
    /*::[*/
    155: { n: "??" },
    /*::[*/
    156: { n: "??" },
    /*::[*/
    163: { n: "??" },
    /*::[*/
    174: { n: "??" },
    /*::[*/
    175: { n: "??" },
    /*::[*/
    176: { n: "??" },
    /*::[*/
    177: { n: "??" },
    /*::[*/
    184: { n: "??" },
    /*::[*/
    185: { n: "??" },
    /*::[*/
    186: { n: "??" },
    /*::[*/
    187: { n: "??" },
    /*::[*/
    188: { n: "??" },
    /*::[*/
    195: { n: "??" },
    /*::[*/
    201: { n: "??" },
    /*::[*/
    204: { n: "SHEETNAMECS", f: ae },
    /*::[*/
    205: { n: "??" },
    /*::[*/
    206: { n: "??" },
    /*::[*/
    207: { n: "??" },
    /*::[*/
    208: { n: "??" },
    /*::[*/
    256: { n: "??" },
    /*::[*/
    259: { n: "??" },
    /*::[*/
    260: { n: "??" },
    /*::[*/
    261: { n: "??" },
    /*::[*/
    262: { n: "??" },
    /*::[*/
    263: { n: "??" },
    /*::[*/
    265: { n: "??" },
    /*::[*/
    266: { n: "??" },
    /*::[*/
    267: { n: "??" },
    /*::[*/
    268: { n: "??" },
    /*::[*/
    270: { n: "??" },
    /*::[*/
    271: { n: "??" },
    /*::[*/
    384: { n: "??" },
    /*::[*/
    389: { n: "??" },
    /*::[*/
    390: { n: "??" },
    /*::[*/
    393: { n: "??" },
    /*::[*/
    396: { n: "??" },
    /*::[*/
    512: { n: "??" },
    /*::[*/
    514: { n: "??" },
    /*::[*/
    513: { n: "??" },
    /*::[*/
    516: { n: "??" },
    /*::[*/
    517: { n: "??" },
    /*::[*/
    640: { n: "??" },
    /*::[*/
    641: { n: "??" },
    /*::[*/
    642: { n: "??" },
    /*::[*/
    643: { n: "??" },
    /*::[*/
    644: { n: "??" },
    /*::[*/
    645: { n: "??" },
    /*::[*/
    646: { n: "??" },
    /*::[*/
    647: { n: "??" },
    /*::[*/
    648: { n: "??" },
    /*::[*/
    658: { n: "??" },
    /*::[*/
    659: { n: "??" },
    /*::[*/
    660: { n: "??" },
    /*::[*/
    661: { n: "??" },
    /*::[*/
    662: { n: "??" },
    /*::[*/
    665: { n: "??" },
    /*::[*/
    666: { n: "??" },
    /*::[*/
    768: { n: "??" },
    /*::[*/
    772: { n: "??" },
    /*::[*/
    1537: { n: "SHEETINFOQP", f: pe },
    /*::[*/
    1600: { n: "??" },
    /*::[*/
    1602: { n: "??" },
    /*::[*/
    1793: { n: "??" },
    /*::[*/
    1794: { n: "??" },
    /*::[*/
    1795: { n: "??" },
    /*::[*/
    1796: { n: "??" },
    /*::[*/
    1920: { n: "??" },
    /*::[*/
    2048: { n: "??" },
    /*::[*/
    2049: { n: "??" },
    /*::[*/
    2052: { n: "??" },
    /*::[*/
    2688: { n: "??" },
    /*::[*/
    10998: { n: "??" },
    /*::[*/
    12849: { n: "??" },
    /*::[*/
    28233: { n: "??" },
    /*::[*/
    28484: { n: "??" },
    /*::[*/
    65535: { n: "" }
  };
  return {
    sheet_to_wk1: n,
    book_to_wk3: i,
    to_workbook: t
  };
}(), Ow = /^\s|\s$|[\t\n\r]/;
function Rd(e, t) {
  if (!t.bookSST)
    return "";
  var r = [ut];
  r[r.length] = re("sst", null, {
    xmlns: Ni[0],
    count: e.Count,
    uniqueCount: e.Unique
  });
  for (var n = 0; n != e.length; ++n)
    if (e[n] != null) {
      var i = e[n], s = "<si>";
      i.r ? s += i.r : (s += "<t", i.t || (i.t = ""), i.t.match(Ow) && (s += ' xml:space="preserve"'), s += ">" + Ie(i.t) + "</t>"), s += "</si>", r[r.length] = s;
    }
  return r.length > 2 && (r[r.length] = "</sst>", r[1] = r[1].replace("/>", ">")), r.join("");
}
function Dw(e) {
  return [e.read_shift(4), e.read_shift(4)];
}
function Fw(e, t) {
  return t || (t = G(8)), t.write_shift(4, e.Count), t.write_shift(4, e.Unique), t;
}
var Cw = wy;
function Mw(e) {
  var t = jt();
  q(t, 159, Fw(e));
  for (var r = 0; r < e.length; ++r)
    q(t, 19, Cw(e[r]));
  return q(
    t,
    160
    /* BrtEndSst */
  ), t.end();
}
function Pw(e) {
  for (var t = [], r = e.split(""), n = 0; n < r.length; ++n)
    t[n] = r[n].charCodeAt(0);
  return t;
}
function Id(e) {
  var t = 0, r, n = Pw(e), i = n.length + 1, s, a, o, l, c;
  for (r = Zn(i), r[0] = n.length, s = 1; s != i; ++s)
    r[s] = n[s - 1];
  for (s = i - 1; s >= 0; --s)
    a = r[s], o = t & 16384 ? 1 : 0, l = t << 1 & 32767, c = o | l, t = c ^ a;
  return t ^ 52811;
}
var Rw = /* @__PURE__ */ function() {
  function e(i, s) {
    switch (s.type) {
      case "base64":
        return t(sn(i), s);
      case "binary":
        return t(i, s);
      case "buffer":
        return t(Fe && Buffer.isBuffer(i) ? i.toString("binary") : Ys(i), s);
      case "array":
        return t(ko(i), s);
    }
    throw new Error("Unrecognized type " + s.type);
  }
  function t(i, s) {
    var a = s || {}, o = a.dense ? [] : {}, l = i.match(/\\trowd.*?\\row\b/g);
    if (!l.length)
      throw new Error("RTF missing table");
    var c = { s: { c: 0, r: 0 }, e: { c: 0, r: l.length - 1 } };
    return l.forEach(function(f, h) {
      Array.isArray(o) && (o[h] = []);
      for (var u = /\\\w+\b/g, d = 0, p, g = -1; p = u.exec(f); ) {
        switch (p[0]) {
          case "\\cell":
            var m = f.slice(d, u.lastIndex - p[0].length);
            if (m[0] == " " && (m = m.slice(1)), ++g, m.length) {
              var v = { v: m, t: "s" };
              Array.isArray(o) ? o[h][g] = v : o[Le({ r: h, c: g })] = v;
            }
            break;
        }
        d = u.lastIndex;
      }
      g > c.e.c && (c.e.c = g);
    }), o["!ref"] = ht(c), o;
  }
  function r(i, s) {
    return ii(e(i, s), s);
  }
  function n(i) {
    for (var s = ["{\\rtf1\\ansi"], a = je(i["!ref"]), o, l = Array.isArray(i), c = a.s.r; c <= a.e.r; ++c) {
      s.push("\\trowd\\trautofit1");
      for (var f = a.s.c; f <= a.e.c; ++f)
        s.push("\\cellx" + (f + 1));
      for (s.push("\\pard\\intbl"), f = a.s.c; f <= a.e.c; ++f) {
        var h = Le({ r: c, c: f });
        o = l ? (i[c] || [])[f] : i[h], !(!o || o.v == null && (!o.f || o.F)) && (s.push(" " + (o.w || (an(o), o.w))), s.push("\\cell"));
      }
      s.push("\\pard\\intbl\\row");
    }
    return s.join("") + "}";
  }
  return {
    to_workbook: r,
    to_sheet: e,
    from_sheet: n
  };
}();
function p0(e) {
  for (var t = 0, r = 1; t != 3; ++t)
    r = r * 256 + (e[t] > 255 ? 255 : e[t] < 0 ? 0 : e[t]);
  return r.toString(16).toUpperCase().slice(1);
}
var Iw = 6, rn = Iw;
function io(e) {
  return Math.floor((e + Math.round(128 / rn) / 256) * rn);
}
function so(e) {
  return Math.floor((e - 5) / rn * 100 + 0.5) / 100;
}
function Ul(e) {
  return Math.round((e * rn + 5) / rn * 256) / 256;
}
function Ac(e) {
  e.width ? (e.wpx = io(e.width), e.wch = so(e.wpx), e.MDW = rn) : e.wpx ? (e.wch = so(e.wpx), e.width = Ul(e.wch), e.MDW = rn) : typeof e.wch == "number" && (e.width = Ul(e.wch), e.wpx = io(e.width), e.MDW = rn), e.customWidth && delete e.customWidth;
}
var Lw = 96, Ld = Lw;
function ao(e) {
  return e * 96 / Ld;
}
function Nd(e) {
  return e * Ld / 96;
}
function Nw(e) {
  var t = ["<numFmts>"];
  return [[5, 8], [23, 26], [41, 44], [
    /*63*/
    50,
    /*66],[164,*/
    392
  ]].forEach(function(r) {
    for (var n = r[0]; n <= r[1]; ++n)
      e[n] != null && (t[t.length] = re("numFmt", null, { numFmtId: n, formatCode: Ie(e[n]) }));
  }), t.length === 1 ? "" : (t[t.length] = "</numFmts>", t[0] = re("numFmts", null, { count: t.length - 2 }).replace("/>", ">"), t.join(""));
}
function Bw(e) {
  var t = [];
  return t[t.length] = re("cellXfs", null), e.forEach(function(r) {
    t[t.length] = re("xf", null, r);
  }), t[t.length] = "</cellXfs>", t.length === 2 ? "" : (t[0] = re("cellXfs", null, { count: t.length - 2 }).replace("/>", ">"), t.join(""));
}
function Bd(e, t) {
  var r = [ut, re("styleSheet", null, {
    xmlns: Ni[0],
    "xmlns:vt": mt.vt
  })], n;
  return e.SSF && (n = Nw(e.SSF)) != null && (r[r.length] = n), r[r.length] = '<fonts count="1"><font><sz val="12"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts>', r[r.length] = '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>', r[r.length] = '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>', r[r.length] = '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>', (n = Bw(t.cellXfs)) && (r[r.length] = n), r[r.length] = '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>', r[r.length] = '<dxfs count="0"/>', r[r.length] = '<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4"/>', r.length > 2 && (r[r.length] = "</styleSheet>", r[1] = r[1].replace("/>", ">")), r.join("");
}
function Ww(e, t) {
  var r = e.read_shift(2), n = Mt(e);
  return [r, n];
}
function Uw(e, t, r) {
  r || (r = G(6 + 4 * t.length)), r.write_shift(2, e), vt(t, r);
  var n = r.length > r.l ? r.slice(0, r.l) : r;
  return r.l == null && (r.l = r.length), n;
}
function zw(e, t, r) {
  var n = {};
  n.sz = e.read_shift(2) / 20;
  var i = Oy(e);
  i.fItalic && (n.italic = 1), i.fCondense && (n.condense = 1), i.fExtend && (n.extend = 1), i.fShadow && (n.shadow = 1), i.fOutline && (n.outline = 1), i.fStrikeout && (n.strike = 1);
  var s = e.read_shift(2);
  switch (s === 700 && (n.bold = 1), e.read_shift(2)) {
    case 1:
      n.vertAlign = "superscript";
      break;
    case 2:
      n.vertAlign = "subscript";
      break;
  }
  var a = e.read_shift(1);
  a != 0 && (n.underline = a);
  var o = e.read_shift(1);
  o > 0 && (n.family = o);
  var l = e.read_shift(1);
  switch (l > 0 && (n.charset = l), e.l++, n.color = ky(e), e.read_shift(1)) {
    case 1:
      n.scheme = "major";
      break;
    case 2:
      n.scheme = "minor";
      break;
  }
  return n.name = Mt(e), n;
}
function Hw(e, t) {
  t || (t = G(25 + 4 * 32)), t.write_shift(2, e.sz * 20), Dy(e, t), t.write_shift(2, e.bold ? 700 : 400);
  var r = 0;
  e.vertAlign == "superscript" ? r = 1 : e.vertAlign == "subscript" && (r = 2), t.write_shift(2, r), t.write_shift(1, e.underline || 0), t.write_shift(1, e.family || 0), t.write_shift(1, e.charset || 0), t.write_shift(1, 0), ro(e.color, t);
  var n = 0;
  return e.scheme == "major" && (n = 1), e.scheme == "minor" && (n = 2), t.write_shift(1, n), vt(e.name, t), t.length > t.l ? t.slice(0, t.l) : t;
}
var Vw = [
  "none",
  "solid",
  "mediumGray",
  "darkGray",
  "lightGray",
  "darkHorizontal",
  "darkVertical",
  "darkDown",
  "darkUp",
  "darkGrid",
  "darkTrellis",
  "lightHorizontal",
  "lightVertical",
  "lightDown",
  "lightUp",
  "lightGrid",
  "lightTrellis",
  "gray125",
  "gray0625"
], hl, Yw = Pr;
function m0(e, t) {
  t || (t = G(4 * 3 + 8 * 7 + 16 * 1)), hl || (hl = gc(Vw));
  var r = hl[e.patternType];
  r == null && (r = 40), t.write_shift(4, r);
  var n = 0;
  if (r != 40)
    for (ro({ auto: 1 }, t), ro({ auto: 1 }, t); n < 12; ++n)
      t.write_shift(4, 0);
  else {
    for (; n < 4; ++n)
      t.write_shift(4, 0);
    for (; n < 12; ++n)
      t.write_shift(4, 0);
  }
  return t.length > t.l ? t.slice(0, t.l) : t;
}
function jw(e, t) {
  var r = e.l + t, n = e.read_shift(2), i = e.read_shift(2);
  return e.l = r, { ixfe: n, numFmtId: i };
}
function Wd(e, t, r) {
  r || (r = G(16)), r.write_shift(2, t || 0), r.write_shift(2, e.numFmtId || 0), r.write_shift(2, 0), r.write_shift(2, 0), r.write_shift(2, 0), r.write_shift(1, 0), r.write_shift(1, 0);
  var n = 0;
  return r.write_shift(1, n), r.write_shift(1, 0), r.write_shift(1, 0), r.write_shift(1, 0), r;
}
function Ji(e, t) {
  return t || (t = G(10)), t.write_shift(1, 0), t.write_shift(1, 0), t.write_shift(4, 0), t.write_shift(4, 0), t;
}
var $w = Pr;
function Gw(e, t) {
  return t || (t = G(51)), t.write_shift(1, 0), Ji(null, t), Ji(null, t), Ji(null, t), Ji(null, t), Ji(null, t), t.length > t.l ? t.slice(0, t.l) : t;
}
function Xw(e, t) {
  return t || (t = G(12 + 4 * 10)), t.write_shift(4, e.xfId), t.write_shift(2, 1), t.write_shift(1, +e.builtinId), t.write_shift(1, 0), to(e.name || "", t), t.length > t.l ? t.slice(0, t.l) : t;
}
function Kw(e, t, r) {
  var n = G(2052);
  return n.write_shift(4, e), to(t, n), to(r, n), n.length > n.l ? n.slice(0, n.l) : n;
}
function qw(e, t) {
  if (t) {
    var r = 0;
    [[5, 8], [23, 26], [41, 44], [
      /*63*/
      50,
      /*66],[164,*/
      392
    ]].forEach(function(n) {
      for (var i = n[0]; i <= n[1]; ++i)
        t[i] != null && ++r;
    }), r != 0 && (q(e, 615, vr(r)), [[5, 8], [23, 26], [41, 44], [
      /*63*/
      50,
      /*66],[164,*/
      392
    ]].forEach(function(n) {
      for (var i = n[0]; i <= n[1]; ++i)
        t[i] != null && q(e, 44, Uw(i, t[i]));
    }), q(
      e,
      616
      /* BrtEndFmts */
    ));
  }
}
function Zw(e) {
  var t = 1;
  q(e, 611, vr(t)), q(e, 43, Hw({
    sz: 12,
    color: { theme: 1 },
    name: "Calibri",
    family: 2,
    scheme: "minor"
  })), q(
    e,
    612
    /* BrtEndFonts */
  );
}
function Jw(e) {
  var t = 2;
  q(e, 603, vr(t)), q(e, 45, m0({ patternType: "none" })), q(e, 45, m0({ patternType: "gray125" })), q(
    e,
    604
    /* BrtEndFills */
  );
}
function Qw(e) {
  var t = 1;
  q(e, 613, vr(t)), q(e, 46, Gw()), q(
    e,
    614
    /* BrtEndBorders */
  );
}
function eT(e) {
  var t = 1;
  q(e, 626, vr(t)), q(e, 47, Wd({
    numFmtId: 0,
    fontId: 0,
    fillId: 0,
    borderId: 0
  }, 65535)), q(
    e,
    627
    /* BrtEndCellStyleXFs */
  );
}
function tT(e, t) {
  q(e, 617, vr(t.length)), t.forEach(function(r) {
    q(e, 47, Wd(r, 0));
  }), q(
    e,
    618
    /* BrtEndCellXFs */
  );
}
function rT(e) {
  var t = 1;
  q(e, 619, vr(t)), q(e, 48, Xw({
    xfId: 0,
    builtinId: 0,
    name: "Normal"
  })), q(
    e,
    620
    /* BrtEndStyles */
  );
}
function nT(e) {
  var t = 0;
  q(e, 505, vr(t)), q(
    e,
    506
    /* BrtEndDXFs */
  );
}
function iT(e) {
  var t = 0;
  q(e, 508, Kw(t, "TableStyleMedium9", "PivotStyleMedium4")), q(
    e,
    509
    /* BrtEndTableStyles */
  );
}
function sT(e, t) {
  var r = jt();
  return q(
    r,
    278
    /* BrtBeginStyleSheet */
  ), qw(r, e.SSF), Zw(r), Jw(r), Qw(r), eT(r), tT(r, t.cellXfs), rT(r), nT(r), iT(r), q(
    r,
    279
    /* BrtEndStyleSheet */
  ), r.end();
}
function Ud(e, t) {
  if (t && t.themeXLSX)
    return t.themeXLSX;
  if (e && typeof e.raw == "string")
    return e.raw;
  var r = [ut];
  return r[r.length] = '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">', r[r.length] = "<a:themeElements>", r[r.length] = '<a:clrScheme name="Office">', r[r.length] = '<a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>', r[r.length] = '<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>', r[r.length] = '<a:dk2><a:srgbClr val="1F497D"/></a:dk2>', r[r.length] = '<a:lt2><a:srgbClr val="EEECE1"/></a:lt2>', r[r.length] = '<a:accent1><a:srgbClr val="4F81BD"/></a:accent1>', r[r.length] = '<a:accent2><a:srgbClr val="C0504D"/></a:accent2>', r[r.length] = '<a:accent3><a:srgbClr val="9BBB59"/></a:accent3>', r[r.length] = '<a:accent4><a:srgbClr val="8064A2"/></a:accent4>', r[r.length] = '<a:accent5><a:srgbClr val="4BACC6"/></a:accent5>', r[r.length] = '<a:accent6><a:srgbClr val="F79646"/></a:accent6>', r[r.length] = '<a:hlink><a:srgbClr val="0000FF"/></a:hlink>', r[r.length] = '<a:folHlink><a:srgbClr val="800080"/></a:folHlink>', r[r.length] = "</a:clrScheme>", r[r.length] = '<a:fontScheme name="Office">', r[r.length] = "<a:majorFont>", r[r.length] = '<a:latin typeface="Cambria"/>', r[r.length] = '<a:ea typeface=""/>', r[r.length] = '<a:cs typeface=""/>', r[r.length] = '<a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/>', r[r.length] = '<a:font script="Hang" typeface="맑은 고딕"/>', r[r.length] = '<a:font script="Hans" typeface="宋体"/>', r[r.length] = '<a:font script="Hant" typeface="新細明體"/>', r[r.length] = '<a:font script="Arab" typeface="Times New Roman"/>', r[r.length] = '<a:font script="Hebr" typeface="Times New Roman"/>', r[r.length] = '<a:font script="Thai" typeface="Tahoma"/>', r[r.length] = '<a:font script="Ethi" typeface="Nyala"/>', r[r.length] = '<a:font script="Beng" typeface="Vrinda"/>', r[r.length] = '<a:font script="Gujr" typeface="Shruti"/>', r[r.length] = '<a:font script="Khmr" typeface="MoolBoran"/>', r[r.length] = '<a:font script="Knda" typeface="Tunga"/>', r[r.length] = '<a:font script="Guru" typeface="Raavi"/>', r[r.length] = '<a:font script="Cans" typeface="Euphemia"/>', r[r.length] = '<a:font script="Cher" typeface="Plantagenet Cherokee"/>', r[r.length] = '<a:font script="Yiii" typeface="Microsoft Yi Baiti"/>', r[r.length] = '<a:font script="Tibt" typeface="Microsoft Himalaya"/>', r[r.length] = '<a:font script="Thaa" typeface="MV Boli"/>', r[r.length] = '<a:font script="Deva" typeface="Mangal"/>', r[r.length] = '<a:font script="Telu" typeface="Gautami"/>', r[r.length] = '<a:font script="Taml" typeface="Latha"/>', r[r.length] = '<a:font script="Syrc" typeface="Estrangelo Edessa"/>', r[r.length] = '<a:font script="Orya" typeface="Kalinga"/>', r[r.length] = '<a:font script="Mlym" typeface="Kartika"/>', r[r.length] = '<a:font script="Laoo" typeface="DokChampa"/>', r[r.length] = '<a:font script="Sinh" typeface="Iskoola Pota"/>', r[r.length] = '<a:font script="Mong" typeface="Mongolian Baiti"/>', r[r.length] = '<a:font script="Viet" typeface="Times New Roman"/>', r[r.length] = '<a:font script="Uigh" typeface="Microsoft Uighur"/>', r[r.length] = '<a:font script="Geor" typeface="Sylfaen"/>', r[r.length] = "</a:majorFont>", r[r.length] = "<a:minorFont>", r[r.length] = '<a:latin typeface="Calibri"/>', r[r.length] = '<a:ea typeface=""/>', r[r.length] = '<a:cs typeface=""/>', r[r.length] = '<a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/>', r[r.length] = '<a:font script="Hang" typeface="맑은 고딕"/>', r[r.length] = '<a:font script="Hans" typeface="宋体"/>', r[r.length] = '<a:font script="Hant" typeface="新細明體"/>', r[r.length] = '<a:font script="Arab" typeface="Arial"/>', r[r.length] = '<a:font script="Hebr" typeface="Arial"/>', r[r.length] = '<a:font script="Thai" typeface="Tahoma"/>', r[r.length] = '<a:font script="Ethi" typeface="Nyala"/>', r[r.length] = '<a:font script="Beng" typeface="Vrinda"/>', r[r.length] = '<a:font script="Gujr" typeface="Shruti"/>', r[r.length] = '<a:font script="Khmr" typeface="DaunPenh"/>', r[r.length] = '<a:font script="Knda" typeface="Tunga"/>', r[r.length] = '<a:font script="Guru" typeface="Raavi"/>', r[r.length] = '<a:font script="Cans" typeface="Euphemia"/>', r[r.length] = '<a:font script="Cher" typeface="Plantagenet Cherokee"/>', r[r.length] = '<a:font script="Yiii" typeface="Microsoft Yi Baiti"/>', r[r.length] = '<a:font script="Tibt" typeface="Microsoft Himalaya"/>', r[r.length] = '<a:font script="Thaa" typeface="MV Boli"/>', r[r.length] = '<a:font script="Deva" typeface="Mangal"/>', r[r.length] = '<a:font script="Telu" typeface="Gautami"/>', r[r.length] = '<a:font script="Taml" typeface="Latha"/>', r[r.length] = '<a:font script="Syrc" typeface="Estrangelo Edessa"/>', r[r.length] = '<a:font script="Orya" typeface="Kalinga"/>', r[r.length] = '<a:font script="Mlym" typeface="Kartika"/>', r[r.length] = '<a:font script="Laoo" typeface="DokChampa"/>', r[r.length] = '<a:font script="Sinh" typeface="Iskoola Pota"/>', r[r.length] = '<a:font script="Mong" typeface="Mongolian Baiti"/>', r[r.length] = '<a:font script="Viet" typeface="Arial"/>', r[r.length] = '<a:font script="Uigh" typeface="Microsoft Uighur"/>', r[r.length] = '<a:font script="Geor" typeface="Sylfaen"/>', r[r.length] = "</a:minorFont>", r[r.length] = "</a:fontScheme>", r[r.length] = '<a:fmtScheme name="Office">', r[r.length] = "<a:fillStyleLst>", r[r.length] = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>', r[r.length] = '<a:gradFill rotWithShape="1">', r[r.length] = "<a:gsLst>", r[r.length] = '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs>', r[r.length] = '<a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs>', r[r.length] = '<a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs>', r[r.length] = "</a:gsLst>", r[r.length] = '<a:lin ang="16200000" scaled="1"/>', r[r.length] = "</a:gradFill>", r[r.length] = '<a:gradFill rotWithShape="1">', r[r.length] = "<a:gsLst>", r[r.length] = '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="100000"/><a:shade val="100000"/><a:satMod val="130000"/></a:schemeClr></a:gs>', r[r.length] = '<a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="50000"/><a:shade val="100000"/><a:satMod val="350000"/></a:schemeClr></a:gs>', r[r.length] = "</a:gsLst>", r[r.length] = '<a:lin ang="16200000" scaled="0"/>', r[r.length] = "</a:gradFill>", r[r.length] = "</a:fillStyleLst>", r[r.length] = "<a:lnStyleLst>", r[r.length] = '<a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/><a:satMod val="105000"/></a:schemeClr></a:solidFill><a:prstDash val="solid"/></a:ln>', r[r.length] = '<a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>', r[r.length] = '<a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>', r[r.length] = "</a:lnStyleLst>", r[r.length] = "<a:effectStyleLst>", r[r.length] = "<a:effectStyle>", r[r.length] = "<a:effectLst>", r[r.length] = '<a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="38000"/></a:srgbClr></a:outerShdw>', r[r.length] = "</a:effectLst>", r[r.length] = "</a:effectStyle>", r[r.length] = "<a:effectStyle>", r[r.length] = "<a:effectLst>", r[r.length] = '<a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw>', r[r.length] = "</a:effectLst>", r[r.length] = "</a:effectStyle>", r[r.length] = "<a:effectStyle>", r[r.length] = "<a:effectLst>", r[r.length] = '<a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw>', r[r.length] = "</a:effectLst>", r[r.length] = '<a:scene3d><a:camera prst="orthographicFront"><a:rot lat="0" lon="0" rev="0"/></a:camera><a:lightRig rig="threePt" dir="t"><a:rot lat="0" lon="0" rev="1200000"/></a:lightRig></a:scene3d>', r[r.length] = '<a:sp3d><a:bevelT w="63500" h="25400"/></a:sp3d>', r[r.length] = "</a:effectStyle>", r[r.length] = "</a:effectStyleLst>", r[r.length] = "<a:bgFillStyleLst>", r[r.length] = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>', r[r.length] = '<a:gradFill rotWithShape="1">', r[r.length] = "<a:gsLst>", r[r.length] = '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="40000"/><a:satMod val="350000"/></a:schemeClr></a:gs>', r[r.length] = '<a:gs pos="40000"><a:schemeClr val="phClr"><a:tint val="45000"/><a:shade val="99000"/><a:satMod val="350000"/></a:schemeClr></a:gs>', r[r.length] = '<a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="20000"/><a:satMod val="255000"/></a:schemeClr></a:gs>', r[r.length] = "</a:gsLst>", r[r.length] = '<a:path path="circle"><a:fillToRect l="50000" t="-80000" r="50000" b="180000"/></a:path>', r[r.length] = "</a:gradFill>", r[r.length] = '<a:gradFill rotWithShape="1">', r[r.length] = "<a:gsLst>", r[r.length] = '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="80000"/><a:satMod val="300000"/></a:schemeClr></a:gs>', r[r.length] = '<a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="30000"/><a:satMod val="200000"/></a:schemeClr></a:gs>', r[r.length] = "</a:gsLst>", r[r.length] = '<a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path>', r[r.length] = "</a:gradFill>", r[r.length] = "</a:bgFillStyleLst>", r[r.length] = "</a:fmtScheme>", r[r.length] = "</a:themeElements>", r[r.length] = "<a:objectDefaults>", r[r.length] = "<a:spDef>", r[r.length] = '<a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="1"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="3"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="2"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="lt1"/></a:fontRef></a:style>', r[r.length] = "</a:spDef>", r[r.length] = "<a:lnDef>", r[r.length] = '<a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="2"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="0"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="1"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="tx1"/></a:fontRef></a:style>', r[r.length] = "</a:lnDef>", r[r.length] = "</a:objectDefaults>", r[r.length] = "<a:extraClrSchemeLst/>", r[r.length] = "</a:theme>", r.join("");
}
function aT(e, t) {
  return {
    flags: e.read_shift(4),
    version: e.read_shift(4),
    name: Mt(e)
  };
}
function oT(e) {
  var t = G(12 + 2 * e.name.length);
  return t.write_shift(4, e.flags), t.write_shift(4, e.version), vt(e.name, t), t.slice(0, t.l);
}
function lT(e) {
  for (var t = [], r = e.read_shift(4); r-- > 0; )
    t.push([e.read_shift(4), e.read_shift(4)]);
  return t;
}
function cT(e) {
  var t = G(4 + 8 * e.length);
  t.write_shift(4, e.length);
  for (var r = 0; r < e.length; ++r)
    t.write_shift(4, e[r][0]), t.write_shift(4, e[r][1]);
  return t;
}
function fT(e, t) {
  var r = G(8 + 2 * t.length);
  return r.write_shift(4, e), vt(t, r), r.slice(0, r.l);
}
function hT(e) {
  return e.l += 4, e.read_shift(4) != 0;
}
function uT(e, t) {
  var r = G(8);
  return r.write_shift(4, e), r.write_shift(4, t ? 1 : 0), r;
}
function dT() {
  var e = jt();
  return q(e, 332), q(e, 334, vr(1)), q(e, 335, oT({
    name: "XLDAPR",
    version: 12e4,
    flags: 3496657072
  })), q(e, 336), q(e, 339, fT(1, "XLDAPR")), q(e, 52), q(e, 35, vr(514)), q(e, 4096, vr(0)), q(e, 4097, or(1)), q(e, 36), q(e, 53), q(e, 340), q(e, 337, uT(1, !0)), q(e, 51, cT([[1, 0]])), q(e, 338), q(e, 333), e.end();
}
function zd() {
  var e = [ut];
  return e.push(`<metadata xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:xlrd="http://schemas.microsoft.com/office/spreadsheetml/2017/richdata" xmlns:xda="http://schemas.microsoft.com/office/spreadsheetml/2017/dynamicarray">
  <metadataTypes count="1">
    <metadataType name="XLDAPR" minSupportedVersion="120000" copy="1" pasteAll="1" pasteValues="1" merge="1" splitFirst="1" rowColShift="1" clearFormats="1" clearComments="1" assign="1" coerce="1" cellMeta="1"/>
  </metadataTypes>
  <futureMetadata name="XLDAPR" count="1">
    <bk>
      <extLst>
        <ext uri="{bdbb8cdc-fa1e-496e-a857-3c3f30c029c3}">
          <xda:dynamicArrayProperties fDynamic="1" fCollapsed="0"/>
        </ext>
      </extLst>
    </bk>
  </futureMetadata>
  <cellMetadata count="1">
    <bk>
      <rc t="1" v="0"/>
    </bk>
  </cellMetadata>
</metadata>`), e.join("");
}
function gT(e) {
  var t = {};
  t.i = e.read_shift(4);
  var r = {};
  r.r = e.read_shift(4), r.c = e.read_shift(4), t.r = Le(r);
  var n = e.read_shift(1);
  return n & 2 && (t.l = "1"), n & 8 && (t.a = "1"), t;
}
var wi = 1024;
function Hd(e, t) {
  for (var r = [21600, 21600], n = ["m0,0l0", r[1], r[0], r[1], r[0], "0xe"].join(","), i = [
    re("xml", null, { "xmlns:v": Jt.v, "xmlns:o": Jt.o, "xmlns:x": Jt.x, "xmlns:mv": Jt.mv }).replace(/\/>/, ">"),
    re("o:shapelayout", re("o:idmap", null, { "v:ext": "edit", data: e }), { "v:ext": "edit" }),
    re("v:shapetype", [
      re("v:stroke", null, { joinstyle: "miter" }),
      re("v:path", null, { gradientshapeok: "t", "o:connecttype": "rect" })
    ].join(""), { id: "_x0000_t202", "o:spt": 202, coordsize: r.join(","), path: n })
  ]; wi < e * 1e3; )
    wi += 1e3;
  return t.forEach(function(s) {
    var a = _t(s[0]), o = (
      /*::(*/
      { color2: "#BEFF82", type: "gradient" }
    );
    o.type == "gradient" && (o.angle = "-180");
    var l = o.type == "gradient" ? re("o:fill", null, { type: "gradientUnscaled", "v:ext": "view" }) : null, c = re("v:fill", l, o), f = { on: "t", obscured: "t" };
    ++wi, i = i.concat([
      "<v:shape" + Ps({
        id: "_x0000_s" + wi,
        type: "#_x0000_t202",
        style: "position:absolute; margin-left:80pt;margin-top:5pt;width:104pt;height:64pt;z-index:10" + (s[1].hidden ? ";visibility:hidden" : ""),
        fillcolor: "#ECFAD4",
        strokecolor: "#edeaa1"
      }) + ">",
      c,
      re("v:shadow", null, f),
      re("v:path", null, { "o:connecttype": "none" }),
      '<v:textbox><div style="text-align:left"></div></v:textbox>',
      '<x:ClientData ObjectType="Note">',
      "<x:MoveWithCells/>",
      "<x:SizeWithCells/>",
      /* Part 4 19.4.2.3 Anchor (Anchor) */
      St("x:Anchor", [a.c + 1, 0, a.r + 1, 0, a.c + 3, 20, a.r + 5, 20].join(",")),
      St("x:AutoFill", "False"),
      St("x:Row", String(a.r)),
      St("x:Column", String(a.c)),
      s[1].hidden ? "" : "<x:Visible/>",
      "</x:ClientData>",
      "</v:shape>"
    ]);
  }), i.push("</xml>"), i.join("");
}
function Vd(e) {
  var t = [ut, re("comments", null, { xmlns: Ni[0] })], r = [];
  return t.push("<authors>"), e.forEach(function(n) {
    n[1].forEach(function(i) {
      var s = Ie(i.a);
      r.indexOf(s) == -1 && (r.push(s), t.push("<author>" + s + "</author>")), i.T && i.ID && r.indexOf("tc=" + i.ID) == -1 && (r.push("tc=" + i.ID), t.push("<author>tc=" + i.ID + "</author>"));
    });
  }), r.length == 0 && (r.push("SheetJ5"), t.push("<author>SheetJ5</author>")), t.push("</authors>"), t.push("<commentList>"), e.forEach(function(n) {
    var i = 0, s = [];
    if (n[1][0] && n[1][0].T && n[1][0].ID ? i = r.indexOf("tc=" + n[1][0].ID) : n[1].forEach(function(l) {
      l.a && (i = r.indexOf(Ie(l.a))), s.push(l.t || "");
    }), t.push('<comment ref="' + n[0] + '" authorId="' + i + '"><text>'), s.length <= 1)
      t.push(St("t", Ie(s[0] || "")));
    else {
      for (var a = `Comment:
    ` + s[0] + `
`, o = 1; o < s.length; ++o)
        a += `Reply:
    ` + s[o] + `
`;
      t.push(St("t", Ie(a)));
    }
    t.push("</text></comment>");
  }), t.push("</commentList>"), t.length > 2 && (t[t.length] = "</comments>", t[1] = t[1].replace("/>", ">")), t.join("");
}
function pT(e, t, r) {
  var n = [ut, re("ThreadedComments", null, { xmlns: mt.TCMNT }).replace(/[\/]>/, ">")];
  return e.forEach(function(i) {
    var s = "";
    (i[1] || []).forEach(function(a, o) {
      if (!a.T) {
        delete a.ID;
        return;
      }
      a.a && t.indexOf(a.a) == -1 && t.push(a.a);
      var l = {
        ref: i[0],
        id: "{54EE7951-7262-4200-6969-" + ("000000000000" + r.tcid++).slice(-12) + "}"
      };
      o == 0 ? s = l.id : l.parentId = s, a.ID = l.id, a.a && (l.personId = "{54EE7950-7262-4200-6969-" + ("000000000000" + t.indexOf(a.a)).slice(-12) + "}"), n.push(re("threadedComment", St("text", a.t || ""), l));
    });
  }), n.push("</ThreadedComments>"), n.join("");
}
function mT(e) {
  var t = [ut, re("personList", null, {
    xmlns: mt.TCMNT,
    "xmlns:x": Ni[0]
  }).replace(/[\/]>/, ">")];
  return e.forEach(function(r, n) {
    t.push(re("person", null, {
      displayName: r,
      id: "{54EE7950-7262-4200-6969-" + ("000000000000" + n).slice(-12) + "}",
      userId: r,
      providerId: "None"
    }));
  }), t.push("</personList>"), t.join("");
}
function xT(e) {
  var t = {};
  t.iauthor = e.read_shift(4);
  var r = li(e);
  return t.rfx = r.s, t.ref = Le(r.s), e.l += 16, t;
}
function _T(e, t) {
  return t == null && (t = G(36)), t.write_shift(4, e[1].iauthor), Wi(e[0], t), t.write_shift(4, 0), t.write_shift(4, 0), t.write_shift(4, 0), t.write_shift(4, 0), t;
}
var vT = Mt;
function yT(e) {
  return vt(e.slice(0, 54));
}
function wT(e) {
  var t = jt(), r = [];
  return q(
    t,
    628
    /* BrtBeginComments */
  ), q(
    t,
    630
    /* BrtBeginCommentAuthors */
  ), e.forEach(function(n) {
    n[1].forEach(function(i) {
      r.indexOf(i.a) > -1 || (r.push(i.a.slice(0, 54)), q(t, 632, yT(i.a)));
    });
  }), q(
    t,
    631
    /* BrtEndCommentAuthors */
  ), q(
    t,
    633
    /* BrtBeginCommentList */
  ), e.forEach(function(n) {
    n[1].forEach(function(i) {
      i.iauthor = r.indexOf(i.a);
      var s = { s: _t(n[0]), e: _t(n[0]) };
      q(t, 635, _T([s, i])), i.t && i.t.length > 0 && q(t, 637, Sy(i)), q(
        t,
        636
        /* BrtEndComment */
      ), delete i.iauthor;
    });
  }), q(
    t,
    634
    /* BrtEndCommentList */
  ), q(
    t,
    629
    /* BrtEndComments */
  ), t.end();
}
function TT(e, t) {
  t.FullPaths.forEach(function(r, n) {
    if (n != 0) {
      var i = r.replace(/[^\/]*[\/]/, "/_VBA_PROJECT_CUR/");
      i.slice(-1) !== "/" && Be.utils.cfb_add(e, i, t.FileIndex[n].content);
    }
  });
}
var Yd = ["xlsb", "xlsm", "xlam", "biff8", "xla"], ST = /* @__PURE__ */ function() {
  var e = /(^|[^A-Za-z_])R(\[?-?\d+\]|[1-9]\d*|)C(\[?-?\d+\]|[1-9]\d*|)(?![A-Za-z0-9_])/g, t = { r: 0, c: 0 };
  function r(n, i, s, a) {
    var o = !1, l = !1;
    s.length == 0 ? l = !0 : s.charAt(0) == "[" && (l = !0, s = s.slice(1, -1)), a.length == 0 ? o = !0 : a.charAt(0) == "[" && (o = !0, a = a.slice(1, -1));
    var c = s.length > 0 ? parseInt(s, 10) | 0 : 0, f = a.length > 0 ? parseInt(a, 10) | 0 : 0;
    return o ? f += t.c : --f, l ? c += t.r : --c, i + (o ? "" : "$") + Ct(f) + (l ? "" : "$") + bt(c);
  }
  return function(i, s) {
    return t = s, i.replace(e, r);
  };
}(), kc = /(^|[^._A-Z0-9])([$]?)([A-Z]{1,2}|[A-W][A-Z]{2}|X[A-E][A-Z]|XF[A-D])([$]?)(10[0-3]\d{4}|104[0-7]\d{3}|1048[0-4]\d{2}|10485[0-6]\d|104857[0-6]|[1-9]\d{0,5})(?![_.\(A-Za-z0-9])/g, Oc = /* @__PURE__ */ function() {
  return function(t, r) {
    return t.replace(kc, function(n, i, s, a, o, l) {
      var c = wc(a) - (s ? 0 : r.c), f = yc(l) - (o ? 0 : r.r), h = f == 0 ? "" : o ? f + 1 : "[" + f + "]", u = c == 0 ? "" : s ? c + 1 : "[" + c + "]";
      return i + "R" + h + "C" + u;
    });
  };
}();
function bT(e, t) {
  return e.replace(kc, function(r, n, i, s, a, o) {
    return n + (i == "$" ? i + s : Ct(wc(s) + t.c)) + (a == "$" ? a + o : bt(yc(o) + t.r));
  });
}
function ET(e) {
  return e.length != 1;
}
function ct(e) {
  e.l += 1;
}
function An(e, t) {
  var r = e.read_shift(t == 1 ? 1 : 2);
  return [r & 16383, r >> 14 & 1, r >> 15 & 1];
}
function jd(e, t, r) {
  var n = 2;
  if (r) {
    if (r.biff >= 2 && r.biff <= 5)
      return $d(e);
    r.biff == 12 && (n = 4);
  }
  var i = e.read_shift(n), s = e.read_shift(n), a = An(e, 2), o = An(e, 2);
  return { s: { r: i, c: a[0], cRel: a[1], rRel: a[2] }, e: { r: s, c: o[0], cRel: o[1], rRel: o[2] } };
}
function $d(e) {
  var t = An(e, 2), r = An(e, 2), n = e.read_shift(1), i = e.read_shift(1);
  return { s: { r: t[0], c: n, cRel: t[1], rRel: t[2] }, e: { r: r[0], c: i, cRel: r[1], rRel: r[2] } };
}
function AT(e, t, r) {
  if (r.biff < 8)
    return $d(e);
  var n = e.read_shift(r.biff == 12 ? 4 : 2), i = e.read_shift(r.biff == 12 ? 4 : 2), s = An(e, 2), a = An(e, 2);
  return { s: { r: n, c: s[0], cRel: s[1], rRel: s[2] }, e: { r: i, c: a[0], cRel: a[1], rRel: a[2] } };
}
function Gd(e, t, r) {
  if (r && r.biff >= 2 && r.biff <= 5)
    return kT(e);
  var n = e.read_shift(r && r.biff == 12 ? 4 : 2), i = An(e, 2);
  return { r: n, c: i[0], cRel: i[1], rRel: i[2] };
}
function kT(e) {
  var t = An(e, 2), r = e.read_shift(1);
  return { r: t[0], c: r, cRel: t[1], rRel: t[2] };
}
function OT(e) {
  var t = e.read_shift(2), r = e.read_shift(2);
  return { r: t, c: r & 255, fQuoted: !!(r & 16384), cRel: r >> 15, rRel: r >> 15 };
}
function DT(e, t, r) {
  var n = r && r.biff ? r.biff : 8;
  if (n >= 2 && n <= 5)
    return FT(e);
  var i = e.read_shift(n >= 12 ? 4 : 2), s = e.read_shift(2), a = (s & 16384) >> 14, o = (s & 32768) >> 15;
  if (s &= 16383, o == 1)
    for (; i > 524287; )
      i -= 1048576;
  if (a == 1)
    for (; s > 8191; )
      s = s - 16384;
  return { r: i, c: s, cRel: a, rRel: o };
}
function FT(e) {
  var t = e.read_shift(2), r = e.read_shift(1), n = (t & 32768) >> 15, i = (t & 16384) >> 14;
  return t &= 16383, n == 1 && t >= 8192 && (t = t - 16384), i == 1 && r >= 128 && (r = r - 256), { r: t, c: r, cRel: i, rRel: n };
}
function CT(e, t, r) {
  var n = (e[e.l++] & 96) >> 5, i = jd(e, r.biff >= 2 && r.biff <= 5 ? 6 : 8, r);
  return [n, i];
}
function MT(e, t, r) {
  var n = (e[e.l++] & 96) >> 5, i = e.read_shift(2, "i"), s = 8;
  if (r)
    switch (r.biff) {
      case 5:
        e.l += 12, s = 6;
        break;
      case 12:
        s = 12;
        break;
    }
  var a = jd(e, s, r);
  return [n, i, a];
}
function PT(e, t, r) {
  var n = (e[e.l++] & 96) >> 5;
  return e.l += r && r.biff > 8 ? 12 : r.biff < 8 ? 6 : 8, [n];
}
function RT(e, t, r) {
  var n = (e[e.l++] & 96) >> 5, i = e.read_shift(2), s = 8;
  if (r)
    switch (r.biff) {
      case 5:
        e.l += 12, s = 6;
        break;
      case 12:
        s = 12;
        break;
    }
  return e.l += s, [n, i];
}
function IT(e, t, r) {
  var n = (e[e.l++] & 96) >> 5, i = AT(e, t - 1, r);
  return [n, i];
}
function LT(e, t, r) {
  var n = (e[e.l++] & 96) >> 5;
  return e.l += r.biff == 2 ? 6 : r.biff == 12 ? 14 : 7, [n];
}
function x0(e) {
  var t = e[e.l + 1] & 1, r = 1;
  return e.l += 4, [t, r];
}
function NT(e, t, r) {
  e.l += 2;
  for (var n = e.read_shift(r && r.biff == 2 ? 1 : 2), i = [], s = 0; s <= n; ++s)
    i.push(e.read_shift(r && r.biff == 2 ? 1 : 2));
  return i;
}
function BT(e, t, r) {
  var n = e[e.l + 1] & 255 ? 1 : 0;
  return e.l += 2, [n, e.read_shift(r && r.biff == 2 ? 1 : 2)];
}
function WT(e, t, r) {
  var n = e[e.l + 1] & 255 ? 1 : 0;
  return e.l += 2, [n, e.read_shift(r && r.biff == 2 ? 1 : 2)];
}
function UT(e) {
  var t = e[e.l + 1] & 255 ? 1 : 0;
  return e.l += 2, [t, e.read_shift(2)];
}
function zT(e, t, r) {
  var n = e[e.l + 1] & 255 ? 1 : 0;
  return e.l += r && r.biff == 2 ? 3 : 4, [n];
}
function Xd(e) {
  var t = e.read_shift(1), r = e.read_shift(1);
  return [t, r];
}
function HT(e) {
  return e.read_shift(2), Xd(e);
}
function VT(e) {
  return e.read_shift(2), Xd(e);
}
function YT(e, t, r) {
  var n = (e[e.l] & 96) >> 5;
  e.l += 1;
  var i = Gd(e, 0, r);
  return [n, i];
}
function jT(e, t, r) {
  var n = (e[e.l] & 96) >> 5;
  e.l += 1;
  var i = DT(e, 0, r);
  return [n, i];
}
function $T(e, t, r) {
  var n = (e[e.l] & 96) >> 5;
  e.l += 1;
  var i = e.read_shift(2);
  r && r.biff == 5 && (e.l += 12);
  var s = Gd(e, 0, r);
  return [n, i, s];
}
function GT(e, t, r) {
  var n = (e[e.l] & 96) >> 5;
  e.l += 1;
  var i = e.read_shift(r && r.biff <= 3 ? 1 : 2);
  return [GS[i], Zd[i], n];
}
function XT(e, t, r) {
  var n = e[e.l++], i = e.read_shift(1), s = r && r.biff <= 3 ? [n == 88 ? -1 : 0, e.read_shift(1)] : KT(e);
  return [i, (s[0] === 0 ? Zd : $S)[s[1]]];
}
function KT(e) {
  return [e[e.l + 1] >> 7, e.read_shift(2) & 32767];
}
function qT(e, t, r) {
  e.l += r && r.biff == 2 ? 3 : 4;
}
function ZT(e, t, r) {
  if (e.l++, r && r.biff == 12)
    return [e.read_shift(4, "i"), 0];
  var n = e.read_shift(2), i = e.read_shift(r && r.biff == 2 ? 1 : 2);
  return [n, i];
}
function JT(e) {
  return e.l++, Gs[e.read_shift(1)];
}
function QT(e) {
  return e.l++, e.read_shift(2);
}
function eS(e) {
  return e.l++, e.read_shift(1) !== 0;
}
function tS(e) {
  return e.l++, Ui(e);
}
function rS(e, t, r) {
  return e.l++, Fd(e, t - 1, r);
}
function nS(e, t) {
  var r = [e.read_shift(1)];
  if (t == 12)
    switch (r[0]) {
      case 2:
        r[0] = 4;
        break;
      case 4:
        r[0] = 16;
        break;
      case 0:
        r[0] = 1;
        break;
      case 1:
        r[0] = 2;
        break;
    }
  switch (r[0]) {
    case 4:
      r[1] = $y(e, 1) ? "TRUE" : "FALSE", t != 12 && (e.l += 7);
      break;
    case 37:
    case 16:
      r[1] = Gs[e[e.l]], e.l += t == 12 ? 4 : 8;
      break;
    case 0:
      e.l += 8;
      break;
    case 1:
      r[1] = Ui(e);
      break;
    case 2:
      r[1] = qy(e, 0, { biff: t > 0 && t < 8 ? 2 : t });
      break;
    default:
      throw new Error("Bad SerAr: " + r[0]);
  }
  return r;
}
function iS(e, t, r) {
  for (var n = e.read_shift(r.biff == 12 ? 4 : 2), i = [], s = 0; s != n; ++s)
    i.push((r.biff == 12 ? li : Qy)(e));
  return i;
}
function sS(e, t, r) {
  var n = 0, i = 0;
  r.biff == 12 ? (n = e.read_shift(4), i = e.read_shift(4)) : (i = 1 + e.read_shift(1), n = 1 + e.read_shift(2)), r.biff >= 2 && r.biff < 8 && (--n, --i == 0 && (i = 256));
  for (var s = 0, a = []; s != n && (a[s] = []); ++s)
    for (var o = 0; o != i; ++o)
      a[s][o] = nS(e, r.biff);
  return a;
}
function aS(e, t, r) {
  var n = e.read_shift(1) >>> 5 & 3, i = !r || r.biff >= 8 ? 4 : 2, s = e.read_shift(i);
  switch (r.biff) {
    case 2:
      e.l += 5;
      break;
    case 3:
    case 4:
      e.l += 8;
      break;
    case 5:
      e.l += 12;
      break;
  }
  return [n, 0, s];
}
function oS(e, t, r) {
  if (r.biff == 5)
    return lS(e);
  var n = e.read_shift(1) >>> 5 & 3, i = e.read_shift(2), s = e.read_shift(4);
  return [n, i, s];
}
function lS(e) {
  var t = e.read_shift(1) >>> 5 & 3, r = e.read_shift(2, "i");
  e.l += 8;
  var n = e.read_shift(2);
  return e.l += 12, [t, r, n];
}
function cS(e, t, r) {
  var n = e.read_shift(1) >>> 5 & 3;
  e.l += r && r.biff == 2 ? 3 : 4;
  var i = e.read_shift(r && r.biff == 2 ? 1 : 2);
  return [n, i];
}
function fS(e, t, r) {
  var n = e.read_shift(1) >>> 5 & 3, i = e.read_shift(r && r.biff == 2 ? 1 : 2);
  return [n, i];
}
function hS(e, t, r) {
  var n = e.read_shift(1) >>> 5 & 3;
  return e.l += 4, r.biff < 8 && e.l--, r.biff == 12 && (e.l += 2), [n];
}
function uS(e, t, r) {
  var n = (e[e.l++] & 96) >> 5, i = e.read_shift(2), s = 4;
  if (r)
    switch (r.biff) {
      case 5:
        s = 15;
        break;
      case 12:
        s = 6;
        break;
    }
  return e.l += s, [n, i];
}
var dS = Pr, gS = Pr, pS = Pr;
function Xs(e, t, r) {
  return e.l += 2, [OT(e)];
}
function Dc(e) {
  return e.l += 6, [];
}
var mS = Xs, xS = Dc, _S = Dc, vS = Xs;
function Kd(e) {
  return e.l += 2, [Od(e), e.read_shift(2) & 1];
}
var yS = Xs, wS = Kd, TS = Dc, SS = Xs, bS = Xs, ES = [
  "Data",
  "All",
  "Headers",
  "??",
  "?Data2",
  "??",
  "?DataHeaders",
  "??",
  "Totals",
  "??",
  "??",
  "??",
  "?DataTotals",
  "??",
  "??",
  "??",
  "?Current"
];
function AS(e) {
  e.l += 2;
  var t = e.read_shift(2), r = e.read_shift(2), n = e.read_shift(4), i = e.read_shift(2), s = e.read_shift(2), a = ES[r >> 2 & 31];
  return { ixti: t, coltype: r & 3, rt: a, idx: n, c: i, C: s };
}
function kS(e) {
  return e.l += 2, [e.read_shift(4)];
}
function OS(e, t, r) {
  return e.l += 5, e.l += 2, e.l += r.biff == 2 ? 1 : 4, ["PTGSHEET"];
}
function DS(e, t, r) {
  return e.l += r.biff == 2 ? 4 : 5, ["PTGENDSHEET"];
}
function FS(e) {
  var t = e.read_shift(1) >>> 5 & 3, r = e.read_shift(2);
  return [t, r];
}
function CS(e) {
  var t = e.read_shift(1) >>> 5 & 3, r = e.read_shift(2);
  return [t, r];
}
function MS(e) {
  return e.l += 4, [0, 0];
}
var _0 = {
  /*::[*/
  1: { n: "PtgExp", f: ZT },
  /*::[*/
  2: { n: "PtgTbl", f: pS },
  /*::[*/
  3: { n: "PtgAdd", f: ct },
  /*::[*/
  4: { n: "PtgSub", f: ct },
  /*::[*/
  5: { n: "PtgMul", f: ct },
  /*::[*/
  6: { n: "PtgDiv", f: ct },
  /*::[*/
  7: { n: "PtgPower", f: ct },
  /*::[*/
  8: { n: "PtgConcat", f: ct },
  /*::[*/
  9: { n: "PtgLt", f: ct },
  /*::[*/
  10: { n: "PtgLe", f: ct },
  /*::[*/
  11: { n: "PtgEq", f: ct },
  /*::[*/
  12: { n: "PtgGe", f: ct },
  /*::[*/
  13: { n: "PtgGt", f: ct },
  /*::[*/
  14: { n: "PtgNe", f: ct },
  /*::[*/
  15: { n: "PtgIsect", f: ct },
  /*::[*/
  16: { n: "PtgUnion", f: ct },
  /*::[*/
  17: { n: "PtgRange", f: ct },
  /*::[*/
  18: { n: "PtgUplus", f: ct },
  /*::[*/
  19: { n: "PtgUminus", f: ct },
  /*::[*/
  20: { n: "PtgPercent", f: ct },
  /*::[*/
  21: { n: "PtgParen", f: ct },
  /*::[*/
  22: { n: "PtgMissArg", f: ct },
  /*::[*/
  23: { n: "PtgStr", f: rS },
  /*::[*/
  26: { n: "PtgSheet", f: OS },
  /*::[*/
  27: { n: "PtgEndSheet", f: DS },
  /*::[*/
  28: { n: "PtgErr", f: JT },
  /*::[*/
  29: { n: "PtgBool", f: eS },
  /*::[*/
  30: { n: "PtgInt", f: QT },
  /*::[*/
  31: { n: "PtgNum", f: tS },
  /*::[*/
  32: { n: "PtgArray", f: LT },
  /*::[*/
  33: { n: "PtgFunc", f: GT },
  /*::[*/
  34: { n: "PtgFuncVar", f: XT },
  /*::[*/
  35: { n: "PtgName", f: aS },
  /*::[*/
  36: { n: "PtgRef", f: YT },
  /*::[*/
  37: { n: "PtgArea", f: CT },
  /*::[*/
  38: { n: "PtgMemArea", f: cS },
  /*::[*/
  39: { n: "PtgMemErr", f: dS },
  /*::[*/
  40: { n: "PtgMemNoMem", f: gS },
  /*::[*/
  41: { n: "PtgMemFunc", f: fS },
  /*::[*/
  42: { n: "PtgRefErr", f: hS },
  /*::[*/
  43: { n: "PtgAreaErr", f: PT },
  /*::[*/
  44: { n: "PtgRefN", f: jT },
  /*::[*/
  45: { n: "PtgAreaN", f: IT },
  /*::[*/
  46: { n: "PtgMemAreaN", f: FS },
  /*::[*/
  47: { n: "PtgMemNoMemN", f: CS },
  /*::[*/
  57: { n: "PtgNameX", f: oS },
  /*::[*/
  58: { n: "PtgRef3d", f: $T },
  /*::[*/
  59: { n: "PtgArea3d", f: MT },
  /*::[*/
  60: { n: "PtgRefErr3d", f: uS },
  /*::[*/
  61: { n: "PtgAreaErr3d", f: RT },
  /*::[*/
  255: {}
}, PS = {
  /*::[*/
  64: 32,
  /*::[*/
  96: 32,
  /*::[*/
  65: 33,
  /*::[*/
  97: 33,
  /*::[*/
  66: 34,
  /*::[*/
  98: 34,
  /*::[*/
  67: 35,
  /*::[*/
  99: 35,
  /*::[*/
  68: 36,
  /*::[*/
  100: 36,
  /*::[*/
  69: 37,
  /*::[*/
  101: 37,
  /*::[*/
  70: 38,
  /*::[*/
  102: 38,
  /*::[*/
  71: 39,
  /*::[*/
  103: 39,
  /*::[*/
  72: 40,
  /*::[*/
  104: 40,
  /*::[*/
  73: 41,
  /*::[*/
  105: 41,
  /*::[*/
  74: 42,
  /*::[*/
  106: 42,
  /*::[*/
  75: 43,
  /*::[*/
  107: 43,
  /*::[*/
  76: 44,
  /*::[*/
  108: 44,
  /*::[*/
  77: 45,
  /*::[*/
  109: 45,
  /*::[*/
  78: 46,
  /*::[*/
  110: 46,
  /*::[*/
  79: 47,
  /*::[*/
  111: 47,
  /*::[*/
  88: 34,
  /*::[*/
  120: 34,
  /*::[*/
  89: 57,
  /*::[*/
  121: 57,
  /*::[*/
  90: 58,
  /*::[*/
  122: 58,
  /*::[*/
  91: 59,
  /*::[*/
  123: 59,
  /*::[*/
  92: 60,
  /*::[*/
  124: 60,
  /*::[*/
  93: 61,
  /*::[*/
  125: 61
}, RS = {
  /*::[*/
  1: { n: "PtgElfLel", f: Kd },
  /*::[*/
  2: { n: "PtgElfRw", f: SS },
  /*::[*/
  3: { n: "PtgElfCol", f: mS },
  /*::[*/
  6: { n: "PtgElfRwV", f: bS },
  /*::[*/
  7: { n: "PtgElfColV", f: vS },
  /*::[*/
  10: { n: "PtgElfRadical", f: yS },
  /*::[*/
  11: { n: "PtgElfRadicalS", f: TS },
  /*::[*/
  13: { n: "PtgElfColS", f: xS },
  /*::[*/
  15: { n: "PtgElfColSV", f: _S },
  /*::[*/
  16: { n: "PtgElfRadicalLel", f: wS },
  /*::[*/
  25: { n: "PtgList", f: AS },
  /*::[*/
  29: { n: "PtgSxName", f: kS },
  /*::[*/
  255: {}
}, IS = {
  /*::[*/
  0: { n: "PtgAttrNoop", f: MS },
  /*::[*/
  1: { n: "PtgAttrSemi", f: zT },
  /*::[*/
  2: { n: "PtgAttrIf", f: WT },
  /*::[*/
  4: { n: "PtgAttrChoose", f: NT },
  /*::[*/
  8: { n: "PtgAttrGoto", f: BT },
  /*::[*/
  16: { n: "PtgAttrSum", f: qT },
  /*::[*/
  32: { n: "PtgAttrBaxcel", f: x0 },
  /*::[*/
  33: { n: "PtgAttrBaxcel", f: x0 },
  /*::[*/
  64: { n: "PtgAttrSpace", f: HT },
  /*::[*/
  65: { n: "PtgAttrSpaceSemi", f: VT },
  /*::[*/
  128: { n: "PtgAttrIfError", f: UT },
  /*::[*/
  255: {}
};
function LS(e, t, r, n) {
  if (n.biff < 8)
    return Pr(e, t);
  for (var i = e.l + t, s = [], a = 0; a !== r.length; ++a)
    switch (r[a][0]) {
      case "PtgArray":
        r[a][1] = sS(e, 0, n), s.push(r[a][1]);
        break;
      case "PtgMemArea":
        r[a][2] = iS(e, r[a][1], n), s.push(r[a][2]);
        break;
      case "PtgExp":
        n && n.biff == 12 && (r[a][1][1] = e.read_shift(4), s.push(r[a][1]));
        break;
      case "PtgList":
      case "PtgElfRadicalS":
      case "PtgElfColS":
      case "PtgElfColSV":
        throw "Unsupported " + r[a][0];
    }
  return t = i - e.l, t !== 0 && s.push(Pr(e, t)), s;
}
function NS(e, t, r) {
  for (var n = e.l + t, i, s, a = []; n != e.l; )
    t = n - e.l, s = e[e.l], i = _0[s] || _0[PS[s]], (s === 24 || s === 25) && (i = (s === 24 ? RS : IS)[e[e.l + 1]]), !i || !i.f ? Pr(e, t) : a.push([i.n, i.f(e, t, r)]);
  return a;
}
function BS(e) {
  for (var t = [], r = 0; r < e.length; ++r) {
    for (var n = e[r], i = [], s = 0; s < n.length; ++s) {
      var a = n[s];
      if (a)
        switch (a[0]) {
          case 2:
            i.push('"' + a[1].replace(/"/g, '""') + '"');
            break;
          default:
            i.push(a[1]);
        }
      else
        i.push("");
    }
    t.push(i.join(","));
  }
  return t.join(";");
}
var WS = {
  PtgAdd: "+",
  PtgConcat: "&",
  PtgDiv: "/",
  PtgEq: "=",
  PtgGe: ">=",
  PtgGt: ">",
  PtgLe: "<=",
  PtgLt: "<",
  PtgMul: "*",
  PtgNe: "<>",
  PtgPower: "^",
  PtgSub: "-"
};
function US(e, t) {
  if (!e && !(t && t.biff <= 5 && t.biff >= 2))
    throw new Error("empty sheet name");
  return /[^\w\u4E00-\u9FFF\u3040-\u30FF]/.test(e) ? "'" + e + "'" : e;
}
function qd(e, t, r) {
  if (!e)
    return "SH33TJSERR0";
  if (r.biff > 8 && (!e.XTI || !e.XTI[t]))
    return e.SheetNames[t];
  if (!e.XTI)
    return "SH33TJSERR6";
  var n = e.XTI[t];
  if (r.biff < 8)
    return t > 1e4 && (t -= 65536), t < 0 && (t = -t), t == 0 ? "" : e.XTI[t - 1];
  if (!n)
    return "SH33TJSERR1";
  var i = "";
  if (r.biff > 8)
    switch (e[n[0]][0]) {
      case 357:
        return i = n[1] == -1 ? "#REF" : e.SheetNames[n[1]], n[1] == n[2] ? i : i + ":" + e.SheetNames[n[2]];
      case 358:
        return r.SID != null ? e.SheetNames[r.SID] : "SH33TJSSAME" + e[n[0]][0];
      case 355:
      default:
        return "SH33TJSSRC" + e[n[0]][0];
    }
  switch (e[n[0]][0][0]) {
    case 1025:
      return i = n[1] == -1 ? "#REF" : e.SheetNames[n[1]] || "SH33TJSERR3", n[1] == n[2] ? i : i + ":" + e.SheetNames[n[2]];
    case 14849:
      return e[n[0]].slice(1).map(function(s) {
        return s.Name;
      }).join(";;");
    default:
      return e[n[0]][0][3] ? (i = n[1] == -1 ? "#REF" : e[n[0]][0][3][n[1]] || "SH33TJSERR4", n[1] == n[2] ? i : i + ":" + e[n[0]][0][3][n[2]]) : "SH33TJSERR2";
  }
}
function v0(e, t, r) {
  var n = qd(e, t, r);
  return n == "#REF" ? n : US(n, r);
}
function Li(e, t, r, n, i) {
  var s = i && i.biff || 8, a = (
    /*range != null ? range :*/
    { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } }
  ), o = [], l, c, f, h = 0, u = 0, d, p = "";
  if (!e[0] || !e[0][0])
    return "";
  for (var g = -1, m = "", v = 0, w = e[0].length; v < w; ++v) {
    var S = e[0][v];
    switch (S[0]) {
      case "PtgUminus":
        o.push("-" + o.pop());
        break;
      case "PtgUplus":
        o.push("+" + o.pop());
        break;
      case "PtgPercent":
        o.push(o.pop() + "%");
        break;
      case "PtgAdd":
      case "PtgConcat":
      case "PtgDiv":
      case "PtgEq":
      case "PtgGe":
      case "PtgGt":
      case "PtgLe":
      case "PtgLt":
      case "PtgMul":
      case "PtgNe":
      case "PtgPower":
      case "PtgSub":
        if (l = o.pop(), c = o.pop(), g >= 0) {
          switch (e[0][g][1][0]) {
            case 0:
              m = rt(" ", e[0][g][1][1]);
              break;
            case 1:
              m = rt("\r", e[0][g][1][1]);
              break;
            default:
              if (m = "", i.WTF)
                throw new Error("Unexpected PtgAttrSpaceType " + e[0][g][1][0]);
          }
          c = c + m, g = -1;
        }
        o.push(c + WS[S[0]] + l);
        break;
      case "PtgIsect":
        l = o.pop(), c = o.pop(), o.push(c + " " + l);
        break;
      case "PtgUnion":
        l = o.pop(), c = o.pop(), o.push(c + "," + l);
        break;
      case "PtgRange":
        l = o.pop(), c = o.pop(), o.push(c + ":" + l);
        break;
      case "PtgAttrChoose":
        break;
      case "PtgAttrGoto":
        break;
      case "PtgAttrIf":
        break;
      case "PtgAttrIfError":
        break;
      case "PtgRef":
        f = _s(S[1][1], a, i), o.push(vs(f, s));
        break;
      case "PtgRefN":
        f = r ? _s(S[1][1], r, i) : S[1][1], o.push(vs(f, s));
        break;
      case "PtgRef3d":
        h = /*::Number(*/
        S[1][1], f = _s(S[1][2], a, i), p = v0(n, h, i), o.push(p + "!" + vs(f, s));
        break;
      case "PtgFunc":
      case "PtgFuncVar":
        var D = S[1][0], P = S[1][1];
        D || (D = 0), D &= 127;
        var N = D == 0 ? [] : o.slice(-D);
        o.length -= D, P === "User" && (P = N.shift()), o.push(P + "(" + N.join(",") + ")");
        break;
      case "PtgBool":
        o.push(S[1] ? "TRUE" : "FALSE");
        break;
      case "PtgInt":
        o.push(
          /*::String(*/
          S[1]
          /*::)*/
        );
        break;
      case "PtgNum":
        o.push(String(S[1]));
        break;
      case "PtgStr":
        o.push('"' + S[1].replace(/"/g, '""') + '"');
        break;
      case "PtgErr":
        o.push(
          /*::String(*/
          S[1]
          /*::)*/
        );
        break;
      case "PtgAreaN":
        d = n0(S[1][1], r ? { s: r } : a, i), o.push(cl(d, i));
        break;
      case "PtgArea":
        d = n0(S[1][1], a, i), o.push(cl(d, i));
        break;
      case "PtgArea3d":
        h = /*::Number(*/
        S[1][1], d = S[1][2], p = v0(n, h, i), o.push(p + "!" + cl(d, i));
        break;
      case "PtgAttrSum":
        o.push("SUM(" + o.pop() + ")");
        break;
      case "PtgAttrBaxcel":
      case "PtgAttrSemi":
        break;
      case "PtgName":
        u = S[1][2];
        var O = (n.names || [])[u - 1] || (n[0] || [])[u], I = O ? O.Name : "SH33TJSNAME" + String(u);
        I && I.slice(0, 6) == "_xlfn." && !i.xlfn && (I = I.slice(6)), o.push(I);
        break;
      case "PtgNameX":
        var R = S[1][1];
        u = S[1][2];
        var z;
        if (i.biff <= 5)
          R < 0 && (R = -R), n[R] && (z = n[R][u]);
        else {
          var H = "";
          if (((n[R] || [])[0] || [])[0] == 14849 || (((n[R] || [])[0] || [])[0] == 1025 ? n[R][u] && n[R][u].itab > 0 && (H = n.SheetNames[n[R][u].itab - 1] + "!") : H = n.SheetNames[u - 1] + "!"), n[R] && n[R][u])
            H += n[R][u].Name;
          else if (n[0] && n[0][u])
            H += n[0][u].Name;
          else {
            var V = (qd(n, R, i) || "").split(";;");
            V[u - 1] ? H = V[u - 1] : H += "SH33TJSERRX";
          }
          o.push(H);
          break;
        }
        z || (z = { Name: "SH33TJSERRY" }), o.push(z.Name);
        break;
      case "PtgParen":
        var ee = "(", ge = ")";
        if (g >= 0) {
          switch (m = "", e[0][g][1][0]) {
            case 2:
              ee = rt(" ", e[0][g][1][1]) + ee;
              break;
            case 3:
              ee = rt("\r", e[0][g][1][1]) + ee;
              break;
            case 4:
              ge = rt(" ", e[0][g][1][1]) + ge;
              break;
            case 5:
              ge = rt("\r", e[0][g][1][1]) + ge;
              break;
            default:
              if (i.WTF)
                throw new Error("Unexpected PtgAttrSpaceType " + e[0][g][1][0]);
          }
          g = -1;
        }
        o.push(ee + o.pop() + ge);
        break;
      case "PtgRefErr":
        o.push("#REF!");
        break;
      case "PtgRefErr3d":
        o.push("#REF!");
        break;
      case "PtgExp":
        f = { c: S[1][1], r: S[1][0] };
        var ae = { c: r.c, r: r.r };
        if (n.sharedf[Le(f)]) {
          var de = n.sharedf[Le(f)];
          o.push(Li(de, a, ae, n, i));
        } else {
          var pe = !1;
          for (l = 0; l != n.arrayf.length; ++l)
            if (c = n.arrayf[l], !(f.c < c[0].s.c || f.c > c[0].e.c) && !(f.r < c[0].s.r || f.r > c[0].e.r)) {
              o.push(Li(c[1], a, ae, n, i)), pe = !0;
              break;
            }
          pe || o.push(
            /*::String(*/
            S[1]
            /*::)*/
          );
        }
        break;
      case "PtgArray":
        o.push("{" + BS(
          /*::(*/
          S[1]
          /*:: :any)*/
        ) + "}");
        break;
      case "PtgMemArea":
        break;
      case "PtgAttrSpace":
      case "PtgAttrSpaceSemi":
        g = v;
        break;
      case "PtgTbl":
        break;
      case "PtgMemErr":
        break;
      case "PtgMissArg":
        o.push("");
        break;
      case "PtgAreaErr":
        o.push("#REF!");
        break;
      case "PtgAreaErr3d":
        o.push("#REF!");
        break;
      case "PtgList":
        o.push("Table" + S[1].idx + "[#" + S[1].rt + "]");
        break;
      case "PtgMemAreaN":
      case "PtgMemNoMemN":
      case "PtgAttrNoop":
      case "PtgSheet":
      case "PtgEndSheet":
        break;
      case "PtgMemFunc":
        break;
      case "PtgMemNoMem":
        break;
      case "PtgElfCol":
      case "PtgElfColS":
      case "PtgElfColSV":
      case "PtgElfColV":
      case "PtgElfLel":
      case "PtgElfRadical":
      case "PtgElfRadicalLel":
      case "PtgElfRadicalS":
      case "PtgElfRw":
      case "PtgElfRwV":
        throw new Error("Unsupported ELFs");
      case "PtgSxName":
        throw new Error("Unrecognized Formula Token: " + String(S));
      default:
        throw new Error("Unrecognized Formula Token: " + String(S));
    }
    var Ue = ["PtgAttrSpace", "PtgAttrSpaceSemi", "PtgAttrGoto"];
    if (i.biff != 3 && g >= 0 && Ue.indexOf(e[0][v][0]) == -1) {
      S = e[0][g];
      var ye = !0;
      switch (S[1][0]) {
        case 4:
          ye = !1;
        case 0:
          m = rt(" ", S[1][1]);
          break;
        case 5:
          ye = !1;
        case 1:
          m = rt("\r", S[1][1]);
          break;
        default:
          if (m = "", i.WTF)
            throw new Error("Unexpected PtgAttrSpaceType " + S[1][0]);
      }
      o.push((ye ? m : "") + o.pop() + (ye ? "" : m)), g = -1;
    }
  }
  if (o.length > 1 && i.WTF)
    throw new Error("bad formula stack");
  return o[0];
}
function zS(e) {
  if (e == null) {
    var t = G(8);
    return t.write_shift(1, 3), t.write_shift(1, 0), t.write_shift(2, 0), t.write_shift(2, 0), t.write_shift(2, 65535), t;
  } else if (typeof e == "number")
    return Jn(e);
  return Jn(0);
}
function HS(e, t, r, n, i) {
  var s = Qn(t, r, i), a = zS(e.v), o = G(6), l = 33;
  o.write_shift(2, l), o.write_shift(4, 0);
  for (var c = G(e.bf.length), f = 0; f < e.bf.length; ++f)
    c[f] = e.bf[f];
  var h = Tt([s, a, o, c]);
  return h;
}
function Oo(e, t, r) {
  var n = e.read_shift(4), i = NS(e, n, r), s = e.read_shift(4), a = s > 0 ? LS(e, s, i, r) : null;
  return [i, a];
}
var VS = Oo, Do = Oo, YS = Oo, jS = Oo, $S = {
  0: "BEEP",
  1: "OPEN",
  2: "OPEN.LINKS",
  3: "CLOSE.ALL",
  4: "SAVE",
  5: "SAVE.AS",
  6: "FILE.DELETE",
  7: "PAGE.SETUP",
  8: "PRINT",
  9: "PRINTER.SETUP",
  10: "QUIT",
  11: "NEW.WINDOW",
  12: "ARRANGE.ALL",
  13: "WINDOW.SIZE",
  14: "WINDOW.MOVE",
  15: "FULL",
  16: "CLOSE",
  17: "RUN",
  22: "SET.PRINT.AREA",
  23: "SET.PRINT.TITLES",
  24: "SET.PAGE.BREAK",
  25: "REMOVE.PAGE.BREAK",
  26: "FONT",
  27: "DISPLAY",
  28: "PROTECT.DOCUMENT",
  29: "PRECISION",
  30: "A1.R1C1",
  31: "CALCULATE.NOW",
  32: "CALCULATION",
  34: "DATA.FIND",
  35: "EXTRACT",
  36: "DATA.DELETE",
  37: "SET.DATABASE",
  38: "SET.CRITERIA",
  39: "SORT",
  40: "DATA.SERIES",
  41: "TABLE",
  42: "FORMAT.NUMBER",
  43: "ALIGNMENT",
  44: "STYLE",
  45: "BORDER",
  46: "CELL.PROTECTION",
  47: "COLUMN.WIDTH",
  48: "UNDO",
  49: "CUT",
  50: "COPY",
  51: "PASTE",
  52: "CLEAR",
  53: "PASTE.SPECIAL",
  54: "EDIT.DELETE",
  55: "INSERT",
  56: "FILL.RIGHT",
  57: "FILL.DOWN",
  61: "DEFINE.NAME",
  62: "CREATE.NAMES",
  63: "FORMULA.GOTO",
  64: "FORMULA.FIND",
  65: "SELECT.LAST.CELL",
  66: "SHOW.ACTIVE.CELL",
  67: "GALLERY.AREA",
  68: "GALLERY.BAR",
  69: "GALLERY.COLUMN",
  70: "GALLERY.LINE",
  71: "GALLERY.PIE",
  72: "GALLERY.SCATTER",
  73: "COMBINATION",
  74: "PREFERRED",
  75: "ADD.OVERLAY",
  76: "GRIDLINES",
  77: "SET.PREFERRED",
  78: "AXES",
  79: "LEGEND",
  80: "ATTACH.TEXT",
  81: "ADD.ARROW",
  82: "SELECT.CHART",
  83: "SELECT.PLOT.AREA",
  84: "PATTERNS",
  85: "MAIN.CHART",
  86: "OVERLAY",
  87: "SCALE",
  88: "FORMAT.LEGEND",
  89: "FORMAT.TEXT",
  90: "EDIT.REPEAT",
  91: "PARSE",
  92: "JUSTIFY",
  93: "HIDE",
  94: "UNHIDE",
  95: "WORKSPACE",
  96: "FORMULA",
  97: "FORMULA.FILL",
  98: "FORMULA.ARRAY",
  99: "DATA.FIND.NEXT",
  100: "DATA.FIND.PREV",
  101: "FORMULA.FIND.NEXT",
  102: "FORMULA.FIND.PREV",
  103: "ACTIVATE",
  104: "ACTIVATE.NEXT",
  105: "ACTIVATE.PREV",
  106: "UNLOCKED.NEXT",
  107: "UNLOCKED.PREV",
  108: "COPY.PICTURE",
  109: "SELECT",
  110: "DELETE.NAME",
  111: "DELETE.FORMAT",
  112: "VLINE",
  113: "HLINE",
  114: "VPAGE",
  115: "HPAGE",
  116: "VSCROLL",
  117: "HSCROLL",
  118: "ALERT",
  119: "NEW",
  120: "CANCEL.COPY",
  121: "SHOW.CLIPBOARD",
  122: "MESSAGE",
  124: "PASTE.LINK",
  125: "APP.ACTIVATE",
  126: "DELETE.ARROW",
  127: "ROW.HEIGHT",
  128: "FORMAT.MOVE",
  129: "FORMAT.SIZE",
  130: "FORMULA.REPLACE",
  131: "SEND.KEYS",
  132: "SELECT.SPECIAL",
  133: "APPLY.NAMES",
  134: "REPLACE.FONT",
  135: "FREEZE.PANES",
  136: "SHOW.INFO",
  137: "SPLIT",
  138: "ON.WINDOW",
  139: "ON.DATA",
  140: "DISABLE.INPUT",
  142: "OUTLINE",
  143: "LIST.NAMES",
  144: "FILE.CLOSE",
  145: "SAVE.WORKBOOK",
  146: "DATA.FORM",
  147: "COPY.CHART",
  148: "ON.TIME",
  149: "WAIT",
  150: "FORMAT.FONT",
  151: "FILL.UP",
  152: "FILL.LEFT",
  153: "DELETE.OVERLAY",
  155: "SHORT.MENUS",
  159: "SET.UPDATE.STATUS",
  161: "COLOR.PALETTE",
  162: "DELETE.STYLE",
  163: "WINDOW.RESTORE",
  164: "WINDOW.MAXIMIZE",
  166: "CHANGE.LINK",
  167: "CALCULATE.DOCUMENT",
  168: "ON.KEY",
  169: "APP.RESTORE",
  170: "APP.MOVE",
  171: "APP.SIZE",
  172: "APP.MINIMIZE",
  173: "APP.MAXIMIZE",
  174: "BRING.TO.FRONT",
  175: "SEND.TO.BACK",
  185: "MAIN.CHART.TYPE",
  186: "OVERLAY.CHART.TYPE",
  187: "SELECT.END",
  188: "OPEN.MAIL",
  189: "SEND.MAIL",
  190: "STANDARD.FONT",
  191: "CONSOLIDATE",
  192: "SORT.SPECIAL",
  193: "GALLERY.3D.AREA",
  194: "GALLERY.3D.COLUMN",
  195: "GALLERY.3D.LINE",
  196: "GALLERY.3D.PIE",
  197: "VIEW.3D",
  198: "GOAL.SEEK",
  199: "WORKGROUP",
  200: "FILL.GROUP",
  201: "UPDATE.LINK",
  202: "PROMOTE",
  203: "DEMOTE",
  204: "SHOW.DETAIL",
  206: "UNGROUP",
  207: "OBJECT.PROPERTIES",
  208: "SAVE.NEW.OBJECT",
  209: "SHARE",
  210: "SHARE.NAME",
  211: "DUPLICATE",
  212: "APPLY.STYLE",
  213: "ASSIGN.TO.OBJECT",
  214: "OBJECT.PROTECTION",
  215: "HIDE.OBJECT",
  216: "SET.EXTRACT",
  217: "CREATE.PUBLISHER",
  218: "SUBSCRIBE.TO",
  219: "ATTRIBUTES",
  220: "SHOW.TOOLBAR",
  222: "PRINT.PREVIEW",
  223: "EDIT.COLOR",
  224: "SHOW.LEVELS",
  225: "FORMAT.MAIN",
  226: "FORMAT.OVERLAY",
  227: "ON.RECALC",
  228: "EDIT.SERIES",
  229: "DEFINE.STYLE",
  240: "LINE.PRINT",
  243: "ENTER.DATA",
  249: "GALLERY.RADAR",
  250: "MERGE.STYLES",
  251: "EDITION.OPTIONS",
  252: "PASTE.PICTURE",
  253: "PASTE.PICTURE.LINK",
  254: "SPELLING",
  256: "ZOOM",
  259: "INSERT.OBJECT",
  260: "WINDOW.MINIMIZE",
  265: "SOUND.NOTE",
  266: "SOUND.PLAY",
  267: "FORMAT.SHAPE",
  268: "EXTEND.POLYGON",
  269: "FORMAT.AUTO",
  272: "GALLERY.3D.BAR",
  273: "GALLERY.3D.SURFACE",
  274: "FILL.AUTO",
  276: "CUSTOMIZE.TOOLBAR",
  277: "ADD.TOOL",
  278: "EDIT.OBJECT",
  279: "ON.DOUBLECLICK",
  280: "ON.ENTRY",
  281: "WORKBOOK.ADD",
  282: "WORKBOOK.MOVE",
  283: "WORKBOOK.COPY",
  284: "WORKBOOK.OPTIONS",
  285: "SAVE.WORKSPACE",
  288: "CHART.WIZARD",
  289: "DELETE.TOOL",
  290: "MOVE.TOOL",
  291: "WORKBOOK.SELECT",
  292: "WORKBOOK.ACTIVATE",
  293: "ASSIGN.TO.TOOL",
  295: "COPY.TOOL",
  296: "RESET.TOOL",
  297: "CONSTRAIN.NUMERIC",
  298: "PASTE.TOOL",
  302: "WORKBOOK.NEW",
  305: "SCENARIO.CELLS",
  306: "SCENARIO.DELETE",
  307: "SCENARIO.ADD",
  308: "SCENARIO.EDIT",
  309: "SCENARIO.SHOW",
  310: "SCENARIO.SHOW.NEXT",
  311: "SCENARIO.SUMMARY",
  312: "PIVOT.TABLE.WIZARD",
  313: "PIVOT.FIELD.PROPERTIES",
  314: "PIVOT.FIELD",
  315: "PIVOT.ITEM",
  316: "PIVOT.ADD.FIELDS",
  318: "OPTIONS.CALCULATION",
  319: "OPTIONS.EDIT",
  320: "OPTIONS.VIEW",
  321: "ADDIN.MANAGER",
  322: "MENU.EDITOR",
  323: "ATTACH.TOOLBARS",
  324: "VBAActivate",
  325: "OPTIONS.CHART",
  328: "VBA.INSERT.FILE",
  330: "VBA.PROCEDURE.DEFINITION",
  336: "ROUTING.SLIP",
  338: "ROUTE.DOCUMENT",
  339: "MAIL.LOGON",
  342: "INSERT.PICTURE",
  343: "EDIT.TOOL",
  344: "GALLERY.DOUGHNUT",
  350: "CHART.TREND",
  352: "PIVOT.ITEM.PROPERTIES",
  354: "WORKBOOK.INSERT",
  355: "OPTIONS.TRANSITION",
  356: "OPTIONS.GENERAL",
  370: "FILTER.ADVANCED",
  373: "MAIL.ADD.MAILER",
  374: "MAIL.DELETE.MAILER",
  375: "MAIL.REPLY",
  376: "MAIL.REPLY.ALL",
  377: "MAIL.FORWARD",
  378: "MAIL.NEXT.LETTER",
  379: "DATA.LABEL",
  380: "INSERT.TITLE",
  381: "FONT.PROPERTIES",
  382: "MACRO.OPTIONS",
  383: "WORKBOOK.HIDE",
  384: "WORKBOOK.UNHIDE",
  385: "WORKBOOK.DELETE",
  386: "WORKBOOK.NAME",
  388: "GALLERY.CUSTOM",
  390: "ADD.CHART.AUTOFORMAT",
  391: "DELETE.CHART.AUTOFORMAT",
  392: "CHART.ADD.DATA",
  393: "AUTO.OUTLINE",
  394: "TAB.ORDER",
  395: "SHOW.DIALOG",
  396: "SELECT.ALL",
  397: "UNGROUP.SHEETS",
  398: "SUBTOTAL.CREATE",
  399: "SUBTOTAL.REMOVE",
  400: "RENAME.OBJECT",
  412: "WORKBOOK.SCROLL",
  413: "WORKBOOK.NEXT",
  414: "WORKBOOK.PREV",
  415: "WORKBOOK.TAB.SPLIT",
  416: "FULL.SCREEN",
  417: "WORKBOOK.PROTECT",
  420: "SCROLLBAR.PROPERTIES",
  421: "PIVOT.SHOW.PAGES",
  422: "TEXT.TO.COLUMNS",
  423: "FORMAT.CHARTTYPE",
  424: "LINK.FORMAT",
  425: "TRACER.DISPLAY",
  430: "TRACER.NAVIGATE",
  431: "TRACER.CLEAR",
  432: "TRACER.ERROR",
  433: "PIVOT.FIELD.GROUP",
  434: "PIVOT.FIELD.UNGROUP",
  435: "CHECKBOX.PROPERTIES",
  436: "LABEL.PROPERTIES",
  437: "LISTBOX.PROPERTIES",
  438: "EDITBOX.PROPERTIES",
  439: "PIVOT.REFRESH",
  440: "LINK.COMBO",
  441: "OPEN.TEXT",
  442: "HIDE.DIALOG",
  443: "SET.DIALOG.FOCUS",
  444: "ENABLE.OBJECT",
  445: "PUSHBUTTON.PROPERTIES",
  446: "SET.DIALOG.DEFAULT",
  447: "FILTER",
  448: "FILTER.SHOW.ALL",
  449: "CLEAR.OUTLINE",
  450: "FUNCTION.WIZARD",
  451: "ADD.LIST.ITEM",
  452: "SET.LIST.ITEM",
  453: "REMOVE.LIST.ITEM",
  454: "SELECT.LIST.ITEM",
  455: "SET.CONTROL.VALUE",
  456: "SAVE.COPY.AS",
  458: "OPTIONS.LISTS.ADD",
  459: "OPTIONS.LISTS.DELETE",
  460: "SERIES.AXES",
  461: "SERIES.X",
  462: "SERIES.Y",
  463: "ERRORBAR.X",
  464: "ERRORBAR.Y",
  465: "FORMAT.CHART",
  466: "SERIES.ORDER",
  467: "MAIL.LOGOFF",
  468: "CLEAR.ROUTING.SLIP",
  469: "APP.ACTIVATE.MICROSOFT",
  470: "MAIL.EDIT.MAILER",
  471: "ON.SHEET",
  472: "STANDARD.WIDTH",
  473: "SCENARIO.MERGE",
  474: "SUMMARY.INFO",
  475: "FIND.FILE",
  476: "ACTIVE.CELL.FONT",
  477: "ENABLE.TIPWIZARD",
  478: "VBA.MAKE.ADDIN",
  480: "INSERTDATATABLE",
  481: "WORKGROUP.OPTIONS",
  482: "MAIL.SEND.MAILER",
  485: "AUTOCORRECT",
  489: "POST.DOCUMENT",
  491: "PICKLIST",
  493: "VIEW.SHOW",
  494: "VIEW.DEFINE",
  495: "VIEW.DELETE",
  509: "SHEET.BACKGROUND",
  510: "INSERT.MAP.OBJECT",
  511: "OPTIONS.MENONO",
  517: "MSOCHECKS",
  518: "NORMAL",
  519: "LAYOUT",
  520: "RM.PRINT.AREA",
  521: "CLEAR.PRINT.AREA",
  522: "ADD.PRINT.AREA",
  523: "MOVE.BRK",
  545: "HIDECURR.NOTE",
  546: "HIDEALL.NOTES",
  547: "DELETE.NOTE",
  548: "TRAVERSE.NOTES",
  549: "ACTIVATE.NOTES",
  620: "PROTECT.REVISIONS",
  621: "UNPROTECT.REVISIONS",
  647: "OPTIONS.ME",
  653: "WEB.PUBLISH",
  667: "NEWWEBQUERY",
  673: "PIVOT.TABLE.CHART",
  753: "OPTIONS.SAVE",
  755: "OPTIONS.SPELL",
  808: "HIDEALL.INKANNOTS"
}, Zd = {
  0: "COUNT",
  1: "IF",
  2: "ISNA",
  3: "ISERROR",
  4: "SUM",
  5: "AVERAGE",
  6: "MIN",
  7: "MAX",
  8: "ROW",
  9: "COLUMN",
  10: "NA",
  11: "NPV",
  12: "STDEV",
  13: "DOLLAR",
  14: "FIXED",
  15: "SIN",
  16: "COS",
  17: "TAN",
  18: "ATAN",
  19: "PI",
  20: "SQRT",
  21: "EXP",
  22: "LN",
  23: "LOG10",
  24: "ABS",
  25: "INT",
  26: "SIGN",
  27: "ROUND",
  28: "LOOKUP",
  29: "INDEX",
  30: "REPT",
  31: "MID",
  32: "LEN",
  33: "VALUE",
  34: "TRUE",
  35: "FALSE",
  36: "AND",
  37: "OR",
  38: "NOT",
  39: "MOD",
  40: "DCOUNT",
  41: "DSUM",
  42: "DAVERAGE",
  43: "DMIN",
  44: "DMAX",
  45: "DSTDEV",
  46: "VAR",
  47: "DVAR",
  48: "TEXT",
  49: "LINEST",
  50: "TREND",
  51: "LOGEST",
  52: "GROWTH",
  53: "GOTO",
  54: "HALT",
  55: "RETURN",
  56: "PV",
  57: "FV",
  58: "NPER",
  59: "PMT",
  60: "RATE",
  61: "MIRR",
  62: "IRR",
  63: "RAND",
  64: "MATCH",
  65: "DATE",
  66: "TIME",
  67: "DAY",
  68: "MONTH",
  69: "YEAR",
  70: "WEEKDAY",
  71: "HOUR",
  72: "MINUTE",
  73: "SECOND",
  74: "NOW",
  75: "AREAS",
  76: "ROWS",
  77: "COLUMNS",
  78: "OFFSET",
  79: "ABSREF",
  80: "RELREF",
  81: "ARGUMENT",
  82: "SEARCH",
  83: "TRANSPOSE",
  84: "ERROR",
  85: "STEP",
  86: "TYPE",
  87: "ECHO",
  88: "SET.NAME",
  89: "CALLER",
  90: "DEREF",
  91: "WINDOWS",
  92: "SERIES",
  93: "DOCUMENTS",
  94: "ACTIVE.CELL",
  95: "SELECTION",
  96: "RESULT",
  97: "ATAN2",
  98: "ASIN",
  99: "ACOS",
  100: "CHOOSE",
  101: "HLOOKUP",
  102: "VLOOKUP",
  103: "LINKS",
  104: "INPUT",
  105: "ISREF",
  106: "GET.FORMULA",
  107: "GET.NAME",
  108: "SET.VALUE",
  109: "LOG",
  110: "EXEC",
  111: "CHAR",
  112: "LOWER",
  113: "UPPER",
  114: "PROPER",
  115: "LEFT",
  116: "RIGHT",
  117: "EXACT",
  118: "TRIM",
  119: "REPLACE",
  120: "SUBSTITUTE",
  121: "CODE",
  122: "NAMES",
  123: "DIRECTORY",
  124: "FIND",
  125: "CELL",
  126: "ISERR",
  127: "ISTEXT",
  128: "ISNUMBER",
  129: "ISBLANK",
  130: "T",
  131: "N",
  132: "FOPEN",
  133: "FCLOSE",
  134: "FSIZE",
  135: "FREADLN",
  136: "FREAD",
  137: "FWRITELN",
  138: "FWRITE",
  139: "FPOS",
  140: "DATEVALUE",
  141: "TIMEVALUE",
  142: "SLN",
  143: "SYD",
  144: "DDB",
  145: "GET.DEF",
  146: "REFTEXT",
  147: "TEXTREF",
  148: "INDIRECT",
  149: "REGISTER",
  150: "CALL",
  151: "ADD.BAR",
  152: "ADD.MENU",
  153: "ADD.COMMAND",
  154: "ENABLE.COMMAND",
  155: "CHECK.COMMAND",
  156: "RENAME.COMMAND",
  157: "SHOW.BAR",
  158: "DELETE.MENU",
  159: "DELETE.COMMAND",
  160: "GET.CHART.ITEM",
  161: "DIALOG.BOX",
  162: "CLEAN",
  163: "MDETERM",
  164: "MINVERSE",
  165: "MMULT",
  166: "FILES",
  167: "IPMT",
  168: "PPMT",
  169: "COUNTA",
  170: "CANCEL.KEY",
  171: "FOR",
  172: "WHILE",
  173: "BREAK",
  174: "NEXT",
  175: "INITIATE",
  176: "REQUEST",
  177: "POKE",
  178: "EXECUTE",
  179: "TERMINATE",
  180: "RESTART",
  181: "HELP",
  182: "GET.BAR",
  183: "PRODUCT",
  184: "FACT",
  185: "GET.CELL",
  186: "GET.WORKSPACE",
  187: "GET.WINDOW",
  188: "GET.DOCUMENT",
  189: "DPRODUCT",
  190: "ISNONTEXT",
  191: "GET.NOTE",
  192: "NOTE",
  193: "STDEVP",
  194: "VARP",
  195: "DSTDEVP",
  196: "DVARP",
  197: "TRUNC",
  198: "ISLOGICAL",
  199: "DCOUNTA",
  200: "DELETE.BAR",
  201: "UNREGISTER",
  204: "USDOLLAR",
  205: "FINDB",
  206: "SEARCHB",
  207: "REPLACEB",
  208: "LEFTB",
  209: "RIGHTB",
  210: "MIDB",
  211: "LENB",
  212: "ROUNDUP",
  213: "ROUNDDOWN",
  214: "ASC",
  215: "DBCS",
  216: "RANK",
  219: "ADDRESS",
  220: "DAYS360",
  221: "TODAY",
  222: "VDB",
  223: "ELSE",
  224: "ELSE.IF",
  225: "END.IF",
  226: "FOR.CELL",
  227: "MEDIAN",
  228: "SUMPRODUCT",
  229: "SINH",
  230: "COSH",
  231: "TANH",
  232: "ASINH",
  233: "ACOSH",
  234: "ATANH",
  235: "DGET",
  236: "CREATE.OBJECT",
  237: "VOLATILE",
  238: "LAST.ERROR",
  239: "CUSTOM.UNDO",
  240: "CUSTOM.REPEAT",
  241: "FORMULA.CONVERT",
  242: "GET.LINK.INFO",
  243: "TEXT.BOX",
  244: "INFO",
  245: "GROUP",
  246: "GET.OBJECT",
  247: "DB",
  248: "PAUSE",
  251: "RESUME",
  252: "FREQUENCY",
  253: "ADD.TOOLBAR",
  254: "DELETE.TOOLBAR",
  255: "User",
  256: "RESET.TOOLBAR",
  257: "EVALUATE",
  258: "GET.TOOLBAR",
  259: "GET.TOOL",
  260: "SPELLING.CHECK",
  261: "ERROR.TYPE",
  262: "APP.TITLE",
  263: "WINDOW.TITLE",
  264: "SAVE.TOOLBAR",
  265: "ENABLE.TOOL",
  266: "PRESS.TOOL",
  267: "REGISTER.ID",
  268: "GET.WORKBOOK",
  269: "AVEDEV",
  270: "BETADIST",
  271: "GAMMALN",
  272: "BETAINV",
  273: "BINOMDIST",
  274: "CHIDIST",
  275: "CHIINV",
  276: "COMBIN",
  277: "CONFIDENCE",
  278: "CRITBINOM",
  279: "EVEN",
  280: "EXPONDIST",
  281: "FDIST",
  282: "FINV",
  283: "FISHER",
  284: "FISHERINV",
  285: "FLOOR",
  286: "GAMMADIST",
  287: "GAMMAINV",
  288: "CEILING",
  289: "HYPGEOMDIST",
  290: "LOGNORMDIST",
  291: "LOGINV",
  292: "NEGBINOMDIST",
  293: "NORMDIST",
  294: "NORMSDIST",
  295: "NORMINV",
  296: "NORMSINV",
  297: "STANDARDIZE",
  298: "ODD",
  299: "PERMUT",
  300: "POISSON",
  301: "TDIST",
  302: "WEIBULL",
  303: "SUMXMY2",
  304: "SUMX2MY2",
  305: "SUMX2PY2",
  306: "CHITEST",
  307: "CORREL",
  308: "COVAR",
  309: "FORECAST",
  310: "FTEST",
  311: "INTERCEPT",
  312: "PEARSON",
  313: "RSQ",
  314: "STEYX",
  315: "SLOPE",
  316: "TTEST",
  317: "PROB",
  318: "DEVSQ",
  319: "GEOMEAN",
  320: "HARMEAN",
  321: "SUMSQ",
  322: "KURT",
  323: "SKEW",
  324: "ZTEST",
  325: "LARGE",
  326: "SMALL",
  327: "QUARTILE",
  328: "PERCENTILE",
  329: "PERCENTRANK",
  330: "MODE",
  331: "TRIMMEAN",
  332: "TINV",
  334: "MOVIE.COMMAND",
  335: "GET.MOVIE",
  336: "CONCATENATE",
  337: "POWER",
  338: "PIVOT.ADD.DATA",
  339: "GET.PIVOT.TABLE",
  340: "GET.PIVOT.FIELD",
  341: "GET.PIVOT.ITEM",
  342: "RADIANS",
  343: "DEGREES",
  344: "SUBTOTAL",
  345: "SUMIF",
  346: "COUNTIF",
  347: "COUNTBLANK",
  348: "SCENARIO.GET",
  349: "OPTIONS.LISTS.GET",
  350: "ISPMT",
  351: "DATEDIF",
  352: "DATESTRING",
  353: "NUMBERSTRING",
  354: "ROMAN",
  355: "OPEN.DIALOG",
  356: "SAVE.DIALOG",
  357: "VIEW.GET",
  358: "GETPIVOTDATA",
  359: "HYPERLINK",
  360: "PHONETIC",
  361: "AVERAGEA",
  362: "MAXA",
  363: "MINA",
  364: "STDEVPA",
  365: "VARPA",
  366: "STDEVA",
  367: "VARA",
  368: "BAHTTEXT",
  369: "THAIDAYOFWEEK",
  370: "THAIDIGIT",
  371: "THAIMONTHOFYEAR",
  372: "THAINUMSOUND",
  373: "THAINUMSTRING",
  374: "THAISTRINGLENGTH",
  375: "ISTHAIDIGIT",
  376: "ROUNDBAHTDOWN",
  377: "ROUNDBAHTUP",
  378: "THAIYEAR",
  379: "RTD",
  380: "CUBEVALUE",
  381: "CUBEMEMBER",
  382: "CUBEMEMBERPROPERTY",
  383: "CUBERANKEDMEMBER",
  384: "HEX2BIN",
  385: "HEX2DEC",
  386: "HEX2OCT",
  387: "DEC2BIN",
  388: "DEC2HEX",
  389: "DEC2OCT",
  390: "OCT2BIN",
  391: "OCT2HEX",
  392: "OCT2DEC",
  393: "BIN2DEC",
  394: "BIN2OCT",
  395: "BIN2HEX",
  396: "IMSUB",
  397: "IMDIV",
  398: "IMPOWER",
  399: "IMABS",
  400: "IMSQRT",
  401: "IMLN",
  402: "IMLOG2",
  403: "IMLOG10",
  404: "IMSIN",
  405: "IMCOS",
  406: "IMEXP",
  407: "IMARGUMENT",
  408: "IMCONJUGATE",
  409: "IMAGINARY",
  410: "IMREAL",
  411: "COMPLEX",
  412: "IMSUM",
  413: "IMPRODUCT",
  414: "SERIESSUM",
  415: "FACTDOUBLE",
  416: "SQRTPI",
  417: "QUOTIENT",
  418: "DELTA",
  419: "GESTEP",
  420: "ISEVEN",
  421: "ISODD",
  422: "MROUND",
  423: "ERF",
  424: "ERFC",
  425: "BESSELJ",
  426: "BESSELK",
  427: "BESSELY",
  428: "BESSELI",
  429: "XIRR",
  430: "XNPV",
  431: "PRICEMAT",
  432: "YIELDMAT",
  433: "INTRATE",
  434: "RECEIVED",
  435: "DISC",
  436: "PRICEDISC",
  437: "YIELDDISC",
  438: "TBILLEQ",
  439: "TBILLPRICE",
  440: "TBILLYIELD",
  441: "PRICE",
  442: "YIELD",
  443: "DOLLARDE",
  444: "DOLLARFR",
  445: "NOMINAL",
  446: "EFFECT",
  447: "CUMPRINC",
  448: "CUMIPMT",
  449: "EDATE",
  450: "EOMONTH",
  451: "YEARFRAC",
  452: "COUPDAYBS",
  453: "COUPDAYS",
  454: "COUPDAYSNC",
  455: "COUPNCD",
  456: "COUPNUM",
  457: "COUPPCD",
  458: "DURATION",
  459: "MDURATION",
  460: "ODDLPRICE",
  461: "ODDLYIELD",
  462: "ODDFPRICE",
  463: "ODDFYIELD",
  464: "RANDBETWEEN",
  465: "WEEKNUM",
  466: "AMORDEGRC",
  467: "AMORLINC",
  468: "CONVERT",
  724: "SHEETJS",
  469: "ACCRINT",
  470: "ACCRINTM",
  471: "WORKDAY",
  472: "NETWORKDAYS",
  473: "GCD",
  474: "MULTINOMIAL",
  475: "LCM",
  476: "FVSCHEDULE",
  477: "CUBEKPIMEMBER",
  478: "CUBESET",
  479: "CUBESETCOUNT",
  480: "IFERROR",
  481: "COUNTIFS",
  482: "SUMIFS",
  483: "AVERAGEIF",
  484: "AVERAGEIFS"
}, GS = {
  2: 1,
  3: 1,
  10: 0,
  15: 1,
  16: 1,
  17: 1,
  18: 1,
  19: 0,
  20: 1,
  21: 1,
  22: 1,
  23: 1,
  24: 1,
  25: 1,
  26: 1,
  27: 2,
  30: 2,
  31: 3,
  32: 1,
  33: 1,
  34: 0,
  35: 0,
  38: 1,
  39: 2,
  40: 3,
  41: 3,
  42: 3,
  43: 3,
  44: 3,
  45: 3,
  47: 3,
  48: 2,
  53: 1,
  61: 3,
  63: 0,
  65: 3,
  66: 3,
  67: 1,
  68: 1,
  69: 1,
  70: 1,
  71: 1,
  72: 1,
  73: 1,
  74: 0,
  75: 1,
  76: 1,
  77: 1,
  79: 2,
  80: 2,
  83: 1,
  85: 0,
  86: 1,
  89: 0,
  90: 1,
  94: 0,
  95: 0,
  97: 2,
  98: 1,
  99: 1,
  101: 3,
  102: 3,
  105: 1,
  106: 1,
  108: 2,
  111: 1,
  112: 1,
  113: 1,
  114: 1,
  117: 2,
  118: 1,
  119: 4,
  121: 1,
  126: 1,
  127: 1,
  128: 1,
  129: 1,
  130: 1,
  131: 1,
  133: 1,
  134: 1,
  135: 1,
  136: 2,
  137: 2,
  138: 2,
  140: 1,
  141: 1,
  142: 3,
  143: 4,
  144: 4,
  161: 1,
  162: 1,
  163: 1,
  164: 1,
  165: 2,
  172: 1,
  175: 2,
  176: 2,
  177: 3,
  178: 2,
  179: 1,
  184: 1,
  186: 1,
  189: 3,
  190: 1,
  195: 3,
  196: 3,
  197: 1,
  198: 1,
  199: 3,
  201: 1,
  207: 4,
  210: 3,
  211: 1,
  212: 2,
  213: 2,
  214: 1,
  215: 1,
  225: 0,
  229: 1,
  230: 1,
  231: 1,
  232: 1,
  233: 1,
  234: 1,
  235: 3,
  244: 1,
  247: 4,
  252: 2,
  257: 1,
  261: 1,
  271: 1,
  273: 4,
  274: 2,
  275: 2,
  276: 2,
  277: 3,
  278: 3,
  279: 1,
  280: 3,
  281: 3,
  282: 3,
  283: 1,
  284: 1,
  285: 2,
  286: 4,
  287: 3,
  288: 2,
  289: 4,
  290: 3,
  291: 3,
  292: 3,
  293: 4,
  294: 1,
  295: 3,
  296: 1,
  297: 3,
  298: 1,
  299: 2,
  300: 3,
  301: 3,
  302: 4,
  303: 2,
  304: 2,
  305: 2,
  306: 2,
  307: 2,
  308: 2,
  309: 3,
  310: 2,
  311: 2,
  312: 2,
  313: 2,
  314: 2,
  315: 2,
  316: 4,
  325: 2,
  326: 2,
  327: 2,
  328: 2,
  331: 2,
  332: 2,
  337: 2,
  342: 1,
  343: 1,
  346: 2,
  347: 1,
  350: 4,
  351: 3,
  352: 1,
  353: 2,
  360: 1,
  368: 1,
  369: 1,
  370: 1,
  371: 1,
  372: 1,
  373: 1,
  374: 1,
  375: 1,
  376: 1,
  377: 1,
  378: 1,
  382: 3,
  385: 1,
  392: 1,
  393: 1,
  396: 2,
  397: 2,
  398: 2,
  399: 1,
  400: 1,
  401: 1,
  402: 1,
  403: 1,
  404: 1,
  405: 1,
  406: 1,
  407: 1,
  408: 1,
  409: 1,
  410: 1,
  414: 4,
  415: 1,
  416: 1,
  417: 2,
  420: 1,
  421: 1,
  422: 2,
  424: 1,
  425: 2,
  426: 2,
  427: 2,
  428: 2,
  430: 3,
  438: 3,
  439: 3,
  440: 3,
  443: 2,
  444: 2,
  445: 2,
  446: 2,
  447: 6,
  448: 6,
  449: 2,
  450: 2,
  464: 2,
  468: 3,
  476: 2,
  479: 1,
  480: 2,
  65535: 0
};
function XS(e) {
  var t = "of:=" + e.replace(kc, "$1[.$2$3$4$5]").replace(/\]:\[/g, ":");
  return t.replace(/;/g, "|").replace(/,/g, ";");
}
function KS(e) {
  return e.replace(/\./, "!");
}
var ys = typeof Map < "u";
function Fc(e, t, r) {
  var n = 0, i = e.length;
  if (r) {
    if (ys ? r.has(t) : Object.prototype.hasOwnProperty.call(r, t)) {
      for (var s = ys ? r.get(t) : r[t]; n < s.length; ++n)
        if (e[s[n]].t === t)
          return e.Count++, s[n];
    }
  } else
    for (; n < i; ++n)
      if (e[n].t === t)
        return e.Count++, n;
  return e[i] = { t }, e.Count++, e.Unique++, r && (ys ? (r.has(t) || r.set(t, []), r.get(t).push(i)) : (Object.prototype.hasOwnProperty.call(r, t) || (r[t] = []), r[t].push(i))), i;
}
function Fo(e, t) {
  var r = { min: e + 1, max: e + 1 }, n = -1;
  return t.MDW && (rn = t.MDW), t.width != null ? r.customWidth = 1 : t.wpx != null ? n = so(t.wpx) : t.wch != null && (n = t.wch), n > -1 ? (r.width = Ul(n), r.customWidth = 1) : t.width != null && (r.width = t.width), t.hidden && (r.hidden = !0), t.level != null && (r.outlineLevel = r.level = t.level), r;
}
function Jd(e, t) {
  if (e) {
    var r = [0.7, 0.7, 0.75, 0.75, 0.3, 0.3];
    t == "xlml" && (r = [1, 1, 1, 1, 0.5, 0.5]), e.left == null && (e.left = r[0]), e.right == null && (e.right = r[1]), e.top == null && (e.top = r[2]), e.bottom == null && (e.bottom = r[3]), e.header == null && (e.header = r[4]), e.footer == null && (e.footer = r[5]);
  }
}
function Dn(e, t, r) {
  var n = r.revssf[t.z != null ? t.z : "General"], i = 60, s = e.length;
  if (n == null && r.ssf) {
    for (; i < 392; ++i)
      if (r.ssf[i] == null) {
        Gu(t.z, i), r.ssf[i] = t.z, r.revssf[t.z] = n = i;
        break;
      }
  }
  for (i = 0; i != s; ++i)
    if (e[i].numFmtId === n)
      return i;
  return e[s] = {
    numFmtId: n,
    fontId: 0,
    fillId: 0,
    borderId: 0,
    xfId: 0,
    applyNumberFormat: 1
  }, s;
}
function qS(e, t, r) {
  if (e && e["!ref"]) {
    var n = je(e["!ref"]);
    if (n.e.c < n.s.c || n.e.r < n.s.r)
      throw new Error("Bad range (" + r + "): " + e["!ref"]);
  }
}
function ZS(e) {
  if (e.length === 0)
    return "";
  for (var t = '<mergeCells count="' + e.length + '">', r = 0; r != e.length; ++r)
    t += '<mergeCell ref="' + ht(e[r]) + '"/>';
  return t + "</mergeCells>";
}
function JS(e, t, r, n, i) {
  var s = !1, a = {}, o = null;
  if (n.bookType !== "xlsx" && t.vbaraw) {
    var l = t.SheetNames[r];
    try {
      t.Workbook && (l = t.Workbook.Sheets[r].CodeName || l);
    } catch {
    }
    s = !0, a.codeName = Zr(Ie(l));
  }
  if (e && e["!outline"]) {
    var c = { summaryBelow: 1, summaryRight: 1 };
    e["!outline"].above && (c.summaryBelow = 0), e["!outline"].left && (c.summaryRight = 0), o = (o || "") + re("outlinePr", null, c);
  }
  !s && !o || (i[i.length] = re("sheetPr", o, a));
}
var QS = ["objects", "scenarios", "selectLockedCells", "selectUnlockedCells"], eb = [
  "formatColumns",
  "formatRows",
  "formatCells",
  "insertColumns",
  "insertRows",
  "insertHyperlinks",
  "deleteColumns",
  "deleteRows",
  "sort",
  "autoFilter",
  "pivotTables"
];
function tb(e) {
  var t = { sheet: 1 };
  return QS.forEach(function(r) {
    e[r] != null && e[r] && (t[r] = "1");
  }), eb.forEach(function(r) {
    e[r] != null && !e[r] && (t[r] = "0");
  }), e.password && (t.password = Id(e.password).toString(16).toUpperCase()), re("sheetProtection", null, t);
}
function rb(e) {
  return Jd(e), re("pageMargins", null, e);
}
function nb(e, t) {
  for (var r = ["<cols>"], n, i = 0; i != t.length; ++i)
    (n = t[i]) && (r[r.length] = re("col", null, Fo(i, n)));
  return r[r.length] = "</cols>", r.join("");
}
function ib(e, t, r, n) {
  var i = typeof e.ref == "string" ? e.ref : ht(e.ref);
  r.Workbook || (r.Workbook = { Sheets: [] }), r.Workbook.Names || (r.Workbook.Names = []);
  var s = r.Workbook.Names, a = tr(i);
  a.s.r == a.e.r && (a.e.r = tr(t["!ref"]).e.r, i = ht(a));
  for (var o = 0; o < s.length; ++o) {
    var l = s[o];
    if (l.Name == "_xlnm._FilterDatabase" && l.Sheet == n) {
      l.Ref = "'" + r.SheetNames[n] + "'!" + i;
      break;
    }
  }
  return o == s.length && s.push({ Name: "_xlnm._FilterDatabase", Sheet: n, Ref: "'" + r.SheetNames[n] + "'!" + i }), re("autoFilter", null, { ref: i });
}
function sb(e, t, r, n) {
  var i = { workbookViewId: "0" };
  return (((n || {}).Workbook || {}).Views || [])[0] && (i.rightToLeft = n.Workbook.Views[0].RTL ? "1" : "0"), re("sheetViews", re("sheetView", null, i), {});
}
function ab(e, t, r, n) {
  if (e.c && r["!comments"].push([t, e.c]), e.v === void 0 && typeof e.f != "string" || e.t === "z" && !e.f)
    return "";
  var i = "", s = e.t, a = e.v;
  if (e.t !== "z")
    switch (e.t) {
      case "b":
        i = e.v ? "1" : "0";
        break;
      case "n":
        i = "" + e.v;
        break;
      case "e":
        i = Gs[e.v];
        break;
      case "d":
        n && n.cellDates ? i = Wt(e.v, -1).toISOString() : (e = Gt(e), e.t = "n", i = "" + (e.v = $t(Wt(e.v)))), typeof e.z > "u" && (e.z = it[14]);
        break;
      default:
        i = e.v;
        break;
    }
  var o = St("v", Ie(i)), l = { r: t }, c = Dn(n.cellXfs, e, n);
  switch (c !== 0 && (l.s = c), e.t) {
    case "n":
      break;
    case "d":
      l.t = "d";
      break;
    case "b":
      l.t = "b";
      break;
    case "e":
      l.t = "e";
      break;
    case "z":
      break;
    default:
      if (e.v == null) {
        delete e.t;
        break;
      }
      if (e.v.length > 32767)
        throw new Error("Text length must not exceed 32767 characters");
      if (n && n.bookSST) {
        o = St("v", "" + Fc(n.Strings, e.v, n.revStrings)), l.t = "s";
        break;
      }
      l.t = "str";
      break;
  }
  if (e.t != s && (e.t = s, e.v = a), typeof e.f == "string" && e.f) {
    var f = e.F && e.F.slice(0, t.length) == t ? { t: "array", ref: e.F } : null;
    o = re("f", Ie(e.f), f) + (e.v != null ? o : "");
  }
  return e.l && r["!links"].push([t, e.l]), e.D && (l.cm = 1), re("c", o, l);
}
function ob(e, t, r, n) {
  var i = [], s = [], a = je(e["!ref"]), o = "", l, c = "", f = [], h = 0, u = 0, d = e["!rows"], p = Array.isArray(e), g = { r: c }, m, v = -1;
  for (u = a.s.c; u <= a.e.c; ++u)
    f[u] = Ct(u);
  for (h = a.s.r; h <= a.e.r; ++h) {
    for (s = [], c = bt(h), u = a.s.c; u <= a.e.c; ++u) {
      l = f[u] + c;
      var w = p ? (e[h] || [])[u] : e[l];
      w !== void 0 && (o = ab(w, l, e, t)) != null && s.push(o);
    }
    (s.length > 0 || d && d[h]) && (g = { r: c }, d && d[h] && (m = d[h], m.hidden && (g.hidden = 1), v = -1, m.hpx ? v = ao(m.hpx) : m.hpt && (v = m.hpt), v > -1 && (g.ht = v, g.customHeight = 1), m.level && (g.outlineLevel = m.level)), i[i.length] = re("row", s.join(""), g));
  }
  if (d)
    for (; h < d.length; ++h)
      d && d[h] && (g = { r: h + 1 }, m = d[h], m.hidden && (g.hidden = 1), v = -1, m.hpx ? v = ao(m.hpx) : m.hpt && (v = m.hpt), v > -1 && (g.ht = v, g.customHeight = 1), m.level && (g.outlineLevel = m.level), i[i.length] = re("row", "", g));
  return i.join("");
}
function Qd(e, t, r, n) {
  var i = [ut, re("worksheet", null, {
    xmlns: Ni[0],
    "xmlns:r": mt.r
  })], s = r.SheetNames[e], a = 0, o = "", l = r.Sheets[s];
  l == null && (l = {});
  var c = l["!ref"] || "A1", f = je(c);
  if (f.e.c > 16383 || f.e.r > 1048575) {
    if (t.WTF)
      throw new Error("Range " + c + " exceeds format limit A1:XFD1048576");
    f.e.c = Math.min(f.e.c, 16383), f.e.r = Math.min(f.e.c, 1048575), c = ht(f);
  }
  n || (n = {}), l["!comments"] = [];
  var h = [];
  JS(l, r, e, t, i), i[i.length] = re("dimension", null, { ref: c }), i[i.length] = sb(l, t, e, r), t.sheetFormat && (i[i.length] = re("sheetFormatPr", null, {
    defaultRowHeight: t.sheetFormat.defaultRowHeight || "16",
    baseColWidth: t.sheetFormat.baseColWidth || "10",
    outlineLevelRow: t.sheetFormat.outlineLevelRow || "7"
  })), l["!cols"] != null && l["!cols"].length > 0 && (i[i.length] = nb(l, l["!cols"])), i[a = i.length] = "<sheetData/>", l["!links"] = [], l["!ref"] != null && (o = ob(l, t), o.length > 0 && (i[i.length] = o)), i.length > a + 1 && (i[i.length] = "</sheetData>", i[a] = i[a].replace("/>", ">")), l["!protect"] && (i[i.length] = tb(l["!protect"])), l["!autofilter"] != null && (i[i.length] = ib(l["!autofilter"], l, r, e)), l["!merges"] != null && l["!merges"].length > 0 && (i[i.length] = ZS(l["!merges"]));
  var u = -1, d, p = -1;
  return (
    /*::(*/
    l["!links"].length > 0 && (i[i.length] = "<hyperlinks>", l["!links"].forEach(function(g) {
      g[1].Target && (d = { ref: g[0] }, g[1].Target.charAt(0) != "#" && (p = Re(n, -1, Ie(g[1].Target).replace(/#.*$/, ""), ke.HLINK), d["r:id"] = "rId" + p), (u = g[1].Target.indexOf("#")) > -1 && (d.location = Ie(g[1].Target.slice(u + 1))), g[1].Tooltip && (d.tooltip = Ie(g[1].Tooltip)), i[i.length] = re("hyperlink", null, d));
    }), i[i.length] = "</hyperlinks>"), delete l["!links"], l["!margins"] != null && (i[i.length] = rb(l["!margins"])), (!t || t.ignoreEC || t.ignoreEC == null) && (i[i.length] = St("ignoredErrors", re("ignoredError", null, { numberStoredAsText: 1, sqref: c }))), h.length > 0 && (p = Re(n, -1, "../drawings/drawing" + (e + 1) + ".xml", ke.DRAW), i[i.length] = re("drawing", null, { "r:id": "rId" + p }), l["!drawing"] = h), l["!comments"].length > 0 && (p = Re(n, -1, "../drawings/vmlDrawing" + (e + 1) + ".vml", ke.VML), i[i.length] = re("legacyDrawing", null, { "r:id": "rId" + p }), l["!legacy"] = p), i.length > 1 && (i[i.length] = "</worksheet>", i[1] = i[1].replace("/>", ">")), i.join("")
  );
}
function lb(e, t) {
  var r = {}, n = e.l + t;
  r.r = e.read_shift(4), e.l += 4;
  var i = e.read_shift(2);
  e.l += 1;
  var s = e.read_shift(1);
  return e.l = n, s & 7 && (r.level = s & 7), s & 16 && (r.hidden = !0), s & 32 && (r.hpt = i / 20), r;
}
function cb(e, t, r) {
  var n = G(145), i = (r["!rows"] || [])[e] || {};
  n.write_shift(4, e), n.write_shift(4, 0);
  var s = 320;
  i.hpx ? s = ao(i.hpx) * 20 : i.hpt && (s = i.hpt * 20), n.write_shift(2, s), n.write_shift(1, 0);
  var a = 0;
  i.level && (a |= i.level), i.hidden && (a |= 16), (i.hpx || i.hpt) && (a |= 32), n.write_shift(1, a), n.write_shift(1, 0);
  var o = 0, l = n.l;
  n.l += 4;
  for (var c = { r: e, c: 0 }, f = 0; f < 16; ++f)
    if (!(t.s.c > f + 1 << 10 || t.e.c < f << 10)) {
      for (var h = -1, u = -1, d = f << 10; d < f + 1 << 10; ++d) {
        c.c = d;
        var p = Array.isArray(r) ? (r[c.r] || [])[c.c] : r[Le(c)];
        p && (h < 0 && (h = d), u = d);
      }
      h < 0 || (++o, n.write_shift(4, h), n.write_shift(4, u));
    }
  var g = n.l;
  return n.l = l, n.write_shift(4, o), n.l = g, n.length > n.l ? n.slice(0, n.l) : n;
}
function fb(e, t, r, n) {
  var i = cb(n, r, t);
  (i.length > 17 || (t["!rows"] || [])[n]) && q(e, 0, i);
}
var hb = li, ub = Wi;
function db() {
}
function gb(e, t) {
  var r = {}, n = e[e.l];
  return ++e.l, r.above = !(n & 64), r.left = !(n & 128), e.l += 18, r.name = by(e), r;
}
function pb(e, t, r) {
  r == null && (r = G(84 + 4 * e.length));
  var n = 192;
  t && (t.above && (n &= -65), t.left && (n &= -129)), r.write_shift(1, n);
  for (var i = 1; i < 3; ++i)
    r.write_shift(1, 0);
  return ro({ auto: 1 }, r), r.write_shift(-4, -1), r.write_shift(-4, -1), gd(e, r), r.slice(0, r.l);
}
function mb(e) {
  var t = cr(e);
  return [t];
}
function xb(e, t, r) {
  return r == null && (r = G(8)), si(t, r);
}
function _b(e) {
  var t = ai(e);
  return [t];
}
function vb(e, t, r) {
  return r == null && (r = G(4)), oi(t, r);
}
function yb(e) {
  var t = cr(e), r = e.read_shift(1);
  return [t, r, "b"];
}
function wb(e, t, r) {
  return r == null && (r = G(9)), si(t, r), r.write_shift(1, e.v ? 1 : 0), r;
}
function Tb(e) {
  var t = ai(e), r = e.read_shift(1);
  return [t, r, "b"];
}
function Sb(e, t, r) {
  return r == null && (r = G(5)), oi(t, r), r.write_shift(1, e.v ? 1 : 0), r;
}
function bb(e) {
  var t = cr(e), r = e.read_shift(1);
  return [t, r, "e"];
}
function Eb(e, t, r) {
  return r == null && (r = G(9)), si(t, r), r.write_shift(1, e.v), r;
}
function Ab(e) {
  var t = ai(e), r = e.read_shift(1);
  return [t, r, "e"];
}
function kb(e, t, r) {
  return r == null && (r = G(8)), oi(t, r), r.write_shift(1, e.v), r.write_shift(2, 0), r.write_shift(1, 0), r;
}
function Ob(e) {
  var t = cr(e), r = e.read_shift(4);
  return [t, r, "s"];
}
function Db(e, t, r) {
  return r == null && (r = G(12)), si(t, r), r.write_shift(4, t.v), r;
}
function Fb(e) {
  var t = ai(e), r = e.read_shift(4);
  return [t, r, "s"];
}
function Cb(e, t, r) {
  return r == null && (r = G(8)), oi(t, r), r.write_shift(4, t.v), r;
}
function Mb(e) {
  var t = cr(e), r = Ui(e);
  return [t, r, "n"];
}
function Pb(e, t, r) {
  return r == null && (r = G(16)), si(t, r), Jn(e.v, r), r;
}
function Rb(e) {
  var t = ai(e), r = Ui(e);
  return [t, r, "n"];
}
function Ib(e, t, r) {
  return r == null && (r = G(12)), oi(t, r), Jn(e.v, r), r;
}
function Lb(e) {
  var t = cr(e), r = pd(e);
  return [t, r, "n"];
}
function Nb(e, t, r) {
  return r == null && (r = G(12)), si(t, r), md(e.v, r), r;
}
function Bb(e) {
  var t = ai(e), r = pd(e);
  return [t, r, "n"];
}
function Wb(e, t, r) {
  return r == null && (r = G(8)), oi(t, r), md(e.v, r), r;
}
function Ub(e) {
  var t = cr(e), r = Tc(e);
  return [t, r, "is"];
}
function zb(e) {
  var t = cr(e), r = Mt(e);
  return [t, r, "str"];
}
function Hb(e, t, r) {
  return r == null && (r = G(12 + 4 * e.v.length)), si(t, r), vt(e.v, r), r.length > r.l ? r.slice(0, r.l) : r;
}
function Vb(e) {
  var t = ai(e), r = Mt(e);
  return [t, r, "str"];
}
function Yb(e, t, r) {
  return r == null && (r = G(8 + 4 * e.v.length)), oi(t, r), vt(e.v, r), r.length > r.l ? r.slice(0, r.l) : r;
}
function jb(e, t, r) {
  var n = e.l + t, i = cr(e);
  i.r = r["!row"];
  var s = e.read_shift(1), a = [i, s, "b"];
  if (r.cellFormula) {
    e.l += 2;
    var o = Do(e, n - e.l, r);
    a[3] = Li(o, null, i, r.supbooks, r);
  } else
    e.l = n;
  return a;
}
function $b(e, t, r) {
  var n = e.l + t, i = cr(e);
  i.r = r["!row"];
  var s = e.read_shift(1), a = [i, s, "e"];
  if (r.cellFormula) {
    e.l += 2;
    var o = Do(e, n - e.l, r);
    a[3] = Li(o, null, i, r.supbooks, r);
  } else
    e.l = n;
  return a;
}
function Gb(e, t, r) {
  var n = e.l + t, i = cr(e);
  i.r = r["!row"];
  var s = Ui(e), a = [i, s, "n"];
  if (r.cellFormula) {
    e.l += 2;
    var o = Do(e, n - e.l, r);
    a[3] = Li(o, null, i, r.supbooks, r);
  } else
    e.l = n;
  return a;
}
function Xb(e, t, r) {
  var n = e.l + t, i = cr(e);
  i.r = r["!row"];
  var s = Mt(e), a = [i, s, "str"];
  if (r.cellFormula) {
    e.l += 2;
    var o = Do(e, n - e.l, r);
    a[3] = Li(o, null, i, r.supbooks, r);
  } else
    e.l = n;
  return a;
}
var Kb = li, qb = Wi;
function Zb(e, t) {
  return t == null && (t = G(4)), t.write_shift(4, e), t;
}
function Jb(e, t) {
  var r = e.l + t, n = li(e), i = Sc(e), s = Mt(e), a = Mt(e), o = Mt(e);
  e.l = r;
  var l = { rfx: n, relId: i, loc: s, display: o };
  return a && (l.Tooltip = a), l;
}
function Qb(e, t) {
  var r = G(50 + 4 * (e[1].Target.length + (e[1].Tooltip || "").length));
  Wi({ s: _t(e[0]), e: _t(e[0]) }, r), bc("rId" + t, r);
  var n = e[1].Target.indexOf("#"), i = n == -1 ? "" : e[1].Target.slice(n + 1);
  return vt(i || "", r), vt(e[1].Tooltip || "", r), vt("", r), r.slice(0, r.l);
}
function eE() {
}
function tE(e, t, r) {
  var n = e.l + t, i = xd(e), s = e.read_shift(1), a = [i];
  if (a[2] = s, r.cellFormula) {
    var o = VS(e, n - e.l, r);
    a[1] = o;
  } else
    e.l = n;
  return a;
}
function rE(e, t, r) {
  var n = e.l + t, i = li(e), s = [i];
  if (r.cellFormula) {
    var a = jS(e, n - e.l, r);
    s[1] = a, e.l = n;
  } else
    e.l = n;
  return s;
}
function nE(e, t, r) {
  r == null && (r = G(18));
  var n = Fo(e, t);
  r.write_shift(-4, e), r.write_shift(-4, e), r.write_shift(4, (n.width || 10) * 256), r.write_shift(
    4,
    0
    /*ixfe*/
  );
  var i = 0;
  return t.hidden && (i |= 1), typeof n.width == "number" && (i |= 2), t.level && (i |= t.level << 8), r.write_shift(2, i), r;
}
var eg = ["left", "right", "top", "bottom", "header", "footer"];
function iE(e) {
  var t = {};
  return eg.forEach(function(r) {
    t[r] = Ui(e);
  }), t;
}
function sE(e, t) {
  return t == null && (t = G(6 * 8)), Jd(e), eg.forEach(function(r) {
    Jn(e[r], t);
  }), t;
}
function aE(e) {
  var t = e.read_shift(2);
  return e.l += 28, { RTL: t & 32 };
}
function oE(e, t, r) {
  r == null && (r = G(30));
  var n = 924;
  return (((t || {}).Views || [])[0] || {}).RTL && (n |= 32), r.write_shift(2, n), r.write_shift(4, 0), r.write_shift(4, 0), r.write_shift(4, 0), r.write_shift(1, 0), r.write_shift(1, 0), r.write_shift(2, 0), r.write_shift(2, 100), r.write_shift(2, 0), r.write_shift(2, 0), r.write_shift(2, 0), r.write_shift(4, 0), r;
}
function lE(e) {
  var t = G(24);
  return t.write_shift(4, 4), t.write_shift(4, 1), Wi(e, t), t;
}
function cE(e, t) {
  return t == null && (t = G(16 * 4 + 2)), t.write_shift(2, e.password ? Id(e.password) : 0), t.write_shift(4, 1), [
    ["objects", !1],
    // fObjects
    ["scenarios", !1],
    // fScenarios
    ["formatCells", !0],
    // fFormatCells
    ["formatColumns", !0],
    // fFormatColumns
    ["formatRows", !0],
    // fFormatRows
    ["insertColumns", !0],
    // fInsertColumns
    ["insertRows", !0],
    // fInsertRows
    ["insertHyperlinks", !0],
    // fInsertHyperlinks
    ["deleteColumns", !0],
    // fDeleteColumns
    ["deleteRows", !0],
    // fDeleteRows
    ["selectLockedCells", !1],
    // fSelLockedCells
    ["sort", !0],
    // fSort
    ["autoFilter", !0],
    // fAutoFilter
    ["pivotTables", !0],
    // fPivotTables
    ["selectUnlockedCells", !1]
    // fSelUnlockedCells
  ].forEach(function(r) {
    r[1] ? t.write_shift(4, e[r[0]] != null && !e[r[0]] ? 1 : 0) : t.write_shift(4, e[r[0]] != null && e[r[0]] ? 0 : 1);
  }), t;
}
function fE() {
}
function hE() {
}
function uE(e, t, r, n, i, s, a) {
  if (t.v === void 0)
    return !1;
  var o = "";
  switch (t.t) {
    case "b":
      o = t.v ? "1" : "0";
      break;
    case "d":
      t = Gt(t), t.z = t.z || it[14], t.v = $t(Wt(t.v)), t.t = "n";
      break;
    case "n":
    case "e":
      o = "" + t.v;
      break;
    default:
      o = t.v;
      break;
  }
  var l = { r, c: n };
  switch (l.s = Dn(i.cellXfs, t, i), t.l && s["!links"].push([Le(l), t.l]), t.c && s["!comments"].push([Le(l), t.c]), t.t) {
    case "s":
    case "str":
      return i.bookSST ? (o = Fc(i.Strings, t.v, i.revStrings), l.t = "s", l.v = o, a ? q(e, 18, Cb(t, l)) : q(e, 7, Db(t, l))) : (l.t = "str", a ? q(e, 17, Yb(t, l)) : q(e, 6, Hb(t, l))), !0;
    case "n":
      return t.v == (t.v | 0) && t.v > -1e3 && t.v < 1e3 ? a ? q(e, 13, Wb(t, l)) : q(e, 2, Nb(t, l)) : a ? q(e, 16, Ib(t, l)) : q(e, 5, Pb(t, l)), !0;
    case "b":
      return l.t = "b", a ? q(e, 15, Sb(t, l)) : q(e, 4, wb(t, l)), !0;
    case "e":
      return l.t = "e", a ? q(e, 14, kb(t, l)) : q(e, 3, Eb(t, l)), !0;
  }
  return a ? q(e, 12, vb(t, l)) : q(e, 1, xb(t, l)), !0;
}
function dE(e, t, r, n) {
  var i = je(t["!ref"] || "A1"), s, a = "", o = [];
  q(
    e,
    145
    /* BrtBeginSheetData */
  );
  var l = Array.isArray(t), c = i.e.r;
  t["!rows"] && (c = Math.max(i.e.r, t["!rows"].length - 1));
  for (var f = i.s.r; f <= c; ++f) {
    a = bt(f), fb(e, t, i, f);
    var h = !1;
    if (f <= i.e.r)
      for (var u = i.s.c; u <= i.e.c; ++u) {
        f === i.s.r && (o[u] = Ct(u)), s = o[u] + a;
        var d = l ? (t[f] || [])[u] : t[s];
        if (!d) {
          h = !1;
          continue;
        }
        h = uE(e, d, f, u, n, t, h);
      }
  }
  q(
    e,
    146
    /* BrtEndSheetData */
  );
}
function gE(e, t) {
  !t || !t["!merges"] || (q(e, 177, Zb(t["!merges"].length)), t["!merges"].forEach(function(r) {
    q(e, 176, qb(r));
  }), q(
    e,
    178
    /* BrtEndMergeCells */
  ));
}
function pE(e, t) {
  !t || !t["!cols"] || (q(
    e,
    390
    /* BrtBeginColInfos */
  ), t["!cols"].forEach(function(r, n) {
    r && q(e, 60, nE(n, r));
  }), q(
    e,
    391
    /* BrtEndColInfos */
  ));
}
function mE(e, t) {
  !t || !t["!ref"] || (q(
    e,
    648
    /* BrtBeginCellIgnoreECs */
  ), q(e, 649, lE(je(t["!ref"]))), q(
    e,
    650
    /* BrtEndCellIgnoreECs */
  ));
}
function xE(e, t, r) {
  t["!links"].forEach(function(n) {
    if (n[1].Target) {
      var i = Re(r, -1, n[1].Target.replace(/#.*$/, ""), ke.HLINK);
      q(e, 494, Qb(n, i));
    }
  }), delete t["!links"];
}
function _E(e, t, r, n) {
  if (t["!comments"].length > 0) {
    var i = Re(n, -1, "../drawings/vmlDrawing" + (r + 1) + ".vml", ke.VML);
    q(e, 551, bc("rId" + i)), t["!legacy"] = i;
  }
}
function vE(e, t, r, n) {
  if (t["!autofilter"]) {
    var i = t["!autofilter"], s = typeof i.ref == "string" ? i.ref : ht(i.ref);
    r.Workbook || (r.Workbook = { Sheets: [] }), r.Workbook.Names || (r.Workbook.Names = []);
    var a = r.Workbook.Names, o = tr(s);
    o.s.r == o.e.r && (o.e.r = tr(t["!ref"]).e.r, s = ht(o));
    for (var l = 0; l < a.length; ++l) {
      var c = a[l];
      if (c.Name == "_xlnm._FilterDatabase" && c.Sheet == n) {
        c.Ref = "'" + r.SheetNames[n] + "'!" + s;
        break;
      }
    }
    l == a.length && a.push({ Name: "_xlnm._FilterDatabase", Sheet: n, Ref: "'" + r.SheetNames[n] + "'!" + s }), q(e, 161, Wi(je(s))), q(
      e,
      162
      /* BrtEndAFilter */
    );
  }
}
function yE(e, t, r) {
  q(
    e,
    133
    /* BrtBeginWsViews */
  ), q(e, 137, oE(t, r)), q(
    e,
    138
    /* BrtEndWsView */
  ), q(
    e,
    134
    /* BrtEndWsViews */
  );
}
function wE(e, t) {
  t["!protect"] && q(e, 535, cE(t["!protect"]));
}
function TE(e, t, r, n) {
  var i = jt(), s = r.SheetNames[e], a = r.Sheets[s] || {}, o = s;
  try {
    r && r.Workbook && (o = r.Workbook.Sheets[e].CodeName || o);
  } catch {
  }
  var l = je(a["!ref"] || "A1");
  if (l.e.c > 16383 || l.e.r > 1048575) {
    if (t.WTF)
      throw new Error("Range " + (a["!ref"] || "A1") + " exceeds format limit A1:XFD1048576");
    l.e.c = Math.min(l.e.c, 16383), l.e.r = Math.min(l.e.c, 1048575);
  }
  return a["!links"] = [], a["!comments"] = [], q(
    i,
    129
    /* BrtBeginSheet */
  ), (r.vbaraw || a["!outline"]) && q(i, 147, pb(o, a["!outline"])), q(i, 148, ub(l)), yE(i, a, r.Workbook), pE(i, a), dE(i, a, e, t), wE(i, a), vE(i, a, r, e), gE(i, a), xE(i, a, n), a["!margins"] && q(i, 476, sE(a["!margins"])), (!t || t.ignoreEC || t.ignoreEC == null) && mE(i, a), _E(i, a, e, n), q(
    i,
    130
    /* BrtEndSheet */
  ), i.end();
}
function SE(e, t) {
  e.l += 10;
  var r = Mt(e);
  return { name: r };
}
var bE = [
  ["allowRefreshQuery", !1, "bool"],
  ["autoCompressPictures", !0, "bool"],
  ["backupFile", !1, "bool"],
  ["checkCompatibility", !1, "bool"],
  ["CodeName", ""],
  ["date1904", !1, "bool"],
  ["defaultThemeVersion", 0, "int"],
  ["filterPrivacy", !1, "bool"],
  ["hidePivotFieldList", !1, "bool"],
  ["promptedSolutions", !1, "bool"],
  ["publishItems", !1, "bool"],
  ["refreshAllConnections", !1, "bool"],
  ["saveExternalLinkValues", !0, "bool"],
  ["showBorderUnselectedTables", !0, "bool"],
  ["showInkAnnotation", !0, "bool"],
  ["showObjects", "all"],
  ["showPivotChartFilter", !1, "bool"],
  ["updateLinks", "userSet"]
];
function EE(e) {
  return !e.Workbook || !e.Workbook.WBProps ? "false" : ry(e.Workbook.WBProps.date1904) ? "true" : "false";
}
var AE = /* @__PURE__ */ "][*?/\\".split("");
function tg(e, t) {
  if (e.length > 31) {
    if (t)
      return !1;
    throw new Error("Sheet names cannot exceed 31 chars");
  }
  var r = !0;
  return AE.forEach(function(n) {
    if (e.indexOf(n) != -1) {
      if (!t)
        throw new Error("Sheet name cannot contain : \\ / ? * [ ]");
      r = !1;
    }
  }), r;
}
function kE(e, t, r) {
  e.forEach(function(n, i) {
    tg(n);
    for (var s = 0; s < i; ++s)
      if (n == e[s])
        throw new Error("Duplicate Sheet Name: " + n);
    if (r) {
      var a = t && t[i] && t[i].CodeName || n;
      if (a.charCodeAt(0) == 95 && a.length > 22)
        throw new Error("Bad Code Name: Worksheet" + a);
    }
  });
}
function OE(e) {
  if (!e || !e.SheetNames || !e.Sheets)
    throw new Error("Invalid Workbook");
  if (!e.SheetNames.length)
    throw new Error("Workbook is empty");
  var t = e.Workbook && e.Workbook.Sheets || [];
  kE(e.SheetNames, t, !!e.vbaraw);
  for (var r = 0; r < e.SheetNames.length; ++r)
    qS(e.Sheets[e.SheetNames[r]], e.SheetNames[r], r);
}
function rg(e) {
  var t = [ut];
  t[t.length] = re("workbook", null, {
    xmlns: Ni[0],
    //'xmlns:mx': XMLNS.mx,
    //'xmlns:s': XMLNS_main[0],
    "xmlns:r": mt.r
  });
  var r = e.Workbook && (e.Workbook.Names || []).length > 0, n = { codeName: "ThisWorkbook" };
  e.Workbook && e.Workbook.WBProps && (bE.forEach(function(o) {
    e.Workbook.WBProps[o[0]] != null && e.Workbook.WBProps[o[0]] != o[1] && (n[o[0]] = e.Workbook.WBProps[o[0]]);
  }), e.Workbook.WBProps.CodeName && (n.codeName = e.Workbook.WBProps.CodeName, delete n.CodeName)), t[t.length] = re("workbookPr", null, n);
  var i = e.Workbook && e.Workbook.Sheets || [], s = 0;
  if (i && i[0] && i[0].Hidden) {
    for (t[t.length] = "<bookViews>", s = 0; s != e.SheetNames.length && !(!i[s] || !i[s].Hidden); ++s)
      ;
    s == e.SheetNames.length && (s = 0), t[t.length] = '<workbookView firstSheet="' + s + '" activeTab="' + s + '"/>', t[t.length] = "</bookViews>";
  }
  for (t[t.length] = "<sheets>", s = 0; s != e.SheetNames.length; ++s) {
    var a = { name: Ie(e.SheetNames[s].slice(0, 31)) };
    if (a.sheetId = "" + (s + 1), a["r:id"] = "rId" + (s + 1), i[s])
      switch (i[s].Hidden) {
        case 1:
          a.state = "hidden";
          break;
        case 2:
          a.state = "veryHidden";
          break;
      }
    t[t.length] = re("sheet", null, a);
  }
  return t[t.length] = "</sheets>", r && (t[t.length] = "<definedNames>", e.Workbook && e.Workbook.Names && e.Workbook.Names.forEach(function(o) {
    var l = { name: o.Name };
    o.Comment && (l.comment = o.Comment), o.Sheet != null && (l.localSheetId = "" + o.Sheet), o.Hidden && (l.hidden = "1"), o.Ref && (t[t.length] = re("definedName", Ie(o.Ref), l));
  }), t[t.length] = "</definedNames>"), t.length > 2 && (t[t.length] = "</workbook>", t[1] = t[1].replace("/>", ">")), t.join("");
}
function DE(e, t) {
  var r = {};
  return r.Hidden = e.read_shift(4), r.iTabID = e.read_shift(4), r.strRelID = Wl(e), r.name = Mt(e), r;
}
function FE(e, t) {
  return t || (t = G(127)), t.write_shift(4, e.Hidden), t.write_shift(4, e.iTabID), bc(e.strRelID, t), vt(e.name.slice(0, 31), t), t.length > t.l ? t.slice(0, t.l) : t;
}
function CE(e, t) {
  var r = {}, n = e.read_shift(4);
  r.defaultThemeVersion = e.read_shift(4);
  var i = t > 8 ? Mt(e) : "";
  return i.length > 0 && (r.CodeName = i), r.autoCompressPictures = !!(n & 65536), r.backupFile = !!(n & 64), r.checkCompatibility = !!(n & 4096), r.date1904 = !!(n & 1), r.filterPrivacy = !!(n & 8), r.hidePivotFieldList = !!(n & 1024), r.promptedSolutions = !!(n & 16), r.publishItems = !!(n & 2048), r.refreshAllConnections = !!(n & 262144), r.saveExternalLinkValues = !!(n & 128), r.showBorderUnselectedTables = !!(n & 4), r.showInkAnnotation = !!(n & 32), r.showObjects = ["all", "placeholders", "none"][n >> 13 & 3], r.showPivotChartFilter = !!(n & 32768), r.updateLinks = ["userSet", "never", "always"][n >> 8 & 3], r;
}
function ME(e, t) {
  t || (t = G(72));
  var r = 0;
  return e && e.filterPrivacy && (r |= 8), t.write_shift(4, r), t.write_shift(4, 0), gd(e && e.CodeName || "ThisWorkbook", t), t.slice(0, t.l);
}
function PE(e, t, r) {
  var n = e.l + t;
  e.l += 4, e.l += 1;
  var i = e.read_shift(4), s = Ey(e), a = YS(e, 0, r), o = Sc(e);
  e.l = n;
  var l = { Name: s, Ptg: a };
  return i < 268435455 && (l.Sheet = i), o && (l.Comment = o), l;
}
function RE(e, t) {
  q(
    e,
    143
    /* BrtBeginBundleShs */
  );
  for (var r = 0; r != t.SheetNames.length; ++r) {
    var n = t.Workbook && t.Workbook.Sheets && t.Workbook.Sheets[r] && t.Workbook.Sheets[r].Hidden || 0, i = { Hidden: n, iTabID: r + 1, strRelID: "rId" + (r + 1), name: t.SheetNames[r] };
    q(e, 156, FE(i));
  }
  q(
    e,
    144
    /* BrtEndBundleShs */
  );
}
function IE(e, t) {
  t || (t = G(127));
  for (var r = 0; r != 4; ++r)
    t.write_shift(4, 0);
  return vt("SheetJS", t), vt(Ka.version, t), vt(Ka.version, t), vt("7262", t), t.length > t.l ? t.slice(0, t.l) : t;
}
function LE(e, t) {
  t || (t = G(29)), t.write_shift(-4, 0), t.write_shift(-4, 460), t.write_shift(4, 28800), t.write_shift(4, 17600), t.write_shift(4, 500), t.write_shift(4, e), t.write_shift(4, e);
  var r = 120;
  return t.write_shift(1, r), t.length > t.l ? t.slice(0, t.l) : t;
}
function NE(e, t) {
  if (!(!t.Workbook || !t.Workbook.Sheets)) {
    for (var r = t.Workbook.Sheets, n = 0, i = -1, s = -1; n < r.length; ++n)
      !r[n] || !r[n].Hidden && i == -1 ? i = n : r[n].Hidden == 1 && s == -1 && (s = n);
    s > i || (q(
      e,
      135
      /* BrtBeginBookViews */
    ), q(e, 158, LE(i)), q(
      e,
      136
      /* BrtEndBookViews */
    ));
  }
}
function BE(e, t) {
  var r = jt();
  return q(
    r,
    131
    /* BrtBeginBook */
  ), q(r, 128, IE()), q(r, 153, ME(e.Workbook && e.Workbook.WBProps || null)), NE(r, e), RE(r, e), q(
    r,
    132
    /* BrtEndBook */
  ), r.end();
}
function WE(e, t, r) {
  return (t.slice(-4) === ".bin" ? BE : rg)(e);
}
function UE(e, t, r, n, i) {
  return (t.slice(-4) === ".bin" ? TE : Qd)(e, r, n, i);
}
function zE(e, t, r) {
  return (t.slice(-4) === ".bin" ? sT : Bd)(e, r);
}
function HE(e, t, r) {
  return (t.slice(-4) === ".bin" ? Mw : Rd)(e, r);
}
function VE(e, t, r) {
  return (t.slice(-4) === ".bin" ? wT : Vd)(e);
}
function YE(e) {
  return (e.slice(-4) === ".bin" ? dT : zd)();
}
function jE(e, t) {
  var r = [];
  return e.Props && r.push(zy(e.Props, t)), e.Custprops && r.push(Hy(e.Props, e.Custprops)), r.join("");
}
function $E() {
  return "";
}
function GE(e, t) {
  var r = ['<Style ss:ID="Default" ss:Name="Normal"><NumberFormat/></Style>'];
  return t.cellXfs.forEach(function(n, i) {
    var s = [];
    s.push(re("NumberFormat", null, { "ss:Format": Ie(it[n.numFmtId]) }));
    var a = (
      /*::(*/
      { "ss:ID": "s" + (21 + i) }
    );
    r.push(re("Style", s.join(""), a));
  }), re("Styles", r.join(""));
}
function ng(e) {
  return re("NamedRange", null, { "ss:Name": e.Name, "ss:RefersTo": "=" + Oc(e.Ref, { r: 0, c: 0 }) });
}
function XE(e) {
  if (!((e || {}).Workbook || {}).Names)
    return "";
  for (var t = e.Workbook.Names, r = [], n = 0; n < t.length; ++n) {
    var i = t[n];
    i.Sheet == null && (i.Name.match(/^_xlfn\./) || r.push(ng(i)));
  }
  return re("Names", r.join(""));
}
function KE(e, t, r, n) {
  if (!e || !((n || {}).Workbook || {}).Names)
    return "";
  for (var i = n.Workbook.Names, s = [], a = 0; a < i.length; ++a) {
    var o = i[a];
    o.Sheet == r && (o.Name.match(/^_xlfn\./) || s.push(ng(o)));
  }
  return s.join("");
}
function qE(e, t, r, n) {
  if (!e)
    return "";
  var i = [];
  if (e["!margins"] && (i.push("<PageSetup>"), e["!margins"].header && i.push(re("Header", null, { "x:Margin": e["!margins"].header })), e["!margins"].footer && i.push(re("Footer", null, { "x:Margin": e["!margins"].footer })), i.push(re("PageMargins", null, {
    "x:Bottom": e["!margins"].bottom || "0.75",
    "x:Left": e["!margins"].left || "0.7",
    "x:Right": e["!margins"].right || "0.7",
    "x:Top": e["!margins"].top || "0.75"
  })), i.push("</PageSetup>")), n && n.Workbook && n.Workbook.Sheets && n.Workbook.Sheets[r])
    if (n.Workbook.Sheets[r].Hidden)
      i.push(re("Visible", n.Workbook.Sheets[r].Hidden == 1 ? "SheetHidden" : "SheetVeryHidden", {}));
    else {
      for (var s = 0; s < r && !(n.Workbook.Sheets[s] && !n.Workbook.Sheets[s].Hidden); ++s)
        ;
      s == r && i.push("<Selected/>");
    }
  return ((((n || {}).Workbook || {}).Views || [])[0] || {}).RTL && i.push("<DisplayRightToLeft/>"), e["!protect"] && (i.push(St("ProtectContents", "True")), e["!protect"].objects && i.push(St("ProtectObjects", "True")), e["!protect"].scenarios && i.push(St("ProtectScenarios", "True")), e["!protect"].selectLockedCells != null && !e["!protect"].selectLockedCells ? i.push(St("EnableSelection", "NoSelection")) : e["!protect"].selectUnlockedCells != null && !e["!protect"].selectUnlockedCells && i.push(St("EnableSelection", "UnlockedCells")), [
    ["formatCells", "AllowFormatCells"],
    ["formatColumns", "AllowSizeCols"],
    ["formatRows", "AllowSizeRows"],
    ["insertColumns", "AllowInsertCols"],
    ["insertRows", "AllowInsertRows"],
    ["insertHyperlinks", "AllowInsertHyperlinks"],
    ["deleteColumns", "AllowDeleteCols"],
    ["deleteRows", "AllowDeleteRows"],
    ["sort", "AllowSort"],
    ["autoFilter", "AllowFilter"],
    ["pivotTables", "AllowUsePivotTables"]
  ].forEach(function(a) {
    e["!protect"][a[0]] && i.push("<" + a[1] + "/>");
  })), i.length == 0 ? "" : re("WorksheetOptions", i.join(""), { xmlns: Jt.x });
}
function ZE(e) {
  return e.map(function(t) {
    var r = ty(t.t || ""), n = re("ss:Data", r, { xmlns: "http://www.w3.org/TR/REC-html40" });
    return re("Comment", n, { "ss:Author": t.a });
  }).join("");
}
function JE(e, t, r, n, i, s, a) {
  if (!e || e.v == null && e.f == null)
    return "";
  var o = {};
  if (e.f && (o["ss:Formula"] = "=" + Ie(Oc(e.f, a))), e.F && e.F.slice(0, t.length) == t) {
    var l = _t(e.F.slice(t.length + 1));
    o["ss:ArrayRange"] = "RC:R" + (l.r == a.r ? "" : "[" + (l.r - a.r) + "]") + "C" + (l.c == a.c ? "" : "[" + (l.c - a.c) + "]");
  }
  if (e.l && e.l.Target && (o["ss:HRef"] = Ie(e.l.Target), e.l.Tooltip && (o["x:HRefScreenTip"] = Ie(e.l.Tooltip))), r["!merges"])
    for (var c = r["!merges"], f = 0; f != c.length; ++f)
      c[f].s.c != a.c || c[f].s.r != a.r || (c[f].e.c > c[f].s.c && (o["ss:MergeAcross"] = c[f].e.c - c[f].s.c), c[f].e.r > c[f].s.r && (o["ss:MergeDown"] = c[f].e.r - c[f].s.r));
  var h = "", u = "";
  switch (e.t) {
    case "z":
      if (!n.sheetStubs)
        return "";
      break;
    case "n":
      h = "Number", u = String(e.v);
      break;
    case "b":
      h = "Boolean", u = e.v ? "1" : "0";
      break;
    case "e":
      h = "Error", u = Gs[e.v];
      break;
    case "d":
      h = "DateTime", u = new Date(e.v).toISOString(), e.z == null && (e.z = e.z || it[14]);
      break;
    case "s":
      h = "String", u = ey(e.v || "");
      break;
  }
  var d = Dn(n.cellXfs, e, n);
  o["ss:StyleID"] = "s" + (21 + d), o["ss:Index"] = a.c + 1;
  var p = e.v != null ? u : "", g = e.t == "z" ? "" : '<Data ss:Type="' + h + '">' + p + "</Data>";
  return (e.c || []).length > 0 && (g += ZE(e.c)), re("Cell", g, o);
}
function QE(e, t) {
  var r = '<Row ss:Index="' + (e + 1) + '"';
  return t && (t.hpt && !t.hpx && (t.hpx = Nd(t.hpt)), t.hpx && (r += ' ss:AutoFitHeight="0" ss:Height="' + t.hpx + '"'), t.hidden && (r += ' ss:Hidden="1"')), r + ">";
}
function eA(e, t, r, n) {
  if (!e["!ref"])
    return "";
  var i = je(e["!ref"]), s = e["!merges"] || [], a = 0, o = [];
  e["!cols"] && e["!cols"].forEach(function(m, v) {
    Ac(m);
    var w = !!m.width, S = Fo(v, m), D = { "ss:Index": v + 1 };
    w && (D["ss:Width"] = io(S.width)), m.hidden && (D["ss:Hidden"] = "1"), o.push(re("Column", null, D));
  });
  for (var l = Array.isArray(e), c = i.s.r; c <= i.e.r; ++c) {
    for (var f = [QE(c, (e["!rows"] || [])[c])], h = i.s.c; h <= i.e.c; ++h) {
      var u = !1;
      for (a = 0; a != s.length; ++a)
        if (!(s[a].s.c > h) && !(s[a].s.r > c) && !(s[a].e.c < h) && !(s[a].e.r < c)) {
          (s[a].s.c != h || s[a].s.r != c) && (u = !0);
          break;
        }
      if (!u) {
        var d = { r: c, c: h }, p = Le(d), g = l ? (e[c] || [])[h] : e[p];
        f.push(JE(g, p, e, t, r, n, d));
      }
    }
    f.push("</Row>"), f.length > 2 && o.push(f.join(""));
  }
  return o.join("");
}
function tA(e, t, r) {
  var n = [], i = r.SheetNames[e], s = r.Sheets[i], a = s ? KE(s, t, e, r) : "";
  return a.length > 0 && n.push("<Names>" + a + "</Names>"), a = s ? eA(s, t, e, r) : "", a.length > 0 && n.push("<Table>" + a + "</Table>"), n.push(qE(s, t, e, r)), n.join("");
}
function rA(e, t) {
  t || (t = {}), e.SSF || (e.SSF = Gt(it)), e.SSF && (Eo(), bo(e.SSF), t.revssf = Ao(e.SSF), t.revssf[e.SSF[65535]] = 0, t.ssf = e.SSF, t.cellXfs = [], Dn(t.cellXfs, {}, { revssf: { General: 0 } }));
  var r = [];
  r.push(jE(e, t)), r.push($E()), r.push(""), r.push("");
  for (var n = 0; n < e.SheetNames.length; ++n)
    r.push(re("Worksheet", tA(n, t, e), { "ss:Name": Ie(e.SheetNames[n]) }));
  return r[2] = GE(e, t), r[3] = XE(e), ut + re("Workbook", r.join(""), {
    xmlns: Jt.ss,
    "xmlns:o": Jt.o,
    "xmlns:x": Jt.x,
    "xmlns:ss": Jt.ss,
    "xmlns:dt": Jt.dt,
    "xmlns:html": Jt.html
  });
}
var ul = {
  SI: "e0859ff2f94f6810ab9108002b27b3d9",
  DSI: "02d5cdd59c2e1b10939708002b2cf9ae",
  UDI: "05d5cdd59c2e1b10939708002b2cf9ae"
};
function nA(e, t) {
  var r = [], n = [], i = [], s = 0, a, o = $h(s0, "n"), l = $h(a0, "n");
  if (e.Props)
    for (a = At(e.Props), s = 0; s < a.length; ++s)
      (Object.prototype.hasOwnProperty.call(o, a[s]) ? r : Object.prototype.hasOwnProperty.call(l, a[s]) ? n : i).push([a[s], e.Props[a[s]]]);
  if (e.Custprops)
    for (a = At(e.Custprops), s = 0; s < a.length; ++s)
      Object.prototype.hasOwnProperty.call(e.Props || {}, a[s]) || (Object.prototype.hasOwnProperty.call(o, a[s]) ? r : Object.prototype.hasOwnProperty.call(l, a[s]) ? n : i).push([a[s], e.Custprops[a[s]]]);
  var c = [];
  for (s = 0; s < i.length; ++s)
    kd.indexOf(i[s][0]) > -1 || bd.indexOf(i[s][0]) > -1 || i[s][1] != null && c.push(i[s]);
  n.length && Be.utils.cfb_add(t, "/SummaryInformation", h0(n, ul.SI, l, a0)), (r.length || c.length) && Be.utils.cfb_add(t, "/DocumentSummaryInformation", h0(r, ul.DSI, o, s0, c.length ? c : null, ul.UDI));
}
function iA(e, t) {
  var r = t || {}, n = Be.utils.cfb_new({ root: "R" }), i = "/Workbook";
  switch (r.bookType || "xls") {
    case "xls":
      r.bookType = "biff8";
    case "xla":
      r.bookType || (r.bookType = "xla");
    case "biff8":
      i = "/Workbook", r.biff = 8;
      break;
    case "biff5":
      i = "/Book", r.biff = 5;
      break;
    default:
      throw new Error("invalid type " + r.bookType + " for XLS CFB");
  }
  return Be.utils.cfb_add(n, i, ig(e, r)), r.biff == 8 && (e.Props || e.Custprops) && nA(e, n), r.biff == 8 && e.vbaraw && TT(n, Be.read(e.vbaraw, { type: typeof e.vbaraw == "string" ? "binary" : "buffer" })), n;
}
var sA = {
  /*::[*/
  0: {
    /* n:"BrtRowHdr", */
    f: lb
  },
  /*::[*/
  1: {
    /* n:"BrtCellBlank", */
    f: mb
  },
  /*::[*/
  2: {
    /* n:"BrtCellRk", */
    f: Lb
  },
  /*::[*/
  3: {
    /* n:"BrtCellError", */
    f: bb
  },
  /*::[*/
  4: {
    /* n:"BrtCellBool", */
    f: yb
  },
  /*::[*/
  5: {
    /* n:"BrtCellReal", */
    f: Mb
  },
  /*::[*/
  6: {
    /* n:"BrtCellSt", */
    f: zb
  },
  /*::[*/
  7: {
    /* n:"BrtCellIsst", */
    f: Ob
  },
  /*::[*/
  8: {
    /* n:"BrtFmlaString", */
    f: Xb
  },
  /*::[*/
  9: {
    /* n:"BrtFmlaNum", */
    f: Gb
  },
  /*::[*/
  10: {
    /* n:"BrtFmlaBool", */
    f: jb
  },
  /*::[*/
  11: {
    /* n:"BrtFmlaError", */
    f: $b
  },
  /*::[*/
  12: {
    /* n:"BrtShortBlank", */
    f: _b
  },
  /*::[*/
  13: {
    /* n:"BrtShortRk", */
    f: Bb
  },
  /*::[*/
  14: {
    /* n:"BrtShortError", */
    f: Ab
  },
  /*::[*/
  15: {
    /* n:"BrtShortBool", */
    f: Tb
  },
  /*::[*/
  16: {
    /* n:"BrtShortReal", */
    f: Rb
  },
  /*::[*/
  17: {
    /* n:"BrtShortSt", */
    f: Vb
  },
  /*::[*/
  18: {
    /* n:"BrtShortIsst", */
    f: Fb
  },
  /*::[*/
  19: {
    /* n:"BrtSSTItem", */
    f: Tc
  },
  /*::[*/
  20: {
    /* n:"BrtPCDIMissing" */
  },
  /*::[*/
  21: {
    /* n:"BrtPCDINumber" */
  },
  /*::[*/
  22: {
    /* n:"BrtPCDIBoolean" */
  },
  /*::[*/
  23: {
    /* n:"BrtPCDIError" */
  },
  /*::[*/
  24: {
    /* n:"BrtPCDIString" */
  },
  /*::[*/
  25: {
    /* n:"BrtPCDIDatetime" */
  },
  /*::[*/
  26: {
    /* n:"BrtPCDIIndex" */
  },
  /*::[*/
  27: {
    /* n:"BrtPCDIAMissing" */
  },
  /*::[*/
  28: {
    /* n:"BrtPCDIANumber" */
  },
  /*::[*/
  29: {
    /* n:"BrtPCDIABoolean" */
  },
  /*::[*/
  30: {
    /* n:"BrtPCDIAError" */
  },
  /*::[*/
  31: {
    /* n:"BrtPCDIAString" */
  },
  /*::[*/
  32: {
    /* n:"BrtPCDIADatetime" */
  },
  /*::[*/
  33: {
    /* n:"BrtPCRRecord" */
  },
  /*::[*/
  34: {
    /* n:"BrtPCRRecordDt" */
  },
  /*::[*/
  35: {
    /* n:"BrtFRTBegin", */
    T: 1
  },
  /*::[*/
  36: {
    /* n:"BrtFRTEnd", */
    T: -1
  },
  /*::[*/
  37: {
    /* n:"BrtACBegin", */
    T: 1
  },
  /*::[*/
  38: {
    /* n:"BrtACEnd", */
    T: -1
  },
  /*::[*/
  39: {
    /* n:"BrtName", */
    f: PE
  },
  /*::[*/
  40: {
    /* n:"BrtIndexRowBlock" */
  },
  /*::[*/
  42: {
    /* n:"BrtIndexBlock" */
  },
  /*::[*/
  43: {
    /* n:"BrtFont", */
    f: zw
  },
  /*::[*/
  44: {
    /* n:"BrtFmt", */
    f: Ww
  },
  /*::[*/
  45: {
    /* n:"BrtFill", */
    f: Yw
  },
  /*::[*/
  46: {
    /* n:"BrtBorder", */
    f: $w
  },
  /*::[*/
  47: {
    /* n:"BrtXF", */
    f: jw
  },
  /*::[*/
  48: {
    /* n:"BrtStyle" */
  },
  /*::[*/
  49: {
    /* n:"BrtCellMeta", */
    f: _y
  },
  /*::[*/
  50: {
    /* n:"BrtValueMeta" */
  },
  /*::[*/
  51: {
    /* n:"BrtMdb" */
    f: lT
  },
  /*::[*/
  52: {
    /* n:"BrtBeginFmd", */
    T: 1
  },
  /*::[*/
  53: {
    /* n:"BrtEndFmd", */
    T: -1
  },
  /*::[*/
  54: {
    /* n:"BrtBeginMdx", */
    T: 1
  },
  /*::[*/
  55: {
    /* n:"BrtEndMdx", */
    T: -1
  },
  /*::[*/
  56: {
    /* n:"BrtBeginMdxTuple", */
    T: 1
  },
  /*::[*/
  57: {
    /* n:"BrtEndMdxTuple", */
    T: -1
  },
  /*::[*/
  58: {
    /* n:"BrtMdxMbrIstr" */
  },
  /*::[*/
  59: {
    /* n:"BrtStr" */
  },
  /*::[*/
  60: {
    /* n:"BrtColInfo", */
    f: vw
  },
  /*::[*/
  62: {
    /* n:"BrtCellRString", */
    f: Ub
  },
  /*::[*/
  63: {
    /* n:"BrtCalcChainItem$", */
    f: gT
  },
  /*::[*/
  64: {
    /* n:"BrtDVal", */
    f: fE
  },
  /*::[*/
  65: {
    /* n:"BrtSxvcellNum" */
  },
  /*::[*/
  66: {
    /* n:"BrtSxvcellStr" */
  },
  /*::[*/
  67: {
    /* n:"BrtSxvcellBool" */
  },
  /*::[*/
  68: {
    /* n:"BrtSxvcellErr" */
  },
  /*::[*/
  69: {
    /* n:"BrtSxvcellDate" */
  },
  /*::[*/
  70: {
    /* n:"BrtSxvcellNil" */
  },
  /*::[*/
  128: {
    /* n:"BrtFileVersion" */
  },
  /*::[*/
  129: {
    /* n:"BrtBeginSheet", */
    T: 1
  },
  /*::[*/
  130: {
    /* n:"BrtEndSheet", */
    T: -1
  },
  /*::[*/
  131: {
    /* n:"BrtBeginBook", */
    T: 1,
    f: Pr,
    p: 0
  },
  /*::[*/
  132: {
    /* n:"BrtEndBook", */
    T: -1
  },
  /*::[*/
  133: {
    /* n:"BrtBeginWsViews", */
    T: 1
  },
  /*::[*/
  134: {
    /* n:"BrtEndWsViews", */
    T: -1
  },
  /*::[*/
  135: {
    /* n:"BrtBeginBookViews", */
    T: 1
  },
  /*::[*/
  136: {
    /* n:"BrtEndBookViews", */
    T: -1
  },
  /*::[*/
  137: {
    /* n:"BrtBeginWsView", */
    T: 1,
    f: aE
  },
  /*::[*/
  138: {
    /* n:"BrtEndWsView", */
    T: -1
  },
  /*::[*/
  139: {
    /* n:"BrtBeginCsViews", */
    T: 1
  },
  /*::[*/
  140: {
    /* n:"BrtEndCsViews", */
    T: -1
  },
  /*::[*/
  141: {
    /* n:"BrtBeginCsView", */
    T: 1
  },
  /*::[*/
  142: {
    /* n:"BrtEndCsView", */
    T: -1
  },
  /*::[*/
  143: {
    /* n:"BrtBeginBundleShs", */
    T: 1
  },
  /*::[*/
  144: {
    /* n:"BrtEndBundleShs", */
    T: -1
  },
  /*::[*/
  145: {
    /* n:"BrtBeginSheetData", */
    T: 1
  },
  /*::[*/
  146: {
    /* n:"BrtEndSheetData", */
    T: -1
  },
  /*::[*/
  147: {
    /* n:"BrtWsProp", */
    f: gb
  },
  /*::[*/
  148: {
    /* n:"BrtWsDim", */
    f: hb,
    p: 16
  },
  /*::[*/
  151: {
    /* n:"BrtPane", */
    f: eE
  },
  /*::[*/
  152: {
    /* n:"BrtSel" */
  },
  /*::[*/
  153: {
    /* n:"BrtWbProp", */
    f: CE
  },
  /*::[*/
  154: {
    /* n:"BrtWbFactoid" */
  },
  /*::[*/
  155: {
    /* n:"BrtFileRecover" */
  },
  /*::[*/
  156: {
    /* n:"BrtBundleSh", */
    f: DE
  },
  /*::[*/
  157: {
    /* n:"BrtCalcProp" */
  },
  /*::[*/
  158: {
    /* n:"BrtBookView" */
  },
  /*::[*/
  159: {
    /* n:"BrtBeginSst", */
    T: 1,
    f: Dw
  },
  /*::[*/
  160: {
    /* n:"BrtEndSst", */
    T: -1
  },
  /*::[*/
  161: {
    /* n:"BrtBeginAFilter", */
    T: 1,
    f: li
  },
  /*::[*/
  162: {
    /* n:"BrtEndAFilter", */
    T: -1
  },
  /*::[*/
  163: {
    /* n:"BrtBeginFilterColumn", */
    T: 1
  },
  /*::[*/
  164: {
    /* n:"BrtEndFilterColumn", */
    T: -1
  },
  /*::[*/
  165: {
    /* n:"BrtBeginFilters", */
    T: 1
  },
  /*::[*/
  166: {
    /* n:"BrtEndFilters", */
    T: -1
  },
  /*::[*/
  167: {
    /* n:"BrtFilter" */
  },
  /*::[*/
  168: {
    /* n:"BrtColorFilter" */
  },
  /*::[*/
  169: {
    /* n:"BrtIconFilter" */
  },
  /*::[*/
  170: {
    /* n:"BrtTop10Filter" */
  },
  /*::[*/
  171: {
    /* n:"BrtDynamicFilter" */
  },
  /*::[*/
  172: {
    /* n:"BrtBeginCustomFilters", */
    T: 1
  },
  /*::[*/
  173: {
    /* n:"BrtEndCustomFilters", */
    T: -1
  },
  /*::[*/
  174: {
    /* n:"BrtCustomFilter" */
  },
  /*::[*/
  175: {
    /* n:"BrtAFilterDateGroupItem" */
  },
  /*::[*/
  176: {
    /* n:"BrtMergeCell", */
    f: Kb
  },
  /*::[*/
  177: {
    /* n:"BrtBeginMergeCells", */
    T: 1
  },
  /*::[*/
  178: {
    /* n:"BrtEndMergeCells", */
    T: -1
  },
  /*::[*/
  179: {
    /* n:"BrtBeginPivotCacheDef", */
    T: 1
  },
  /*::[*/
  180: {
    /* n:"BrtEndPivotCacheDef", */
    T: -1
  },
  /*::[*/
  181: {
    /* n:"BrtBeginPCDFields", */
    T: 1
  },
  /*::[*/
  182: {
    /* n:"BrtEndPCDFields", */
    T: -1
  },
  /*::[*/
  183: {
    /* n:"BrtBeginPCDField", */
    T: 1
  },
  /*::[*/
  184: {
    /* n:"BrtEndPCDField", */
    T: -1
  },
  /*::[*/
  185: {
    /* n:"BrtBeginPCDSource", */
    T: 1
  },
  /*::[*/
  186: {
    /* n:"BrtEndPCDSource", */
    T: -1
  },
  /*::[*/
  187: {
    /* n:"BrtBeginPCDSRange", */
    T: 1
  },
  /*::[*/
  188: {
    /* n:"BrtEndPCDSRange", */
    T: -1
  },
  /*::[*/
  189: {
    /* n:"BrtBeginPCDFAtbl", */
    T: 1
  },
  /*::[*/
  190: {
    /* n:"BrtEndPCDFAtbl", */
    T: -1
  },
  /*::[*/
  191: {
    /* n:"BrtBeginPCDIRun", */
    T: 1
  },
  /*::[*/
  192: {
    /* n:"BrtEndPCDIRun", */
    T: -1
  },
  /*::[*/
  193: {
    /* n:"BrtBeginPivotCacheRecords", */
    T: 1
  },
  /*::[*/
  194: {
    /* n:"BrtEndPivotCacheRecords", */
    T: -1
  },
  /*::[*/
  195: {
    /* n:"BrtBeginPCDHierarchies", */
    T: 1
  },
  /*::[*/
  196: {
    /* n:"BrtEndPCDHierarchies", */
    T: -1
  },
  /*::[*/
  197: {
    /* n:"BrtBeginPCDHierarchy", */
    T: 1
  },
  /*::[*/
  198: {
    /* n:"BrtEndPCDHierarchy", */
    T: -1
  },
  /*::[*/
  199: {
    /* n:"BrtBeginPCDHFieldsUsage", */
    T: 1
  },
  /*::[*/
  200: {
    /* n:"BrtEndPCDHFieldsUsage", */
    T: -1
  },
  /*::[*/
  201: {
    /* n:"BrtBeginExtConnection", */
    T: 1
  },
  /*::[*/
  202: {
    /* n:"BrtEndExtConnection", */
    T: -1
  },
  /*::[*/
  203: {
    /* n:"BrtBeginECDbProps", */
    T: 1
  },
  /*::[*/
  204: {
    /* n:"BrtEndECDbProps", */
    T: -1
  },
  /*::[*/
  205: {
    /* n:"BrtBeginECOlapProps", */
    T: 1
  },
  /*::[*/
  206: {
    /* n:"BrtEndECOlapProps", */
    T: -1
  },
  /*::[*/
  207: {
    /* n:"BrtBeginPCDSConsol", */
    T: 1
  },
  /*::[*/
  208: {
    /* n:"BrtEndPCDSConsol", */
    T: -1
  },
  /*::[*/
  209: {
    /* n:"BrtBeginPCDSCPages", */
    T: 1
  },
  /*::[*/
  210: {
    /* n:"BrtEndPCDSCPages", */
    T: -1
  },
  /*::[*/
  211: {
    /* n:"BrtBeginPCDSCPage", */
    T: 1
  },
  /*::[*/
  212: {
    /* n:"BrtEndPCDSCPage", */
    T: -1
  },
  /*::[*/
  213: {
    /* n:"BrtBeginPCDSCPItem", */
    T: 1
  },
  /*::[*/
  214: {
    /* n:"BrtEndPCDSCPItem", */
    T: -1
  },
  /*::[*/
  215: {
    /* n:"BrtBeginPCDSCSets", */
    T: 1
  },
  /*::[*/
  216: {
    /* n:"BrtEndPCDSCSets", */
    T: -1
  },
  /*::[*/
  217: {
    /* n:"BrtBeginPCDSCSet", */
    T: 1
  },
  /*::[*/
  218: {
    /* n:"BrtEndPCDSCSet", */
    T: -1
  },
  /*::[*/
  219: {
    /* n:"BrtBeginPCDFGroup", */
    T: 1
  },
  /*::[*/
  220: {
    /* n:"BrtEndPCDFGroup", */
    T: -1
  },
  /*::[*/
  221: {
    /* n:"BrtBeginPCDFGItems", */
    T: 1
  },
  /*::[*/
  222: {
    /* n:"BrtEndPCDFGItems", */
    T: -1
  },
  /*::[*/
  223: {
    /* n:"BrtBeginPCDFGRange", */
    T: 1
  },
  /*::[*/
  224: {
    /* n:"BrtEndPCDFGRange", */
    T: -1
  },
  /*::[*/
  225: {
    /* n:"BrtBeginPCDFGDiscrete", */
    T: 1
  },
  /*::[*/
  226: {
    /* n:"BrtEndPCDFGDiscrete", */
    T: -1
  },
  /*::[*/
  227: {
    /* n:"BrtBeginPCDSDTupleCache", */
    T: 1
  },
  /*::[*/
  228: {
    /* n:"BrtEndPCDSDTupleCache", */
    T: -1
  },
  /*::[*/
  229: {
    /* n:"BrtBeginPCDSDTCEntries", */
    T: 1
  },
  /*::[*/
  230: {
    /* n:"BrtEndPCDSDTCEntries", */
    T: -1
  },
  /*::[*/
  231: {
    /* n:"BrtBeginPCDSDTCEMembers", */
    T: 1
  },
  /*::[*/
  232: {
    /* n:"BrtEndPCDSDTCEMembers", */
    T: -1
  },
  /*::[*/
  233: {
    /* n:"BrtBeginPCDSDTCEMember", */
    T: 1
  },
  /*::[*/
  234: {
    /* n:"BrtEndPCDSDTCEMember", */
    T: -1
  },
  /*::[*/
  235: {
    /* n:"BrtBeginPCDSDTCQueries", */
    T: 1
  },
  /*::[*/
  236: {
    /* n:"BrtEndPCDSDTCQueries", */
    T: -1
  },
  /*::[*/
  237: {
    /* n:"BrtBeginPCDSDTCQuery", */
    T: 1
  },
  /*::[*/
  238: {
    /* n:"BrtEndPCDSDTCQuery", */
    T: -1
  },
  /*::[*/
  239: {
    /* n:"BrtBeginPCDSDTCSets", */
    T: 1
  },
  /*::[*/
  240: {
    /* n:"BrtEndPCDSDTCSets", */
    T: -1
  },
  /*::[*/
  241: {
    /* n:"BrtBeginPCDSDTCSet", */
    T: 1
  },
  /*::[*/
  242: {
    /* n:"BrtEndPCDSDTCSet", */
    T: -1
  },
  /*::[*/
  243: {
    /* n:"BrtBeginPCDCalcItems", */
    T: 1
  },
  /*::[*/
  244: {
    /* n:"BrtEndPCDCalcItems", */
    T: -1
  },
  /*::[*/
  245: {
    /* n:"BrtBeginPCDCalcItem", */
    T: 1
  },
  /*::[*/
  246: {
    /* n:"BrtEndPCDCalcItem", */
    T: -1
  },
  /*::[*/
  247: {
    /* n:"BrtBeginPRule", */
    T: 1
  },
  /*::[*/
  248: {
    /* n:"BrtEndPRule", */
    T: -1
  },
  /*::[*/
  249: {
    /* n:"BrtBeginPRFilters", */
    T: 1
  },
  /*::[*/
  250: {
    /* n:"BrtEndPRFilters", */
    T: -1
  },
  /*::[*/
  251: {
    /* n:"BrtBeginPRFilter", */
    T: 1
  },
  /*::[*/
  252: {
    /* n:"BrtEndPRFilter", */
    T: -1
  },
  /*::[*/
  253: {
    /* n:"BrtBeginPNames", */
    T: 1
  },
  /*::[*/
  254: {
    /* n:"BrtEndPNames", */
    T: -1
  },
  /*::[*/
  255: {
    /* n:"BrtBeginPName", */
    T: 1
  },
  /*::[*/
  256: {
    /* n:"BrtEndPName", */
    T: -1
  },
  /*::[*/
  257: {
    /* n:"BrtBeginPNPairs", */
    T: 1
  },
  /*::[*/
  258: {
    /* n:"BrtEndPNPairs", */
    T: -1
  },
  /*::[*/
  259: {
    /* n:"BrtBeginPNPair", */
    T: 1
  },
  /*::[*/
  260: {
    /* n:"BrtEndPNPair", */
    T: -1
  },
  /*::[*/
  261: {
    /* n:"BrtBeginECWebProps", */
    T: 1
  },
  /*::[*/
  262: {
    /* n:"BrtEndECWebProps", */
    T: -1
  },
  /*::[*/
  263: {
    /* n:"BrtBeginEcWpTables", */
    T: 1
  },
  /*::[*/
  264: {
    /* n:"BrtEndECWPTables", */
    T: -1
  },
  /*::[*/
  265: {
    /* n:"BrtBeginECParams", */
    T: 1
  },
  /*::[*/
  266: {
    /* n:"BrtEndECParams", */
    T: -1
  },
  /*::[*/
  267: {
    /* n:"BrtBeginECParam", */
    T: 1
  },
  /*::[*/
  268: {
    /* n:"BrtEndECParam", */
    T: -1
  },
  /*::[*/
  269: {
    /* n:"BrtBeginPCDKPIs", */
    T: 1
  },
  /*::[*/
  270: {
    /* n:"BrtEndPCDKPIs", */
    T: -1
  },
  /*::[*/
  271: {
    /* n:"BrtBeginPCDKPI", */
    T: 1
  },
  /*::[*/
  272: {
    /* n:"BrtEndPCDKPI", */
    T: -1
  },
  /*::[*/
  273: {
    /* n:"BrtBeginDims", */
    T: 1
  },
  /*::[*/
  274: {
    /* n:"BrtEndDims", */
    T: -1
  },
  /*::[*/
  275: {
    /* n:"BrtBeginDim", */
    T: 1
  },
  /*::[*/
  276: {
    /* n:"BrtEndDim", */
    T: -1
  },
  /*::[*/
  277: {
    /* n:"BrtIndexPartEnd" */
  },
  /*::[*/
  278: {
    /* n:"BrtBeginStyleSheet", */
    T: 1
  },
  /*::[*/
  279: {
    /* n:"BrtEndStyleSheet", */
    T: -1
  },
  /*::[*/
  280: {
    /* n:"BrtBeginSXView", */
    T: 1
  },
  /*::[*/
  281: {
    /* n:"BrtEndSXVI", */
    T: -1
  },
  /*::[*/
  282: {
    /* n:"BrtBeginSXVI", */
    T: 1
  },
  /*::[*/
  283: {
    /* n:"BrtBeginSXVIs", */
    T: 1
  },
  /*::[*/
  284: {
    /* n:"BrtEndSXVIs", */
    T: -1
  },
  /*::[*/
  285: {
    /* n:"BrtBeginSXVD", */
    T: 1
  },
  /*::[*/
  286: {
    /* n:"BrtEndSXVD", */
    T: -1
  },
  /*::[*/
  287: {
    /* n:"BrtBeginSXVDs", */
    T: 1
  },
  /*::[*/
  288: {
    /* n:"BrtEndSXVDs", */
    T: -1
  },
  /*::[*/
  289: {
    /* n:"BrtBeginSXPI", */
    T: 1
  },
  /*::[*/
  290: {
    /* n:"BrtEndSXPI", */
    T: -1
  },
  /*::[*/
  291: {
    /* n:"BrtBeginSXPIs", */
    T: 1
  },
  /*::[*/
  292: {
    /* n:"BrtEndSXPIs", */
    T: -1
  },
  /*::[*/
  293: {
    /* n:"BrtBeginSXDI", */
    T: 1
  },
  /*::[*/
  294: {
    /* n:"BrtEndSXDI", */
    T: -1
  },
  /*::[*/
  295: {
    /* n:"BrtBeginSXDIs", */
    T: 1
  },
  /*::[*/
  296: {
    /* n:"BrtEndSXDIs", */
    T: -1
  },
  /*::[*/
  297: {
    /* n:"BrtBeginSXLI", */
    T: 1
  },
  /*::[*/
  298: {
    /* n:"BrtEndSXLI", */
    T: -1
  },
  /*::[*/
  299: {
    /* n:"BrtBeginSXLIRws", */
    T: 1
  },
  /*::[*/
  300: {
    /* n:"BrtEndSXLIRws", */
    T: -1
  },
  /*::[*/
  301: {
    /* n:"BrtBeginSXLICols", */
    T: 1
  },
  /*::[*/
  302: {
    /* n:"BrtEndSXLICols", */
    T: -1
  },
  /*::[*/
  303: {
    /* n:"BrtBeginSXFormat", */
    T: 1
  },
  /*::[*/
  304: {
    /* n:"BrtEndSXFormat", */
    T: -1
  },
  /*::[*/
  305: {
    /* n:"BrtBeginSXFormats", */
    T: 1
  },
  /*::[*/
  306: {
    /* n:"BrtEndSxFormats", */
    T: -1
  },
  /*::[*/
  307: {
    /* n:"BrtBeginSxSelect", */
    T: 1
  },
  /*::[*/
  308: {
    /* n:"BrtEndSxSelect", */
    T: -1
  },
  /*::[*/
  309: {
    /* n:"BrtBeginISXVDRws", */
    T: 1
  },
  /*::[*/
  310: {
    /* n:"BrtEndISXVDRws", */
    T: -1
  },
  /*::[*/
  311: {
    /* n:"BrtBeginISXVDCols", */
    T: 1
  },
  /*::[*/
  312: {
    /* n:"BrtEndISXVDCols", */
    T: -1
  },
  /*::[*/
  313: {
    /* n:"BrtEndSXLocation", */
    T: -1
  },
  /*::[*/
  314: {
    /* n:"BrtBeginSXLocation", */
    T: 1
  },
  /*::[*/
  315: {
    /* n:"BrtEndSXView", */
    T: -1
  },
  /*::[*/
  316: {
    /* n:"BrtBeginSXTHs", */
    T: 1
  },
  /*::[*/
  317: {
    /* n:"BrtEndSXTHs", */
    T: -1
  },
  /*::[*/
  318: {
    /* n:"BrtBeginSXTH", */
    T: 1
  },
  /*::[*/
  319: {
    /* n:"BrtEndSXTH", */
    T: -1
  },
  /*::[*/
  320: {
    /* n:"BrtBeginISXTHRws", */
    T: 1
  },
  /*::[*/
  321: {
    /* n:"BrtEndISXTHRws", */
    T: -1
  },
  /*::[*/
  322: {
    /* n:"BrtBeginISXTHCols", */
    T: 1
  },
  /*::[*/
  323: {
    /* n:"BrtEndISXTHCols", */
    T: -1
  },
  /*::[*/
  324: {
    /* n:"BrtBeginSXTDMPS", */
    T: 1
  },
  /*::[*/
  325: {
    /* n:"BrtEndSXTDMPs", */
    T: -1
  },
  /*::[*/
  326: {
    /* n:"BrtBeginSXTDMP", */
    T: 1
  },
  /*::[*/
  327: {
    /* n:"BrtEndSXTDMP", */
    T: -1
  },
  /*::[*/
  328: {
    /* n:"BrtBeginSXTHItems", */
    T: 1
  },
  /*::[*/
  329: {
    /* n:"BrtEndSXTHItems", */
    T: -1
  },
  /*::[*/
  330: {
    /* n:"BrtBeginSXTHItem", */
    T: 1
  },
  /*::[*/
  331: {
    /* n:"BrtEndSXTHItem", */
    T: -1
  },
  /*::[*/
  332: {
    /* n:"BrtBeginMetadata", */
    T: 1
  },
  /*::[*/
  333: {
    /* n:"BrtEndMetadata", */
    T: -1
  },
  /*::[*/
  334: {
    /* n:"BrtBeginEsmdtinfo", */
    T: 1
  },
  /*::[*/
  335: {
    /* n:"BrtMdtinfo", */
    f: aT
  },
  /*::[*/
  336: {
    /* n:"BrtEndEsmdtinfo", */
    T: -1
  },
  /*::[*/
  337: {
    /* n:"BrtBeginEsmdb", */
    f: hT,
    T: 1
  },
  /*::[*/
  338: {
    /* n:"BrtEndEsmdb", */
    T: -1
  },
  /*::[*/
  339: {
    /* n:"BrtBeginEsfmd", */
    T: 1
  },
  /*::[*/
  340: {
    /* n:"BrtEndEsfmd", */
    T: -1
  },
  /*::[*/
  341: {
    /* n:"BrtBeginSingleCells", */
    T: 1
  },
  /*::[*/
  342: {
    /* n:"BrtEndSingleCells", */
    T: -1
  },
  /*::[*/
  343: {
    /* n:"BrtBeginList", */
    T: 1
  },
  /*::[*/
  344: {
    /* n:"BrtEndList", */
    T: -1
  },
  /*::[*/
  345: {
    /* n:"BrtBeginListCols", */
    T: 1
  },
  /*::[*/
  346: {
    /* n:"BrtEndListCols", */
    T: -1
  },
  /*::[*/
  347: {
    /* n:"BrtBeginListCol", */
    T: 1
  },
  /*::[*/
  348: {
    /* n:"BrtEndListCol", */
    T: -1
  },
  /*::[*/
  349: {
    /* n:"BrtBeginListXmlCPr", */
    T: 1
  },
  /*::[*/
  350: {
    /* n:"BrtEndListXmlCPr", */
    T: -1
  },
  /*::[*/
  351: {
    /* n:"BrtListCCFmla" */
  },
  /*::[*/
  352: {
    /* n:"BrtListTrFmla" */
  },
  /*::[*/
  353: {
    /* n:"BrtBeginExternals", */
    T: 1
  },
  /*::[*/
  354: {
    /* n:"BrtEndExternals", */
    T: -1
  },
  /*::[*/
  355: {
    /* n:"BrtSupBookSrc", */
    f: Wl
  },
  /*::[*/
  357: {
    /* n:"BrtSupSelf" */
  },
  /*::[*/
  358: {
    /* n:"BrtSupSame" */
  },
  /*::[*/
  359: {
    /* n:"BrtSupTabs" */
  },
  /*::[*/
  360: {
    /* n:"BrtBeginSupBook", */
    T: 1
  },
  /*::[*/
  361: {
    /* n:"BrtPlaceholderName" */
  },
  /*::[*/
  362: {
    /* n:"BrtExternSheet", */
    f: dw
  },
  /*::[*/
  363: {
    /* n:"BrtExternTableStart" */
  },
  /*::[*/
  364: {
    /* n:"BrtExternTableEnd" */
  },
  /*::[*/
  366: {
    /* n:"BrtExternRowHdr" */
  },
  /*::[*/
  367: {
    /* n:"BrtExternCellBlank" */
  },
  /*::[*/
  368: {
    /* n:"BrtExternCellReal" */
  },
  /*::[*/
  369: {
    /* n:"BrtExternCellBool" */
  },
  /*::[*/
  370: {
    /* n:"BrtExternCellError" */
  },
  /*::[*/
  371: {
    /* n:"BrtExternCellString" */
  },
  /*::[*/
  372: {
    /* n:"BrtBeginEsmdx", */
    T: 1
  },
  /*::[*/
  373: {
    /* n:"BrtEndEsmdx", */
    T: -1
  },
  /*::[*/
  374: {
    /* n:"BrtBeginMdxSet", */
    T: 1
  },
  /*::[*/
  375: {
    /* n:"BrtEndMdxSet", */
    T: -1
  },
  /*::[*/
  376: {
    /* n:"BrtBeginMdxMbrProp", */
    T: 1
  },
  /*::[*/
  377: {
    /* n:"BrtEndMdxMbrProp", */
    T: -1
  },
  /*::[*/
  378: {
    /* n:"BrtBeginMdxKPI", */
    T: 1
  },
  /*::[*/
  379: {
    /* n:"BrtEndMdxKPI", */
    T: -1
  },
  /*::[*/
  380: {
    /* n:"BrtBeginEsstr", */
    T: 1
  },
  /*::[*/
  381: {
    /* n:"BrtEndEsstr", */
    T: -1
  },
  /*::[*/
  382: {
    /* n:"BrtBeginPRFItem", */
    T: 1
  },
  /*::[*/
  383: {
    /* n:"BrtEndPRFItem", */
    T: -1
  },
  /*::[*/
  384: {
    /* n:"BrtBeginPivotCacheIDs", */
    T: 1
  },
  /*::[*/
  385: {
    /* n:"BrtEndPivotCacheIDs", */
    T: -1
  },
  /*::[*/
  386: {
    /* n:"BrtBeginPivotCacheID", */
    T: 1
  },
  /*::[*/
  387: {
    /* n:"BrtEndPivotCacheID", */
    T: -1
  },
  /*::[*/
  388: {
    /* n:"BrtBeginISXVIs", */
    T: 1
  },
  /*::[*/
  389: {
    /* n:"BrtEndISXVIs", */
    T: -1
  },
  /*::[*/
  390: {
    /* n:"BrtBeginColInfos", */
    T: 1
  },
  /*::[*/
  391: {
    /* n:"BrtEndColInfos", */
    T: -1
  },
  /*::[*/
  392: {
    /* n:"BrtBeginRwBrk", */
    T: 1
  },
  /*::[*/
  393: {
    /* n:"BrtEndRwBrk", */
    T: -1
  },
  /*::[*/
  394: {
    /* n:"BrtBeginColBrk", */
    T: 1
  },
  /*::[*/
  395: {
    /* n:"BrtEndColBrk", */
    T: -1
  },
  /*::[*/
  396: {
    /* n:"BrtBrk" */
  },
  /*::[*/
  397: {
    /* n:"BrtUserBookView" */
  },
  /*::[*/
  398: {
    /* n:"BrtInfo" */
  },
  /*::[*/
  399: {
    /* n:"BrtCUsr" */
  },
  /*::[*/
  400: {
    /* n:"BrtUsr" */
  },
  /*::[*/
  401: {
    /* n:"BrtBeginUsers", */
    T: 1
  },
  /*::[*/
  403: {
    /* n:"BrtEOF" */
  },
  /*::[*/
  404: {
    /* n:"BrtUCR" */
  },
  /*::[*/
  405: {
    /* n:"BrtRRInsDel" */
  },
  /*::[*/
  406: {
    /* n:"BrtRREndInsDel" */
  },
  /*::[*/
  407: {
    /* n:"BrtRRMove" */
  },
  /*::[*/
  408: {
    /* n:"BrtRREndMove" */
  },
  /*::[*/
  409: {
    /* n:"BrtRRChgCell" */
  },
  /*::[*/
  410: {
    /* n:"BrtRREndChgCell" */
  },
  /*::[*/
  411: {
    /* n:"BrtRRHeader" */
  },
  /*::[*/
  412: {
    /* n:"BrtRRUserView" */
  },
  /*::[*/
  413: {
    /* n:"BrtRRRenSheet" */
  },
  /*::[*/
  414: {
    /* n:"BrtRRInsertSh" */
  },
  /*::[*/
  415: {
    /* n:"BrtRRDefName" */
  },
  /*::[*/
  416: {
    /* n:"BrtRRNote" */
  },
  /*::[*/
  417: {
    /* n:"BrtRRConflict" */
  },
  /*::[*/
  418: {
    /* n:"BrtRRTQSIF" */
  },
  /*::[*/
  419: {
    /* n:"BrtRRFormat" */
  },
  /*::[*/
  420: {
    /* n:"BrtRREndFormat" */
  },
  /*::[*/
  421: {
    /* n:"BrtRRAutoFmt" */
  },
  /*::[*/
  422: {
    /* n:"BrtBeginUserShViews", */
    T: 1
  },
  /*::[*/
  423: {
    /* n:"BrtBeginUserShView", */
    T: 1
  },
  /*::[*/
  424: {
    /* n:"BrtEndUserShView", */
    T: -1
  },
  /*::[*/
  425: {
    /* n:"BrtEndUserShViews", */
    T: -1
  },
  /*::[*/
  426: {
    /* n:"BrtArrFmla", */
    f: tE
  },
  /*::[*/
  427: {
    /* n:"BrtShrFmla", */
    f: rE
  },
  /*::[*/
  428: {
    /* n:"BrtTable" */
  },
  /*::[*/
  429: {
    /* n:"BrtBeginExtConnections", */
    T: 1
  },
  /*::[*/
  430: {
    /* n:"BrtEndExtConnections", */
    T: -1
  },
  /*::[*/
  431: {
    /* n:"BrtBeginPCDCalcMems", */
    T: 1
  },
  /*::[*/
  432: {
    /* n:"BrtEndPCDCalcMems", */
    T: -1
  },
  /*::[*/
  433: {
    /* n:"BrtBeginPCDCalcMem", */
    T: 1
  },
  /*::[*/
  434: {
    /* n:"BrtEndPCDCalcMem", */
    T: -1
  },
  /*::[*/
  435: {
    /* n:"BrtBeginPCDHGLevels", */
    T: 1
  },
  /*::[*/
  436: {
    /* n:"BrtEndPCDHGLevels", */
    T: -1
  },
  /*::[*/
  437: {
    /* n:"BrtBeginPCDHGLevel", */
    T: 1
  },
  /*::[*/
  438: {
    /* n:"BrtEndPCDHGLevel", */
    T: -1
  },
  /*::[*/
  439: {
    /* n:"BrtBeginPCDHGLGroups", */
    T: 1
  },
  /*::[*/
  440: {
    /* n:"BrtEndPCDHGLGroups", */
    T: -1
  },
  /*::[*/
  441: {
    /* n:"BrtBeginPCDHGLGroup", */
    T: 1
  },
  /*::[*/
  442: {
    /* n:"BrtEndPCDHGLGroup", */
    T: -1
  },
  /*::[*/
  443: {
    /* n:"BrtBeginPCDHGLGMembers", */
    T: 1
  },
  /*::[*/
  444: {
    /* n:"BrtEndPCDHGLGMembers", */
    T: -1
  },
  /*::[*/
  445: {
    /* n:"BrtBeginPCDHGLGMember", */
    T: 1
  },
  /*::[*/
  446: {
    /* n:"BrtEndPCDHGLGMember", */
    T: -1
  },
  /*::[*/
  447: {
    /* n:"BrtBeginQSI", */
    T: 1
  },
  /*::[*/
  448: {
    /* n:"BrtEndQSI", */
    T: -1
  },
  /*::[*/
  449: {
    /* n:"BrtBeginQSIR", */
    T: 1
  },
  /*::[*/
  450: {
    /* n:"BrtEndQSIR", */
    T: -1
  },
  /*::[*/
  451: {
    /* n:"BrtBeginDeletedNames", */
    T: 1
  },
  /*::[*/
  452: {
    /* n:"BrtEndDeletedNames", */
    T: -1
  },
  /*::[*/
  453: {
    /* n:"BrtBeginDeletedName", */
    T: 1
  },
  /*::[*/
  454: {
    /* n:"BrtEndDeletedName", */
    T: -1
  },
  /*::[*/
  455: {
    /* n:"BrtBeginQSIFs", */
    T: 1
  },
  /*::[*/
  456: {
    /* n:"BrtEndQSIFs", */
    T: -1
  },
  /*::[*/
  457: {
    /* n:"BrtBeginQSIF", */
    T: 1
  },
  /*::[*/
  458: {
    /* n:"BrtEndQSIF", */
    T: -1
  },
  /*::[*/
  459: {
    /* n:"BrtBeginAutoSortScope", */
    T: 1
  },
  /*::[*/
  460: {
    /* n:"BrtEndAutoSortScope", */
    T: -1
  },
  /*::[*/
  461: {
    /* n:"BrtBeginConditionalFormatting", */
    T: 1
  },
  /*::[*/
  462: {
    /* n:"BrtEndConditionalFormatting", */
    T: -1
  },
  /*::[*/
  463: {
    /* n:"BrtBeginCFRule", */
    T: 1
  },
  /*::[*/
  464: {
    /* n:"BrtEndCFRule", */
    T: -1
  },
  /*::[*/
  465: {
    /* n:"BrtBeginIconSet", */
    T: 1
  },
  /*::[*/
  466: {
    /* n:"BrtEndIconSet", */
    T: -1
  },
  /*::[*/
  467: {
    /* n:"BrtBeginDatabar", */
    T: 1
  },
  /*::[*/
  468: {
    /* n:"BrtEndDatabar", */
    T: -1
  },
  /*::[*/
  469: {
    /* n:"BrtBeginColorScale", */
    T: 1
  },
  /*::[*/
  470: {
    /* n:"BrtEndColorScale", */
    T: -1
  },
  /*::[*/
  471: {
    /* n:"BrtCFVO" */
  },
  /*::[*/
  472: {
    /* n:"BrtExternValueMeta" */
  },
  /*::[*/
  473: {
    /* n:"BrtBeginColorPalette", */
    T: 1
  },
  /*::[*/
  474: {
    /* n:"BrtEndColorPalette", */
    T: -1
  },
  /*::[*/
  475: {
    /* n:"BrtIndexedColor" */
  },
  /*::[*/
  476: {
    /* n:"BrtMargins", */
    f: iE
  },
  /*::[*/
  477: {
    /* n:"BrtPrintOptions" */
  },
  /*::[*/
  478: {
    /* n:"BrtPageSetup" */
  },
  /*::[*/
  479: {
    /* n:"BrtBeginHeaderFooter", */
    T: 1
  },
  /*::[*/
  480: {
    /* n:"BrtEndHeaderFooter", */
    T: -1
  },
  /*::[*/
  481: {
    /* n:"BrtBeginSXCrtFormat", */
    T: 1
  },
  /*::[*/
  482: {
    /* n:"BrtEndSXCrtFormat", */
    T: -1
  },
  /*::[*/
  483: {
    /* n:"BrtBeginSXCrtFormats", */
    T: 1
  },
  /*::[*/
  484: {
    /* n:"BrtEndSXCrtFormats", */
    T: -1
  },
  /*::[*/
  485: {
    /* n:"BrtWsFmtInfo", */
    f: db
  },
  /*::[*/
  486: {
    /* n:"BrtBeginMgs", */
    T: 1
  },
  /*::[*/
  487: {
    /* n:"BrtEndMGs", */
    T: -1
  },
  /*::[*/
  488: {
    /* n:"BrtBeginMGMaps", */
    T: 1
  },
  /*::[*/
  489: {
    /* n:"BrtEndMGMaps", */
    T: -1
  },
  /*::[*/
  490: {
    /* n:"BrtBeginMG", */
    T: 1
  },
  /*::[*/
  491: {
    /* n:"BrtEndMG", */
    T: -1
  },
  /*::[*/
  492: {
    /* n:"BrtBeginMap", */
    T: 1
  },
  /*::[*/
  493: {
    /* n:"BrtEndMap", */
    T: -1
  },
  /*::[*/
  494: {
    /* n:"BrtHLink", */
    f: Jb
  },
  /*::[*/
  495: {
    /* n:"BrtBeginDCon", */
    T: 1
  },
  /*::[*/
  496: {
    /* n:"BrtEndDCon", */
    T: -1
  },
  /*::[*/
  497: {
    /* n:"BrtBeginDRefs", */
    T: 1
  },
  /*::[*/
  498: {
    /* n:"BrtEndDRefs", */
    T: -1
  },
  /*::[*/
  499: {
    /* n:"BrtDRef" */
  },
  /*::[*/
  500: {
    /* n:"BrtBeginScenMan", */
    T: 1
  },
  /*::[*/
  501: {
    /* n:"BrtEndScenMan", */
    T: -1
  },
  /*::[*/
  502: {
    /* n:"BrtBeginSct", */
    T: 1
  },
  /*::[*/
  503: {
    /* n:"BrtEndSct", */
    T: -1
  },
  /*::[*/
  504: {
    /* n:"BrtSlc" */
  },
  /*::[*/
  505: {
    /* n:"BrtBeginDXFs", */
    T: 1
  },
  /*::[*/
  506: {
    /* n:"BrtEndDXFs", */
    T: -1
  },
  /*::[*/
  507: {
    /* n:"BrtDXF" */
  },
  /*::[*/
  508: {
    /* n:"BrtBeginTableStyles", */
    T: 1
  },
  /*::[*/
  509: {
    /* n:"BrtEndTableStyles", */
    T: -1
  },
  /*::[*/
  510: {
    /* n:"BrtBeginTableStyle", */
    T: 1
  },
  /*::[*/
  511: {
    /* n:"BrtEndTableStyle", */
    T: -1
  },
  /*::[*/
  512: {
    /* n:"BrtTableStyleElement" */
  },
  /*::[*/
  513: {
    /* n:"BrtTableStyleClient" */
  },
  /*::[*/
  514: {
    /* n:"BrtBeginVolDeps", */
    T: 1
  },
  /*::[*/
  515: {
    /* n:"BrtEndVolDeps", */
    T: -1
  },
  /*::[*/
  516: {
    /* n:"BrtBeginVolType", */
    T: 1
  },
  /*::[*/
  517: {
    /* n:"BrtEndVolType", */
    T: -1
  },
  /*::[*/
  518: {
    /* n:"BrtBeginVolMain", */
    T: 1
  },
  /*::[*/
  519: {
    /* n:"BrtEndVolMain", */
    T: -1
  },
  /*::[*/
  520: {
    /* n:"BrtBeginVolTopic", */
    T: 1
  },
  /*::[*/
  521: {
    /* n:"BrtEndVolTopic", */
    T: -1
  },
  /*::[*/
  522: {
    /* n:"BrtVolSubtopic" */
  },
  /*::[*/
  523: {
    /* n:"BrtVolRef" */
  },
  /*::[*/
  524: {
    /* n:"BrtVolNum" */
  },
  /*::[*/
  525: {
    /* n:"BrtVolErr" */
  },
  /*::[*/
  526: {
    /* n:"BrtVolStr" */
  },
  /*::[*/
  527: {
    /* n:"BrtVolBool" */
  },
  /*::[*/
  528: {
    /* n:"BrtBeginCalcChain$", */
    T: 1
  },
  /*::[*/
  529: {
    /* n:"BrtEndCalcChain$", */
    T: -1
  },
  /*::[*/
  530: {
    /* n:"BrtBeginSortState", */
    T: 1
  },
  /*::[*/
  531: {
    /* n:"BrtEndSortState", */
    T: -1
  },
  /*::[*/
  532: {
    /* n:"BrtBeginSortCond", */
    T: 1
  },
  /*::[*/
  533: {
    /* n:"BrtEndSortCond", */
    T: -1
  },
  /*::[*/
  534: {
    /* n:"BrtBookProtection" */
  },
  /*::[*/
  535: {
    /* n:"BrtSheetProtection" */
  },
  /*::[*/
  536: {
    /* n:"BrtRangeProtection" */
  },
  /*::[*/
  537: {
    /* n:"BrtPhoneticInfo" */
  },
  /*::[*/
  538: {
    /* n:"BrtBeginECTxtWiz", */
    T: 1
  },
  /*::[*/
  539: {
    /* n:"BrtEndECTxtWiz", */
    T: -1
  },
  /*::[*/
  540: {
    /* n:"BrtBeginECTWFldInfoLst", */
    T: 1
  },
  /*::[*/
  541: {
    /* n:"BrtEndECTWFldInfoLst", */
    T: -1
  },
  /*::[*/
  542: {
    /* n:"BrtBeginECTwFldInfo", */
    T: 1
  },
  /*::[*/
  548: {
    /* n:"BrtFileSharing" */
  },
  /*::[*/
  549: {
    /* n:"BrtOleSize" */
  },
  /*::[*/
  550: {
    /* n:"BrtDrawing", */
    f: Wl
  },
  /*::[*/
  551: {
    /* n:"BrtLegacyDrawing" */
  },
  /*::[*/
  552: {
    /* n:"BrtLegacyDrawingHF" */
  },
  /*::[*/
  553: {
    /* n:"BrtWebOpt" */
  },
  /*::[*/
  554: {
    /* n:"BrtBeginWebPubItems", */
    T: 1
  },
  /*::[*/
  555: {
    /* n:"BrtEndWebPubItems", */
    T: -1
  },
  /*::[*/
  556: {
    /* n:"BrtBeginWebPubItem", */
    T: 1
  },
  /*::[*/
  557: {
    /* n:"BrtEndWebPubItem", */
    T: -1
  },
  /*::[*/
  558: {
    /* n:"BrtBeginSXCondFmt", */
    T: 1
  },
  /*::[*/
  559: {
    /* n:"BrtEndSXCondFmt", */
    T: -1
  },
  /*::[*/
  560: {
    /* n:"BrtBeginSXCondFmts", */
    T: 1
  },
  /*::[*/
  561: {
    /* n:"BrtEndSXCondFmts", */
    T: -1
  },
  /*::[*/
  562: {
    /* n:"BrtBkHim" */
  },
  /*::[*/
  564: {
    /* n:"BrtColor" */
  },
  /*::[*/
  565: {
    /* n:"BrtBeginIndexedColors", */
    T: 1
  },
  /*::[*/
  566: {
    /* n:"BrtEndIndexedColors", */
    T: -1
  },
  /*::[*/
  569: {
    /* n:"BrtBeginMRUColors", */
    T: 1
  },
  /*::[*/
  570: {
    /* n:"BrtEndMRUColors", */
    T: -1
  },
  /*::[*/
  572: {
    /* n:"BrtMRUColor" */
  },
  /*::[*/
  573: {
    /* n:"BrtBeginDVals", */
    T: 1
  },
  /*::[*/
  574: {
    /* n:"BrtEndDVals", */
    T: -1
  },
  /*::[*/
  577: {
    /* n:"BrtSupNameStart" */
  },
  /*::[*/
  578: {
    /* n:"BrtSupNameValueStart" */
  },
  /*::[*/
  579: {
    /* n:"BrtSupNameValueEnd" */
  },
  /*::[*/
  580: {
    /* n:"BrtSupNameNum" */
  },
  /*::[*/
  581: {
    /* n:"BrtSupNameErr" */
  },
  /*::[*/
  582: {
    /* n:"BrtSupNameSt" */
  },
  /*::[*/
  583: {
    /* n:"BrtSupNameNil" */
  },
  /*::[*/
  584: {
    /* n:"BrtSupNameBool" */
  },
  /*::[*/
  585: {
    /* n:"BrtSupNameFmla" */
  },
  /*::[*/
  586: {
    /* n:"BrtSupNameBits" */
  },
  /*::[*/
  587: {
    /* n:"BrtSupNameEnd" */
  },
  /*::[*/
  588: {
    /* n:"BrtEndSupBook", */
    T: -1
  },
  /*::[*/
  589: {
    /* n:"BrtCellSmartTagProperty" */
  },
  /*::[*/
  590: {
    /* n:"BrtBeginCellSmartTag", */
    T: 1
  },
  /*::[*/
  591: {
    /* n:"BrtEndCellSmartTag", */
    T: -1
  },
  /*::[*/
  592: {
    /* n:"BrtBeginCellSmartTags", */
    T: 1
  },
  /*::[*/
  593: {
    /* n:"BrtEndCellSmartTags", */
    T: -1
  },
  /*::[*/
  594: {
    /* n:"BrtBeginSmartTags", */
    T: 1
  },
  /*::[*/
  595: {
    /* n:"BrtEndSmartTags", */
    T: -1
  },
  /*::[*/
  596: {
    /* n:"BrtSmartTagType" */
  },
  /*::[*/
  597: {
    /* n:"BrtBeginSmartTagTypes", */
    T: 1
  },
  /*::[*/
  598: {
    /* n:"BrtEndSmartTagTypes", */
    T: -1
  },
  /*::[*/
  599: {
    /* n:"BrtBeginSXFilters", */
    T: 1
  },
  /*::[*/
  600: {
    /* n:"BrtEndSXFilters", */
    T: -1
  },
  /*::[*/
  601: {
    /* n:"BrtBeginSXFILTER", */
    T: 1
  },
  /*::[*/
  602: {
    /* n:"BrtEndSXFilter", */
    T: -1
  },
  /*::[*/
  603: {
    /* n:"BrtBeginFills", */
    T: 1
  },
  /*::[*/
  604: {
    /* n:"BrtEndFills", */
    T: -1
  },
  /*::[*/
  605: {
    /* n:"BrtBeginCellWatches", */
    T: 1
  },
  /*::[*/
  606: {
    /* n:"BrtEndCellWatches", */
    T: -1
  },
  /*::[*/
  607: {
    /* n:"BrtCellWatch" */
  },
  /*::[*/
  608: {
    /* n:"BrtBeginCRErrs", */
    T: 1
  },
  /*::[*/
  609: {
    /* n:"BrtEndCRErrs", */
    T: -1
  },
  /*::[*/
  610: {
    /* n:"BrtCrashRecErr" */
  },
  /*::[*/
  611: {
    /* n:"BrtBeginFonts", */
    T: 1
  },
  /*::[*/
  612: {
    /* n:"BrtEndFonts", */
    T: -1
  },
  /*::[*/
  613: {
    /* n:"BrtBeginBorders", */
    T: 1
  },
  /*::[*/
  614: {
    /* n:"BrtEndBorders", */
    T: -1
  },
  /*::[*/
  615: {
    /* n:"BrtBeginFmts", */
    T: 1
  },
  /*::[*/
  616: {
    /* n:"BrtEndFmts", */
    T: -1
  },
  /*::[*/
  617: {
    /* n:"BrtBeginCellXFs", */
    T: 1
  },
  /*::[*/
  618: {
    /* n:"BrtEndCellXFs", */
    T: -1
  },
  /*::[*/
  619: {
    /* n:"BrtBeginStyles", */
    T: 1
  },
  /*::[*/
  620: {
    /* n:"BrtEndStyles", */
    T: -1
  },
  /*::[*/
  625: {
    /* n:"BrtBigName" */
  },
  /*::[*/
  626: {
    /* n:"BrtBeginCellStyleXFs", */
    T: 1
  },
  /*::[*/
  627: {
    /* n:"BrtEndCellStyleXFs", */
    T: -1
  },
  /*::[*/
  628: {
    /* n:"BrtBeginComments", */
    T: 1
  },
  /*::[*/
  629: {
    /* n:"BrtEndComments", */
    T: -1
  },
  /*::[*/
  630: {
    /* n:"BrtBeginCommentAuthors", */
    T: 1
  },
  /*::[*/
  631: {
    /* n:"BrtEndCommentAuthors", */
    T: -1
  },
  /*::[*/
  632: {
    /* n:"BrtCommentAuthor", */
    f: vT
  },
  /*::[*/
  633: {
    /* n:"BrtBeginCommentList", */
    T: 1
  },
  /*::[*/
  634: {
    /* n:"BrtEndCommentList", */
    T: -1
  },
  /*::[*/
  635: {
    /* n:"BrtBeginComment", */
    T: 1,
    f: xT
  },
  /*::[*/
  636: {
    /* n:"BrtEndComment", */
    T: -1
  },
  /*::[*/
  637: {
    /* n:"BrtCommentText", */
    f: Ty
  },
  /*::[*/
  638: {
    /* n:"BrtBeginOleObjects", */
    T: 1
  },
  /*::[*/
  639: {
    /* n:"BrtOleObject" */
  },
  /*::[*/
  640: {
    /* n:"BrtEndOleObjects", */
    T: -1
  },
  /*::[*/
  641: {
    /* n:"BrtBeginSxrules", */
    T: 1
  },
  /*::[*/
  642: {
    /* n:"BrtEndSxRules", */
    T: -1
  },
  /*::[*/
  643: {
    /* n:"BrtBeginActiveXControls", */
    T: 1
  },
  /*::[*/
  644: {
    /* n:"BrtActiveX" */
  },
  /*::[*/
  645: {
    /* n:"BrtEndActiveXControls", */
    T: -1
  },
  /*::[*/
  646: {
    /* n:"BrtBeginPCDSDTCEMembersSortBy", */
    T: 1
  },
  /*::[*/
  648: {
    /* n:"BrtBeginCellIgnoreECs", */
    T: 1
  },
  /*::[*/
  649: {
    /* n:"BrtCellIgnoreEC" */
  },
  /*::[*/
  650: {
    /* n:"BrtEndCellIgnoreECs", */
    T: -1
  },
  /*::[*/
  651: {
    /* n:"BrtCsProp", */
    f: SE
  },
  /*::[*/
  652: {
    /* n:"BrtCsPageSetup" */
  },
  /*::[*/
  653: {
    /* n:"BrtBeginUserCsViews", */
    T: 1
  },
  /*::[*/
  654: {
    /* n:"BrtEndUserCsViews", */
    T: -1
  },
  /*::[*/
  655: {
    /* n:"BrtBeginUserCsView", */
    T: 1
  },
  /*::[*/
  656: {
    /* n:"BrtEndUserCsView", */
    T: -1
  },
  /*::[*/
  657: {
    /* n:"BrtBeginPcdSFCIEntries", */
    T: 1
  },
  /*::[*/
  658: {
    /* n:"BrtEndPCDSFCIEntries", */
    T: -1
  },
  /*::[*/
  659: {
    /* n:"BrtPCDSFCIEntry" */
  },
  /*::[*/
  660: {
    /* n:"BrtBeginListParts", */
    T: 1
  },
  /*::[*/
  661: {
    /* n:"BrtListPart" */
  },
  /*::[*/
  662: {
    /* n:"BrtEndListParts", */
    T: -1
  },
  /*::[*/
  663: {
    /* n:"BrtSheetCalcProp" */
  },
  /*::[*/
  664: {
    /* n:"BrtBeginFnGroup", */
    T: 1
  },
  /*::[*/
  665: {
    /* n:"BrtFnGroup" */
  },
  /*::[*/
  666: {
    /* n:"BrtEndFnGroup", */
    T: -1
  },
  /*::[*/
  667: {
    /* n:"BrtSupAddin" */
  },
  /*::[*/
  668: {
    /* n:"BrtSXTDMPOrder" */
  },
  /*::[*/
  669: {
    /* n:"BrtCsProtection" */
  },
  /*::[*/
  671: {
    /* n:"BrtBeginWsSortMap", */
    T: 1
  },
  /*::[*/
  672: {
    /* n:"BrtEndWsSortMap", */
    T: -1
  },
  /*::[*/
  673: {
    /* n:"BrtBeginRRSort", */
    T: 1
  },
  /*::[*/
  674: {
    /* n:"BrtEndRRSort", */
    T: -1
  },
  /*::[*/
  675: {
    /* n:"BrtRRSortItem" */
  },
  /*::[*/
  676: {
    /* n:"BrtFileSharingIso" */
  },
  /*::[*/
  677: {
    /* n:"BrtBookProtectionIso" */
  },
  /*::[*/
  678: {
    /* n:"BrtSheetProtectionIso" */
  },
  /*::[*/
  679: {
    /* n:"BrtCsProtectionIso" */
  },
  /*::[*/
  680: {
    /* n:"BrtRangeProtectionIso" */
  },
  /*::[*/
  681: {
    /* n:"BrtDValList" */
  },
  /*::[*/
  1024: {
    /* n:"BrtRwDescent" */
  },
  /*::[*/
  1025: {
    /* n:"BrtKnownFonts" */
  },
  /*::[*/
  1026: {
    /* n:"BrtBeginSXTupleSet", */
    T: 1
  },
  /*::[*/
  1027: {
    /* n:"BrtEndSXTupleSet", */
    T: -1
  },
  /*::[*/
  1028: {
    /* n:"BrtBeginSXTupleSetHeader", */
    T: 1
  },
  /*::[*/
  1029: {
    /* n:"BrtEndSXTupleSetHeader", */
    T: -1
  },
  /*::[*/
  1030: {
    /* n:"BrtSXTupleSetHeaderItem" */
  },
  /*::[*/
  1031: {
    /* n:"BrtBeginSXTupleSetData", */
    T: 1
  },
  /*::[*/
  1032: {
    /* n:"BrtEndSXTupleSetData", */
    T: -1
  },
  /*::[*/
  1033: {
    /* n:"BrtBeginSXTupleSetRow", */
    T: 1
  },
  /*::[*/
  1034: {
    /* n:"BrtEndSXTupleSetRow", */
    T: -1
  },
  /*::[*/
  1035: {
    /* n:"BrtSXTupleSetRowItem" */
  },
  /*::[*/
  1036: {
    /* n:"BrtNameExt" */
  },
  /*::[*/
  1037: {
    /* n:"BrtPCDH14" */
  },
  /*::[*/
  1038: {
    /* n:"BrtBeginPCDCalcMem14", */
    T: 1
  },
  /*::[*/
  1039: {
    /* n:"BrtEndPCDCalcMem14", */
    T: -1
  },
  /*::[*/
  1040: {
    /* n:"BrtSXTH14" */
  },
  /*::[*/
  1041: {
    /* n:"BrtBeginSparklineGroup", */
    T: 1
  },
  /*::[*/
  1042: {
    /* n:"BrtEndSparklineGroup", */
    T: -1
  },
  /*::[*/
  1043: {
    /* n:"BrtSparkline" */
  },
  /*::[*/
  1044: {
    /* n:"BrtSXDI14" */
  },
  /*::[*/
  1045: {
    /* n:"BrtWsFmtInfoEx14" */
  },
  /*::[*/
  1046: {
    /* n:"BrtBeginConditionalFormatting14", */
    T: 1
  },
  /*::[*/
  1047: {
    /* n:"BrtEndConditionalFormatting14", */
    T: -1
  },
  /*::[*/
  1048: {
    /* n:"BrtBeginCFRule14", */
    T: 1
  },
  /*::[*/
  1049: {
    /* n:"BrtEndCFRule14", */
    T: -1
  },
  /*::[*/
  1050: {
    /* n:"BrtCFVO14" */
  },
  /*::[*/
  1051: {
    /* n:"BrtBeginDatabar14", */
    T: 1
  },
  /*::[*/
  1052: {
    /* n:"BrtBeginIconSet14", */
    T: 1
  },
  /*::[*/
  1053: {
    /* n:"BrtDVal14", */
    f: hE
  },
  /*::[*/
  1054: {
    /* n:"BrtBeginDVals14", */
    T: 1
  },
  /*::[*/
  1055: {
    /* n:"BrtColor14" */
  },
  /*::[*/
  1056: {
    /* n:"BrtBeginSparklines", */
    T: 1
  },
  /*::[*/
  1057: {
    /* n:"BrtEndSparklines", */
    T: -1
  },
  /*::[*/
  1058: {
    /* n:"BrtBeginSparklineGroups", */
    T: 1
  },
  /*::[*/
  1059: {
    /* n:"BrtEndSparklineGroups", */
    T: -1
  },
  /*::[*/
  1061: {
    /* n:"BrtSXVD14" */
  },
  /*::[*/
  1062: {
    /* n:"BrtBeginSXView14", */
    T: 1
  },
  /*::[*/
  1063: {
    /* n:"BrtEndSXView14", */
    T: -1
  },
  /*::[*/
  1064: {
    /* n:"BrtBeginSXView16", */
    T: 1
  },
  /*::[*/
  1065: {
    /* n:"BrtEndSXView16", */
    T: -1
  },
  /*::[*/
  1066: {
    /* n:"BrtBeginPCD14", */
    T: 1
  },
  /*::[*/
  1067: {
    /* n:"BrtEndPCD14", */
    T: -1
  },
  /*::[*/
  1068: {
    /* n:"BrtBeginExtConn14", */
    T: 1
  },
  /*::[*/
  1069: {
    /* n:"BrtEndExtConn14", */
    T: -1
  },
  /*::[*/
  1070: {
    /* n:"BrtBeginSlicerCacheIDs", */
    T: 1
  },
  /*::[*/
  1071: {
    /* n:"BrtEndSlicerCacheIDs", */
    T: -1
  },
  /*::[*/
  1072: {
    /* n:"BrtBeginSlicerCacheID", */
    T: 1
  },
  /*::[*/
  1073: {
    /* n:"BrtEndSlicerCacheID", */
    T: -1
  },
  /*::[*/
  1075: {
    /* n:"BrtBeginSlicerCache", */
    T: 1
  },
  /*::[*/
  1076: {
    /* n:"BrtEndSlicerCache", */
    T: -1
  },
  /*::[*/
  1077: {
    /* n:"BrtBeginSlicerCacheDef", */
    T: 1
  },
  /*::[*/
  1078: {
    /* n:"BrtEndSlicerCacheDef", */
    T: -1
  },
  /*::[*/
  1079: {
    /* n:"BrtBeginSlicersEx", */
    T: 1
  },
  /*::[*/
  1080: {
    /* n:"BrtEndSlicersEx", */
    T: -1
  },
  /*::[*/
  1081: {
    /* n:"BrtBeginSlicerEx", */
    T: 1
  },
  /*::[*/
  1082: {
    /* n:"BrtEndSlicerEx", */
    T: -1
  },
  /*::[*/
  1083: {
    /* n:"BrtBeginSlicer", */
    T: 1
  },
  /*::[*/
  1084: {
    /* n:"BrtEndSlicer", */
    T: -1
  },
  /*::[*/
  1085: {
    /* n:"BrtSlicerCachePivotTables" */
  },
  /*::[*/
  1086: {
    /* n:"BrtBeginSlicerCacheOlapImpl", */
    T: 1
  },
  /*::[*/
  1087: {
    /* n:"BrtEndSlicerCacheOlapImpl", */
    T: -1
  },
  /*::[*/
  1088: {
    /* n:"BrtBeginSlicerCacheLevelsData", */
    T: 1
  },
  /*::[*/
  1089: {
    /* n:"BrtEndSlicerCacheLevelsData", */
    T: -1
  },
  /*::[*/
  1090: {
    /* n:"BrtBeginSlicerCacheLevelData", */
    T: 1
  },
  /*::[*/
  1091: {
    /* n:"BrtEndSlicerCacheLevelData", */
    T: -1
  },
  /*::[*/
  1092: {
    /* n:"BrtBeginSlicerCacheSiRanges", */
    T: 1
  },
  /*::[*/
  1093: {
    /* n:"BrtEndSlicerCacheSiRanges", */
    T: -1
  },
  /*::[*/
  1094: {
    /* n:"BrtBeginSlicerCacheSiRange", */
    T: 1
  },
  /*::[*/
  1095: {
    /* n:"BrtEndSlicerCacheSiRange", */
    T: -1
  },
  /*::[*/
  1096: {
    /* n:"BrtSlicerCacheOlapItem" */
  },
  /*::[*/
  1097: {
    /* n:"BrtBeginSlicerCacheSelections", */
    T: 1
  },
  /*::[*/
  1098: {
    /* n:"BrtSlicerCacheSelection" */
  },
  /*::[*/
  1099: {
    /* n:"BrtEndSlicerCacheSelections", */
    T: -1
  },
  /*::[*/
  1100: {
    /* n:"BrtBeginSlicerCacheNative", */
    T: 1
  },
  /*::[*/
  1101: {
    /* n:"BrtEndSlicerCacheNative", */
    T: -1
  },
  /*::[*/
  1102: {
    /* n:"BrtSlicerCacheNativeItem" */
  },
  /*::[*/
  1103: {
    /* n:"BrtRangeProtection14" */
  },
  /*::[*/
  1104: {
    /* n:"BrtRangeProtectionIso14" */
  },
  /*::[*/
  1105: {
    /* n:"BrtCellIgnoreEC14" */
  },
  /*::[*/
  1111: {
    /* n:"BrtList14" */
  },
  /*::[*/
  1112: {
    /* n:"BrtCFIcon" */
  },
  /*::[*/
  1113: {
    /* n:"BrtBeginSlicerCachesPivotCacheIDs", */
    T: 1
  },
  /*::[*/
  1114: {
    /* n:"BrtEndSlicerCachesPivotCacheIDs", */
    T: -1
  },
  /*::[*/
  1115: {
    /* n:"BrtBeginSlicers", */
    T: 1
  },
  /*::[*/
  1116: {
    /* n:"BrtEndSlicers", */
    T: -1
  },
  /*::[*/
  1117: {
    /* n:"BrtWbProp14" */
  },
  /*::[*/
  1118: {
    /* n:"BrtBeginSXEdit", */
    T: 1
  },
  /*::[*/
  1119: {
    /* n:"BrtEndSXEdit", */
    T: -1
  },
  /*::[*/
  1120: {
    /* n:"BrtBeginSXEdits", */
    T: 1
  },
  /*::[*/
  1121: {
    /* n:"BrtEndSXEdits", */
    T: -1
  },
  /*::[*/
  1122: {
    /* n:"BrtBeginSXChange", */
    T: 1
  },
  /*::[*/
  1123: {
    /* n:"BrtEndSXChange", */
    T: -1
  },
  /*::[*/
  1124: {
    /* n:"BrtBeginSXChanges", */
    T: 1
  },
  /*::[*/
  1125: {
    /* n:"BrtEndSXChanges", */
    T: -1
  },
  /*::[*/
  1126: {
    /* n:"BrtSXTupleItems" */
  },
  /*::[*/
  1128: {
    /* n:"BrtBeginSlicerStyle", */
    T: 1
  },
  /*::[*/
  1129: {
    /* n:"BrtEndSlicerStyle", */
    T: -1
  },
  /*::[*/
  1130: {
    /* n:"BrtSlicerStyleElement" */
  },
  /*::[*/
  1131: {
    /* n:"BrtBeginStyleSheetExt14", */
    T: 1
  },
  /*::[*/
  1132: {
    /* n:"BrtEndStyleSheetExt14", */
    T: -1
  },
  /*::[*/
  1133: {
    /* n:"BrtBeginSlicerCachesPivotCacheID", */
    T: 1
  },
  /*::[*/
  1134: {
    /* n:"BrtEndSlicerCachesPivotCacheID", */
    T: -1
  },
  /*::[*/
  1135: {
    /* n:"BrtBeginConditionalFormattings", */
    T: 1
  },
  /*::[*/
  1136: {
    /* n:"BrtEndConditionalFormattings", */
    T: -1
  },
  /*::[*/
  1137: {
    /* n:"BrtBeginPCDCalcMemExt", */
    T: 1
  },
  /*::[*/
  1138: {
    /* n:"BrtEndPCDCalcMemExt", */
    T: -1
  },
  /*::[*/
  1139: {
    /* n:"BrtBeginPCDCalcMemsExt", */
    T: 1
  },
  /*::[*/
  1140: {
    /* n:"BrtEndPCDCalcMemsExt", */
    T: -1
  },
  /*::[*/
  1141: {
    /* n:"BrtPCDField14" */
  },
  /*::[*/
  1142: {
    /* n:"BrtBeginSlicerStyles", */
    T: 1
  },
  /*::[*/
  1143: {
    /* n:"BrtEndSlicerStyles", */
    T: -1
  },
  /*::[*/
  1144: {
    /* n:"BrtBeginSlicerStyleElements", */
    T: 1
  },
  /*::[*/
  1145: {
    /* n:"BrtEndSlicerStyleElements", */
    T: -1
  },
  /*::[*/
  1146: {
    /* n:"BrtCFRuleExt" */
  },
  /*::[*/
  1147: {
    /* n:"BrtBeginSXCondFmt14", */
    T: 1
  },
  /*::[*/
  1148: {
    /* n:"BrtEndSXCondFmt14", */
    T: -1
  },
  /*::[*/
  1149: {
    /* n:"BrtBeginSXCondFmts14", */
    T: 1
  },
  /*::[*/
  1150: {
    /* n:"BrtEndSXCondFmts14", */
    T: -1
  },
  /*::[*/
  1152: {
    /* n:"BrtBeginSortCond14", */
    T: 1
  },
  /*::[*/
  1153: {
    /* n:"BrtEndSortCond14", */
    T: -1
  },
  /*::[*/
  1154: {
    /* n:"BrtEndDVals14", */
    T: -1
  },
  /*::[*/
  1155: {
    /* n:"BrtEndIconSet14", */
    T: -1
  },
  /*::[*/
  1156: {
    /* n:"BrtEndDatabar14", */
    T: -1
  },
  /*::[*/
  1157: {
    /* n:"BrtBeginColorScale14", */
    T: 1
  },
  /*::[*/
  1158: {
    /* n:"BrtEndColorScale14", */
    T: -1
  },
  /*::[*/
  1159: {
    /* n:"BrtBeginSxrules14", */
    T: 1
  },
  /*::[*/
  1160: {
    /* n:"BrtEndSxrules14", */
    T: -1
  },
  /*::[*/
  1161: {
    /* n:"BrtBeginPRule14", */
    T: 1
  },
  /*::[*/
  1162: {
    /* n:"BrtEndPRule14", */
    T: -1
  },
  /*::[*/
  1163: {
    /* n:"BrtBeginPRFilters14", */
    T: 1
  },
  /*::[*/
  1164: {
    /* n:"BrtEndPRFilters14", */
    T: -1
  },
  /*::[*/
  1165: {
    /* n:"BrtBeginPRFilter14", */
    T: 1
  },
  /*::[*/
  1166: {
    /* n:"BrtEndPRFilter14", */
    T: -1
  },
  /*::[*/
  1167: {
    /* n:"BrtBeginPRFItem14", */
    T: 1
  },
  /*::[*/
  1168: {
    /* n:"BrtEndPRFItem14", */
    T: -1
  },
  /*::[*/
  1169: {
    /* n:"BrtBeginCellIgnoreECs14", */
    T: 1
  },
  /*::[*/
  1170: {
    /* n:"BrtEndCellIgnoreECs14", */
    T: -1
  },
  /*::[*/
  1171: {
    /* n:"BrtDxf14" */
  },
  /*::[*/
  1172: {
    /* n:"BrtBeginDxF14s", */
    T: 1
  },
  /*::[*/
  1173: {
    /* n:"BrtEndDxf14s", */
    T: -1
  },
  /*::[*/
  1177: {
    /* n:"BrtFilter14" */
  },
  /*::[*/
  1178: {
    /* n:"BrtBeginCustomFilters14", */
    T: 1
  },
  /*::[*/
  1180: {
    /* n:"BrtCustomFilter14" */
  },
  /*::[*/
  1181: {
    /* n:"BrtIconFilter14" */
  },
  /*::[*/
  1182: {
    /* n:"BrtPivotCacheConnectionName" */
  },
  /*::[*/
  2048: {
    /* n:"BrtBeginDecoupledPivotCacheIDs", */
    T: 1
  },
  /*::[*/
  2049: {
    /* n:"BrtEndDecoupledPivotCacheIDs", */
    T: -1
  },
  /*::[*/
  2050: {
    /* n:"BrtDecoupledPivotCacheID" */
  },
  /*::[*/
  2051: {
    /* n:"BrtBeginPivotTableRefs", */
    T: 1
  },
  /*::[*/
  2052: {
    /* n:"BrtEndPivotTableRefs", */
    T: -1
  },
  /*::[*/
  2053: {
    /* n:"BrtPivotTableRef" */
  },
  /*::[*/
  2054: {
    /* n:"BrtSlicerCacheBookPivotTables" */
  },
  /*::[*/
  2055: {
    /* n:"BrtBeginSxvcells", */
    T: 1
  },
  /*::[*/
  2056: {
    /* n:"BrtEndSxvcells", */
    T: -1
  },
  /*::[*/
  2057: {
    /* n:"BrtBeginSxRow", */
    T: 1
  },
  /*::[*/
  2058: {
    /* n:"BrtEndSxRow", */
    T: -1
  },
  /*::[*/
  2060: {
    /* n:"BrtPcdCalcMem15" */
  },
  /*::[*/
  2067: {
    /* n:"BrtQsi15" */
  },
  /*::[*/
  2068: {
    /* n:"BrtBeginWebExtensions", */
    T: 1
  },
  /*::[*/
  2069: {
    /* n:"BrtEndWebExtensions", */
    T: -1
  },
  /*::[*/
  2070: {
    /* n:"BrtWebExtension" */
  },
  /*::[*/
  2071: {
    /* n:"BrtAbsPath15" */
  },
  /*::[*/
  2072: {
    /* n:"BrtBeginPivotTableUISettings", */
    T: 1
  },
  /*::[*/
  2073: {
    /* n:"BrtEndPivotTableUISettings", */
    T: -1
  },
  /*::[*/
  2075: {
    /* n:"BrtTableSlicerCacheIDs" */
  },
  /*::[*/
  2076: {
    /* n:"BrtTableSlicerCacheID" */
  },
  /*::[*/
  2077: {
    /* n:"BrtBeginTableSlicerCache", */
    T: 1
  },
  /*::[*/
  2078: {
    /* n:"BrtEndTableSlicerCache", */
    T: -1
  },
  /*::[*/
  2079: {
    /* n:"BrtSxFilter15" */
  },
  /*::[*/
  2080: {
    /* n:"BrtBeginTimelineCachePivotCacheIDs", */
    T: 1
  },
  /*::[*/
  2081: {
    /* n:"BrtEndTimelineCachePivotCacheIDs", */
    T: -1
  },
  /*::[*/
  2082: {
    /* n:"BrtTimelineCachePivotCacheID" */
  },
  /*::[*/
  2083: {
    /* n:"BrtBeginTimelineCacheIDs", */
    T: 1
  },
  /*::[*/
  2084: {
    /* n:"BrtEndTimelineCacheIDs", */
    T: -1
  },
  /*::[*/
  2085: {
    /* n:"BrtBeginTimelineCacheID", */
    T: 1
  },
  /*::[*/
  2086: {
    /* n:"BrtEndTimelineCacheID", */
    T: -1
  },
  /*::[*/
  2087: {
    /* n:"BrtBeginTimelinesEx", */
    T: 1
  },
  /*::[*/
  2088: {
    /* n:"BrtEndTimelinesEx", */
    T: -1
  },
  /*::[*/
  2089: {
    /* n:"BrtBeginTimelineEx", */
    T: 1
  },
  /*::[*/
  2090: {
    /* n:"BrtEndTimelineEx", */
    T: -1
  },
  /*::[*/
  2091: {
    /* n:"BrtWorkBookPr15" */
  },
  /*::[*/
  2092: {
    /* n:"BrtPCDH15" */
  },
  /*::[*/
  2093: {
    /* n:"BrtBeginTimelineStyle", */
    T: 1
  },
  /*::[*/
  2094: {
    /* n:"BrtEndTimelineStyle", */
    T: -1
  },
  /*::[*/
  2095: {
    /* n:"BrtTimelineStyleElement" */
  },
  /*::[*/
  2096: {
    /* n:"BrtBeginTimelineStylesheetExt15", */
    T: 1
  },
  /*::[*/
  2097: {
    /* n:"BrtEndTimelineStylesheetExt15", */
    T: -1
  },
  /*::[*/
  2098: {
    /* n:"BrtBeginTimelineStyles", */
    T: 1
  },
  /*::[*/
  2099: {
    /* n:"BrtEndTimelineStyles", */
    T: -1
  },
  /*::[*/
  2100: {
    /* n:"BrtBeginTimelineStyleElements", */
    T: 1
  },
  /*::[*/
  2101: {
    /* n:"BrtEndTimelineStyleElements", */
    T: -1
  },
  /*::[*/
  2102: {
    /* n:"BrtDxf15" */
  },
  /*::[*/
  2103: {
    /* n:"BrtBeginDxfs15", */
    T: 1
  },
  /*::[*/
  2104: {
    /* n:"BrtEndDxfs15", */
    T: -1
  },
  /*::[*/
  2105: {
    /* n:"BrtSlicerCacheHideItemsWithNoData" */
  },
  /*::[*/
  2106: {
    /* n:"BrtBeginItemUniqueNames", */
    T: 1
  },
  /*::[*/
  2107: {
    /* n:"BrtEndItemUniqueNames", */
    T: -1
  },
  /*::[*/
  2108: {
    /* n:"BrtItemUniqueName" */
  },
  /*::[*/
  2109: {
    /* n:"BrtBeginExtConn15", */
    T: 1
  },
  /*::[*/
  2110: {
    /* n:"BrtEndExtConn15", */
    T: -1
  },
  /*::[*/
  2111: {
    /* n:"BrtBeginOledbPr15", */
    T: 1
  },
  /*::[*/
  2112: {
    /* n:"BrtEndOledbPr15", */
    T: -1
  },
  /*::[*/
  2113: {
    /* n:"BrtBeginDataFeedPr15", */
    T: 1
  },
  /*::[*/
  2114: {
    /* n:"BrtEndDataFeedPr15", */
    T: -1
  },
  /*::[*/
  2115: {
    /* n:"BrtTextPr15" */
  },
  /*::[*/
  2116: {
    /* n:"BrtRangePr15" */
  },
  /*::[*/
  2117: {
    /* n:"BrtDbCommand15" */
  },
  /*::[*/
  2118: {
    /* n:"BrtBeginDbTables15", */
    T: 1
  },
  /*::[*/
  2119: {
    /* n:"BrtEndDbTables15", */
    T: -1
  },
  /*::[*/
  2120: {
    /* n:"BrtDbTable15" */
  },
  /*::[*/
  2121: {
    /* n:"BrtBeginDataModel", */
    T: 1
  },
  /*::[*/
  2122: {
    /* n:"BrtEndDataModel", */
    T: -1
  },
  /*::[*/
  2123: {
    /* n:"BrtBeginModelTables", */
    T: 1
  },
  /*::[*/
  2124: {
    /* n:"BrtEndModelTables", */
    T: -1
  },
  /*::[*/
  2125: {
    /* n:"BrtModelTable" */
  },
  /*::[*/
  2126: {
    /* n:"BrtBeginModelRelationships", */
    T: 1
  },
  /*::[*/
  2127: {
    /* n:"BrtEndModelRelationships", */
    T: -1
  },
  /*::[*/
  2128: {
    /* n:"BrtModelRelationship" */
  },
  /*::[*/
  2129: {
    /* n:"BrtBeginECTxtWiz15", */
    T: 1
  },
  /*::[*/
  2130: {
    /* n:"BrtEndECTxtWiz15", */
    T: -1
  },
  /*::[*/
  2131: {
    /* n:"BrtBeginECTWFldInfoLst15", */
    T: 1
  },
  /*::[*/
  2132: {
    /* n:"BrtEndECTWFldInfoLst15", */
    T: -1
  },
  /*::[*/
  2133: {
    /* n:"BrtBeginECTWFldInfo15", */
    T: 1
  },
  /*::[*/
  2134: {
    /* n:"BrtFieldListActiveItem" */
  },
  /*::[*/
  2135: {
    /* n:"BrtPivotCacheIdVersion" */
  },
  /*::[*/
  2136: {
    /* n:"BrtSXDI15" */
  },
  /*::[*/
  2137: {
    /* n:"BrtBeginModelTimeGroupings", */
    T: 1
  },
  /*::[*/
  2138: {
    /* n:"BrtEndModelTimeGroupings", */
    T: -1
  },
  /*::[*/
  2139: {
    /* n:"BrtBeginModelTimeGrouping", */
    T: 1
  },
  /*::[*/
  2140: {
    /* n:"BrtEndModelTimeGrouping", */
    T: -1
  },
  /*::[*/
  2141: {
    /* n:"BrtModelTimeGroupingCalcCol" */
  },
  /*::[*/
  3072: {
    /* n:"BrtUid" */
  },
  /*::[*/
  3073: {
    /* n:"BrtRevisionPtr" */
  },
  /*::[*/
  4096: {
    /* n:"BrtBeginDynamicArrayPr", */
    T: 1
  },
  /*::[*/
  4097: {
    /* n:"BrtEndDynamicArrayPr", */
    T: -1
  },
  /*::[*/
  5002: {
    /* n:"BrtBeginRichValueBlock", */
    T: 1
  },
  /*::[*/
  5003: {
    /* n:"BrtEndRichValueBlock", */
    T: -1
  },
  /*::[*/
  5081: {
    /* n:"BrtBeginRichFilters", */
    T: 1
  },
  /*::[*/
  5082: {
    /* n:"BrtEndRichFilters", */
    T: -1
  },
  /*::[*/
  5083: {
    /* n:"BrtRichFilter" */
  },
  /*::[*/
  5084: {
    /* n:"BrtBeginRichFilterColumn", */
    T: 1
  },
  /*::[*/
  5085: {
    /* n:"BrtEndRichFilterColumn", */
    T: -1
  },
  /*::[*/
  5086: {
    /* n:"BrtBeginCustomRichFilters", */
    T: 1
  },
  /*::[*/
  5087: {
    /* n:"BrtEndCustomRichFilters", */
    T: -1
  },
  /*::[*/
  5088: {
    /* n:"BrtCustomRichFilter" */
  },
  /*::[*/
  5089: {
    /* n:"BrtTop10RichFilter" */
  },
  /*::[*/
  5090: {
    /* n:"BrtDynamicRichFilter" */
  },
  /*::[*/
  5092: {
    /* n:"BrtBeginRichSortCondition", */
    T: 1
  },
  /*::[*/
  5093: {
    /* n:"BrtEndRichSortCondition", */
    T: -1
  },
  /*::[*/
  5094: {
    /* n:"BrtRichFilterDateGroupItem" */
  },
  /*::[*/
  5095: {
    /* n:"BrtBeginCalcFeatures", */
    T: 1
  },
  /*::[*/
  5096: {
    /* n:"BrtEndCalcFeatures", */
    T: -1
  },
  /*::[*/
  5097: {
    /* n:"BrtCalcFeature" */
  },
  /*::[*/
  5099: {
    /* n:"BrtExternalLinksPr" */
  },
  /*::[*/
  65535: { n: "" }
};
function ne(e, t, r, n) {
  var i = t;
  if (!isNaN(i)) {
    var s = n || (r || []).length || 0, a = e.next(4);
    a.write_shift(2, i), a.write_shift(2, s), /*:: len != null &&*/
    s > 0 && vc(r) && e.push(r);
  }
}
function aA(e, t, r, n) {
  var i = n || (r || []).length || 0;
  if (i <= 8224)
    return ne(e, t, r, i);
  var s = t;
  if (!isNaN(s)) {
    for (var a = r.parts || [], o = 0, l = 0, c = 0; c + (a[o] || 8224) <= 8224; )
      c += a[o] || 8224, o++;
    var f = e.next(4);
    for (f.write_shift(2, s), f.write_shift(2, c), e.push(r.slice(l, l + c)), l += c; l < i; ) {
      for (f = e.next(4), f.write_shift(2, 60), c = 0; c + (a[o] || 8224) <= 8224; )
        c += a[o] || 8224, o++;
      f.write_shift(2, c), e.push(r.slice(l, l + c)), l += c;
    }
  }
}
function Ks(e, t, r) {
  return e || (e = G(7)), e.write_shift(2, t), e.write_shift(2, r), e.write_shift(2, 0), e.write_shift(1, 0), e;
}
function oA(e, t, r, n) {
  var i = G(9);
  return Ks(i, e, t), Dd(r, n || "b", i), i;
}
function lA(e, t, r) {
  var n = G(8 + 2 * r.length);
  return Ks(n, e, t), n.write_shift(1, r.length), n.write_shift(r.length, r, "sbcs"), n.l < n.length ? n.slice(0, n.l) : n;
}
function cA(e, t, r, n) {
  if (t.v != null)
    switch (t.t) {
      case "d":
      case "n":
        var i = t.t == "d" ? $t(Wt(t.v)) : t.v;
        i == (i | 0) && i >= 0 && i < 65536 ? ne(e, 2, Sw(r, n, i)) : ne(e, 3, Tw(r, n, i));
        return;
      case "b":
      case "e":
        ne(e, 5, oA(r, n, t.v, t.t));
        return;
      case "s":
      case "str":
        ne(e, 4, lA(r, n, (t.v || "").slice(0, 255)));
        return;
    }
  ne(e, 1, Ks(null, r, n));
}
function fA(e, t, r, n) {
  var i = Array.isArray(t), s = je(t["!ref"] || "A1"), a, o = "", l = [];
  if (s.e.c > 255 || s.e.r > 16383) {
    if (n.WTF)
      throw new Error("Range " + (t["!ref"] || "A1") + " exceeds format limit A1:IV16384");
    s.e.c = Math.min(s.e.c, 255), s.e.r = Math.min(s.e.c, 16383), a = ht(s);
  }
  for (var c = s.s.r; c <= s.e.r; ++c) {
    o = bt(c);
    for (var f = s.s.c; f <= s.e.c; ++f) {
      c === s.s.r && (l[f] = Ct(f)), a = l[f] + o;
      var h = i ? (t[c] || [])[f] : t[a];
      h && cA(e, h, c, f);
    }
  }
}
function hA(e, t) {
  for (var r = t || {}, n = jt(), i = 0, s = 0; s < e.SheetNames.length; ++s)
    e.SheetNames[s] == r.sheet && (i = s);
  if (i == 0 && r.sheet && e.SheetNames[0] != r.sheet)
    throw new Error("Sheet not found: " + r.sheet);
  return ne(n, r.biff == 4 ? 1033 : r.biff == 3 ? 521 : 9, Ec(e, 16, r)), fA(n, e.Sheets[e.SheetNames[i]], i, r), ne(n, 10), n.end();
}
function uA(e, t, r) {
  ne(e, 49, sw({
    sz: 12,
    color: { theme: 1 },
    name: "Arial",
    family: 2,
    scheme: "minor"
  }, r));
}
function dA(e, t, r) {
  t && [[5, 8], [23, 26], [41, 44], [
    /*63*/
    50,
    /*66],[164,*/
    392
  ]].forEach(function(n) {
    for (var i = n[0]; i <= n[1]; ++i)
      t[i] != null && ne(e, 1054, lw(i, t[i], r));
  });
}
function gA(e, t) {
  var r = G(19);
  r.write_shift(4, 2151), r.write_shift(4, 0), r.write_shift(4, 0), r.write_shift(2, 3), r.write_shift(1, 1), r.write_shift(4, 0), ne(e, 2151, r), r = G(39), r.write_shift(4, 2152), r.write_shift(4, 0), r.write_shift(4, 0), r.write_shift(2, 3), r.write_shift(1, 0), r.write_shift(4, 0), r.write_shift(2, 1), r.write_shift(4, 4), r.write_shift(2, 0), Md(je(t["!ref"] || "A1"), r), r.write_shift(4, 4), ne(e, 2152, r);
}
function pA(e, t) {
  for (var r = 0; r < 16; ++r)
    ne(e, 224, d0({ numFmtId: 0, style: !0 }, 0, t));
  t.cellXfs.forEach(function(n) {
    ne(e, 224, d0(n, 0, t));
  });
}
function mA(e, t) {
  for (var r = 0; r < t["!links"].length; ++r) {
    var n = t["!links"][r];
    ne(e, 440, mw(n)), n[1].Tooltip && ne(e, 2048, xw(n));
  }
  delete t["!links"];
}
function xA(e, t) {
  if (t) {
    var r = 0;
    t.forEach(function(n, i) {
      ++r <= 256 && n && ne(e, 125, yw(Fo(i, n), i));
    });
  }
}
function _A(e, t, r, n, i) {
  var s = 16 + Dn(i.cellXfs, t, i);
  if (t.v == null && !t.bf) {
    ne(e, 513, Qn(r, n, s));
    return;
  }
  if (t.bf)
    ne(e, 6, HS(t, r, n, i, s));
  else
    switch (t.t) {
      case "d":
      case "n":
        var a = t.t == "d" ? $t(Wt(t.v)) : t.v;
        ne(e, 515, uw(r, n, a, s));
        break;
      case "b":
      case "e":
        ne(e, 517, hw(r, n, t.v, s, i, t.t));
        break;
      case "s":
      case "str":
        if (i.bookSST) {
          var o = Fc(i.Strings, t.v, i.revStrings);
          ne(e, 253, aw(r, n, o, s));
        } else
          ne(e, 516, ow(r, n, (t.v || "").slice(0, 255), s, i));
        break;
      default:
        ne(e, 513, Qn(r, n, s));
    }
}
function vA(e, t, r) {
  var n = jt(), i = r.SheetNames[e], s = r.Sheets[i] || {}, a = (r || {}).Workbook || {}, o = (a.Sheets || [])[e] || {}, l = Array.isArray(s), c = t.biff == 8, f, h = "", u = [], d = je(s["!ref"] || "A1"), p = c ? 65536 : 16384;
  if (d.e.c > 255 || d.e.r >= p) {
    if (t.WTF)
      throw new Error("Range " + (s["!ref"] || "A1") + " exceeds format limit A1:IV16384");
    d.e.c = Math.min(d.e.c, 255), d.e.r = Math.min(d.e.c, p - 1);
  }
  ne(n, 2057, Ec(r, 16, t)), ne(n, 13, or(1)), ne(n, 12, or(100)), ne(n, 15, Bt(!0)), ne(n, 17, Bt(!1)), ne(n, 16, Jn(1e-3)), ne(n, 95, Bt(!0)), ne(n, 42, Bt(!1)), ne(n, 43, Bt(!1)), ne(n, 130, or(1)), ne(n, 128, fw([0, 0])), ne(n, 131, Bt(!1)), ne(n, 132, Bt(!1)), c && xA(n, s["!cols"]), ne(n, 512, cw(d, t)), c && (s["!links"] = []);
  for (var g = d.s.r; g <= d.e.r; ++g) {
    h = bt(g);
    for (var m = d.s.c; m <= d.e.c; ++m) {
      g === d.s.r && (u[m] = Ct(m)), f = u[m] + h;
      var v = l ? (s[g] || [])[m] : s[f];
      v && (_A(n, v, g, m, t), c && v.l && s["!links"].push([f, v.l]));
    }
  }
  var w = o.CodeName || o.name || i;
  return c && ne(n, 574, iw((a.Views || [])[0])), c && (s["!merges"] || []).length && ne(n, 229, pw(s["!merges"])), c && mA(n, s), ne(n, 442, Cd(w)), c && gA(n, s), ne(
    n,
    10
    /* EOF */
  ), n.end();
}
function yA(e, t, r) {
  var n = jt(), i = (e || {}).Workbook || {}, s = i.Sheets || [], a = (
    /*::((*/
    i.WBProps || {
      /*::CodeName:"ThisWorkbook"*/
    }
  ), o = r.biff == 8, l = r.biff == 5;
  if (ne(n, 2057, Ec(e, 5, r)), r.bookType == "xla" && ne(
    n,
    135
    /* Addin */
  ), ne(n, 225, o ? or(1200) : null), ne(n, 193, jy(2)), l && ne(
    n,
    191
    /* ToolbarHdr */
  ), l && ne(
    n,
    192
    /* ToolbarEnd */
  ), ne(
    n,
    226
    /* InterfaceEnd */
  ), ne(n, 92, ew("SheetJS", r)), ne(n, 66, or(o ? 1200 : 1252)), o && ne(n, 353, or(0)), o && ne(
    n,
    448
    /* Excel9File */
  ), ne(n, 317, ww(e.SheetNames.length)), o && e.vbaraw && ne(
    n,
    211
    /* ObProj */
  ), o && e.vbaraw) {
    var c = a.CodeName || "ThisWorkbook";
    ne(n, 442, Cd(c));
  }
  ne(n, 156, or(17)), ne(n, 25, Bt(!1)), ne(n, 18, Bt(!1)), ne(n, 19, or(0)), o && ne(n, 431, Bt(!1)), o && ne(n, 444, or(0)), ne(n, 61, nw()), ne(n, 64, Bt(!1)), ne(n, 141, or(0)), ne(n, 34, Bt(EE(e) == "true")), ne(n, 14, Bt(!0)), o && ne(n, 439, Bt(!1)), ne(n, 218, or(0)), uA(n, e, r), dA(n, e.SSF, r), pA(n, r), o && ne(n, 352, Bt(!1));
  var f = n.end(), h = jt();
  o && ne(h, 140, _w()), o && r.Strings && aA(h, 252, rw(r.Strings)), ne(
    h,
    10
    /* EOF */
  );
  var u = h.end(), d = jt(), p = 0, g = 0;
  for (g = 0; g < e.SheetNames.length; ++g)
    p += (o ? 12 : 11) + (o ? 2 : 1) * e.SheetNames[g].length;
  var m = f.length + p + u.length;
  for (g = 0; g < e.SheetNames.length; ++g) {
    var v = s[g] || {};
    ne(d, 133, tw({ pos: m, hs: v.Hidden || 0, dt: 0, name: e.SheetNames[g] }, r)), m += t[g].length;
  }
  var w = d.end();
  if (p != w.length)
    throw new Error("BS8 " + p + " != " + w.length);
  var S = [];
  return f.length && S.push(f), w.length && S.push(w), u.length && S.push(u), Tt(S);
}
function wA(e, t) {
  var r = t || {}, n = [];
  e && !e.SSF && (e.SSF = Gt(it)), e && e.SSF && (Eo(), bo(e.SSF), r.revssf = Ao(e.SSF), r.revssf[e.SSF[65535]] = 0, r.ssf = e.SSF), r.Strings = /*::((*/
  [], r.Strings.Count = 0, r.Strings.Unique = 0, Cc(r), r.cellXfs = [], Dn(r.cellXfs, {}, { revssf: { General: 0 } }), e.Props || (e.Props = {});
  for (var i = 0; i < e.SheetNames.length; ++i)
    n[n.length] = vA(i, r, e);
  return n.unshift(yA(e, n, r)), Tt(n);
}
function ig(e, t) {
  for (var r = 0; r <= e.SheetNames.length; ++r) {
    var n = e.Sheets[e.SheetNames[r]];
    if (!(!n || !n["!ref"])) {
      var i = tr(n["!ref"]);
      i.e.c > 255 && typeof console < "u" && console.error && console.error("Worksheet '" + e.SheetNames[r] + "' extends beyond column IV (255).  Data may be lost.");
    }
  }
  var s = t || {};
  switch (s.biff || 2) {
    case 8:
    case 5:
      return wA(e, t);
    case 4:
    case 3:
    case 2:
      return hA(e, t);
  }
  throw new Error("invalid type " + s.bookType + " for BIFF");
}
function TA(e, t, r, n) {
  for (var i = e["!merges"] || [], s = [], a = t.s.c; a <= t.e.c; ++a) {
    for (var o = 0, l = 0, c = 0; c < i.length; ++c)
      if (!(i[c].s.r > r || i[c].s.c > a) && !(i[c].e.r < r || i[c].e.c < a)) {
        if (i[c].s.r < r || i[c].s.c < a) {
          o = -1;
          break;
        }
        o = i[c].e.r - i[c].s.r + 1, l = i[c].e.c - i[c].s.c + 1;
        break;
      }
    if (!(o < 0)) {
      var f = Le({ r, c: a }), h = n.dense ? (e[r] || [])[a] : e[f], u = h && h.v != null && (h.h || Q2(h.w || (an(h), h.w) || "")) || "", d = {};
      o > 1 && (d.rowspan = o), l > 1 && (d.colspan = l), n.editable ? u = '<span contenteditable="true">' + u + "</span>" : h && (d["data-t"] = h && h.t || "z", h.v != null && (d["data-v"] = h.v), h.z != null && (d["data-z"] = h.z), h.l && (h.l.Target || "#").charAt(0) != "#" && (u = '<a href="' + h.l.Target + '">' + u + "</a>")), d.id = (n.id || "sjs") + "-" + f, s.push(re("td", u, d));
    }
  }
  var p = "<tr>";
  return p + s.join("") + "</tr>";
}
var SA = '<html><head><meta charset="utf-8"/><title>SheetJS Table Export</title></head><body>', bA = "</body></html>";
function EA(e, t, r) {
  var n = [];
  return n.join("") + "<table" + (r && r.id ? ' id="' + r.id + '"' : "") + ">";
}
function sg(e, t) {
  var r = t || {}, n = r.header != null ? r.header : SA, i = r.footer != null ? r.footer : bA, s = [n], a = tr(e["!ref"]);
  r.dense = Array.isArray(e), s.push(EA(e, a, r));
  for (var o = a.s.r; o <= a.e.r; ++o)
    s.push(TA(e, a, o, r));
  return s.push("</table>" + i), s.join("");
}
function ag(e, t, r) {
  var n = r || {}, i = 0, s = 0;
  if (n.origin != null)
    if (typeof n.origin == "number")
      i = n.origin;
    else {
      var a = typeof n.origin == "string" ? _t(n.origin) : n.origin;
      i = a.r, s = a.c;
    }
  var o = t.getElementsByTagName("tr"), l = Math.min(n.sheetRows || 1e7, o.length), c = { s: { r: 0, c: 0 }, e: { r: i, c: s } };
  if (e["!ref"]) {
    var f = tr(e["!ref"]);
    c.s.r = Math.min(c.s.r, f.s.r), c.s.c = Math.min(c.s.c, f.s.c), c.e.r = Math.max(c.e.r, f.e.r), c.e.c = Math.max(c.e.c, f.e.c), i == -1 && (c.e.r = i = f.e.r + 1);
  }
  var h = [], u = 0, d = e["!rows"] || (e["!rows"] = []), p = 0, g = 0, m = 0, v = 0, w = 0, S = 0;
  for (e["!cols"] || (e["!cols"] = []); p < o.length && g < l; ++p) {
    var D = o[p];
    if (y0(D)) {
      if (n.display)
        continue;
      d[g] = { hidden: !0 };
    }
    var P = D.children;
    for (m = v = 0; m < P.length; ++m) {
      var N = P[m];
      if (!(n.display && y0(N))) {
        var O = N.hasAttribute("data-v") ? N.getAttribute("data-v") : N.hasAttribute("v") ? N.getAttribute("v") : ny(N.innerHTML), I = N.getAttribute("data-z") || N.getAttribute("z");
        for (u = 0; u < h.length; ++u) {
          var R = h[u];
          R.s.c == v + s && R.s.r < g + i && g + i <= R.e.r && (v = R.e.c + 1 - s, u = -1);
        }
        S = +N.getAttribute("colspan") || 1, ((w = +N.getAttribute("rowspan") || 1) > 1 || S > 1) && h.push({ s: { r: g + i, c: v + s }, e: { r: g + i + (w || 1) - 1, c: v + s + (S || 1) - 1 } });
        var z = { t: "s", v: O }, H = N.getAttribute("data-t") || N.getAttribute("t") || "";
        O != null && (O.length == 0 ? z.t = H || "z" : n.raw || O.trim().length == 0 || H == "s" || (O === "TRUE" ? z = { t: "b", v: !0 } : O === "FALSE" ? z = { t: "b", v: !1 } : isNaN(tn(O)) ? isNaN(Ms(O).getDate()) || (z = { t: "d", v: Wt(O) }, n.cellDates || (z = { t: "n", v: $t(z.v) }), z.z = n.dateNF || it[14]) : z = { t: "n", v: tn(O) })), z.z === void 0 && I != null && (z.z = I);
        var V = "", ee = N.getElementsByTagName("A");
        if (ee && ee.length)
          for (var ge = 0; ge < ee.length && !(ee[ge].hasAttribute("href") && (V = ee[ge].getAttribute("href"), V.charAt(0) != "#")); ++ge)
            ;
        V && V.charAt(0) != "#" && (z.l = { Target: V }), n.dense ? (e[g + i] || (e[g + i] = []), e[g + i][v + s] = z) : e[Le({ c: v + s, r: g + i })] = z, c.e.c < v + s && (c.e.c = v + s), v += S;
      }
    }
    ++g;
  }
  return h.length && (e["!merges"] = (e["!merges"] || []).concat(h)), c.e.r = Math.max(c.e.r, g - 1 + i), e["!ref"] = ht(c), g >= l && (e["!fullref"] = ht((c.e.r = o.length - p + g - 1 + i, c))), e;
}
function og(e, t) {
  var r = t || {}, n = r.dense ? [] : {};
  return ag(n, e, t);
}
function AA(e, t) {
  return ii(og(e, t), t);
}
function y0(e) {
  var t = "", r = kA(e);
  return r && (t = r(e).getPropertyValue("display")), t || (t = e.style && e.style.display), t === "none";
}
function kA(e) {
  return e.ownerDocument.defaultView && typeof e.ownerDocument.defaultView.getComputedStyle == "function" ? e.ownerDocument.defaultView.getComputedStyle : typeof getComputedStyle == "function" ? getComputedStyle : null;
}
var OA = /* @__PURE__ */ function() {
  var e = [
    "<office:master-styles>",
    '<style:master-page style:name="mp1" style:page-layout-name="mp1">',
    "<style:header/>",
    '<style:header-left style:display="false"/>',
    "<style:footer/>",
    '<style:footer-left style:display="false"/>',
    "</style:master-page>",
    "</office:master-styles>"
  ].join(""), t = "<office:document-styles " + Ps({
    "xmlns:office": "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
    "xmlns:table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
    "xmlns:style": "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
    "xmlns:text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
    "xmlns:draw": "urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
    "xmlns:fo": "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
    "xmlns:xlink": "http://www.w3.org/1999/xlink",
    "xmlns:dc": "http://purl.org/dc/elements/1.1/",
    "xmlns:number": "urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0",
    "xmlns:svg": "urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",
    "xmlns:of": "urn:oasis:names:tc:opendocument:xmlns:of:1.2",
    "office:version": "1.2"
  }) + ">" + e + "</office:document-styles>";
  return function() {
    return ut + t;
  };
}(), w0 = /* @__PURE__ */ function() {
  var e = function(s) {
    return Ie(s).replace(/  +/g, function(a) {
      return '<text:s text:c="' + a.length + '"/>';
    }).replace(/\t/g, "<text:tab/>").replace(/\n/g, "</text:p><text:p>").replace(/^ /, "<text:s/>").replace(/ $/, "<text:s/>");
  }, t = `          <table:table-cell />
`, r = `          <table:covered-table-cell/>
`, n = function(s, a, o) {
    var l = [];
    l.push('      <table:table table:name="' + Ie(a.SheetNames[o]) + `" table:style-name="ta1">
`);
    var c = 0, f = 0, h = tr(s["!ref"] || "A1"), u = s["!merges"] || [], d = 0, p = Array.isArray(s);
    if (s["!cols"])
      for (f = 0; f <= h.e.c; ++f)
        l.push("        <table:table-column" + (s["!cols"][f] ? ' table:style-name="co' + s["!cols"][f].ods + '"' : "") + `></table:table-column>
`);
    var g = "", m = s["!rows"] || [];
    for (c = 0; c < h.s.r; ++c)
      g = m[c] ? ' table:style-name="ro' + m[c].ods + '"' : "", l.push("        <table:table-row" + g + `></table:table-row>
`);
    for (; c <= h.e.r; ++c) {
      for (g = m[c] ? ' table:style-name="ro' + m[c].ods + '"' : "", l.push("        <table:table-row" + g + `>
`), f = 0; f < h.s.c; ++f)
        l.push(t);
      for (; f <= h.e.c; ++f) {
        var v = !1, w = {}, S = "";
        for (d = 0; d != u.length; ++d)
          if (!(u[d].s.c > f) && !(u[d].s.r > c) && !(u[d].e.c < f) && !(u[d].e.r < c)) {
            (u[d].s.c != f || u[d].s.r != c) && (v = !0), w["table:number-columns-spanned"] = u[d].e.c - u[d].s.c + 1, w["table:number-rows-spanned"] = u[d].e.r - u[d].s.r + 1;
            break;
          }
        if (v) {
          l.push(r);
          continue;
        }
        var D = Le({ r: c, c: f }), P = p ? (s[c] || [])[f] : s[D];
        if (P && P.f && (w["table:formula"] = Ie(XS(P.f)), P.F && P.F.slice(0, D.length) == D)) {
          var N = tr(P.F);
          w["table:number-matrix-columns-spanned"] = N.e.c - N.s.c + 1, w["table:number-matrix-rows-spanned"] = N.e.r - N.s.r + 1;
        }
        if (!P) {
          l.push(t);
          continue;
        }
        switch (P.t) {
          case "b":
            S = P.v ? "TRUE" : "FALSE", w["office:value-type"] = "boolean", w["office:boolean-value"] = P.v ? "true" : "false";
            break;
          case "n":
            S = P.w || String(P.v || 0), w["office:value-type"] = "float", w["office:value"] = P.v || 0;
            break;
          case "s":
          case "str":
            S = P.v == null ? "" : P.v, w["office:value-type"] = "string";
            break;
          case "d":
            S = P.w || Wt(P.v).toISOString(), w["office:value-type"] = "date", w["office:date-value"] = Wt(P.v).toISOString(), w["table:style-name"] = "ce1";
            break;
          default:
            l.push(t);
            continue;
        }
        var O = e(S);
        if (P.l && P.l.Target) {
          var I = P.l.Target;
          I = I.charAt(0) == "#" ? "#" + KS(I.slice(1)) : I, I.charAt(0) != "#" && !I.match(/^\w+:/) && (I = "../" + I), O = re("text:a", O, { "xlink:href": I.replace(/&/g, "&amp;") });
        }
        l.push("          " + re("table:table-cell", re("text:p", O, {}), w) + `
`);
      }
      l.push(`        </table:table-row>
`);
    }
    return l.push(`      </table:table>
`), l.join("");
  }, i = function(s, a) {
    s.push(` <office:automatic-styles>
`), s.push(`  <number:date-style style:name="N37" number:automatic-order="true">
`), s.push(`   <number:month number:style="long"/>
`), s.push(`   <number:text>/</number:text>
`), s.push(`   <number:day number:style="long"/>
`), s.push(`   <number:text>/</number:text>
`), s.push(`   <number:year/>
`), s.push(`  </number:date-style>
`);
    var o = 0;
    a.SheetNames.map(function(c) {
      return a.Sheets[c];
    }).forEach(function(c) {
      if (c && c["!cols"]) {
        for (var f = 0; f < c["!cols"].length; ++f)
          if (c["!cols"][f]) {
            var h = c["!cols"][f];
            if (h.width == null && h.wpx == null && h.wch == null)
              continue;
            Ac(h), h.ods = o;
            var u = c["!cols"][f].wpx + "px";
            s.push('  <style:style style:name="co' + o + `" style:family="table-column">
`), s.push('   <style:table-column-properties fo:break-before="auto" style:column-width="' + u + `"/>
`), s.push(`  </style:style>
`), ++o;
          }
      }
    });
    var l = 0;
    a.SheetNames.map(function(c) {
      return a.Sheets[c];
    }).forEach(function(c) {
      if (c && c["!rows"]) {
        for (var f = 0; f < c["!rows"].length; ++f)
          if (c["!rows"][f]) {
            c["!rows"][f].ods = l;
            var h = c["!rows"][f].hpx + "px";
            s.push('  <style:style style:name="ro' + l + `" style:family="table-row">
`), s.push('   <style:table-row-properties fo:break-before="auto" style:row-height="' + h + `"/>
`), s.push(`  </style:style>
`), ++l;
          }
      }
    }), s.push(`  <style:style style:name="ta1" style:family="table" style:master-page-name="mp1">
`), s.push(`   <style:table-properties table:display="true" style:writing-mode="lr-tb"/>
`), s.push(`  </style:style>
`), s.push(`  <style:style style:name="ce1" style:family="table-cell" style:parent-style-name="Default" style:data-style-name="N37"/>
`), s.push(` </office:automatic-styles>
`);
  };
  return function(a, o) {
    var l = [ut], c = Ps({
      "xmlns:office": "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
      "xmlns:table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
      "xmlns:style": "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
      "xmlns:text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
      "xmlns:draw": "urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
      "xmlns:fo": "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      "xmlns:dc": "http://purl.org/dc/elements/1.1/",
      "xmlns:meta": "urn:oasis:names:tc:opendocument:xmlns:meta:1.0",
      "xmlns:number": "urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0",
      "xmlns:presentation": "urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
      "xmlns:svg": "urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",
      "xmlns:chart": "urn:oasis:names:tc:opendocument:xmlns:chart:1.0",
      "xmlns:dr3d": "urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",
      "xmlns:math": "http://www.w3.org/1998/Math/MathML",
      "xmlns:form": "urn:oasis:names:tc:opendocument:xmlns:form:1.0",
      "xmlns:script": "urn:oasis:names:tc:opendocument:xmlns:script:1.0",
      "xmlns:ooo": "http://openoffice.org/2004/office",
      "xmlns:ooow": "http://openoffice.org/2004/writer",
      "xmlns:oooc": "http://openoffice.org/2004/calc",
      "xmlns:dom": "http://www.w3.org/2001/xml-events",
      "xmlns:xforms": "http://www.w3.org/2002/xforms",
      "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "xmlns:sheet": "urn:oasis:names:tc:opendocument:sh33tjs:1.0",
      "xmlns:rpt": "http://openoffice.org/2005/report",
      "xmlns:of": "urn:oasis:names:tc:opendocument:xmlns:of:1.2",
      "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
      "xmlns:grddl": "http://www.w3.org/2003/g/data-view#",
      "xmlns:tableooo": "http://openoffice.org/2009/table",
      "xmlns:drawooo": "http://openoffice.org/2010/draw",
      "xmlns:calcext": "urn:org:documentfoundation:names:experimental:calc:xmlns:calcext:1.0",
      "xmlns:loext": "urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0",
      "xmlns:field": "urn:openoffice:names:experimental:ooo-ms-interop:xmlns:field:1.0",
      "xmlns:formx": "urn:openoffice:names:experimental:ooxml-odf-interop:xmlns:form:1.0",
      "xmlns:css3t": "http://www.w3.org/TR/css3-text/",
      "office:version": "1.2"
    }), f = Ps({
      "xmlns:config": "urn:oasis:names:tc:opendocument:xmlns:config:1.0",
      "office:mimetype": "application/vnd.oasis.opendocument.spreadsheet"
    });
    o.bookType == "fods" ? (l.push("<office:document" + c + f + `>
`), l.push(Td().replace(/office:document-meta/g, "office:meta"))) : l.push("<office:document-content" + c + `>
`), i(l, a), l.push(`  <office:body>
`), l.push(`    <office:spreadsheet>
`);
    for (var h = 0; h != a.SheetNames.length; ++h)
      l.push(n(a.Sheets[a.SheetNames[h]], a, h));
    return l.push(`    </office:spreadsheet>
`), l.push(`  </office:body>
`), o.bookType == "fods" ? l.push("</office:document>") : l.push("</office:document-content>"), l.join("");
  };
}();
function lg(e, t) {
  if (t.bookType == "fods")
    return w0(e, t);
  var r = pc(), n = "", i = [], s = [];
  return n = "mimetype", ve(r, n, "application/vnd.oasis.opendocument.spreadsheet"), n = "content.xml", ve(r, n, w0(e, t)), i.push([n, "text/xml"]), s.push([n, "ContentFile"]), n = "styles.xml", ve(r, n, OA(e, t)), i.push([n, "text/xml"]), s.push([n, "StylesFile"]), n = "meta.xml", ve(r, n, ut + Td(
    /*::wb, opts*/
  )), i.push([n, "text/xml"]), s.push([n, "MetadataFile"]), n = "manifest.rdf", ve(r, n, Uy(
    s
    /*, opts*/
  )), i.push([n, "application/rdf+xml"]), n = "META-INF/manifest.xml", ve(r, n, By(
    i
    /*, opts*/
  )), r;
}
/*! sheetjs (C) 2013-present SheetJS -- http://sheetjs.com */
function oo(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function DA(e) {
  return typeof TextEncoder < "u" ? new TextEncoder().encode(e) : gr(Zr(e));
}
function FA(e, t) {
  e:
    for (var r = 0; r <= e.length - t.length; ++r) {
      for (var n = 0; n < t.length; ++n)
        if (e[r + n] != t[n])
          continue e;
      return !0;
    }
  return !1;
}
function kn(e) {
  var t = e.reduce(function(i, s) {
    return i + s.length;
  }, 0), r = new Uint8Array(t), n = 0;
  return e.forEach(function(i) {
    r.set(i, n), n += i.length;
  }), r;
}
function CA(e, t, r) {
  var n = Math.floor(r == 0 ? 0 : Math.LOG10E * Math.log(Math.abs(r))) + 6176 - 20, i = r / Math.pow(10, n - 6176);
  e[t + 15] |= n >> 7, e[t + 14] |= (n & 127) << 1;
  for (var s = 0; i >= 1; ++s, i /= 256)
    e[t + s] = i & 255;
  e[t + 15] |= r >= 0 ? 0 : 128;
}
function Rs(e, t) {
  var r = t ? t[0] : 0, n = e[r] & 127;
  e:
    if (e[r++] >= 128 && (n |= (e[r] & 127) << 7, e[r++] < 128 || (n |= (e[r] & 127) << 14, e[r++] < 128) || (n |= (e[r] & 127) << 21, e[r++] < 128) || (n += (e[r] & 127) * Math.pow(2, 28), ++r, e[r++] < 128) || (n += (e[r] & 127) * Math.pow(2, 35), ++r, e[r++] < 128) || (n += (e[r] & 127) * Math.pow(2, 42), ++r, e[r++] < 128)))
      break e;
  return t && (t[0] = r), n;
}
function Pe(e) {
  var t = new Uint8Array(7);
  t[0] = e & 127;
  var r = 1;
  e:
    if (e > 127) {
      if (t[r - 1] |= 128, t[r] = e >> 7 & 127, ++r, e <= 16383 || (t[r - 1] |= 128, t[r] = e >> 14 & 127, ++r, e <= 2097151) || (t[r - 1] |= 128, t[r] = e >> 21 & 127, ++r, e <= 268435455) || (t[r - 1] |= 128, t[r] = e / 256 >>> 21 & 127, ++r, e <= 34359738367) || (t[r - 1] |= 128, t[r] = e / 65536 >>> 21 & 127, ++r, e <= 4398046511103))
        break e;
      t[r - 1] |= 128, t[r] = e / 16777216 >>> 21 & 127, ++r;
    }
  return t.slice(0, r);
}
function ki(e) {
  var t = 0, r = e[t] & 127;
  e:
    if (e[t++] >= 128) {
      if (r |= (e[t] & 127) << 7, e[t++] < 128 || (r |= (e[t] & 127) << 14, e[t++] < 128) || (r |= (e[t] & 127) << 21, e[t++] < 128))
        break e;
      r |= (e[t] & 127) << 28;
    }
  return r;
}
function dt(e) {
  for (var t = [], r = [0]; r[0] < e.length; ) {
    var n = r[0], i = Rs(e, r), s = i & 7;
    i = Math.floor(i / 8);
    var a = 0, o;
    if (i == 0)
      break;
    switch (s) {
      case 0:
        {
          for (var l = r[0]; e[r[0]++] >= 128; )
            ;
          o = e.slice(l, r[0]);
        }
        break;
      case 5:
        a = 4, o = e.slice(r[0], r[0] + a), r[0] += a;
        break;
      case 1:
        a = 8, o = e.slice(r[0], r[0] + a), r[0] += a;
        break;
      case 2:
        a = Rs(e, r), o = e.slice(r[0], r[0] + a), r[0] += a;
        break;
      case 3:
      case 4:
      default:
        throw new Error("PB Type ".concat(s, " for Field ").concat(i, " at offset ").concat(n));
    }
    var c = { data: o, type: s };
    t[i] == null ? t[i] = [c] : t[i].push(c);
  }
  return t;
}
function yt(e) {
  var t = [];
  return e.forEach(function(r, n) {
    r.forEach(function(i) {
      i.data && (t.push(Pe(n * 8 + i.type)), i.type == 2 && t.push(Pe(i.data.length)), t.push(i.data));
    });
  }), kn(t);
}
function ur(e) {
  for (var t, r = [], n = [0]; n[0] < e.length; ) {
    var i = Rs(e, n), s = dt(e.slice(n[0], n[0] + i));
    n[0] += i;
    var a = {
      id: ki(s[1][0].data),
      messages: []
    };
    s[2].forEach(function(o) {
      var l = dt(o.data), c = ki(l[3][0].data);
      a.messages.push({
        meta: l,
        data: e.slice(n[0], n[0] + c)
      }), n[0] += c;
    }), (t = s[3]) != null && t[0] && (a.merge = ki(s[3][0].data) >>> 0 > 0), r.push(a);
  }
  return r;
}
function pi(e) {
  var t = [];
  return e.forEach(function(r) {
    var n = [];
    n[1] = [{ data: Pe(r.id), type: 0 }], n[2] = [], r.merge != null && (n[3] = [{ data: Pe(+!!r.merge), type: 0 }]);
    var i = [];
    r.messages.forEach(function(a) {
      i.push(a.data), a.meta[3] = [{ type: 0, data: Pe(a.data.length) }], n[2].push({ data: yt(a.meta), type: 2 });
    });
    var s = yt(n);
    t.push(Pe(s.length)), t.push(s), i.forEach(function(a) {
      return t.push(a);
    });
  }), kn(t);
}
function MA(e, t) {
  if (e != 0)
    throw new Error("Unexpected Snappy chunk type ".concat(e));
  for (var r = [0], n = Rs(t, r), i = []; r[0] < t.length; ) {
    var s = t[r[0]] & 3;
    if (s == 0) {
      var a = t[r[0]++] >> 2;
      if (a < 60)
        ++a;
      else {
        var o = a - 59;
        a = t[r[0]], o > 1 && (a |= t[r[0] + 1] << 8), o > 2 && (a |= t[r[0] + 2] << 16), o > 3 && (a |= t[r[0] + 3] << 24), a >>>= 0, a++, r[0] += o;
      }
      i.push(t.slice(r[0], r[0] + a)), r[0] += a;
      continue;
    } else {
      var l = 0, c = 0;
      if (s == 1 ? (c = (t[r[0]] >> 2 & 7) + 4, l = (t[r[0]++] & 224) << 3, l |= t[r[0]++]) : (c = (t[r[0]++] >> 2) + 1, s == 2 ? (l = t[r[0]] | t[r[0] + 1] << 8, r[0] += 2) : (l = (t[r[0]] | t[r[0] + 1] << 8 | t[r[0] + 2] << 16 | t[r[0] + 3] << 24) >>> 0, r[0] += 4)), i = [kn(i)], l == 0)
        throw new Error("Invalid offset 0");
      if (l > i[0].length)
        throw new Error("Invalid offset beyond length");
      if (c >= l)
        for (i.push(i[0].slice(-l)), c -= l; c >= i[i.length - 1].length; )
          i.push(i[i.length - 1]), c -= i[i.length - 1].length;
      i.push(i[0].slice(-l, -l + c));
    }
  }
  var f = kn(i);
  if (f.length != n)
    throw new Error("Unexpected length: ".concat(f.length, " != ").concat(n));
  return f;
}
function dr(e) {
  for (var t = [], r = 0; r < e.length; ) {
    var n = e[r++], i = e[r] | e[r + 1] << 8 | e[r + 2] << 16;
    r += 3, t.push(MA(n, e.slice(r, r + i))), r += i;
  }
  if (r !== e.length)
    throw new Error("data is not a valid framed stream!");
  return kn(t);
}
function mi(e) {
  for (var t = [], r = 0; r < e.length; ) {
    var n = Math.min(e.length - r, 268435455), i = new Uint8Array(4);
    t.push(i);
    var s = Pe(n), a = s.length;
    t.push(s), n <= 60 ? (a++, t.push(new Uint8Array([n - 1 << 2]))) : n <= 256 ? (a += 2, t.push(new Uint8Array([240, n - 1 & 255]))) : n <= 65536 ? (a += 3, t.push(new Uint8Array([244, n - 1 & 255, n - 1 >> 8 & 255]))) : n <= 16777216 ? (a += 4, t.push(new Uint8Array([248, n - 1 & 255, n - 1 >> 8 & 255, n - 1 >> 16 & 255]))) : n <= 4294967296 && (a += 5, t.push(new Uint8Array([252, n - 1 & 255, n - 1 >> 8 & 255, n - 1 >> 16 & 255, n - 1 >>> 24 & 255]))), t.push(e.slice(r, r + n)), a += n, i[0] = 0, i[1] = a & 255, i[2] = a >> 8 & 255, i[3] = a >> 16 & 255, r += n;
  }
  return kn(t);
}
function dl(e, t) {
  var r = new Uint8Array(32), n = oo(r), i = 12, s = 0;
  switch (r[0] = 5, e.t) {
    case "n":
      r[1] = 2, CA(r, i, e.v), s |= 1, i += 16;
      break;
    case "b":
      r[1] = 6, n.setFloat64(i, e.v ? 1 : 0, !0), s |= 2, i += 8;
      break;
    case "s":
      if (t.indexOf(e.v) == -1)
        throw new Error("Value ".concat(e.v, " missing from SST!"));
      r[1] = 3, n.setUint32(i, t.indexOf(e.v), !0), s |= 8, i += 4;
      break;
    default:
      throw "unsupported cell type " + e.t;
  }
  return n.setUint32(8, s, !0), r.slice(0, i);
}
function gl(e, t) {
  var r = new Uint8Array(32), n = oo(r), i = 12, s = 0;
  switch (r[0] = 3, e.t) {
    case "n":
      r[2] = 2, n.setFloat64(i, e.v, !0), s |= 32, i += 8;
      break;
    case "b":
      r[2] = 6, n.setFloat64(i, e.v ? 1 : 0, !0), s |= 32, i += 8;
      break;
    case "s":
      if (t.indexOf(e.v) == -1)
        throw new Error("Value ".concat(e.v, " missing from SST!"));
      r[2] = 3, n.setUint32(i, t.indexOf(e.v), !0), s |= 16, i += 4;
      break;
    default:
      throw "unsupported cell type " + e.t;
  }
  return n.setUint32(4, s, !0), r.slice(0, i);
}
function un(e) {
  var t = dt(e);
  return Rs(t[1][0].data);
}
function PA(e, t, r) {
  var n, i, s, a;
  if (!((n = e[6]) != null && n[0]) || !((i = e[7]) != null && i[0]))
    throw "Mutation only works on post-BNC storages!";
  var o = ((a = (s = e[8]) == null ? void 0 : s[0]) == null ? void 0 : a.data) && ki(e[8][0].data) > 0 || !1;
  if (o)
    throw "Math only works with normal offsets";
  for (var l = 0, c = oo(e[7][0].data), f = 0, h = [], u = oo(e[4][0].data), d = 0, p = [], g = 0; g < t.length; ++g) {
    if (t[g] == null) {
      c.setUint16(g * 2, 65535, !0), u.setUint16(g * 2, 65535);
      continue;
    }
    c.setUint16(g * 2, f, !0), u.setUint16(g * 2, d, !0);
    var m, v;
    switch (typeof t[g]) {
      case "string":
        m = dl({ t: "s", v: t[g] }, r), v = gl({ t: "s", v: t[g] }, r);
        break;
      case "number":
        m = dl({ t: "n", v: t[g] }, r), v = gl({ t: "n", v: t[g] }, r);
        break;
      case "boolean":
        m = dl({ t: "b", v: t[g] }, r), v = gl({ t: "b", v: t[g] }, r);
        break;
      default:
        throw new Error("Unsupported value " + t[g]);
    }
    h.push(m), f += m.length, p.push(v), d += v.length, ++l;
  }
  for (e[2][0].data = Pe(l); g < e[7][0].data.length / 2; ++g)
    c.setUint16(g * 2, 65535, !0), u.setUint16(g * 2, 65535, !0);
  return e[6][0].data = kn(h), e[3][0].data = kn(p), l;
}
function RA(e, t) {
  if (!t || !t.numbers)
    throw new Error("Must pass a `numbers` option -- check the README");
  var r = e.Sheets[e.SheetNames[0]];
  e.SheetNames.length > 1 && console.error("The Numbers writer currently writes only the first table");
  var n = tr(r["!ref"]);
  n.s.r = n.s.c = 0;
  var i = !1;
  n.e.c > 9 && (i = !0, n.e.c = 9), n.e.r > 49 && (i = !0, n.e.r = 49), i && console.error("The Numbers writer is currently limited to ".concat(ht(n)));
  var s = lo(r, { range: n, header: 1 }), a = ["~Sh33tJ5~"];
  s.forEach(function(C) {
    return C.forEach(function(x) {
      typeof x == "string" && a.push(x);
    });
  });
  var o = {}, l = [], c = Be.read(t.numbers, { type: "base64" });
  c.FileIndex.map(function(C, x) {
    return [C, c.FullPaths[x]];
  }).forEach(function(C) {
    var x = C[0], k = C[1];
    if (x.type == 2 && x.name.match(/\.iwa/)) {
      var F = x.content, Y = dr(F), Z = ur(Y);
      Z.forEach(function(K) {
        l.push(K.id), o[K.id] = { deps: [], location: k, type: ki(K.messages[0].meta[1][0].data) };
      });
    }
  }), l.sort(function(C, x) {
    return C - x;
  });
  var f = l.filter(function(C) {
    return C > 1;
  }).map(function(C) {
    return [C, Pe(C)];
  });
  c.FileIndex.map(function(C, x) {
    return [C, c.FullPaths[x]];
  }).forEach(function(C) {
    var x = C[0];
    if (C[1], !!x.name.match(/\.iwa/)) {
      var k = ur(dr(x.content));
      k.forEach(function(F) {
        F.messages.forEach(function(Y) {
          f.forEach(function(Z) {
            F.messages.some(function(K) {
              return ki(K.meta[1][0].data) != 11006 && FA(K.data, Z[1]);
            }) && o[Z[0]].deps.push(F.id);
          });
        });
      });
    }
  });
  for (var h = Be.find(c, o[1].location), u = ur(dr(h.content)), d, p = 0; p < u.length; ++p) {
    var g = u[p];
    g.id == 1 && (d = g);
  }
  var m = un(dt(d.messages[0].data)[1][0].data);
  for (h = Be.find(c, o[m].location), u = ur(dr(h.content)), p = 0; p < u.length; ++p)
    g = u[p], g.id == m && (d = g);
  for (m = un(dt(d.messages[0].data)[2][0].data), h = Be.find(c, o[m].location), u = ur(dr(h.content)), p = 0; p < u.length; ++p)
    g = u[p], g.id == m && (d = g);
  for (m = un(dt(d.messages[0].data)[2][0].data), h = Be.find(c, o[m].location), u = ur(dr(h.content)), p = 0; p < u.length; ++p)
    g = u[p], g.id == m && (d = g);
  var v = dt(d.messages[0].data);
  {
    v[6][0].data = Pe(n.e.r + 1), v[7][0].data = Pe(n.e.c + 1);
    var w = un(v[46][0].data), S = Be.find(c, o[w].location), D = ur(dr(S.content));
    {
      for (var P = 0; P < D.length && D[P].id != w; ++P)
        ;
      if (D[P].id != w)
        throw "Bad ColumnRowUIDMapArchive";
      var N = dt(D[P].messages[0].data);
      N[1] = [], N[2] = [], N[3] = [];
      for (var O = 0; O <= n.e.c; ++O) {
        var I = [];
        I[1] = I[2] = [{ type: 0, data: Pe(O + 420690) }], N[1].push({ type: 2, data: yt(I) }), N[2].push({ type: 0, data: Pe(O) }), N[3].push({ type: 0, data: Pe(O) });
      }
      N[4] = [], N[5] = [], N[6] = [];
      for (var R = 0; R <= n.e.r; ++R)
        I = [], I[1] = I[2] = [{ type: 0, data: Pe(R + 726270) }], N[4].push({ type: 2, data: yt(I) }), N[5].push({ type: 0, data: Pe(R) }), N[6].push({ type: 0, data: Pe(R) });
      D[P].messages[0].data = yt(N);
    }
    S.content = mi(pi(D)), S.size = S.content.length, delete v[46];
    var z = dt(v[4][0].data);
    {
      z[7][0].data = Pe(n.e.r + 1);
      var H = dt(z[1][0].data), V = un(H[2][0].data);
      S = Be.find(c, o[V].location), D = ur(dr(S.content));
      {
        if (D[0].id != V)
          throw "Bad HeaderStorageBucket";
        var ee = dt(D[0].messages[0].data);
        for (R = 0; R < s.length; ++R) {
          var ge = dt(ee[2][0].data);
          ge[1][0].data = Pe(R), ge[4][0].data = Pe(s[R].length), ee[2][R] = { type: ee[2][0].type, data: yt(ge) };
        }
        D[0].messages[0].data = yt(ee);
      }
      S.content = mi(pi(D)), S.size = S.content.length;
      var ae = un(z[2][0].data);
      S = Be.find(c, o[ae].location), D = ur(dr(S.content));
      {
        if (D[0].id != ae)
          throw "Bad HeaderStorageBucket";
        for (ee = dt(D[0].messages[0].data), O = 0; O <= n.e.c; ++O)
          ge = dt(ee[2][0].data), ge[1][0].data = Pe(O), ge[4][0].data = Pe(n.e.r + 1), ee[2][O] = { type: ee[2][0].type, data: yt(ge) };
        D[0].messages[0].data = yt(ee);
      }
      S.content = mi(pi(D)), S.size = S.content.length;
      var de = un(z[4][0].data);
      (function() {
        for (var C = Be.find(c, o[de].location), x = ur(dr(C.content)), k, F = 0; F < x.length; ++F) {
          var Y = x[F];
          Y.id == de && (k = Y);
        }
        var Z = dt(k.messages[0].data);
        {
          Z[3] = [];
          var K = [];
          a.forEach(function(we, Lt) {
            K[1] = [{ type: 0, data: Pe(Lt) }], K[2] = [{ type: 0, data: Pe(1) }], K[3] = [{ type: 2, data: DA(we) }], Z[3].push({ type: 2, data: yt(K) });
          });
        }
        k.messages[0].data = yt(Z);
        var j = pi(x), Ae = mi(j);
        C.content = Ae, C.size = C.content.length;
      })();
      var pe = dt(z[3][0].data);
      {
        var Ue = pe[1][0];
        delete pe[2];
        var ye = dt(Ue.data);
        {
          var et = un(ye[2][0].data);
          (function() {
            for (var C = Be.find(c, o[et].location), x = ur(dr(C.content)), k, F = 0; F < x.length; ++F) {
              var Y = x[F];
              Y.id == et && (k = Y);
            }
            var Z = dt(k.messages[0].data);
            {
              delete Z[6], delete pe[7];
              var K = new Uint8Array(Z[5][0].data);
              Z[5] = [];
              for (var j = 0, Ae = 0; Ae <= n.e.r; ++Ae) {
                var we = dt(K);
                j += PA(we, s[Ae], a), we[1][0].data = Pe(Ae), Z[5].push({ data: yt(we), type: 2 });
              }
              Z[1] = [{ type: 0, data: Pe(n.e.c + 1) }], Z[2] = [{ type: 0, data: Pe(n.e.r + 1) }], Z[3] = [{ type: 0, data: Pe(j) }], Z[4] = [{ type: 0, data: Pe(n.e.r + 1) }];
            }
            k.messages[0].data = yt(Z);
            var Lt = pi(x), Ce = mi(Lt);
            C.content = Ce, C.size = C.content.length;
          })();
        }
        Ue.data = yt(ye);
      }
      z[3][0].data = yt(pe);
    }
    v[4][0].data = yt(z);
  }
  d.messages[0].data = yt(v);
  var lt = pi(u), M = mi(lt);
  return h.content = M, h.size = h.content.length, c;
}
function IA(e) {
  return function(r) {
    for (var n = 0; n != e.length; ++n) {
      var i = e[n];
      r[i[0]] === void 0 && (r[i[0]] = i[1]), i[2] === "n" && (r[i[0]] = Number(r[i[0]]));
    }
  };
}
function Cc(e) {
  IA([
    ["cellDates", !1],
    /* write date cells with type `d` */
    ["bookSST", !1],
    /* Generate Shared String Table */
    ["bookType", "xlsx"],
    /* Type of workbook (xlsx/m/b) */
    ["compression", !1],
    /* Use file compression */
    ["WTF", !1]
    /* WTF mode (throws errors) */
  ])(e);
}
function LA(e, t) {
  return t.bookType == "ods" ? lg(e, t) : t.bookType == "numbers" ? RA(e, t) : t.bookType == "xlsb" ? NA(e, t) : BA(e, t);
}
function NA(e, t) {
  wi = 1024, e && !e.SSF && (e.SSF = Gt(it)), e && e.SSF && (Eo(), bo(e.SSF), t.revssf = Ao(e.SSF), t.revssf[e.SSF[65535]] = 0, t.ssf = e.SSF), t.rels = {}, t.wbrels = {}, t.Strings = /*::((*/
  [], t.Strings.Count = 0, t.Strings.Unique = 0, ys ? t.revStrings = /* @__PURE__ */ new Map() : (t.revStrings = {}, t.revStrings.foo = [], delete t.revStrings.foo);
  var r = t.bookType == "xlsb" ? "bin" : "xml", n = Yd.indexOf(t.bookType) > -1, i = vd();
  Cc(t = t || {});
  var s = pc(), a = "", o = 0;
  if (t.cellXfs = [], Dn(t.cellXfs, {}, { revssf: { General: 0 } }), e.Props || (e.Props = {}), a = "docProps/core.xml", ve(s, a, Sd(e.Props, t)), i.coreprops.push(a), Re(t.rels, 2, a, ke.CORE_PROPS), a = "docProps/app.xml", !(e.Props && e.Props.SheetNames))
    if (!e.Workbook || !e.Workbook.Sheets)
      e.Props.SheetNames = e.SheetNames;
    else {
      for (var l = [], c = 0; c < e.SheetNames.length; ++c)
        (e.Workbook.Sheets[c] || {}).Hidden != 2 && l.push(e.SheetNames[c]);
      e.Props.SheetNames = l;
    }
  for (e.Props.Worksheets = e.Props.SheetNames.length, ve(s, a, Ed(e.Props)), i.extprops.push(a), Re(t.rels, 3, a, ke.EXT_PROPS), e.Custprops !== e.Props && At(e.Custprops || {}).length > 0 && (a = "docProps/custom.xml", ve(s, a, Ad(e.Custprops)), i.custprops.push(a), Re(t.rels, 4, a, ke.CUST_PROPS)), o = 1; o <= e.SheetNames.length; ++o) {
    var f = { "!id": {} }, h = e.Sheets[e.SheetNames[o - 1]], u = (h || {})["!type"] || "sheet";
    switch (u) {
      case "chart":
      default:
        a = "xl/worksheets/sheet" + o + "." + r, ve(s, a, UE(o - 1, a, t, e, f)), i.sheets.push(a), Re(t.wbrels, -1, "worksheets/sheet" + o + "." + r, ke.WS[0]);
    }
    if (h) {
      var d = h["!comments"], p = !1, g = "";
      d && d.length > 0 && (g = "xl/comments" + o + "." + r, ve(s, g, VE(d, g)), i.comments.push(g), Re(f, -1, "../comments" + o + "." + r, ke.CMNT), p = !0), h["!legacy"] && p && ve(s, "xl/drawings/vmlDrawing" + o + ".vml", Hd(o, h["!comments"])), delete h["!comments"], delete h["!legacy"];
    }
    f["!id"].rId1 && ve(s, wd(a), Ei(f));
  }
  return t.Strings != null && t.Strings.length > 0 && (a = "xl/sharedStrings." + r, ve(s, a, HE(t.Strings, a, t)), i.strs.push(a), Re(t.wbrels, -1, "sharedStrings." + r, ke.SST)), a = "xl/workbook." + r, ve(s, a, WE(e, a)), i.workbooks.push(a), Re(t.rels, 1, a, ke.WB), a = "xl/theme/theme1.xml", ve(s, a, Ud(e.Themes, t)), i.themes.push(a), Re(t.wbrels, -1, "theme/theme1.xml", ke.THEME), a = "xl/styles." + r, ve(s, a, zE(e, a, t)), i.styles.push(a), Re(t.wbrels, -1, "styles." + r, ke.STY), e.vbaraw && n && (a = "xl/vbaProject.bin", ve(s, a, e.vbaraw), i.vba.push(a), Re(t.wbrels, -1, "vbaProject.bin", ke.VBA)), a = "xl/metadata." + r, ve(s, a, YE(a)), i.metadata.push(a), Re(t.wbrels, -1, "metadata." + r, ke.XLMETA), ve(s, "[Content_Types].xml", yd(i, t)), ve(s, "_rels/.rels", Ei(t.rels)), ve(s, "xl/_rels/workbook." + r + ".rels", Ei(t.wbrels)), delete t.revssf, delete t.ssf, s;
}
function BA(e, t) {
  wi = 1024, e && !e.SSF && (e.SSF = Gt(it)), e && e.SSF && (Eo(), bo(e.SSF), t.revssf = Ao(e.SSF), t.revssf[e.SSF[65535]] = 0, t.ssf = e.SSF), t.rels = {}, t.wbrels = {}, t.Strings = /*::((*/
  [], t.Strings.Count = 0, t.Strings.Unique = 0, ys ? t.revStrings = /* @__PURE__ */ new Map() : (t.revStrings = {}, t.revStrings.foo = [], delete t.revStrings.foo);
  var r = "xml", n = Yd.indexOf(t.bookType) > -1, i = vd();
  Cc(t = t || {});
  var s = pc(), a = "", o = 0;
  if (t.cellXfs = [], Dn(t.cellXfs, {}, { revssf: { General: 0 } }), e.Props || (e.Props = {}), a = "docProps/core.xml", ve(s, a, Sd(e.Props, t)), i.coreprops.push(a), Re(t.rels, 2, a, ke.CORE_PROPS), a = "docProps/app.xml", !(e.Props && e.Props.SheetNames))
    if (!e.Workbook || !e.Workbook.Sheets)
      e.Props.SheetNames = e.SheetNames;
    else {
      for (var l = [], c = 0; c < e.SheetNames.length; ++c)
        (e.Workbook.Sheets[c] || {}).Hidden != 2 && l.push(e.SheetNames[c]);
      e.Props.SheetNames = l;
    }
  e.Props.Worksheets = e.Props.SheetNames.length, ve(s, a, Ed(e.Props)), i.extprops.push(a), Re(t.rels, 3, a, ke.EXT_PROPS), e.Custprops !== e.Props && At(e.Custprops || {}).length > 0 && (a = "docProps/custom.xml", ve(s, a, Ad(e.Custprops)), i.custprops.push(a), Re(t.rels, 4, a, ke.CUST_PROPS));
  var f = ["SheetJ5"];
  for (t.tcid = 0, o = 1; o <= e.SheetNames.length; ++o) {
    var h = { "!id": {} }, u = e.Sheets[e.SheetNames[o - 1]], d = (u || {})["!type"] || "sheet";
    switch (d) {
      case "chart":
      default:
        a = "xl/worksheets/sheet" + o + "." + r, ve(s, a, Qd(o - 1, t, e, h)), i.sheets.push(a), Re(t.wbrels, -1, "worksheets/sheet" + o + "." + r, ke.WS[0]);
    }
    if (u) {
      var p = u["!comments"], g = !1, m = "";
      if (p && p.length > 0) {
        var v = !1;
        p.forEach(function(w) {
          w[1].forEach(function(S) {
            S.T == !0 && (v = !0);
          });
        }), v && (m = "xl/threadedComments/threadedComment" + o + "." + r, ve(s, m, pT(p, f, t)), i.threadedcomments.push(m), Re(h, -1, "../threadedComments/threadedComment" + o + "." + r, ke.TCMNT)), m = "xl/comments" + o + "." + r, ve(s, m, Vd(p)), i.comments.push(m), Re(h, -1, "../comments" + o + "." + r, ke.CMNT), g = !0;
      }
      u["!legacy"] && g && ve(s, "xl/drawings/vmlDrawing" + o + ".vml", Hd(o, u["!comments"])), delete u["!comments"], delete u["!legacy"];
    }
    h["!id"].rId1 && ve(s, wd(a), Ei(h));
  }
  return t.Strings != null && t.Strings.length > 0 && (a = "xl/sharedStrings." + r, ve(s, a, Rd(t.Strings, t)), i.strs.push(a), Re(t.wbrels, -1, "sharedStrings." + r, ke.SST)), a = "xl/workbook." + r, ve(s, a, rg(e)), i.workbooks.push(a), Re(t.rels, 1, a, ke.WB), a = "xl/theme/theme1.xml", ve(s, a, Ud(e.Themes, t)), i.themes.push(a), Re(t.wbrels, -1, "theme/theme1.xml", ke.THEME), a = "xl/styles." + r, ve(s, a, Bd(e, t)), i.styles.push(a), Re(t.wbrels, -1, "styles." + r, ke.STY), e.vbaraw && n && (a = "xl/vbaProject.bin", ve(s, a, e.vbaraw), i.vba.push(a), Re(t.wbrels, -1, "vbaProject.bin", ke.VBA)), a = "xl/metadata." + r, ve(s, a, zd()), i.metadata.push(a), Re(t.wbrels, -1, "metadata." + r, ke.XLMETA), f.length > 1 && (a = "xl/persons/person.xml", ve(s, a, mT(f)), i.people.push(a), Re(t.wbrels, -1, "persons/person.xml", ke.PEOPLE)), ve(s, "[Content_Types].xml", yd(i, t)), ve(s, "_rels/.rels", Ei(t.rels)), ve(s, "xl/_rels/workbook." + r + ".rels", Ei(t.wbrels)), delete t.revssf, delete t.ssf, s;
}
function WA(e, t) {
  var r = "";
  switch ((t || {}).type || "base64") {
    case "buffer":
      return [e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7]];
    case "base64":
      r = sn(e.slice(0, 12));
      break;
    case "binary":
      r = e;
      break;
    case "array":
      return [e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7]];
    default:
      throw new Error("Unrecognized type " + (t && t.type || "undefined"));
  }
  return [r.charCodeAt(0), r.charCodeAt(1), r.charCodeAt(2), r.charCodeAt(3), r.charCodeAt(4), r.charCodeAt(5), r.charCodeAt(6), r.charCodeAt(7)];
}
function cg(e, t) {
  switch (t.type) {
    case "base64":
    case "binary":
      break;
    case "buffer":
    case "array":
      t.type = "";
      break;
    case "file":
      return js(t.file, Be.write(e, { type: Fe ? "buffer" : "" }));
    case "string":
      throw new Error("'string' output type invalid for '" + t.bookType + "' files");
    default:
      throw new Error("Unrecognized type " + t.type);
  }
  return Be.write(e, t);
}
function UA(e, t) {
  var r = Gt(t || {}), n = LA(e, r);
  return zA(n, r);
}
function zA(e, t) {
  var r = {}, n = Fe ? "nodebuffer" : typeof Uint8Array < "u" ? "array" : "string";
  if (t.compression && (r.compression = "DEFLATE"), t.password)
    r.type = n;
  else
    switch (t.type) {
      case "base64":
        r.type = "base64";
        break;
      case "binary":
        r.type = "string";
        break;
      case "string":
        throw new Error("'string' output type invalid for '" + t.bookType + "' files");
      case "buffer":
      case "file":
        r.type = n;
        break;
      default:
        throw new Error("Unrecognized type " + t.type);
    }
  var i = e.FullPaths ? Be.write(e, { fileType: "zip", type: (
    /*::(*/
    { nodebuffer: "buffer", string: "binary" }[r.type] || r.type
  ), compression: !!t.compression }) : e.generate(r);
  if (typeof Deno < "u" && typeof i == "string") {
    if (t.type == "binary" || t.type == "base64")
      return i;
    i = new Uint8Array(So(i));
  }
  return t.password && typeof encrypt_agile < "u" ? cg(encrypt_agile(i, t.password), t) : t.type === "file" ? js(t.file, i) : t.type == "string" ? ms(
    /*::(*/
    i
    /*:: :any)*/
  ) : i;
}
function HA(e, t) {
  var r = t || {}, n = iA(e, r);
  return cg(n, r);
}
function kr(e, t, r) {
  r || (r = "");
  var n = r + e;
  switch (t.type) {
    case "base64":
      return Cs(Zr(n));
    case "binary":
      return Zr(n);
    case "string":
      return e;
    case "file":
      return js(t.file, n, "utf8");
    case "buffer":
      return Fe ? cn(n, "utf8") : typeof TextEncoder < "u" ? new TextEncoder().encode(n) : kr(n, { type: "binary" }).split("").map(function(i) {
        return i.charCodeAt(0);
      });
  }
  throw new Error("Unrecognized type " + t.type);
}
function VA(e, t) {
  switch (t.type) {
    case "base64":
      return Cs(e);
    case "binary":
      return e;
    case "string":
      return e;
    case "file":
      return js(t.file, e, "binary");
    case "buffer":
      return Fe ? cn(e, "binary") : e.split("").map(function(r) {
        return r.charCodeAt(0);
      });
  }
  throw new Error("Unrecognized type " + t.type);
}
function ka(e, t) {
  switch (t.type) {
    case "string":
    case "base64":
    case "binary":
      for (var r = "", n = 0; n < e.length; ++n)
        r += String.fromCharCode(e[n]);
      return t.type == "base64" ? Cs(r) : t.type == "string" ? ms(r) : r;
    case "file":
      return js(t.file, e);
    case "buffer":
      return e;
    default:
      throw new Error("Unrecognized type " + t.type);
  }
}
function fg(e, t) {
  m2(), OE(e);
  var r = Gt(t || {});
  if (r.cellStyles && (r.cellNF = !0, r.sheetStubs = !0), r.type == "array") {
    r.type = "binary";
    var n = fg(e, r);
    return r.type = "array", So(n);
  }
  var i = 0;
  if (r.sheet && (typeof r.sheet == "number" ? i = r.sheet : i = e.SheetNames.indexOf(r.sheet), !e.SheetNames[i]))
    throw new Error("Sheet not found: " + r.sheet + " : " + typeof r.sheet);
  switch (r.bookType || "xlsb") {
    case "xml":
    case "xlml":
      return kr(rA(e, r), r);
    case "slk":
    case "sylk":
      return kr(Ew.from_sheet(e.Sheets[e.SheetNames[i]], r), r);
    case "htm":
    case "html":
      return kr(sg(e.Sheets[e.SheetNames[i]], r), r);
    case "txt":
      return VA(hg(e.Sheets[e.SheetNames[i]], r), r);
    case "csv":
      return kr(Mc(e.Sheets[e.SheetNames[i]], r), r, "\uFEFF");
    case "dif":
      return kr(Aw.from_sheet(e.Sheets[e.SheetNames[i]], r), r);
    case "dbf":
      return ka(bw.from_sheet(e.Sheets[e.SheetNames[i]], r), r);
    case "prn":
      return kr(kw.from_sheet(e.Sheets[e.SheetNames[i]], r), r);
    case "rtf":
      return kr(Rw.from_sheet(e.Sheets[e.SheetNames[i]], r), r);
    case "eth":
      return kr(Pd.from_sheet(e.Sheets[e.SheetNames[i]], r), r);
    case "fods":
      return kr(lg(e, r), r);
    case "wk1":
      return ka(g0.sheet_to_wk1(e.Sheets[e.SheetNames[i]], r), r);
    case "wk3":
      return ka(g0.book_to_wk3(e, r), r);
    case "biff2":
      r.biff || (r.biff = 2);
    case "biff3":
      r.biff || (r.biff = 3);
    case "biff4":
      return r.biff || (r.biff = 4), ka(ig(e, r), r);
    case "biff5":
      r.biff || (r.biff = 5);
    case "biff8":
    case "xla":
    case "xls":
      return r.biff || (r.biff = 8), HA(e, r);
    case "xlsx":
    case "xlsm":
    case "xlam":
    case "xlsb":
    case "numbers":
    case "ods":
      return UA(e, r);
    default:
      throw new Error("Unrecognized bookType |" + r.bookType + "|");
  }
}
function YA(e) {
  if (!e.bookType) {
    var t = {
      xls: "biff8",
      htm: "html",
      slk: "sylk",
      socialcalc: "eth",
      Sh33tJS: "WTF"
    }, r = e.file.slice(e.file.lastIndexOf(".")).toLowerCase();
    r.match(/^\.[a-z]+$/) && (e.bookType = r.slice(1)), e.bookType = t[e.bookType] || e.bookType;
  }
}
function jA(e, t, r) {
  var n = r || {};
  return n.type = "file", n.file = t, YA(n), fg(e, n);
}
function $A(e, t, r, n, i, s, a, o) {
  var l = bt(r), c = o.defval, f = o.raw || !Object.prototype.hasOwnProperty.call(o, "raw"), h = !0, u = i === 1 ? [] : {};
  if (i !== 1)
    if (Object.defineProperty)
      try {
        Object.defineProperty(u, "__rowNum__", { value: r, enumerable: !1 });
      } catch {
        u.__rowNum__ = r;
      }
    else
      u.__rowNum__ = r;
  if (!a || e[r])
    for (var d = t.s.c; d <= t.e.c; ++d) {
      var p = a ? e[r][d] : e[n[d] + l];
      if (p === void 0 || p.t === void 0) {
        if (c === void 0)
          continue;
        s[d] != null && (u[s[d]] = c);
        continue;
      }
      var g = p.v;
      switch (p.t) {
        case "z":
          if (g == null)
            break;
          continue;
        case "e":
          g = g == 0 ? null : void 0;
          break;
        case "s":
        case "d":
        case "b":
        case "n":
          break;
        default:
          throw new Error("unrecognized type " + p.t);
      }
      if (s[d] != null) {
        if (g == null)
          if (p.t == "e" && g === null)
            u[s[d]] = null;
          else if (c !== void 0)
            u[s[d]] = c;
          else if (f && g === null)
            u[s[d]] = null;
          else
            continue;
        else
          u[s[d]] = f && (p.t !== "n" || p.t === "n" && o.rawNumbers !== !1) ? g : an(p, g, o);
        g != null && (h = !1);
      }
    }
  return { row: u, isempty: h };
}
function lo(e, t) {
  if (e == null || e["!ref"] == null)
    return [];
  var r = { t: "n", v: 0 }, n = 0, i = 1, s = [], a = 0, o = "", l = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }, c = t || {}, f = c.range != null ? c.range : e["!ref"];
  switch (c.header === 1 ? n = 1 : c.header === "A" ? n = 2 : Array.isArray(c.header) ? n = 3 : c.header == null && (n = 0), typeof f) {
    case "string":
      l = je(f);
      break;
    case "number":
      l = je(e["!ref"]), l.s.r = f;
      break;
    default:
      l = f;
  }
  n > 0 && (i = 0);
  var h = bt(l.s.r), u = [], d = [], p = 0, g = 0, m = Array.isArray(e), v = l.s.r, w = 0, S = {};
  m && !e[v] && (e[v] = []);
  var D = c.skipHidden && e["!cols"] || [], P = c.skipHidden && e["!rows"] || [];
  for (w = l.s.c; w <= l.e.c; ++w)
    if (!(D[w] || {}).hidden)
      switch (u[w] = Ct(w), r = m ? e[v][w] : e[u[w] + h], n) {
        case 1:
          s[w] = w - l.s.c;
          break;
        case 2:
          s[w] = u[w];
          break;
        case 3:
          s[w] = c.header[w - l.s.c];
          break;
        default:
          if (r == null && (r = { w: "__EMPTY", t: "s" }), o = a = an(r, null, c), g = S[a] || 0, !g)
            S[a] = 1;
          else {
            do
              o = a + "_" + g++;
            while (S[o]);
            S[a] = g, S[o] = 1;
          }
          s[w] = o;
      }
  for (v = l.s.r + i; v <= l.e.r; ++v)
    if (!(P[v] || {}).hidden) {
      var N = $A(e, l, v, u, n, s, m, c);
      (N.isempty === !1 || (n === 1 ? c.blankrows !== !1 : c.blankrows)) && (d[p++] = N.row);
    }
  return d.length = p, d;
}
var T0 = /"/g;
function GA(e, t, r, n, i, s, a, o) {
  for (var l = !0, c = [], f = "", h = bt(r), u = t.s.c; u <= t.e.c; ++u)
    if (n[u]) {
      var d = o.dense ? (e[r] || [])[u] : e[n[u] + h];
      if (d == null)
        f = "";
      else if (d.v != null) {
        l = !1, f = "" + (o.rawNumbers && d.t == "n" ? d.v : an(d, null, o));
        for (var p = 0, g = 0; p !== f.length; ++p)
          if ((g = f.charCodeAt(p)) === i || g === s || g === 34 || o.forceQuotes) {
            f = '"' + f.replace(T0, '""') + '"';
            break;
          }
        f == "ID" && (f = '"ID"');
      } else
        d.f != null && !d.F ? (l = !1, f = "=" + d.f, f.indexOf(",") >= 0 && (f = '"' + f.replace(T0, '""') + '"')) : f = "";
      c.push(f);
    }
  return o.blankrows === !1 && l ? null : c.join(a);
}
function Mc(e, t) {
  var r = [], n = t ?? {};
  if (e == null || e["!ref"] == null)
    return "";
  var i = je(e["!ref"]), s = n.FS !== void 0 ? n.FS : ",", a = s.charCodeAt(0), o = n.RS !== void 0 ? n.RS : `
`, l = o.charCodeAt(0), c = new RegExp((s == "|" ? "\\|" : s) + "+$"), f = "", h = [];
  n.dense = Array.isArray(e);
  for (var u = n.skipHidden && e["!cols"] || [], d = n.skipHidden && e["!rows"] || [], p = i.s.c; p <= i.e.c; ++p)
    (u[p] || {}).hidden || (h[p] = Ct(p));
  for (var g = 0, m = i.s.r; m <= i.e.r; ++m)
    (d[m] || {}).hidden || (f = GA(e, i, m, h, a, l, s, n), f != null && (n.strip && (f = f.replace(c, "")), (f || n.blankrows !== !1) && r.push((g++ ? o : "") + f)));
  return delete n.dense, r.join("");
}
function hg(e, t) {
  t || (t = {}), t.FS = "	", t.RS = `
`;
  var r = Mc(e, t);
  return r;
}
function XA(e) {
  var t = "", r, n = "";
  if (e == null || e["!ref"] == null)
    return [];
  var i = je(e["!ref"]), s = "", a = [], o, l = [], c = Array.isArray(e);
  for (o = i.s.c; o <= i.e.c; ++o)
    a[o] = Ct(o);
  for (var f = i.s.r; f <= i.e.r; ++f)
    for (s = bt(f), o = i.s.c; o <= i.e.c; ++o)
      if (t = a[o] + s, r = c ? (e[f] || [])[o] : e[t], n = "", r !== void 0) {
        if (r.F != null) {
          if (t = r.F, !r.f)
            continue;
          n = r.f, t.indexOf(":") == -1 && (t = t + ":" + t);
        }
        if (r.f != null)
          n = r.f;
        else {
          if (r.t == "z")
            continue;
          if (r.t == "n" && r.v != null)
            n = "" + r.v;
          else if (r.t == "b")
            n = r.v ? "TRUE" : "FALSE";
          else if (r.w !== void 0)
            n = "'" + r.w;
          else {
            if (r.v === void 0)
              continue;
            r.t == "s" ? n = "'" + r.v : n = "" + r.v;
          }
        }
        l[l.length] = t + "=" + n;
      }
  return l;
}
function ug(e, t, r) {
  var n = r || {}, i = +!n.skipHeader, s = e || {}, a = 0, o = 0;
  if (s && n.origin != null)
    if (typeof n.origin == "number")
      a = n.origin;
    else {
      var l = typeof n.origin == "string" ? _t(n.origin) : n.origin;
      a = l.r, o = l.c;
    }
  var c, f = { s: { c: 0, r: 0 }, e: { c: o, r: a + t.length - 1 + i } };
  if (s["!ref"]) {
    var h = je(s["!ref"]);
    f.e.c = Math.max(f.e.c, h.e.c), f.e.r = Math.max(f.e.r, h.e.r), a == -1 && (a = h.e.r + 1, f.e.r = a + t.length - 1 + i);
  } else
    a == -1 && (a = 0, f.e.r = t.length - 1 + i);
  var u = n.header || [], d = 0;
  t.forEach(function(g, m) {
    At(g).forEach(function(v) {
      (d = u.indexOf(v)) == -1 && (u[d = u.length] = v);
      var w = g[v], S = "z", D = "", P = Le({ c: o + d, r: a + m + i });
      c = Is(s, P), w && typeof w == "object" && !(w instanceof Date) ? s[P] = w : (typeof w == "number" ? S = "n" : typeof w == "boolean" ? S = "b" : typeof w == "string" ? S = "s" : w instanceof Date ? (S = "d", n.cellDates || (S = "n", w = $t(w)), D = n.dateNF || it[14]) : w === null && n.nullError && (S = "e", w = 0), c ? (c.t = S, c.v = w, delete c.w, delete c.R, D && (c.z = D)) : s[P] = c = { t: S, v: w }, D && (c.z = D));
    });
  }), f.e.c = Math.max(f.e.c, o + u.length - 1);
  var p = bt(a);
  if (i)
    for (d = 0; d < u.length; ++d)
      s[Ct(d + o) + p] = { t: "s", v: u[d] };
  return s["!ref"] = ht(f), s;
}
function KA(e, t) {
  return ug(null, e, t);
}
function Is(e, t, r) {
  if (typeof t == "string") {
    if (Array.isArray(e)) {
      var n = _t(t);
      return e[n.r] || (e[n.r] = []), e[n.r][n.c] || (e[n.r][n.c] = { t: "z" });
    }
    return e[t] || (e[t] = { t: "z" });
  }
  return typeof t != "number" ? Is(e, Le(t)) : Is(e, Le({ r: t, c: r || 0 }));
}
function qA(e, t) {
  if (typeof t == "number") {
    if (t >= 0 && e.SheetNames.length > t)
      return t;
    throw new Error("Cannot find sheet # " + t);
  } else if (typeof t == "string") {
    var r = e.SheetNames.indexOf(t);
    if (r > -1)
      return r;
    throw new Error("Cannot find sheet name |" + t + "|");
  } else
    throw new Error("Cannot find sheet |" + t + "|");
}
function ZA() {
  return { SheetNames: [], Sheets: {} };
}
function JA(e, t, r, n) {
  var i = 1;
  if (!r)
    for (; i <= 65535 && e.SheetNames.indexOf(r = "Sheet" + i) != -1; ++i, r = void 0)
      ;
  if (!r || e.SheetNames.length >= 65535)
    throw new Error("Too many worksheets");
  if (n && e.SheetNames.indexOf(r) >= 0) {
    var s = r.match(/(^.*?)(\d+)$/);
    i = s && +s[2] || 0;
    var a = s && s[1] || r;
    for (++i; i <= 65535 && e.SheetNames.indexOf(r = a + i) != -1; ++i)
      ;
  }
  if (tg(r), e.SheetNames.indexOf(r) >= 0)
    throw new Error("Worksheet with name |" + r + "| already exists!");
  return e.SheetNames.push(r), e.Sheets[r] = t, r;
}
function QA(e, t, r) {
  e.Workbook || (e.Workbook = {}), e.Workbook.Sheets || (e.Workbook.Sheets = []);
  var n = qA(e, t);
  switch (e.Workbook.Sheets[n] || (e.Workbook.Sheets[n] = {}), r) {
    case 0:
    case 1:
    case 2:
      break;
    default:
      throw new Error("Bad sheet visibility setting " + r);
  }
  e.Workbook.Sheets[n].Hidden = r;
}
function e4(e, t) {
  return e.z = t, e;
}
function dg(e, t, r) {
  return t ? (e.l = { Target: t }, r && (e.l.Tooltip = r)) : delete e.l, e;
}
function t4(e, t, r) {
  return dg(e, "#" + t, r);
}
function r4(e, t, r) {
  e.c || (e.c = []), e.c.push({ t, a: r || "SheetJS" });
}
function n4(e, t, r, n) {
  for (var i = typeof t != "string" ? t : je(t), s = typeof t == "string" ? t : ht(t), a = i.s.r; a <= i.e.r; ++a)
    for (var o = i.s.c; o <= i.e.c; ++o) {
      var l = Is(e, a, o);
      l.t = "n", l.F = s, delete l.v, a == i.s.r && o == i.s.c && (l.f = r, n && (l.D = !0));
    }
  return e;
}
var pl = {
  encode_col: Ct,
  encode_row: bt,
  encode_cell: Le,
  encode_range: ht,
  decode_col: wc,
  decode_row: yc,
  split_cell: xy,
  decode_cell: _t,
  decode_range: tr,
  format_cell: an,
  sheet_add_aoa: dd,
  sheet_add_json: ug,
  sheet_add_dom: ag,
  aoa_to_sheet: Bi,
  json_to_sheet: KA,
  table_to_sheet: og,
  table_to_book: AA,
  sheet_to_csv: Mc,
  sheet_to_txt: hg,
  sheet_to_json: lo,
  sheet_to_html: sg,
  sheet_to_formulae: XA,
  sheet_to_row_object_array: lo,
  sheet_get_cell: Is,
  book_new: ZA,
  book_append_sheet: JA,
  book_set_sheet_visibility: QA,
  cell_set_number_format: e4,
  cell_set_hyperlink: dg,
  cell_set_internal_link: t4,
  cell_add_comment: r4,
  sheet_set_array_formula: n4,
  consts: {
    SHEET_VISIBLE: 0,
    SHEET_HIDDEN: 1,
    SHEET_VERY_HIDDEN: 2
  }
};
//! moment.js
//! version : 2.29.4
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
var gg;
function oe() {
  return gg.apply(null, arguments);
}
function i4(e) {
  gg = e;
}
function wr(e) {
  return e instanceof Array || Object.prototype.toString.call(e) === "[object Array]";
}
function Gn(e) {
  return e != null && Object.prototype.toString.call(e) === "[object Object]";
}
function Oe(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Pc(e) {
  if (Object.getOwnPropertyNames)
    return Object.getOwnPropertyNames(e).length === 0;
  var t;
  for (t in e)
    if (Oe(e, t))
      return !1;
  return !0;
}
function Vt(e) {
  return e === void 0;
}
function on(e) {
  return typeof e == "number" || Object.prototype.toString.call(e) === "[object Number]";
}
function qs(e) {
  return e instanceof Date || Object.prototype.toString.call(e) === "[object Date]";
}
function pg(e, t) {
  var r = [], n, i = e.length;
  for (n = 0; n < i; ++n)
    r.push(t(e[n], n));
  return r;
}
function vn(e, t) {
  for (var r in t)
    Oe(t, r) && (e[r] = t[r]);
  return Oe(t, "toString") && (e.toString = t.toString), Oe(t, "valueOf") && (e.valueOf = t.valueOf), e;
}
function Ir(e, t, r, n) {
  return Wg(e, t, r, n, !0).utc();
}
function s4() {
  return {
    empty: !1,
    unusedTokens: [],
    unusedInput: [],
    overflow: -2,
    charsLeftOver: 0,
    nullInput: !1,
    invalidEra: null,
    invalidMonth: null,
    invalidFormat: !1,
    userInvalidated: !1,
    iso: !1,
    parsedDateParts: [],
    era: null,
    meridiem: null,
    rfc2822: !1,
    weekdayMismatch: !1
  };
}
function _e(e) {
  return e._pf == null && (e._pf = s4()), e._pf;
}
var zl;
Array.prototype.some ? zl = Array.prototype.some : zl = function(e) {
  var t = Object(this), r = t.length >>> 0, n;
  for (n = 0; n < r; n++)
    if (n in t && e.call(this, t[n], n, t))
      return !0;
  return !1;
};
function Rc(e) {
  if (e._isValid == null) {
    var t = _e(e), r = zl.call(t.parsedDateParts, function(i) {
      return i != null;
    }), n = !isNaN(e._d.getTime()) && t.overflow < 0 && !t.empty && !t.invalidEra && !t.invalidMonth && !t.invalidWeekday && !t.weekdayMismatch && !t.nullInput && !t.invalidFormat && !t.userInvalidated && (!t.meridiem || t.meridiem && r);
    if (e._strict && (n = n && t.charsLeftOver === 0 && t.unusedTokens.length === 0 && t.bigHour === void 0), Object.isFrozen == null || !Object.isFrozen(e))
      e._isValid = n;
    else
      return n;
  }
  return e._isValid;
}
function Co(e) {
  var t = Ir(NaN);
  return e != null ? vn(_e(t), e) : _e(t).userInvalidated = !0, t;
}
var S0 = oe.momentProperties = [], ml = !1;
function Ic(e, t) {
  var r, n, i, s = S0.length;
  if (Vt(t._isAMomentObject) || (e._isAMomentObject = t._isAMomentObject), Vt(t._i) || (e._i = t._i), Vt(t._f) || (e._f = t._f), Vt(t._l) || (e._l = t._l), Vt(t._strict) || (e._strict = t._strict), Vt(t._tzm) || (e._tzm = t._tzm), Vt(t._isUTC) || (e._isUTC = t._isUTC), Vt(t._offset) || (e._offset = t._offset), Vt(t._pf) || (e._pf = _e(t)), Vt(t._locale) || (e._locale = t._locale), s > 0)
    for (r = 0; r < s; r++)
      n = S0[r], i = t[n], Vt(i) || (e[n] = i);
  return e;
}
function Zs(e) {
  Ic(this, e), this._d = new Date(e._d != null ? e._d.getTime() : NaN), this.isValid() || (this._d = /* @__PURE__ */ new Date(NaN)), ml === !1 && (ml = !0, oe.updateOffset(this), ml = !1);
}
function Tr(e) {
  return e instanceof Zs || e != null && e._isAMomentObject != null;
}
function mg(e) {
  oe.suppressDeprecationWarnings === !1 && typeof console < "u" && console.warn && console.warn("Deprecation warning: " + e);
}
function fr(e, t) {
  var r = !0;
  return vn(function() {
    if (oe.deprecationHandler != null && oe.deprecationHandler(null, e), r) {
      var n = [], i, s, a, o = arguments.length;
      for (s = 0; s < o; s++) {
        if (i = "", typeof arguments[s] == "object") {
          i += `
[` + s + "] ";
          for (a in arguments[0])
            Oe(arguments[0], a) && (i += a + ": " + arguments[0][a] + ", ");
          i = i.slice(0, -2);
        } else
          i = arguments[s];
        n.push(i);
      }
      mg(
        e + `
Arguments: ` + Array.prototype.slice.call(n).join("") + `
` + new Error().stack
      ), r = !1;
    }
    return t.apply(this, arguments);
  }, t);
}
var b0 = {};
function xg(e, t) {
  oe.deprecationHandler != null && oe.deprecationHandler(e, t), b0[e] || (mg(t), b0[e] = !0);
}
oe.suppressDeprecationWarnings = !1;
oe.deprecationHandler = null;
function Lr(e) {
  return typeof Function < "u" && e instanceof Function || Object.prototype.toString.call(e) === "[object Function]";
}
function a4(e) {
  var t, r;
  for (r in e)
    Oe(e, r) && (t = e[r], Lr(t) ? this[r] = t : this["_" + r] = t);
  this._config = e, this._dayOfMonthOrdinalParseLenient = new RegExp(
    (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + "|" + /\d{1,2}/.source
  );
}
function Hl(e, t) {
  var r = vn({}, e), n;
  for (n in t)
    Oe(t, n) && (Gn(e[n]) && Gn(t[n]) ? (r[n] = {}, vn(r[n], e[n]), vn(r[n], t[n])) : t[n] != null ? r[n] = t[n] : delete r[n]);
  for (n in e)
    Oe(e, n) && !Oe(t, n) && Gn(e[n]) && (r[n] = vn({}, r[n]));
  return r;
}
function Lc(e) {
  e != null && this.set(e);
}
var Vl;
Object.keys ? Vl = Object.keys : Vl = function(e) {
  var t, r = [];
  for (t in e)
    Oe(e, t) && r.push(t);
  return r;
};
var o4 = {
  sameDay: "[Today at] LT",
  nextDay: "[Tomorrow at] LT",
  nextWeek: "dddd [at] LT",
  lastDay: "[Yesterday at] LT",
  lastWeek: "[Last] dddd [at] LT",
  sameElse: "L"
};
function l4(e, t, r) {
  var n = this._calendar[e] || this._calendar.sameElse;
  return Lr(n) ? n.call(t, r) : n;
}
function Rr(e, t, r) {
  var n = "" + Math.abs(e), i = t - n.length, s = e >= 0;
  return (s ? r ? "+" : "" : "-") + Math.pow(10, Math.max(0, i)).toString().substr(1) + n;
}
var Nc = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g, Oa = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, xl = {}, Oi = {};
function ue(e, t, r, n) {
  var i = n;
  typeof n == "string" && (i = function() {
    return this[n]();
  }), e && (Oi[e] = i), t && (Oi[t[0]] = function() {
    return Rr(i.apply(this, arguments), t[1], t[2]);
  }), r && (Oi[r] = function() {
    return this.localeData().ordinal(
      i.apply(this, arguments),
      e
    );
  });
}
function c4(e) {
  return e.match(/\[[\s\S]/) ? e.replace(/^\[|\]$/g, "") : e.replace(/\\/g, "");
}
function f4(e) {
  var t = e.match(Nc), r, n;
  for (r = 0, n = t.length; r < n; r++)
    Oi[t[r]] ? t[r] = Oi[t[r]] : t[r] = c4(t[r]);
  return function(i) {
    var s = "", a;
    for (a = 0; a < n; a++)
      s += Lr(t[a]) ? t[a].call(i, e) : t[a];
    return s;
  };
}
function Na(e, t) {
  return e.isValid() ? (t = _g(t, e.localeData()), xl[t] = xl[t] || f4(t), xl[t](e)) : e.localeData().invalidDate();
}
function _g(e, t) {
  var r = 5;
  function n(i) {
    return t.longDateFormat(i) || i;
  }
  for (Oa.lastIndex = 0; r >= 0 && Oa.test(e); )
    e = e.replace(
      Oa,
      n
    ), Oa.lastIndex = 0, r -= 1;
  return e;
}
var h4 = {
  LTS: "h:mm:ss A",
  LT: "h:mm A",
  L: "MM/DD/YYYY",
  LL: "MMMM D, YYYY",
  LLL: "MMMM D, YYYY h:mm A",
  LLLL: "dddd, MMMM D, YYYY h:mm A"
};
function u4(e) {
  var t = this._longDateFormat[e], r = this._longDateFormat[e.toUpperCase()];
  return t || !r ? t : (this._longDateFormat[e] = r.match(Nc).map(function(n) {
    return n === "MMMM" || n === "MM" || n === "DD" || n === "dddd" ? n.slice(1) : n;
  }).join(""), this._longDateFormat[e]);
}
var d4 = "Invalid date";
function g4() {
  return this._invalidDate;
}
var p4 = "%d", m4 = /\d{1,2}/;
function x4(e) {
  return this._ordinal.replace("%d", e);
}
var _4 = {
  future: "in %s",
  past: "%s ago",
  s: "a few seconds",
  ss: "%d seconds",
  m: "a minute",
  mm: "%d minutes",
  h: "an hour",
  hh: "%d hours",
  d: "a day",
  dd: "%d days",
  w: "a week",
  ww: "%d weeks",
  M: "a month",
  MM: "%d months",
  y: "a year",
  yy: "%d years"
};
function v4(e, t, r, n) {
  var i = this._relativeTime[r];
  return Lr(i) ? i(e, t, r, n) : i.replace(/%d/i, e);
}
function y4(e, t) {
  var r = this._relativeTime[e > 0 ? "future" : "past"];
  return Lr(r) ? r(t) : r.replace(/%s/i, t);
}
var ws = {};
function Rt(e, t) {
  var r = e.toLowerCase();
  ws[r] = ws[r + "s"] = ws[t] = e;
}
function hr(e) {
  return typeof e == "string" ? ws[e] || ws[e.toLowerCase()] : void 0;
}
function Bc(e) {
  var t = {}, r, n;
  for (n in e)
    Oe(e, n) && (r = hr(n), r && (t[r] = e[n]));
  return t;
}
var vg = {};
function It(e, t) {
  vg[e] = t;
}
function w4(e) {
  var t = [], r;
  for (r in e)
    Oe(e, r) && t.push({ unit: r, priority: vg[r] });
  return t.sort(function(n, i) {
    return n.priority - i.priority;
  }), t;
}
function Mo(e) {
  return e % 4 === 0 && e % 100 !== 0 || e % 400 === 0;
}
function lr(e) {
  return e < 0 ? Math.ceil(e) || 0 : Math.floor(e);
}
function Se(e) {
  var t = +e, r = 0;
  return t !== 0 && isFinite(t) && (r = lr(t)), r;
}
function zi(e, t) {
  return function(r) {
    return r != null ? (yg(this, e, r), oe.updateOffset(this, t), this) : co(this, e);
  };
}
function co(e, t) {
  return e.isValid() ? e._d["get" + (e._isUTC ? "UTC" : "") + t]() : NaN;
}
function yg(e, t, r) {
  e.isValid() && !isNaN(r) && (t === "FullYear" && Mo(e.year()) && e.month() === 1 && e.date() === 29 ? (r = Se(r), e._d["set" + (e._isUTC ? "UTC" : "") + t](
    r,
    e.month(),
    Bo(r, e.month())
  )) : e._d["set" + (e._isUTC ? "UTC" : "") + t](r));
}
function T4(e) {
  return e = hr(e), Lr(this[e]) ? this[e]() : this;
}
function S4(e, t) {
  if (typeof e == "object") {
    e = Bc(e);
    var r = w4(e), n, i = r.length;
    for (n = 0; n < i; n++)
      this[r[n].unit](e[r[n].unit]);
  } else if (e = hr(e), Lr(this[e]))
    return this[e](t);
  return this;
}
var wg = /\d/, rr = /\d\d/, Tg = /\d{3}/, Wc = /\d{4}/, Po = /[+-]?\d{6}/, Ge = /\d\d?/, Sg = /\d\d\d\d?/, bg = /\d\d\d\d\d\d?/, Ro = /\d{1,3}/, Uc = /\d{1,4}/, Io = /[+-]?\d{1,6}/, Hi = /\d+/, Lo = /[+-]?\d+/, b4 = /Z|[+-]\d\d:?\d\d/gi, No = /Z|[+-]\d\d(?::?\d\d)?/gi, E4 = /[+-]?\d+(\.\d{1,3})?/, Js = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i, fo;
fo = {};
function fe(e, t, r) {
  fo[e] = Lr(t) ? t : function(n, i) {
    return n && r ? r : t;
  };
}
function A4(e, t) {
  return Oe(fo, e) ? fo[e](t._strict, t._locale) : new RegExp(k4(e));
}
function k4(e) {
  return er(
    e.replace("\\", "").replace(
      /\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,
      function(t, r, n, i, s) {
        return r || n || i || s;
      }
    )
  );
}
function er(e) {
  return e.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
var Yl = {};
function We(e, t) {
  var r, n = t, i;
  for (typeof e == "string" && (e = [e]), on(t) && (n = function(s, a) {
    a[t] = Se(s);
  }), i = e.length, r = 0; r < i; r++)
    Yl[e[r]] = n;
}
function Qs(e, t) {
  We(e, function(r, n, i, s) {
    i._w = i._w || {}, t(r, i._w, i, s);
  });
}
function O4(e, t, r) {
  t != null && Oe(Yl, e) && Yl[e](t, r._a, r, e);
}
var Pt = 0, Jr = 1, Fr = 2, gt = 3, xr = 4, Qr = 5, Vn = 6, D4 = 7, F4 = 8;
function C4(e, t) {
  return (e % t + t) % t;
}
var at;
Array.prototype.indexOf ? at = Array.prototype.indexOf : at = function(e) {
  var t;
  for (t = 0; t < this.length; ++t)
    if (this[t] === e)
      return t;
  return -1;
};
function Bo(e, t) {
  if (isNaN(e) || isNaN(t))
    return NaN;
  var r = C4(t, 12);
  return e += (t - r) / 12, r === 1 ? Mo(e) ? 29 : 28 : 31 - r % 7 % 2;
}
ue("M", ["MM", 2], "Mo", function() {
  return this.month() + 1;
});
ue("MMM", 0, 0, function(e) {
  return this.localeData().monthsShort(this, e);
});
ue("MMMM", 0, 0, function(e) {
  return this.localeData().months(this, e);
});
Rt("month", "M");
It("month", 8);
fe("M", Ge);
fe("MM", Ge, rr);
fe("MMM", function(e, t) {
  return t.monthsShortRegex(e);
});
fe("MMMM", function(e, t) {
  return t.monthsRegex(e);
});
We(["M", "MM"], function(e, t) {
  t[Jr] = Se(e) - 1;
});
We(["MMM", "MMMM"], function(e, t, r, n) {
  var i = r._locale.monthsParse(e, n, r._strict);
  i != null ? t[Jr] = i : _e(r).invalidMonth = e;
});
var M4 = "January_February_March_April_May_June_July_August_September_October_November_December".split(
  "_"
), Eg = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), Ag = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/, P4 = Js, R4 = Js;
function I4(e, t) {
  return e ? wr(this._months) ? this._months[e.month()] : this._months[(this._months.isFormat || Ag).test(t) ? "format" : "standalone"][e.month()] : wr(this._months) ? this._months : this._months.standalone;
}
function L4(e, t) {
  return e ? wr(this._monthsShort) ? this._monthsShort[e.month()] : this._monthsShort[Ag.test(t) ? "format" : "standalone"][e.month()] : wr(this._monthsShort) ? this._monthsShort : this._monthsShort.standalone;
}
function N4(e, t, r) {
  var n, i, s, a = e.toLocaleLowerCase();
  if (!this._monthsParse)
    for (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = [], n = 0; n < 12; ++n)
      s = Ir([2e3, n]), this._shortMonthsParse[n] = this.monthsShort(
        s,
        ""
      ).toLocaleLowerCase(), this._longMonthsParse[n] = this.months(s, "").toLocaleLowerCase();
  return r ? t === "MMM" ? (i = at.call(this._shortMonthsParse, a), i !== -1 ? i : null) : (i = at.call(this._longMonthsParse, a), i !== -1 ? i : null) : t === "MMM" ? (i = at.call(this._shortMonthsParse, a), i !== -1 ? i : (i = at.call(this._longMonthsParse, a), i !== -1 ? i : null)) : (i = at.call(this._longMonthsParse, a), i !== -1 ? i : (i = at.call(this._shortMonthsParse, a), i !== -1 ? i : null));
}
function B4(e, t, r) {
  var n, i, s;
  if (this._monthsParseExact)
    return N4.call(this, e, t, r);
  for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), n = 0; n < 12; n++) {
    if (i = Ir([2e3, n]), r && !this._longMonthsParse[n] && (this._longMonthsParse[n] = new RegExp(
      "^" + this.months(i, "").replace(".", "") + "$",
      "i"
    ), this._shortMonthsParse[n] = new RegExp(
      "^" + this.monthsShort(i, "").replace(".", "") + "$",
      "i"
    )), !r && !this._monthsParse[n] && (s = "^" + this.months(i, "") + "|^" + this.monthsShort(i, ""), this._monthsParse[n] = new RegExp(s.replace(".", ""), "i")), r && t === "MMMM" && this._longMonthsParse[n].test(e))
      return n;
    if (r && t === "MMM" && this._shortMonthsParse[n].test(e))
      return n;
    if (!r && this._monthsParse[n].test(e))
      return n;
  }
}
function kg(e, t) {
  var r;
  if (!e.isValid())
    return e;
  if (typeof t == "string") {
    if (/^\d+$/.test(t))
      t = Se(t);
    else if (t = e.localeData().monthsParse(t), !on(t))
      return e;
  }
  return r = Math.min(e.date(), Bo(e.year(), t)), e._d["set" + (e._isUTC ? "UTC" : "") + "Month"](t, r), e;
}
function Og(e) {
  return e != null ? (kg(this, e), oe.updateOffset(this, !0), this) : co(this, "Month");
}
function W4() {
  return Bo(this.year(), this.month());
}
function U4(e) {
  return this._monthsParseExact ? (Oe(this, "_monthsRegex") || Dg.call(this), e ? this._monthsShortStrictRegex : this._monthsShortRegex) : (Oe(this, "_monthsShortRegex") || (this._monthsShortRegex = P4), this._monthsShortStrictRegex && e ? this._monthsShortStrictRegex : this._monthsShortRegex);
}
function z4(e) {
  return this._monthsParseExact ? (Oe(this, "_monthsRegex") || Dg.call(this), e ? this._monthsStrictRegex : this._monthsRegex) : (Oe(this, "_monthsRegex") || (this._monthsRegex = R4), this._monthsStrictRegex && e ? this._monthsStrictRegex : this._monthsRegex);
}
function Dg() {
  function e(a, o) {
    return o.length - a.length;
  }
  var t = [], r = [], n = [], i, s;
  for (i = 0; i < 12; i++)
    s = Ir([2e3, i]), t.push(this.monthsShort(s, "")), r.push(this.months(s, "")), n.push(this.months(s, "")), n.push(this.monthsShort(s, ""));
  for (t.sort(e), r.sort(e), n.sort(e), i = 0; i < 12; i++)
    t[i] = er(t[i]), r[i] = er(r[i]);
  for (i = 0; i < 24; i++)
    n[i] = er(n[i]);
  this._monthsRegex = new RegExp("^(" + n.join("|") + ")", "i"), this._monthsShortRegex = this._monthsRegex, this._monthsStrictRegex = new RegExp(
    "^(" + r.join("|") + ")",
    "i"
  ), this._monthsShortStrictRegex = new RegExp(
    "^(" + t.join("|") + ")",
    "i"
  );
}
ue("Y", 0, 0, function() {
  var e = this.year();
  return e <= 9999 ? Rr(e, 4) : "+" + e;
});
ue(0, ["YY", 2], 0, function() {
  return this.year() % 100;
});
ue(0, ["YYYY", 4], 0, "year");
ue(0, ["YYYYY", 5], 0, "year");
ue(0, ["YYYYYY", 6, !0], 0, "year");
Rt("year", "y");
It("year", 1);
fe("Y", Lo);
fe("YY", Ge, rr);
fe("YYYY", Uc, Wc);
fe("YYYYY", Io, Po);
fe("YYYYYY", Io, Po);
We(["YYYYY", "YYYYYY"], Pt);
We("YYYY", function(e, t) {
  t[Pt] = e.length === 2 ? oe.parseTwoDigitYear(e) : Se(e);
});
We("YY", function(e, t) {
  t[Pt] = oe.parseTwoDigitYear(e);
});
We("Y", function(e, t) {
  t[Pt] = parseInt(e, 10);
});
function Ts(e) {
  return Mo(e) ? 366 : 365;
}
oe.parseTwoDigitYear = function(e) {
  return Se(e) + (Se(e) > 68 ? 1900 : 2e3);
};
var Fg = zi("FullYear", !0);
function H4() {
  return Mo(this.year());
}
function V4(e, t, r, n, i, s, a) {
  var o;
  return e < 100 && e >= 0 ? (o = new Date(e + 400, t, r, n, i, s, a), isFinite(o.getFullYear()) && o.setFullYear(e)) : o = new Date(e, t, r, n, i, s, a), o;
}
function Ls(e) {
  var t, r;
  return e < 100 && e >= 0 ? (r = Array.prototype.slice.call(arguments), r[0] = e + 400, t = new Date(Date.UTC.apply(null, r)), isFinite(t.getUTCFullYear()) && t.setUTCFullYear(e)) : t = new Date(Date.UTC.apply(null, arguments)), t;
}
function ho(e, t, r) {
  var n = 7 + t - r, i = (7 + Ls(e, 0, n).getUTCDay() - t) % 7;
  return -i + n - 1;
}
function Cg(e, t, r, n, i) {
  var s = (7 + r - n) % 7, a = ho(e, n, i), o = 1 + 7 * (t - 1) + s + a, l, c;
  return o <= 0 ? (l = e - 1, c = Ts(l) + o) : o > Ts(e) ? (l = e + 1, c = o - Ts(e)) : (l = e, c = o), {
    year: l,
    dayOfYear: c
  };
}
function Ns(e, t, r) {
  var n = ho(e.year(), t, r), i = Math.floor((e.dayOfYear() - n - 1) / 7) + 1, s, a;
  return i < 1 ? (a = e.year() - 1, s = i + nn(a, t, r)) : i > nn(e.year(), t, r) ? (s = i - nn(e.year(), t, r), a = e.year() + 1) : (a = e.year(), s = i), {
    week: s,
    year: a
  };
}
function nn(e, t, r) {
  var n = ho(e, t, r), i = ho(e + 1, t, r);
  return (Ts(e) - n + i) / 7;
}
ue("w", ["ww", 2], "wo", "week");
ue("W", ["WW", 2], "Wo", "isoWeek");
Rt("week", "w");
Rt("isoWeek", "W");
It("week", 5);
It("isoWeek", 5);
fe("w", Ge);
fe("ww", Ge, rr);
fe("W", Ge);
fe("WW", Ge, rr);
Qs(
  ["w", "ww", "W", "WW"],
  function(e, t, r, n) {
    t[n.substr(0, 1)] = Se(e);
  }
);
function Y4(e) {
  return Ns(e, this._week.dow, this._week.doy).week;
}
var j4 = {
  dow: 0,
  // Sunday is the first day of the week.
  doy: 6
  // The week that contains Jan 6th is the first week of the year.
};
function $4() {
  return this._week.dow;
}
function G4() {
  return this._week.doy;
}
function X4(e) {
  var t = this.localeData().week(this);
  return e == null ? t : this.add((e - t) * 7, "d");
}
function K4(e) {
  var t = Ns(this, 1, 4).week;
  return e == null ? t : this.add((e - t) * 7, "d");
}
ue("d", 0, "do", "day");
ue("dd", 0, 0, function(e) {
  return this.localeData().weekdaysMin(this, e);
});
ue("ddd", 0, 0, function(e) {
  return this.localeData().weekdaysShort(this, e);
});
ue("dddd", 0, 0, function(e) {
  return this.localeData().weekdays(this, e);
});
ue("e", 0, 0, "weekday");
ue("E", 0, 0, "isoWeekday");
Rt("day", "d");
Rt("weekday", "e");
Rt("isoWeekday", "E");
It("day", 11);
It("weekday", 11);
It("isoWeekday", 11);
fe("d", Ge);
fe("e", Ge);
fe("E", Ge);
fe("dd", function(e, t) {
  return t.weekdaysMinRegex(e);
});
fe("ddd", function(e, t) {
  return t.weekdaysShortRegex(e);
});
fe("dddd", function(e, t) {
  return t.weekdaysRegex(e);
});
Qs(["dd", "ddd", "dddd"], function(e, t, r, n) {
  var i = r._locale.weekdaysParse(e, n, r._strict);
  i != null ? t.d = i : _e(r).invalidWeekday = e;
});
Qs(["d", "e", "E"], function(e, t, r, n) {
  t[n] = Se(e);
});
function q4(e, t) {
  return typeof e != "string" ? e : isNaN(e) ? (e = t.weekdaysParse(e), typeof e == "number" ? e : null) : parseInt(e, 10);
}
function Z4(e, t) {
  return typeof e == "string" ? t.weekdaysParse(e) % 7 || 7 : isNaN(e) ? null : e;
}
function zc(e, t) {
  return e.slice(t, 7).concat(e.slice(0, t));
}
var J4 = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), Mg = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), Q4 = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), ek = Js, tk = Js, rk = Js;
function nk(e, t) {
  var r = wr(this._weekdays) ? this._weekdays : this._weekdays[e && e !== !0 && this._weekdays.isFormat.test(t) ? "format" : "standalone"];
  return e === !0 ? zc(r, this._week.dow) : e ? r[e.day()] : r;
}
function ik(e) {
  return e === !0 ? zc(this._weekdaysShort, this._week.dow) : e ? this._weekdaysShort[e.day()] : this._weekdaysShort;
}
function sk(e) {
  return e === !0 ? zc(this._weekdaysMin, this._week.dow) : e ? this._weekdaysMin[e.day()] : this._weekdaysMin;
}
function ak(e, t, r) {
  var n, i, s, a = e.toLocaleLowerCase();
  if (!this._weekdaysParse)
    for (this._weekdaysParse = [], this._shortWeekdaysParse = [], this._minWeekdaysParse = [], n = 0; n < 7; ++n)
      s = Ir([2e3, 1]).day(n), this._minWeekdaysParse[n] = this.weekdaysMin(
        s,
        ""
      ).toLocaleLowerCase(), this._shortWeekdaysParse[n] = this.weekdaysShort(
        s,
        ""
      ).toLocaleLowerCase(), this._weekdaysParse[n] = this.weekdays(s, "").toLocaleLowerCase();
  return r ? t === "dddd" ? (i = at.call(this._weekdaysParse, a), i !== -1 ? i : null) : t === "ddd" ? (i = at.call(this._shortWeekdaysParse, a), i !== -1 ? i : null) : (i = at.call(this._minWeekdaysParse, a), i !== -1 ? i : null) : t === "dddd" ? (i = at.call(this._weekdaysParse, a), i !== -1 || (i = at.call(this._shortWeekdaysParse, a), i !== -1) ? i : (i = at.call(this._minWeekdaysParse, a), i !== -1 ? i : null)) : t === "ddd" ? (i = at.call(this._shortWeekdaysParse, a), i !== -1 || (i = at.call(this._weekdaysParse, a), i !== -1) ? i : (i = at.call(this._minWeekdaysParse, a), i !== -1 ? i : null)) : (i = at.call(this._minWeekdaysParse, a), i !== -1 || (i = at.call(this._weekdaysParse, a), i !== -1) ? i : (i = at.call(this._shortWeekdaysParse, a), i !== -1 ? i : null));
}
function ok(e, t, r) {
  var n, i, s;
  if (this._weekdaysParseExact)
    return ak.call(this, e, t, r);
  for (this._weekdaysParse || (this._weekdaysParse = [], this._minWeekdaysParse = [], this._shortWeekdaysParse = [], this._fullWeekdaysParse = []), n = 0; n < 7; n++) {
    if (i = Ir([2e3, 1]).day(n), r && !this._fullWeekdaysParse[n] && (this._fullWeekdaysParse[n] = new RegExp(
      "^" + this.weekdays(i, "").replace(".", "\\.?") + "$",
      "i"
    ), this._shortWeekdaysParse[n] = new RegExp(
      "^" + this.weekdaysShort(i, "").replace(".", "\\.?") + "$",
      "i"
    ), this._minWeekdaysParse[n] = new RegExp(
      "^" + this.weekdaysMin(i, "").replace(".", "\\.?") + "$",
      "i"
    )), this._weekdaysParse[n] || (s = "^" + this.weekdays(i, "") + "|^" + this.weekdaysShort(i, "") + "|^" + this.weekdaysMin(i, ""), this._weekdaysParse[n] = new RegExp(s.replace(".", ""), "i")), r && t === "dddd" && this._fullWeekdaysParse[n].test(e))
      return n;
    if (r && t === "ddd" && this._shortWeekdaysParse[n].test(e))
      return n;
    if (r && t === "dd" && this._minWeekdaysParse[n].test(e))
      return n;
    if (!r && this._weekdaysParse[n].test(e))
      return n;
  }
}
function lk(e) {
  if (!this.isValid())
    return e != null ? this : NaN;
  var t = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
  return e != null ? (e = q4(e, this.localeData()), this.add(e - t, "d")) : t;
}
function ck(e) {
  if (!this.isValid())
    return e != null ? this : NaN;
  var t = (this.day() + 7 - this.localeData()._week.dow) % 7;
  return e == null ? t : this.add(e - t, "d");
}
function fk(e) {
  if (!this.isValid())
    return e != null ? this : NaN;
  if (e != null) {
    var t = Z4(e, this.localeData());
    return this.day(this.day() % 7 ? t : t - 7);
  } else
    return this.day() || 7;
}
function hk(e) {
  return this._weekdaysParseExact ? (Oe(this, "_weekdaysRegex") || Hc.call(this), e ? this._weekdaysStrictRegex : this._weekdaysRegex) : (Oe(this, "_weekdaysRegex") || (this._weekdaysRegex = ek), this._weekdaysStrictRegex && e ? this._weekdaysStrictRegex : this._weekdaysRegex);
}
function uk(e) {
  return this._weekdaysParseExact ? (Oe(this, "_weekdaysRegex") || Hc.call(this), e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) : (Oe(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = tk), this._weekdaysShortStrictRegex && e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex);
}
function dk(e) {
  return this._weekdaysParseExact ? (Oe(this, "_weekdaysRegex") || Hc.call(this), e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) : (Oe(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = rk), this._weekdaysMinStrictRegex && e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex);
}
function Hc() {
  function e(f, h) {
    return h.length - f.length;
  }
  var t = [], r = [], n = [], i = [], s, a, o, l, c;
  for (s = 0; s < 7; s++)
    a = Ir([2e3, 1]).day(s), o = er(this.weekdaysMin(a, "")), l = er(this.weekdaysShort(a, "")), c = er(this.weekdays(a, "")), t.push(o), r.push(l), n.push(c), i.push(o), i.push(l), i.push(c);
  t.sort(e), r.sort(e), n.sort(e), i.sort(e), this._weekdaysRegex = new RegExp("^(" + i.join("|") + ")", "i"), this._weekdaysShortRegex = this._weekdaysRegex, this._weekdaysMinRegex = this._weekdaysRegex, this._weekdaysStrictRegex = new RegExp(
    "^(" + n.join("|") + ")",
    "i"
  ), this._weekdaysShortStrictRegex = new RegExp(
    "^(" + r.join("|") + ")",
    "i"
  ), this._weekdaysMinStrictRegex = new RegExp(
    "^(" + t.join("|") + ")",
    "i"
  );
}
function Vc() {
  return this.hours() % 12 || 12;
}
function gk() {
  return this.hours() || 24;
}
ue("H", ["HH", 2], 0, "hour");
ue("h", ["hh", 2], 0, Vc);
ue("k", ["kk", 2], 0, gk);
ue("hmm", 0, 0, function() {
  return "" + Vc.apply(this) + Rr(this.minutes(), 2);
});
ue("hmmss", 0, 0, function() {
  return "" + Vc.apply(this) + Rr(this.minutes(), 2) + Rr(this.seconds(), 2);
});
ue("Hmm", 0, 0, function() {
  return "" + this.hours() + Rr(this.minutes(), 2);
});
ue("Hmmss", 0, 0, function() {
  return "" + this.hours() + Rr(this.minutes(), 2) + Rr(this.seconds(), 2);
});
function Pg(e, t) {
  ue(e, 0, 0, function() {
    return this.localeData().meridiem(
      this.hours(),
      this.minutes(),
      t
    );
  });
}
Pg("a", !0);
Pg("A", !1);
Rt("hour", "h");
It("hour", 13);
function Rg(e, t) {
  return t._meridiemParse;
}
fe("a", Rg);
fe("A", Rg);
fe("H", Ge);
fe("h", Ge);
fe("k", Ge);
fe("HH", Ge, rr);
fe("hh", Ge, rr);
fe("kk", Ge, rr);
fe("hmm", Sg);
fe("hmmss", bg);
fe("Hmm", Sg);
fe("Hmmss", bg);
We(["H", "HH"], gt);
We(["k", "kk"], function(e, t, r) {
  var n = Se(e);
  t[gt] = n === 24 ? 0 : n;
});
We(["a", "A"], function(e, t, r) {
  r._isPm = r._locale.isPM(e), r._meridiem = e;
});
We(["h", "hh"], function(e, t, r) {
  t[gt] = Se(e), _e(r).bigHour = !0;
});
We("hmm", function(e, t, r) {
  var n = e.length - 2;
  t[gt] = Se(e.substr(0, n)), t[xr] = Se(e.substr(n)), _e(r).bigHour = !0;
});
We("hmmss", function(e, t, r) {
  var n = e.length - 4, i = e.length - 2;
  t[gt] = Se(e.substr(0, n)), t[xr] = Se(e.substr(n, 2)), t[Qr] = Se(e.substr(i)), _e(r).bigHour = !0;
});
We("Hmm", function(e, t, r) {
  var n = e.length - 2;
  t[gt] = Se(e.substr(0, n)), t[xr] = Se(e.substr(n));
});
We("Hmmss", function(e, t, r) {
  var n = e.length - 4, i = e.length - 2;
  t[gt] = Se(e.substr(0, n)), t[xr] = Se(e.substr(n, 2)), t[Qr] = Se(e.substr(i));
});
function pk(e) {
  return (e + "").toLowerCase().charAt(0) === "p";
}
var mk = /[ap]\.?m?\.?/i, xk = zi("Hours", !0);
function _k(e, t, r) {
  return e > 11 ? r ? "pm" : "PM" : r ? "am" : "AM";
}
var Ig = {
  calendar: o4,
  longDateFormat: h4,
  invalidDate: d4,
  ordinal: p4,
  dayOfMonthOrdinalParse: m4,
  relativeTime: _4,
  months: M4,
  monthsShort: Eg,
  week: j4,
  weekdays: J4,
  weekdaysMin: Q4,
  weekdaysShort: Mg,
  meridiemParse: mk
}, Xe = {}, Qi = {}, Bs;
function vk(e, t) {
  var r, n = Math.min(e.length, t.length);
  for (r = 0; r < n; r += 1)
    if (e[r] !== t[r])
      return r;
  return n;
}
function E0(e) {
  return e && e.toLowerCase().replace("_", "-");
}
function yk(e) {
  for (var t = 0, r, n, i, s; t < e.length; ) {
    for (s = E0(e[t]).split("-"), r = s.length, n = E0(e[t + 1]), n = n ? n.split("-") : null; r > 0; ) {
      if (i = Wo(s.slice(0, r).join("-")), i)
        return i;
      if (n && n.length >= r && vk(s, n) >= r - 1)
        break;
      r--;
    }
    t++;
  }
  return Bs;
}
function wk(e) {
  return e.match("^[^/\\\\]*$") != null;
}
function Wo(e) {
  var t = null, r;
  if (Xe[e] === void 0 && typeof module < "u" && module && module.exports && wk(e))
    try {
      t = Bs._abbr, r = require, r("./locale/" + e), Tn(t);
    } catch {
      Xe[e] = null;
    }
  return Xe[e];
}
function Tn(e, t) {
  var r;
  return e && (Vt(t) ? r = fn(e) : r = Yc(e, t), r ? Bs = r : typeof console < "u" && console.warn && console.warn(
    "Locale " + e + " not found. Did you forget to load it?"
  )), Bs._abbr;
}
function Yc(e, t) {
  if (t !== null) {
    var r, n = Ig;
    if (t.abbr = e, Xe[e] != null)
      xg(
        "defineLocaleOverride",
        "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."
      ), n = Xe[e]._config;
    else if (t.parentLocale != null)
      if (Xe[t.parentLocale] != null)
        n = Xe[t.parentLocale]._config;
      else if (r = Wo(t.parentLocale), r != null)
        n = r._config;
      else
        return Qi[t.parentLocale] || (Qi[t.parentLocale] = []), Qi[t.parentLocale].push({
          name: e,
          config: t
        }), null;
    return Xe[e] = new Lc(Hl(n, t)), Qi[e] && Qi[e].forEach(function(i) {
      Yc(i.name, i.config);
    }), Tn(e), Xe[e];
  } else
    return delete Xe[e], null;
}
function Tk(e, t) {
  if (t != null) {
    var r, n, i = Ig;
    Xe[e] != null && Xe[e].parentLocale != null ? Xe[e].set(Hl(Xe[e]._config, t)) : (n = Wo(e), n != null && (i = n._config), t = Hl(i, t), n == null && (t.abbr = e), r = new Lc(t), r.parentLocale = Xe[e], Xe[e] = r), Tn(e);
  } else
    Xe[e] != null && (Xe[e].parentLocale != null ? (Xe[e] = Xe[e].parentLocale, e === Tn() && Tn(e)) : Xe[e] != null && delete Xe[e]);
  return Xe[e];
}
function fn(e) {
  var t;
  if (e && e._locale && e._locale._abbr && (e = e._locale._abbr), !e)
    return Bs;
  if (!wr(e)) {
    if (t = Wo(e), t)
      return t;
    e = [e];
  }
  return yk(e);
}
function Sk() {
  return Vl(Xe);
}
function jc(e) {
  var t, r = e._a;
  return r && _e(e).overflow === -2 && (t = r[Jr] < 0 || r[Jr] > 11 ? Jr : r[Fr] < 1 || r[Fr] > Bo(r[Pt], r[Jr]) ? Fr : r[gt] < 0 || r[gt] > 24 || r[gt] === 24 && (r[xr] !== 0 || r[Qr] !== 0 || r[Vn] !== 0) ? gt : r[xr] < 0 || r[xr] > 59 ? xr : r[Qr] < 0 || r[Qr] > 59 ? Qr : r[Vn] < 0 || r[Vn] > 999 ? Vn : -1, _e(e)._overflowDayOfYear && (t < Pt || t > Fr) && (t = Fr), _e(e)._overflowWeeks && t === -1 && (t = D4), _e(e)._overflowWeekday && t === -1 && (t = F4), _e(e).overflow = t), e;
}
var bk = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, Ek = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, Ak = /Z|[+-]\d\d(?::?\d\d)?/, Da = [
  ["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/],
  ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/],
  ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/],
  ["GGGG-[W]WW", /\d{4}-W\d\d/, !1],
  ["YYYY-DDD", /\d{4}-\d{3}/],
  ["YYYY-MM", /\d{4}-\d\d/, !1],
  ["YYYYYYMMDD", /[+-]\d{10}/],
  ["YYYYMMDD", /\d{8}/],
  ["GGGG[W]WWE", /\d{4}W\d{3}/],
  ["GGGG[W]WW", /\d{4}W\d{2}/, !1],
  ["YYYYDDD", /\d{7}/],
  ["YYYYMM", /\d{6}/, !1],
  ["YYYY", /\d{4}/, !1]
], _l = [
  ["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/],
  ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/],
  ["HH:mm:ss", /\d\d:\d\d:\d\d/],
  ["HH:mm", /\d\d:\d\d/],
  ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/],
  ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/],
  ["HHmmss", /\d\d\d\d\d\d/],
  ["HHmm", /\d\d\d\d/],
  ["HH", /\d\d/]
], kk = /^\/?Date\((-?\d+)/i, Ok = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/, Dk = {
  UT: 0,
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60
};
function Lg(e) {
  var t, r, n = e._i, i = bk.exec(n) || Ek.exec(n), s, a, o, l, c = Da.length, f = _l.length;
  if (i) {
    for (_e(e).iso = !0, t = 0, r = c; t < r; t++)
      if (Da[t][1].exec(i[1])) {
        a = Da[t][0], s = Da[t][2] !== !1;
        break;
      }
    if (a == null) {
      e._isValid = !1;
      return;
    }
    if (i[3]) {
      for (t = 0, r = f; t < r; t++)
        if (_l[t][1].exec(i[3])) {
          o = (i[2] || " ") + _l[t][0];
          break;
        }
      if (o == null) {
        e._isValid = !1;
        return;
      }
    }
    if (!s && o != null) {
      e._isValid = !1;
      return;
    }
    if (i[4])
      if (Ak.exec(i[4]))
        l = "Z";
      else {
        e._isValid = !1;
        return;
      }
    e._f = a + (o || "") + (l || ""), Gc(e);
  } else
    e._isValid = !1;
}
function Fk(e, t, r, n, i, s) {
  var a = [
    Ck(e),
    Eg.indexOf(t),
    parseInt(r, 10),
    parseInt(n, 10),
    parseInt(i, 10)
  ];
  return s && a.push(parseInt(s, 10)), a;
}
function Ck(e) {
  var t = parseInt(e, 10);
  return t <= 49 ? 2e3 + t : t <= 999 ? 1900 + t : t;
}
function Mk(e) {
  return e.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").replace(/^\s\s*/, "").replace(/\s\s*$/, "");
}
function Pk(e, t, r) {
  if (e) {
    var n = Mg.indexOf(e), i = new Date(
      t[0],
      t[1],
      t[2]
    ).getDay();
    if (n !== i)
      return _e(r).weekdayMismatch = !0, r._isValid = !1, !1;
  }
  return !0;
}
function Rk(e, t, r) {
  if (e)
    return Dk[e];
  if (t)
    return 0;
  var n = parseInt(r, 10), i = n % 100, s = (n - i) / 100;
  return s * 60 + i;
}
function Ng(e) {
  var t = Ok.exec(Mk(e._i)), r;
  if (t) {
    if (r = Fk(
      t[4],
      t[3],
      t[2],
      t[5],
      t[6],
      t[7]
    ), !Pk(t[1], r, e))
      return;
    e._a = r, e._tzm = Rk(t[8], t[9], t[10]), e._d = Ls.apply(null, e._a), e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm), _e(e).rfc2822 = !0;
  } else
    e._isValid = !1;
}
function Ik(e) {
  var t = kk.exec(e._i);
  if (t !== null) {
    e._d = /* @__PURE__ */ new Date(+t[1]);
    return;
  }
  if (Lg(e), e._isValid === !1)
    delete e._isValid;
  else
    return;
  if (Ng(e), e._isValid === !1)
    delete e._isValid;
  else
    return;
  e._strict ? e._isValid = !1 : oe.createFromInputFallback(e);
}
oe.createFromInputFallback = fr(
  "value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",
  function(e) {
    e._d = /* @__PURE__ */ new Date(e._i + (e._useUTC ? " UTC" : ""));
  }
);
function vi(e, t, r) {
  return e ?? t ?? r;
}
function Lk(e) {
  var t = new Date(oe.now());
  return e._useUTC ? [
    t.getUTCFullYear(),
    t.getUTCMonth(),
    t.getUTCDate()
  ] : [t.getFullYear(), t.getMonth(), t.getDate()];
}
function $c(e) {
  var t, r, n = [], i, s, a;
  if (!e._d) {
    for (i = Lk(e), e._w && e._a[Fr] == null && e._a[Jr] == null && Nk(e), e._dayOfYear != null && (a = vi(e._a[Pt], i[Pt]), (e._dayOfYear > Ts(a) || e._dayOfYear === 0) && (_e(e)._overflowDayOfYear = !0), r = Ls(a, 0, e._dayOfYear), e._a[Jr] = r.getUTCMonth(), e._a[Fr] = r.getUTCDate()), t = 0; t < 3 && e._a[t] == null; ++t)
      e._a[t] = n[t] = i[t];
    for (; t < 7; t++)
      e._a[t] = n[t] = e._a[t] == null ? t === 2 ? 1 : 0 : e._a[t];
    e._a[gt] === 24 && e._a[xr] === 0 && e._a[Qr] === 0 && e._a[Vn] === 0 && (e._nextDay = !0, e._a[gt] = 0), e._d = (e._useUTC ? Ls : V4).apply(
      null,
      n
    ), s = e._useUTC ? e._d.getUTCDay() : e._d.getDay(), e._tzm != null && e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm), e._nextDay && (e._a[gt] = 24), e._w && typeof e._w.d < "u" && e._w.d !== s && (_e(e).weekdayMismatch = !0);
  }
}
function Nk(e) {
  var t, r, n, i, s, a, o, l, c;
  t = e._w, t.GG != null || t.W != null || t.E != null ? (s = 1, a = 4, r = vi(
    t.GG,
    e._a[Pt],
    Ns($e(), 1, 4).year
  ), n = vi(t.W, 1), i = vi(t.E, 1), (i < 1 || i > 7) && (l = !0)) : (s = e._locale._week.dow, a = e._locale._week.doy, c = Ns($e(), s, a), r = vi(t.gg, e._a[Pt], c.year), n = vi(t.w, c.week), t.d != null ? (i = t.d, (i < 0 || i > 6) && (l = !0)) : t.e != null ? (i = t.e + s, (t.e < 0 || t.e > 6) && (l = !0)) : i = s), n < 1 || n > nn(r, s, a) ? _e(e)._overflowWeeks = !0 : l != null ? _e(e)._overflowWeekday = !0 : (o = Cg(r, n, i, s, a), e._a[Pt] = o.year, e._dayOfYear = o.dayOfYear);
}
oe.ISO_8601 = function() {
};
oe.RFC_2822 = function() {
};
function Gc(e) {
  if (e._f === oe.ISO_8601) {
    Lg(e);
    return;
  }
  if (e._f === oe.RFC_2822) {
    Ng(e);
    return;
  }
  e._a = [], _e(e).empty = !0;
  var t = "" + e._i, r, n, i, s, a, o = t.length, l = 0, c, f;
  for (i = _g(e._f, e._locale).match(Nc) || [], f = i.length, r = 0; r < f; r++)
    s = i[r], n = (t.match(A4(s, e)) || [])[0], n && (a = t.substr(0, t.indexOf(n)), a.length > 0 && _e(e).unusedInput.push(a), t = t.slice(
      t.indexOf(n) + n.length
    ), l += n.length), Oi[s] ? (n ? _e(e).empty = !1 : _e(e).unusedTokens.push(s), O4(s, n, e)) : e._strict && !n && _e(e).unusedTokens.push(s);
  _e(e).charsLeftOver = o - l, t.length > 0 && _e(e).unusedInput.push(t), e._a[gt] <= 12 && _e(e).bigHour === !0 && e._a[gt] > 0 && (_e(e).bigHour = void 0), _e(e).parsedDateParts = e._a.slice(0), _e(e).meridiem = e._meridiem, e._a[gt] = Bk(
    e._locale,
    e._a[gt],
    e._meridiem
  ), c = _e(e).era, c !== null && (e._a[Pt] = e._locale.erasConvertYear(c, e._a[Pt])), $c(e), jc(e);
}
function Bk(e, t, r) {
  var n;
  return r == null ? t : e.meridiemHour != null ? e.meridiemHour(t, r) : (e.isPM != null && (n = e.isPM(r), n && t < 12 && (t += 12), !n && t === 12 && (t = 0)), t);
}
function Wk(e) {
  var t, r, n, i, s, a, o = !1, l = e._f.length;
  if (l === 0) {
    _e(e).invalidFormat = !0, e._d = /* @__PURE__ */ new Date(NaN);
    return;
  }
  for (i = 0; i < l; i++)
    s = 0, a = !1, t = Ic({}, e), e._useUTC != null && (t._useUTC = e._useUTC), t._f = e._f[i], Gc(t), Rc(t) && (a = !0), s += _e(t).charsLeftOver, s += _e(t).unusedTokens.length * 10, _e(t).score = s, o ? s < n && (n = s, r = t) : (n == null || s < n || a) && (n = s, r = t, a && (o = !0));
  vn(e, r || t);
}
function Uk(e) {
  if (!e._d) {
    var t = Bc(e._i), r = t.day === void 0 ? t.date : t.day;
    e._a = pg(
      [t.year, t.month, r, t.hour, t.minute, t.second, t.millisecond],
      function(n) {
        return n && parseInt(n, 10);
      }
    ), $c(e);
  }
}
function zk(e) {
  var t = new Zs(jc(Bg(e)));
  return t._nextDay && (t.add(1, "d"), t._nextDay = void 0), t;
}
function Bg(e) {
  var t = e._i, r = e._f;
  return e._locale = e._locale || fn(e._l), t === null || r === void 0 && t === "" ? Co({ nullInput: !0 }) : (typeof t == "string" && (e._i = t = e._locale.preparse(t)), Tr(t) ? new Zs(jc(t)) : (qs(t) ? e._d = t : wr(r) ? Wk(e) : r ? Gc(e) : Hk(e), Rc(e) || (e._d = null), e));
}
function Hk(e) {
  var t = e._i;
  Vt(t) ? e._d = new Date(oe.now()) : qs(t) ? e._d = new Date(t.valueOf()) : typeof t == "string" ? Ik(e) : wr(t) ? (e._a = pg(t.slice(0), function(r) {
    return parseInt(r, 10);
  }), $c(e)) : Gn(t) ? Uk(e) : on(t) ? e._d = new Date(t) : oe.createFromInputFallback(e);
}
function Wg(e, t, r, n, i) {
  var s = {};
  return (t === !0 || t === !1) && (n = t, t = void 0), (r === !0 || r === !1) && (n = r, r = void 0), (Gn(e) && Pc(e) || wr(e) && e.length === 0) && (e = void 0), s._isAMomentObject = !0, s._useUTC = s._isUTC = i, s._l = r, s._i = e, s._f = t, s._strict = n, zk(s);
}
function $e(e, t, r, n) {
  return Wg(e, t, r, n, !1);
}
var Vk = fr(
  "moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",
  function() {
    var e = $e.apply(null, arguments);
    return this.isValid() && e.isValid() ? e < this ? this : e : Co();
  }
), Yk = fr(
  "moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",
  function() {
    var e = $e.apply(null, arguments);
    return this.isValid() && e.isValid() ? e > this ? this : e : Co();
  }
);
function Ug(e, t) {
  var r, n;
  if (t.length === 1 && wr(t[0]) && (t = t[0]), !t.length)
    return $e();
  for (r = t[0], n = 1; n < t.length; ++n)
    (!t[n].isValid() || t[n][e](r)) && (r = t[n]);
  return r;
}
function jk() {
  var e = [].slice.call(arguments, 0);
  return Ug("isBefore", e);
}
function $k() {
  var e = [].slice.call(arguments, 0);
  return Ug("isAfter", e);
}
var Gk = function() {
  return Date.now ? Date.now() : +/* @__PURE__ */ new Date();
}, es = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
  "millisecond"
];
function Xk(e) {
  var t, r = !1, n, i = es.length;
  for (t in e)
    if (Oe(e, t) && !(at.call(es, t) !== -1 && (e[t] == null || !isNaN(e[t]))))
      return !1;
  for (n = 0; n < i; ++n)
    if (e[es[n]]) {
      if (r)
        return !1;
      parseFloat(e[es[n]]) !== Se(e[es[n]]) && (r = !0);
    }
  return !0;
}
function Kk() {
  return this._isValid;
}
function qk() {
  return Sr(NaN);
}
function Uo(e) {
  var t = Bc(e), r = t.year || 0, n = t.quarter || 0, i = t.month || 0, s = t.week || t.isoWeek || 0, a = t.day || 0, o = t.hour || 0, l = t.minute || 0, c = t.second || 0, f = t.millisecond || 0;
  this._isValid = Xk(t), this._milliseconds = +f + c * 1e3 + // 1000
  l * 6e4 + // 1000 * 60
  o * 1e3 * 60 * 60, this._days = +a + s * 7, this._months = +i + n * 3 + r * 12, this._data = {}, this._locale = fn(), this._bubble();
}
function Ba(e) {
  return e instanceof Uo;
}
function jl(e) {
  return e < 0 ? Math.round(-1 * e) * -1 : Math.round(e);
}
function Zk(e, t, r) {
  var n = Math.min(e.length, t.length), i = Math.abs(e.length - t.length), s = 0, a;
  for (a = 0; a < n; a++)
    (r && e[a] !== t[a] || !r && Se(e[a]) !== Se(t[a])) && s++;
  return s + i;
}
function zg(e, t) {
  ue(e, 0, 0, function() {
    var r = this.utcOffset(), n = "+";
    return r < 0 && (r = -r, n = "-"), n + Rr(~~(r / 60), 2) + t + Rr(~~r % 60, 2);
  });
}
zg("Z", ":");
zg("ZZ", "");
fe("Z", No);
fe("ZZ", No);
We(["Z", "ZZ"], function(e, t, r) {
  r._useUTC = !0, r._tzm = Xc(No, e);
});
var Jk = /([\+\-]|\d\d)/gi;
function Xc(e, t) {
  var r = (t || "").match(e), n, i, s;
  return r === null ? null : (n = r[r.length - 1] || [], i = (n + "").match(Jk) || ["-", 0, 0], s = +(i[1] * 60) + Se(i[2]), s === 0 ? 0 : i[0] === "+" ? s : -s);
}
function Kc(e, t) {
  var r, n;
  return t._isUTC ? (r = t.clone(), n = (Tr(e) || qs(e) ? e.valueOf() : $e(e).valueOf()) - r.valueOf(), r._d.setTime(r._d.valueOf() + n), oe.updateOffset(r, !1), r) : $e(e).local();
}
function $l(e) {
  return -Math.round(e._d.getTimezoneOffset());
}
oe.updateOffset = function() {
};
function Qk(e, t, r) {
  var n = this._offset || 0, i;
  if (!this.isValid())
    return e != null ? this : NaN;
  if (e != null) {
    if (typeof e == "string") {
      if (e = Xc(No, e), e === null)
        return this;
    } else
      Math.abs(e) < 16 && !r && (e = e * 60);
    return !this._isUTC && t && (i = $l(this)), this._offset = e, this._isUTC = !0, i != null && this.add(i, "m"), n !== e && (!t || this._changeInProgress ? Yg(
      this,
      Sr(e - n, "m"),
      1,
      !1
    ) : this._changeInProgress || (this._changeInProgress = !0, oe.updateOffset(this, !0), this._changeInProgress = null)), this;
  } else
    return this._isUTC ? n : $l(this);
}
function eO(e, t) {
  return e != null ? (typeof e != "string" && (e = -e), this.utcOffset(e, t), this) : -this.utcOffset();
}
function tO(e) {
  return this.utcOffset(0, e);
}
function rO(e) {
  return this._isUTC && (this.utcOffset(0, e), this._isUTC = !1, e && this.subtract($l(this), "m")), this;
}
function nO() {
  if (this._tzm != null)
    this.utcOffset(this._tzm, !1, !0);
  else if (typeof this._i == "string") {
    var e = Xc(b4, this._i);
    e != null ? this.utcOffset(e) : this.utcOffset(0, !0);
  }
  return this;
}
function iO(e) {
  return this.isValid() ? (e = e ? $e(e).utcOffset() : 0, (this.utcOffset() - e) % 60 === 0) : !1;
}
function sO() {
  return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
}
function aO() {
  if (!Vt(this._isDSTShifted))
    return this._isDSTShifted;
  var e = {}, t;
  return Ic(e, this), e = Bg(e), e._a ? (t = e._isUTC ? Ir(e._a) : $e(e._a), this._isDSTShifted = this.isValid() && Zk(e._a, t.toArray()) > 0) : this._isDSTShifted = !1, this._isDSTShifted;
}
function oO() {
  return this.isValid() ? !this._isUTC : !1;
}
function lO() {
  return this.isValid() ? this._isUTC : !1;
}
function Hg() {
  return this.isValid() ? this._isUTC && this._offset === 0 : !1;
}
var cO = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/, fO = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
function Sr(e, t) {
  var r = e, n = null, i, s, a;
  return Ba(e) ? r = {
    ms: e._milliseconds,
    d: e._days,
    M: e._months
  } : on(e) || !isNaN(+e) ? (r = {}, t ? r[t] = +e : r.milliseconds = +e) : (n = cO.exec(e)) ? (i = n[1] === "-" ? -1 : 1, r = {
    y: 0,
    d: Se(n[Fr]) * i,
    h: Se(n[gt]) * i,
    m: Se(n[xr]) * i,
    s: Se(n[Qr]) * i,
    ms: Se(jl(n[Vn] * 1e3)) * i
    // the millisecond decimal point is included in the match
  }) : (n = fO.exec(e)) ? (i = n[1] === "-" ? -1 : 1, r = {
    y: Nn(n[2], i),
    M: Nn(n[3], i),
    w: Nn(n[4], i),
    d: Nn(n[5], i),
    h: Nn(n[6], i),
    m: Nn(n[7], i),
    s: Nn(n[8], i)
  }) : r == null ? r = {} : typeof r == "object" && ("from" in r || "to" in r) && (a = hO(
    $e(r.from),
    $e(r.to)
  ), r = {}, r.ms = a.milliseconds, r.M = a.months), s = new Uo(r), Ba(e) && Oe(e, "_locale") && (s._locale = e._locale), Ba(e) && Oe(e, "_isValid") && (s._isValid = e._isValid), s;
}
Sr.fn = Uo.prototype;
Sr.invalid = qk;
function Nn(e, t) {
  var r = e && parseFloat(e.replace(",", "."));
  return (isNaN(r) ? 0 : r) * t;
}
function A0(e, t) {
  var r = {};
  return r.months = t.month() - e.month() + (t.year() - e.year()) * 12, e.clone().add(r.months, "M").isAfter(t) && --r.months, r.milliseconds = +t - +e.clone().add(r.months, "M"), r;
}
function hO(e, t) {
  var r;
  return e.isValid() && t.isValid() ? (t = Kc(t, e), e.isBefore(t) ? r = A0(e, t) : (r = A0(t, e), r.milliseconds = -r.milliseconds, r.months = -r.months), r) : { milliseconds: 0, months: 0 };
}
function Vg(e, t) {
  return function(r, n) {
    var i, s;
    return n !== null && !isNaN(+n) && (xg(
      t,
      "moment()." + t + "(period, number) is deprecated. Please use moment()." + t + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."
    ), s = r, r = n, n = s), i = Sr(r, n), Yg(this, i, e), this;
  };
}
function Yg(e, t, r, n) {
  var i = t._milliseconds, s = jl(t._days), a = jl(t._months);
  e.isValid() && (n = n ?? !0, a && kg(e, co(e, "Month") + a * r), s && yg(e, "Date", co(e, "Date") + s * r), i && e._d.setTime(e._d.valueOf() + i * r), n && oe.updateOffset(e, s || a));
}
var uO = Vg(1, "add"), dO = Vg(-1, "subtract");
function jg(e) {
  return typeof e == "string" || e instanceof String;
}
function gO(e) {
  return Tr(e) || qs(e) || jg(e) || on(e) || mO(e) || pO(e) || e === null || e === void 0;
}
function pO(e) {
  var t = Gn(e) && !Pc(e), r = !1, n = [
    "years",
    "year",
    "y",
    "months",
    "month",
    "M",
    "days",
    "day",
    "d",
    "dates",
    "date",
    "D",
    "hours",
    "hour",
    "h",
    "minutes",
    "minute",
    "m",
    "seconds",
    "second",
    "s",
    "milliseconds",
    "millisecond",
    "ms"
  ], i, s, a = n.length;
  for (i = 0; i < a; i += 1)
    s = n[i], r = r || Oe(e, s);
  return t && r;
}
function mO(e) {
  var t = wr(e), r = !1;
  return t && (r = e.filter(function(n) {
    return !on(n) && jg(e);
  }).length === 0), t && r;
}
function xO(e) {
  var t = Gn(e) && !Pc(e), r = !1, n = [
    "sameDay",
    "nextDay",
    "lastDay",
    "nextWeek",
    "lastWeek",
    "sameElse"
  ], i, s;
  for (i = 0; i < n.length; i += 1)
    s = n[i], r = r || Oe(e, s);
  return t && r;
}
function _O(e, t) {
  var r = e.diff(t, "days", !0);
  return r < -6 ? "sameElse" : r < -1 ? "lastWeek" : r < 0 ? "lastDay" : r < 1 ? "sameDay" : r < 2 ? "nextDay" : r < 7 ? "nextWeek" : "sameElse";
}
function vO(e, t) {
  arguments.length === 1 && (arguments[0] ? gO(arguments[0]) ? (e = arguments[0], t = void 0) : xO(arguments[0]) && (t = arguments[0], e = void 0) : (e = void 0, t = void 0));
  var r = e || $e(), n = Kc(r, this).startOf("day"), i = oe.calendarFormat(this, n) || "sameElse", s = t && (Lr(t[i]) ? t[i].call(this, r) : t[i]);
  return this.format(
    s || this.localeData().calendar(i, this, $e(r))
  );
}
function yO() {
  return new Zs(this);
}
function wO(e, t) {
  var r = Tr(e) ? e : $e(e);
  return this.isValid() && r.isValid() ? (t = hr(t) || "millisecond", t === "millisecond" ? this.valueOf() > r.valueOf() : r.valueOf() < this.clone().startOf(t).valueOf()) : !1;
}
function TO(e, t) {
  var r = Tr(e) ? e : $e(e);
  return this.isValid() && r.isValid() ? (t = hr(t) || "millisecond", t === "millisecond" ? this.valueOf() < r.valueOf() : this.clone().endOf(t).valueOf() < r.valueOf()) : !1;
}
function SO(e, t, r, n) {
  var i = Tr(e) ? e : $e(e), s = Tr(t) ? t : $e(t);
  return this.isValid() && i.isValid() && s.isValid() ? (n = n || "()", (n[0] === "(" ? this.isAfter(i, r) : !this.isBefore(i, r)) && (n[1] === ")" ? this.isBefore(s, r) : !this.isAfter(s, r))) : !1;
}
function bO(e, t) {
  var r = Tr(e) ? e : $e(e), n;
  return this.isValid() && r.isValid() ? (t = hr(t) || "millisecond", t === "millisecond" ? this.valueOf() === r.valueOf() : (n = r.valueOf(), this.clone().startOf(t).valueOf() <= n && n <= this.clone().endOf(t).valueOf())) : !1;
}
function EO(e, t) {
  return this.isSame(e, t) || this.isAfter(e, t);
}
function AO(e, t) {
  return this.isSame(e, t) || this.isBefore(e, t);
}
function kO(e, t, r) {
  var n, i, s;
  if (!this.isValid())
    return NaN;
  if (n = Kc(e, this), !n.isValid())
    return NaN;
  switch (i = (n.utcOffset() - this.utcOffset()) * 6e4, t = hr(t), t) {
    case "year":
      s = Wa(this, n) / 12;
      break;
    case "month":
      s = Wa(this, n);
      break;
    case "quarter":
      s = Wa(this, n) / 3;
      break;
    case "second":
      s = (this - n) / 1e3;
      break;
    case "minute":
      s = (this - n) / 6e4;
      break;
    case "hour":
      s = (this - n) / 36e5;
      break;
    case "day":
      s = (this - n - i) / 864e5;
      break;
    case "week":
      s = (this - n - i) / 6048e5;
      break;
    default:
      s = this - n;
  }
  return r ? s : lr(s);
}
function Wa(e, t) {
  if (e.date() < t.date())
    return -Wa(t, e);
  var r = (t.year() - e.year()) * 12 + (t.month() - e.month()), n = e.clone().add(r, "months"), i, s;
  return t - n < 0 ? (i = e.clone().add(r - 1, "months"), s = (t - n) / (n - i)) : (i = e.clone().add(r + 1, "months"), s = (t - n) / (i - n)), -(r + s) || 0;
}
oe.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ";
oe.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
function OO() {
  return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
}
function DO(e) {
  if (!this.isValid())
    return null;
  var t = e !== !0, r = t ? this.clone().utc() : this;
  return r.year() < 0 || r.year() > 9999 ? Na(
    r,
    t ? "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"
  ) : Lr(Date.prototype.toISOString) ? t ? this.toDate().toISOString() : new Date(this.valueOf() + this.utcOffset() * 60 * 1e3).toISOString().replace("Z", Na(r, "Z")) : Na(
    r,
    t ? "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYY-MM-DD[T]HH:mm:ss.SSSZ"
  );
}
function FO() {
  if (!this.isValid())
    return "moment.invalid(/* " + this._i + " */)";
  var e = "moment", t = "", r, n, i, s;
  return this.isLocal() || (e = this.utcOffset() === 0 ? "moment.utc" : "moment.parseZone", t = "Z"), r = "[" + e + '("]', n = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY", i = "-MM-DD[T]HH:mm:ss.SSS", s = t + '[")]', this.format(r + n + i + s);
}
function CO(e) {
  e || (e = this.isUtc() ? oe.defaultFormatUtc : oe.defaultFormat);
  var t = Na(this, e);
  return this.localeData().postformat(t);
}
function MO(e, t) {
  return this.isValid() && (Tr(e) && e.isValid() || $e(e).isValid()) ? Sr({ to: this, from: e }).locale(this.locale()).humanize(!t) : this.localeData().invalidDate();
}
function PO(e) {
  return this.from($e(), e);
}
function RO(e, t) {
  return this.isValid() && (Tr(e) && e.isValid() || $e(e).isValid()) ? Sr({ from: this, to: e }).locale(this.locale()).humanize(!t) : this.localeData().invalidDate();
}
function IO(e) {
  return this.to($e(), e);
}
function $g(e) {
  var t;
  return e === void 0 ? this._locale._abbr : (t = fn(e), t != null && (this._locale = t), this);
}
var Gg = fr(
  "moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",
  function(e) {
    return e === void 0 ? this.localeData() : this.locale(e);
  }
);
function Xg() {
  return this._locale;
}
var uo = 1e3, Di = 60 * uo, go = 60 * Di, Kg = (365 * 400 + 97) * 24 * go;
function Fi(e, t) {
  return (e % t + t) % t;
}
function qg(e, t, r) {
  return e < 100 && e >= 0 ? new Date(e + 400, t, r) - Kg : new Date(e, t, r).valueOf();
}
function Zg(e, t, r) {
  return e < 100 && e >= 0 ? Date.UTC(e + 400, t, r) - Kg : Date.UTC(e, t, r);
}
function LO(e) {
  var t, r;
  if (e = hr(e), e === void 0 || e === "millisecond" || !this.isValid())
    return this;
  switch (r = this._isUTC ? Zg : qg, e) {
    case "year":
      t = r(this.year(), 0, 1);
      break;
    case "quarter":
      t = r(
        this.year(),
        this.month() - this.month() % 3,
        1
      );
      break;
    case "month":
      t = r(this.year(), this.month(), 1);
      break;
    case "week":
      t = r(
        this.year(),
        this.month(),
        this.date() - this.weekday()
      );
      break;
    case "isoWeek":
      t = r(
        this.year(),
        this.month(),
        this.date() - (this.isoWeekday() - 1)
      );
      break;
    case "day":
    case "date":
      t = r(this.year(), this.month(), this.date());
      break;
    case "hour":
      t = this._d.valueOf(), t -= Fi(
        t + (this._isUTC ? 0 : this.utcOffset() * Di),
        go
      );
      break;
    case "minute":
      t = this._d.valueOf(), t -= Fi(t, Di);
      break;
    case "second":
      t = this._d.valueOf(), t -= Fi(t, uo);
      break;
  }
  return this._d.setTime(t), oe.updateOffset(this, !0), this;
}
function NO(e) {
  var t, r;
  if (e = hr(e), e === void 0 || e === "millisecond" || !this.isValid())
    return this;
  switch (r = this._isUTC ? Zg : qg, e) {
    case "year":
      t = r(this.year() + 1, 0, 1) - 1;
      break;
    case "quarter":
      t = r(
        this.year(),
        this.month() - this.month() % 3 + 3,
        1
      ) - 1;
      break;
    case "month":
      t = r(this.year(), this.month() + 1, 1) - 1;
      break;
    case "week":
      t = r(
        this.year(),
        this.month(),
        this.date() - this.weekday() + 7
      ) - 1;
      break;
    case "isoWeek":
      t = r(
        this.year(),
        this.month(),
        this.date() - (this.isoWeekday() - 1) + 7
      ) - 1;
      break;
    case "day":
    case "date":
      t = r(this.year(), this.month(), this.date() + 1) - 1;
      break;
    case "hour":
      t = this._d.valueOf(), t += go - Fi(
        t + (this._isUTC ? 0 : this.utcOffset() * Di),
        go
      ) - 1;
      break;
    case "minute":
      t = this._d.valueOf(), t += Di - Fi(t, Di) - 1;
      break;
    case "second":
      t = this._d.valueOf(), t += uo - Fi(t, uo) - 1;
      break;
  }
  return this._d.setTime(t), oe.updateOffset(this, !0), this;
}
function BO() {
  return this._d.valueOf() - (this._offset || 0) * 6e4;
}
function WO() {
  return Math.floor(this.valueOf() / 1e3);
}
function UO() {
  return new Date(this.valueOf());
}
function zO() {
  var e = this;
  return [
    e.year(),
    e.month(),
    e.date(),
    e.hour(),
    e.minute(),
    e.second(),
    e.millisecond()
  ];
}
function HO() {
  var e = this;
  return {
    years: e.year(),
    months: e.month(),
    date: e.date(),
    hours: e.hours(),
    minutes: e.minutes(),
    seconds: e.seconds(),
    milliseconds: e.milliseconds()
  };
}
function VO() {
  return this.isValid() ? this.toISOString() : null;
}
function YO() {
  return Rc(this);
}
function jO() {
  return vn({}, _e(this));
}
function $O() {
  return _e(this).overflow;
}
function GO() {
  return {
    input: this._i,
    format: this._f,
    locale: this._locale,
    isUTC: this._isUTC,
    strict: this._strict
  };
}
ue("N", 0, 0, "eraAbbr");
ue("NN", 0, 0, "eraAbbr");
ue("NNN", 0, 0, "eraAbbr");
ue("NNNN", 0, 0, "eraName");
ue("NNNNN", 0, 0, "eraNarrow");
ue("y", ["y", 1], "yo", "eraYear");
ue("y", ["yy", 2], 0, "eraYear");
ue("y", ["yyy", 3], 0, "eraYear");
ue("y", ["yyyy", 4], 0, "eraYear");
fe("N", qc);
fe("NN", qc);
fe("NNN", qc);
fe("NNNN", iD);
fe("NNNNN", sD);
We(
  ["N", "NN", "NNN", "NNNN", "NNNNN"],
  function(e, t, r, n) {
    var i = r._locale.erasParse(e, n, r._strict);
    i ? _e(r).era = i : _e(r).invalidEra = e;
  }
);
fe("y", Hi);
fe("yy", Hi);
fe("yyy", Hi);
fe("yyyy", Hi);
fe("yo", aD);
We(["y", "yy", "yyy", "yyyy"], Pt);
We(["yo"], function(e, t, r, n) {
  var i;
  r._locale._eraYearOrdinalRegex && (i = e.match(r._locale._eraYearOrdinalRegex)), r._locale.eraYearOrdinalParse ? t[Pt] = r._locale.eraYearOrdinalParse(e, i) : t[Pt] = parseInt(e, 10);
});
function XO(e, t) {
  var r, n, i, s = this._eras || fn("en")._eras;
  for (r = 0, n = s.length; r < n; ++r) {
    switch (typeof s[r].since) {
      case "string":
        i = oe(s[r].since).startOf("day"), s[r].since = i.valueOf();
        break;
    }
    switch (typeof s[r].until) {
      case "undefined":
        s[r].until = 1 / 0;
        break;
      case "string":
        i = oe(s[r].until).startOf("day").valueOf(), s[r].until = i.valueOf();
        break;
    }
  }
  return s;
}
function KO(e, t, r) {
  var n, i, s = this.eras(), a, o, l;
  for (e = e.toUpperCase(), n = 0, i = s.length; n < i; ++n)
    if (a = s[n].name.toUpperCase(), o = s[n].abbr.toUpperCase(), l = s[n].narrow.toUpperCase(), r)
      switch (t) {
        case "N":
        case "NN":
        case "NNN":
          if (o === e)
            return s[n];
          break;
        case "NNNN":
          if (a === e)
            return s[n];
          break;
        case "NNNNN":
          if (l === e)
            return s[n];
          break;
      }
    else if ([a, o, l].indexOf(e) >= 0)
      return s[n];
}
function qO(e, t) {
  var r = e.since <= e.until ? 1 : -1;
  return t === void 0 ? oe(e.since).year() : oe(e.since).year() + (t - e.offset) * r;
}
function ZO() {
  var e, t, r, n = this.localeData().eras();
  for (e = 0, t = n.length; e < t; ++e)
    if (r = this.clone().startOf("day").valueOf(), n[e].since <= r && r <= n[e].until || n[e].until <= r && r <= n[e].since)
      return n[e].name;
  return "";
}
function JO() {
  var e, t, r, n = this.localeData().eras();
  for (e = 0, t = n.length; e < t; ++e)
    if (r = this.clone().startOf("day").valueOf(), n[e].since <= r && r <= n[e].until || n[e].until <= r && r <= n[e].since)
      return n[e].narrow;
  return "";
}
function QO() {
  var e, t, r, n = this.localeData().eras();
  for (e = 0, t = n.length; e < t; ++e)
    if (r = this.clone().startOf("day").valueOf(), n[e].since <= r && r <= n[e].until || n[e].until <= r && r <= n[e].since)
      return n[e].abbr;
  return "";
}
function eD() {
  var e, t, r, n, i = this.localeData().eras();
  for (e = 0, t = i.length; e < t; ++e)
    if (r = i[e].since <= i[e].until ? 1 : -1, n = this.clone().startOf("day").valueOf(), i[e].since <= n && n <= i[e].until || i[e].until <= n && n <= i[e].since)
      return (this.year() - oe(i[e].since).year()) * r + i[e].offset;
  return this.year();
}
function tD(e) {
  return Oe(this, "_erasNameRegex") || Zc.call(this), e ? this._erasNameRegex : this._erasRegex;
}
function rD(e) {
  return Oe(this, "_erasAbbrRegex") || Zc.call(this), e ? this._erasAbbrRegex : this._erasRegex;
}
function nD(e) {
  return Oe(this, "_erasNarrowRegex") || Zc.call(this), e ? this._erasNarrowRegex : this._erasRegex;
}
function qc(e, t) {
  return t.erasAbbrRegex(e);
}
function iD(e, t) {
  return t.erasNameRegex(e);
}
function sD(e, t) {
  return t.erasNarrowRegex(e);
}
function aD(e, t) {
  return t._eraYearOrdinalRegex || Hi;
}
function Zc() {
  var e = [], t = [], r = [], n = [], i, s, a = this.eras();
  for (i = 0, s = a.length; i < s; ++i)
    t.push(er(a[i].name)), e.push(er(a[i].abbr)), r.push(er(a[i].narrow)), n.push(er(a[i].name)), n.push(er(a[i].abbr)), n.push(er(a[i].narrow));
  this._erasRegex = new RegExp("^(" + n.join("|") + ")", "i"), this._erasNameRegex = new RegExp("^(" + t.join("|") + ")", "i"), this._erasAbbrRegex = new RegExp("^(" + e.join("|") + ")", "i"), this._erasNarrowRegex = new RegExp(
    "^(" + r.join("|") + ")",
    "i"
  );
}
ue(0, ["gg", 2], 0, function() {
  return this.weekYear() % 100;
});
ue(0, ["GG", 2], 0, function() {
  return this.isoWeekYear() % 100;
});
function zo(e, t) {
  ue(0, [e, e.length], 0, t);
}
zo("gggg", "weekYear");
zo("ggggg", "weekYear");
zo("GGGG", "isoWeekYear");
zo("GGGGG", "isoWeekYear");
Rt("weekYear", "gg");
Rt("isoWeekYear", "GG");
It("weekYear", 1);
It("isoWeekYear", 1);
fe("G", Lo);
fe("g", Lo);
fe("GG", Ge, rr);
fe("gg", Ge, rr);
fe("GGGG", Uc, Wc);
fe("gggg", Uc, Wc);
fe("GGGGG", Io, Po);
fe("ggggg", Io, Po);
Qs(
  ["gggg", "ggggg", "GGGG", "GGGGG"],
  function(e, t, r, n) {
    t[n.substr(0, 2)] = Se(e);
  }
);
Qs(["gg", "GG"], function(e, t, r, n) {
  t[n] = oe.parseTwoDigitYear(e);
});
function oD(e) {
  return Jg.call(
    this,
    e,
    this.week(),
    this.weekday(),
    this.localeData()._week.dow,
    this.localeData()._week.doy
  );
}
function lD(e) {
  return Jg.call(
    this,
    e,
    this.isoWeek(),
    this.isoWeekday(),
    1,
    4
  );
}
function cD() {
  return nn(this.year(), 1, 4);
}
function fD() {
  return nn(this.isoWeekYear(), 1, 4);
}
function hD() {
  var e = this.localeData()._week;
  return nn(this.year(), e.dow, e.doy);
}
function uD() {
  var e = this.localeData()._week;
  return nn(this.weekYear(), e.dow, e.doy);
}
function Jg(e, t, r, n, i) {
  var s;
  return e == null ? Ns(this, n, i).year : (s = nn(e, n, i), t > s && (t = s), dD.call(this, e, t, r, n, i));
}
function dD(e, t, r, n, i) {
  var s = Cg(e, t, r, n, i), a = Ls(s.year, 0, s.dayOfYear);
  return this.year(a.getUTCFullYear()), this.month(a.getUTCMonth()), this.date(a.getUTCDate()), this;
}
ue("Q", 0, "Qo", "quarter");
Rt("quarter", "Q");
It("quarter", 7);
fe("Q", wg);
We("Q", function(e, t) {
  t[Jr] = (Se(e) - 1) * 3;
});
function gD(e) {
  return e == null ? Math.ceil((this.month() + 1) / 3) : this.month((e - 1) * 3 + this.month() % 3);
}
ue("D", ["DD", 2], "Do", "date");
Rt("date", "D");
It("date", 9);
fe("D", Ge);
fe("DD", Ge, rr);
fe("Do", function(e, t) {
  return e ? t._dayOfMonthOrdinalParse || t._ordinalParse : t._dayOfMonthOrdinalParseLenient;
});
We(["D", "DD"], Fr);
We("Do", function(e, t) {
  t[Fr] = Se(e.match(Ge)[0]);
});
var Qg = zi("Date", !0);
ue("DDD", ["DDDD", 3], "DDDo", "dayOfYear");
Rt("dayOfYear", "DDD");
It("dayOfYear", 4);
fe("DDD", Ro);
fe("DDDD", Tg);
We(["DDD", "DDDD"], function(e, t, r) {
  r._dayOfYear = Se(e);
});
function pD(e) {
  var t = Math.round(
    (this.clone().startOf("day") - this.clone().startOf("year")) / 864e5
  ) + 1;
  return e == null ? t : this.add(e - t, "d");
}
ue("m", ["mm", 2], 0, "minute");
Rt("minute", "m");
It("minute", 14);
fe("m", Ge);
fe("mm", Ge, rr);
We(["m", "mm"], xr);
var mD = zi("Minutes", !1);
ue("s", ["ss", 2], 0, "second");
Rt("second", "s");
It("second", 15);
fe("s", Ge);
fe("ss", Ge, rr);
We(["s", "ss"], Qr);
var xD = zi("Seconds", !1);
ue("S", 0, 0, function() {
  return ~~(this.millisecond() / 100);
});
ue(0, ["SS", 2], 0, function() {
  return ~~(this.millisecond() / 10);
});
ue(0, ["SSS", 3], 0, "millisecond");
ue(0, ["SSSS", 4], 0, function() {
  return this.millisecond() * 10;
});
ue(0, ["SSSSS", 5], 0, function() {
  return this.millisecond() * 100;
});
ue(0, ["SSSSSS", 6], 0, function() {
  return this.millisecond() * 1e3;
});
ue(0, ["SSSSSSS", 7], 0, function() {
  return this.millisecond() * 1e4;
});
ue(0, ["SSSSSSSS", 8], 0, function() {
  return this.millisecond() * 1e5;
});
ue(0, ["SSSSSSSSS", 9], 0, function() {
  return this.millisecond() * 1e6;
});
Rt("millisecond", "ms");
It("millisecond", 16);
fe("S", Ro, wg);
fe("SS", Ro, rr);
fe("SSS", Ro, Tg);
var yn, ep;
for (yn = "SSSS"; yn.length <= 9; yn += "S")
  fe(yn, Hi);
function _D(e, t) {
  t[Vn] = Se(("0." + e) * 1e3);
}
for (yn = "S"; yn.length <= 9; yn += "S")
  We(yn, _D);
ep = zi("Milliseconds", !1);
ue("z", 0, 0, "zoneAbbr");
ue("zz", 0, 0, "zoneName");
function vD() {
  return this._isUTC ? "UTC" : "";
}
function yD() {
  return this._isUTC ? "Coordinated Universal Time" : "";
}
var Q = Zs.prototype;
Q.add = uO;
Q.calendar = vO;
Q.clone = yO;
Q.diff = kO;
Q.endOf = NO;
Q.format = CO;
Q.from = MO;
Q.fromNow = PO;
Q.to = RO;
Q.toNow = IO;
Q.get = T4;
Q.invalidAt = $O;
Q.isAfter = wO;
Q.isBefore = TO;
Q.isBetween = SO;
Q.isSame = bO;
Q.isSameOrAfter = EO;
Q.isSameOrBefore = AO;
Q.isValid = YO;
Q.lang = Gg;
Q.locale = $g;
Q.localeData = Xg;
Q.max = Yk;
Q.min = Vk;
Q.parsingFlags = jO;
Q.set = S4;
Q.startOf = LO;
Q.subtract = dO;
Q.toArray = zO;
Q.toObject = HO;
Q.toDate = UO;
Q.toISOString = DO;
Q.inspect = FO;
typeof Symbol < "u" && Symbol.for != null && (Q[Symbol.for("nodejs.util.inspect.custom")] = function() {
  return "Moment<" + this.format() + ">";
});
Q.toJSON = VO;
Q.toString = OO;
Q.unix = WO;
Q.valueOf = BO;
Q.creationData = GO;
Q.eraName = ZO;
Q.eraNarrow = JO;
Q.eraAbbr = QO;
Q.eraYear = eD;
Q.year = Fg;
Q.isLeapYear = H4;
Q.weekYear = oD;
Q.isoWeekYear = lD;
Q.quarter = Q.quarters = gD;
Q.month = Og;
Q.daysInMonth = W4;
Q.week = Q.weeks = X4;
Q.isoWeek = Q.isoWeeks = K4;
Q.weeksInYear = hD;
Q.weeksInWeekYear = uD;
Q.isoWeeksInYear = cD;
Q.isoWeeksInISOWeekYear = fD;
Q.date = Qg;
Q.day = Q.days = lk;
Q.weekday = ck;
Q.isoWeekday = fk;
Q.dayOfYear = pD;
Q.hour = Q.hours = xk;
Q.minute = Q.minutes = mD;
Q.second = Q.seconds = xD;
Q.millisecond = Q.milliseconds = ep;
Q.utcOffset = Qk;
Q.utc = tO;
Q.local = rO;
Q.parseZone = nO;
Q.hasAlignedHourOffset = iO;
Q.isDST = sO;
Q.isLocal = oO;
Q.isUtcOffset = lO;
Q.isUtc = Hg;
Q.isUTC = Hg;
Q.zoneAbbr = vD;
Q.zoneName = yD;
Q.dates = fr(
  "dates accessor is deprecated. Use date instead.",
  Qg
);
Q.months = fr(
  "months accessor is deprecated. Use month instead",
  Og
);
Q.years = fr(
  "years accessor is deprecated. Use year instead",
  Fg
);
Q.zone = fr(
  "moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",
  eO
);
Q.isDSTShifted = fr(
  "isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",
  aO
);
function wD(e) {
  return $e(e * 1e3);
}
function TD() {
  return $e.apply(null, arguments).parseZone();
}
function tp(e) {
  return e;
}
var De = Lc.prototype;
De.calendar = l4;
De.longDateFormat = u4;
De.invalidDate = g4;
De.ordinal = x4;
De.preparse = tp;
De.postformat = tp;
De.relativeTime = v4;
De.pastFuture = y4;
De.set = a4;
De.eras = XO;
De.erasParse = KO;
De.erasConvertYear = qO;
De.erasAbbrRegex = rD;
De.erasNameRegex = tD;
De.erasNarrowRegex = nD;
De.months = I4;
De.monthsShort = L4;
De.monthsParse = B4;
De.monthsRegex = z4;
De.monthsShortRegex = U4;
De.week = Y4;
De.firstDayOfYear = G4;
De.firstDayOfWeek = $4;
De.weekdays = nk;
De.weekdaysMin = sk;
De.weekdaysShort = ik;
De.weekdaysParse = ok;
De.weekdaysRegex = hk;
De.weekdaysShortRegex = uk;
De.weekdaysMinRegex = dk;
De.isPM = pk;
De.meridiem = _k;
function po(e, t, r, n) {
  var i = fn(), s = Ir().set(n, t);
  return i[r](s, e);
}
function rp(e, t, r) {
  if (on(e) && (t = e, e = void 0), e = e || "", t != null)
    return po(e, t, r, "month");
  var n, i = [];
  for (n = 0; n < 12; n++)
    i[n] = po(e, n, r, "month");
  return i;
}
function Jc(e, t, r, n) {
  typeof e == "boolean" ? (on(t) && (r = t, t = void 0), t = t || "") : (t = e, r = t, e = !1, on(t) && (r = t, t = void 0), t = t || "");
  var i = fn(), s = e ? i._week.dow : 0, a, o = [];
  if (r != null)
    return po(t, (r + s) % 7, n, "day");
  for (a = 0; a < 7; a++)
    o[a] = po(t, (a + s) % 7, n, "day");
  return o;
}
function SD(e, t) {
  return rp(e, t, "months");
}
function bD(e, t) {
  return rp(e, t, "monthsShort");
}
function ED(e, t, r) {
  return Jc(e, t, r, "weekdays");
}
function AD(e, t, r) {
  return Jc(e, t, r, "weekdaysShort");
}
function kD(e, t, r) {
  return Jc(e, t, r, "weekdaysMin");
}
Tn("en", {
  eras: [
    {
      since: "0001-01-01",
      until: 1 / 0,
      offset: 1,
      name: "Anno Domini",
      narrow: "AD",
      abbr: "AD"
    },
    {
      since: "0000-12-31",
      until: -1 / 0,
      offset: 1,
      name: "Before Christ",
      narrow: "BC",
      abbr: "BC"
    }
  ],
  dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
  ordinal: function(e) {
    var t = e % 10, r = Se(e % 100 / 10) === 1 ? "th" : t === 1 ? "st" : t === 2 ? "nd" : t === 3 ? "rd" : "th";
    return e + r;
  }
});
oe.lang = fr(
  "moment.lang is deprecated. Use moment.locale instead.",
  Tn
);
oe.langData = fr(
  "moment.langData is deprecated. Use moment.localeData instead.",
  fn
);
var zr = Math.abs;
function OD() {
  var e = this._data;
  return this._milliseconds = zr(this._milliseconds), this._days = zr(this._days), this._months = zr(this._months), e.milliseconds = zr(e.milliseconds), e.seconds = zr(e.seconds), e.minutes = zr(e.minutes), e.hours = zr(e.hours), e.months = zr(e.months), e.years = zr(e.years), this;
}
function np(e, t, r, n) {
  var i = Sr(t, r);
  return e._milliseconds += n * i._milliseconds, e._days += n * i._days, e._months += n * i._months, e._bubble();
}
function DD(e, t) {
  return np(this, e, t, 1);
}
function FD(e, t) {
  return np(this, e, t, -1);
}
function k0(e) {
  return e < 0 ? Math.floor(e) : Math.ceil(e);
}
function CD() {
  var e = this._milliseconds, t = this._days, r = this._months, n = this._data, i, s, a, o, l;
  return e >= 0 && t >= 0 && r >= 0 || e <= 0 && t <= 0 && r <= 0 || (e += k0(Gl(r) + t) * 864e5, t = 0, r = 0), n.milliseconds = e % 1e3, i = lr(e / 1e3), n.seconds = i % 60, s = lr(i / 60), n.minutes = s % 60, a = lr(s / 60), n.hours = a % 24, t += lr(a / 24), l = lr(ip(t)), r += l, t -= k0(Gl(l)), o = lr(r / 12), r %= 12, n.days = t, n.months = r, n.years = o, this;
}
function ip(e) {
  return e * 4800 / 146097;
}
function Gl(e) {
  return e * 146097 / 4800;
}
function MD(e) {
  if (!this.isValid())
    return NaN;
  var t, r, n = this._milliseconds;
  if (e = hr(e), e === "month" || e === "quarter" || e === "year")
    switch (t = this._days + n / 864e5, r = this._months + ip(t), e) {
      case "month":
        return r;
      case "quarter":
        return r / 3;
      case "year":
        return r / 12;
    }
  else
    switch (t = this._days + Math.round(Gl(this._months)), e) {
      case "week":
        return t / 7 + n / 6048e5;
      case "day":
        return t + n / 864e5;
      case "hour":
        return t * 24 + n / 36e5;
      case "minute":
        return t * 1440 + n / 6e4;
      case "second":
        return t * 86400 + n / 1e3;
      case "millisecond":
        return Math.floor(t * 864e5) + n;
      default:
        throw new Error("Unknown unit " + e);
    }
}
function PD() {
  return this.isValid() ? this._milliseconds + this._days * 864e5 + this._months % 12 * 2592e6 + Se(this._months / 12) * 31536e6 : NaN;
}
function hn(e) {
  return function() {
    return this.as(e);
  };
}
var RD = hn("ms"), ID = hn("s"), LD = hn("m"), ND = hn("h"), BD = hn("d"), WD = hn("w"), UD = hn("M"), zD = hn("Q"), HD = hn("y");
function VD() {
  return Sr(this);
}
function YD(e) {
  return e = hr(e), this.isValid() ? this[e + "s"]() : NaN;
}
function ci(e) {
  return function() {
    return this.isValid() ? this._data[e] : NaN;
  };
}
var jD = ci("milliseconds"), $D = ci("seconds"), GD = ci("minutes"), XD = ci("hours"), KD = ci("days"), qD = ci("months"), ZD = ci("years");
function JD() {
  return lr(this.days() / 7);
}
var Yr = Math.round, Ti = {
  ss: 44,
  // a few seconds to seconds
  s: 45,
  // seconds to minute
  m: 45,
  // minutes to hour
  h: 22,
  // hours to day
  d: 26,
  // days to month/week
  w: null,
  // weeks to month
  M: 11
  // months to year
};
function QD(e, t, r, n, i) {
  return i.relativeTime(t || 1, !!r, e, n);
}
function eF(e, t, r, n) {
  var i = Sr(e).abs(), s = Yr(i.as("s")), a = Yr(i.as("m")), o = Yr(i.as("h")), l = Yr(i.as("d")), c = Yr(i.as("M")), f = Yr(i.as("w")), h = Yr(i.as("y")), u = s <= r.ss && ["s", s] || s < r.s && ["ss", s] || a <= 1 && ["m"] || a < r.m && ["mm", a] || o <= 1 && ["h"] || o < r.h && ["hh", o] || l <= 1 && ["d"] || l < r.d && ["dd", l];
  return r.w != null && (u = u || f <= 1 && ["w"] || f < r.w && ["ww", f]), u = u || c <= 1 && ["M"] || c < r.M && ["MM", c] || h <= 1 && ["y"] || ["yy", h], u[2] = t, u[3] = +e > 0, u[4] = n, QD.apply(null, u);
}
function tF(e) {
  return e === void 0 ? Yr : typeof e == "function" ? (Yr = e, !0) : !1;
}
function rF(e, t) {
  return Ti[e] === void 0 ? !1 : t === void 0 ? Ti[e] : (Ti[e] = t, e === "s" && (Ti.ss = t - 1), !0);
}
function nF(e, t) {
  if (!this.isValid())
    return this.localeData().invalidDate();
  var r = !1, n = Ti, i, s;
  return typeof e == "object" && (t = e, e = !1), typeof e == "boolean" && (r = e), typeof t == "object" && (n = Object.assign({}, Ti, t), t.s != null && t.ss == null && (n.ss = t.s - 1)), i = this.localeData(), s = eF(this, !r, n, i), r && (s = i.pastFuture(+this, s)), i.postformat(s);
}
var vl = Math.abs;
function xi(e) {
  return (e > 0) - (e < 0) || +e;
}
function Ho() {
  if (!this.isValid())
    return this.localeData().invalidDate();
  var e = vl(this._milliseconds) / 1e3, t = vl(this._days), r = vl(this._months), n, i, s, a, o = this.asSeconds(), l, c, f, h;
  return o ? (n = lr(e / 60), i = lr(n / 60), e %= 60, n %= 60, s = lr(r / 12), r %= 12, a = e ? e.toFixed(3).replace(/\.?0+$/, "") : "", l = o < 0 ? "-" : "", c = xi(this._months) !== xi(o) ? "-" : "", f = xi(this._days) !== xi(o) ? "-" : "", h = xi(this._milliseconds) !== xi(o) ? "-" : "", l + "P" + (s ? c + s + "Y" : "") + (r ? c + r + "M" : "") + (t ? f + t + "D" : "") + (i || n || e ? "T" : "") + (i ? h + i + "H" : "") + (n ? h + n + "M" : "") + (e ? h + a + "S" : "")) : "P0D";
}
var Ee = Uo.prototype;
Ee.isValid = Kk;
Ee.abs = OD;
Ee.add = DD;
Ee.subtract = FD;
Ee.as = MD;
Ee.asMilliseconds = RD;
Ee.asSeconds = ID;
Ee.asMinutes = LD;
Ee.asHours = ND;
Ee.asDays = BD;
Ee.asWeeks = WD;
Ee.asMonths = UD;
Ee.asQuarters = zD;
Ee.asYears = HD;
Ee.valueOf = PD;
Ee._bubble = CD;
Ee.clone = VD;
Ee.get = YD;
Ee.milliseconds = jD;
Ee.seconds = $D;
Ee.minutes = GD;
Ee.hours = XD;
Ee.days = KD;
Ee.weeks = JD;
Ee.months = qD;
Ee.years = ZD;
Ee.humanize = nF;
Ee.toISOString = Ho;
Ee.toString = Ho;
Ee.toJSON = Ho;
Ee.locale = $g;
Ee.localeData = Xg;
Ee.toIsoString = fr(
  "toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",
  Ho
);
Ee.lang = Gg;
ue("X", 0, 0, "unix");
ue("x", 0, 0, "valueOf");
fe("x", Lo);
fe("X", E4);
We("X", function(e, t, r) {
  r._d = new Date(parseFloat(e) * 1e3);
});
We("x", function(e, t, r) {
  r._d = new Date(Se(e));
});
//! moment.js
oe.version = "2.29.4";
i4($e);
oe.fn = Q;
oe.min = jk;
oe.max = $k;
oe.now = Gk;
oe.utc = Ir;
oe.unix = wD;
oe.months = SD;
oe.isDate = qs;
oe.locale = Tn;
oe.invalid = Co;
oe.duration = Sr;
oe.isMoment = Tr;
oe.weekdays = ED;
oe.parseZone = TD;
oe.localeData = fn;
oe.isDuration = Ba;
oe.monthsShort = bD;
oe.weekdaysMin = kD;
oe.defineLocale = Yc;
oe.updateLocale = Tk;
oe.locales = Sk;
oe.weekdaysShort = AD;
oe.normalizeUnits = hr;
oe.relativeTimeRounding = tF;
oe.relativeTimeThreshold = rF;
oe.calendarFormat = _O;
oe.prototype = Q;
oe.HTML5_FMT = {
  DATETIME_LOCAL: "YYYY-MM-DDTHH:mm",
  // <input type="datetime-local" />
  DATETIME_LOCAL_SECONDS: "YYYY-MM-DDTHH:mm:ss",
  // <input type="datetime-local" step="1" />
  DATETIME_LOCAL_MS: "YYYY-MM-DDTHH:mm:ss.SSS",
  // <input type="datetime-local" step="0.001" />
  DATE: "YYYY-MM-DD",
  // <input type="date" />
  TIME: "HH:mm",
  // <input type="time" />
  TIME_SECONDS: "HH:mm:ss",
  // <input type="time" step="1" />
  TIME_MS: "HH:mm:ss.SSS",
  // <input type="time" step="0.001" />
  WEEK: "GGGG-[W]WW",
  // <input type="week" />
  MONTH: "YYYY-MM"
  // <input type="month" />
};
var iF = Object.defineProperty, sF = Object.getOwnPropertyDescriptor, st = (e, t, r, n) => {
  for (var i = n > 1 ? void 0 : n ? sF(t, r) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (i = (n ? a(t, r, i) : a(i)) || i);
  return n && i && iF(t, r, i), i;
};
let Ke = class extends ri(ei) {
  constructor() {
    super(), this.onRunTests = () => {
    }, this.pageSize = 5, this.currentPage = 1, this.pagesTestResults = [], this.totalErrors = null, this.averagePageScore = null, this.pageWithLowestScore = null, this.numberOfPagesTested = null, this.mostCommonErrors = null, this.totalViolations = null, this.totalAAAViolations = null, this.totalAAViolations = null, this.totalAViolations = null, this.totalOtherViolations = null, this.reportSummaryText = "", this.consumeContext(Ep, (e) => {
      this._notificationContext = e;
    });
  }
  connectedCallback() {
    super.connectedCallback(), this.setStats(this.results);
  }
  formatTime(e) {
    return oe(e).format(
      "HH:mm:ss"
    );
  }
  setStats(e) {
    let t = 0, r = [], n = 0, i = 0, s = 0, a = 0, o = 0, l = [];
    for (let f = 0; f < e.pages.length; f++) {
      const h = e.pages[f];
      t += h.violations.length, r = r.concat(h.violations);
      let u = 0;
      for (let d = 0; d < h.violations.length; d++) {
        const p = h.violations[d];
        switch (Dt.getWCAGLevel(p.tags)) {
          case "AAA":
            a += p.nodes.length;
            break;
          case "AA":
            s += p.nodes.length;
            break;
          case "A":
            i += p.nodes.length;
            break;
          case "Other":
            o += p.nodes.length;
            break;
        }
        n += p.nodes.length, u += p.nodes.length;
      }
      l.push({
        id: h.page.id,
        guid: h.page.guid,
        name: h.page.name,
        url: h.page.url,
        score: h.score,
        violations: u
      });
    }
    this.numberOfPagesTested = e.pages.length, this.totalErrors = t, this.totalViolations = n, this.totalAAAViolations = a, this.totalAAViolations = s, this.totalAViolations = i, this.totalOtherViolations = o, this.reportSummaryText = this.getReportSummaryText(), this.averagePageScore = this.getAveragePageScore(e.pages), this.pageWithLowestScore = this.getPageWithLowestScore(e.pages);
    const c = r.sort(Dt.sortIssuesByImpact);
    this.mostCommonErrors = this.getErrorsSortedByViolations(r).slice(0, 6), this.pagesTestResults = l.sort(this.sortPageTestResults), this.displaySeverityChart(c), this.topViolationsChart(), this.paginateResults();
  }
  getAveragePageScore(e) {
    let t = 0;
    for (let r = 0; r < e.length; r++) {
      const n = e[r];
      t += n.score;
    }
    return Math.round(t / e.length);
  }
  getPageWithLowestScore(e) {
    let t = 0, r = null;
    for (let n = 0; n < e.length; n++) {
      const i = e[n];
      if (!r) {
        t = i.score, r = i;
        continue;
      }
      i.score < t && (t = i.score, r = i);
    }
    return r;
  }
  getHighestLevelOfNonCompliance() {
    return this.totalAAAViolations !== 0 ? "AAA" : this.totalAAViolations !== 0 ? "AA" : this.totalAViolations !== 0 ? "A" : null;
  }
  getReportSummaryText() {
    const e = this.getHighestLevelOfNonCompliance();
    return e ? `This website <strong>does not</strong> comply with <strong>WCAG ${e}</strong>.` : this.totalOtherViolations !== 0 ? "High 5, you rock! No WCAG violations were found. However, some other issues were found. Please manually test your website to check full compliance." : "High 5, you rock! No WCAG violations were found. Please manually test your website to check full compliance.";
  }
  displaySeverityChart(e) {
    function t(r, n) {
      var i = 0;
      for (let s = 0; s < r.length; s++) {
        const a = r[s];
        a.impact === n && (i += a.nodes.length);
      }
      return i;
    }
    this.severityChartData = {
      labels: [
        "Critical",
        "Serious",
        "Moderate",
        "Minor"
      ],
      datasets: [{
        label: "Violations",
        data: [
          t(e, "critical"),
          t(e, "serious"),
          t(e, "moderate"),
          t(e, "minor")
        ],
        backgroundColor: [
          "rgb(120,0,0)",
          "rgb(212, 32, 84)",
          "rgb(250, 214, 52)",
          "rgb(49, 68, 142)"
        ],
        hoverOffset: 4,
        rotation: 0
      }],
      patterns: [
        "",
        "diagonal",
        "zigzag-horizontal",
        "dot"
      ]
    };
  }
  topViolationsChart() {
    this.topViolationsChartData = {
      labels: this.mostCommonErrors.map((e) => e.id.replaceAll("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (t) => t.toUpperCase())),
      datasets: [{
        label: "Violations",
        data: this.mostCommonErrors.map((e) => e.errors),
        backgroundColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(201, 203, 207, 1)"
        ]
      }]
    };
  }
  getErrorsSortedByViolations(e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      const i = e[n];
      if (!t.some((s) => s.id === i.id))
        t.push({
          id: i.id,
          errors: i.nodes.length
        });
      else {
        const s = t.findIndex((a) => a.id == i.id);
        t[s].errors += i.nodes.length;
      }
    }
    return t.sort((n, i) => i.errors - n.errors);
  }
  sortPageTestResults(e, t) {
    return e.score === t.score ? t.violations - e.violations : e.score < t.score ? -1 : e.score > t.score ? 1 : 0;
  }
  showViolationsForLevel(e) {
    for (let t = 0; t < this.config.testsToRun.length; t++) {
      const r = this.config.testsToRun[t];
      if (r.endsWith(`2${e}`) || r.endsWith(`21${e}`) || r.endsWith(`22${e}`))
        return !0;
    }
    return !1;
  }
  openDetail(e) {
    console.log(e);
  }
  getDataForPagination(e, t, r) {
    return e.slice((r - 1) * t, r * t);
  }
  paginateResults() {
    this.pagination = this.paginate(this.pagesTestResults.length, this.currentPage, this.pageSize), this.pagesTestResultsCurrentPage = this.getDataForPagination(this.pagesTestResults, this.pageSize, this.currentPage), console.log(this.pagesTestResultsCurrentPage);
  }
  changePage(e) {
    this.currentPage = e, this.paginateResults();
  }
  paginate(e, t, r) {
    let n = Math.ceil(e / r);
    return t < 1 ? t = 1 : t > n && (t = n), {
      currentPage: t,
      totalPages: n
    };
  }
  formatPageResultsForExport() {
    const e = [["Name", "URL", "Score", "Violations"]];
    for (let t = 0; t < this.pagesTestResults.length; t++) {
      const r = this.pagesTestResults[t];
      e.push([
        r.name,
        r.url,
        r.score,
        r.violations
      ]);
    }
    return e;
  }
  exportResults() {
    var e;
    if (this.results)
      try {
        const t = this.formatPageResultsForExport(), r = pl.aoa_to_sheet(t), n = pl.book_new();
        pl.book_append_sheet(n, r, "Results");
        const i = this.pagesTestResults.reduce((a, o) => Math.max(a, o.name.length), 40), s = this.pagesTestResults.reduce((a, o) => Math.max(a, o.url.length), 40);
        r["!cols"] = [{ width: i }, { width: s }, { width: 12 }, { width: 12 }], jA(
          n,
          Dt.formatFileName(`website-accessibility-report-${oe(this.results.endTime).format("DD-MM-YYYY")}`) + ".xlsx",
          { compression: !0 }
        );
      } catch (t) {
        console.error(t), (e = this._notificationContext) == null || e.peek("danger", { data: { message: "An error occurred exporting the report. Please try again later." } });
      }
  }
  render() {
    return pt`
		<uui-scroll-container>
			<div class="c-dashboard-grid">

					<uui-box class="c-dashboard-grid__full-row">
						<div slot="headline">
							<h1 class="c-title">Accessibility Report</h1>
						</div>
						<div>
							<p>${Sp(this.reportSummaryText)}</p>
							<div class="c-summary__container">
								${this.showViolationsForLevel("a") ? pt`
								<div class="c-summary ${this.totalAViolations ? "c-summary--error" : ""} ${this.totalAViolations ? "" : "c-summary--info"}">
									<div class="c-summary__circle">
										${Dt.formatNumber(this.totalAViolations || 0)}
										<span class="c-summary__title">A Issues</span>
									</div>
								</div>
								` : null}
								${this.showViolationsForLevel("aa") ? pt`
									<div class="c-summary ${this.totalAAViolations ? "c-summary--error" : ""} ${this.totalAAViolations ? "" : "c-summary--info"}">
										<div class="c-summary__circle">
											${Dt.formatNumber(this.totalAAViolations || 0)}
											<span class="c-summary__title">AA Issues</span>
										</div>
									</div>
								` : null}
								${this.showViolationsForLevel("aaa") ? pt`
									<div class="c-summary ${this.totalAAAViolations ? "c-summary--error" : ""} ${this.totalAAAViolations ? "" : "c-summary--info"}">
										<div class="c-summary__circle">
											${Dt.formatNumber(this.totalAAAViolations || 0)}
											<span class="c-summary__title">AAA Issues</span>
										</div>
									</div>
								` : null}
								<div class="c-summary ${this.totalOtherViolations ? "c-summary--error" : ""} ${this.totalOtherViolations ? "" : "c-summary--info"}">
									<div class="c-summary__circle">
										${Dt.formatNumber(this.totalOtherViolations || 0)}
										<span class="c-summary__title">Other Issues</span>
									</div>
								</div>
							</div>
							<uui-button look="primary" color="default" @click="${this.onRunTests}" label="Rerun full website accessibility tests" class="c-summary__button">Rerun tests</uui-button>
							<uui-button look="secondary" color="default" @click="${this.exportResults}" label="Export accessibility test results as an xlsx file" class="c-summary__button">Export results</uui-button>
							${this.results ? pt`<span class="c-summary__time">Started at <strong>${this.formatTime(this.results.startTime)}</strong> and ended at <strong>${this.formatTime(this.results.endTime)}</strong></span>` : null}
						</div>
					</uui-box>

					<uui-box ng-if="totalViolations">
						<div slot="headline">
							<h2 class="c-title">Total Violations</h2>
						</div>
						<p class="c-dashboard-number">${Dt.formatNumber(this.totalViolations || 0)}</p>
						<p class="c-dashboard-number__info">Across ${Dt.formatNumber(this.totalErrors || 0)} different failed tests</p>
					</uui-box>

					<uui-box ng-if="averagePageScore">
						<div slot="headline">
							<h2 class="c-title">Average Page Score</h2>
						</div>
						<div>
							<ar-score score="${this.averagePageScore || 0}" hideScoreText large></ar-score>
							<p class="c-dashboard-number__info">${Dt.formatNumber(this.numberOfPagesTested || 0)} pages tested</p>
						</div>
					</uui-box>

					<uui-box ng-if="pageWithLowestScore">
						<div slot="headline">
							<h2 class="c-title">Lowest Page Score</h2>
						</div>
						<div>
							<ar-score score="${this.pageWithLowestScore.score || 0}" hideScoreText large></ar-score>
							<p class="c-dashboard-number__info">${this.pageWithLowestScore.page.name}</p>
						</div>
					</uui-box>

					<uui-box ng-if="totalViolations">
						<div slot="headline">
							<h2 class="c-title">Violation Severity</h2>
						</div>
						<ar-chart .data="${this.severityChartData}" type="pie" width="300" height="300"></ar-chart> 
					</uui-box>

					<uui-box ng-if="totalViolations" class="c-dashboard-grid__23">
						<div slot="headline">
							<h2 class="c-title">Top Violations</h2>
						</div>
						<ar-chart .data="${this.topViolationsChartData}" type="bar" width="600" height="300"></ar-chart>
					</uui-box>

					<uui-box class="c-dashboard-grid__full-row" ng-if="pagesTestResultsCurrentPage.length">
						<div slot="headline">
							<h2 class="c-title">Pages Sorted By Lowest Score</h2>
						</div>
						<uui-table>
							<uui-table-head>
								<uui-table-head-cell>Name</uui-table-head-cell>
								<uui-table-head-cell>URL</uui-table-head-cell>
								<uui-table-head-cell>Score</uui-table-head-cell>
								<uui-table-head-cell>Violations</uui-table-head-cell>
								<uui-table-head-cell>Action</uui-table-head-cell>
							</uui-table-head>
							${this.pagesTestResultsCurrentPage.map(
      (e) => pt`<uui-table-row>
								<uui-table-cell>${e.name}</uui-table-cell>
								<uui-table-cell><a href="${e.url}" target="_blank">${e.url} <span class="sr-only">Opens in a new window</span></a></uui-table-cell>
								<uui-table-cell>${e.score}</uui-table-cell>
								<uui-table-cell>${e.violations}</uui-table-cell>
								<uui-table-cell>
									<!-- <button type="button" class="c-detail-button c-detail-button--active" @click="${this.openDetail.bind(e.id)}">
										<span class="c-detail-button__group">
											<uui-icon-registry-essential>
												<uui-icon name="see"></uui-icon>
											</uui-icon-registry-essential>
											<span class="c-detail-button__text">
												View Page
											</span>
										</span>
									</button> -->
									<a href="/section/content/workspace/document/edit/${e.guid}" class="c-detail-button c-detail-button--active">
										<span class="c-detail-button__group">
											<uui-icon-registry-essential>
												<uui-icon name="see"></uui-icon>
											</uui-icon-registry-essential>
											<span class="c-detail-button__text">
												View Page
											</span>
										</span>
									</a>
								</uui-table-cell>
							</uui-table-row>`
    )}
						</uui-table>
						<umb-pagination
							page-number="${this.pagination.currentPage}"
							total-pages="${this.pagination.totalPages}"
							on-next="${this.changePage}"
							on-prev="${this.changePage}"
							on-change="${this.changePage}"
							on-go-to-page="${this.changePage}">
						</umb-pagination>
					</uui-box>

				</div>
			</uui-scroll-container>
		`;
  }
};
Ke.styles = [
  To
];
st([
  Ut()
], Ke.prototype, "onRunTests", 2);
st([
  Ut({ attribute: !1 })
], Ke.prototype, "results", 2);
st([
  Ut({ attribute: !1 })
], Ke.prototype, "config", 2);
st([
  qe()
], Ke.prototype, "pageSize", 2);
st([
  qe()
], Ke.prototype, "currentPage", 2);
st([
  qe()
], Ke.prototype, "pagesTestResults", 2);
st([
  qe()
], Ke.prototype, "totalErrors", 2);
st([
  qe()
], Ke.prototype, "averagePageScore", 2);
st([
  qe()
], Ke.prototype, "pageWithLowestScore", 2);
st([
  qe()
], Ke.prototype, "numberOfPagesTested", 2);
st([
  qe()
], Ke.prototype, "mostCommonErrors", 2);
st([
  qe()
], Ke.prototype, "totalViolations", 2);
st([
  qe()
], Ke.prototype, "totalAAAViolations", 2);
st([
  qe()
], Ke.prototype, "totalAAViolations", 2);
st([
  qe()
], Ke.prototype, "totalAViolations", 2);
st([
  qe()
], Ke.prototype, "totalOtherViolations", 2);
st([
  qe()
], Ke.prototype, "severityChartData", 2);
st([
  qe()
], Ke.prototype, "topViolationsChartData", 2);
st([
  qe()
], Ke.prototype, "pagination", 2);
st([
  qe()
], Ke.prototype, "pagesTestResultsCurrentPage", 2);
st([
  qe()
], Ke.prototype, "reportSummaryText", 2);
Ke = st([
  ti("ar-has-results")
], Ke);
var ar = /* @__PURE__ */ ((e) => (e[e.PreTest = 0] = "PreTest", e[e.RunningTests = 1] = "RunningTests", e[e.Errored = 2] = "Errored", e[e.HasResults = 3] = "HasResults", e))(ar || {}), aF = Object.defineProperty, oF = Object.getOwnPropertyDescriptor, fi = (e, t, r, n) => {
  for (var i = n > 1 ? void 0 : n ? oF(t, r) : t, s = e.length - 1, a; s >= 0; s--)
    (a = e[s]) && (i = (n ? a(t, r, i) : a(i)) || i);
  return n && i && aF(t, r, i), i;
};
let ln = class extends ri(ei) {
  //@state()
  //private currentUser?: UmbLoggedInUser;
  //private auth?: typeof UMB_AUTH.TYPE;
  //private _notificationContext?: UmbNotificationContext;
  constructor() {
    super(), this.dashboardStorageKey = "AR.Dashboard", this.pageState = ar.PreTest, this.init();
  }
  async init() {
    this.config = await ff.getConfig(), this.loadDashboard();
  }
  // private async observeCurrentUser() {
  // 	if (!this.auth) return;
  // 	this.observe(this.auth.currentUser, (currentUser) => {
  // 		this.currentUser = currentUser;
  // 	});
  // }
  loadDashboard() {
    const e = Dt.getItemFromSessionStorage(this.dashboardStorageKey);
    e && (this.results = e, this.pageState = ar.HasResults);
  }
  async getTestUrls() {
    const e = await ff.getPages();
    return this.testPages = e, e;
  }
  async runSingleTest(e) {
    const t = new Promise(async (i, s) => {
      try {
        this.currentTestUrl = e.url;
        const a = await this.getTestResult(e.url);
        let o = this.reduceTestResult(a);
        o.score = Dt.getPageScore(o), o.page = e, i(o);
      } catch (a) {
        s(a);
      }
    }), r = this.config.apiUrl ? 3e4 : 1e4, n = new Promise((i, s) => setTimeout(() => s("Test run exceeded timeout"), r));
    return await Promise.race([t, n]);
  }
  async runTests() {
    this.pageState = ar.RunningTests, this.results = void 0, this.currentTestUrl = "", this.currentTestNumber = void 0, this.testPages = [];
    const e = /* @__PURE__ */ new Date();
    try {
      await this.getTestUrls();
    } catch (r) {
      console.error(r);
      return;
    }
    var t = [];
    for (let r = 0; r < this.testPages.length; r++) {
      const n = this.testPages[r];
      try {
        this.currentTestNumber = r + 1;
        const i = await this.runSingleTest(n);
        if (console.log(i), t.push(i), this.pageState !== ar.RunningTests)
          break;
      } catch (i) {
        console.error(i);
        continue;
      }
    }
    this.pageState === ar.RunningTests && (this.results = {
      startTime: e,
      endTime: /* @__PURE__ */ new Date(),
      pages: t
    }, Dt.saveToSessionStorage(this.dashboardStorageKey, this.results), this.pageState = ar.HasResults);
  }
  async getTestResult(e) {
    return Dt.runTest(this.shadowRoot, e, !0);
  }
  reduceTestResult(e) {
    const { inapplicable: t, incomplete: r, passes: n, testEngine: i, testEnvironment: s, testRunner: a, toolOptions: o, url: l, timestamp: c, ...f } = e;
    return f.violations = f.violations.map((h) => ({
      id: h.id,
      impact: h.impact,
      tags: h.tags,
      nodes: h.nodes.map((u) => ({
        impact: u.impact
      }))
    })), f;
  }
  stopTests() {
    this.pageState = ar.PreTest;
  }
  render() {
    if (this.pageState === ar.PreTest)
      return pt`
				<ar-pre-test .onRunTests=${this.runTests.bind(this)}></ar-pre-test>
			`;
    if (this.pageState === ar.RunningTests)
      return pt` 
				<ar-running-tests  
				.onStopTests=${this.stopTests.bind(this)}
				currentTestUrl=${this.currentTestUrl}
				currentTestNumber=${bp(this.currentTestNumber)}
				testPagesTotal=${this.testPages.length}
				> 
					<div id="dashboard-ar-tests" class="c-test-container"></div>
				</ar-running-tests>
			`;
    if (this.pageState === ar.Errored)
      return pt`
				<ar-errored .onRunTests=${this.runTests.bind(this)}></ar-errored>
			`;
    if (this.pageState === ar.HasResults && this.results)
      return console.log(this.results), pt`
				<ar-has-results 
				.onRunTests=${this.runTests.bind(this)}
				.results=${this.results}
				.config=${this.config}
				></ar-has-results>
			`;
  }
};
ln.styles = [
  To,
  Xl`
		 :host {
			display: block;
			padding: 24px;
		}
		`
];
fi([
  qe()
], ln.prototype, "config", 2);
fi([
  qe()
], ln.prototype, "pageState", 2);
fi([
  qe()
], ln.prototype, "currentTestUrl", 2);
fi([
  qe()
], ln.prototype, "results", 2);
fi([
  qe()
], ln.prototype, "currentTestNumber", 2);
fi([
  qe()
], ln.prototype, "testPages", 2);
ln = fi([
  ti("accessibility-reporter-dashboard")
], ln);
export {
  ln as AccessibilityReporterDashboardElement
};
//# sourceMappingURL=accessibility-reporter-dashboard.js.map
