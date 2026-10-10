import sharp from 'sharp';
import { resolve } from 'node:path';
const root=resolve('docs/ui-rebuild/round-11');
const source=resolve('.artifacts/ui11/browser-accepted');
async function sheet(file,items) {
  const tileW=300,tileH=600,gap=16,cols=3,rows=Math.ceil(items.length/cols);
  const composites=[];
  for(let i=0;i<items.length;i++) {
    const [name,label]=items[i];
    const left=gap+(i%cols)*(tileW+gap),top=gap+Math.floor(i/cols)*(tileH+gap);
    const img=await sharp(resolve(source,`${name}.png`)).resize({width:tileW,height:tileH-36,fit:'contain',position:'north',background:'#f7f3ec'}).png().toBuffer();
    composites.push({input:img,left,top:top+36});
    const caption=Buffer.from(`<svg width="${tileW}" height="36"><text x="8" y="23" font-size="15" font-family="sans-serif" fill="#245d49">${label}</text></svg>`);
    composites.push({input:caption,left,top});
  }
  await sharp({create:{width:cols*(tileW+gap)+gap,height:rows*(tileH+gap)+gap,channels:4,background:'#efeee7'}}).composite(composites).png().toFile(resolve(root,file));
}
await sheet('contact-shell.png',[['home-320','Home / 320'],['shopping-390','Shopping / 390'],['shopping-768','Rail / 768'],['home-1024','Sidebar / 1024'],['review-320','Scan review / 320'],['planning-settings-320','Settings / 320']]);
await sheet('contact-stress.png',[['recipe-320-844-text2','Cook action / text x2'],['review-320-844-text2','Confirm action / text x2'],['shopping-text2-focus','Field focus / text x2'],['synthetic-safe-area-320','Injected bottom padding'],['synthetic-offline-banner','Synthetic offline banner'],['rail-short-scan-focus','Short rail / focused Scan']]);
