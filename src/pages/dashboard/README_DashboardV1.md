# Dashboard V1 - Desktop Migration README

## Purpose
Dashboard V1 is the financial snapshot dashboard used to log and review business summary metrics.

This version is currently frontend-driven and does not depend on live API calls for dashboard data.
The goal is to prepare a desktop build using Electron Forge, while keeping feature behavior consistent with the current web implementation.

## Current State Summary
- Route: `/app/dashboard`
- Main file: `src/pages/dashboard/DashboardV1.js`
- Entry modal: `src/components/DashboardSnapshotModal.js`
- Active profile helper: `src/utils/profile.js`
- Storage source for Dashboard V1 snapshots: `localStorage`
- API integration status: not active for dashboard snapshots in code path

Dashboard V1 currently reads and writes snapshot data under a profile-scoped localStorage key:
- `dashboard_snapshots_${profileId}`

## Functional Scope (What Dashboard V1 Does)
1. Log a financial entry
2. Edit an existing entry
3. Read all entries for active profile
4. Compute derived metrics from selected/latest entry:
- Net Income = Sales - Expenses
- Total Assets = Cash on Hand + Accounts Receivable + Inventory Value
5. Display visual reports in tabs:
- Overview
- Sales and Expenses
- Cash Flow
- Entry History
6. Import snapshot JSON file
7. Export snapshot JSON file
8. Select a historical row to view backlog metrics

## Snapshot Data Model
Each snapshot record should follow this shape:

```json
{
  "id": 1715000000000,
  "profile_id": 1,
  "entry_date": "2026-05-01T00:00:00.000Z",
  "sales": 15000,
  "expenses": 9000,
  "cash_on_hand": 12000,
  "accounts_receivable": 5000,
  "inventory_value": 7000,
  "notes": "Optional text"
}
```

Field notes:
- `id`: unique identifier (currently generated client-side)
- `entry_date`: required, ISO string
- numeric fields: nullable
- `notes`: optional

## Desktop Goal (Electron Forge)
Build and ship Dashboard V1 as a desktop app first, with local-first behavior and no hard dependency on backend API.

### Success Criteria
- App opens directly to authenticated/ready dashboard flow
- Dashboard V1 reads and writes snapshot data reliably per profile
- Import/export works in desktop environment
- Existing charts and calculations match web behavior
- App is packageable with Electron Forge for target OS

## Recommended Desktop Architecture
Use Electron main/preload/renderer separation.

### Renderer (React)
- Keep current UI, charting, and modal logic
- Avoid direct Node.js access in renderer

### Preload (secure bridge)
Expose only required APIs through `contextBridge`, for example:
- `dashboardStorage.getSnapshots(profileId)`
- `dashboardStorage.saveSnapshot(profileId, payload)`
- `dashboardStorage.updateSnapshot(profileId, id, payload)`
- `dashboardStorage.importSnapshots(profileId)`
- `dashboardStorage.exportSnapshots(profileId, snapshots)`

### Main process
Handle file and persistent storage operations using:
- filesystem APIs
- native dialog APIs for import/export

## Storage Recommendation for Desktop
Preferred: move snapshot persistence from browser localStorage to desktop storage.

Options:
1. `electron-store` keyed by profile id
2. JSON file database per profile

Suggested key shape:
- `dashboard.snapshots.<profileId>`

Keep record schema unchanged to reduce migration risk.

## Electron Forge Requirements
1. Electron Forge setup in project
2. Electron main entry
3. Preload script with secure IPC API
4. `contextIsolation: true`
5. `nodeIntegration: false`
6. Controlled IPC channels (allowlist)
7. Build config for platform targets

## Developer Tasks
### Phase 1 - Bootstrap Desktop Shell
1. Initialize Electron Forge
2. Configure main, preload, and renderer startup
3. Load React app in Electron window

### Phase 2 - Data Layer Migration
1. Implement snapshot persistence in Electron (store/file)
2. Replace Dashboard V1 localStorage reads/writes with preload API calls
3. Preserve profile-scoped behavior using active profile id

### Phase 3 - Import/Export Desktop UX
1. Replace browser-only file handling where necessary with native dialogs
2. Validate JSON structure before merge
3. Keep deduplication and merge behavior equivalent to existing logic

### Phase 4 - Packaging and QA
1. Build installers/packages via Electron Forge
2. Validate behavior on clean machine profile
3. Verify data survives app restart

## Validation Checklist
- Dashboard loads without API dependency
- Create entry works
- Edit entry works
- Entry history row selection works
- Back to latest state works
- All chart tabs render correctly with data and empty states
- Export produces valid JSON
- Import accepts valid JSON and rejects invalid payloads
- Profile switching isolates data correctly
- App restart preserves data

## Risks and Notes
1. localStorage in Electron can vary by session/session partition; do not rely on it for production desktop persistence
2. file import/export flows differ from browser behavior and should be tested in packaged app
3. profile id is currently read from localStorage (`activeProfileId`), so desktop profile bootstrap must set it before dashboard use

## Future API Migration
When backend endpoint is available (`/dashboard-snapshots`), introduce a repository layer to swap data providers:
- desktop local provider (current)
- API provider (future)

This keeps UI and chart logic unchanged while changing only data source implementation.

## Quick Handoff Notes for Dev
- Do not change chart/report logic in first desktop pass
- Keep data model and computed metrics exactly as current Dashboard V1
- Prioritize storage reliability and secure IPC boundaries
- Ship local-first desktop version first, API integration later
