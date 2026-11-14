/* util.js — shared helpers, state, and media for the TJxSHIHOUIN lab.
   Loaded first. No dependencies. */
(function () {
  'use strict';

  const LAB = (window.LAB = window.LAB || {});

  // ---- shared state ----
  LAB.experiments = [];
  LAB.state = {
    experiment: 0, // index into LAB.experiments
    project: 0,    // index into LAB.data.projects
    paused: false,
    muted: true, // videos start muted; toggle for sound
    category: 0, // index into LAB.data.categories
    chrome: true,  // "focus" mode off = chrome visible
    view: 'experiment',
  };
  LAB.registerExperiment = function (def) {
    LAB.experiments.push(def);
  };
  LAB.currentProject = function () {
    return LAB.data.projects[LAB.state.project] || null;
  };

  // ---- math / misc helpers ----
  const U = {
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    rand: (a, b) => a + Math.random() * (b - a),
    randInt: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    pick: (arr) => arr[(Math.random() * arr.length) | 0],
    // deterministic string hash (FNV-1a)
    hash: (s) => {
      let h = 2166136261;
      s = String(s);
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    },
    hsla: (h, s, l, a) =>
      'hsla(' + (((h % 360) + 360) % 360) + ',' + s + '%,' + l + '%,' + a + ')',
    hue: (t) => 'hsl(' + ((((t * 360) % 360) + 360) % 360) + ',90%,60%)',
    debounce: (fn, ms) => {
      let t;
      return function () {
        clearTimeout(t);
        const args = arguments, self = this;
        t = setTimeout(() => fn.apply(self, args), ms);
      };
    },
    isTouch: () =>
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      'ontouchstart' in window,
    el: (tag, cls, html) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (html != null) e.innerHTML = html;
      return e;
    },
    // hex (#rrggbb) -> {h,s,l}
    hexToHsl(hex) {
      const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
      let r = 0, g = 0, b = 0;
      if (m) {
        const n = parseInt(m[1], 16);
        r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255;
      }
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
      }
      return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
    },
    // accent hsl, read lazily from data.js (which loads after this file)
    accentHsl() {
      const site = (LAB.data && LAB.data.site) || {};
      return U.hexToHsl(site.accent || '#FFD1DC');
    },
    // "VEXP 0001"-style experiment code
    code(n) {
      return 'VEXP ' + String(n).padStart(4, '0');
    },
  };
  LAB.util = U;

  // ---- media loader (cached) ----
  // Returns an HTMLImageElement or HTMLVideoElement for a project, or null
  // when the project has no `src` (caller falls back to generated art).
  const mediaCache = {};
  LAB.media = function (project) {
    if (!project || !project.src) return null;
    const key = project.src;
    if (mediaCache[key]) return mediaCache[key];
    let el;
    if (project.kind === 'video') {
      el = document.createElement('video');
      el.src = project.src;
      el.muted = true;
      el.playsInline = true;
      el.preload = 'metadata';
      mediaCache[key] = el;
    } else {
      el = new Image();
      el.decoding = 'async';
      el.src = project.src;
      mediaCache[key] = el;
    }
    return el;
  };
  LAB.mediaReady = function (el) {
    if (!el) return false;
    if (el.tagName === 'VIDEO') return el.readyState >= 2;
    return el.complete && el.naturalWidth > 0;
  };
  // Draw media cover-fit into ctx; returns false when not ready.
  LAB.drawCover = function (ctx, el, w, h) {
    if (!LAB.mediaReady(el)) return false;
    const iw = el.videoWidth || el.naturalWidth;
    const ih = el.videoHeight || el.naturalHeight;
    if (!iw || !ih) return false;
    const s = Math.max(w / iw, h / ih);
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(el, (w - dw) / 2, (h - dh) / 2, dw, dh);
    return true;
  };

  // ---- generated / signal art (no-media fallback + ASCII demo source) ----
  // Animated broadcast test pattern. t in seconds.
  LAB.drawSignal = function (ctx, w, h, t, seed) {
    seed = seed == null ? 7 : seed;
    t = t || 0;
    const g = ctx.createLinearGradient(0, 0, w, h);
    const shift = Math.sin(t * 0.5) * 60;
    g.addColorStop(0, 'hsl(' + (((seed * 37 + shift) % 360) + 360) % 360 + ',80%,55%)');
    g.addColorStop(0.5, 'hsl(' + (((seed * 61 - shift) % 360) + 360) % 360 + ',85%,40%)');
    g.addColorStop(1, 'hsl(' + (((seed * 91 + shift) % 360) + 360) % 360 + ',90%,25%)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.18;
    const speed = w * 0.18;
    for (let i = -1; i < 5; i++) {
      const x = ((i * w) / 3 + (t * speed) % (w * 1.6)) - w * 0.35;
      const grd = ctx.createLinearGradient(x, 0, x + w * 0.3, h);
      grd.addColorStop(0, 'rgba(255,255,255,0)');
      grd.addColorStop(0.5, 'rgba(255,255,255,0.85)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.save();
      ctx.translate(x, 0);
      ctx.rotate(-0.4);
      ctx.fillRect(-w, -h, w * 2, h * 3);
      ctx.restore();
    }
    ctx.restore();

    const cx = w * (0.5 + 0.35 * Math.sin(t * 0.7));
    const cy = h * (0.5 + 0.3 * Math.cos(t * 0.6));
    const r = Math.min(w, h) * (0.16 + 0.04 * Math.sin(t * 1.3));
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(r, 1));
    cg.addColorStop(0, 'rgba(255,255,255,0.95)');
    cg.addColorStop(0.6, 'rgba(255,255,255,0.55)');
    cg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    const n = 32;
    const sh = h / n;
    for (let i = 0; i < n; i += 2) ctx.fillRect(0, i * sh, w, sh);
  };

  // Generated title art for a project. t in seconds.
  LAB.drawGenerated = function (ctx, project, w, h, t) {
    const id = (project && project.id) || 'signal';
    const seed = U.hash(id);
    t = t || 0;
    const g = ctx.createLinearGradient(0, 0, w, h);
    const h1 = seed % 360;
    const h2 = (h1 + 120 + 50 * Math.sin(t * 0.4)) % 360;
    g.addColorStop(0, 'hsl(' + h1 + ',70%,55%)');
    g.addColorStop(1, 'hsl(' + h2 + ',80%,28%)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#fff';
    for (let i = 0; i < 5; i++) {
      const r = (t * (10 + i * 7)) % Math.max(w, h);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r * (0.4 + i * 0.16), 0, Math.PI * 2);
      ctx.lineWidth = 1 + i;
      ctx.stroke();
    }
    ctx.restore();

    const title = ((project && project.title) || 'SIGNAL').toUpperCase();
    const size = Math.min(w, h) * 0.085;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = '800 ' + size + 'px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, w / 2, h / 2 - size * 0.55);

    ctx.font = '500 ' + size * 0.3 + 'px ui-monospace, Menlo, monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const sub = (project && project.tags && project.tags.join(' · ')) || 'EXPERIMENT';
    ctx.fillText(sub.toUpperCase(), w / 2, h / 2 + size * 0.4);
  };
})();
