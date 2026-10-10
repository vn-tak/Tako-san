import { chromium,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile,readFile}from'node:fs/promises';
import ts from'typescript';
import assert from'node:assert/strict';
const base='http://127.0.0.1:5212',out=process.env.UI_REBUILD_OUT??'.artifacts/ui12/route-audit';await mkdir(out,{recursive:true});
const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:320,height:844},serviceWorkers:'block',reducedMotion:'reduce'});
await context.route(url=>url.origin!==base,r=>r.abort());const page=await context.newPage(),records=[],errors=[],writes=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/v1/')&&!['GET','HEAD'].includes(r.method()))writes.push({path:new URL(r.url()).pathname,method:r.method()});});
try{
 await page.goto(`${base}/__preview`);await page.getByRole('button',{name:'Đặt lại dữ liệu thử nghiệm và đăng nhập'}).click();await page.waitForURL(/planner$/);
 await page.goto(`${base}/onboarding`);await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();await page.getByRole('button',{name:'Bắt đầu với Takosan',exact:true}).click();await page.waitForURL(`${base}/`);
 const get=path=>page.evaluate(async path=>{const r=await fetch(`/api/v1${path}`);return{status:r.status,data:await r.json()};},path);
 const before=await get('/inventory'),start=writes.length;
 const demand=await get('/recipe-discovery?pageSize=24');await writeFile(`${out}/recipe-demand.json`,JSON.stringify(demand,null,2)+'\n');
 for(const width of [320,1440])for(const [name,path]of[['settings','/settings/app'],['household','/me/household'],['reconciliation','/inventory-reconciliation'],['scan-no-id','/scan/result'],['cook-entry','/cook/pasta-pomodoro'],['cook-no-attempt','/cooking/complete']]){
  await page.setViewportSize({width,height:844});await page.goto(`${base}${path}`);await expect(page.locator('h1')).toHaveCount(1);await page.evaluate(()=>document.fonts.ready);
  // Wait for the actual async page state, rather than certifying its route skeleton.
  if(path==='/inventory-reconciliation')await page.locator('.stock-detail-workspace').waitFor();
  await expect(page.locator('h1')).toHaveCount(1);
  const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:[...document.querySelectorAll('h1')].map(el=>el.textContent.trim()),broken:[...document.images].filter(el=>el.complete&&!el.naturalWidth).map(el=>el.getAttribute('src'))}));
  const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}));
  records.push({name,width,path,actual:new URL(page.url()).pathname,...layout,violations});await page.screenshot({path:`${out}/${name}-${width}.png`});
  assert.equal(layout.scrollWidth,width,name);assert.equal(layout.h1.length,1,name);assert.deepEqual(layout.broken,[],name);assert.deepEqual(violations,[],name);console.log(name,width,'PASS');
 }
 assert.deepEqual(await get('/inventory'),before);assert.equal(writes.length,start);
 const guest=await browser.newContext({viewport:{width:320,height:844},serviceWorkers:'block',reducedMotion:'reduce'});await guest.route(url=>url.origin!==base,r=>r.abort());const tab=await guest.newPage();
 for(const [name,path]of[['public-entry','/landing'],['registered-login','/auth/login']]){
  await tab.goto(`${base}${path}`);await tab.locator('h1').waitFor();await tab.evaluate(()=>document.fonts.ready);
  const layout=await tab.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelector('h1').textContent.trim()}));records.push({name,path,...layout});await tab.screenshot({path:`${out}/${name}-320.png`});assert.equal(layout.scrollWidth,320,name);console.log(name,'PASS');
 }
 await guest.close();assert.deepEqual(errors,[]);
 const code=await readFile('src/web/App.tsx','utf8'),source=ts.createSourceFile('App.tsx',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),routes=[];
 function walk(node){if(ts.isJsxAttribute(node)&&node.name.text==='path'&&node.initializer&&ts.isStringLiteral(node.initializer))routes.push({path:node.initializer.text,line:source.getLineAndCharacterOfPosition(node.getStart()).line+1});ts.forEachChild(node,walk);}walk(source);
 await writeFile(`${out}/source-routes.json`,JSON.stringify({source:'src/web/App.tsx',routes},null,2)+'\n');console.log(`PASS ${records.length} supplemental route checks / source ${routes.length} route declarations`);
}finally{await writeFile(`${out}/checks.json`,JSON.stringify({records,errors,writes},null,2)+'\n');await browser.close();}
