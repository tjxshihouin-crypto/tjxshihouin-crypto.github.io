/* ui.js — builds the single info panel (box) overlaid on the ASCII machine,
   the fun-project popover, and the modals. */
(function () {
  'use strict';
  const LAB = window.LAB;
  const U = LAB.util;

  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

  const ui = {
    onAction: function () {}, // overridden by main.js
    els: {},
  };
  LAB.ui = ui;

  function makeSocialLink(l) {
    const a = U.el('a', 'tb-link', esc(l.label));
    a.href = l.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = l.label;
    return a;
  }

  // ---- info panel (single box, overlaid on the ASCII) ----
  function buildPanel() {
    const site = LAB.data.site;
    const panel = U.el('aside');
    panel.id = 'panel';

    // profile
    const avatar = U.el('img', 'panel-avatar');
    avatar.src = site.avatar;
    avatar.alt = site.name;
    panel.appendChild(avatar);

    panel.appendChild(U.el('div', 'panel-name', esc(site.name)));
    panel.appendChild(U.el('div', 'panel-role', esc(site.role)));
    panel.appendChild(U.el('div', 'panel-loc', '📍 ' + esc(site.location)));

    const chips = U.el('div', 'panel-chips');
    site.bio.forEach((b) => chips.appendChild(U.el('span', 'chip', esc(b))));
    panel.appendChild(chips);

    const links = U.el('div', 'panel-links');
    site.links.forEach((l) => links.appendChild(makeSocialLink(l)));
    panel.appendChild(links);

    // capabilities carousel
    const cat = U.el('div', 'panel-cat');
    const head = U.el('div', 'cat-head');
    head.appendChild(U.el('div', 'cat-title', 'Capabilities'));
    const nav = U.el('div', 'cat-nav');
    const prev = U.el('button', 'cat-arrow', '←');
    prev.setAttribute('data-action', 'prev-cat');
    prev.title = 'Previous';
    const label = U.el('span', 'cat-label');
    const next = U.el('button', 'cat-arrow', '→');
    next.setAttribute('data-action', 'next-cat');
    next.title = 'Next';
    nav.appendChild(prev);
    nav.appendChild(label);
    nav.appendChild(next);
    head.appendChild(nav);
    cat.appendChild(head);
    const items = U.el('div', 'cat-items');
    cat.appendChild(items);
    panel.appendChild(cat);
    ui.els.catLabel = label;
    ui.els.catItems = items;

    // footer: actions
    const foot = U.el('div', 'panel-foot');
    const actions = U.el('div', 'panel-actions');
    const fs = U.el('button', 'ctl-btn', 'F');
    fs.setAttribute('data-action', 'focus');
    fs.title = 'Fullscreen (F)';
    const sound = U.el('button', 'ctl-btn', 'SOUND: OFF');
    sound.setAttribute('data-action', 'sound');
    sound.title = 'Sound (M)';
    const share = U.el('button', 'ctl-btn', 'SHARE');
    share.setAttribute('data-action', 'share');
    actions.appendChild(fs);
    actions.appendChild(sound);
    actions.appendChild(share);
    foot.appendChild(actions);
    panel.appendChild(foot);

    document.body.appendChild(panel);
    ui.els.soundBtn = sound;
  }

  function renderCategories() {
    hidePopover(); // close any open project description when the slide changes
    const cat = LAB.data.categories[LAB.state.category];
    if (!cat) return;
    ui.els.catLabel.textContent = cat.name;
    ui.els.catItems.innerHTML = '';
    cat.items.forEach((it, i) => {
      const fun = cat.id === 'fun';
      const card = U.el('div', 'cat-card' + (fun ? ' fun' : ''));
      card.appendChild(U.el('div', 'cat-card-name', esc(it.name)));
      if (it.note) card.appendChild(U.el('div', 'cat-card-note', esc(it.note)));
      if (fun) {
        card.appendChild(U.el('div', 'cat-card-more', 'CLICK FOR INFO'));
        card.setAttribute('data-action', 'fun-project');
        card.setAttribute('data-idx', String(i));
      }
      ui.els.catItems.appendChild(card);
    });
  }

  // ---- fun project popover ----
  function buildPopover() {
    const pop = U.el('div', 'popover hidden');
    document.body.appendChild(pop);
    ui.els.popover = pop;
  }
  function showPopover(item, el) {
    const pop = ui.els.popover;
    pop.innerHTML = '';
    pop.appendChild(U.el('div', 'popover-title', esc(item.name)));
    if (item.desc) pop.appendChild(U.el('div', null, esc(item.desc)));
    pop.classList.remove('hidden');
    const r = el.getBoundingClientRect();
    const left = Math.max(12, Math.min(window.innerWidth - 300, r.left));
    let top = r.bottom + 12;
    if (top + 140 > window.innerHeight) top = r.top - 150;
    pop.style.left = left + 'px';
    pop.style.top = Math.max(12, top) + 'px';
  }
  function hidePopover() {
    ui.els.popover.classList.add('hidden');
  }

  function render() {
    ui.els.soundBtn.textContent = LAB.state.muted ? 'SOUND: OFF' : 'SOUND: ON';
    ui.els.soundBtn.classList.toggle('on', !LAB.state.muted);
    document.body.classList.toggle('paused', LAB.state.paused);
  }

  // ---- modals ----
  function buildOverlays() {
    const site = LAB.data.site;

    // DevRel / About
    const help = document.getElementById('help');
    help.innerHTML = '';
    const hd = U.el('div', 'modal-head');
    hd.appendChild(U.el('div', 'modal-title', 'DEVREL'));
    const close = U.el('button', 'modal-close', 'Esc');
    close.setAttribute('data-action', 'help');
    hd.appendChild(close);
    help.appendChild(hd);
    const hb = U.el('div', 'modal-body');
    hb.appendChild(U.el('div', 'about-name', esc(site.fullName || site.name)));
    hb.appendChild(U.el('div', 'about-tagline', esc(site.role)));
    hb.appendChild(U.el('div', 'about-role', esc(site.location)));
    const rows = [
      ['← →', 'category'],
      ['↑ ↓', 'video'],
      ['F', 'fullscreen (hide the box)'],
      ['P', 'pause / resume'],
      ['M', 'sound on / off'],
      ['S', 'share'],
    ];
    rows.forEach((r) => {
      const row = U.el('div', 'key-row');
      row.appendChild(U.el('span', 'key', r[0]));
      row.appendChild(U.el('span', 'key-desc', r[1]));
      hb.appendChild(row);
    });
    help.appendChild(hb);

    // Share
    const share = document.getElementById('share');
    share.innerHTML = '';
    const sd = U.el('div', 'modal-head');
    sd.appendChild(U.el('div', 'modal-title', 'SHARE'));
    const sclose = U.el('button', 'modal-close', 'Esc');
    sclose.setAttribute('data-action', 'share');
    sd.appendChild(sclose);
    share.appendChild(sd);
    const sb = U.el('div', 'modal-body');
    const url = U.el('input', 'share-url');
    url.readOnly = true;
    const copy = U.el('button', 'share-copy', 'COPY LINK');
    copy.setAttribute('data-action', 'copy');
    const hint = U.el('span', 'share-hint');
    sb.appendChild(url);
    sb.appendChild(copy);
    sb.appendChild(hint);
    share.appendChild(sb);
    ui.els.shareUrl = url;
    ui.els.shareCopy = copy;
    ui.els.shareHint = hint;
  }

  // ---- state helpers ----
  function setFocus(on) {
    LAB.state.chrome = on;
    document.body.classList.toggle('focus', !on);
  }
  function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.body.classList.add('modal-open');
  }
  function closeModals() {
    ['help', 'share'].forEach((id) => document.getElementById(id).classList.add('hidden'));
    document.body.classList.remove('modal-open');
  }
  function isModalOpen(id) {
    return !document.getElementById(id).classList.contains('hidden');
  }

  // ---- click delegation ----
  function onDocClick(e) {
    const el = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
    if (el && el.getAttribute('data-action') === 'fun-project') {
      const idx = Number(el.getAttribute('data-idx'));
      const cat = LAB.data.categories[LAB.state.category];
      const item = cat && cat.items[idx];
      if (item) showPopover(item, el);
      return;
    }
    hidePopover();
    if (!el) return;
    const action = el.getAttribute('data-action');
    const idx = el.getAttribute('data-idx');
    ui.onAction(action, idx ? Number(idx) : undefined, el);
  }

  // ---- init ----
  ui.init = function () {
    document.documentElement.style.setProperty('--accent', (LAB.data.site && LAB.data.site.accent) || '#FFD1DC');
    buildPanel();
    buildPopover();
    buildOverlays();
    document.addEventListener('click', onDocClick);
    renderCategories();
    render();
  };

  ui.render = render;
  ui.renderCategories = renderCategories;
  ui.setFocus = setFocus;
  ui.openModal = openModal;
  ui.closeModals = closeModals;
  ui.isModalOpen = isModalOpen;
  ui.setShareUrl = function (u) { ui.els.shareUrl.value = u; ui.els.shareHint.textContent = ''; };
  ui.setShareHint = function (msg) { ui.els.shareHint.textContent = msg; };
})();
