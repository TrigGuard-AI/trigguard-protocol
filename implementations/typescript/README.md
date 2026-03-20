# TrigGuard Protocol

[![npm version](https://img.shields.io/npm/v/@trigguard/protocol)](https://www.npmjs.com/package/@trigguard/protocol)

Canonical protocol definitions for TrigGuard governance decisions: vocabulary (`PERMIT`, `DENY`, `SILENCE`), enforcement semantics, and the `DecisionRecord` shape used across products and tooling.

**Package name:** `@trigguard/protocol` — types and contract snapshots; runtime evaluation and policy engines live in other packages and services. Integrations **conform** to this contract.

## Install

```bash
npm install @trigguard/protocol
```

Published on the public registry under the `@trigguard` scope. For release process, see `docs/release/PROTOCOL_RELEASE.md` in the monorepo.

**Develop inside the repo** (no registry), use a path or workspace:

```json
"@trigguard/protocol": "file:implementations/typescript"
```

or install from a Git URL / workspace as documented in the main [TrigGuard repository](https://github.com/TrigGuard-AI/TrigGuard).

## Decision model

| Decision   | Meaning (high level) |
|------------|----------------------|
| **PERMIT** | Authorization to proceed under policy (subject to enforcement and deployment rules). |
| **DENY**   | Action must not proceed as requested. |
| **SILENCE**| No authorization was issued; without authorization, execution cannot proceed (see `SILENCE_DEFINITION` export). |

Policy-only layers may restrict emitted decisions to **PERMIT** / **DENY**; full protocol surfaces also use **SILENCE** where applicable.

## Example import (TypeScript)

```typescript
import {
  type Decision,
  type DecisionRecord,
  DECISION,
  DECISIONS,
  SILENCE_DEFINITION,
} from "@trigguard/protocol";

const d: Decision = "PERMIT";
const record: DecisionRecord = {
  decision: DECISION.PERMIT,
  enforcement: "EXECUTED",
  reason_code: "NO_POLICY_VIOLATION",
  timestamp: new Date().toISOString(),
};
```

There is **no** `evaluate()` in this package — evaluation lives in TrigGuard services and kernels. This package supplies **types and canonical constants** so callers and SDKs share one contract.

## Subpath exports (JSON)

The package exposes stable paths for the JSON schema and decision contract snapshot:

```javascript
const schema = require("@trigguard/protocol/schema");
const contract = require("@trigguard/protocol/contract");
```

## Build (maintainers / CI)

From `implementations/typescript`:

```bash
npm install
npm run build
```

`build` runs `sync-contract` (when the full monorepo is present), `tsc`, and asset copy into `dist/`. Published tarballs are built via `prepack` / `prepare` before `npm publish`.

## Repository

Canonical source: [github.com/TrigGuard-AI/TrigGuard](https://github.com/TrigGuard-AI/TrigGuard) — `implementations/typescript/` (spec: [`spec/`](../spec/)).

For installation paths and release tagging, see:

- `docs/developers/INSTALL_PROTOCOL.md`
- `docs/release/PROTOCOL_RELEASE.md`

## Legacy note (snapshot)

`src/contracts/decision_contract.json` is kept in sync with `core/contracts/decision_contract.json` via `npm run sync-contract` in the monorepo. **Do not edit kernel contracts from this README** — follow governance and protocol integrity processes in the main repo.
