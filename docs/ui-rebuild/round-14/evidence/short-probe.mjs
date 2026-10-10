import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:320,height:420},reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),base='http://127.0.0.1:5217';
const out='.artifacts/ui14/short-recovered';await mkdir(out,{recursive:true});const checks=[];
try{
 await page.goto(base+'/__preview');await page.getByRole('button',{name:'Đăng nhập tài khoản thử nghiệm',exact:true}).click();await page.waitForURL(base+'/__preview/ready');
 const user=await page.evaluate(async()=>{const r=await fetch('/api/v1/me');if(!r.ok)throw Error('unverified');return(await r.json()).user;});assert(user.id&&!user.isGuest);
 await context.addInitScript(user=>{for(const [key,value] of Object.entries({frigo_user_id:user.id,frigo_household_id:user.household.id,frigo_display_name:user.displayName,frigo_email:user.email,frigo_onboarded:'true',frigo_is_guest:'false'}))localStorage.setItem(key,value);},user);
 await page.goto(base+'/recipes/kimchi-fried-rice');await page.locator('.recipe-overview').waitFor();await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>{const els=[...document.querySelectorAll('.takosan-rebuild *')],sizes=els.map(e=>parseFloat(getComputedStyle(e).fontSize));els.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
 await page.waitForFunction(()=>Math.abs(parseFloat(document.querySelector('[data-kitchen-navigation=persistent]').style.getPropertyValue('--kitchen-nav-height'))-document.querySelector('.kitchen-bottom-nav').getBoundingClientRect().height)<1);
 for(const label of ['Cách nấu','Nguyên liệu','Dinh dưỡng']){
  const tab=page.getByRole('tab',{name:label,exact:true});await tab.focus();await expect(tab).toBeFocused();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const geometry=await tab.evaluate(el=>{const r=el.getBoundingClientRect(),nav=document.querySelector('.kitchen-bottom-nav').getBoundingClientRect();return{top:r.top,bottom:r.bottom,navTop:nav.top,navHeight:nav.height,visibleAboveNav:r.top>=0&&r.bottom<=nav.top+1};});
  checks.push({label,...geometry});await page.screenshot({path:out+'/'+label+'.png'});
  assert(geometry.visibleAboveNav,JSON.stringify(geometry));
 }
 await page.screenshot({path:out+'/detail-full-page.png',fullPage:true});
 await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
 const nav=page.locator('.kitchen-bottom-nav');await expect(nav).toBeVisible();checks.push({scrollHeight:await page.evaluate(()=>document.documentElement.scrollHeight),viewportHeight:420,navHeight:await nav.evaluate(el=>el.getBoundingClientRect().height)});
 console.log('PASS combined 320x420 computed text x2: three keyboard tabs scroll above nav; nav height measured');
}finally{await writeFile(out+'/checks.json',JSON.stringify({syntheticTextX2:true,measurementWait:true,checks},null,2)+'\n');await browser.close();}
