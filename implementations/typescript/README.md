# `@trigguard/protocol` (TypeScript SDK)

[![npm version](https://img.shields.io/npm/v/@trigguard/protocol)](https://www.npmjs.com/package/@trigguard/protocol)

**Reference implementation** for the TrigGuard protocol in TypeScript: vocabulary (`PERMIT`, `DENY`, `SILENCE`), enforcement semantics, and the `DecisionRecord` shape, plus JSON snapshots aligned with [`core/contracts/decision_contract.json`](../../core/contracts/decision_contract.json).

**Language-agnostic specification:** [`spec/TG_PROTOCOL.md`](../../spec/TG_PROTOCOL.md) — this npm package is an SDK, not the full protocol.

**Runtime evaluation and policy engines** live in other packages and services; integrations **conform** to the spec.

## Quick start

```bash
npm install @trigguard/protocol
```

```typescript
import { DECISION, ENFORCEMENT, type DecisionRecord } from "@trigguard/protocol";

const record: DecisionRecord = {
  decision: DECISION.PERMIT,
  enforcement: ENFORCEMENT.EXECUTED,
  reason_code: "NO_POLICY_VIOLATION",
  timestamp: new Date().toISOString(),
};
```

There is **no** `evaluate()` or `validateDecision()` in this package — only **types and canonical constants** so your code matches [`spec/TG_PROTOCOL.md`](../../spec/TG_PROTOCOL.md). For JSON Schema and contract JSON via subpaths, see [Subpath exports](#subpath-exports-json).

## Install and paths

Published on the public registry under the `@trigguard` scope. For release process, see [`docs/release/PROTOCOL_RELEASE.md`](https://github.com/TrigGuard-AI/TrigGuard/blob/main/docs/release/PROTOCOL_RELEASE.md) in the [TrigGuard monorepo](https://github.com/TrigGuard-AI/TrigGuard) (authoritative).

**Develop inside the repo** (no registry), use a path or workspace:

```json
"@trigguard/protocol": "file:implementations/typescript"
```

(From a package at the repository root. From `packages/*`, use `file:../../implementations/typescript`.)

Or install from a Git URL / workspace as documented in the main [TrigGuard repository](https://github.com/TrigGuard-AI/TrigGuard).

## Decision model

| Decision   | Meaning (high level) |
|------------|----------------------|
| **PERMIT** | Authorization to proceed under policy (subject to enforcement and deployment rules). |
| **DENY**   | Action must not proceed as requested. |
| **SILENCE**| No authorization was issued; without authorization, execution cannot proceed (see `SILENCE_DEFINITION` export). |

Policy-only layers may restrict emitted decisions to **PERMIT** / **DENY**; full protocol surfaces also use **SILENCE** where applicable.

Other useful exports: `type Decision`, `DECISIONS`, `SILENCE_DEFINITION`, `REASON_CODES`, `decisionContract`.

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

Canonical TypeScript SDK in this repo: [`implementations/typescript/`](.) (spec: [`spec/`](../../spec/)). The [TrigGuard monorepo](https://github.com/TrigGuard-AI/TrigGuard) carries the same tree until cutover — keep them in sync per [`PROTOCOL_REPO_EXTRACTION.md`](https://github.com/TrigGuard-AI/TrigGuard/blob/main/docs/governance/PROTOCOL_REPO_EXTRACTION.md).

For installation paths and release tagging, see:

- [`docs/developers/INSTALL_PROTOCOL.md`](https://github.com/TrigGuard-AI/TrigGuard/blob/main/docs/developers/INSTALL_PROTOCOL.md)
- [`docs/release/PROTOCOL_RELEASE.md`](https://github.com/TrigGuard-AI/TrigGuard/blob/main/docs/release/PROTOCOL_RELEASE.md)

## Legacy note (snapshot)

`src/contracts/decision_contract.json` is kept in sync with `core/contracts/decision_contract.json` via `npm run sync-contract` in the monorepo. **Do not edit kernel contracts from this README** — follow governance and protocol integrity processes in the main repo.
