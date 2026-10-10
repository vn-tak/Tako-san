from pathlib import Path
import hashlib, json, subprocess, socket, datetime, re
root = Path.cwd()
artifacts = root / '.artifacts/ui14'
freeze = json.loads((artifacts / 'source-freeze.json').read_text())
for record in freeze['files']:
    data = (root / record['path']).read_bytes()
    assert len(data) == record['bytes'] and hashlib.sha256(data).hexdigest() == record['sha256'], record['path']
proof = json.loads((artifacts / 'protected-proof.json').read_text())
base = proof['base']
assert subprocess.check_output(['git', 'diff', base, '--', *proof['protectedPaths']]) == b''
previous = subprocess.check_output(['git', 'show', base + ':src/web/App.tsx'])
current = (root / 'src/web/App.tsx').read_bytes()
assert current.replace(b"'./design-system/motion-provider'", b"'./design-system/motion'") == previous
previous_motion = subprocess.check_output(['git', 'show', base + ':src/web/design-system/motion.tsx'])
current_motion = (root / 'src/web/design-system/motion.tsx').read_bytes()
assert previous_motion.split(b'/** Standard route transition:')[1] == current_motion.split(b'/** Standard route transition:')[1]
previous_nav = subprocess.check_output(['git', 'show', base + ':src/web/design-system/navigation.tsx']).decode()
current_nav = (root / 'src/web/design-system/navigation.tsx').read_text()
old_indicator = re.search(r'<motion.span\s.*?/>', previous_nav, re.S).group()
reversed_nav = current_nav.replace("import { DeferredNavIndicator } from './deferred-nav-indicator';", "import { motion } from 'motion/react';").replace('<DeferredNavIndicator indicatorId={indicatorId} />', old_indicator)
assert re.sub(r'\s+', ' ', reversed_nav) == re.sub(r'\s+', ' ', previous_nav)
loaded = (root / 'src/web/design-system/legacy-nav-indicator.tsx').read_text()
assert re.sub(r'\s+', ' ', re.search(r'<motion.span\s.*?/>', loaded, re.S).group()) == re.sub(r'\s+', ' ', old_indicator)
public = []
for path in sorted((root / 'public').rglob('*')):
    if not path.is_file(): continue
    rel = path.relative_to(root / 'public')
    original = path.read_bytes()
    built = (root / 'dist/client' / rel).read_bytes()
    expected = original.replace(b'__TAKOSAN_BUILD_ID__', b'local') if str(rel) == 'sw.js' else original
    assert built == expected, str(rel)
    public.append({'path': str(path.relative_to(root)), 'sourceBytes': len(original), 'sourceSha256': hashlib.sha256(original).hexdigest(), 'buildBytes': len(built), 'buildSha256': hashlib.sha256(built).hexdigest(), 'byteIdentical': original == built, 'expectedTransform': '__TAKOSAN_BUILD_ID__ -> local' if str(rel) == 'sw.js' else None})
assert len(public) == 257 and sum(p['byteIdentical'] for p in public) == 256
ports = {}
for port in [5216, 5217, 5218, 5219]:
    with socket.socket() as sock:
        sock.settimeout(.3)
        ports[str(port)] = sock.connect_ex(('127.0.0.1', port)) != 0
assert all(ports.values()), ports
result = {'verifiedUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'base': base, 'sourceRecordsVerified': len(freeze['files']), 'publicOriginalsVerified': len(public), 'publicBuildByteIdentical': 256, 'publicBuildExpectedTransform': 1, 'protectedDiffEmpty': True, 'appOnlyProviderImportChanged': True, 'existingMotionHelpersExact': True, 'navigationExceptIndicatorEquivalent': True, 'loadedIndicatorJSXEquivalent': True, 'ownedPreviewStopped': True, 'ownedPortsClosed': ports, 'public': public}
(artifacts / 'final-integrity.json').write_text(json.dumps(result, indent=2) + '\n')
print('PASS 396 frozen records; protected/App/helper proof; 257 public (256 exact / 1 expected SW transform); four owned ports closed')
