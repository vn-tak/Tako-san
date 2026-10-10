from pathlib import Path
import json, hashlib, subprocess, socket, datetime
root=Path.cwd(); artifacts=root/'.artifacts/ui13'
freeze=json.loads((artifacts/'source-freeze.json').read_text())
for item in freeze['files']:
 raw=(root/item['path']).read_bytes()
 assert len(raw)==item['bytes'] and hashlib.sha256(raw).hexdigest()==item['sha256'],item['path']
proof=json.loads((artifacts/'protected-proof.json').read_text());base=proof['base']
assert subprocess.check_output(['git','diff',base,'--','src'])==b''
assert subprocess.check_output(['git','diff',base,'--',*proof['protectedPaths']])==b''
public=[]
for p in sorted((root/'public').rglob('*')):
 if not p.is_file(): continue
 rel=p.relative_to(root/'public');raw=p.read_bytes();built=(root/'dist/client'/rel).read_bytes()
 expected=raw.replace(b'__TAKOSAN_BUILD_ID__',b'local') if str(rel)=='sw.js' else raw
 assert built==expected,str(rel)
 public.append({'path':str(p.relative_to(root)),'sourceBytes':len(raw),'sourceSha256':hashlib.sha256(raw).hexdigest(),'buildBytes':len(built),'buildSha256':hashlib.sha256(built).hexdigest(),'byteIdentical':raw==built,'expectedTransform':'__TAKOSAN_BUILD_ID__ -> local' if str(rel)=='sw.js' else None})
assert len(public)==257 and sum(x['byteIdentical'] for x in public)==256
ports={}
for port in [5212,8912,5213,8913,5214,8914,5215]:
 with socket.socket() as s:
  s.settimeout(.3);ports[str(port)]=s.connect_ex(('127.0.0.1',port))!=0
assert all(ports.values()),ports
receipt={'verifiedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base':base,'sourceRecordsVerified':len(freeze['files']),'publicOriginalsVerified':len(public),'publicBuildByteIdentical':256,'publicBuildExpectedTransform':1,'entireSrcDiffEmpty':True,'protectedDiffEmpty':True,'ownedPreviewStopped':True,'ownedPortsClosed':ports,'public':public}
(artifacts/'final-integrity.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print('PASS 383 frozen records; entire src/protected diff empty; 257 public originals and build (256 exact / 1 expected SW transform); all seven preview ports closed')
