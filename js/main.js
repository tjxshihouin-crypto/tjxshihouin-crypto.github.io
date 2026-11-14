/* main.js — home compilation: the ASCII machine plays your videos full-page in
   random order, with a top social bar and bottom-right controls. */
(function () {
  'use strict';
  const LAB = window.LAB;
  const U = LAB.util;
  const ui = LAB.ui;

  const stage = document.getElementById('stage');
  const FALLBACK_MS = 300000; // safety: advance if a video never ends (5 min)

  let asciiApi = null;
  let fallbackTimer = null;

  // ---- hash routing ----
  function buildHash() {
    const proj = LAB.currentProject();
    return '#' + (proj ? proj.id : 'x');
  }
  function shareUrl() {
    return location.href.split('#')[0] + buildHash();
  }
  function applyHash() {
    try {
      if (history.replaceState) history.replaceState(null, '', buildHash());
    } catch (e) { /* file:// etc. */ }
  }

  // ---- auto-shuffle: advance when each video plays in full ----
  function randomProject() {
    const n = LAB.data.projects.length;
    if (n <= 1) return 0;
    let i;
    do { i = Math.floor(Math.random() * n); } while (i === LAB.state.project);
    return i;
  }
  function scheduleFallback() {
    if (fallbackTimer) clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(function () {
      if (!LAB.state.paused) enterProject(randomProject());
    }, FALLBACK_MS);
  }
  function advance() {
    if (LAB.state.paused) return;
    enterProject(randomProject());
  }

  // ---- projects ----
  function stageSize() {
    return {
      w: stage.clientWidth || window.innerWidth,
      h: stage.clientHeight || window.innerHeight,
    };
  }
  function enterProject(i) {
    i = U.clamp(i, 0, LAB.data.projects.length - 1);
    LAB.state.project = i;
    ui.render();
    applyHash();
    scheduleFallback(); // reset the safety timer on any change
  }
  function switchProject(dir) {
    const n = LAB.data.projects.length;
    enterProject((LAB.state.project + dir + n) % n);
  }
  function switchCategory(dir) {
    const n = LAB.data.categories.length;
    LAB.state.category = (LAB.state.category + dir + n) % n;
    ui.renderCategories();
  }

  // ---- toggles ----
  function togglePause() {
    LAB.state.paused = !LAB.state.paused;
    ui.render();
  }
  function toggleSound() {
    LAB.state.muted = !LAB.state.muted;
    ui.render();
  }
  function toggleFocus() {
    ui.setFocus(!LAB.state.chrome);
  }
  function toggleHelp() {
    if (ui.isModalOpen('help')) ui.closeModals();
    else { ui.closeModals(); ui.openModal('help'); }
  }
  function toggleShare() {
    if (ui.isModalOpen('share')) ui.closeModals();
    else {
      ui.closeModals();
      ui.setShareUrl(shareUrl());
      ui.openModal('share');
    }
  }
  function copyShare() {
    const u = ui.els.shareUrl.value;
    const ok = () => ui.setShareHint('COPIED ✓');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(u).then(ok, () => fallbackCopy(ok));
    } else {
      fallbackCopy(ok);
    }
  }
  function fallbackCopy(ok) {
    const inp = ui.els.shareUrl;
    inp.focus();
    inp.select();
    try { document.execCommand('copy'); ok(); }
    catch (e) { ui.setShareHint('COPY FAILED'); }
  }

  // ---- UI actions ----
  ui.onAction = function (action, idx) {
    switch (action) {
      case 'select-project': enterProject(idx); break;
      case 'next-proj': switchProject(1); break;
      case 'prev-proj': switchProject(-1); break;
      case 'next-cat': switchCategory(1); break;
      case 'prev-cat': switchCategory(-1); break;
      case 'share': toggleShare(); break;
      case 'help': toggleHelp(); break;
      case 'copy': copyShare(); break;
      case 'focus': toggleFocus(); break;
      case 'pause': togglePause(); break;
      case 'sound': toggleSound(); break;
    }
  };

  // ---- keyboard ----
  function onKey(e) {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      if (e.key === 'Escape') { e.target.blur(); ui.closeModals(); }
      return;
    }

    if (e.key === 'Escape') {
      if (ui.isModalOpen('help') || ui.isModalOpen('share')) {
        ui.closeModals();
        return;
      }
      toggleHelp();
      return;
    }

    const k = e.key.toLowerCase();

    // let the ASCII machine handle its own keys first
    if (asciiApi && asciiApi.keydown && asciiApi.keydown(e)) return;

    switch (k) {
      case 'arrowdown': case 'j': switchProject(1); break;
      case 'arrowup': case 'k': switchProject(-1); break;
      case 'arrowleft': switchCategory(-1); break;
      case 'arrowright': switchCategory(1); break;
      case 'f': toggleFocus(); break;
      case 'p': case ' ': e.preventDefault(); togglePause(); break;
      case 'm': toggleSound(); break;
      case 'h': toggleHelp(); break;
      case 's': toggleShare(); break;
    }
  }

  // ---- resize ----
  function onResize() {
    if (asciiApi && asciiApi.resize) {
      const s = stageSize();
      asciiApi.resize(s.w, s.h);
    }
  }

  // ---- load hash ----
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    if (h) {
      const pi = LAB.data.projects.findIndex((p) => p.id === h);
      if (pi >= 0) LAB.state.project = pi;
    }
  }

  // ---- boot ----
  function boot() {
    ui.init();
    parseHash();
    const ascii = LAB.experiments.find((e) => e.id === 'ascii') || LAB.experiments[0];
    asciiApi = ascii.create(stage);
    const s = stageSize();
    asciiApi.resize(s.w, s.h);
    ui.render();
    applyHash();
    asciiApi.setOnVideoEnded(advance);
    scheduleFallback();
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', U.debounce(onResize, 120));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
