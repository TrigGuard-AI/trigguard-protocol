# TrigGuard Protocol — architecture

This repository holds the **public protocol layer**: **spec** (JSON Schema), **normative docs** (`docs/`), **conformance** vectors, and the **`@trigguard/protocol`** TypeScript package.

## Core concepts

| Concept | Meaning |
|--------|---------|
| **Execution gate** | Irreversible work must not proceed without a valid **authorization path** (per execution protocol; enforced in product gateways). |
| **Policy evaluation** | Policy and signals feed a **single authority** for executable decisions (`PERMIT` / `DENY` / `SILENCE` vocabulary in the decision record). |
| **Deterministic outcomes** | Same inputs → same decision semantics; **no** ambiguous “maybe executed” for governed outcomes. |
| **Authority & receipts** | When permitted, **verifiable** artifacts bind decisions to requests (see receipt and verification docs under `docs/`). |

## Protocol flow (logical)

```
Client / agent
    → describes request (surface, context, signals)
    → gateway / authority evaluates policy
    → decision record (PERMIT | DENY | SILENCE) + enforcement
    → optional signed receipt for audit / offline verification
```

**Normative detail:** [`docs/TRIGGUARD_EXECUTION_PROTOCOL.md`](docs/TRIGGUARD_EXECUTION_PROTOCOL.md).

## Repository layout

| Path | Role |
|------|------|
| [`spec/`](spec/) | JSON Schema + [`TG_PROTOCOL.md`](spec/TG_PROTOCOL.md) |
| [`docs/`](docs/) | Execution protocol, receipts, surfaces, API schema |
| [`conformance/`](conformance/) | [`protocol-tests.json`](conformance/protocol-tests.json) |
| [`implementations/typescript/`](implementations/typescript/) | npm `@trigguard/protocol` |
| [`scripts/`](scripts/) | Spec sync + conformance checks (CI) |

## Deterministic guarantees (protocol artifacts)

- Canonical **decision record** fields: `decision`, `enforcement`, `reason_code`, `timestamp` (see schema).
- **CI** enforces **byte match** between `spec/decision_contract.schema.json` and the SDK `schema.json`.

## Runtime product

The **hosting runtime** (servers, apps, CI integrations) lives in **[TrigGuard-AI/TrigGuard](https://github.com/TrigGuard-AI/TrigGuard)** (private). This repo stays **auditable** and **implementation-agnostic**.

## Security entry points

- [`SECURITY.md`](SECURITY.md) — disclosure.  
- [`THREAT_MODEL.md`](THREAT_MODEL.md) — assumptions and boundaries.  
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to propose changes.
