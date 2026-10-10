// 자동 생성 파일 (ne) — tools/build_langs.py. 직접 고치지 말고 루트의 tutorial.js 또는 i18n/ne.json을 고친 뒤 다시 빌드할 것.
// ── 첫 실행 튜토리얼 ────────────────────────────────────────────────────
// 1단계: 좌/중/우 1/3 스와이프로 모드 전환하는 법을 몸으로 익힌다.
// 2단계: 자음(क→ख) + 모음 멀티탭(ी)을 실제로 조합해본다.
// 3단계: 스페이스로 독립모음 모드에 진입해 'आ'를 입력해본다.
// 4단계: 할란트(हलंत)로 자음을 결합해 'क्प'를 입력해본다.
// keyboard.js와 같은 전역 스코프를 공유하므로(둘 다 모듈이 아닌 일반 <script>),
// state/HIT_COLS/HIT_ROWS/HIT_BOT_SECTIONS/consonantGroups/render() 등을
// 그대로 참조한다.

const TUT = {
  welcome:      'स्वागत छ! आउनुहोस्, यसको सजिलो तरिका सिकौँ।',
  centerSwipe1: 'अब किबोर्डको बीचबाट माथितिर स्वाइप गर्नुहोस्।',
  centerSwipe2: 'स्याबास! यो नेपाली र अङ्ग्रेजीबीच बदल्नका लागि हो। फेरि एक पटक स्वाइप गर्नुहोस्।',
  rightSwipe:   'धेरै राम्रो! अब दायाँतिरबाट माथितिर स्वाइप गर्नुहोस्।',
  typeKha:      "अब 'ख' टाइप गर्नुहोस्।",
  typeKhi:      "अब 'ख' पछि 'ी' टाइप गर्नुहोस्।",
  tapAgain:     'फेरि एक पटक थिच्नुहोस्।',
  indepIntro:   "स्वतन्त्र स्वरका लागि पहिले स्पेस थिचेपछि स्वर कुञ्जीहरू स्वतन्त्र स्वर मोडमा बदलिन्छन्। अब 'आ' टाइप गरेर हेर्नुहोस्।",
  halantIntro:  "स्याबास! अब 'हलन्त' प्रयोग गरेर 'क्प' टाइप गर्नुहोस्।",
  outro:        'धेरै राम्रो! अब जुनसुकै कुञ्जी थिचेर मंत्रकी प्रयोग गर्न सुरु गर्नुहोस्।',
};

// 스와이프 존 단계에서 각 단계가 기다리는 존. 여기 없는 단계(조합 단계 등)에서는
// 어떤 스와이프가 와도 막고 흔들기만 한다. 상용구(left)는 이번 무료 런칭 버전에서
// 잠가둬서(keyboard.js의 FAVORITES_ENABLED) 튜토리얼에서도 뺐다.
const ZONE_STEP_TARGET = {
  'center-1': 'center', 'center-2': 'center',
  'right-1': 'right',
};
const ZONE_RECT = {
  left:   { left: '0%',      width: '33.333%' },
  center: { left: '33.333%', width: '33.333%' },
  right:  { left: '66.666%', width: '33.334%' },
};

let tutorialActive = false;
// 'center-1' | 'center-2' | 'right-1' |
// 'kha-cons' | 'kha-next' | 'khi-1' | 'khi-2' |
// 'indep-space' | 'indep-vowel' |
// 'halant-k' | 'halant-virama' | 'halant-p' | 'outro'
let tutorialStep = null;
const els = {};

function q(id) { return document.getElementById(id); }

// 안내 문구를 한 글자씩 타자치듯 채워 넣는다. 단계가 빠르게 넘어가서 이전 문구가 아직
// 타이핑 중일 때 새 문구가 시작되면, 이전 타이머가 뒤늦게 이어 타이핑하지 않도록 항상
// 먼저 끊고 새로 시작한다.
const TYPE_DELAY_MS = 40;
let typeTimer = null;

// 조합을 막 완성한 직후(खी, आ) 다음 단계로 넘어가기 전에 결과를 잠깐 보여주는 시간.
// advanceZoneStep의 1800ms(숫자판이 뜬 걸 확인시켜주는 지연)와 같은 취지.
const STEP_TRANSITION_DELAY_MS = 1200;

function typeInto(el, text, onDone) {
  clearTimeout(typeTimer);
  el.textContent = '';
  let i = 0;
  (function step() {
    i++;
    el.textContent = text.slice(0, i);
    if (i < text.length) typeTimer = setTimeout(step, TYPE_DELAY_MS);
    else if (onDone) onDone();
  })();
}

function initTutorialDom() {
  els.actionBar = q('action-bar');
  els.topbar = q('tutorial-topbar');
  els.backBtn = q('tutorial-back-btn');
  els.introOverlay = q('tutorial-intro-overlay');
  els.introText = q('tutorial-intro-text');
  els.startBtn = q('tutorial-start-btn');
  els.banner = q('tutorial-banner');
  els.text = q('tutorial-text');
  els.segs = Array.from(q('tutorial-progress').querySelectorAll('.seg'));
  els.zoneArrow = q('tutorial-zone-arrow');
  els.swipeBgArrow = q('tutorial-swipe-bg-arrow');
  els.thumbWrap = q('tutorial-thumb-wrap');
  els.thumbImg = q('tutorial-thumb-img');
  els.keyArrow = q('tutorial-key-arrow');
  els.demoBox = q('tutorial-demo-box');
  els.demoText = q('tutorial-demo-text');
  els.startBtn.addEventListener('click', beginZoneSteps);
  els.backBtn.addEventListener('click', restartTutorial);
}

function startTutorial() {
  initTutorialDom();
  tutorialActive = true;
  zoneSwipeInterceptor = handleZoneSwipe;
  els.actionBar.classList.add('tutorial-hidden');
  els.topbar.classList.add('show');
  restartTutorial();
}

// 뒤로가기 버튼: 지금까지의 진행을 버리고 튜토리얼을 맨 처음(환영 카드)부터 다시 시작한다.
function restartTutorial() {
  clearThumbTimers();
  clearTimeout(typeTimer);
  if (keyArrowTimer) clearTimeout(keyArrowTimer);
  onTutorialRender = null;
  tutorialStep = null;
  resetAll();
  els.zoneArrow.classList.add('hidden');
  els.keyArrow.classList.add('hidden');
  els.demoText.textContent = '';
  els.banner.classList.remove('shake');
  setProgress(0);
  typeInto(els.introText, TUT.welcome);
  els.introOverlay.classList.add('show');
}

function beginZoneSteps() {
  els.introOverlay.classList.remove('show');
  setProgress(0);
  tutorialStep = 'center-1';
  showZoneStep('center', TUT.centerSwipe1);
}

function setProgress(n) {
  els.segs.forEach((s, i) => s.classList.toggle('done', i < n));
}

// 문구가 뜨자마자 엄지/화살표가 같이 나오면 아직 문구도 다 못 읽었는데 리듬이 어색해서,
// 문구 타자 효과가 다 끝난 뒤 한 박자 쉬었다가 엄지 스와이프나 키 화살표를 보여준다
// (문구 길이에 따라 타이핑 시간이 다르므로, 호출 시점이 아니라 typeInto의 onDone에서
// 이 지연을 건다).
const READ_DELAY_MS = 800;
let thumbTimer = null;

// 예약해둔 자동 시범 재생(thumbTimer)을 취소한다. 유저가 이미 실제로 스와이프해서
// 다음 화면으로 넘어갔거나 다른 피드백이 즉시 나가는 상황인데 예전 단계에서 걸어둔
// 타이머가 나중에 뒤늦게 발동하면, 이미 지나간 단계의 애니메이션이 뜬금없이 다시
// 튀어나오는 것처럼 보인다 — 그래서 새로 뭔가 보여줄 때마다 항상 먼저 정리한다.
function clearThumbTimers() {
  if (thumbTimer) { clearTimeout(thumbTimer); thumbTimer = null; }
}

// 지금 단계에서 "다시 보여줘야 할" 애니메이션 함수 — 오답 피드백/자동재생이 공용으로 쓴다.
let currentReplayFn = () => {};

function showZoneStep(zone, text) {
  els.keyArrow.classList.add('hidden');
  Object.assign(els.zoneArrow.style, ZONE_RECT[zone]);
  els.zoneArrow.classList.remove('hidden');
  // 왼쪽 스와이프만 왼손 엄지 그림으로 보여준다(나머지는 오른손)
  const isLeft = zone === 'left';
  els.thumbImg.src = isLeft ? '../images/l-thumb.png' : '../images/r-thumb.png';
  els.thumbWrap.classList.toggle('shift-left', isLeft);
  els.thumbWrap.classList.toggle('shift-right', !isLeft);
  els.thumbWrap.classList.remove('play');
  els.swipeBgArrow.classList.remove('play');
  currentReplayFn = playThumb;
  clearThumbTimers();
  typeInto(els.text, text, () => {
    thumbTimer = setTimeout(currentReplayFn, READ_DELAY_MS);
  });
}

// 엄지 스와이프 애니메이션을 한 번만 재생한다(반복 재생 X). 같은 단계에서 다시
// 보여줘야 할 때(오답 피드백 등)도 이 함수로 처음부터 재생시킨다. 엄지 밑에 깔리는
// 배경 화살표도 같이 재생시킨다 — 엄지가 사라진 뒤에도 화살표는 더 오래 남아 있다가
// 스스로 천천히 옅어진다(각자 애니메이션 길이가 달라서 따로 재생시켜야 한다).
function playThumb() {
  els.thumbWrap.classList.remove('play');
  void els.thumbWrap.offsetWidth; // 리플로우를 강제해 애니메이션을 처음부터 다시 재생시킨다
  els.thumbWrap.classList.add('play');

  els.swipeBgArrow.classList.remove('play');
  void els.swipeBgArrow.offsetWidth;
  els.swipeBgArrow.classList.add('play');
}

function shakeBanner() {
  els.banner.classList.remove('shake');
  void els.banner.offsetWidth; // 리플로우를 강제해 같은 애니메이션을 다시 재생시킨다
  els.banner.classList.add('shake');
}

// 스와이프 존 게이트: keyboard.js의 runZoneAction()이 스와이프가 확정될 때마다 호출한다.
function handleZoneSwipe(zone, defaultFn) {
  if (!tutorialActive) { defaultFn(); return; }
  // 유저가 실제로 스와이프를 했다는 뜻이므로, 결과가 맞았든 틀렸든 예약해둔 자동 시범
  // 재생은 여기서 취소한다 — 안 그러면 유저가 방금 자기 손으로 스와이프한 직후에
  // 예전에 걸어둔 자동재생 타이머가 뒤늦게 발동해서 애니메이션이 또 튀어나온다.
  clearThumbTimers();
  const expected = ZONE_STEP_TARGET[tutorialStep];
  if (!expected || zone !== expected) {
    shakeBanner();
    currentReplayFn(); // 이미 한 번 안내를 봤으니 지체 없이 바로 다시 보여준다
    return;
  }
  defaultFn();
  advanceZoneStep();
}

function advanceZoneStep() {
  if (tutorialStep === 'center-1') {
    tutorialStep = 'center-2';
    showZoneStep('center', TUT.centerSwipe2);

  } else if (tutorialStep === 'center-2') {
    setProgress(1);
    tutorialStep = 'right-1';
    showZoneStep('right', TUT.rightSwipe);

  } else if (tutorialStep === 'right-1') {
    setProgress(2);
    // 숫자판이 실제로 뜬 걸 눈으로 확인할 시간을 주고 나서 조합 단계로 넘어간다 —
    // beginComposeSteps()의 resetAll()이 곧바로 힌디로 돌려버리므로, 지연 없이 바로
    // 부르면 확인할 새도 없이 사라져버린다.
    setTimeout(beginComposeSteps, 1800);
  }
}

// ── 2단계: ख + ी 조합 ──────────────────────────────────────────────────
function beginComposeSteps() {
  clearThumbTimers();
  els.zoneArrow.classList.add('hidden');
  resetAll(); // 빈 힌디 화면으로 되돌려서 조합 단계를 깨끗하게 시작
  tutorialStep = 'kha-cons';
  positionConsonantArrow('क');
  typeInto(els.text, TUT.typeKha, revealKeyArrow);
  els.demoText.textContent = '';
  onTutorialRender = checkComposeProgress;
}

// 스와이프 엄지와 같은 리듬: 문구가 먼저 보이고, 한 박자 쉬었다가 화살표가 나타난다.
let keyArrowTimer = null;

// 새 단계로 넘어갈 때 즉시 호출해서, 지난 단계의(엉뚱한 위치를 가리키던) 화살표를
// 바로 숨기고 다음 목표 위치로 옮겨 둔다. 실제로 다시 보이는 시점은 revealKeyArrow가
// 따로 정한다 — 안내 문구 타자 효과가 끝난 뒤에 불러야 화살표가 문구보다 먼저
// 튀어나오지 않는다.
function setKeyArrowRect(c, r) {
  Object.assign(els.keyArrow.style, {
    left: c.start + '%', width: c.size + '%',
    top: (r.start - 9) + '%', height: '9%',
  });
  els.keyArrow.classList.add('hidden');
  if (keyArrowTimer) clearTimeout(keyArrowTimer);
}

function positionKeyArrow(row, col) {
  setKeyArrowRect(HIT_COLS[col], HIT_ROWS[row]);
}

// 자음은 언어마다 자리가 달라서(../layouts/<언어>.js) 글자로 위치를 찾아 가리킨다.
function positionConsonantArrow(ch) {
  const p = mkConsonantPos(ch);
  positionKeyArrow(p.row, p.col);
}

// 스페이스바처럼 메인 3행이 아니라 하단바에 있는 키를 가리킬 때 쓴다.
// idx는 HIT_BOT_SECTIONS 순서(0=!, 1=?, 2=쉼표, 3=스페이스, 4=danda, 5=엔터)를 그대로 따른다.
function positionKeyArrowBotSection(idx) {
  setKeyArrowRect(HIT_BOT_SECTIONS[idx], HIT_ROWS[3]);
}

function revealKeyArrow() {
  if (keyArrowTimer) clearTimeout(keyArrowTimer);
  keyArrowTimer = setTimeout(() => els.keyArrow.classList.remove('hidden'), READ_DELAY_MS);
}

function checkComposeProgress() {
  // renderComposingHtml(keyboard.js)이 #editor와 똑같이 미확정 공란을 밑줄로 그려준다.
  // 커서는 #tutorial-demo-box의 정적 마크업에 이미 별도 <span class="cursor">로 있으므로
  // withCursor=false(중복 방지).
  els.demoText.innerHTML = renderComposingHtml(getText(), false);
  if (tutorialStep === 'kha-cons') {
    if (state.activeRoot === 'क' && state.activeCharIdx === 0) {
      tutorialStep = 'kha-next';
      positionKeyArrow(1, 6); // 다음키(K, rightKeys 1행 1열 → 이미지 6열)
      revealKeyArrow(); // 문구는 그대로라 타자 효과가 없으니 곧장 예약한다
    } else if (state.activeRoot || state.lastSignKey) {
      shakeBanner();
    }

  } else if (tutorialStep === 'kha-next') {
    if (state.activeRoot === 'क' && state.activeCharIdx === 1) {
      tutorialStep = 'khi-1';
      positionKeyArrow(1, 7); // L키(모음, rightKeys 1행 2열 → 이미지 7열)
      typeInto(els.text, TUT.typeKhi, revealKeyArrow);
    } else if (state.activeRoot !== 'क' || state.lastSignKey) {
      shakeBanner();
      tutorialStep = 'kha-cons';
      positionConsonantArrow('क');
      typeInto(els.text, TUT.typeKha, revealKeyArrow);
    }

  } else if (tutorialStep === 'khi-1') {
    if (state.lastSignKey === 'L' && state.signTapIdx === 0) {
      tutorialStep = 'khi-2';
      typeInto(els.text, TUT.tapAgain);
    } else if ((state.lastSignKey && state.lastSignKey !== 'L') || state.activeRoot) {
      shakeBanner();
    }

  } else if (tutorialStep === 'khi-2') {
    if (state.lastSignKey === 'L' && state.signTapIdx === 1) {
      setProgress(3);
      // 방금 완성한 "खी"를 잠깐 보여준 뒤에 다음 단계로 넘어간다 — 곧장 beginIndependentStep()의
      // resetAll()로 지워버리면 유저가 자기가 막 완성한 단어를 확인할 새도 없이 사라져버린다.
      // advanceZoneStep의 1800ms(숫자판 확인용) 패턴과 같은 방식.
      setTimeout(beginIndependentStep, STEP_TRANSITION_DELAY_MS);
    } else if ((state.lastSignKey && state.lastSignKey !== 'L') || state.activeRoot) {
      shakeBanner();
      tutorialStep = 'khi-1';
      typeInto(els.text, TUT.typeKhi);
    }

  } else if (tutorialStep === 'indep-space') {
    if (getText().endsWith(' ')) {
      tutorialStep = 'indep-vowel';
      positionKeyArrow(1, 7); // L키(모음, rightKeys 1행 2열 → 이미지 7열)
      revealKeyArrow(); // 문구는 그대로라 타자 효과가 없으니 곧장 예약한다
    } else if (state.activeRoot || state.lastSignKey) {
      shakeBanner();
    }

  } else if (tutorialStep === 'indep-vowel') {
    if (state.lastSignKey === 'L' && state.signIndepMode && state.signTapIdx === 0) {
      setProgress(4);
      // 방금 완성한 "आ"도 khi-2와 같은 이유로 잠깐 보여준 뒤 다음 단계로 넘어간다.
      setTimeout(beginHalantStep, STEP_TRANSITION_DELAY_MS);
    } else if ((state.lastSignKey && !(state.lastSignKey === 'L' && state.signIndepMode)) || state.activeRoot) {
      shakeBanner();
      tutorialStep = 'indep-space';
      positionKeyArrowBotSection(3); // 스페이스바
      revealKeyArrow();
    }

  } else if (tutorialStep === 'halant-k') {
    if (state.activeRoot === 'क' && state.activeCharIdx === 0) {
      tutorialStep = 'halant-virama';
      positionKeyArrow(2, 5); // N키(할란트, rightKeys 3행 1열 → 이미지 5열)
      revealKeyArrow();
    } else if (state.activeRoot || state.lastSignKey) {
      shakeBanner();
    }

  } else if (tutorialStep === 'halant-virama') {
    if (state.lastSignKey === 'N' && state.signTapIdx === 0) {
      tutorialStep = 'halant-p';
      positionConsonantArrow('प');
      revealKeyArrow();
    } else if ((state.lastSignKey && state.lastSignKey !== 'N') || state.activeRoot) {
      shakeBanner();
    }

  } else if (tutorialStep === 'halant-p') {
    if (state.activeRoot === 'प' && state.activeCharIdx === 0) {
      setProgress(5);
      finishTutorial();
    } else if ((state.activeRoot && state.activeRoot !== 'प') || state.lastSignKey) {
      shakeBanner();
    }
  }
}

// ── 3단계: 독립모음(आ) ─────────────────────────────────────────────────
function beginIndependentStep() {
  clearThumbTimers();
  els.zoneArrow.classList.add('hidden');
  tutorialStep = 'indep-space';
  resetAll(); // 빈 힌디 화면으로 되돌려서 독립모음 단계를 깨끗하게 시작
  positionKeyArrowBotSection(3); // 스페이스바
  typeInto(els.text, TUT.indepIntro, revealKeyArrow);
  els.demoText.textContent = '';
}

// ── 4단계: 할란트(हलंत) + क्प ────────────────────────────────────────────
function beginHalantStep() {
  clearThumbTimers();
  els.zoneArrow.classList.add('hidden');
  tutorialStep = 'halant-k';
  resetAll(); // 빈 힌디 화면으로 되돌려서 할란트 단계를 깨끗하게 시작
  positionConsonantArrow('क');
  typeInto(els.text, TUT.halantIntro, revealKeyArrow);
  els.demoText.textContent = '';
}

function finishTutorial() {
  tutorialStep = 'outro';
  if (keyArrowTimer) clearTimeout(keyArrowTimer);
  els.keyArrow.classList.add('hidden');
  typeInto(els.text, TUT.outro);
  // 정해진 시간이 아니라 유저가 "아무 키나" 누를 때까지 기다린다 — 예전엔 타이머로
  // 일정 시간 뒤 강제로 닫아서, 멘트가 길면 다 읽기도 전에 사라지는 문제가 있었다.
  // onTutorialRender는 실제 키를 눌러 render()가 도는 순간마다 불리므로, 다음 입력
  // 한 번이 그대로 "이제 끝" 신호가 된다.
  onTutorialRender = endTutorial;
}

// finishTutorial() 이후 첫 입력에서 튜토리얼을 실제로 접고 평소 자판으로 돌려보낸다.
function endTutorial() {
  onTutorialRender = null; // resetAll()이 곧 다시 걸 render()가 이 훅을 또 건드리지 않도록 먼저 끊는다
  els.topbar.classList.remove('show');
  els.actionBar.classList.remove('tutorial-hidden');
  tutorialActive = false;
  resetAll();
}
