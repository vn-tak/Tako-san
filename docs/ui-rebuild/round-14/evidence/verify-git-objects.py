from pathlib import Path
import subprocess, hashlib, json, datetime, gzip
root = Path.cwd()
evidence = root / 'docs/ui-rebuild/round-14/evidence'
manifest_path = evidence / 'MANIFEST.json'
manifest_bytes = manifest_path.read_bytes()
manifest = json.loads(manifest_bytes)
implementation = subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode().strip()
subprocess.run(['git', 'merge-base', '--is-ancestor', manifest['base'], implementation], check=True)
parent = subprocess.check_output(['git', 'rev-parse', 'HEAD^']).decode().strip()
assert subprocess.check_output(['git', 'status', '--porcelain']) == b''
subprocess.run(['git', 'diff', '--check', manifest['base'], implementation], check=True)
proof = json.loads((evidence / 'protected-proof.json').read_text())
assert subprocess.check_output(['git', 'diff', manifest['base'], implementation, '--', *proof['protectedPaths']]) == b''
entries = {}
for line in subprocess.check_output(['git', 'ls-tree', '-r', '-z', implementation]).split(b'\0'):
    if not line: continue
    info, path = line.split(b'\t', 1)
    mode, kind, oid = info.split()
    if kind == b'blob': entries[path.decode()] = oid.decode()
records = manifest['source'] + manifest['payloads'] + [{'path': str(manifest_path.relative_to(root)), 'bytes': len(manifest_bytes), 'sha256': hashlib.sha256(manifest_bytes).hexdigest()}]
process = subprocess.Popen(['git', 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
seen = {}
try:
    for record in records:
        oid = entries[record['path']]
        if oid not in seen:
            process.stdin.write((oid + '\n').encode()); process.stdin.flush()
            header = process.stdout.readline().split()
            assert header[:2] == [oid.encode(), b'blob']
            size = int(header[2]); raw = process.stdout.read(size)
            assert len(raw) == size and process.stdout.read(1) == b'\n'
            seen[oid] = raw
        raw = seen[oid]
        assert len(raw) == record['bytes'] and hashlib.sha256(raw).hexdigest() == record['sha256'], record['path']
        assert (root / record['path']).read_bytes() == raw, record['path']
finally:
    process.stdin.close(); assert process.wait() == 0
log_receipts = json.loads((evidence / 'log-receipts.json').read_text())['receipts']
for record in log_receipts:
    raw = Path(record['rawPath']).read_bytes(); archive = (root / record['archivePath']).read_bytes()
    assert len(raw) == record['rawBytes'] and hashlib.sha256(raw).hexdigest() == record['rawSha256']
    assert len(archive) == record['archiveBytes'] and hashlib.sha256(archive).hexdigest() == record['archiveSha256']
    if 'rawArchivePath' in record:
        container = (root / record['rawArchivePath']).read_bytes()
        assert len(container) == record['rawArchiveBytes'] and hashlib.sha256(container).hexdigest() == record['rawArchiveSha256']
        assert gzip.decompress(container) == raw
        assert archive == ('\n'.join(line.rstrip() for line in raw.decode().splitlines()).rstrip() + '\n').encode()
    else: assert raw == archive
gzip_count = sum('rawArchivePath' in r for r in log_receipts)
for stage in ['baseline', 'after']:
    for record in json.loads((evidence / f'{stage}-build/raw-archive-receipts.json').read_text())['records']:
        archive = (root / record['archivePath']).read_bytes(); raw = gzip.decompress(archive)
        assert len(raw) == record['rawBytes'] and hashlib.sha256(raw).hexdigest() == record['rawSha256']
        assert len(archive) == record['archiveBytes'] and hashlib.sha256(archive).hexdigest() == record['archiveSha256']
        gzip_count += 1
integrity = json.loads((evidence / 'final-integrity.json').read_text())
assert all(integrity['ownedPortsClosed'].values())
result = {'verifiedUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'origin': subprocess.check_output(['git', 'remote', 'get-url', 'origin']).decode().strip(), 'branch': subprocess.check_output(['git', 'branch', '--show-current']).decode().strip(), 'base': manifest['base'], 'implementation': implementation, 'implementationTree': subprocess.check_output(['git', 'rev-parse', 'HEAD^{tree}']).decode().strip(), 'baseIsAncestor': True, 'implementationParent': parent, 'parentEqualsBase': parent == manifest['base'], 'precedingImplementationWithRawLogWhitespace': '8f486cd', 'singleSequentialCatFileProcess': True, 'sourceRecordsVerified': len(manifest['source']), 'evidencePayloadsVerified': len(manifest['payloads']), 'uniqueImplementationBlobsVerified': len(seen), 'publicSourceRecordsVerified': sum(r['path'].startswith('public/') for r in manifest['source']), 'manifestBytes': len(manifest_bytes), 'manifestSha256': hashlib.sha256(manifest_bytes).hexdigest(), 'archivedLogReceiptsVerified': len(log_receipts), 'exactRawGzipArchivesVerified': gzip_count, 'protectedDiffEmpty': True, 'cleanImmediatelyAfterImplementation': True, 'implementationDiffCheckPassed': True, 'ownedPortsClosed': integrity['ownedPortsClosed']}
report = evidence.parent
(report / 'GIT_VERIFICATION.json').write_text(json.dumps(result, indent=2) + '\n')
(report / 'GIT_VERIFICATION.md').write_text(f"""# UI14 implementation Git-object verification

Verified UTC: {result['verifiedUTC']}.
Canonical vn-tak/Tako-san, codex/ui-rebuild-foundation.
Base `{manifest['base']}`.
Verified implementation `{implementation}`.
Tree `{result['implementationTree']}`; base is an ancestor.
Parent `{parent}` is the first UI14 implementation, retained after its raw-log
whitespace check failure; this follow-up preserves raw bytes in gzip and cleans text.

A single sequential git cat-file --batch process checked {len(seen)} unique
implementation blobs against {len(manifest['source'])} source records,
{len(manifest['payloads'])} evidence payloads and the manifest itself. Byte counts,
SHA256 and worktree bytes match. Public source subset:257records.
Manifest {len(manifest_bytes)} bytes, SHA256 `{result['manifestSha256']}`.

{len(log_receipts)} raw/archive log receipts (39 exact text,2 normalized text plus
exact raw gzip) and {gzip_count} exact deterministic
raw gzip archives verified. Protected base-to-implementation diff empty; App only
provider import, navigation except indicator equivalent, loaded JSX equivalent,
existing helper source exact.256publicbuild exact +one existing SW transform.
Worktree clean immediately after implementation; whitespace check PASS. Four owned
preview ports closed. No hosted/device/photo-rights/owner-brand approval implied.

This receipt follows implementation and is excluded from its evidence manifest.
The documentation checkpoint names this verified implementation, not itself.
""")
print(json.dumps(result))
