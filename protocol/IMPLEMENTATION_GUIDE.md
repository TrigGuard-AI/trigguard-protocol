# TrigGuard Protocol Implementation Guide

**Purpose:** This document helps developers implement a TrigGuard-compatible engine. It describes the execution model, determinism, receipts, signatures, verification, and surface registry so that independent implementations (e.g. TrigGuard-Go, TrigGuard-Rust, TrigGuard-Java) can claim protocol compatibility.

**Constraints:** Documentation only. No runtime code changes. Implementations must satisfy [CONFORMANCE_SPECIFICATION.md](CONFORMANCE_SPECIFICATION.md).

---

## Purpose

The TrigGuard Protocol can be implemented by any team. This guide explains how to build an engine that:

- Accepts execution envelopes and produces deterministic decisions.
- Emits receipts that existing verifier libraries can validate.
- Respects the surface registry and protocol versioning.

Implementations that follow this guide and the conformance spec can interoperate with the reference implementation and the broader ecosystem.

---

## Execution model

The core flow is:

1. **Envelope** — The client sends an execution envelope (see [TRIGGUARD_PROTOCOL_V1.md](TRIGGUARD_PROTOCOL_V1.md)) containing at least: `tenantId`, `surface`, `requestHash`, `nonce`, and a signed **commit token** (proof of policy decision).
2. **Verification** — The engine verifies the commit token, checks replay (nonce), and validates the envelope against the request payload.
3. **Decision** — The engine produces a decision (e.g. PERMIT). The decision is already bound to the token; the engine enforces that the executed action matches the token.
4. **Receipt** — On execution, the engine produces a signed receipt (see [EXECUTION_RECEIPT_PROTOCOL.md](EXECUTION_RECEIPT_PROTOCOL.md)) that binders can verify offline.

Implementations must implement this envelope → verify → decision → receipt flow. The reference implementation lives in `/src`; the specification in `/protocol` is authoritative.

---

## Determinism requirements

Given the same:

- execution envelope (valid commit token, tenantId, surface, requestHash, nonce),
- policy snapshot (or equivalent policy state),

the implementation **must** produce the same decision. Determinism is required for:

- Replay safety (same request replayed → same outcome).
- Receipt binding (receipt must match the decision and request).
- Independent verification (verifiers assume deterministic semantics).

Non-deterministic behavior (e.g. random decisions or time-dependent outcomes) is not compliant.

---

## Receipt generation

Receipts must match the schema defined in [EXECUTION_RECEIPT_PROTOCOL.md](EXECUTION_RECEIPT_PROTOCOL.md).

**Required fields:** `executionId`, `requestHash`, `surface`, `decision`, `timestamp`, `signature`.

**Optional fields:** `actorId`, `policySnapshotRef`, `prevReceiptHash`, `issuer`, `publicKeyId`, `policyVersion`.

Receipts are portable artifacts; they must be serializable (e.g. JSON) and identifiable (Content-Type: `application/trigguard-receipt+json`). Implementations must not add required fields that break existing verifiers; optional fields may be added in line with the protocol lifecycle.

---

## Signature requirements

Receipts must be **cryptographically signed** so that verifiers can validate them without calling the TrigGuard server. The protocol specifies **ed25519** for receipt signatures.

- The implementation holds a private key (or key pair) for the issuer.
- The receipt includes a signature over a canonical representation of the signed fields (as defined in the receipt protocol).
- Receipts should include `issuer` and `publicKeyId` so verifiers know which public key to use. Old receipts must remain verifiable after key rotation (e.g. by retaining old public keys for verification).

---

## Verification compatibility

Verification must work using **only**:

- the receipt artifact (object or serialized form),
- the issuer public key (or key identified by `publicKeyId`),
- the protocol specification (field set and signature algorithm).

Verification **must not** require contacting the TrigGuard server or any other backend. Implementations must not introduce verification paths that depend on server-side state. Existing verifier libraries (Node, Python) must be able to validate receipts produced by a compliant implementation.

---

## Surface registry

Execution **surfaces** (e.g. `deploy.release`, `data.export`, `payments.charge`) are defined in [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md). Implementations must:

- Only accept surfaces that are registered (or document clearly any deviation for testing).
- Use the same surface names and semantics as the registry (same name ⇒ same payload schema, risk class, receipt behavior).
- For new surfaces, follow the protocol governance process; do not invent surfaces that conflict with the registry.

Linking integrations and implementations to the surface registry keeps the ecosystem aligned.

---

## Compatibility

Implementations must follow the **protocol version** and compatibility rules defined in:

- [TRIGGUARD_PROTOCOL_V1.md](TRIGGUARD_PROTOCOL_V1.md) — Core protocol (envelope, decision, receipt).
- [PROTOCOL_LIFECYCLE.md](PROTOCOL_LIFECYCLE.md) — Versioning and backward compatibility.

Breaking changes to envelope, decision, or receipt semantics require a new protocol version. Historical receipts must remain verifiable. Implementations may claim "TrigGuard Protocol Compatible" only if they satisfy [CONFORMANCE_SPECIFICATION.md](CONFORMANCE_SPECIFICATION.md).

---

## References

- [TRIGGUARD_PROTOCOL_V1.md](TRIGGUARD_PROTOCOL_V1.md)
- [EXECUTION_RECEIPT_PROTOCOL.md](EXECUTION_RECEIPT_PROTOCOL.md)
- [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md)
- [PROTOCOL_LIFECYCLE.md](PROTOCOL_LIFECYCLE.md)
- [CONFORMANCE_SPECIFICATION.md](CONFORMANCE_SPECIFICATION.md)
