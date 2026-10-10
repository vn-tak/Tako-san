import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.UI_REBUILD_URL??'http://127.0.0.1:5212',out=process.env.UI_REBUILD_OUT??'.artifacts/ui12/baseline';
await mkdir(out,{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:320,height:844},locale:'vi-VN',reducedMotion:'reduce',serviceWorkers:'block'});
await context.route(url=>url.origin!==base,route=>route.abort());
const page=await context.newPage();
const records=[];
try {
await page.goto(`${base}/__preview`);
await page.getByRole('button',{name:'Đặt lại dữ liệu thử nghiệm và đăng nhập'}).click();
await page.waitForURL(/planner$/);
await page.goto(`${base}/onboarding`);
await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
await page.getByRole('button',{name:'Bắt đầu với Takosan',exact:true}).click();
await page.waitForURL(`${base}/`);
for(const [name,path,tab] of [['recipe','/recipes/thit-kho-trung',null],['steps','/recipes/thit-kho-trung','Cách nấu'],['nutrition','/recipes/thit-kho-trung','Dinh dưỡng'],['recipes','/recipes',null],['home','/',null]]) {
for(const text2 of [false,true]) {
await page.goto(`${base}${path}`);
await page.locator('#kitchen-main h1').waitFor();
if(path==='/recipes')await expect(page.locator('[data-testid=recipe-discovery-grid] a').first()).toBeVisible();
if(path.includes('thit-kho'))await page.locator('.recipe-overview').waitFor();
if(tab)await page.getByRole('tab',{name:tab,exact:true}).click();
await page.evaluate(()=>document.fonts.ready);
if(text2)await page.evaluate(()=>{const els=[...document.querySelectorAll('.takosan-rebuild *')];const sizes=els.map(el=>parseFloat(getComputedStyle(el).fontSize));els.forEach((el,i)=>el.style.fontSize=`${sizes[i]*2}px`);});
const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,clipped:[...document.querySelectorAll('#kitchen-main span,#kitchen-main button,#kitchen-main h1,#kitchen-main h2,#kitchen-main h3,#kitchen-main p')].filter(el=>el.getBoundingClientRect().width&&el.getBoundingClientRect().height&&(el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2)).map(el=>({tag:el.tagName,text:el.textContent.trim().slice(0,120),className:el.className,width:el.clientWidth,height:el.clientHeight,scrollWidth:el.scrollWidth,scrollHeight:el.scrollHeight})),hero:document.querySelector('.recipe-cover')?.getBoundingClientRect().height}));
records.push({name,text2,...metrics});
await page.screenshot({path:`${out}/${name}${text2?'-text2':''}.png`,fullPage:true});
console.log(name,text2,JSON.stringify(metrics));
}
}
}finally{await writeFile(`${out}/checks.json`,JSON.stringify({records},null,2)+'\n');await browser.close();}
