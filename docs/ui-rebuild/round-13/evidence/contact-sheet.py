from pathlib import Path
from PIL import Image, ImageDraw
root=Path('.artifacts/ui13')
sources=[
 ('Desktop - original/crop comparison',root/'supplemental-import-cap/crop-original-1440.png'),
 ('Desktop - permitted current photos',root/'supplemental-import-cap/mixed-photo-review-1440.png'),
 ('Mobile - photo cards',root/'supplemental-import-cap/mixed-photo-review-390.png'),
 ('320px - computed text x2',root/'browser-import-cap/board-320-text2.png'),
]
sheet=Image.new('RGB',(1600,1190),'#f6f3eb');draw=ImageDraw.Draw(sheet)
for i,(label,p) in enumerate(sources):
 im=Image.open(p).convert('RGB');im.thumbnail((770,535))
 x=15+(i%2)*800;y=45+(i//2)*580
 draw.text((x,y-26),label,fill='#173f34');sheet.paste(im,(x,y))
sheet.save(root/'contact-sheet.png')
print('PASS contact sheet: four accepted screenshots; scaled only for comparison')
