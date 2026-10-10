import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const base='13cef9f8e6dc72549071426ad98df70e0d16f4a4';
const hash=s=>createHash('sha256').update(s).digest('hex');
const records=[];
for(const path of ['src/web/pages/InventoryPage.tsx','src/web/pages/RecipeDetailPage.tsx','src/web/pages/ScanResultPage.tsx','src/web/pages/ReceiptReviewPage.tsx','src/web/design-system/primitives.tsx']) {
  const before=execFileSync('git',['show',`${base}:${path}`],{encoding:'utf8'});
  let current=readFileSync(path,'utf8');
  current=current.replace("import { KitchenHeader } from '../components/common/KitchenHeader';\n",'')
    .replace('  return (\n    <>\n    <KitchenHeader />\n    <div className="review-workspace">','  return (\n    <div className="review-workspace">')
    .replace('    </div>\n    </>\n  );','    </div>\n  );')
    .replace('data-kitchen-action="fixed" className="kitchen-stock-action ', 'className="')
    .replace('data-kitchen-action="fixed" className="kitchen-recipe-action ', 'className="')
    .replace('    data-kitchen-action="fixed"\n','')
    .replace("'kitchen-bottom-cta fixed", "'fixed")
    .replace('data-kitchen-action="fixed" className="kitchen-sticky-actions ', 'className="');
  assert.equal(current,before,`${path}: code outside explicit presentation patch changed`);
  records.push({path,restoredPresentationPatchMatchesBase:true,baseSHA256:hash(before)});
}
const path='src/web/components/layout/AppLayout.tsx';
const section=s=>s.slice(s.indexOf('const IMMERSIVE_PATTERNS'),s.indexOf('export const AppLayout'));
assert.equal(section(readFileSync(path,'utf8')),section(execFileSync('git',['show',`${base}:${path}`],{encoding:'utf8'})));
records.push({path,immersiveAndScopeByteIdentical:true});
const protectedPaths=['src/worker','packages','migrations','public','src/web/services','src/web/stores','src/web/App.tsx','src/web/lib/sync.ts','src/web/lib/private-session.ts','src/web/pages/PaymentPage.tsx','package.json','pnpm-lock.yaml','vite.config.ts','wrangler.toml'];
const diff=execFileSync('git',['diff',base,'--',...protectedPaths],{encoding:'utf8'});assert.equal(diff,'');
writeFileSync('.artifacts/ui11/lifecycle-proof.json',JSON.stringify({base,records,protectedPaths,protectedDiff:diff},null,2)+'\n');
console.log('PASS restored presentation patches, exact routes/immersive and protected paths');
