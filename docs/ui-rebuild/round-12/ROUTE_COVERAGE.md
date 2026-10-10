# UI12 - Route/state coverage

2026-10-11 JST. Source `App.tsx` có47route declarations gồm aliases, payment và
protected auth. Đây là bản đồ source, không phải chứng nhận47trang. Exact paths,
width/height/synthetic markers trong `evidence/route-state-matrix.json`.

Runtime UI12 chỉ đổi Home/discovery/detail/shared media/CSS. Regression samples
trong main matrix gồm Home, stock, stock detail, scan/review/receipt/photo, recipes,
recipe, notifications/privacy, planner/shopping, account/preferences/planning
settings, Scan và Cook immersive. Planner OFF kiểm Week/dashboard/setup shell.
Supplemental kiểm settings/app, household, reconciliation, scan missing ID,
cook entry/no-attempt, public landing và registered login tại320/1440 nơi áp dụng.

167ON+24OFF+13states+14supplemental=218structured cases. Main/off/state có26journeys;
supplemental không dùng cùng journey counter. Separate10base và10final comparison
không cộng vào218. Main có thêm public landing screenshot không counted check.

| Trạng thái / interaction | Bằng chứng |
| --- | --- |
| Normal, text x2, short, combined x2+short | browser-on-recovered / browser-off |
| Three recipe panels, arrows/Home/End | browser-on-recovered |
| Pending/error/actual retry/success | states-first |
| Recipe404/catalog và search empty/reset | states-first |
| Long title/description, nutrition unknown | states-first |
| Inventory read failure khóa Cook đến retry | states-first |
| Canonical→allowed fallback→missing | states-first |
| Enter card/back filter và pager focus | states-first |
| Roots/Scan/Escape/focus-return/Cook immersive | browser-on-recovered |
| Inventory JSON equality/no domain writes | all accepted harness groups |

Axe áp dụng main/off/state và12registered supplemental; hai public supplemental
chỉ render/overflow. Synthetic preference PATCH khi onboarding đứng trước điểm
đo domain writes. External requests blocked, SW blocked, faults/fonts/padding/banner
synthetic. Không kiểm tất cảguard/auth/payment, aliases/domain mutations, hardware,
offline replay, native zoom, screen reader, CWV hoặc hosted production. UI11 E2E
không được đếm lại cho UI12.

`base-configured/` là baseline hợp lệ. `baseline/` bị iterate ghi đè;
`base-verified/` thiếu CSS config, `browser-on/` và `route-audit/` là lượt harness
fail. Giữ để trace nhưng không dùng kết luận PASS. PNG full-page có capture-position
artifact của sticky chrome; so ảnh viewport thật cùng số đo.
