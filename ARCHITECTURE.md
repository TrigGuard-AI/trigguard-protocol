# TrigGuard — architecture at a glance

This file is the **entry map** for how execution governance fits together. Deep dives live under [`docs/`](docs/).

## What TrigGuard is

An **execution governance protocol**: systems request authorization before **irreversible** actions, receive a deterministic **PERMIT / DENY / SILENCE** decision, and (when permitted) obtain **verifiable receipts**. The engine is fail-closed: missing authority means no execution path.

## Core concepts (one minute)

| Concept | Meaning |
|--------|---------|
| **Execution gate** | Irreversible work does not run unless a valid **authorization capability** (token / receipt path) is presented. Surfaces go through a **mandatory gateway** — see [MANDATORY_EXECUTION_GATEWAY](docs/architecture/MANDATORY_EXECUTION_GATEWAY.md). |
| **Policy evaluation** | A **single authority engine** evaluates policy and signals; adapters do not emit competing execution decisions. See [TRIGGUARD_AUTHORITY_MODEL](docs/protocol/TRIGGUARD_AUTHORITY_MODEL.md). |
| **Deterministic permit / deny** | Decisions are **replayable** and **hash-stable** for the same inputs; binary outcomes avoid ambiguous “maybe executed” states for governed surfaces. |
| **Protocol authority** | The component that may **emit** executable decisions and signed receipts; verification can be **offline** with published keys. Hosted authority is one deployment shape; the **rules** live in the protocol docs. |

**Org-level context** (which GitHub repos are public vs private): [ORG_REPOSITORY_TOPOLOGY](docs/governance/ORG_REPOSITORY_TOPOLOGY.md).

## Read these first

| Topic | Document |
|--------|----------|
| **Spec hub + JSON Schema** | [`spec/TG_PROTOCOL.md`](spec/TG_PROTOCOL.md), [`spec/decision_contract.schema.json`](spec/decision_contract.schema.json) |
| **Conformance vectors** | [`conformance/protocol-tests.json`](conformance/protocol-tests.json) |
| **Execution protocol** (normative) | [`docs/protocol/TRIGGUARD_EXECUTION_PROTOCOL.md`](docs/protocol/TRIGGUARD_EXECUTION_PROTOCOL.md) |
| **Mandatory gateway** (no token ⇒ no execution) | [`docs/architecture/MANDATORY_EXECUTION_GATEWAY.md`](docs/architecture/MANDATORY_EXECUTION_GATEWAY.md) |
| **Authority & signals** (who may decide) | [`docs/protocol/TRIGGUARD_AUTHORITY_MODEL.md`](docs/protocol/TRIGGUARD_AUTHORITY_MODEL.md) |
| **Kernel boundary** (core vs adapters) | [`docs/architecture/KERNEL_BOUNDARY.md`](docs/architecture/KERNEL_BOUNDARY.md) |
| **System model** (components) | [`docs/architecture/SYSTEM_MODEL.md`](docs/architecture/SYSTEM_MODEL.md) |
| **Threat / trust** (reviewer-oriented) | [`docs/security/SECURITY_OVERVIEW.md`](docs/security/SECURITY_OVERVIEW.md), [`docs/security/THREAT_MODEL_v1.md`](docs/security/THREAT_MODEL_v1.md) |

## Runnable orientation

- **Gateway demo (Node):** [`examples/execution-gateway-demo/`](examples/execution-gateway-demo/)
- **Basic AI gate:** [`examples/basic-ai-gate/`](examples/basic-ai-gate/)

## Governance & CI

- **Merge process:** [`CONTRIBUTING.md`](CONTRIBUTING.md)
- **Security disclosure:** [`SECURITY.md`](SECURITY.md)
- **CI control plane (what gates mean):** [`docs/governance/CI_CONTROL_PLANE_V1.md`](docs/governance/CI_CONTROL_PLANE_V1.md)
