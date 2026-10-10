// ── 언어 선택 메뉴 (우상단) ────────────────────────────────────────────────
// 모든 언어판 페이지가 이 파일 하나를 공유한다. 언어를 추가할 땐 MK_LANGS에 한 줄 넣고
// 그 언어 폴더를 만들면 된다. 페이지는 두 가지만 알려주면 된다:
//   <html lang="hi" data-mk-root="">        ← 루트(힌디어) 페이지
//   <html lang="ne" data-mk-root="../">     ← 언어 폴더 안 페이지 (루트까지의 상대 경로)
//   <div id="lang-picker"></div>            ← 메뉴가 들어갈 자리
// 메뉴엔 각 언어를 자기 글자로 쓴 이름만 보여준다(해당 언어 사용자가 바로 알아보도록).
// 링크는 폴더(mai/)가 아니라 mai/index.html까지 적는다 — 웹서버는 폴더만 줘도 index.html을
// 보여주지만, PC에서 파일을 직접 열어 볼 때(file://)는 폴더 목록이 떠버리기 때문.
const MK_LANGS = [
  { code: 'hi',  name: 'हिन्दी', path: '' },
  { code: 'mai', name: 'मैथिली', path: 'mai/' },
  { code: 'ne',  name: 'नेपाली', path: 'ne/' },
  { code: 'mr',  name: 'मराठी',  path: 'mr/' },
];

(function initLangPicker() {
  const host = document.getElementById('lang-picker');
  if (!host) return;
  const html = document.documentElement;
  const cur = html.lang;
  const root = html.dataset.mkRoot || '';
  const current = MK_LANGS.find(l => l.code === cur) || MK_LANGS[0];

  host.className = 'relative shrink-0';
  host.innerHTML = `
    <button type="button" id="lang-btn" aria-haspopup="true" aria-expanded="false"
      class="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-blue-400 transition"
      style="font-family:'Noto Sans Devanagari',sans-serif">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>
      </svg>
      <span>${current.name}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
    </button>
    <ul id="lang-menu" role="menu"
      class="hidden absolute right-0 mt-2 w-36 py-1 rounded-xl border border-gray-100 bg-white shadow-xl z-50"
      style="font-family:'Noto Sans Devanagari',sans-serif">
      ${MK_LANGS.map(l => `
        <li role="none"><a role="menuitem" lang="${l.code}" hreflang="${l.code}" href="${root + l.path}index.html"
          class="block px-4 py-2 text-sm ${l.code === current.code ? 'font-bold text-blue-600' : 'text-gray-700 hover:bg-gray-50'}"
          ${l.code === current.code ? 'aria-current="page"' : ''}>${l.name}</a></li>`).join('')}
    </ul>`;

  const btn = host.querySelector('#lang-btn');
  const menu = host.querySelector('#lang-menu');
  const setOpen = open => {
    menu.classList.toggle('hidden', !open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  btn.addEventListener('click', e => { e.stopPropagation(); setOpen(menu.classList.contains('hidden')); });
  document.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
})();
