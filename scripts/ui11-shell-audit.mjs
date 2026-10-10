import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5206';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui11/audit');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });
const context = await browser.newContext({ viewport: { width: 320, height: 844 }, locale: 'vi-VN', reducedMotion: 'reduce', serviceWorkers: 'block' });
await context.route(url => url.origin !== base, route => route.abort());
const page = await context.newPage();
const records = [];
async function capture(name) {
  await page.evaluate(() => document.fonts.ready);
  const record = await page.evaluate(() => {
    const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
    const visible = el => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
    const nav = [...document.querySelectorAll('nav')].find(visible);
    const links = nav ? [...nav.querySelectorAll('a')].map(el => {
      const label = [...el.querySelectorAll('span')].find(s => s.textContent.trim() && !s.querySelector('svg'));
      return { text: el.textContent.trim(), href: el.getAttribute('href'), box: rect(el), label: label ? rect(label) : null, labelScroll: label?.scrollWidth, labelClient: label?.clientWidth, fontSize: label ? getComputedStyle(label).fontSize : null };
    }) : [];
    const overlaps = [];
    for (let i=0;i<links.length;i++) for (let j=i+1;j<links.length;j++) {
      const a=links[i].label,b=links[j].label;
      if(a&&b&&Math.min(a.right,b.right)-Math.max(a.x,b.x)>0.5&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>0.5) overlaps.push([links[i].text,links[j].text]);
    }
    return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, nav: nav ? rect(nav) : null, links, overlaps, header: document.querySelector('.kitchen-header') ? rect(document.querySelector('.kitchen-header')) : null };
  });
  records.push({ name, route: new URL(page.url()).pathname, ...record });
  await page.screenshot({ path: resolve(out, `${name}.png`) });
  console.log(name, 'labels', record.links.length, 'overlaps', record.overlaps.length, 'navHeight', record.nav?.height);
}
try {
  await page.goto(`${base}/__preview`);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL(/planner$/);
  await page.goto(`${base}/onboarding`);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await page.waitForURL(`${base}/`);
  for (const width of [320,360,390,430,768,1024,1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${base}/shopping`);
    await page.locator('.kitchen-header').waitFor();
    await capture(`shell-${width}`);
  }
  for (const width of [320,768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${base}/shopping`);
    await page.locator('.kitchen-header').waitFor();
    await page.evaluate(() => {
      const elements = [...document.querySelectorAll('.takosan-rebuild *')];
      const sizes = elements.map(el => parseFloat(getComputedStyle(el).fontSize));
      elements.forEach((el,i) => el.style.fontSize = `${sizes[i]*2}px`);
    });
    await capture(`shell-text2-${width}`);
  }
  await page.setViewportSize({ width: 768, height: 420 });
  await page.goto(`${base}/shopping`);
  await page.locator('.kitchen-header').waitFor();
  await capture('rail-short-768');
} finally {
  await writeFile(resolve(out,'checks.json'),JSON.stringify({ records },null,2)+'\n');
  await browser.close();
}
