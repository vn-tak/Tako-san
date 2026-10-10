"""One-time licensed outline extraction; exports need only Node + pinned sharp."""
from pathlib import Path
import json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/takosan/rebuild/masters'
FONT_DIR = ROOT / 'public/takosan/fonts'

def outline(text, weight, size, x=0, y=0):
    fonts = [TTFont(FONT_DIR / f'be-vietnam-pro-{subset}-{weight}-normal.woff2')
             for subset in ('latin', 'vietnamese', 'latin-ext')]
    scale = size / fonts[0]['head'].unitsPerEm
    paths, cursor = [], 0
    for char in text:
        font = next(f for f in fonts if ord(char) in f.getBestCmap())
        name = font.getBestCmap()[ord(char)]
        pen = SVGPathPen(font.getGlyphSet())
        font.getGlyphSet()[name].draw(pen)
        if pen.getCommands():
            paths.append(f'<path transform="translate({cursor:.3f} 0)" d="{pen.getCommands()}"/>')
        cursor += font['hmtx'][name][0]
    return (f'<g transform="translate({x} {y}) scale({scale:.6f} -{scale:.6f})" fill="#202C28">'
            + ''.join(paths) + '</g>'), cursor * scale

word, width = outline('takosan', 700, 48, 0, 42)
(OUT / 'wordmark.svg').write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:.3f}" height="48" viewBox="0 0 {width:.3f} 48">{word}</svg>\n')
lines = [outline(t, 700, 68, 0, y)[0] for t, y in
         [('Ăn đủ.', 68), ('Mua đủ.', 150), ('Dùng hết.', 232)]]
(OUT / 'motto.svg').write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" width="560" height="252" viewBox="0 0 560 252">'
    + ''.join(lines) + '</svg>\n')
footer, _ = outline('Mở tủ lạnh. Biết ngay hôm nay ăn gì.', 400, 24, 0, 30)
(OUT / 'tagline.svg').write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" width="560" height="40" viewBox="0 0 560 40">'
    + footer + '</svg>\n')
print(json.dumps({'wordmarkWidth': width, 'masters': 3}))
