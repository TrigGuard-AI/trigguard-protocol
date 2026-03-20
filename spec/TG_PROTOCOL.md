# TrigGuard protocol — spec hub

| Item | Value |
|------|--------|
| **Spec artifact** | [`decision_contract.schema.json`](decision_contract.schema.json) |
| **Conformance** | [`conformance/protocol-tests.json`](../conformance/protocol-tests.json) |
| **TypeScript SDK** | [`implementations/typescript`](../implementations/typescript) (`@trigguard/protocol` on npm) |
| **Public home (bootstrap)** | [github.com/TrigGuard-AI/trigguard-protocol](https://github.com/TrigGuard-AI/trigguard-protocol) — target for extracted spec + docs; see [`docs/governance/PROTOCOL_REPO_EXTRACTION.md`](../docs/governance/PROTOCOL_REPO_EXTRACTION.md). |

## Goals

- **One decision shape** across products: `decision`, `enforcement`, `reason_code`, `timestamp`.
- **Deterministic vocabulary** for `decision` (`PERMIT` \| `DENY` \| `SILENCE`) and `enforcement` (`EXECUTED` \| `BLOCKED`).
- **No spec drift** between `spec/` and the npm package schema (CI gate).

## Canonical prose

All detailed rules, execution flow, and receipt semantics: **[`docs/protocol/TRIGGUARD_EXECUTION_PROTOCOL.md`](../docs/TRIGGUARD_EXECUTION_PROTOCOL.md)**.

## Implementation constitution

[`TRIGGUARD_IMPLEMENTATION_MASTER_PLAN.md`](../TRIGGUARD_IMPLEMENTATION_MASTER_PLAN.md)
