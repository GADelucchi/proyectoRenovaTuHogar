(function () {
  // ---- before/after room illustrations ----
  var scenes = {
    cocina: {
      before: '<svg class="room-svg" viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="460" fill="#ece6d6" /><g fill="none" stroke="#221e1a" stroke-width="1.5" stroke-dasharray="5 4" opacity=".7"><rect x="40" y="40" width="720" height="380" /><line x1="40" y1="40" x2="760" y2="420" /></g><rect x="90" y="260" width="260" height="120" fill="none" stroke="#4a453d" stroke-width="2" /><rect x="90" y="150" width="260" height="90" fill="none" stroke="#4a453d" stroke-width="2" /><rect x="400" y="150" width="90" height="230" fill="none" stroke="#4a453d" stroke-width="2" /><circle cx="620" cy="200" r="34" fill="none" stroke="#4a453d" stroke-width="2" /><line x1="586" y1="200" x2="654" y2="200" stroke="#4a453d" stroke-width="1.4" /><text x="90" y="415" font-family="JetBrains Mono" font-size="13" fill="#4a453d">2.30 x 3.10 m</text></svg>',
      after: '<svg class="room-svg" viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="460" fill="#221e1a" /><rect x="90" y="260" width="260" height="120" fill="#c75a16" /><rect x="90" y="150" width="260" height="90" fill="#e8834a" /><rect x="400" y="150" width="90" height="230" fill="#3c3129" stroke="#e8834a" stroke-width="1" /><circle cx="620" cy="200" r="34" fill="#ece6d6" /><rect x="470" y="330" width="270" height="14" fill="#4b5b3d" opacity=".7" /><rect x="90" y="395" width="620" height="8" fill="#4b5b3d" opacity=".5" /></svg>'
    },
    fachada: {
      before: '<svg class="room-svg" viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="460" fill="#ece6d6" /><g fill="none" stroke="#221e1a" stroke-width="1.5" stroke-dasharray="5 4" opacity=".7"><rect x="60" y="90" width="680" height="300" /></g><polygon points="60,90 400,10 740,90" fill="none" stroke="#4a453d" stroke-width="2" /><rect x="140" y="180" width="90" height="120" fill="none" stroke="#4a453d" stroke-width="2" /><rect x="330" y="150" width="140" height="90" fill="none" stroke="#4a453d" stroke-width="2" /><rect x="560" y="180" width="90" height="120" fill="none" stroke="#4a453d" stroke-width="2" /><text x="60" y="405" font-family="JetBrains Mono" font-size="13" fill="#4a453d">relevamiento — frente</text></svg>',
      after: '<svg class="room-svg" viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="460" fill="#221e1a" /><polygon points="60,90 400,10 740,90" fill="#3c3129" /><rect x="60" y="90" width="680" height="300" fill="#4b5b3d" opacity=".55" /><rect x="140" y="180" width="90" height="120" fill="#c75a16" /><rect x="330" y="150" width="140" height="90" fill="#ece6d6" /><rect x="560" y="180" width="90" height="120" fill="#c75a16" /><rect x="60" y="380" width="680" height="20" fill="#221e1a" /></svg>'
    },
    living: {
      before: '<svg class="room-svg" viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="460" fill="#ece6d6" /><g fill="none" stroke="#221e1a" stroke-width="1.5" stroke-dasharray="5 4" opacity=".7"><rect x="50" y="50" width="700" height="360" /></g><rect x="100" y="240" width="220" height="90" fill="none" stroke="#4a453d" stroke-width="2" /><rect x="380" y="120" width="160" height="200" fill="none" stroke="#4a453d" stroke-width="2" /><line x1="380" y1="220" x2="540" y2="220" stroke="#4a453d" stroke-width="1.4" /><circle cx="640" cy="270" r="26" fill="none" stroke="#4a453d" stroke-width="2" /><text x="100" y="360" font-family="JetBrains Mono" font-size="13" fill="#4a453d">4.80 x 3.60 m</text></svg>',
      after: '<svg class="room-svg" viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="460" fill="#221e1a" /><rect x="100" y="240" width="220" height="90" fill="#c75a16" /><rect x="380" y="120" width="160" height="200" fill="#ece6d6" opacity=".92" /><rect x="380" y="220" width="160" height="4" fill="#221e1a" /><circle cx="640" cy="270" r="26" fill="#e8834a" /><rect x="60" y="360" width="680" height="10" fill="#4b5b3d" opacity=".6" /></svg>'
    }
  };

  var afterEl = document.getElementById('baAfter');
  var beforeEl = document.getElementById('baBefore');
  var frame = document.getElementById('baFrame');
  var handle = document.getElementById('baHandle');
  var tabs = document.querySelectorAll('.ba-tab');
  var thumbs = document.querySelectorAll('.ba-thumb');

  function loadScene(key) {
    afterEl.innerHTML = scenes[key].after;
    beforeEl.innerHTML = '<span class="ba-corner-label">Antes — boceto</span>' + scenes[key].before;
    tabs.forEach(function (t) { t.classList.toggle('active', t.dataset.project === key); });
    thumbs.forEach(function (t) { t.classList.toggle('active', t.dataset.project === key); });
  }
  loadScene('cocina');

  tabs.forEach(function (t) { t.addEventListener('click', function () { loadScene(t.dataset.project); setPos(50); }); });
  thumbs.forEach(function (t) { t.addEventListener('click', function () { loadScene(t.dataset.project); setPos(50); }); });

  function setPos(pct) {
    pct = Math.max(4, Math.min(96, pct));
    beforeEl.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
    handle.style.left = pct + '%';
  }

  var dragging = false;
  function posFromEvent(e) {
    var rect = frame.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    return (x / rect.width) * 100;
  }
  handle.addEventListener('mousedown', function () { dragging = true; });
  frame.addEventListener('mousedown', function (e) { dragging = true; setPos(posFromEvent(e)); });
  window.addEventListener('mousemove', function (e) { if (dragging) setPos(posFromEvent(e)); });
  window.addEventListener('mouseup', function () { dragging = false; });

  handle.addEventListener('touchstart', function () { dragging = true; }, { passive: true });
  frame.addEventListener('touchstart', function (e) { dragging = true; setPos(posFromEvent(e)); }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (dragging) setPos(posFromEvent(e)); }, { passive: true });
  window.addEventListener('touchend', function () { dragging = false; });

  setPos(50);
})();