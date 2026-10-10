import ts from 'typescript';
import { readFile,writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const base='f7a27c16ef460b19322d3a463dc74dc09fa48ade';
const printer=ts.createPrinter({removeComments:true});
function contracts(code,path){
 const file=ts.createSourceFile(path,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const records=[];
 function visit(n){
  // Executable declarations/handlers excluding the presentation returned by components.
  if(ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&n.initializer){
   if(!['image','Heading','href'].includes(n.name.text)){
    const value=n.initializer;
    if(!ts.isJsxElement(value)&&!ts.isJsxSelfClosingElement(value)&&!ts.isJsxFragment(value)){
     if(!ts.isArrowFunction(value)||!ts.isJsxElement(value.body))
      if(!['RecipeDetailPage','HomePage','RecipesPage','RecipeCard'].includes(n.name.text))records.push([n.name.text,printer.printNode(ts.EmitHint.Unspecified,value,file)]);
    }
   }
  }
  if(ts.isJsxAttribute(n)&&['onClick','onChange','onKeyDown','onFocus','disabled','hidden','aria-selected','tabIndex'].includes(n.name.text)&&n.initializer)
   records.push([n.name.text,printer.printNode(ts.EmitHint.Unspecified,n.initializer,file)]);
  ts.forEachChild(n,visit);
 }
 visit(file);return records;
}
const records=[];
for(const path of ['src/web/pages/HomePage.tsx','src/web/pages/RecipesPage.tsx','src/web/pages/RecipeDetailPage.tsx']){
 const before=execFileSync('git',['show',`${base}:${path}`],{encoding:'utf8'});
 const after=await readFile(path,'utf8');
 const old=contracts(before,path),current=contracts(after,path);
 if(JSON.stringify(old)!==JSON.stringify(current))throw new Error(`Contract changed: ${path}`);
 records.push({path,executableAndHandlerRecords:old.length,unchanged:true});
}
const protectedPaths=['src/worker','packages','migrations','public','src/web/services','src/web/stores','src/web/App.tsx','src/web/lib/recipe-media.ts','src/web/lib/sync.ts','src/web/lib/private-session.ts','src/web/pages/PaymentPage.tsx','package.json','pnpm-lock.yaml','vite.config.ts','wrangler.jsonc','wrangler.staging.jsonc','.github','tailwind.config.js','postcss.config.js'];
const protectedDiff=execFileSync('git',['diff',base,'--',...protectedPaths],{encoding:'utf8'});
if(protectedDiff)throw new Error('Protected path diff');
await writeFile('.artifacts/ui12/lifecycle-proof.json',JSON.stringify({base,records,protectedPaths,protectedDiff},null,2)+'\n');
console.log(JSON.stringify(records));console.log('Protected diff EMPTY');
