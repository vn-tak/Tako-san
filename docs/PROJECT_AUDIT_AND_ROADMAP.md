# UI14 frontend delivery / motion checkpoint - 2026-10-11 JST

Canonical vn-tak/Tako-san; UI07identity preserved. UI14 defers optional legacy motion
and retains static active feedback, user policy, routes/guards and public bytes.
Entry raw463601→336308; cold transferred JS falls17.3–18.4% in three repeated local
cold/warm pairs per route. Full288files/6742testsPASS;50settled snapshots/5journeys,
4legacy journeys,2baseline probes and combined-short focus supplemental.
Implementation `7ee28bf48974e8faf52f78caa2b9a5b979953768`; Git-object receipt follows.

This advances frontend delivery, not whole-rebuild/brand/production approval.
Remaining priorities: cramped320×420textx2 reading area, transient fade contrast,
eager offline catalog/domain imports, fonts/images/hosted caching, photo rights and
actual device/usability checks. Next UI15-short-viewport-motion-readability packet
READY only; no UI15 runtime. See docs/ui-rebuild/round-14/PERFORMANCE.md.
No protected/public/domain/remote operation, no push/PR/merge/deploy.

---

# Frigo - Audit hien trang va roadmap hoan thien

> Ngay audit: 2026-09-05  
> Baseline: nhanh `main`, HEAD `08c808c`  
> Pham vi: ma nguon frontend, Worker, domain packages, migrations, test suite va cau hinh Cloudflare trong workspace.

## 1. Ket luan dieu hanh

Frigo da co mot production shell kha day du: React/Vite/PWA o client, Hono tren Cloudflare Workers, D1/R2/KV/Queue/Workers AI, auth JWT/OTP va bo domain engine cho cong thuc - portion - shopping - Frigo Week. Thuong hieu, luong man hinh va cac endpoint chinh da duoc lap ra.

Tuy nhien, core loop **scan/inventory -> recipe -> weekly plan -> shopping -> import -> cook -> deduction -> freshness -> plan tiep theo** chua dat muc production-ready. Diem yeu khong nam o thieu man hinh ma nam o tinh nhat quan cua du lieu va command:

- D1 co schema Frigo Week trung lap; migration 0005 khong thay doi duoc bang da tao boi 0003.
- Gia tri sentinel `OTHER` dang duoc ghi vao cot co foreign key nhung khong co row tuong ung.
- Cac command import shopping, confirm scan va complete cooking chua co idempotency/validation day du; retry co the nhan doi ton kho va event.
- Mot so persistence failure bi catch va van tra `success: true`, trong khi cache duoc publish truoc D1.
- Recipe catalog dang ton tai o ca static package va D1, nhung route/client chu yeu dung static catalog; hai nguon co the lech nhau.
- UI/client van co cac fallback demo o nhieu read path va mot so man hinh hardcode, lam nguoi dung thay trang thai khong phai tu server.

Danh gia tong quat: **co the tiep tuc phat trien tren kien truc modular monolith hien tai, nhung can mot dot data-integrity hardening truoc khi mo rong traffic, thanh toan that hoac cam ket giam food waste.**

## 2. Pham vi, gia dinh va non-goals

### Pham vi da xem

- `src/web`: routing, API client, stores, cac man hinh core va PWA sync.
- `src/worker`: auth, tenancy, inventory, scan, recipe/cooking, shopping, preferences, notifications, Week.
- `packages/domain`, `packages/recipes`, `packages/ai`, `packages/db`.
- `migrations/0001` den `0009`, `wrangler.jsonc`, `scripts/deploy-check.sh`, README va `PROJECT_STATUS.md`.
- Unit tests hien co va replay migration SQLite voi foreign keys bat.

### Gia dinh lam viec

- D1 la database cua mot ho gia dinh; `household_id` la bien tenancy bat buoc.
- KV chi la cache co the xoa va rebuild; khong duoc dung lam nguon su that.
- Closed loop la thuoc tinh san pham quan trong hon viec them man hinh moi.
- Khong co phep deploy/ghi remote trong dot audit nay; trang thai production can duoc xac minh rieng voi quyen Cloudflare.

### Non-goals

- Khong doi React/Hono/Cloudflare D1 sang stack moi.
- Khong tach microservice hoac them queue chi de giai quyet cac loi hien tai.
- Khong thiet ke lai visual system trong roadmap nay, tru cac thay doi can thiet cho state/error/accessibility.
- Khong coi manual Plus grant hien tai la payment reconciliation day du.

## 3. Ban do kien truc va luong du lieu

```text
Camera/Receipt
    -> React API client
    -> Hono auth + tenancy + rate limit
    -> AI Router (Qwen/GLM/Cloudflare/Mock)
    -> scan record + scan_items (D1), anh goc (R2)
    -> user review/confirm
    -> inventory_items + inventory_events (D1)
    -> domain recipe matching / freshness / utilization
    -> Frigo Week planner
    -> meal_plan_* + shopping command (D1)
    -> shopping import
    -> inventory current state + event log
    -> cook complete / deduction
    -> freshness, recommendations, plan tiep theo
```

| Lop | Vai tro hien tai | Nhan xet audit |
| --- | --- | --- |
| React/Vite/PWA | 25 man hinh, Zustand, local cache, offline queue | Co day du surface nhung mot so read path con demo fallback; chua co route guard nghiem ngat. |
| Hono Worker | REST `/api/v1`, auth, tenancy, rate limit | Endpoint da co, nhung DTO/transaction/idempotency chua dong deu. |
| Domain | canonical ingredients, unit, freshness, planner, shopping, scoring | La tai san tot; can bien cac invariant thanh contract dung chung. |
| Recipe package | static Vietnamese + global catalog, ranking | Dang la nguon chinh trong runtime, khong dong bo hoan toan voi D1. |
| AI package | provider router, structured schema, mock | Co fallback; can phan biet ro mock mode, provider unavailable va confidence review. |
| D1 | users, households, inventory, scans, recipes, Week, auth | Co FK/index co ban, nhung migration Week trung lap va event chua co command key. |
| R2/KV/Queue | anh scan, cache, queue binding | Queue consumer da co ledger idempotency, lease, retry va permanent-failure handling; scan endpoints van xu ly dong bo va chua producer vao queue. |

### Luong ownership can giu

1. **Auth/tenancy:** JWT chi xac dinh danh tinh; Worker phai kiem tra membership D1 truoc mutation.
2. **Inventory:** current state o `inventory_items`; event log la audit/reconciliation, khong duoc de hai ben sai nhau.
3. **Planning:** domain engine tinh toan deterministic; AI chi xep hang/giai thich.
4. **Cache:** moi cache response phai co duong rebuild tu D1 va khong duoc publish truoc khi command thanh cong.

## 4. Ma tran tinh nang

Ky hieu: `Co` = da co va co duong dung; `Mot phan` = co surface nhung chua du contract; `Khong` = chua co; `Chua dat` = chua du production-ready.

| Tinh nang | UI | API | Persisted | Test hien co | Production-ready | Danh gia |
| --- | --- | --- | --- | --- | --- | --- |
| Email/password + OTP + Google | Co | Co | Co (`users`, `auth_accounts`, `auth_otps`, `sessions`) | Unit auth | Chua dat | Contract JWT vua duoc dong bo; reset, quota, route guard va E2E con thieu. |
| Guest session + migrate | Co | Co | Co (household/inventory/events) | Predicate unit | Chua dat | Co ownership check, nhung migration dang best-effort va chua co integration test. |
| Inventory CRUD/freshness | Co | Co | Co (`inventory_items`, events) | Domain/unit + replay | Da harden | Optimistic `version`, idempotency replay va affected-row guard da co; con can integration/staging proof. |
| Fridge scan | Co | Co | Co (`scans`, `scan_items`, R2) | Schema/provider unit | Da harden mot phan | MIME/quota/confirm replay da co xuong duong; offline command durability va E2E con thieu. |
| Receipt OCR | Co | Co | Mot phan | Schema/provider unit | Chua dat | Review UI co, nhung import/reconciliation va unknown ingredient chua an toan. |
| Recipe catalog/detail/recommendation | Co | Co | Mot phan (D1 seed + static runtime) | Recipe engine unit | Chua dat | Hai catalog khong phai mot canonical source; detail client khong goi server. |
| Cooking mode + deduction | Co | Co | Co (`cooked_meals`, inventory/events) | Unit + command integrity | Da harden mot phan | Zod/idempotency/guard da co; can route integration + staging concurrency proof. |
| Frigo Week planner/swap | Co | Co | Co nhung trung schema | Domain Week unit | Chua dat | Persistence/cache lifecycle best-effort; reconstruct lam mat mot so chi so. |
| Shopping list co ban | Co | Co | Co | Unit + affected-row guard | Da harden mot phan | Plan-aware write path va conflict handling da co; can integration/E2E cho tenant + replay. |
| Shopping import vao inventory | Co | Co | Co (inventory + events) | Command ledger unit | Da harden mot phan | Command ledger/lease/token da co; can staging proof cho replay/fenced lease. |
| Family sharing | Co | Khong dang ke | Khong | Khong | Khong | Invite code/member list dang local hardcode, chua co join mutation. |
| Frigo Plus/VietQR | Co | Mot phan | Mot phan (`subscriptions`, manual grant) | Khong co | Khong | Chua co webhook, signature verification, reconciliation va idempotent entitlement. |
| PWA/offline sync | Co | Co mot phan | Local queue | Sync unit | Da harden mot phan | Idempotency header preservation da co; offline scan durable command va tenant-switch E2E con thieu. |
| Queue/observability | Co mot phan | Co binding | Khong dang ke | Khong | Khong | Consumer trong `index.ts` chi log va `ack`, chua xu ly scan job/ retry/DLQ. |

Cap nhat theo working tree: cac hang F-01, F-02, F-03, F-08, F-09 va F-12a da duoc harden o muc route/domain/docs, nhung van chua co integration/E2E/staging proof nen `Production-ready` van coi la `Chua dat`.

## 5. Findings theo muc do

### P0 - blocker ve tinh dung dan va an toan du lieu

#### F-00 - Auth JWT contract da duoc dong bo trong working tree (da xu ly)

- **Bang chung:** `src/worker/utils/jwt.ts:6-18,82-111` yeu cau `typ`, `exp`, `sub`, `hid`; cac fixture cu trong `tests/unit/auth.test.ts` thieu `typ` tai cac case token thuong/guest.
- **Trieu chung:** `pnpm typecheck` fail tai cac fixture, guest migration test tu choi token hop le.
- **Xu ly trong dot nay:** bo sung `typ: 'access'` cho token thuong va `typ: 'guest'` cho guest token trong `tests/unit/auth.test.ts:37-84,295-326`; them test fail-closed cho AI o cung dot.
- **Gate:** `pnpm check` phai xanh; can them route integration auth/guest migration truoc khi dong P0 hoan toan.

#### F-01 - Sentinel `OTHER` vi pham foreign key

- **Vi tri:** `src/worker/routes/inventory.ts:98-103`, `src/worker/routes/scans.ts:89-100,350-385`, `packages/ai/src/providers/cloudflare.ts:106-115,162-174`; FK canonical nam o `migrations/0001_initial_schema.sql:75-85,153-165`.
- **Trang thai working tree:** da harden sang `NULL + raw label` trong inventory/scans, fail-closed khi khong map duoc, va migration replay/foreign-key smoke da pass.
- **Con gap that:** can integration/E2E cho unknown ingredient trong scan/receipt/manual va proof staging/remote tren luong OCR that.
- **Evidence:** `migrations/0001_initial_schema.sql` cho phep `ingredient_id` nullable o inventory; `src/worker/routes/inventory.ts` va `src/worker/routes/scans.ts` da khong con phat sinh sentinel canonical.
- **Acceptance:** unknown ingredient tao duoc row voi `ingredient_id IS NULL`; retry/scan confirm khong bi 500 va khong tao orphan FK.

#### F-02 - Cooking completion co the ghi sai state nhung tra thanh cong

- **Vi tri:** `src/worker/routes/recipes.ts:114-225,230-237`.
- **Trang thai working tree:** da harden DTO/deduction guard/idempotency, batch inventory + cooked_meals fail-closed, va concurrency probe re-read inventory khi lease drift.
- **Con gap that:** chua co route integration test true D1 rollback/lock-failure, va chua co staging proof cho concurrent cook under real quota/load.
- **Evidence:** `tests/unit/command-route-integrity.test.ts` co replay/concurrent cook coverage; `src/worker/routes/recipes.ts` kiem tra batch result va latest inventory version.
- **Acceptance:** retry khong tao duplicate `cooked_meals`; batch fail thi khong commit inventory/event; stale version tra `409 INSUFFICIENT_INVENTORY`.

#### F-03 - Shopping import khong co ranh gioi command/idempotency

- **Vi tri:** `src/worker/routes/week.ts:588-700`.
- **Trang thai working tree:** da co command ledger `shopping_import_commands`, lease token, plan-scoped selection va commit guard theo affected rows.
- **Con gap that:** van can integration/E2E cho takeover/fenced lease va proof staging cho duplicate click/offline replay that.
- **Evidence:** `src/worker/routes/week.ts` co `resolveShoppingCommandKey`, `claimShoppingCommand`, `shoppingLeaseExistsSql` va update `shopping_import_commands` co `response_json`.
- **Acceptance:** chi import item thuoc plan; replay tra lai payload cu; stale/fenced worker khong bao success; duplicate import khong nhan doi ton kho.

### P1 - loi nghiem trong trong core feature

#### F-04 - Schema Frigo Week trung lap, migration 0005 khong thay doi bang cu

- **Vi tri:** `migrations/0003_weekly_planner.sql:25-70` tao `meal_plan_days(day_of_week INTEGER)`, `meal_slots`, requirement; `migrations/0005_meal_plans_relational.sql:5-45` tao lai `meal_plan_days(day_of_week TEXT)` va `meal_plan_slots`.
- **Trang thai working tree:** `0010_week_schema_shadow_canonical.sql` da tao ba bang v2 additive, normalize `day_of_week`, giu snapshot/slot metadata/shopping math va backfill legacy-only rows; bang cu khong bi drop.
- **Con gap that:** Worker van doc/ghi projection cu. Can dual-write + catch-up backfill/checksum truoc khi bat v2-read; migration mot lan khong tu dong bat cac write phat sinh trong khoang rollout.
- **Acceptance:** parity row count/checksum theo plan, forced relational-v2 reconstruction, dual-write rollback atomic va rollback code ve legacy mode khong mat du lieu.

#### F-05 - Plan persistence va cache khong atomic

- **Vi tri:** `src/worker/routes/week.ts:39-77,79-157` va cac call site publish cache truoc D1 tai `365-378,425-436,482-493,522-533`.
- **Van de:** cleanup plan cu la nhieu statement rieng, best-effort; `db.batch` bi catch va khong propagate; KV duoc ghi truoc khi persistence xac nhan.
- **Tac dong:** mat plan cu nhung plan moi khong vao D1, hoac client doc phantom plan tu KV.
- **Sua:** command transaction/compensating strategy, persist xong moi invalidate/put cache; cache miss phai rebuild tu D1.

#### F-06 - Scan persistence va confirm chua co state transition/idempotency

- **Vi tri:** `src/worker/routes/scans.ts:115-154,203-241` swallow loi save; confirm tai `297-420` cho phep goi lai, update status khong condition `ready`.
- **Tac dong:** scan record khong co trong D1 nhung response 200; confirm lap nhan doi inventory/event.
- **Sua:** tao scan pending/processing/ready ro rang, unique command key, `UPDATE ... WHERE status='ready'`, transaction confirm va test replay.

#### F-07 - Recipe source khong canonical

- **Vi tri:** client `src/web/services/api.ts:331-337` tim hoan toan trong `ALL_RECIPES`; Worker `src/worker/routes/recipes.ts:18-57` cung tim static; D1 seed recipe/ingredients/steps o `migrations/0001_initial_schema.sql:169-206` va `0006_vietnamese_recipe_bank.sql`.
- **Tac dong:** recipe co trong D1 nhung khong co static (hoac nguoc lai) cho ket qua khac nhau; update cong thuc khong co hieu luc dong bo.
- **Sua:** chon D1 lam canonical catalog, cache DTO; static package chi lam seed/test fixture, co catalog version va migration checksum.

#### F-08 - Unit conversion khong bao loi khi khong tuong thich

- **Vi tri:** `packages/domain/src/index.ts:546-554` tra lai nguyen quantity cho cap unit khong convert duoc.
- **Trang thai working tree:** da harden guard `areUnitsCompatible` trong cooking/shopping/inventory route; incompatible unit tra `422` thay vi im lang quy doi.
- **Con gap that:** domain conversion API van can typed result/explicit error thay vi fallback gia; can them integration test cho cap don vi hiem.
- **Evidence:** `src/worker/routes/recipes.ts` va `src/worker/routes/week.ts` reject unit mismatch truoc batch; `tests/unit/cooking-route-allocation.test.ts` cover allocation.
- **Acceptance:** incompatible units tra loi ro rang, khong lam update quantity sai va khong bao success neu khong quy doi duoc.

#### F-09 - Validation Week/route chua dong deu

- **Vi tri:** `src/worker/routes/week.ts:344-378,463-534,566-585,744-760` nhan raw body; PATCH slot/item khong tra 404 neu target khong ton tai.
- **Trang thai working tree:** da co Zod schemas cho command bodies va affected-row guard cho inventory/shopping; response no longer silent-success khi row khong commit.
- **Con gap that:** Week mutation surface van can integration coverage de chot 404/409/428 contract tren staging.
- **Evidence:** `src/worker/validation/schemas.ts`, `src/worker/routes/inventory.ts`, `src/worker/routes/week.ts` va `tests/unit/command-route-integrity.test.ts`.
- **Acceptance:** target khong ton tai tra 404; stale writes tra 409/428; empty/invalid body bi chặn truoc mutation.

#### F-10 - Quota scan va usage logging chua la policy enforce

- **Vi tri:** `/me` doc subscription tai `src/worker/routes/auth.ts:141-200`, nhung scan routes tai `src/worker/routes/scans.ts:45-87,157-176` chi rate-limit; `packages/ai/src/router.ts:210-214` chi callback usage neu duoc truyen.
- **Tac dong:** free plan co the khong bi gioi han scan thuc te; chi phi AI va entitlement khong duoc kiem soat.
- **Sua:** policy middleware + atomic monthly counter trong D1/KV, log request vao `ai_requests`, tra 402/429 co retry semantics.

#### F-11 - Queue da khai bao nhung consumer chua xu ly job

- **Vi tri:** `wrangler.jsonc:33-46` khai bao producer/consumer; `src/worker/index.ts:115-123` chi log body va `msg.ack()`.
- **Tac dong:** khong co async vision, retry, dead-letter, progress state; queue tao cam giac da co pipeline nhung khong co behavior.
- **Sua:** dinh nghia job schema, idempotent worker, update scan status, retryable/permanent error va DLQ/alert.

#### F-12 - Tai lieu deployment va schema status bi lech

- **Vi tri:** `README.md:199-214` hien da chuyen sang `d1 migrations apply` cho 0001-0010; `migrations/0006_vietnamese_recipe_bank.sql` da harden replay an toan va `0010` additive shadow schema. `PROJECT_STATUS.md` da cap nhat ket qua fingerprint, backup, migration va deploy production ngay 2026-09-06.
- **Tac dong:** operator co the deploy Worker vao D1 thieu bang auth/Week, hoac tin nham vao production-ready.
- **Sua:** mot runbook migration duy nhat, check version/schema fingerprint truoc deploy, cap nhat status theo ket qua command thuc te. Van can xac minh `migrations list` tren moi database muc tieu truoc khi rollout; `0010` chi la backfill additive, chua bat v2-read.

#### F-12a - Offline scan va inventory replay khong co command bền vững

- **Vi tri:** `src/web/services/api.ts:219-315`, `src/web/lib/sync.ts:17-145`.
- **Van de:** `scanFridge()`/`scanReceipt()` offline tra ID tam (`scan_<timestamp>`/`receipt_<timestamp>`) nhung khong enqueue lenh tao scan. Khi nguoi dung bam xac nhan, client chi enqueue `POST /scans/<id>/confirm`; Worker tu choi ID khong ton tai (va chi cho phep ngoai le prefix `scan_real_`), sau do outbox drop loi 4xx. Ket qua scan offline vi the mat sau reconnect. Ngoai ra `PendingOp` chua gan household/user; replay sau logout/chuyen tai khoan co the gui mutation cua tenant cu voi header cua tenant moi. Inventory offline tao temp ID; PATCH/DELETE truoc replay co the tro toi ID khac tren server.
- **Trang thai working tree:** da co sync/outbox guard va header idempotency preservation, nhung offline scan confirm flow van chua tao command durable from first write.
- **Con gap that:** can offline E2E cho replay/tenant switch/temporary IDs va proof that 4xx conflict khong bi drop nhu permanent reject.
- **Evidence:** `tests/unit/sync.test.ts` giu Idempotency-Key khi replay; `src/web/services/api.ts` va `src/web/lib/sync.ts` da harden replay header/context mot phan.
- **Acceptance:** offline scan/reconnect tao dung mot scan va inventory projection; logout/account switch khong replay sang tenant khac; retry/double-click khong nhan doi.

### P2 - UX, van hanh va maintainability

- **F-13:** `src/web/pages/HomePage.tsx:154-230` hardcode `5/7`, `560k/800k`, va danh sach 'nen dung som'; can bind tu inventory/plan API.
- **F-14:** `src/web/pages/FamilySharingPage.tsx:10-52` dung invite code `FRG-8926`, member list local va join chi mutate state client; can backend invite/member model.
- **F-15:** JWT duoc luu trong `localStorage` tai `src/web/services/api.ts:16-28` va `src/web/stores/useAuthStore.ts:95-103`; can danh gia httpOnly cookie/refresh rotation va XSS CSP.
- **F-16:** `src/worker/middleware/rate-limit.ts:34-97` dung KV read-modify-write khong atomic; memory fallback khong phu hop multi-instance production.
- **F-17:** `public/sw.js:1-81` chi precache app shell nho, chua co conflict resolution/replay contract cho API; can versioned cache va outbox co command id.
- **F-18:** chua co E2E browser, route integration D1, migration matrix, concurrency/load hay security tenancy test; unit hien co tap trung domain/schema.

## 6. Quyet dinh kien truc de lam moc

1. **Giu modular monolith:** Worker/Hono la mot deployable, packages phan tach theo domain; khong them microservice cho den khi co metric ve latency, throughput hoac team boundary.
2. **D1 la source of truth:** moi current state va command result phai reconstruct duoc tu D1; KV chi cache co TTL va co invalidation.
3. **Mot recipe catalog canonical:** D1 la runtime source; `packages/recipes` la seed/fixture generator. Moi recipe co version/checksum va migration ro rang.
4. **Moi mutation la command idempotent:** client gui `Idempotency-Key` (hoac command id trong body); server luu ket qua/command status theo household va tra lai ket qua cu khi replay.
5. **Event log + current state nhat quan:** `inventory_items` la projection hien tai; `inventory_events` la audit. Ghi projection va event trong cung transaction; them FK/retention/rebuild tool.
6. **Unknown ingredient khong dung sentinel FK:** `ingredient_id` nullable khi chua map, giu raw label va normalization status; user co the map sau.
7. **Fail loud theo boundary:** mock chi khi `AI_MOCK_MODE=true`; provider unavailable, DB failure, auth failure khong duoc bien thanh fixture thanh cong.
8. **Queue chi cho cong viec co loi ich do duoc:** truoc mat hoan thien synchronous path va metrics; sau do moi bat async scan voi state machine va DLQ.
9. **API contract chung:** response thanh cong/error, status code, schema Zod va OpenAPI snapshot dung chung giua Worker/client; khong de `any` la contract.

## 7. Roadmap trien khai theo pha

Moi pha co the tach thanh mot PR nho. Pha sau chi bat dau khi acceptance cua pha truoc da xanh.

### Pha 0 - Dong bo contract va CI (uu tien ngay)

**Muc tieu:** build gate phan anh dung code dang chay, khong co fixture/auth contract lech.

- **File du kien:** `src/worker/utils/jwt.ts`, `src/worker/middleware/auth.ts`, `src/worker/routes/auth.ts`, `tests/unit/auth.test.ts`, `PROJECT_STATUS.md`, `README.md`.
- **Phu thuoc:** khong; can bao ve cac thay doi auth dang co trong worktree.
- **Viec lam:** chuan hoa `typ=access|guest|reset`; them fixture theo token type; cap nhat runbook apply 0001-0010; ghi ro remote verification gap; them test malformed/missing exp/hid.
- **Acceptance:** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` xanh; guest migration chi chap nhan guest JWT dung `hid`; docs khong tuyen bo 'zero issue' khi chua co integration gate.
- **Test command:** `pnpm check`.

### Pha 1 - Hop nhat schema, unknown ingredient va contracts

- **File du kien:** `migrations/0007_week_integrity.sql` den `migrations/0010_week_schema_shadow_canonical.sql`; `packages/db/src/queries.ts`; `packages/domain/src/*`; `src/worker/validation/schemas.ts`; cac route inventory/scan/week/shopping; them `tests/integration/migrations/*`.
- **Phu thuoc:** backup/fingerprint schema remote; chot quyet dinh nullable unknown ingredient.
- **Viec lam:** chon mot bo projection Week; da tao shadow canonical additive `0010` va backfill legacy-only rows; tiep theo them schema fingerprint/checksum, catch-up backfill sau dual-write, va chi drop orphan sau verify; them `normalization_status/raw_name`; shared DTO schemas; index `(household_id, updated_at)`, `(plan_id, date)`, `(scan_id, status)`; migration check.
- **Acceptance:** apply tu 0001 den moi nhat tren DB rong va DB co seed; `PRAGMA foreign_key_check` rong; khong query bang orphan; unknown item khong 500; schema fingerprint local/remote khop.
- **Test command:** `pnpm vitest run tests/integration/migrations`; `pnpm typecheck && pnpm lint`.

### Pha 2 - Inventory, freshness, unit va event atomicity

- **File du kien:** `src/worker/routes/inventory.ts`, `packages/domain/src/index.ts`, `packages/db/src/queries.ts`; tao `src/worker/services/inventory-command.ts`; migration them `version`/`command_id`/FK event; tests domain + route.
- **Phu thuoc:** Pha 1 schema canonical.
- **Viec lam:** gom ADD/UPDATE/DELETE/COOK/DISCARD vao command service; conversion fail closed; optimistic concurrency (`version`/ETag); projection + event cung transaction; idempotent retry.
- **Acceptance:** khong co quantity am/NaN; unit mismatch tra 422; retry cung command chi co mot event; concurrent update tra 409 thay vi lost update; event khong orphan.
- **Test command:** `pnpm vitest run tests/unit/recipe-engine.test.ts tests/integration/inventory`; `pnpm check`.

### Pha 3 - Scan/AI that, quota va background processing

- **File du kien:** `packages/ai/src/router.ts`, `packages/ai/src/types.ts`, `src/worker/routes/scans.ts`, `src/worker/index.ts`, `src/worker/middleware/rate-limit.ts`, `wrangler.jsonc`; tao `src/worker/services/scan-command.ts`; migration `ai_requests`/quota/scan command.
- **Phu thuoc:** Pha 1 unknown ingredient, Pha 2 inventory command; secrets/provider health check.
- **Viec lam:** validate data URL MIME + decoded magic bytes; provider timeout/circuit; mock explicit; confidence threshold + review; quota atomic; usage logging; queue state machine `pending -> processing -> ready|failed`, retry/DLQ.
- **Acceptance:** provider khong co trong production tra `AI_SCAN_UNAVAILABLE`; khong ghi fixture; MIME sai tra 415; quota vuot tra 429/402; confirm replay idempotent; job fail co retry va scan status failed.
- **Test command:** `pnpm vitest run tests/unit/ai-router.test.ts tests/unit/receipt-scan.test.ts tests/integration/scans`; `pnpm build:worker`.

### Pha 4 - Recipe catalog va Frigo Week persistence

- **File du kien:** `packages/recipes/src/*`, `src/worker/routes/recipes.ts`, `src/web/services/api.ts`, `src/worker/routes/week.ts`, `src/web/stores/useWeekStore.ts`, migration catalog/Week, tests Week.
- **Phu thuoc:** Pha 1 schema; Pha 2 unit conversion; Pha 3 scan data tin cay.
- **Viec lam:** D1 canonical recipe read/detail; seed generator tu package; persist day/slot/requirements day du; reconstruct khong gan default sai (`availability`, `missing`, `source`); transaction plan lifecycle; validate swap/patch. Đã bổ sung snapshot JSON versioned cho plan/slot/shopping item và ghi `day_type`; migration `0010` thêm shadow canonical Week projections; legacy read path dùng fallback bảo thủ.
- **Acceptance:** cung recipe id cho ket qua nhu nhau o client/Worker/D1; cache flush/rebuild khong doi business fields; generate/regenerate/swap concurrent khong mat plan; slot khong ton tai tra 404. Snapshot round-trip, migration 0008 va migration 0006 replay-safety da co test; route integration/concurrency vẫn là gap.
- **Test command:** `pnpm vitest run tests/unit/week-planner.test.ts tests/integration/week`; `pnpm check`.

### Pha 5 - Shopping import + cooking deduction closed loop

- **File du kien:** `src/worker/routes/week.ts`, `src/worker/routes/recipes.ts`, `src/web/services/api.ts`, `src/web/pages/CookingCompletePage.tsx`, `src/web/stores/useCookingStore.ts`, command/idempotency migration, E2E fixtures.
- **Phu thuoc:** Pha 2 inventory command, Pha 4 plan/recipe canonical.
- **Viec lam:** server snapshot shopping run; validate membership/quantity; command id; cooking servings explicit; atomic cooked meal + inventory projection + events; response chi 2xx sau commit; client gui idempotency key.
- **Acceptance:** chuoi `shopping complete -> inventory -> cook -> deduction` lap lai an toan; double-click/offline replay khong nhan doi; ton kho va event totals khop; DB failure tra 5xx va UI khong reset thanh cong.
- **Test command:** `pnpm vitest run tests/integration/closed-loop`; `pnpm playwright test tests/e2e/closed-loop.spec.ts`.

### Pha 6 - Auth, family sharing va Plus/payment reconciliation

- **File du kien:** `src/worker/routes/auth.ts`, `src/worker/middleware/auth.ts`, `src/web/stores/useAuthStore.ts`, `src/web/pages/FamilySharingPage.tsx`, `src/web/components/payment/VietQRModal.tsx`, migration invite/payment/entitlement, webhook route.
- **Phu thuoc:** Pha 0 contract; Pha 2 command/idempotency; tai khoan Cloudflare payment/email.
- **Viec lam:** route guard server/client; refresh/revocation strategy; invite token hash + expiry + role; member join/leave; payment intent, webhook signature, reconciliation, entitlement version; bo invite code hardcode.
- **Acceptance:** user khong doc/sua household khac; invite het han/da dung bi tu choi; webhook replay idempotent; Plus chi active khi server da reconcile; logout khong de stale entitlement.
- **Test command:** `pnpm vitest run tests/unit/auth.test.ts tests/integration/auth-tenancy`; `pnpm playwright test tests/e2e/auth-family-plus.spec.ts`.

### Pha 7 - Frontend bo demo fallback, PWA/offline va accessibility

- **File du kien:** `src/web/services/api.ts`, `src/web/App.tsx`, `src/web/stores/useAuthStore.ts`, `src/web/lib/sync.ts`, `public/sw.js`, `src/web/components/common/OfflineBanner.tsx`, `src/web/pages/HomePage.tsx`, `FamilySharingPage.tsx`.
- **Phu thuoc:** Pha 2/5 da co idempotent API va error envelope.
- **Viec lam:** fallback local chi cho offline; route guard theo auth state; home bind inventory/plan that; outbox co command id, retry policy, conflict UI; cache versioning; keyboard/focus/aria/mobile network states.
- **Acceptance:** 401/403/5xx khong hien fixture; offline write replay mot lan; conflict hien ro; refresh khong vao app shell khi session het han; Lighthouse/accessibility khong co blocker.
- **Test command:** `pnpm playwright test tests/e2e/offline-replay.spec.ts`; `pnpm lint && pnpm build`.

### Pha 8 - Observability, E2E va release/rollback

- **File du kien:** `scripts/deploy-check.sh`, `wrangler.jsonc`, them `scripts/schema-check.*`, `tests/e2e/*`, `tests/integration/*`, runbook `docs/RELEASE_RUNBOOK.md`, metrics/logging helpers.
- **Phu thuoc:** tat ca Pha 0-7; can staging D1/R2/KV/Queue tach production.
- **Viec lam:** structured logs voi request/command id; dashboard latency/error/quota/queue; migration preflight + postflight; canary/feature flag; backup/export; rollback cache va code; SLO va alert.
- **Acceptance:** mot lenh predeploy fail neu schema/version sai; E2E core loop xanh tren staging; co rollback duoc migration/feature flag; alert cho AI unavailable, DB failure, duplicate command, queue DLQ.
- **Test command:** `pnpm check`; `pnpm playwright test`; `pnpm run schema:check` (them vao package scripts sau khi implement).

## 8. Ma tran kiem thu can bo sung

| Tang test | Pham vi | Case bat buoc | Gate |
| --- | --- | --- | --- |
| Unit domain | conversion, freshness, scoring, portion, shopping | incompatible unit, expiry boundary, zero/negative, package rounding, leftover | Moi PR |
| Unit AI/schema | provider router, structured output | mock explicit, no provider, timeout, malformed JSON, confidence | Moi PR |
| Route integration + D1 fake | auth/tenancy/inventory/scan/Week/cook | 401/403/404/409/422/429/5xx, FK, transaction rollback | Moi feature |
| Migration/FK | SQLite/D1 replay | empty DB, seeded DB, upgrade cu, `foreign_key_check`, schema fingerprint | Truoc deploy |
| Closed-loop E2E | auth -> scan -> confirm -> recipe -> cook -> deduction -> shopping | happy path, unknown ingredient, retry/double click, cross-household | Release gate |
| Offline/reconnect | service worker + outbox | offline add, reconnect replay, duplicate replay, conflict/version | Release gate |
| Security/tenancy | JWT, membership, invite, rate limit | forged/expired/wrong typ, IDOR, guest isolation, KV failure, quota | Release gate |
| Load/concurrency | D1 commands/AI/queue | concurrent update, repeated command, provider latency, queue retry | Before scale |
| UX/accessibility | critical pages | error state, loading, empty, keyboard, screen reader, 360px/desktop | Before release |

## 9. Rui ro va rollback

| Rui ro | Dau hieu | Giam thieu/rollback |
| --- | --- | --- |
| Migration lam mat du lieu | FK/check fail, row count giam | backup/export, migration shadow table, canary household, khong drop bang cu cho den khi verify. |
| Cache phantom/stale | UI khac D1 | invalidate theo command, cache miss rebuild, co endpoint purge theo household. |
| AI chi phi/latency | timeout, 429, cost spike | quota atomic, timeout, circuit breaker, mock chi local, feature flag provider. |
| Offline replay nhan doi | inventory/event tang bat thuong | command id unique, reconciliation report, tam khoa replay feature flag. |
| Auth migration | 401 hang loat | dual verification co thoi han, refresh token rotation, revoke old key theo plan, canary. |
| Payment entitlement sai | Plus active sai han | server-only entitlement, webhook idempotency, manual revoke, audit log. |
| Queue backlog | `processing` ton dong/DLQ | visibility timeout, retry cap, DLQ, fallback synchronous co gioi han. |

Rollback nguyen tac: rollback code/feature flag truoc, khong rollback bang cach xoa migration da apply; migration chi additive va co script backfill/reconcile. Rollout production ngay 2026-09-06 da apply `0007`-`0010`, deploy Worker version `da10ef84-cd04-4efb-ab97-831ff0c8b76c` va bat Workers Logs. Week v2 van la shadow; khong cutover read truoc dual-write va parity check.

## 10. Cau hoi mo can chot truoc Pha 1/3/6

1. Remote D1 da duoc xac minh co migrations `0001`-`0010`, ba bang Week v2 va `foreign_key_check` sach; buoc tiep theo la tu dong hoa schema fingerprint trong release gate.
2. Product muon unknown ingredient la `NULL + raw label` hay seed mot canonical `OTHER` co nghia? Khuyen nghi phuong an NULL.
3. D1 co phai catalog recipe runtime duy nhat khong? Khuyen nghi co.
4. Quota free/Plus la theo user hay household, reset timezone nao, va scan receipt co tinh cung quota khong?
5. Family invite can vai tro owner/member nao, co cho phep doi household va revoke ngay khong?
6. Payment provider/webhook nao la nguon xac thuc; manual grant se het han khi nao?
7. Offline conflict uu tien last-write-wins, server-wins hay merge theo event? Can chot truoc khi public offline writes.
8. Thoi gian luu anh scan va PII/receipt la bao lau; ai co quyen xoa/export?

## 11. Cong viec da trien khai trong dot audit nay

- Dong bo JWT fixture `typ` trong `tests/unit/auth.test.ts`, bao gom guest migration predicate.
- Sua `src/web/services/api.ts` de cac read/scan fallback chi chay khi `ApiError.kind === 'offline'`; HTTP 401/403/5xx khong con bi bien thanh fixture local.
- Lam ro fail-closed cua `packages/ai/src/router.ts` khi production khong co vision provider; them regression test trong `tests/unit/ai-router.test.ts`.
- Da chay thanh cong sau thay doi: `103 tests passed`, `migration smoke 0001-0010`, `pnpm typecheck`, `pnpm lint`, `pnpm build`.
- Da backup va apply migrations production `0007`-`0010`, deploy Worker, bat Workers Logs va hoan tat smoke test tren custom domain ngay 2026-09-06.

Dual-write scaffold da duoc deploy dormant voi `WEEK_SCHEMA_MODE=legacy`. Buoc tiep theo la them catch-up reconciliation + parity checksum, sau do moi canary `dual`; van chua du dieu kien cutover read.
