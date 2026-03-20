# TrigGuard Protocol — threat model (protocol layer)

This document describes **security-relevant assumptions** for the **protocol artifacts** in this repository (schemas, normative docs, conformance vectors, and the `@trigguard/protocol` contract package). It does **not** replace a full **product / runtime** threat model for private deployments.

## Assets

| Asset | Why it matters |
|-------|----------------|
| **Decision record shape** (`spec/decision_contract.schema.json`) | If the schema is wrong or ambiguous, integrators and SDKs disagree on what is valid. |
| **Reason-code vocabulary** (`core/contracts/decision_contract.json` snapshot) | Drift breaks diagnostics, interoperability, and audit semantics. |
| **Execution & receipt semantics** (`docs/`) | Misunderstanding leads to incorrect enforcement or verification. |
| **Conformance vectors** (`conformance/`) | If they diverge from the schema, tests give false confidence. |
| **Authority keys & signatures** (documented in protocol; implemented in products) | Forgery or key confusion breaks offline verification. |

## Trust boundaries (logical)

```
Integrator / client
        →  (uses SDK & docs)
        →  Policy / gateway (product-specific)
        →  Authority / signing (deployment-specific)
        →  Execution surface (irreversible action)
```

This repo defines **contracts and vocabulary** at the boundary between **policy outcomes** and **portable artifacts** (decision records, receipts). **Where** verification runs (gateway, worker, offline tool) is a deployment concern.

## Attacker capabilities (protocol-relevant)

| Threat | Example | Design response |
|--------|---------|-----------------|
| **Schema / SDK drift** | SDK accepts records the spec forbids | CI: `scripts/check_protocol_sync.sh`; same JSON Schema in `spec/` and `implementations/typescript/src/schema.json`. |
| **Conformance drift** | Fixtures no longer match schema | `scripts/validate_conformance.js` in CI. |
| **Mis-implementation** | Integrator ignores DENY or SILENCE | Normative docs: mandatory gateway / execution gate in product repos; **not** enforceable from this repo alone. |
| **Replay / duplication** | Reuse of tokens or receipts | Addressed in execution protocol docs; **nonce** and binding fields are product/runtime responsibilities. |
| **Signature forgery** | Fake authority signatures | Cryptographic details and key discovery: see `docs/` (e.g. receipt and verification docs). |

## Non-goals (out of scope for this repo)

- Host security, network segmentation, or cloud credentials for a specific deployment.
- **TrigGuard** runtime monorepo internals (iOS, gateways, ledger) — see the private product repository and its **full** threat model.

## Security guarantees (what this protocol layer asserts)

- **Deterministic vocabulary** for `decision` and `enforcement` in the canonical record shape.
- **Published artifacts** (schema, docs, conformance) that **CI checks** against each other to reduce silent drift.
- **Responsible disclosure** path via [`SECURITY.md`](SECURITY.md).

## Related

- **`ARCHITECTURE.md`** — how the pieces fit together.  
- **Full product threat model** (runtime, surfaces, CI): [TrigGuard monorepo — `docs/security/THREAT_MODEL_v1.md`](https://github.com/TrigGuard-AI/TrigGuard/blob/main/docs/security/THREAT_MODEL_v1.md) (if published there).
