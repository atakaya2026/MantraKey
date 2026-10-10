"""
언어판 빌드: 루트(힌디어) 페이지들을 원본으로 mai/ ne/ mr/ 폴더의 페이지를 만들어 낸다.

    python tools/build_langs.py

- 원본은 언제나 루트의 힌디어 파일이다. 언어 폴더의 파일은 손으로 고치지 말고,
  루트 파일이나 i18n/<언어>.json을 고친 뒤 이 스크립트를 다시 돌린다.
- 하는 일
  1) 문구 교체: i18n/<언어>.json의 [힌디어 원문, 번역] 쌍 (긴 원문부터, 한 번에)
  2) 경로 보정: 이미지·스크립트 같은 공용 파일은 ../ 로 루트를 가리키게
  3) 배열·이미지 교체: layouts/hi.js → layouts/<배열>.js, images/X → images/<언어>/X
     (images/<언어>/ 폴더에 같은 이름 파일이 있을 때만)
  4) <html lang>, 정식 주소(canonical·og:url), 모바일 QR 주소를 언어판 주소로
- 끝나면 확인 결과를 출력한다: 원문을 못 찾은 번역 쌍(루트 문구가 바뀌었다는 뜻),
  번역 안 된 채 남은 힌디어 문구.
"""
import json, os, re, sys, unicodedata

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 언어별 설정 — 새 언어를 넣을 땐 여기에 한 줄 + i18n/<코드>.json + lang.js의 MK_LANGS
LANGS = {
    # mantra: 배열은 그대로 두고 만트라만 바꿀 때 layouts/mantra/<코드>.js를 배열 파일 다음에 끼운다
    # images: images/<폴더>/에 있는 파일만 그 언어 전용 이미지로 바꿔 끼운다(없으면 힌디어 것 그대로)
    'mai': {'layout': 'hi', 'mantra': 'mai', 'images': 'mai', 'allow': []},
    'ne':  {'layout': 'hi', 'mantra': 'ne', 'images': 'ne', 'allow': []},
    'mr':  {'layout': 'mr', 'images': 'mr', 'allow': []},
}

# 언어 폴더에 복사하는 파일(문구가 들어 있는 것들). 나머지는 루트 것을 ../ 로 같이 쓴다.
PAGES = ['index.html', 'mobile_demo.html', 'pc_demo_windows.html', 'challenge.html',
         'tutorial.html', 'try.html', 'mole.html']
LOCAL_JS = ['keyboard.js', 'tutorial.js', 'mole_game.js']

# 번역하지 않아도 되는 힌디어(제품명·자판 라벨 등). 'HI_MANTRA'는 힌디어 만트라 세 줄.
ALWAYS_ALLOWED = {
    'मंत्रकी', 'पीसी मंत्रकी', 'मोबाइल मंत्रकी', 'मंत्रकी PC Demo', 'मंत्रकी Tutorial',
    'मंत्रकी · MantraKey', 'स्पेस/स्वर', 'स्पेस', 'स्वर', 'मोल गेम', 'हलंत',
    'हिन्दी', 'मैथिली', 'नेपाली', 'मराठी',
}
HI_MANTRA = {'जब लिखना हो, सिर दर्द!', 'मंत्रकी, यस!', 'टाइपिंग वाह! न पढ़ाई, चमत्कार!'}

ASSET_RE = re.compile(r"""(['"(])(?:\./)?((?:images|layouts)/|keyboard\.css|lang\.js)""")


def nfc(s):
    return unicodedata.normalize('NFC', s)


def strip_comments(s):
    s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    s = re.sub(r'(?m)^\s*//.*$', '', s)
    s = re.sub(r'(?<=[;,{}\)\]])\s*//[^\n]*', '', s)
    return s


def dev_runs(s):
    """주석을 뺀 코드에서 데바나가리가 들어간 문구 덩어리들"""
    runs = re.findall(r"[^<>'\"`\n{}()=;]*[ऀ-ॿ][^<>'\"`\n{}()=;]*", strip_comments(s))
    return {r.strip() for r in runs if r.strip()}


def build_lang(code, cfg):
    with open(os.path.join(ROOT, 'i18n', code + '.json'), encoding='utf-8') as f:
        data = json.load(f)
    pairs = [(nfc(a), nfc(b)) for a, b in data['pairs']]
    table = dict(pairs)
    keys = sorted(table, key=len, reverse=True)
    pat = re.compile('|'.join(re.escape(k) for k in keys))
    used = set()

    def translate(m):
        used.add(m.group(0))
        return table[m.group(0)]

    img_dir = cfg.get('images')
    img_path = os.path.join(ROOT, 'images', img_dir) if img_dir else None
    overrides = sorted(os.listdir(img_path)) if img_path and os.path.isdir(img_path) else []
    out_dir = os.path.join(ROOT, code)
    os.makedirs(out_dir, exist_ok=True)

    # 경고하지 않을 힌디어: 공통 허용 목록 + JSON의 keep + 번역문 안에 그대로 들어 있는 말
    # (예: 네팔어 번역에도 "पीसी संस्करण"이 그대로 쓰이면 번역 누락이 아니다)
    allowed = set(ALWAYS_ALLOWED) | {nfc(k) for k in data.get('keep', [])}
    if 'HI_MANTRA' in cfg['allow']:
        allowed |= HI_MANTRA
    translations = [b for _, b in pairs]
    leftovers = []

    for name in PAGES + LOCAL_JS:
        src = nfc(open(os.path.join(ROOT, name), encoding='utf-8').read())
        t = pat.sub(translate, src)
        t = ASSET_RE.sub(r'\1../\2', t)
        for img in overrides:
            t = re.sub(r'\.\./images/' + re.escape(img) + r'(?=["\'\s)?])',
                       f'../images/{img_dir}/{img}', t)
        if cfg['layout'] != 'hi':
            t = t.replace('../layouts/hi.js', f"../layouts/{cfg['layout']}.js")
        if cfg.get('mantra'):
            tag = f'<script src="../layouts/{cfg["layout"]}.js"></script>'
            t = t.replace(tag, tag + f'\n<script src="../layouts/mantra/{cfg["mantra"]}.js"></script>')
        t = t.replace('<html lang="hi" data-mk-root="">', f'<html lang="{code}" data-mk-root="../">')
        t = t.replace('<html lang="hi">', f'<html lang="{code}">')
        t = t.replace('<link rel="canonical" href="https://mantrakey.com/">',
                      f'<link rel="canonical" href="https://mantrakey.com/{code}/">')
        t = t.replace('<meta property="og:url" content="https://mantrakey.com/">',
                      f'<meta property="og:url" content="https://mantrakey.com/{code}/">')
        t = t.replace("'https://mantrakey.com/mobile_demo.html'", f"'https://mantrakey.com/{code}/mobile_demo.html'")

        stamp = (f'자동 생성 파일 ({code}) — tools/build_langs.py. 직접 고치지 말고 루트의 {name} 또는 '
                 f'i18n/{code}.json을 고친 뒤 다시 빌드할 것.')
        if name.endswith('.html'):
            t = t.replace('<!DOCTYPE html>', f'<!DOCTYPE html>\n<!-- {stamp} -->', 1)
        else:
            t = f'// {stamp}\n' + t
        with open(os.path.join(out_dir, name), 'w', encoding='utf-8', newline='\n') as f:
            f.write(t)

        src_runs = dev_runs(src)
        for r in sorted(dev_runs(t)):
            word = r.rstrip('\\').strip()
            if (r in src_runs and len(word) > 4 and word not in allowed
                    and not any(word in b for b in translations)):
                leftovers.append(f'{name}: {r}')

    unused = [a for a, _ in pairs if a not in used]
    print(f'[{code}] 페이지 {len(PAGES)}개 + JS {len(LOCAL_JS)}개 생성, 번역 쌍 {len(pairs)}개 중 {len(used)}개 사용')
    if overrides:
        print(f'  언어 전용 이미지: {", ".join(overrides)}')
    for a in unused:
        print(f'  ⚠ 원문을 못 찾음(루트 문구가 바뀌었을 수 있음): {a[:70]}')
    for l in leftovers:
        print(f'  ⚠ 번역 안 된 힌디어: {l[:90]}')
    return not unused and not leftovers


if __name__ == '__main__':
    only = sys.argv[1:] or list(LANGS)
    ok = all([build_lang(c, LANGS[c]) for c in only])
    print('완료' if ok else '완료 (⚠ 항목 확인 필요)')
