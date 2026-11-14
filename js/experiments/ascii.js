/* ascii.js — the ASCII Machine. Plays the current video (cover-fit, no bars),
   reads its pixels, and renders them as characters. Sound starts muted. */
(function () {
  'use strict';
  const LAB = window.LAB;
  const U = LAB.util;

  const RAMPS = {
    DETAIL: ' .:-=+*#%@',
    MATRIX: ' .:;i1tfLCG08@',
    BLOCKS: ' ░▒▓█',
    BINARY: ' 01',
    HEX:    ' .xX#',
  };
  const CHAR_ASPECT = 0.55; // monospace glyph width:height
  const COLOR_MODES = ['pink', 'mono', 'original']; // cycle order for the COLOR button
  const MIN_TRANSITION_MS = 4000; // full 4-second rain sweep
  const MAX_TRANSITION_MS = 7000; // safety cap while a video is loading
  const CLEAR_MS = 800;           // wave sweeps down for this long before the rain stops
  const MATRIX_GLYPHS = '01<>/\\|{}[]=+-*#@$%&ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ';

  LAB.registerExperiment({
    id: 'ascii',
    name: 'ASCII Machine',
    tagline: 'Feed it pixels. It spits out characters.',
    icon: '⌗',

    create: function (host) {
      const canvas = document.createElement('canvas');
      canvas.className = 'exp-canvas';
      host.appendChild(canvas);
      const ctx = canvas.getContext('2d');

      // source sampling canvas (cols x rows)
      const src = document.createElement('canvas');
      const srcCtx = src.getContext('2d');

      // matrix-rain overlay canvas
      const rainCanvas = document.createElement('canvas');
      const rainCtx = rainCanvas.getContext('2d');

      let W = 0, H = 0;
      let running = true;
      let raf = 0;
      let lastFrame = 0;
      const start = performance.now();

      // settings
      let cols = 220; // character columns (density), capped at 300
      let rampKey = 'DETAIL';
      let colorMode = 'pink'; // pink | mono | original
      let fps = 24;
      let playingVideo = null;

      // matrix-rain transition state
      let lastProjectId = null;
      let transitioning = false;
      let transitionStart = 0;
      let transitionUntil = 0;
      let clearing = false;
      let clearStart = 0;
      let clearY = 0;
      let rainCols = [];

      // video-ended detection
      let endedCallback = null;
      let endedFired = false;

      // per-frame grid values
      let rows = 40, cellW = 1, fontSize = 14, ox = 0, oy = 0;

      // ---- control panel UI ----
      const bar = U.el('div', 'exp-controls ascii-controls');
      const rampRow = U.el('div', 'ctrl-row');
      const sliderRow = U.el('div', 'ctrl-row');
      bar.appendChild(rampRow);
      bar.appendChild(sliderRow);

      // charset / style cycle button
      const rampBtn = U.el('button', 'ctrl-btn', 'STYLE: DETAIL');
      rampBtn.addEventListener('click', () => {
        const keys = Object.keys(RAMPS);
        rampKey = keys[(keys.indexOf(rampKey) + 1) % keys.length];
        rampBtn.textContent = 'STYLE: ' + rampKey;
      });
      rampRow.appendChild(rampBtn);

      // color cycle button: Pink -> Monochrome -> Original
      const colorBtn = U.el('button', 'ctrl-btn', 'COLOR: PINK');
      colorBtn.addEventListener('click', () => {
        colorMode = COLOR_MODES[(COLOR_MODES.indexOf(colorMode) + 1) % COLOR_MODES.length];
        colorBtn.textContent = 'COLOR: ' + colorMode.toUpperCase();
        colorBtn.classList.toggle('on', colorMode !== 'pink');
      });
      rampRow.appendChild(colorBtn);

      // cols slider (density)
      const slider = U.el('input', 'ctrl-slider');
      slider.type = 'range';
      slider.min = '60';
      slider.max = '300';
      slider.value = String(cols);
      slider.addEventListener('input', () => {
        cols = Number(slider.value);
        colsLabel.textContent = 'COLS ' + cols;
      });
      const colsLabel = U.el('span', 'ctrl-label', 'COLS ' + cols);
      sliderRow.appendChild(U.el('span', 'ctrl-label', 'RES'));
      sliderRow.appendChild(slider);
      sliderRow.appendChild(colsLabel);

      // fps buttons
      const fpsRow = U.el('div', 'ctrl-row');
      bar.appendChild(fpsRow);
      const fpsBtns = {};
      [15, 24, 30].forEach((f) => {
        const b = U.el('button', 'ctrl-btn' + (f === fps ? ' on' : ''), f + 'FPS');
        b.addEventListener('click', () => {
          fps = f;
          Object.values(fpsBtns).forEach((x) => x.classList.remove('on'));
          b.classList.add('on');
        });
        fpsBtns[f] = b;
        fpsRow.appendChild(b);
      });

      host.appendChild(bar);

      // ---- helpers ----
      function computeGrid() {
        // Cover-fit: the glyph grid fills the whole canvas — no black bars.
        const screenAspect = H > 0 ? W / H : 16 / 9;
        rows = Math.max(6, Math.round((cols * CHAR_ASPECT) / screenAspect));
        fontSize = H / rows;
        cellW = fontSize * CHAR_ASPECT;
        ox = (W - cols * cellW) / 2;
        oy = 0;
      }

      function drawSourceIntoSrc(t, seed) {
        src.width = cols;
        src.height = rows;
        const m = LAB.media(LAB.currentProject());

        if (m && m.tagName === 'VIDEO') {
          // only play the current project's video; pause the previous one
          if (playingVideo !== m) {
            if (playingVideo) playingVideo.pause();
            playingVideo = m;
            if (m.ended) m.currentTime = 0; // replay a previously-finished video from the start
            endedFired = false;
          }
          if (m.paused && !m.ended) {
            m.muted = true; // ensure muted so autoplay is always allowed
            const p = m.play && m.play();
            if (p && p.catch) p.catch(function () {});
          }
          m.muted = LAB.state.muted; // apply the current sound preference

          // advance the rotation when this video has played in full
          if (m.ended && !endedFired) {
            endedFired = true;
            if (endedCallback) endedCallback();
          }
        }

        if (m && LAB.mediaReady(m)) {
          LAB.drawCover(srcCtx, m, cols, rows); // cover: crop to fill, no bars
        } else {
          // black until the video's first frame is ready (no test-pattern flash)
          srcCtx.fillStyle = '#000';
          srcCtx.fillRect(0, 0, cols, rows);
        }
      }

      function rampStr() { return RAMPS[rampKey] || RAMPS.DETAIL; }

      function resize(w, h) {
        const dpr = window.devicePixelRatio || 1;
        W = Math.round(w * dpr);
        H = Math.round(h * dpr);
        canvas.width = W;
        canvas.height = H;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        rainCanvas.width = W;
        rainCanvas.height = H;
        computeGrid();
      }

      function initRain() {
        rainCols.length = 0;
        rainCtx.globalCompositeOperation = 'source-over';
        rainCtx.fillStyle = '#000';
        rainCtx.fillRect(0, 0, W, H);
        const cell = Math.max(1, cellW);
        const n = Math.max(24, Math.floor(W / cell));
        for (let i = 0; i < n; i++) {
          rainCols.push({
            x: i * cell,
            y: U.rand(-H * 0.5, -fontSize), // start above the screen, fall all the way down
            speed: U.rand(fontSize * 1.2, fontSize * 3.0),
            len: U.randInt(4, 16),
          });
        }
      }

      function drawRain(clipY) {
        // update the rain overlay (trails fade toward black)
        rainCtx.fillStyle = 'rgba(4, 6, 10, 0.14)';
        rainCtx.fillRect(0, 0, W, H);
        rainCtx.font = fontSize + 'px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
        rainCtx.textAlign = 'left';
        rainCtx.textBaseline = 'top';
        const acc = U.accentHsl();
        for (let c = 0; c < rainCols.length; c++) {
          const col = rainCols[c];
          rainCtx.fillStyle = U.hsla(acc.h, acc.s, 92, 1);
          rainCtx.fillText(U.pick(MATRIX_GLYPHS), col.x, col.y);
          for (let k = 1; k < col.len; k++) {
            const a = Math.max(0, 1 - k / col.len);
            rainCtx.fillStyle = U.hsla(acc.h, acc.s, 72, a * 0.85);
            rainCtx.fillText(U.pick(MATRIX_GLYPHS), col.x, col.y - k * fontSize);
          }
          col.y += col.speed;
          if (col.y - col.len * fontSize > H) {
            col.y = U.rand(-H * 0.5, -fontSize);
            col.speed = U.rand(fontSize * 0.6, fontSize * 1.8);
            col.len = U.randInt(4, 16);
          }
        }
        // composite the rain additively on top of the video ASCII
        ctx.globalCompositeOperation = 'lighter';
        if (clipY != null) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, clipY, W, Math.max(0, H - clipY));
          ctx.clip();
        }
        ctx.drawImage(rainCanvas, 0, 0);
        if (clipY != null) ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
      }

      function frame(now) {
        if (!running) return;
        raf = requestAnimationFrame(frame);
        if (LAB.state.paused) return;
        if (now - lastFrame < 1000 / fps) return;
        lastFrame = now;
        const t = (now - start) / 1000;
        const seed = U.hash((LAB.currentProject() && LAB.currentProject().id) || 'signal');

        computeGrid();

        // matrix-rain transition whenever the video changes — it lasts until the
        // next video's first frame is ready (overlapping the video as it falls)
        const pid = LAB.currentProject() && LAB.currentProject().id;
        if (pid !== lastProjectId) {
          lastProjectId = pid;
          transitioning = true;
          transitionStart = now;
          transitionUntil = now + MIN_TRANSITION_MS;
          initRain();
        }
        if (transitioning) {
          const m = LAB.media(LAB.currentProject());
          const ready = m && LAB.mediaReady(m);
          if ((ready && now >= transitionUntil) || now >= transitionStart + MAX_TRANSITION_MS) {
            transitioning = false;
            clearing = true;
            clearStart = now;
            clearY = 0;
          }
        }
        if (clearing) {
          const p = (now - clearStart) / CLEAR_MS;
          if (p >= 1) { clearing = false; }
          else { clearY = p * H; }
        }

        drawSourceIntoSrc(t, seed);

        let data;
        try {
          data = srcCtx.getImageData(0, 0, cols, rows).data;
        } catch (e) {
          // Cross-origin source (e.g. file://) — render black.
          srcCtx.fillStyle = '#000';
          srcCtx.fillRect(0, 0, cols, rows);
          try {
            data = srcCtx.getImageData(0, 0, cols, rows).data;
          } catch (e2) {
            return;
          }
        }

        ctx.fillStyle = '#04060a';
        ctx.fillRect(0, 0, W, H);
        ctx.font = fontSize + 'px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const ramp = rampStr();
        const rl = ramp.length;
        const acc = U.accentHsl();

        for (let y = 0; y < rows; y++) {
          const py = oy + y * fontSize;
          for (let x = 0; x < cols; x++) {
            const i = (y * cols + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            let idx = Math.floor((lum / 255) * (rl - 1));
            idx = U.clamp(idx, 0, rl - 1);
            const ch = ramp.charAt(idx);
            if (colorMode === 'original') {
              ctx.fillStyle = 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
            } else if (colorMode === 'mono') {
              const gray = lum | 0;
              ctx.fillStyle = 'rgb(' + gray + ',' + gray + ',' + gray + ')';
            } else {
              // pink phosphor tint using the site accent hue
              ctx.fillStyle = U.hsla(acc.h, Math.min(acc.s, 60), 20 + (lum / 255) * 70, 1);
            }
            ctx.fillText(ch, ox + x * cellW, py);
          }
        }

        // overlay the falling pink rain on top of the video
        if (transitioning) drawRain(null);
        else if (clearing) drawRain(clearY);
      }

      resize(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);
      raf = requestAnimationFrame(frame);

      return {
        resize: resize,
        setOnVideoEnded: function (fn) { endedCallback = fn; },
        destroy: function () {
          running = false;
          cancelAnimationFrame(raf);
          if (playingVideo) playingVideo.pause();
          if (bar.parentNode) bar.parentNode.removeChild(bar);
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        },
        keydown: function (e) {
          const k = e.key.toLowerCase();
          switch (k) {
            case 'c': colorBtn.click(); return true;
            case 'r': rampBtn.click(); return true;
          }
          return false;
        },
      };
    },
  });
})();
