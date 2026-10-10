// ── 배열 공용 도우미 — 모든 언어 배열(layouts/<언어>.js의 MK_LAYOUT)에 공통으로 쓴다 ──
// 페이지에서는 layouts/<언어>.js 바로 다음에 로드한다.

// 만트라 한 줄을 [{text, hl}] 조각으로 나눈다 ('[ज]ब' → [{ज,true},{ब,false}])
function mkMantraSegments(line) {
  return line.split(/(\[[^\]]+\])/).filter(Boolean).map(p =>
    p.startsWith('[') ? { text: p.slice(1, -1), hl: true } : { text: p, hl: false });
}

// 만트라 한 줄을 강조 span이 들어간 HTML로 (cls: 강조 클래스, 없으면 강조 없이 평문)
function mkMantraHtml(line, cls) {
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return mkMantraSegments(line)
    .map(s => s.hl && cls ? `<span class="${cls}">${esc(s.text)}</span>` : esc(s.text)).join('');
}

// 키캡·다음키에 보여줄 글자 HTML — MK_LAYOUT.displayLabels에 있으면 그 표시용 글자로
// (예: 마라티어 ऱ् → 위로 올린 ‿), 없으면 글자 그대로. 실제 입력 글자와는 무관하다.
function mkLabelHtml(ch) {
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const d = (MK_LAYOUT.displayLabels || {})[ch];
  if (!d) return esc(ch);
  return `<span style="display:inline-block;position:relative;top:-${d.raise || 0}em">${esc(d.text)}</span>`;
}

// 어떤 글자(ख 등)를 입력하려면 누를 자음키 자리 — {row, col, root, pcKey} 또는 null
function mkConsonantPos(ch) {
  for (let r = 0; r < MK_LAYOUT.consonantRows.length; r++) {
    for (let c = 0; c < MK_LAYOUT.consonantRows[r].length; c++) {
      const root = MK_LAYOUT.consonantRows[r][c];
      if (MK_LAYOUT.consonantGroups[root].includes(ch)) {
        return { row: r, col: c, root, pcKey: MK_LAYOUT.pcConsonantKeys[r][c] };
      }
    }
  }
  return null;
}
