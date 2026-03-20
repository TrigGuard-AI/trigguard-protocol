# TrigGuard protocol specification (language-agnostic)

Canonical **machine-readable** artifacts for the decision record shape. Full normative prose lives under [`docs/protocol/`](../docs/) — start with [`TRIGGUARD_EXECUTION_PROTOCOL.md`](../docs/TRIGGUARD_EXECUTION_PROTOCOL.md).

| Artifact | Purpose |
|----------|---------|
| [`TG_PROTOCOL.md`](TG_PROTOCOL.md) | Short hub: version table, goals, links. |
| [`decision_contract.schema.json`](decision_contract.schema.json) | JSON Schema (draft-07) for **TrigGuardCanonicalDecisionRecord** (`PERMIT` / `DENY` / `SILENCE`). |

**SDK copy:** [`implementations/typescript/src/schema.json`](../implementations/typescript/src/schema.json) must **byte-match** this file (enforced by CI and `scripts/check_protocol_sync.sh`).

**Conformance:** [`conformance/protocol-tests.json`](../conformance/protocol-tests.json).

**Reason-code registry** (vocabulary snapshot): [`core/contracts/decision_contract.json`](../core/contracts/decision_contract.json) — mirrored into the TypeScript package via `npm run sync-contract` in [`implementations/typescript`](../implementations/typescript).
