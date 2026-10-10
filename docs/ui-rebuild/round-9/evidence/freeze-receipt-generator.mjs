import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import {format} from 'prettier';
const normalized=async s=>tokens(await format(s,{parser:'typescript'}));
import assert from 'node:assert/strict';
const base='dbcabb7648e7f4ee9595f5ae430f0d7b50e80f0b';
const dir='docs/ui-rebuild/round-9/evidence';
const hash=b=>createHash('sha256').update(b).digest('hex');
const previous=JSON.parse(await readFile('docs/ui-rebuild/round-8/evidence/source-freeze.json','utf8'));
const changed=execFileSync('git',['diff','--name-only',base],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const added=execFileSync('git',['ls-files','--others','--exclude-standard'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const paths=[...new Set([...previous.files.map(f=>f.path),...changed,...added,
 'src/web/components/common/KitchenHeader.tsx','src/web/styles/kitchen-foundation.css','src/web/lib/inventory-truth.ts',
 'src/web/pages/WeekSetupPage.tsx','src/web/pages/WeekGeneratingPage.tsx','src/web/pages/WeekDashboardPage.tsx',
 'src/web/pages/WeekShoppingPage.tsx','src/web/pages/WeekSettingsPage.tsx','src/web/pages/MealDetailPage.tsx',
 'src/web/stores/useWeekStore.ts','src/worker/routes/inventory.ts','src/worker/routes/inventory-truth.ts',
 'packages/db/src/inventory-read-authority.ts','src/web/services/inventory.ts',
 'tests/unit/t13b-inventory-detail.test.tsx','tests/unit/t13r-a-lot-draft-ownership.test.tsx',
 'tests/unit/t13r-b-inventory-conflict.test.tsx','tests/integration/frontend-security-integration.test.ts'
])].filter(p=>!p.startsWith('docs/') && p!=='TASK_BOARD.md').sort();
const files=[];
for(const path of paths){ const b=await readFile(path);files.push({path,bytes:b.length,sha256:hash(b)}); }
await writeFile(`${dir}/source-freeze.json`,JSON.stringify({base,files},null,2)+'\n');
const protectedScopes=['src/worker','packages','migrations','public','src/web/services','src/web/stores',
 'src/web/features/auth','src/web/components/payment','src/web/pages/PlusPage.tsx','src/shared/payment.ts',
 'package.json','pnpm-lock.yaml','wrangler.jsonc','vite.config.ts','vitest.config.ts','playwright.config.ts',
 'src/web/pages/AuthPage.tsx','src/web/components/common/ConfirmDialog.tsx','src/web/components/common/LogoutDialog.tsx'];
const protectedDiff=execFileSync('git',['diff','--name-only',base,'--',...protectedScopes],{encoding:'utf8'}).trim();assert.equal(protectedDiff,'');
const readBase=p=>execFileSync('git',['show',`${base}:${p}`],{encoding:'utf8'});
const current=p=>readFile(p,'utf8');
function tokens(s){const scanner=ts.createScanner(ts.ScriptTarget.Latest,true,ts.LanguageVariant.JSX,s);const out=[];while(scanner.scan()!==ts.SyntaxKind.EndOfFileToken)out.push(scanner.getTokenText());return out;}
function region(s,start,end){assert(s.includes(start)&&s.includes(end));return s.slice(s.indexOf(start),s.indexOf(end,s.indexOf(start)));}
const appPath='src/web/App.tsx',app=await current(appPath),appBase=readBase(appPath);
assert.deepEqual(tokens(app.slice(app.indexOf('// Week → Planner'))),tokens(appBase.slice(appBase.indexOf('// Week → Planner'))));
const sessionPath='src/web/components/common/SessionBoundary.tsx',session=await current(sessionPath),sessionBase=readBase(sessionPath);
assert.deepEqual(tokens(region(session,'export const SessionBoundary',"  if (logoutStatus === 'idle')")),tokens(region(sessionBase,'export const SessionBoundary',"  if (logoutStatus === 'idle')")));
const detailPath='src/web/pages/IngredientDetailPage.tsx',detail=await current(detailPath),detailBase=readBase(detailPath);
assert.deepEqual(await normalized(region(detail,'  const lotQuery','  const dirty')),await normalized(region(detailBase,'  const lotQuery','  if (lotQuery.isPending')));
assert.deepEqual(await normalized(region(detail,'  const startEdit','  return (\n    <KitchenDetailPage\n      title=')),await normalized(region(detailBase,'  const startEdit','  return (\n    <div')));
const reconciliationPath='src/web/pages/ReconciliationPage.tsx',rec=await current(reconciliationPath),recBase=readBase(reconciliationPath);
assert.deepEqual(await normalized(region(rec,'  const observationsQuery','  const observations =')),await normalized(region(recBase,'  const observationsQuery','  const observations =')));
const additionalProtected=added.filter(p=>protectedScopes.some(scope=>p===scope||p.startsWith(`${scope}/`)));assert.deepEqual(additionalProtected,[]);
await writeFile(`${dir}/protected-path-review.json`,JSON.stringify({base,protectedScopes,protectedDiff:[],untrackedProtectedPaths:[],changedPaths:changed,addedPaths:added.filter(p=>!p.startsWith('docs/ui-rebuild/round-9')),normalizedTokenChecks:{appRoutesAndGuards:'unchanged',sessionVerificationEffects:'unchanged',detailQueriesAndMutationCallbacks:'unchanged',detailDraftBaselineOwnershipAndSubmit:'unchanged',reconciliationQueriesAndDecisionCallbacks:'unchanged'},exceptions:['SessionBoundary import and JSX presentation only','AppErrorBoundary import and JSX presentation only','security-preview local planner switch; production config unchanged']},null,2)+'\n');
console.log(`Frozen ${files.length} files; protected paths and 5 token comparisons PASS`);
