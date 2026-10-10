// ── 배열 데이터는 layouts/<언어>.js(MK_LAYOUT)에서 읽는다 — 이 파일보다 먼저 로드돼야 한다 ──
// ज्ञ·क्ष는 코드포인트 3개짜리 결합 자음이라, 그룹 내 전환/삭제 시 한 글자(1코드유닛)가
// 아니라 그 문자열 길이만큼 통째로 다룬다(groupAtEnd 참고).
const consonantGroups = MK_LAYOUT.consonantGroups;
const leftKeys = MK_LAYOUT.consonantRows;

// 다음키(K, 홈로우 우측 중지 위치)를 중심으로 상/하/좌/우/대각선에 배치되는 모음·부호키
// indep: 독립모음 모드일 때 대체 표시/입력되는 문자 (없으면 chars 그대로 유지)
// 자리 배치(PC 물리키 U I O / J K L / N M 과 같은 모양)는 모든 언어 공통, 글자는 MK_LAYOUT.signKeys.
const signKey = id => ({ id, type:'sign', ...MK_LAYOUT.signKeys[id.toLowerCase()] });
const rightKeys = [
  [ signKey('U'), signKey('I'), signKey('O') ],
  [ signKey('J'), { id:'K', type:'next' }, signKey('L') ],
  [ signKey('N'), signKey('M'), { id:'BS', type:'bs' } ],
];

let state = {
  activeRoot: null,
  activeCharIdx: 0,
  lastSignKey: null,
  signTapIdx: 0,
  signIndepMode: false,
  independentMode: false,
  // 영문(로마자) 모드 상태
  engActive: false,       // true면 쿼티 자판 표시 중
  engShiftState: 'off',   // 'lock'(캡스락) | 'once'(다음 한 글자만 대문자) | 'off'(소문자)
};

// 상용구(즐겨찾기) 패널이 좌측 스와이프로 열려 있는 동안, 가운데 스와이프의 "다른
// 모드일 때는 복귀" 판정에 쓰인다(숫자판과 동일한 패턴). 패널을 여는/닫는 경로가
// 여러 곳(좌측 스와이프, 물리 버튼, 상용구 삽입, 패널 안 닫기 버튼)이라 showFavorites/
// hideFavorites 두 함수에만 플래그 관리를 몰아두고 나머지는 그 함수를 거치게 한다.
let favoritesMode = false;

// 이번 런칭(무료) 버전에서는 상용구 기능 자체를 잠가둔다 — 좌측 스와이프 트리거만
// 막고 나머지(showFavorites/hideFavorites/renderFavorites, 상용구 데이터, 편집 화면 등)는
// 전부 그대로 남겨둔다. 다음(유료) 버전에서 이 값만 true로 바꾸면 그대로 다시 켜진다.
const FAVORITES_ENABLED = false;

// ── 숫자/기호 자판 상태 ──
let numericMode = false;

// 힌디 또는 영문 소문자만 "기본 모드"로 친다 — 대문자(약어)/숫자·기호/상용구는 전부
// "기타(임시) 모드"다. 임시 모드 안에서 중앙 스와이프 1회("나가기")나 각 모드 자체의
// 닫기 제스처는 항상 임시 모드에 처음 들어가기 직전의 기본 모드로 돌아가야 하고,
// 임시 모드끼리 서로 넘나들어도(예: 대문자 상태에서 숫자판으로) 이 기억은 안 바뀌어야
// 한다 — 안 그러면 "대문자 모드가 복귀 대상으로 잘못 먹혀서" 대문자에서 숫자판 갔다가
// 나가면 힌디/영문이 아니라 다시 대문자로 돌아와버리는 문제가 생긴다. 그래서 기본
// 모드에서 실제로 벗어나는 그 순간에만(아직 임시 모드가 아닐 때만) 갱신한다.
let baseModeIsEnglish = false; // false=힌디, true=영문 소문자

// 실제 InputConnection의 조합 중(composing) 텍스트와 같은 개념 — 아직 "확정"되지 않은 맨 끝
// 공란(독립모음이 뒤따르면 대체될 수 있음)을 실제 공백 대신 밑줄 친 자리로 보여준다. 표준
// EditText가 조합 중 텍스트에 밑줄을 그려주는 것과 동일한 관례(안드로이드 앱의
// InputConnectionTextEditor.setComposingSpace가 실기기에서 만드는 밑줄과 같은 시각 언어).
// #editor(메인 입력 미리보기)와 튜토리얼의 #tutorial-demo-text가 공유한다.
function renderComposingHtml(t, withCursor) {
  // 맨 끝 공란은 힌디 모드에서만 아직 "확정"되지 않은 상태다 — 독립모음이 뒤따르면
  // 그 모음으로 대체될 수 있어서다(independentActive() 참고). 영문/숫자 모드는
  // 독립모음 개념이 없어 스페이스가 찍히는 즉시 확정이므로 그냥 보통 공백으로 보여준다.
  // 이후 뭔가 더 입력되면(그 공란이 더는 마지막 글자가 아니게 되면) 다시 불릴 때 자연히
  // 보통 공백으로 그려진다 — 별도 "확정" 처리가 필요 없다.
  const pending = t.endsWith(' ') && !numericMode && !state.engActive;
  const body = pending ? t.slice(0, -1) : t;
  const esc = body.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const underline = pending ? `<span class="pending-space-underline"> </span>` : '';
  const cursor = withCursor ? `<span class="cursor">▏</span>` : '';
  return esc + underline + cursor;
}

// 호스트 페이지가 지정하지 않으면 #editor 엘리먼트를 기본 입력 대상으로 삼는다
// (mobile_demo.html의 원래 방식). 상용구 편집 화면처럼 여러 입력 대상이 있는
// 페이지는 KB_setEditorAdapter로 "현재 포커스된 대상"을 갈아 끼운다.
let editorAdapter = {
  getText() {
    const el = document.getElementById('editor');
    return el ? (el.dataset.text || '') : '';
  },
  setText(t) {
    const el = document.getElementById('editor');
    if (!el) return;
    el.dataset.text = t;
    el.innerHTML = renderComposingHtml(t, true);
  },
};
function KB_setEditorAdapter(adapter) { editorAdapter = adapter; }
function getText() { return editorAdapter.getText(); }
function setText(t) { editorAdapter.setText(t); }
function appendText(c) { setText(getText() + c); }
function replaceLastChar(c) { const t=getText(); if(!t.length)return; setText(t.slice(0,-1)+c); }
function backspace() { const t=getText(); if(!t.length)return; setText(t.slice(0,-1)); }

// 텍스트 맨 끝이 어느 자음 그룹의 몇 번째 글자인지 찾는다. 가장 긴 일치를 우선한다 —
// ज्ञ는 ञ(न 그룹)로 끝나므로, 짧은 쪽부터 보면 र 그룹의 ज्ञ를 न 그룹의 ञ로 오인한다.
function groupAtEnd(t) {
  let best = null;
  for (const [root, arr] of Object.entries(consonantGroups)) {
    arr.forEach((ch, idx) => {
      if (t.endsWith(ch) && (!best || ch.length > best.len)) best = { root, idx, len: ch.length };
    });
  }
  return best;
}

// 독립모음 모드는 오직 스페이스바를 눌렀을 때만 진입한다
function independentActive() {
  if (state.independentMode) return true;
  return getText().endsWith(' ');
}

function handleConsonant(root) {
  appendText(root);
  state.activeRoot = root; state.activeCharIdx = 0;
  state.lastSignKey = null; state.signTapIdx = 0;
  state.independentMode = false;
  render();
}

function handleNext() {
  if (independentActive()) {
    if (state.lastSignKey === 'K' && state.signIndepMode) { return; } // 'अ' 하나뿐, 재입력 없음
    const t = getText();
    if (t.endsWith(' ')) setText(t.slice(0, -1));
    appendText('अ');
    state.independentMode = true;
    state.lastSignKey = 'K'; state.signTapIdx = 0; state.signIndepMode = true;
    state.activeRoot = null; state.activeCharIdx = 0;
    render(); return;
  }
  if (!state.activeRoot) return;
  const arr = consonantGroups[state.activeRoot];
  const nextIdx = (state.activeCharIdx + 1) % arr.length;
  const t = getText();
  setText(t.slice(0, t.length - arr[state.activeCharIdx].length) + arr[nextIdx]);
  state.activeCharIdx = nextIdx;
  state.lastSignKey = null; state.signTapIdx = 0;
  render();
}

// 지금 다음키(K)를 누르면 실제로 입력될 문자를 미리 계산한다 — handleNext와 똑같은
// 분기를 그대로 따라간다. 눌린 키 말풍선(showKeyBubble)에 "예상"이 아니라 실제로
// 입력될 그 문자를 보여주기 위한 것으로, pointerdown 시점(아직 handleNext가 실행되기
// 전)에 미리 알아야 해서 별도 함수로 뺐다. 아무것도 안 바뀌는 경우(null)엔 말풍선을
// 아예 띄우지 않는다.
function peekNext() {
  if (independentActive()) {
    if (state.lastSignKey === 'K' && state.signIndepMode) return null;
    return 'अ';
  }
  if (!state.activeRoot) return null;
  const arr = consonantGroups[state.activeRoot];
  return arr[(state.activeCharIdx + 1) % arr.length];
}

function handleVowelKey(def) {
  const isIndep = independentActive();
  // 독립모음 모드에서는 독립모음 한 바퀴를 다 돈 다음 의존모음 한 바퀴, 다시 독립모음 순으로 순환한다
  const chars = isIndep ? (def.indep ? def.indep.concat(def.chars) : def.chars) : def.chars;

  if (state.lastSignKey === def.id && state.signIndepMode === isIndep) {
    state.signTapIdx = (state.signTapIdx + 1) % chars.length;
    const t = getText(); setText(t.slice(0, -1) + chars[state.signTapIdx]);
  } else {
    if (isIndep) {
      const t = getText();
      if (t.endsWith(' ')) setText(t.slice(0, -1));
      appendText(chars[0]);
      state.independentMode = true;
    } else {
      appendText(chars[0]);
    }
    state.lastSignKey = def.id; state.signTapIdx = 0; state.signIndepMode = isIndep;
  }
  state.activeRoot = null; state.activeCharIdx = 0;
  render();
}

// peekNext와 같은 이유로 handleVowelKey와 같은 분기를 미리 계산한다 — 지금 이
// 모음/부호키를 누르면 실제로 입력될 문자(멀티탭 중이면 다음 순번의 문자)를 반환한다.
function peekVowelKey(def) {
  const isIndep = independentActive();
  const chars = isIndep ? (def.indep ? def.indep.concat(def.chars) : def.chars) : def.chars;
  if (state.lastSignKey === def.id && state.signIndepMode === isIndep) {
    return chars[(state.signTapIdx + 1) % chars.length];
  }
  return chars[0];
}

// 마침표 키(스페이스와 엔터 사이): 벵골어 힘못키와 같은 규칙 — 1타 단다(।),
// 2타 ..(단다를 점 두 개로 교체), 이후 점을 하나씩 계속 추가한다(상한 없음).
// 독립모음 모드와 무관하게 항상 같은 동작이며, 다른 키를 누르면(lastSignKey가
// 바뀌면) 처음부터 다시 시작한다.
function dandaSeq(idx) {
  return idx === 0 ? '।' : '.'.repeat(idx + 1);
}

// peekNext/peekVowelKey와 같은 이유 — 지금 danda 키를 누르면 실제로 입력될 문자를 미리 계산한다.
function peekDanda() {
  return dandaSeq(state.lastSignKey === 'DANDA' ? state.signTapIdx + 1 : 0);
}

// 키캡 라벨(이미지엔 공란): 다음 탭에 "덧붙는" 것을 보여준다 — 처음엔 ।, 한 번 친
// 뒤엔 .., 그다음부턴 . (벵골어 데모의 stopLabel과 동일).
function dandaKeyLabel() {
  if (state.lastSignKey !== 'DANDA') return '।';
  return state.signTapIdx === 0 ? '..' : '.';
}

function handleDanda() {
  if (state.lastSignKey === 'DANDA') {
    const prev = dandaSeq(state.signTapIdx);
    const t = getText();
    setText(t.slice(0, -prev.length));
    state.signTapIdx += 1;
    appendText(dandaSeq(state.signTapIdx));
  } else {
    appendText(dandaSeq(0));
    state.lastSignKey = 'DANDA'; state.signTapIdx = 0; state.signIndepMode = false;
  }
  state.activeRoot = null; state.activeCharIdx = 0;
  state.independentMode = false;
  render();
}

// 영문 하단바 느낌표 자리에 있는 쉼표/느낌표 결합키: 1타는 쉼표, 2타부터는 느낌표가
// 계속 누적된다(,  →  !  →  !!  →  !!!  → …). 힌디 모드는 4행 개편으로 ! ? , 를
// 각각 따로 둬서 이제 영문 모드만 쓴다.
function commaExclSeq(idx) { return idx === 0 ? ',' : '!'.repeat(idx); }

// peekDanda와 같은 이유 — 지금 이 키를 누르면 실제로 입력될 문자를 미리 계산한다.
function peekCommaExcl() {
  return commaExclSeq(state.lastSignKey === 'COMMA_EXCL' ? state.signTapIdx + 1 : 0);
}

function handleCommaExcl() {
  if (state.lastSignKey === 'COMMA_EXCL') {
    const prev = commaExclSeq(state.signTapIdx);
    const t = getText();
    setText(t.slice(0, -prev.length));
    state.signTapIdx += 1;
    appendText(commaExclSeq(state.signTapIdx));
  } else {
    appendText(commaExclSeq(0));
    state.lastSignKey = 'COMMA_EXCL'; state.signTapIdx = 0; state.signIndepMode = false;
  }
  state.activeRoot = null; state.activeCharIdx = 0;
  state.independentMode = false;
  render();
}

// 백스페이스 = 직전 입력 취소. 자음키/다음키로 넣은 ज्ञ·क्ष는 키 한 번에 들어간
// 한 글자이므로 분해하지 않고 통째로 지운다(코드포인트 3개를 한 번에).
function handleBS() {
  const cur = state.activeRoot ? consonantGroups[state.activeRoot][state.activeCharIdx] : null;
  const t = getText();
  if (cur && cur.length > 1 && t.endsWith(cur)) setText(t.slice(0, -cur.length));
  else backspace();
  state.lastSignKey = null; state.signTapIdx = 0; state.independentMode = false;
  const g = groupAtEnd(getText());
  state.activeRoot = g ? g.root : null;
  state.activeCharIdx = g ? g.idx : 0;
  render();
}

function handleSpace() {
  appendText(' ');
  state.activeRoot = null; state.activeCharIdx = 0;
  state.lastSignKey = null; state.signTapIdx = 0;
  state.independentMode = false;
  render();
}

// 하단바의 쉼표/느낌표/물음표 키 공용 핸들러 — 셋 다 멀티탭 없이 한 글자만 입력한다.
function handlePunct(ch) {
  appendText(ch);
  state.activeRoot = null; state.activeCharIdx = 0;
  state.lastSignKey = null; state.signTapIdx = 0;
  state.independentMode = false;
  render();
}

// 엔터키 라벨: 배경 이미지엔 일부러 안 그려 넣는다(실제 제품에서는 return/go/search/
// send/done처럼 OS·입력 상황에 따라 라벨이 바뀌므로 항상 런타임에 그려야 함) — 힌디/
// 영문 모드가 공유해서 쓰는 헬퍼. [left,right]는 BOT_SECTIONS.enter/ENG_BOT.enter처럼
// 실제 키 시각적 위치(확장 전 히트박스가 아니라)를 넘겨준다.
function makeEnterLabel(rect, top, height) {
  const label = document.createElement('div');
  label.className = 'kbd-enter-label';
  Object.assign(label.style, { left: rect[0] + '%', top: top + '%', width: (rect[1] - rect[0]) + '%', height: height + '%' });
  label.textContent = 'Enter';
  return label;
}

function handleEnter() {
  appendText('\n');
  state.activeRoot = null; state.activeCharIdx = 0;
  state.lastSignKey = null; state.signTapIdx = 0;
  state.independentMode = false;
  render();
}

// ── 숫자/기호 자판 데이터 (images/bg_numeric_keyboard.png 실측 기준, 칸마다 글자 하나씩
// 이미 그려져 있어 멀티탭/순환 없이 그대로 한 글자만 입력한다) ──────────────
// 1~3행은 10열 균등 그리드. 4행은 8칸 + 삭제키(부활, 우측 끝 넓은 칸)로 끝난다.
const NUM_ROWS = [
  ['$','@','#','₹','%','^','&','*','(',')'],
  ['1','2','3','4','5','6','7','8','9','0'],
  ['<','>','[',']','{','}',';',':',"'",'"'],
];
const NUM_ROW4 = ['~','-','_','=','+','\\','|','/'];

function handleNumSingle(ch) { appendText(ch); render(); }
function handleNumSpace() { appendText(' '); render(); }
function handleNumEnter() { appendText('\n'); render(); }

function handleNumBS() {
  backspace();
  render();
}

// 자판 이미지는 numericMode/engActive 조합에 따라 셋 중 하나만 있을 수 있다 —
// 모드 전환 함수마다 따로 계산하면 한 곳만 고치고 잊어버리기 쉬워서(실제로 숫자판을
// 한 번 거친 뒤 약어 모드를 껐다 켜면 화면이 안 맞는 버그가 났었다) 한 군데로 모았다.
function updateKbdImage() {
  document.getElementById('kbd-image').src = numericMode
    ? 'images/bg_numeric_keyboard.png'
    : (state.engActive ? 'images/keyboard_eng.png' : 'images/keyboard.png');
}

// 우측 1/3 스와이프로 진입. 이미 다른 임시 모드(대문자/상용구) 안이었다면 기본 모드
// 기억(baseModeIsEnglish)을 건드리지 않는다 — 대문자에서 숫자판으로 넘어온 경우처럼.
function enterNumericMode() {
  if (numericMode) return;
  if (!isTemporaryMode()) baseModeIsEnglish = state.engActive;
  numericMode = true;
  updateKbdImage();
  render();
}

// ── 좌표 (images/keyboard.png 914×504 픽셀 실측 기준 %) ──────────────────
// 열 x: 8,122,235,348,461,575,689,803 (폭 103) / 행 y: 17,141,264 (높이 104) / 4행 y: 386 (높이 105)
const KEY_COLS = [0.88, 13.35, 25.71, 38.07, 50.44, 62.91, 75.38, 87.86];
const KEY_ROWS = [3.37, 27.98, 52.38];
const KEY_W = 11.27, KEY_H = 20.63;
const BOT_Y = 76.59, BOT_H = 20.83;
// 하단바 6칸 — 벵골어 힘못키와 같은 배열: ! | ? | , | 스페이스/स्वर | 마침표(।/../…) | 엔터
// x: 9-93, 100-184, 190-293, 301-613, 621-724, 734-907
const BOT_SECTIONS = { excl:[0.98,10.18], quest:[10.94,20.13], comma:[20.79,32.06], space:[32.93,67.07], danda:[67.94,79.21], enter:[80.31,99.23] };

// ── 영문(쿼티) 자판 좌표 (images/keyboard_eng.png 1348×740 픽셀 실측 기준 %) ──
const ENG_ROW_TOP = [2.97, 27.70, 52.16];
const ENG_ROW_H = 20.95;
const ENG_KEY_W = 9.15;
const ENG_ROW1 = ['Q','W','E','R','T','Y','U','I','O','P'];
const ENG_ROW2 = ['A','S','D','F','G','H','J','K','L'];
const ENG_ROW3 = ['Z','X','C','V','B','N','M'];
const ENG_ROW1_COLS = [0.67,10.61,20.55,30.49,40.50,50.45,60.39,70.33,80.27,90.21];
const ENG_ROW2_COLS = [5.71,15.65,25.59,35.53,45.48,55.42,65.43,75.37,85.31];
const ENG_ROW3_COLS = [15.58,25.52,35.46,45.40,55.34,65.28,75.30];
const ENG_SHIFT = { left:0.67, width:12.39 };
const ENG_DELETE = { left:86.94, width:12.02 }; // 3행 마지막 칸: 마침표 폐지, 삭제키 부활(마침표는 하단바 옛 쉼표 자리로 이동)
const ENG_BOT_Y = 76.49, ENG_BOT_H = 20.95;
// 힌디 모드와 동일한 재배치: 하단바 5칸([,!]결합, ?, 스페이스, 마침표, 엔터) —
// images/keyboard_eng.png 실측 기준 %.
const ENG_BOT_SECTIONS = { excl:[0.89,12.09], quest:[13.35,24.56], space:[25.74,66.40], comma:[67.58,78.86], enter:[80.05,99.04] };

// ── 히트박스 확장: 이미지엔 키 사이 여백이 그려져 있지만, 실제 터치 영역은 그
// 여백까지 이웃 키와 절반씩 나눠 가져서 화면 전체(0~100%)를 빈틈없이 덮게 만든다.
// 안 그러면 여백 줄을 누를 때마다 어떤 키도 반응하지 않는 죽은 영역이 생긴다.
// starts/sizes는 같은 길이의 배열(각 칸의 시작 위치%, 크기%) — 폭이 다른 칸이
// 섞여 있어도(예: 영문 3행의 시프트/글자/백스페이스) 그대로 쓸 수 있다.
function expandAxisHitboxes(starts, sizes, total = 100) {
  const n = starts.length;
  const bounds = new Array(n + 1);
  bounds[0] = 0;
  for (let i = 1; i < n; i++) bounds[i] = (starts[i - 1] + sizes[i - 1] + starts[i]) / 2;
  bounds[n] = total;
  return starts.map((_, i) => ({ start: bounds[i], size: bounds[i + 1] - bounds[i] }));
}

// 힌디/숫자 자판이 공유하는 그리드 히트박스 (8열 x (3행+하단바 1행))
const HIT_COLS = expandAxisHitboxes(KEY_COLS, KEY_COLS.map(() => KEY_W));
const HIT_ROWS = expandAxisHitboxes([...KEY_ROWS, BOT_Y], [KEY_H, KEY_H, KEY_H, BOT_H]);
// 순서: [0]!, [1]?, [2]쉼표, [3]스페이스, [4]마침표(danda), [5]엔터
const BOT_ORDER = ['excl', 'quest', 'comma', 'space', 'danda', 'enter'];
const HIT_BOT_SECTIONS = expandAxisHitboxes(
  BOT_ORDER.map(k => BOT_SECTIONS[k][0]),
  BOT_ORDER.map(k => BOT_SECTIONS[k][1] - BOT_SECTIONS[k][0])
);

// 영문 자판 히트박스 (행마다 칸 폭이 달라서 행별로 따로 계산)
const ENG_HIT_ROW1 = expandAxisHitboxes(ENG_ROW1_COLS, ENG_ROW1_COLS.map(() => ENG_KEY_W));
const ENG_HIT_ROW2 = expandAxisHitboxes(ENG_ROW2_COLS, ENG_ROW2_COLS.map(() => ENG_KEY_W));
const ENG_HIT_ROW3 = expandAxisHitboxes(
  [ENG_SHIFT.left, ...ENG_ROW3_COLS, ENG_DELETE.left],
  [ENG_SHIFT.width, ...ENG_ROW3_COLS.map(() => ENG_KEY_W), ENG_DELETE.width]
);
const ENG_HIT_ROWS = expandAxisHitboxes([...ENG_ROW_TOP, ENG_BOT_Y], [ENG_ROW_H, ENG_ROW_H, ENG_ROW_H, ENG_BOT_H]);
// 순서: [0]!, [1]?, [2]스페이스, [3]쉼표, [4]엔터 (힌디 모드와 동일)
const ENG_HIT_BOT = expandAxisHitboxes(
  [ENG_BOT_SECTIONS.excl[0], ENG_BOT_SECTIONS.quest[0], ENG_BOT_SECTIONS.space[0], ENG_BOT_SECTIONS.comma[0], ENG_BOT_SECTIONS.enter[0]],
  [ENG_BOT_SECTIONS.excl[1] - ENG_BOT_SECTIONS.excl[0], ENG_BOT_SECTIONS.quest[1] - ENG_BOT_SECTIONS.quest[0], ENG_BOT_SECTIONS.space[1] - ENG_BOT_SECTIONS.space[0], ENG_BOT_SECTIONS.comma[1] - ENG_BOT_SECTIONS.comma[0], ENG_BOT_SECTIONS.enter[1] - ENG_BOT_SECTIONS.enter[0]]
);

// ── 숫자/기호 자판 좌표 (images/bg_numeric_keyboard.png 1344×906 픽셀 실측 기준 %) ──
// 1~3행은 10열 균등 그리드(칸마다 글자 하나씩 그려져 있어 순환 없이 단일 탭으로 입력).
// 4행은 8칸 + 삭제키(부활, 우측 끝 넓은 칸). 5행(하단바)은 폭이 다른 7칸
// (`, !, ?, 스페이스, ',', '.', 엔터)이다.
const NUM_COLS = [0.67, 10.64, 20.61, 30.55, 40.53, 50.47, 60.42, 70.36, 80.31, 90.23];
const NUM_KEY_W = 9.15;
const NUM_ROW4_COLS = NUM_COLS.slice(0, 8); // 4행: 위와 같은 8칸 + 아래 삭제키
const NUM_DELETE = { left:81.92, width:17.19 };
const NUM_ROW_TOP = [2.32, 21.08, 41.28, 61.37, 81.24];
const NUM_ROW_H = [15.56, 17.22, 17.33, 17.22, 17.00];
// 순서: [0]`, [1]!, [2]?, [3]스페이스, [4]쉼표, [5]마침표, [6]엔터
const NUM_BOT_SECTIONS = { back:[0.74,10.04], excl:[10.71,19.94], quest:[20.61,29.76], space:[30.65,59.67], comma:[60.49,69.72], period:[70.46,79.61], enter:[80.36,99.18] };

const NUM_HIT_COLS = expandAxisHitboxes(NUM_COLS, NUM_COLS.map(() => NUM_KEY_W));
const NUM_HIT_ROW4 = expandAxisHitboxes(
  [...NUM_ROW4_COLS, NUM_DELETE.left],
  [...NUM_ROW4_COLS.map(() => NUM_KEY_W), NUM_DELETE.width]
);
const NUM_HIT_ROWS = expandAxisHitboxes(NUM_ROW_TOP, NUM_ROW_H);
const NUM_HIT_BOT = expandAxisHitboxes(
  [NUM_BOT_SECTIONS.back[0], NUM_BOT_SECTIONS.excl[0], NUM_BOT_SECTIONS.quest[0], NUM_BOT_SECTIONS.space[0], NUM_BOT_SECTIONS.comma[0], NUM_BOT_SECTIONS.period[0], NUM_BOT_SECTIONS.enter[0]],
  [NUM_BOT_SECTIONS.back[1] - NUM_BOT_SECTIONS.back[0], NUM_BOT_SECTIONS.excl[1] - NUM_BOT_SECTIONS.excl[0], NUM_BOT_SECTIONS.quest[1] - NUM_BOT_SECTIONS.quest[0], NUM_BOT_SECTIONS.space[1] - NUM_BOT_SECTIONS.space[0], NUM_BOT_SECTIONS.comma[1] - NUM_BOT_SECTIONS.comma[0], NUM_BOT_SECTIONS.period[1] - NUM_BOT_SECTIONS.period[0], NUM_BOT_SECTIONS.enter[1] - NUM_BOT_SECTIONS.enter[0]]
);

// 키 입력 확정을 누르는 순간(pointerdown)이 아니라 떼는 순간(pointerup)으로 미룬다.
// 예전엔 pointerdown 후 고정 시간(70ms)만 유예하고 그 사이 스와이프 움직임이 있었는지로
// 판단했는데, 마우스로 천천히 스와이프하면 임계 거리(28px)에 도달하기 전에 그 유예 시간이
// 끝나버려 스와이프 시작 지점의 키가 그대로 입력돼버리는 경쟁 상태가 있었다. pointerup
// 시점엔 스와이프가 실제로 발동했는지(kbdGestureActive)가 이미 확정돼 있으므로 이 경쟁이
// 원천적으로 생기지 않는다. 같은 손가락(pointerId)이 눌렀다 뗀 경우에만 반응한다 —
// 스와이프로 자리를 옮겨 다른 키 위에서 손을 떼도 그 키가 잘못 눌리지 않도록.
let kbdGestureActive = false;

// 자음+모음 조합 입력은 순서(어느 키가 먼저 "확정"됐는지)에 상태가 의존하는데,
// 각 키 버튼이 자기 pointerId만 따로 추적하다 보니 두 손가락으로 서로 다른 키를
// 겹쳐 누르면(예: 자음을 누른 채로 모음을 눌렀다 먼저 뗌) 확정 순서가 실제로 누른
// 순서와 뒤바뀌어서, lastSignKey 등 상태가 아직 안 바뀐 채로 다음 키가 먼저
// 커밋돼버렸다(모음이 멀티탭으로 오인되거나 자음 뒤에 안 붙는 등).
// 먼저 눌린 키를 "활성 키"로 정하고, 그 키가 아직 안 끝났는데 다른 키가 먼저 손을
// 떼면 그 입력을 버리지 않고 큐에 쌓아뒀다가, 활성 키가 커밋되는 즉시 순서대로
// 이어서 커밋한다 — 유저가 누른 건 결국 전부 입력되되, 순서만 항상 실제로 처음
// 누른 순서를 따르게 된다. pointerup/cancel을 놓쳐서 활성 키가 고착되는 경우를
// 대비해 일정 시간 지나면 다음 키가 그냥 활성 키 자리를 넘겨받는 안전장치를 둔다.
let activeKeyPointerId = null;
let activeKeyPointerSetAt = 0;
const ACTIVE_KEY_STALE_MS = 1500;

// render()는 매 입력마다 #kbd를 통째로 비우고 새로 그리는데, 그 순간 다른 손가락이
// 아직 어떤 키를 누르고 있는 채라면 그 버튼 DOM이 통째로 사라져버린다. pointerup이
// 캡처했던 그 버튼으로 다시는 안 오게 되면서(브라우저가 암묵적으로 캡처를 풀고 현재
// 화면 위치로 다시 히트테스트하는데, 그 자리엔 이미 "새" 버튼이 있어 downPointerId가
// 안 맞아 아무 데서도 안 받아짐) 그 손가락의 입력이 통째로 유실된다 — 실기기 두 손가락
// 동시 타이핑에서 보고된 "누락"의 유력한 원인. 그래서 화면에 아직 눌려있는 손가락이
// (지금 이 스와이프를 만들고 있는 손가락은 빼고) 하나라도 있으면 실제 재렌더를
// 미뤄뒀다가, 마지막 손가락이 뗄 때 한 번에 처리한다.
// 값은 눌린 시각(ms) — pointerup/cancel이 유실돼서(바로 이 파일이 막으려는 그 문제)
// 어떤 손가락이 이 목록에서 영영 안 빠지면, render()가 그때부터 영원히 막혀서 이후
// updateKbdImage()로 배경 이미지는 계속 바뀌는데 #kbd 오버레이는 그 시점 이후로 다시는
// 안 그려지는 상태가 됐었다(모드가 바뀔 때마다 새 배경 위에 옛 오버레이가 계속 겹쳐
// 보임 — 실기기에서 실제로 겪은 버그). activeKeyPointerId와 같은 원칙으로, 너무 오래
// 안 풀린 손가락은 렌더를 막는 목록에서도 무시한다.
const downKeyPointers = new Map(); // pointerId -> 누른 시각
let swipeInProgressPointerId = null; // armGesture가 세팅 — 이 손가락은 렌더를 막는 쪽에서 제외
let renderPending = false;
function isRenderBlocked() {
  const now = Date.now();
  for (const [id, downAt] of downKeyPointers) {
    if (id === swipeInProgressPointerId) continue;
    if (now - downAt < ACTIVE_KEY_STALE_MS) return true;
  }
  return false;
}
function flushPendingRenderIfIdle() {
  if (renderPending && !isRenderBlocked()) render();
}
let queuedKeyCommits = []; // 활성 키가 아직 안 끝나서 미뤄둔 onClick들, 순서대로 실행
function runQueuedKeyCommits() {
  while (queuedKeyCommits.length) queuedKeyCommits.shift()();
}

// initSwipeGesture(아래) 안에 갇힌 activePointerId 등 wrap 레벨 제스처 상태를
// resetAll()에서도 강제로 풀 수 있게 하는 훅 — IIFE가 자기 forceResetGesture를 등록한다.
let resetSwipeGestureState = null;

// 첫 실행 튜토리얼이 스와이프 존 동작을 가로챌 때 쓰는 훅. tutorial.js가 설정한다.
// (zone, defaultFn) => 튜토리얼이 그 존을 기대하고 있으면 defaultFn()을 실행해 실제
// 모드를 바꾸고, 아닌 존이면 defaultFn()을 호출하지 않아 모드 전환 자체를 막는다.
// 튜토리얼이 비활성 상태면 항상 null이라 평소처럼 defaultFn()이 그대로 실행된다.
let zoneSwipeInterceptor = null;
// 자모 조합 튜토리얼 단계에서 render() 직후 진행 상황을 확인할 때 쓰는 훅.
let onTutorialRender = null;

// 롱프레스 안내: 자음키(→다음키 안내)/부호키(→멀티탭 안내)에서 손가락을 떼지 않고
// 오래 누르고 있으면 팝업으로 올바른 조작법을 짚어준다. 교육 없이 바로 써보게 했을 때
// 요즘 유저들은 한 키에 여러 문자가 있으면 반사적으로 롱프레스부터 시도하는 경향이
// 확인되어 추가함. 스페이스처럼 매 입력마다 걸리는 동작이 아니라 유저가 헷갈릴 때만
// 드물게 시도하는 제스처라 노출 빈도를 제한할 필요는 없다 — 매번 보여준다. 롱프레스여도
// 손을 떼면(pointerup) 원래 탭 동작은 그대로 실행된다(안내는 부가 정보일 뿐 입력을 막지 않음).
const LONG_PRESS_MS = 500;
const LONGPRESS_HINT_CONSONANT = 'दाईं ओर वाला तीर का बटन दबाएं।';
const LONGPRESS_HINT_SIGN = 'बार-बार टैप करें।';
let longPressToastTimer = null;
// 손가락이 자음/부호키 위에서 눌린 채로 시작해 스와이프로 이어지면, 그 키의 롱프레스
// 타이머가 스와이프와 무관하게 계속 돌고 있다가 500ms를 넘기는 순간 "롱프레스" 안내
// 팝업을 띄워버렸다(스와이프 자체가 손을 500ms 넘게 붙이고 있는 동작이라 흔히 걸림).
// initSwipeGesture가 스와이프를 확정하는 순간 이 콜백으로 그 키의 타이머를 꺼서 막는다.
let pendingLongPressCancel = null;
function showLongPressHint(text) {
  const el = document.getElementById('longpress-toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  if (longPressToastTimer) clearTimeout(longPressToastTimer);
  longPressToastTimer = setTimeout(() => el.classList.remove('show'), 1600);
}

// 눌린 키 위에 그 키의 대표 문자(들)를 보여주는 말풍선. 실제 모바일 키보드처럼
// 손가락이 글자를 가리게 되니 눌렀다는 걸(그리고 뭘 눌렀는지) 눈으로 바로 확인시켜준다.
// 버튼이 여러 개 동시에 눌려도(멀티터치) 말풍선은 하나만 떠서 방금 누른 키를 따라가되,
// 먼저 누른 손가락이 나중에 떼질 때 지금 보여주고 있는(나중에 누른) 말풍선을 잘못
// 지우지 않도록 "누가 지금 말풍선의 주인인지"(pointerId)를 추적한다.
// 모음부호·할란트처럼 홀로 쓰인 결합 문자는 폰트가 "받침 자음 없음" 표시로 점선원(◌)을
// 붙여 그린다. 앞에 NBSP를 받침 자리로 깔아주면 셰이핑 엔진이 그걸 기호용 받침으로
// 인정해 점선원 없이 부호만 그린다(키캡·말풍선 표시용일 뿐, 실제 입력엔 영향 없음).
function markLabel(s) { return /^\p{M}/u.test(s) ? ' ' + s : s; }

let keyBubbleOwnerPointerId = null;
function showKeyBubble(pointerId, rectStyle, text) {
  const el = document.getElementById('key-bubble');
  if (!el || !text) return;
  keyBubbleOwnerPointerId = pointerId;
  const left = parseFloat(rectStyle.left) + parseFloat(rectStyle.width) / 2;
  el.textContent = markLabel(text);
  Object.assign(el.style, { left: left + '%', top: rectStyle.top });
  el.classList.add('show');
}
function hideKeyBubble(pointerId) {
  if (keyBubbleOwnerPointerId !== pointerId) return;
  keyBubbleOwnerPointerId = null;
  const el = document.getElementById('key-bubble');
  if (el) el.classList.remove('show');
}

function makeBtn(cls, style, onClick, longPressText, bubbleText) {
  const b = document.createElement('button');
  b.className = 'kbd-btn ' + cls;
  Object.assign(b.style, style);
  if (onClick) {
    let downPointerId = null;
    let longPressTimer = null;
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      downPointerId = e.pointerId;
      downKeyPointers.set(e.pointerId, Date.now());
      if (bubbleText) showKeyBubble(e.pointerId, style, bubbleText);
      // 아직 활성 키가 없거나(첫 손가락) 활성 키가 너무 오래 안 풀렸으면(유실 추정)
      // 이 키를 활성 키로 등록한다. 이미 다른 손가락이 활성 키를 쥐고 있으면 그건
      // 안 건드리고 그대로 둔다 — 이 키는 나중에 pointerup에서 "먼저 눌린 키"가
      // 끝날 때까지 큐에서 순서를 기다리게 된다(입력 자체는 버리지 않는다).
      if (activeKeyPointerId === null || Date.now() - activeKeyPointerSetAt >= ACTIVE_KEY_STALE_MS) {
        activeKeyPointerId = e.pointerId;
        activeKeyPointerSetAt = Date.now();
      }
      // 손가락이 살짝 흔들려 이웃 키 쪽으로 pointerup이 잡혀도 이 키가 눌린 걸로
      // 인식하도록 포인터를 붙잡아둔다(캡처해도 wrap까지의 버블링은 그대로 유지됨).
      try { b.setPointerCapture(e.pointerId); } catch (err) {}
      if (longPressText) {
        longPressTimer = setTimeout(() => {
          longPressTimer = null;
          // 다른 손가락으로 딴 키를 눌러 그 사이 render()가 자판 전체를 다시 그렸다면
          // (모든 입력마다 kbd.innerHTML을 통째로 비우고 새로 만든다) 이 버튼은 이미
          // 화면에서 사라진 옛 인스턴스다 — 그 경우 pointerup이 이 버튼으로 다시는
          // 안 와서 타이머가 못 지워지고 그대로 격발돼버렸다(두 손으로 자모를 빠르게
          // 번갈아 칠 때 실제로 겪은 버그). 아직 화면에 붙어있는 버튼일 때만 안내를 띄운다.
          if (b.isConnected) showLongPressHint(longPressText);
        }, LONG_PRESS_MS);
        pendingLongPressCancel = () => { if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; } };
      }
    });
    b.addEventListener('pointerup', (e) => {
      if (e.pointerId !== downPointerId) return;
      downPointerId = null;
      downKeyPointers.delete(e.pointerId);
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      pendingLongPressCancel = null;
      hideKeyBubble(e.pointerId);
      if (kbdGestureActive) {
        // 이 키는 스와이프로 소비됐으니 입력 없음(기존 동작). 이 키가 활성 키였다면
        // 자리를 비우고 기다리던 큐를 마저 흘려보낸다.
        if (activeKeyPointerId === e.pointerId) { activeKeyPointerId = null; runQueuedKeyCommits(); }
        flushPendingRenderIfIdle();
        return;
      }
      if (activeKeyPointerId !== null && activeKeyPointerId !== e.pointerId
          && Date.now() - activeKeyPointerSetAt < ACTIVE_KEY_STALE_MS) {
        // 더 먼저 눌린 키가 아직 안 끝났다 — 버리지 않고 순서를 기다리게 큐에 쌓는다.
        queuedKeyCommits.push(onClick);
        flushPendingRenderIfIdle();
        return;
      }
      activeKeyPointerId = null;
      onClick();
      runQueuedKeyCommits();
      flushPendingRenderIfIdle();
    });
    b.addEventListener('pointercancel', (e) => {
      if (e.pointerId === downPointerId) downPointerId = null;
      downKeyPointers.delete(e.pointerId);
      if (activeKeyPointerId === e.pointerId) { activeKeyPointerId = null; runQueuedKeyCommits(); }
      flushPendingRenderIfIdle();
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      pendingLongPressCancel = null;
      hideKeyBubble(e.pointerId);
    });
  }
  return b;
}

// 히트박스가 확장되면서 줄 양 끝 글자(예: 홈로우의 A, L)는 원래 그림 속 키보다
// 훨씬 넓은 버튼 안에 놓이게 돼, 버튼 중앙(=넓어진 히트박스 중앙)으로 flex-정렬된
// 글자가 그림 속 키 칸에서 벗어나 보였다. 그래서 클릭만 받는 투명 버튼(hitStyle)과
// 그림 속 키 위치 그대로 놓이는 순수 표시용 라벨(visualStyle)을 따로 둔다 —
// 둘 다 #kbd의 같은 %좌표계를 공유하니 별도 환산 없이 그대로 쓸 수 있다.
function makeLetterBtn(ch, hitStyle, visualStyle, onClick) {
  const frag = document.createDocumentFragment();
  frag.appendChild(makeBtn('kbd-eng-hit', hitStyle, onClick, null, ch));

  const label = document.createElement('div');
  label.className = 'kbd-label kbd-eng-letter';
  Object.assign(label.style, visualStyle, { position: 'absolute', display: 'flex', pointerEvents: 'none' });
  const sp = document.createElement('span');
  sp.className = 'label-item';
  sp.textContent = ch;
  label.appendChild(sp);
  frag.appendChild(label);

  return frag;
}

// ── 영문 모드 진입/이탈 (한 손가락 상하 스와이프, 방향 무관 토글) ──
function enterEnglishMode() {
  if (shiftTapTimer) { clearTimeout(shiftTapTimer); shiftTapTimer = null; }
  state.engActive = true;
  state.engShiftState = 'off'; // 영문은 소문자로 시작(대문자보다 쓸 일이 훨씬 많음)
  state.activeRoot = null; state.activeCharIdx = 0;
  state.lastSignKey = null; state.signTapIdx = 0;
  state.independentMode = false;
  updateKbdImage();
  render();
}

function exitEnglishMode() {
  if (shiftTapTimer) { clearTimeout(shiftTapTimer); shiftTapTimer = null; }
  state.engActive = false;
  state.engShiftState = 'off';
  updateKbdImage();
  render();
}

// 지금 "기타(임시) 모드"(대문자/숫자·기호/상용구) 안에 있는지. 임시 모드에 처음
// 들어갈 때 기본 모드 기억(baseModeIsEnglish)을 갱신해도 되는지 판단하는 데 쓴다.
function isTemporaryMode() {
  return numericMode || favoritesMode || isShortformActive();
}

// 임시 모드(대문자/숫자·기호/상용구, 뭐가 됐든)에서 "나가기": 진입 직전 상태가 아니라
// 항상 그 임시 모드 체인이 시작되기 전의 기본 모드(힌디 또는 영문 소문자)로 곧장
// 돌아간다. 임시 모드끼리 넘나든 경우(대문자 → 숫자판 등)에도 baseModeIsEnglish는
// 안 바뀌어 있으므로 항상 맨 처음 기본 모드로 정확히 복귀한다.
function exitToBaseMode() {
  numericMode = false;
  if (favoritesMode) hideFavorites();
  state.engActive = baseModeIsEnglish;
  state.engShiftState = 'off';
  state.activeRoot = null; state.activeCharIdx = 0;
  state.lastSignKey = null; state.signTapIdx = 0;
  state.independentMode = false;
  updateKbdImage();
  render();
}

// 가운데 1/3 스와이프(1회): 힌디/영문 소문자 사이의 토글이다. 지금 임시 모드(대문자/
// 숫자·기호/상용구) 안에 있다면 토글이 아니라 그 임시 모드에서 "나가기"로 취급한다 —
// 대문자 모드도 engActive===true인 상태지만 여기서는 절대 "그냥 영문"으로 오인해
// 토글시키지 않는다(그러면 항상 힌디로만 나가져서, 영문 소문자에서 대문자로 들어왔을
// 때는 잘못된 기본 모드로 돌아가 버린다).
function toggleEnglishMode() {
  if (isTemporaryMode()) { exitToBaseMode(); return; }
  if (state.engActive) exitEnglishMode(); else enterEnglishMode();
}

// 우측 1/3 상하 스와이프: "나가기(복귀)"인지는 지금 화면에 실제로 보이는 게 뭔지로
// 판정한다 — numericMode가 배경에서 true라도 상용구 패널이 그 위에 얹혀 있으면 지금
// 보이는 건 상용구지 숫자판이 아니므로, 그 상태의 우측 스와이프는 "숫자판 재스와이프"가
// 아니라 그냥 "숫자 스와이프"(진입)다. 그래서 상용구가 열려 있는지부터 먼저 본다.
// 상용구가 안 보이는 상태에서만 numericMode 자체를 "지금 숫자판이 보이는 중"으로 보고
// 재스와이프=나가기로 취급한다. 좌측(toggleFavoritesMode)은 자기 자신(favoritesMode)의
// 판정만으로 충분한데, 그건 상용구가 항상 최상단에 얹히는 패널이라 "지금 보이는 것"과
// "그 상태 플래그"가 늘 일치하기 때문이다.
function toggleNumericMode() {
  if (favoritesMode) { hideFavorites(); enterNumericMode(); return; }
  if (numericMode) { exitToBaseMode(); return; }
  enterNumericMode();
}

function handleEngLetter(ch) {
  appendText(state.engShiftState === 'off' ? ch.toLowerCase() : ch.toUpperCase());
  if (state.engShiftState === 'once') state.engShiftState = 'off';
  render();
}

function handleEngSpace() { appendText(' '); render(); }

// 영문 모드 3행 마지막 칸의 삭제키 핸들러.
function handleEngBackspace() {
  backspace();
  render();
}

function handleEngEnter() { appendText('\n'); render(); }

// 하단바의 물음표 + 3행 마지막 칸이던 마침표(현재는 하단바로 이동) 공용 핸들러.
function handleEngPunct(ch) { appendText(ch); render(); }

// 시프트: 더블탭=캡스락 토글(다른 폰 키보드와 동일 관례), 싱글탭=임시 대문자 1글자.
// 더블탭 여부는 두 번째 탭이 실제로 오는지 지켜봐야 하므로, 첫 탭은 타이머로 유예한 뒤
// 유예 시간 안에 두 번째 탭이 오면 그 시점에 취소하고 토글로 대체한다(사후 시간차 비교 방식은
// 첫 탭에서 싱글 동작이 이미 실행돼버려 더블탭 시 엉뚱하게 겹쳐 적용되는 버그가 있었음).
// 물리 시프트키 탭에서만 이 타이머 방식을 쓴다 — 손가락을 떼고 다시 눌러야 하는 스와이프는
// 두 번째 동작이 300ms 안에 들어오기 어려워서, 타이머 방식을 그대로 쓰면 첫 스와이프의
// 타이머가 먼저 끝나 'once'가 됐다가 두 번째 스와이프가 그걸 다시 'off'로 되돌려버리는
// 문제가 있었다(2연속 스와이프인데 잠기기는커녕 풀려버림).
let shiftTapTimer = null;
function handleShiftTap() {
  if (shiftTapTimer) {
    clearTimeout(shiftTapTimer);
    shiftTapTimer = null;
    // 캡스락으로 잠그는(off/once -> lock) 순간이 곧 임시 모드(대문자)로 "진입"하는
    // 순간이다 — 숫자판/상용구 진입 때와 똑같이, 아직 임시 모드가 아니었을 때만 지금의
    // engActive를 진짜 기본 모드로 기억해둔다. 안 그러면 나중에 중앙 스와이프로 나갈 때
    // exitToBaseMode가 옛 기억(대개 힌디)을 써버려서, 영문 기본에서 캡스락을 걸었다가
    // 나가면 엉뚱하게 힌디로 돌아가 버린다.
    const lockingOn = state.engShiftState !== 'lock';
    if (lockingOn && !isTemporaryMode()) baseModeIsEnglish = state.engActive;
    state.engShiftState = lockingOn ? 'lock' : 'off';
    render();
    return;
  }
  shiftTapTimer = setTimeout(() => {
    shiftTapTimer = null;
    state.engShiftState = state.engShiftState === 'off' ? 'once' : 'off';
    render();
  }, 300);
}

// 물리 Shift 키 더블탭(handleShiftTap)으로만 도달하는 캡스락 상태. engActive===true인
// 상태 중 하나지만 isTemporaryMode()가 이걸 "그냥 영문"과 구분해줘서, toggleEnglishMode의
// 1회 스와이프 규칙에서 "임시 모드"로 취급돼 exitToBaseMode()로 나간다(진입 전 기본
// 모드를 정확히 기억하고 있다가 그리로 돌아간다).
function isShortformActive() {
  return !numericMode && state.engActive && state.engShiftState === 'lock';
}

function renderEng() {
  const kbd = document.getElementById('kbd');
  kbd.innerHTML = '';
  const upper = state.engShiftState !== 'off';
  const rowY = ENG_HIT_ROWS;

  ENG_ROW1.forEach((ch, i) => kbd.appendChild(makeLetterBtn(upper ? ch : ch.toLowerCase(), {
    left: ENG_HIT_ROW1[i].start + '%', top: rowY[0].start + '%', width: ENG_HIT_ROW1[i].size + '%', height: rowY[0].size + '%'
  }, {
    left: ENG_ROW1_COLS[i] + '%', top: ENG_ROW_TOP[0] + '%', width: ENG_KEY_W + '%', height: ENG_ROW_H + '%'
  }, () => handleEngLetter(ch))));

  ENG_ROW2.forEach((ch, i) => kbd.appendChild(makeLetterBtn(upper ? ch : ch.toLowerCase(), {
    left: ENG_HIT_ROW2[i].start + '%', top: rowY[1].start + '%', width: ENG_HIT_ROW2[i].size + '%', height: rowY[1].size + '%'
  }, {
    left: ENG_ROW2_COLS[i] + '%', top: ENG_ROW_TOP[1] + '%', width: ENG_KEY_W + '%', height: ENG_ROW_H + '%'
  }, () => handleEngLetter(ch))));

  ENG_ROW3.forEach((ch, i) => kbd.appendChild(makeLetterBtn(upper ? ch : ch.toLowerCase(), {
    left: ENG_HIT_ROW3[i + 1].start + '%', top: rowY[2].start + '%', width: ENG_HIT_ROW3[i + 1].size + '%', height: rowY[2].size + '%'
  }, {
    left: ENG_ROW3_COLS[i] + '%', top: ENG_ROW_TOP[2] + '%', width: ENG_KEY_W + '%', height: ENG_ROW_H + '%'
  }, () => handleEngLetter(ch))));

  // 시프트 키도 글자키와 같은 문제였다: 확장된 히트박스 기준으로 "우상단 12%/10%"를
  // 계산하니 초록 점이 그림 속 키 테두리를 넘어가 버렸다. 클릭 전용 투명 버튼(확장
  // 히트박스)과 점을 얹는 표시용 레이어(그림 속 키 위치 그대로)를 분리해서 고친다.
  kbd.appendChild(makeBtn('kbd-eng-hit', {
    left: ENG_HIT_ROW3[0].start + '%', top: rowY[2].start + '%', width: ENG_HIT_ROW3[0].size + '%', height: rowY[2].size + '%'
  }, handleShiftTap, null, '⇧'));

  const shiftCls = 'kbd-shift' + (state.engShiftState === 'lock' ? ' locked' : state.engShiftState === 'once' ? ' once' : '');
  const shiftVisual = document.createElement('div');
  shiftVisual.className = shiftCls;
  Object.assign(shiftVisual.style, {
    position: 'absolute', pointerEvents: 'none',
    left: ENG_SHIFT.left + '%', top: ENG_ROW_TOP[2] + '%', width: ENG_SHIFT.width + '%', height: ENG_ROW_H + '%'
  });
  const dot = document.createElement('span');
  dot.className = 'shift-dot';
  shiftVisual.appendChild(dot);
  kbd.appendChild(shiftVisual);

  // 3행 마지막 칸: 마침표 폐지, 삭제키 부활(이미지에 아이콘 이미 그려져 있음) — 힌디
  // 모드와 동일하게 마침표는 하단바 옛 쉼표 자리로 옮겨갔다.
  kbd.appendChild(makeBtn('kbd-func', {
    left: ENG_HIT_ROW3[8].start + '%', top: rowY[2].start + '%', width: ENG_HIT_ROW3[8].size + '%', height: rowY[2].size + '%'
  }, handleEngBackspace, null, '⌫'));

  // 하단바: [,!] | ? | space | . | 엔터 — 힌디 모드와 동일 재배치. 전부 이미지에 이미
  // 그려져 있어(영문은 힌디처럼 स्वर 겸용 라벨이 필요 없다) 투명 버튼만 얹으면 된다.
  kbd.appendChild(makeBtn('kbd-func', {
    left: ENG_HIT_BOT[0].start + '%', top: rowY[3].start + '%', width: ENG_HIT_BOT[0].size + '%', height: rowY[3].size + '%'
  }, handleCommaExcl, null, peekCommaExcl()));

  kbd.appendChild(makeBtn('kbd-func', {
    left: ENG_HIT_BOT[1].start + '%', top: rowY[3].start + '%', width: ENG_HIT_BOT[1].size + '%', height: rowY[3].size + '%'
  }, () => handleEngPunct('?'), null, '?'));

  kbd.appendChild(makeBtn('kbd-space', {
    left: ENG_HIT_BOT[2].start + '%', top: rowY[3].start + '%', width: ENG_HIT_BOT[2].size + '%', height: rowY[3].size + '%'
  }, handleEngSpace));

  kbd.appendChild(makeBtn('kbd-func', {
    left: ENG_HIT_BOT[3].start + '%', top: rowY[3].start + '%', width: ENG_HIT_BOT[3].size + '%', height: rowY[3].size + '%'
  }, () => handleEngPunct('.'), null, '.'));

  kbd.appendChild(makeBtn('kbd-enter', {
    left: ENG_HIT_BOT[4].start + '%', top: rowY[3].start + '%', width: ENG_HIT_BOT[4].size + '%', height: rowY[3].size + '%'
  }, handleEngEnter));
  kbd.appendChild(makeEnterLabel([ENG_BOT_SECTIONS.enter[0], ENG_BOT_SECTIONS.enter[1]], ENG_BOT_Y, ENG_BOT_H));
}

// ── 간편 모드 전환: 자판 영역을 좌/중/우 1/3로 나눠 각 구역의 상하 스와이프에 서로
// 다른 동작을 배정한다 (좌: 상용구, 중앙: 힌디↔영문 토글, 우: 숫자/기호). 삭제는
// 각 모드에 부활한 물리 키로만 한다(스와이프 삭제는 폐지). 방향 상관없이 일정 거리
// 이상 이동하면 발동한다.
// 이제 한 지점(포인터 1개)만 있으면 되므로 터치 전용 이벤트 대신 Pointer Events를
// 쓴다 — 폰 터치와 PC 마우스 드래그를 같은 코드로 함께 지원하기 위함(PC에서도
// 마우스로 클릭+드래그하면 테스트 가능).
// 좌/우 구역은 파카하라/영문/숫자 어느 자판 위에서든 항상 똑같이 동작하는 "모드 전환"
// 스위치다 — 각자 목표 모드로 곧장 보내고, 이미 그 모드라면 토글로 진입 직전 상태로
// 되돌린다(좌: 상용구, 우: 숫자판, 둘 다 같은 패턴).
(function initSwipeGesture() {
  const wrap = document.getElementById('keyboard-wrap');
  // 오래 누르기를 하면 안드로이드/데스크톱 브라우저가 pointerdown의 preventDefault와
  // 무관하게 "이미지 저장" 같은 contextmenu를 별도로 띄운다 — CSS의 user-select/
  // touch-callout:none만으로는 못 막아서 이벤트 자체를 막는다.
  wrap.addEventListener('contextmenu', (e) => e.preventDefault());
  let activePointerId = null;
  let activePointerSetAt = 0;
  let startX = null, startY = null, triggered = false, zone = null;
  const SWIPE_MIN_PX = 28;       // 최소 이동 거리
  const SWIPE_V_H_RATIO = 1.3;   // 두 축 중 하나가 반대축보다 이 배 이상이어야 스와이프로 인정(대각선 오조작 방지)

  function zoneOf(clientX) {
    const r = wrap.getBoundingClientRect();
    const ratio = (clientX - r.left) / r.width;
    if (ratio < 1 / 3) return 'left';
    if (ratio < 2 / 3) return 'center';
    return 'right';
  }

  // 실기기에서 pointerup/cancel이 유실되면(이 파일 다른 곳에서도 이미 겪은 문제)
  // activePointerId가 영원히 안 풀려서, 그 뒤로 이 손가락이 하나도 안 눌린 것처럼
  // 보이는 wrap의 pointerdown 가드(아래) 때문에 스와이프 자체가 영구적으로
  // 먹통이 됐었다("중앙 스와이프 무반응"). 다른 손가락의 새 pointerdown이 들어왔는데
  // 추적 중이던 손가락이 일정 시간 지나도 안 풀렸다면 유실로 간주하고 강제로
  // 상태를 정리한 뒤 새 손가락을 받는다.
  function forceResetGesture() {
    activePointerId = null; startX = null; startY = null; triggered = false; zone = null;
    kbdGestureActive = false;
    swipeInProgressPointerId = null;
  }

  wrap.addEventListener('pointerdown', (e) => {
    // 상용구 패널이 열려 있어도 모든 스와이프를 그대로 통과시킨다 — 좌/중앙은 닫기/복귀,
    // 우측은 (예: 상용구를 고르려다 마음이 바뀐 경우) 패널을 닫고 그 모드로 바로 들어간다.
    if (activePointerId !== null) {
      if (Date.now() - activePointerSetAt < ACTIVE_KEY_STALE_MS) return; // 아직 진행 중일 수 있음 — 무시(오조작 방지)
      forceResetGesture(); // 오래 안 풀림 = 유실로 보고 회복
    }
    activePointerId = e.pointerId;
    activePointerSetAt = Date.now();
    startX = e.clientX; startY = e.clientY;
    triggered = false;
    zone = zoneOf(e.clientX);
  });

  // 스와이프가 확정된 순간 공통으로 해줘야 하는 뒷정리(롱프레스 취소, 포인터 강제 캡처).
  // 캡처가 없으면 손가락이 wrap 밖(예: 바로 위 입력창)으로 빠져나간 채로 손을 뗄 때
  // pointerup이 wrap까지 전달되지 않아 kbdGestureActive가 true로 영원히 걸려버리고,
  // 그 순간부터 모든 키 입력이 무시되는 "먹통" 상태가 됐었다.
  function armGesture(e) {
    triggered = true;
    kbdGestureActive = true;
    swipeInProgressPointerId = e.pointerId; // render() 게이트에서 이 손가락만 예외로 친다
    // 이 손가락이 스와이프를 시작한 키 버튼 위에서 눌렸었다면, 그 버튼은 이미
    // pointerdown에서 자기 자신에게 setPointerCapture를 걸어놨다. 아래에서 wrap이
    // 캡처를 가로채면 그 버튼은 이 손가락의 pointerup을 다시는 못 받는다(캡처를
    // 가진 쪽으로 이벤트가 재대상되고, 그 버튼은 더 이상 캡처 대상이 아니므로 버블링도
    // 안 됨) — 즉 downKeyPointers에서 이 손가락 항목이 영원히(1.5초 자연복구 전까지)
    // 안 지워져 render()가 그동안 막혀서, 배경 이미지(updateKbdImage)는 이미 바뀌었는데
    // 자판 오버레이(#kbd, 라벨)는 옛 모드로 계속 남아 두 모드가 겹쳐 보이는 버그가
    // 됐었다. 캡처를 가로채는 바로 이 순간 직접 지워서 그 유예 시간 자체를 없앤다.
    downKeyPointers.delete(e.pointerId);
    if (activeKeyPointerId === e.pointerId) { activeKeyPointerId = null; runQueuedKeyCommits(); }
    if (pendingLongPressCancel) { pendingLongPressCancel(); pendingLongPressCancel = null; }
    // 스와이프를 시작한 손가락이 마침 어떤 키 위에서 눌렸었다면(눌림→스와이프로
    // 이어지는 흔한 경우), 그 키의 말풍선이 스와이프 내내 화면에 얼어붙어 있었다 —
    // 스와이프 지원 키보드들이 흔히 하듯, 제스처로 확정되는 순간 즉시 지운다(눌렀던
    // 키를 실제로 입력하지 않을 것이므로 대표 문자를 계속 보여줄 이유가 없다).
    hideKeyBubble(e.pointerId);
    try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
  }

  wrap.addEventListener('pointermove', (e) => {
    if (e.pointerId !== activePointerId || startX == null || triggered) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dy) < SWIPE_MIN_PX) return;
    if (Math.abs(dy) < Math.abs(dx) * SWIPE_V_H_RATIO) return;
    armGesture(e);
    // 스와이프 자체(제스처 확정, 포인터 캡처, 키 입력과의 경합 정리)는 항상 그대로
    // 처리한다 — FAVORITES_ENABLED가 꺼져 있을 땐 그냥 이 좌측 스와이프에 묶인 동작이
    // 없을 뿐이다(조용히 아무 일도 안 일어남 — 무료 버전에 이 기능이 있다는 티를 내지
    // 않기 위함).
    if (zone === 'left') { if (FAVORITES_ENABLED) runZoneAction('left', toggleFavoritesMode); }
    else if (zone === 'center') runZoneAction('center', toggleEnglishMode);
    else runZoneAction('right', toggleNumericMode);
  });

  function runZoneAction(zone, fn) {
    if (zoneSwipeInterceptor) zoneSwipeInterceptor(zone, fn);
    else fn();
  }

  function endGesture(e) {
    if (e.pointerId !== activePointerId) return;
    try { wrap.releasePointerCapture(e.pointerId); } catch (err) {}
    activePointerId = null; startX = null; startY = null; triggered = false; zone = null; kbdGestureActive = false;
    if (swipeInProgressPointerId === e.pointerId) swipeInProgressPointerId = null;
  }
  wrap.addEventListener('pointerup', endGesture);
  wrap.addEventListener('pointercancel', endGesture);

  // resetAll()이 "제스처 추적이 꼬여 있어도 리셋으로는 항상 풀리게" 하려면 이
  // IIFE 안에 갇힌 activePointerId 등도 같이 정리해야 한다 — forceResetGesture를
  // 바깥에서 부를 수 있게 전역 훅에 등록해둔다.
  resetSwipeGestureState = forceResetGesture;
})();

function render() {
  if (isRenderBlocked()) { renderPending = true; return; }
  renderPending = false;
  if (numericMode) { renderNumeric(); }
  else if (state.engActive) { renderEng(); }
  else { renderDevanagari(); }
  if (onTutorialRender) onTutorialRender();
}

function renderNumeric() {
  const kbd = document.getElementById('kbd');
  kbd.innerHTML = '';

  // 1~3행: 10열 균등 그리드, 칸마다 글자 하나 — 전부 이미지에 이미 그려져 있어 투명
  // 버튼만 얹으면 된다.
  for (let r = 0; r < 3; r++) {
    const rowTop = NUM_HIT_ROWS[r].start;
    const rowH = NUM_HIT_ROWS[r].size;
    NUM_ROWS[r].forEach((ch, c) => {
      const style = { left: NUM_HIT_COLS[c].start + '%', top: rowTop + '%', width: NUM_HIT_COLS[c].size + '%', height: rowH + '%' };
      kbd.appendChild(makeBtn('kbd-func', style, () => handleNumSingle(ch), null, ch));
    });
  }

  // 4행: 8칸 + 삭제키(부활, 우측 끝 넓은 칸)
  const row4Top = NUM_HIT_ROWS[3].start, row4H = NUM_HIT_ROWS[3].size;
  NUM_ROW4.forEach((ch, c) => {
    const style = { left: NUM_HIT_ROW4[c].start + '%', top: row4Top + '%', width: NUM_HIT_ROW4[c].size + '%', height: row4H + '%' };
    kbd.appendChild(makeBtn('kbd-func', style, () => handleNumSingle(ch), null, ch));
  });
  kbd.appendChild(makeBtn('kbd-func', {
    left: NUM_HIT_ROW4[8].start + '%', top: row4Top + '%', width: NUM_HIT_ROW4[8].size + '%', height: row4H + '%'
  }, handleNumBS, null, '⌫'));

  // 5행(하단바): ` | ! | ? | 스페이스 | , | . | 엔터
  const botRow = NUM_HIT_ROWS[4];
  kbd.appendChild(makeBtn('kbd-func', {
    left: NUM_HIT_BOT[0].start + '%', top: botRow.start + '%', width: NUM_HIT_BOT[0].size + '%', height: botRow.size + '%'
  }, () => handleNumSingle('`'), null, '`'));

  kbd.appendChild(makeBtn('kbd-func', {
    left: NUM_HIT_BOT[1].start + '%', top: botRow.start + '%', width: NUM_HIT_BOT[1].size + '%', height: botRow.size + '%'
  }, () => handleNumSingle('!'), null, '!'));

  kbd.appendChild(makeBtn('kbd-func', {
    left: NUM_HIT_BOT[2].start + '%', top: botRow.start + '%', width: NUM_HIT_BOT[2].size + '%', height: botRow.size + '%'
  }, () => handleNumSingle('?'), null, '?'));

  kbd.appendChild(makeBtn('kbd-space', {
    left: NUM_HIT_BOT[3].start + '%', top: botRow.start + '%', width: NUM_HIT_BOT[3].size + '%', height: botRow.size + '%'
  }, handleNumSpace));

  // 스페이스바 라벨: 이미지가 공란이라(영문 모드의 "space"와 달리) 직접 그려 넣는다.
  const numSpaceLabel = document.createElement('div');
  numSpaceLabel.className = 'kbd-space-label';
  Object.assign(numSpaceLabel.style, {
    left: NUM_BOT_SECTIONS.space[0] + '%', top: NUM_ROW_TOP[4] + '%',
    width: (NUM_BOT_SECTIONS.space[1] - NUM_BOT_SECTIONS.space[0]) + '%', height: NUM_ROW_H[4] + '%',
  });
  const numSpWord = document.createElement('span'); numSpWord.className = 'sp-part dark'; numSpWord.textContent = 'स्पेस';
  numSpaceLabel.appendChild(numSpWord);
  kbd.appendChild(numSpaceLabel);

  kbd.appendChild(makeBtn('kbd-func', {
    left: NUM_HIT_BOT[4].start + '%', top: botRow.start + '%', width: NUM_HIT_BOT[4].size + '%', height: botRow.size + '%'
  }, () => handleNumSingle(','), null, ','));

  kbd.appendChild(makeBtn('kbd-func', {
    left: NUM_HIT_BOT[5].start + '%', top: botRow.start + '%', width: NUM_HIT_BOT[5].size + '%', height: botRow.size + '%'
  }, () => handleNumSingle('.'), null, '.'));

  kbd.appendChild(makeBtn('kbd-enter', {
    left: NUM_HIT_BOT[6].start + '%', top: botRow.start + '%', width: NUM_HIT_BOT[6].size + '%', height: botRow.size + '%'
  }, handleNumEnter));
  kbd.appendChild(makeEnterLabel([NUM_BOT_SECTIONS.enter[0], NUM_BOT_SECTIONS.enter[1]], NUM_ROW_TOP[4], NUM_ROW_H[4]));
}

// ── 상용구(즐겨찾기) 패널 ──────────────────────────────────────────────
// fav.png 실측(1356×750) 기준 % 좌표. 9칸(3x3) + 하단 가운데 넓은 칸 1개 = 10개.
const FAV_SLOTS = [
  { left:1.18,  top:3.20,  width:31.34, height:19.73 },
  { left:34.37, top:3.20,  width:31.34, height:19.73 },
  { left:67.48, top:3.20,  width:31.34, height:19.73 },
  { left:1.18,  top:28.00, width:31.34, height:19.60 },
  { left:34.29, top:28.00, width:31.42, height:19.60 },
  { left:67.48, top:28.00, width:31.34, height:19.60 },
  { left:1.18,  top:52.40, width:31.34, height:19.73 },
  { left:34.37, top:52.40, width:31.34, height:19.73 },
  { left:67.48, top:52.27, width:31.34, height:19.60 },
  { left:25.96, top:76.80, width:48.16, height:19.73 },
];
const FAV_CLOSE_RECT = { left:1.03,  top:76.93, width:23.23, height:19.60 };
const FAV_EDIT_RECT  = { left:75.74, top:76.80, width:23.30, height:19.73 };

const DEFAULT_FAVORITES = [
  'नमस्ते', 'ठीक है', 'क्या हाल है?', 'धन्यवाद', 'शुक्रिया',
  'कोई बात नहीं', 'क्या चल रहा है?', 'बाद में बात करते हैं', 'शुभ रात्रि', 'मुझे समझ नहीं आया',
];
const FAV_STORAGE_KEY = 'mantrakey_fav_phrases';

function loadFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_STORAGE_KEY));
    if (Array.isArray(raw) && raw.length === 10) return raw;
  } catch (e) {}
  return DEFAULT_FAVORITES.slice();
}

function rectStyle(r) {
  return { left: r.left + '%', top: r.top + '%', width: r.width + '%', height: r.height + '%' };
}

function renderFavorites() {
  const wrap = document.getElementById('fav-slots');
  wrap.innerHTML = '';
  loadFavorites().forEach((text, i) => {
    const b = makeBtn('fav-slot', rectStyle(FAV_SLOTS[i]), () => insertFavorite(text));
    const sp = document.createElement('span');
    sp.textContent = text;
    b.appendChild(sp);
    wrap.appendChild(b);
  });
  wrap.appendChild(makeBtn('fav-close', rectStyle(FAV_CLOSE_RECT), exitToBaseMode));
  wrap.appendChild(makeBtn('fav-edit', rectStyle(FAV_EDIT_RECT), openFavoriteEditor));
}

function showFavorites() {
  if (!isTemporaryMode()) baseModeIsEnglish = state.engActive;
  favoritesMode = true;
  renderFavorites();
  document.getElementById('fav-overlay').classList.add('show');
}
function hideFavorites() {
  favoritesMode = false;
  document.getElementById('fav-overlay').classList.remove('show');
}

// 좌측 1/3 스와이프 = 상용구 모드 토글. 이미 열려 있으면 "나가기"다 — 대문자/숫자판
// 위에서 열렸을 수도 있으므로(패널은 그 밑 모드를 안 바꾸고 그냥 얹힐 뿐이다) 단순히
// hideFavorites만 하면 그 밑에 깔려 있던 임시 모드가 그대로 남는다. 다른 임시 모드의
// "나가기"와 똑같이 항상 진짜 기본 모드(힌디/영문)까지 복귀해야 한다.
function toggleFavoritesMode() {
  if (favoritesMode) exitToBaseMode(); else showFavorites();
}

// 상용구는 항상 커서(=문장 끝)에 삽입한 뒤 패널을 닫는다 — 이때도 위와 같은 이유로
// 패널만 닫지 않고 기본 모드까지 복귀한다(exitToBaseMode가 hideFavorites까지 포함).
function insertFavorite(text) {
  appendText(text);
  exitToBaseMode();
}

// 키보드 앱은 자기 영역 밖(메인 앱 화면)을 그릴 수 없으므로, 실제 제품이라면 메인 앱의
// 상용구 편집 화면을 띄워야 한다. 이 데모에서는 그 화면을 흉내낸 별도 페이지로 이동한다.
// 이미 그 편집 페이지 위에 떠 있는 상용구 패널이라면(자기 자신을 다시 열게 되므로)
// 편집 중인 다른 칸의 내용을 잃지 않도록 그냥 패널만 닫는다.
function openFavoriteEditor() {
  if (/(^|\/)fav_edit\.html$/.test(location.pathname)) { hideFavorites(); return; }
  if (typeof onBeforeOpenFavoriteEditor === 'function') onBeforeOpenFavoriteEditor();
  location.href = 'fav_edit.html';
}

function renderDevanagari() {
  const kbd = document.getElementById('kbd');
  kbd.innerHTML = '';
  const isIndep = independentActive();

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const root = leftKeys[row][col];
      kbd.appendChild(makeBtn('kbd-cons', {
        left: HIT_COLS[col].start + '%', top: HIT_ROWS[row].start + '%', width: HIT_COLS[col].size + '%', height: HIT_ROWS[row].size + '%'
      }, () => handleConsonant(root), LONGPRESS_HINT_CONSONANT, root));
    }

    for (let col = 0; col < 3; col++) {
      const rk = rightKeys[row][col];
      const imgCol = col + 5;
      const style = { left: HIT_COLS[imgCol].start + '%', top: HIT_ROWS[row].start + '%', width: HIT_COLS[imgCol].size + '%', height: HIT_ROWS[row].size + '%' };

      if (rk.type === 'next') {
        let labels = [];
        let extraCls = ' kbd-next';
        if (isIndep) { labels = ['अ']; extraCls += ' independent'; }
        else if (state.activeRoot) { labels = consonantGroups[state.activeRoot].slice(1); extraCls += ' next-active'; }
        else { labels = ['अ']; extraCls += ' next-idle'; } // 자음도 안 친 초기 상태: 같은 अ를 회색 힌트로만 미리 보여줌
        if (labels.length) extraCls += ' count-' + labels.length;
        const b = makeBtn('kbd-label' + extraCls, style, handleNext, null, peekNext());
        labels.forEach(ch => {
          const sp = document.createElement('span');
          sp.className = 'label-item'; sp.innerHTML = mkLabelHtml(ch); // 마라티어 ऱ् → ‿ 등 표시용 글자
          b.appendChild(sp);
        });
        kbd.appendChild(b);

      } else if (rk.type === 'bs') {
        // 삭제키 부활 — 이미지에 이미 아이콘이 그려져 있어 투명 버튼만 얹으면 된다.
        kbd.appendChild(makeBtn('kbd-func', style, handleBS, null, '⌫'));

      } else if (rk.type === 'sign') {
        const chars = isIndep ? (rk.indep || rk.chars) : rk.chars;
        const cls = 'kbd-label key-' + rk.id + ' count-' + chars.length + (isIndep && rk.indep ? ' independent' : '');
        const b = makeBtn(cls, style, () => handleVowelKey(rk), LONGPRESS_HINT_SIGN, peekVowelKey(rk));
        chars.forEach(ch => {
          const sp = document.createElement('span');
          sp.className = 'label-item' + (ch === 'ृ' ? ' gap-l' : ''); sp.textContent = markLabel(ch);
          b.appendChild(sp);
        });
        kbd.appendChild(b);
      }
    }
  }

  // 하단바: ! | ? | , | 스페이스/स्वर | 마침표(।/../…) | 엔터 — 벵골어 힘못키와 같은
  // 배열. ! ? , 는 멀티탭 없이 한 글자씩. 마침표·엔터 라벨만 이미지에 공란이라 직접 그린다.
  const botRow = HIT_ROWS[3];
  const botStyle = i => ({ left: HIT_BOT_SECTIONS[i].start + '%', top: botRow.start + '%', width: HIT_BOT_SECTIONS[i].size + '%', height: botRow.size + '%' });
  kbd.appendChild(makeBtn('kbd-func', botStyle(0), () => handlePunct('!'), null, '!'));
  kbd.appendChild(makeBtn('kbd-func', botStyle(1), () => handlePunct('?'), null, '?'));
  kbd.appendChild(makeBtn('kbd-func', botStyle(2), () => handlePunct(','), null, ','));
  kbd.appendChild(makeBtn('kbd-space', botStyle(3), handleSpace));

  // 스페이스바 라벨(이미지엔 공란): 그림에 그려진 키 모양 그대로의 위치에 둔다 —
  // 독립모음 모드(공란 이후)일 때만 전부 검게, 노멀일 때는 "स्वर" 부분만 회색으로.
  const [s0, s1] = BOT_SECTIONS.space;
  const spaceLabel = document.createElement('div');
  spaceLabel.className = 'kbd-space-label';
  Object.assign(spaceLabel.style, { left: s0 + '%', top: BOT_Y + '%', width: (s1 - s0) + '%', height: BOT_H + '%' });
  [['स्पेस', 'dark'], ['/', 'dark'], ['स्वर', isIndep ? 'dark' : 'gray']].forEach(([w, tone]) => {
    const sp = document.createElement('span'); sp.className = 'sp-part ' + tone; sp.textContent = w;
    spaceLabel.appendChild(sp);
  });
  kbd.appendChild(spaceLabel);

  // 마침표: 순환 규칙은 handleDanda(dandaSeq) 그대로.
  kbd.appendChild(makeBtn('kbd-func', botStyle(4), handleDanda, null, peekDanda()));
  const [d0, d1] = BOT_SECTIONS.danda;
  const dandaLabel = document.createElement('div');
  dandaLabel.className = 'kbd-danda-label';
  Object.assign(dandaLabel.style, { left: d0 + '%', top: BOT_Y + '%', width: (d1 - d0) + '%', height: BOT_H + '%' });
  dandaLabel.textContent = dandaKeyLabel();
  kbd.appendChild(dandaLabel);

  kbd.appendChild(makeBtn('kbd-enter', botStyle(5), handleEnter));
  kbd.appendChild(makeEnterLabel(BOT_SECTIONS.enter, BOT_Y, BOT_H));
}

function resetAll() {
  if (shiftTapTimer) { clearTimeout(shiftTapTimer); shiftTapTimer = null; }
  kbdGestureActive = false; // 혹시 제스처 추적이 꼬여 키 입력이 막혀 있었더라도 리셋으로는 항상 풀리도록
  if (resetSwipeGestureState) resetSwipeGestureState();
  setText('');
  state = {
    activeRoot:null, activeCharIdx:0, lastSignKey:null, signTapIdx:0, signIndepMode:false, independentMode:false,
    engActive:false, engShiftState:'off',
  };
  numericMode = false; baseModeIsEnglish = false;
  activeKeyPointerId = null; activeKeyPointerSetAt = 0; queuedKeyCommits = [];
  downKeyPointers.clear(); swipeInProgressPointerId = null; renderPending = false;
  hideFavorites();
  updateKbdImage();
  render();
}

// 영문/숫자 자판 이미지는 처음 그 모드로 스와이프해 들어가는 순간에야 브라우저가
// 불러오기 시작해서 그 첫 진입에서만 살짝 버퍼링이 생겼다. 시작하자마자 미리
// 받아 디코딩까지 끝내두면 실제로 전환할 때는 이미 캐시돼 있어 바로 나온다.
['images/keyboard_eng.png', 'images/bg_numeric_keyboard.png'].forEach(src => {
  const img = new Image();
  img.src = src;
});
