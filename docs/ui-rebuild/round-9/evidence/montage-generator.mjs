import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
const root='docs/ui-rebuild/round-9';
await mkdir(root,{recursive:true});
const sets=[['contact-sheet.png','.artifacts/ui09/browser-frozen',[
'canonical-detail-390','canonical-edit-390','reconciliation-records-390','session-error-390',
'canonical-detail-1440','reconciliation-records-1440','metadata-save-error','application-render-error',
'edit-enlarged-320','detail-long-content-enlarged-320','reconciliation-long-content-enlarged-320','edit-short-390'
]],['week-audit-contact-sheet.png','.artifacts/ui09/week-audit-frozen',[
'week-home-320','week-setup-320','week-budget-320','week-schedule-320',
'week-priorities-320','week-frequency-320','week-generated-board-320','week-settings-320'
]]];
for (const [output,folder,shots] of sets) {
  const cellWidth=340, cellHeight=740, composites=[];
  for (const [i,name] of shots.entries()) {
    const file=`${folder}/${name}.png`, meta=await sharp(file).metadata();
    const top=name==='canonical-edit-390'?850:name==='edit-enlarged-320'?2100:name==='detail-long-content-enlarged-320'?650:name==='reconciliation-long-content-enlarged-320'?650:0;
    const cap=Math.min(meta.height-top,Math.round(meta.width*2));
    const buffer=await sharp(file).extract({left:0,top,width:meta.width,height:cap}).resize({width:320,height:690,fit:'inside'}).png().toBuffer();
    composites.push({input:buffer,left:(i%4)*cellWidth+10,top:Math.floor(i/4)*cellHeight+42});
    const label=Buffer.from(`<svg width="340" height="36"><text x="10" y="24" font-size="13" font-family="sans-serif" fill="#213b33">${name}</text></svg>`);
    composites.push({input:label,left:(i%4)*cellWidth,top:Math.floor(i/4)*cellHeight});
  }
  await sharp({create:{width:cellWidth*4,height:cellHeight*Math.ceil(shots.length/4),channels:3,background:'#ede9df'}}).composite(composites).png().toFile(`${root}/${output}`);
}
for (const name of ['edit-enlarged-320','detail-long-content-enlarged-320','reconciliation-long-content-enlarged-320']) {
 const file=`.artifacts/ui09/browser-frozen/${name}.png`,meta=await sharp(file).metadata();
 await sharp(file).extract({left:0,top:0,width:meta.width,height:Math.min(meta.height,1500)}).toFile(`.artifacts/ui09/${name}-crop.png`);
}
