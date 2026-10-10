import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const root = 'docs/ui-rebuild/round-12/evidence';
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
async function sheet(name, columns, cells, width, height) {
  const label = 44, gap = 20;
  const rows = Math.ceil(cells.length / columns);
  const layers = [];
  for (let i = 0; i < cells.length; i++) {
    const [title, path] = cells[i];
    const x = gap + (i % columns) * (width + gap);
    const y = gap + Math.floor(i / columns) * (height + label + gap);
    layers.push({ input: Buffer.from(`<svg width="${width}" height="${label}"><text x="0" y="25" font-family="sans-serif" font-size="16" fill="#214D3B">${esc(title)}</text></svg>`), left:x, top:y });
    const meta = await sharp(`${root}/${path}`).metadata();
    const cropHeight = Math.min(meta.height, Math.round(height * meta.width / width));
    const image = await sharp(`${root}/${path}`).extract({left:0,top:0,width:meta.width,height:cropHeight}).resize({width,height,fit:'contain',position:'top',background:'#fff'}).png().toBuffer();
    layers.push({input:image,left:x,top:y+label});
  }
  await sharp({create:{width:columns*(width+gap)+gap,height:rows*(height+label+gap)+gap,channels:3,background:'#F5F3EB'}}).composite(layers).png().toFile(`${root}/${name}.png`);
}
await sheet('journey-mobile', 3, [
 ['HOME / 390px','browser-on-recovered/home-390.png'],
 ['DISCOVERY / 390px','browser-on-recovered/recipes-390.png'],
 ['RECIPE / 390px','browser-on-recovered/recipe-390.png'],
 ['STEPS / 390px','browser-on-recovered/panel-steps-390.png'],
 ['NUTRITION / 320px','browser-on-recovered/panel-nutrition-320.png'],
 ['LONG TITLE / 320px','states-first/recipe-long-title.png'],
],390,844);
await sheet('responsive-desktop', 2, [
 ['HOME / 1440px','browser-on-recovered/home-1440.png'],
 ['DISCOVERY / 1440px','browser-on-recovered/recipes-1440.png'],
 ['RECIPE / 1440px','browser-on-recovered/recipe-1440.png'],
 ['RECIPE / 768px TEXT x2','browser-on-recovered/recipe-768-844-text2.png'],
],720,530);
await sheet('text-enlargement-comparison', 2, [
 ['BASE / DETAIL x2 TOP CROP','base-configured/recipe-text2.png'],
 ['UI12 / DETAIL x2 TOP CROP','final-visual/recipe-text2.png'],
 ['BASE / NUTRITION x2 TOP CROP','base-configured/nutrition-text2.png'],
 ['UI12 / NUTRITION x2 TOP CROP','final-visual/nutrition-text2.png'],
],320,1200);
await writeFile(`${root}/contact-sheet-notes.json`,JSON.stringify({compositionOnly:true,noGeneratedAssets:true,notes:['Mobile sheet uses real viewport screenshots; source images remain in each directory.','Comparison crops from full-page captures; sticky chrome can appear at capture positions. Use metrics plus viewport sheets to assess layout.','Text x2 is computed font enlargement, not native browser zoom or a device test.']},null,2)+'\n');
console.log('3 contact sheets created from archived screenshots');
