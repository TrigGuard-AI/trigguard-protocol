# TrigGuard Protocol

**Protocol • Deterministic Execution Governance for AI Systems**

> **TrigGuard Protocol** — deterministic execution governance **contract**, **schemas**, and **conformance tests**.

Public **specification**, **conformance** vectors, and the **[`@trigguard/protocol`](https://www.npmjs.com/package/@trigguard/protocol)** TypeScript package.

| Area | Contents |
|------|----------|
| [`spec/`](spec/) | JSON Schema + [`TG_PROTOCOL.md`](spec/TG_PROTOCOL.md) |
| [`docs/`](docs/) | Normative protocol prose (execution, receipts, surfaces, API) |
| [`conformance/`](conformance/) | [`protocol-tests.json`](conformance/protocol-tests.json) |
| [`implementations/typescript/`](implementations/typescript/) | npm package `@trigguard/protocol` |

## Security Model

The protocol explicitly defines **guarantees**, **assumptions**, **threat boundaries**, and **non-goals** for anyone integrating or reviewing the contract. Read [`SECURITY_CONSIDERATIONS.md`](SECURITY_CONSIDERATIONS.md) first for the normative security framing; use [`THREAT_MODEL.md`](THREAT_MODEL.md) for protocol-layer assets and trust boundaries, and [`SECURITY.md`](SECURITY.md) for vulnerability reporting.

## Specification and Reference Alignment

Protocol governance authority originates in the **TrigGuard monorepo**. This repository is the canonical **published protocol specification** surface for external distribution and integration.

[**trigguard-core-reference**](https://github.com/TrigGuard-AI/trigguard-core-reference) demonstrates expected protocol behavior for integrators and reviewers; it is guidance, not governance authority.

**Runtime and hosted implementations** execute the protocol under deployment-specific constraints; they must conform to this published specification and do not redefine protocol governance.

| Artifact | Role | Authority |
|----------|------|-----------|
| trigguard-protocol | Normative specification | Canonical |
| trigguard-core-reference | Reference behavior | Guidance / conformance aid |
| Hosted/runtime implementations | Execution of the protocol | Non-normative implementation |

If implementation behavior and the protocol diverge, the published protocol specification is authoritative for conformance, and governance authority remains in the TrigGuard monorepo.

### Quick start: `@trigguard/protocol` (npm)

Install from the public registry, then use the canonical decision vocabulary and `DecisionRecord` shape (no evaluator here — that lives in [TrigGuard](https://github.com/TrigGuard-AI/TrigGuard) services; this package keeps types and constants aligned with the spec):

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

More examples, subpath exports (`/schema`, `/contract`), and path installs: [`implementations/typescript/README.md`](implementations/typescript/README.md).

**Runtime product** (private): [TrigGuard-AI/TrigGuard](https://github.com/TrigGuard-AI/TrigGuard).

## Releases (versioned protocol surface)

**Current:** [**v0.1.0**](https://github.com/TrigGuard-AI/trigguard-protocol/releases/tag/v0.1.0) — initial public protocol release. The **protocol version** in [`spec/TG_PROTOCOL.md`](spec/TG_PROTOCOL.md) matches this tag.

[All releases](https://github.com/TrigGuard-AI/trigguard-protocol/releases)

## Quick links

- Security considerations (guarantees, scope, non-goals): [`SECURITY_CONSIDERATIONS.md`](SECURITY_CONSIDERATIONS.md)
- Reference implementation (expected behavior, non-normative): [TrigGuard-AI/trigguard-core-reference](https://github.com/TrigGuard-AI/trigguard-core-reference)
- Execution protocol: [`docs/TRIGGUARD_EXECUTION_PROTOCOL.md`](docs/TRIGGUARD_EXECUTION_PROTOCOL.md)
- Contributing: [`CONTRIBUTING.md`](CONTRIBUTING.md)

### Security & review (read these first)

| File | Purpose |
|------|---------|
| [`SECURITY_CONSIDERATIONS.md`](SECURITY_CONSIDERATIONS.md) | **Guarantees, assumptions, scope, non-goals** — protocol-grade security framing and verification expectations. |
| [`SECURITY.md`](SECURITY.md) | **Responsible disclosure** — how to report vulnerabilities privately. |
| [`THREAT_MODEL.md`](THREAT_MODEL.md) | **Assumptions** — assets, boundaries, what this repo does / does not guarantee. |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | **How the protocol layer fits** — spec, docs, SDK, CI. |

## License

MIT — see [`LICENSE`](LICENSE). *(Many protocol projects use Apache-2.0; changing license is an org/legal decision.)*

## Repository description (GitHub)

Use this one-line description in **Settings**:

`TrigGuard Protocol — deterministic execution governance contract, schemas, and conformance tests.`


## Role in the TrigGuard Ecosystem

This repository defines the canonical TrigGuard protocol specification,
including protocol fingerprints, conformance artifacts, and versioned
execution rules.

All implementations must conform to this protocol.

## Core Protocol Concepts

Execution Surface  
The boundary where an AI system transitions from internal decision logic
into a real-world irreversible action.

Protocol Contract  
The deterministic rules governing whether an execution surface is
permitted or denied.

Protocol Fingerprint  
A deterministic identifier representing the exact protocol version used
to evaluate a decision.

Audit Bundle  
A cryptographically verifiable evidence package containing the protocol
fingerprint, decision result, and supporting evaluation records.

Verifier  
An independent tool capable of validating an audit bundle.

OER (Operational Evidence Record)  
Structured records describing protocol evaluation steps and outcomes.

## Repository Map

TrigGuard → governance and development authority (monorepo)

trigguard-protocol → canonical published protocol specification (this repository; derived from the TrigGuard monorepo)

trigguard-core-reference → reference verifier and tooling aligned with the protocol specification

trigguard-js → SDK surfaces implementing the protocol

cloud → hosted enforcement layer

docs → explanatory documentation

site → public discovery and distribution layer

TrigGuard → monorepo containing development tooling, demos, CI, and governance
