// Whack-a-mole rewrite. Self-contained: no globals shared with script.js.
// Key layout (xPct/yPct) was measured directly off images/bg_mole1.png (1866x1114)
// by locating each keycap's pixel center, then converting to % of image size.
(function () {
  'use strict';

  var ROWS = [
    { yPct: 53.41, xs: [17.01, 23.63, 30.28, 36.87, 43.48, 54.29, 60.93, 67.58, 74.22, 80.86], letters: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'] },
    { yPct: 64.72, xs: [18.65, 25.24, 31.83, 38.37, 44.96, 55.95, 62.59, 69.24, 75.86, 82.49], letters: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'] },
    { yPct: 75.94, xs: [21.60, 28.19, 34.73, 41.34, 47.93, 58.68, 65.27, 71.87, 78.29], letters: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'] }
  ];

  var KEYS = [];
  ROWS.forEach(function (row, rIdx) {
    row.xs.forEach(function (xPct, cIdx) {
      KEYS.push({ row: rIdx + 1, col: cIdx + 1, letter: row.letters[cIdx], xPct: xPct, yPct: row.yPct });
    });
  });

  // Each sprite folder was exported with its own canvas registration (measured by
  // diffing non-transparent bounding boxes across frames), so every animation needs
  // its own anchor fraction to land on the same screen spot. fx/fy = the point within
  // the 500x500 frame (as % of width/height) that should sit exactly on the key center.
  var ANCHORS = {
    up_gif: { fx: 49.1, fy: 56.7 },
    down_gif: { fx: 49.1, fy: 56.7 },
    hit_gif: { fx: 39.5, fy: 75.9 },
    nohit_gif: { fx: 49.1, fy: 56.7 }
  };

  var SCORE_POS = {
    prog: { xPct: 17.90, yPct: 11.94 },
    whack: { xPct: 17.90, yPct: 16.70 },
    missed: { xPct: 17.90, yPct: 21.54 },
    swing: { xPct: 17.90, yPct: 26.48 }
  };

  // ---- copy lives here so it's easy to edit/translate later ----
  var INTRO_SLIDES = [
    { image: './images/fingers.png', text: 'यह उँगलियों की सही स्थिति है।\nअब से अंत तक कृपया इस स्थिति को अवश्य बनाए रखें!' },
    { image: './images/fingers2.png', text: 'प्रत्येक उंगली को लंबवत दिशा में केवल एक ही कॉलम का ध्यान रखना चाहिए।\nअब अपनी प्रत्येक उंगली को ऊपर-नीचे पर्याप्त रूप से हिलाकर देखें।' }
  ];

  var STAGES = [
    {
      columns: [2, 3, 4, 7, 8, 9],
      moleCount: 40,
      waitMode: 'infinite',
      hideDelayMs: 0,
      title: 'चरण 1',
      text: 'पहले केवल तर्जनी, मध्यमा और अनामिका से छुछूंदर पकड़ते हैं।\nस्थिति के अनुसार सही उँगली का प्रयोग करें।'
    },
    {
      columns: [1, 2, 3, 4, 7, 8, 9, 10],
      moleCount: 40,
      waitMode: 'timeout',
      hideDelayMs: 900,
      passThreshold: 0.8,
      title: 'चरण 2',
      text: 'कनिष्ठा से भी तिलचट्टे पकड़ते हैं।\nअब से तिलचट्टे के छिपने से पहले ही उसे पकड़ना होगा!'
    },
    {
      columns: [4, 5, 6, 7],
      moleCount: 40,
      waitMode: 'timeout',
      hideDelayMs: 900,
      passThreshold: 0.8,
      title: 'चरण 3',
      image: './images/fingers3.png',
      text: 'अब हम लगभग पहुँच चुके हैं।\nबीच की दो पंक्तियाँ तर्जनी को अंदर की ओर बढ़ाकर टाइप की जाती हैं।\nउँगली आगे बढ़ाने के बाद हमेशा अपनी मूल स्थिति में वापस आना चाहिए।'
    },
    {
      columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      moleCount: 40,
      waitMode: 'timeout',
      hideDelayMs: 900,
      passThreshold: 0.8,
      title: 'चरण 4',
      text: 'चलिए, अब यह अंतिम चरण है।\nतिलचट्टे सभी क्षेत्रों से बाहर आ रहे हैं।\nउँगलियों की स्थिति सही रखें और शुरू करें!'
    }
  ];

  STAGES.forEach(function (stage) {
    stage.pool = KEYS.filter(function (k) { return stage.columns.indexOf(k.col) !== -1; });
  });

  var SCREENS = [];
  INTRO_SLIDES.forEach(function (s) { SCREENS.push({ type: 'slide', image: s.image, text: s.text }); });
  STAGES.forEach(function (stage, i) {
    SCREENS.push({ type: 'stageIntro', stage: i });
    SCREENS.push({ type: 'game', stage: i });
  });
  SCREENS.push({ type: 'success' });

  var TOTAL_MOLES = STAGES.reduce(function (a, s) { return a + s.moleCount; }, 0);

  // ---- DOM refs (filled on init) ----
  var slideOverlay, slideTitleEl, slideImgEl, slideTextEl, spaceHintEl;
  var gameScreen, moleLayer;
  var scoreEls = {};
  var successOverlay;
  var sndHammer, sndPong;

  var screenIdx = -1;
  var score = { prog: 0, whack: 0, missed: 0, swing: 0 };
  var game = null; // active stage runtime state

  function setAnchor(imgEl, folder) {
    var a = ANCHORS[folder];
    imgEl.style.transform = 'translate(-' + a.fx + '%, -' + a.fy + '%)';
  }

  // mole (optional) gets its running interval id stashed on it so a hit that
  // interrupts a retreat-in-progress can cancel this animation cleanly.
  function playFrames(imgEl, folder, count, fps, mole) {
    setAnchor(imgEl, folder);
    return new Promise(function (resolve) {
      var i = 0;
      var id = setInterval(function () {
        imgEl.src = './images/mole/' + folder + '/Frame' + i + '.png';
        i++;
        if (i >= count) { clearInterval(id); if (mole) mole.animId = null; resolve(); }
      }, Math.round(1000 / fps));
      if (mole) mole.animId = id;
    });
  }

  function updateScoreUI() {
    scoreEls.prog.textContent = score.prog + '/' + TOTAL_MOLES;
    scoreEls.whack.textContent = String(score.whack);
    scoreEls.missed.textContent = String(score.missed);
    scoreEls.swing.textContent = String(score.swing);
  }

  function playSound(audio) {
    try { audio.currentTime = 0; audio.play().catch(function () {}); } catch (_) {}
  }

  // ---- typewriter effect for slide/stageIntro copy, matching tutorial.html's feel ----
  var audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  function playTick() {
    if (!audioCtx) return;
    var t = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1150 + Math.random() * 220;
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.05);
  }

  var TYPE_DELAY = 42;
  var typewriterTimer = null;
  var slideTypingDone = false;
  var slideAdvanceReady = false;
  var slideRawText = '';
  var slideOnDone = null;

  function finishTyping() {
    typewriterTimer = null;
    slideTypingDone = true;
    if (slideOnDone) slideOnDone();
  }

  // The whole final text (every character span, every <br>) is laid out up front so
  // the browser computes each line's centered position exactly once - characters then
  // just fade in over that fixed layout, left to right, instead of being appended one
  // at a time (which would keep re-centering the growing line as it's typed).
  function typeText(el, text, onDone) {
    clearTimeout(typewriterTimer);
    el.innerHTML = '';
    slideRawText = text;
    slideTypingDone = false;
    slideOnDone = onDone;
    var spans = [];
    text.split('').forEach(function (ch) {
      if (ch === '\n') { el.appendChild(document.createElement('br')); return; }
      var span = document.createElement('span');
      span.textContent = ch;
      span.style.opacity = '0';
      el.appendChild(span);
      spans.push(span);
    });
    var i = 0;
    function step() {
      if (i >= spans.length) { finishTyping(); return; }
      spans[i].style.opacity = '1';
      if (spans[i].textContent.trim()) playTick();
      i++;
      typewriterTimer = setTimeout(step, TYPE_DELAY);
    }
    step();
  }

  function completeTyping(el) {
    clearTimeout(typewriterTimer);
    var spans = el.querySelectorAll('span');
    for (var i = 0; i < spans.length; i++) spans[i].style.opacity = '1';
    finishTyping();
  }

  function pickKey(pool) {
    if (pool.length === 1) return pool[0];
    var key;
    do { key = pool[Math.floor(Math.random() * pool.length)]; } while (key === game.lastKey);
    game.lastKey = key;
    return key;
  }

  function startStage(stageIdx) {
    var stage = STAGES[stageIdx];
    moleLayer.innerHTML = '';
    game = { stage: stage, spawned: 0, active: null, lastKey: null, stageWhack: 0, stageMissed: 0 };
    setTimeout(spawnMole, 700); // brief beat before the stage's first mole pops up
  }

  function spawnMole() {
    var stage = game.stage;
    if (game.spawned >= stage.moleCount) { finishStage(); return; }
    game.spawned++;
    var key = pickKey(stage.pool);
    var el = document.createElement('img');
    el.className = 'moleSprite';
    el.style.left = key.xPct + '%';
    el.style.top = key.yPct + '%';
    moleLayer.appendChild(el);
    var mole = { key: key, el: el, resolved: false, timer: null, animId: null };
    game.active = mole;
    playSound(sndPong); // appear sound - fires the moment the mole pops up
    playFrames(el, 'up_gif', 10, 20, mole).then(function () {
      if (mole.resolved) return;
      el.src = './images/mole/up_gif/Frame9.png';
      if (stage.waitMode === 'timeout') {
        mole.timer = setTimeout(function () { onTimeout(mole); }, stage.hideDelayMs);
      }
    });
  }

  function resolveMole(mole) {
    mole.resolved = true;
    if (mole.timer) clearTimeout(mole.timer);
    if (mole.animId) { clearInterval(mole.animId); mole.animId = null; }
    if (game.active === mole) game.active = null;
  }

  function onHit(mole) {
    resolveMole(mole);
    score.whack++; score.prog++;
    game.stageWhack++;
    updateScoreUI();
    playSound(sndHammer);
    playFrames(mole.el, 'hit_gif', 14, 40).then(function () {
      mole.el.remove();
      spawnMole();
    });
  }

  function onTimeout(mole) {
    // starts the retreat but doesn't resolve the mole yet - a correct key
    // pressed mid-retreat still lands as a hit (see handleGameKey/onHit),
    // it only counts as missed if the retreat finishes uncaught.
    playFrames(mole.el, 'down_gif', 14, 24, mole).then(function () {
      if (mole.resolved) return;
      resolveMole(mole);
      score.missed++; score.prog++;
      game.stageMissed++;
      updateScoreUI();
      mole.el.remove();
      spawnMole();
    });
  }

  function onMiss(pressedKey) {
    score.swing++;
    updateScoreUI();
    playSound(sndHammer);
    // swing lands wherever the player actually pressed, not on the mole -
    // the mole itself is untouched so its position never moves
    var fx = document.createElement('img');
    fx.className = 'moleSprite';
    fx.style.left = pressedKey.xPct + '%';
    fx.style.top = pressedKey.yPct + '%';
    moleLayer.appendChild(fx);
    playFrames(fx, 'nohit_gif', 10, 20).then(function () { fx.remove(); });
  }

  var awaitingRetry = false;
  var retryStageIdx = null;

  function finishStage() {
    var stage = game.stage;
    var stageIdx = SCREENS[screenIdx].stage;
    var rate = stage.moleCount > 0 ? game.stageWhack / stage.moleCount : 1;
    if (stage.passThreshold != null && rate < stage.passThreshold) {
      // this attempt didn't count - undo its contribution so Prog/Whack/Missed
      // read the same as if it never happened, then replay the same stage
      score.prog -= game.spawned;
      score.whack -= game.stageWhack;
      score.missed -= game.stageMissed;
      updateScoreUI();
      setTimeout(function () { showFail(stage, stageIdx); }, 500);
    } else {
      setTimeout(nextScreen, 500);
    }
  }

  function showFail(stage, stageIdx) {
    retryStageIdx = stageIdx;
    awaitingRetry = true;
    gameScreen.style.display = 'none';
    var pct = Math.round(stage.passThreshold * 100);
    renderSlide({
      title: stage.title + ' — फिर से प्रयास',
      text: 'अफ़सोस! उत्तीर्ण होने के लिए कम से कम ' + pct + '% तिलचट्टे पकड़ने ज़रूरी हैं।\nचलिए इस चरण को फिर से आज़माते हैं!',
      image: null
    });
    slideOverlay.style.display = 'flex';
  }

  function handleGameKey(e) {
    var mole = game && game.active;
    if (!mole || mole.resolved) return;
    var k = e.key.toLowerCase();
    var pressedKey = KEYS.filter(function (kk) { return kk.letter === k; })[0];
    if (!pressedKey) return; // not a board key (Shift, Enter, etc.) - ignore entirely
    e.preventDefault();
    if (pressedKey.letter === mole.key.letter) onHit(mole);
    else onMiss(pressedKey);
  }

  function renderSlide(screen) {
    var title = screen.title || '', text = screen.text, image = screen.image || null;
    if (screen.type === 'stageIntro') {
      var stage = STAGES[screen.stage];
      title = stage.title; text = stage.text; image = stage.image || null;
    }
    slideTitleEl.style.display = title ? 'block' : 'none';
    slideTitleEl.textContent = title;
    slideImgEl.style.display = image ? 'block' : 'none';
    if (image) slideImgEl.src = image;

    slideAdvanceReady = false;
    spaceHintEl.classList.remove('show');
    typeText(slideTextEl, text, function () {
      setTimeout(function () {
        slideAdvanceReady = true;
        spaceHintEl.classList.add('show');
      }, 400);
    });
  }

  function showScreen(idx) {
    screenIdx = idx;
    var screen = SCREENS[idx];
    slideOverlay.style.display = 'none';
    gameScreen.style.display = 'none';
    successOverlay.style.display = 'none';
    if (screen.type === 'slide' || screen.type === 'stageIntro') {
      renderSlide(screen);
      slideOverlay.style.display = 'flex';
    } else if (screen.type === 'game') {
      gameScreen.style.display = 'block';
      startStage(screen.stage);
    } else if (screen.type === 'success') {
      successOverlay.style.display = 'flex';
    }
  }

  function nextScreen() {
    if (screenIdx + 1 < SCREENS.length) showScreen(screenIdx + 1);
  }

  function onKeyDown(e) {
    ensureAudio(); // first real keydown doubles as the user gesture that unlocks audio
    if (awaitingRetry) {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (!slideTypingDone) { completeTyping(slideTextEl); return; }
        if (slideAdvanceReady) {
          awaitingRetry = false;
          slideOverlay.style.display = 'none';
          gameScreen.style.display = 'block';
          startStage(retryStageIdx);
        }
      }
      return;
    }
    var screen = SCREENS[screenIdx];
    if (!screen) return;
    if (screen.type === 'slide' || screen.type === 'stageIntro') {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (!slideTypingDone) { completeTyping(slideTextEl); return; }
        if (slideAdvanceReady) nextScreen();
      }
      return;
    }
    if (screen.type === 'game') { handleGameKey(e); return; }
    if (screen.type === 'success') {
      if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); goToDemo(); }
    }
  }

  function goToDemo() {
    window.location.href = 'tutorial.html';
  }

  function init() {
    slideOverlay = document.getElementById('slideOverlay');
    slideTitleEl = document.getElementById('slideTitle');
    slideImgEl = document.getElementById('slideImg');
    slideTextEl = document.getElementById('slideText');
    spaceHintEl = document.getElementById('spaceHint');
    gameScreen = document.getElementById('gameScreen');
    moleLayer = document.getElementById('moleLayer');
    successOverlay = document.getElementById('successOverlay');
    sndHammer = document.getElementById('sndHammer');
    sndPong = document.getElementById('sndPong');

    ['prog', 'whack', 'missed', 'swing'].forEach(function (k) {
      var el = document.getElementById('score-' + k);
      el.style.left = SCORE_POS[k].xPct + '%';
      el.style.top = SCORE_POS[k].yPct + '%';
      scoreEls[k] = el;
    });

    var goDemoBtn = document.getElementById('goDemoBtn');
    if (goDemoBtn) goDemoBtn.addEventListener('click', goToDemo);

    var homeBtn = document.getElementById('homeBtn');
    if (homeBtn) homeBtn.addEventListener('click', function () { window.location.href = 'index.html'; });

    document.addEventListener('keydown', onKeyDown, true);
    updateScoreUI();
    showScreen(0);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
