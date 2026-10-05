import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { authorizeRecovery } from './production-catalog-recovery-approval.mjs';
import { compileRecipeCatalogRecovery, loadCertifiedRecoverySource } from './recipe-catalog-recovery.mjs';
import {
  APPROVED_BATCHES_REGISTRY, CATALOG_RELEASE_MANIFEST, PRODUCTION_D1,
  catalogQuery, loadRuntimeCatalogPipeline, verifyCatalogAtTip,
  verifyCloudflareIdentity, verifyHealth, verifyProductionWranglerConfigFile,
  verifyRuntimeCatalogContent,
} from './d1-migration-check.mjs';

const reject = () => { throw new Error('PRODUCTION_CATALOG_RECOVERY_STOPPED'); };
const requireProof = (condition) => { if (!condition) reject(); };
const TIP = '0038_auth_onboarding_completion.sql';

export function verifyRecoveryLedger(statements, expected) {
  requireProof(Array.isArray(statements) && statements.length === 1 && statements[0].success === true &&
    Array.isArray(statements[0].results));
  const names = statements[0].results.map((row) => row.name).sort();
  requireProof(names.length === 38 && JSON.stringify(names) === JSON.stringify(expected));
  return { count: names.length, tip: names.at(-1) };
}

export function requirePinnedStaticWorker(proof, pinned) {
  requireProof(proof?.authorityVerified === true && proof.compatibilityCode === 'SUPPORTED' &&
    proof.configuredMode === 'static' && proof.cutoverEnabled === false && proof.canaryPercent === 0 &&
    typeof pinned?.versionId === 'string' && proof.deployment?.versionId === pinned.versionId &&
    /^[a-f0-9]{64}$/.test(pinned.modules?.sha256 || '') && proof.modules?.sha256 === pinned.modules.sha256);
}

/** Executes only generated SQL through the pinned Wrangler D1 atomic import path. */
export async function runCatalogRecovery({
  operation, env = process.env, cwd = process.cwd(), execute = execFileSync,
  authorize = authorizeRecovery, worker,
  loadSource = loadCertifiedRecoverySource, compile = compileRecipeCatalogRecovery,
  loadPipeline = loadRuntimeCatalogPipeline,
} = {}) {
  requireProof(['inspect', 'static-pin', 'restore-v1'].includes(operation) && operation === env.RECOVERY_OPERATION);
  const authorizeNow = () => authorize({ env, cwd });
  const authorization = await authorizeNow();
  const receipt = { schemaVersion: 1, operation, sourceSha: authorization.mainSha,
    runId: env.GITHUB_RUN_ID, status: 'STARTED', database: PRODUCTION_D1,
    userDataRetentionRequired: false, productionRowsPublished: false };
  const receiptFile = path.join(cwd, 'catalog-recovery-receipt.json');
  const save = () => writeFileSync(receiptFile, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
  save();
  const wrangler = (...args) => {
    try {
      return execute('pnpm', ['wrangler', ...args], {
        cwd, env: { ...env, WRANGLER_SEND_METRICS: 'false' }, encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024, timeout: 15 * 60_000, stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch { reject(); }
  };
  const json = (...args) => {
    try { return JSON.parse(wrangler(...args)); } catch { reject(); }
  };
  const query = (sql) => json('d1', 'execute', PRODUCTION_D1.name, '--remote', '--yes', '--json', '--command', sql);
  let pipeline;
  let plan;
  let applied = false;
  let importAttempted = false;
  try {
    receipt.phase = 'CONFIG_AND_D1_IDENTITY';
    verifyProductionWranglerConfigFile(path.join(cwd, 'wrangler.jsonc'));
    const identity = verifyCloudflareIdentity({ list: json('d1', 'list', '--json'), info: null });
    receipt.identity = identity;
    worker ??= await import('./production-catalog-static-pin.mjs');
    if (operation === 'inspect') {
      receipt.phase = 'WORKER_INSPECTION';
      receipt.worker = await worker.inspectProductionCatalogWorker({ env, cwd });
      receipt.status = 'INSPECTED_READ_ONLY'; save(); return receipt;
    }
    if (operation === 'restore-v1') {
      receipt.phase = 'OFFLINE_PLAN_AND_PRE_LEDGER';
      const source = await loadSource({ sha: authorization.mainSha, cwd });
      plan = compile({ source, repairId: `t21_v1_${env.GITHUB_RUN_ID}` });
      receipt.plan = plan.receipt;
      receipt.preLedger = verifyRecoveryLedger(query('SELECT name FROM d1_migrations ORDER BY name'), source.ledger);
      const capacity = query('SELECT page_count * page_size AS bytes FROM pragma_page_count, pragma_page_size');
      const bytes = capacity?.[0]?.results?.[0]?.bytes;
      requireProof(Number.isSafeInteger(bytes) && bytes > 0 && bytes < 100 * 1024 * 1024);
      receipt.capacity = { beforeBytes: bytes, capacityPolicy: 'database below 100 MiB; bounded catalog copies fit within the 500 MiB minimum D1 database limit' };
    }
    receipt.phase = 'STATIC_PIN';
    const priorWorker = await worker.inspectProductionCatalogWorker({ env, cwd });
    receipt.preWorker = priorWorker; save();
    requireProof(priorWorker.authorityVerified === true && priorWorker.compatibilityCode === 'SUPPORTED');
    receipt.worker = await worker.pinProductionCatalogStatic({
      env, cwd, expectedVersionId: priorWorker.deployment.versionId,
      catalogRestoreStarted: false, beforeMutation: authorizeNow,
    });
    receipt.status = 'STATIC_PINNED'; save();
    if (operation === 'static-pin') return receipt;
    receipt.phase = 'BOOKMARK_AND_IMPORT';
    const bookmark = json('d1', 'time-travel', 'info', PRODUCTION_D1.name, '--json');
    requireProof(typeof bookmark.bookmark === 'string' && /^[A-Za-z0-9._:-]{1,256}$/.test(bookmark.bookmark));
    receipt.timeTravel = { bookmark: bookmark.bookmark, capturedAt: new Date().toISOString() };
    const sqlFile = path.join(cwd, 'catalog-recovery-generated.sql');
    const rollbackFile = path.join(cwd, 'catalog-recovery-rollback.sql');
    writeFileSync(sqlFile, plan.sql, { mode: 0o600 });
    writeFileSync(rollbackFile, plan.rollbackSql, { mode: 0o600 });
    await authorizeNow();
    // Re-read bindings/readiness after the backup; no D1-serving version may become active.
    const staticProof = await worker.inspectProductionCatalogWorker({ env, cwd });
    requirePinnedStaticWorker(staticProof, receipt.worker);
    receipt.beforeImport = staticProof; save();
    importAttempted = true;
    receipt.importOutcome = 'ATTEMPTED_COMPLETION_UNCONFIRMED'; save();
    wrangler('d1', 'execute', PRODUCTION_D1.name, '--remote', '--yes', '--file', sqlFile);
    receipt.importOutcome = 'PROVIDER_REPORTED_SUCCESS';
    applied = true;
    receipt.phase = 'INDEPENDENT_POST_IMPORT_CERTIFICATION';
    receipt.status = 'IMPORTED_VERIFYING'; save();
    const source = await loadSource({ sha: authorization.mainSha, cwd });
    receipt.postLedger = verifyRecoveryLedger(query('SELECT name FROM d1_migrations ORDER BY name'), source.ledger);
    receipt.health = verifyHealth({ foreignKeys: query('PRAGMA foreign_key_check'), quickCheck: query('PRAGMA quick_check') });
    const release = JSON.parse(readFileSync(path.join(cwd, CATALOG_RELEASE_MANIFEST), 'utf8'));
    const registry = JSON.parse(readFileSync(path.join(cwd, APPROVED_BATCHES_REGISTRY), 'utf8'));
    receipt.catalog = verifyCatalogAtTip(release, TIP, query(catalogQuery()), registry);
    pipeline = await loadPipeline({ cwd });
    receipt.runtime = await verifyRuntimeCatalogContent({
      release, registry, tip: TIP, statements: pipeline.queries.flatMap(query), pipeline, cwd,
    });
    const finalWorker = await worker.inspectProductionCatalogWorker({ env, cwd });
    requirePinnedStaticWorker(finalWorker, receipt.worker);
    receipt.finalWorker = finalWorker;
    receipt.phase = 'COMPLETE';
    receipt.status = 'V1_CATALOG_CERTIFIED_STATIC'; save(); return receipt;
  } catch (error) {
    if (error?.proof) receipt.workerFailure = error.proof;
    if (error?.name === 'ProductionCatalogPinError' && /^[A-Z_]{1,80}$/.test(error.code || '')) receipt.failureCode = error.code;
    receipt.status = applied ? 'POST_IMPORT_FAILED_STATIC_ROUTING_REQUIRED'
      : importAttempted ? 'IMPORT_OUTCOME_UNKNOWN_STATIC_OPERATOR_INSPECTION_REQUIRED' : 'STOPPED';
    if (applied && plan) {
      try {
        await authorizeNow();
        const safe = await worker.inspectProductionCatalogWorker({ env, cwd });
        requirePinnedStaticWorker(safe, receipt.worker);
        wrangler('d1', 'execute', PRODUCTION_D1.name, '--remote', '--yes', '--file', path.join(cwd, 'catalog-recovery-rollback.sql'));
        receipt.rollback = { status: 'ARCHIVED_CATALOG_RESTORED', staticRoutingRetained: true };
        receipt.status = 'ROLLED_BACK_STATIC';
      } catch { receipt.rollback = { status: 'STOPPED_OPERATOR_REQUIRED', staticRoutingRequired: true }; }
    }
    save(); reject();
  } finally { await pipeline?.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCatalogRecovery({ operation: process.argv[2] }).then((receipt) => {
    console.log(`Production catalog operation: ${receipt.status}`);
  }).catch(() => { console.error('PRODUCTION_CATALOG_RECOVERY_STOPPED'); process.exitCode = 1; });
}
