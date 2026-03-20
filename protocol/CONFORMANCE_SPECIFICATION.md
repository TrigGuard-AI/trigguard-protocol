# TrigGuard Protocol Conformance Specification

**Purpose:** This document defines the requirements an implementation must satisfy to claim compatibility with the TrigGuard Protocol. It enables other teams to build TrigGuard-compatible engines (e.g. TrigGuard-Go, TrigGuard-Rust) and prove correct implementation without trusting the reference implementation.

**Constraints:** Documentation only. No runtime code changes. Protocol stability preserved.

---

## Purpose

An implementation may claim **"TrigGuard Protocol Compatible"** only if it satisfies the requirements in this document. Conformance is about interoperability and semantic stability: any conforming implementation must produce decisions and receipts that verifiers can validate using the same protocol rules and public keys.

---

## Conformance Requirements

Implementations must:

1. **Process execution envelopes** according to the rules in [TRIGGUARD_PROTOCOL_V1.md](TRIGGUARD_PROTOCOL_V1.md) (envelope shape, commit token verification, replay protection via nonce).
2. **Produce deterministic decisions** — given the same envelope and policy snapshot, the execution decision must always be identical.
3. **Generate receipts** matching the schema defined in [EXECUTION_RECEIPT_PROTOCOL.md](EXECUTION_RECEIPT_PROTOCOL.md).
4. **Sign receipts** using approved cryptographic algorithms (ed25519 as specified).
5. **Support independent verification** — verifiers must be able to validate receipts using only the receipt artifact, the issuer public key, and the protocol specification; no call to the TrigGuard server may be required.

---

## Receipt Format Compliance

Receipts must contain all **required** fields defined in [EXECUTION_RECEIPT_PROTOCOL.md](EXECUTION_RECEIPT_PROTOCOL.md):

- `executionId`
- `surface`
- `decision`
- `requestHash`
- `timestamp`
- `signature`

**Optional** fields may include (and may be omitted for backward compatibility):

- `actorId`
- `policySnapshotRef`
- `prevReceiptHash`
- `issuer`
- `publicKeyId`
- `policyVersion`

Wire format Content-Type: `application/trigguard-receipt+json`.

---

## Deterministic Execution

Given the same:

- execution envelope (tenantId, surface, requestHash, nonce, valid commit token),
- policy snapshot (or equivalent policy state),

the implementation must always produce the same decision. Determinism is required for replay safety, receipt binding, and independent verification.

---

## Verification Compliance

Verification libraries must be able to validate receipts using only:

- receipt artifact (object or serialized form),
- issuer public key (or key identified by `publicKeyId`),
- protocol specification (canonical field set and signature algorithm).

Verification must **not** require contacting the TrigGuard server. Conforming implementations must not introduce verification paths that depend on server-side state.

---

## Compatibility

Implementations must follow the protocol version and compatibility rules defined in:

- [TRIGGUARD_PROTOCOL_V1.md](TRIGGUARD_PROTOCOL_V1.md)
- [PROTOCOL_LIFECYCLE.md](PROTOCOL_LIFECYCLE.md)

Breaking changes to envelope, decision, or receipt semantics require a new protocol version. Historical receipts must remain verifiable indefinitely.

---

## Test Vectors

Conformance test vectors should include:

- **Sample envelopes** — valid envelopes for at least one surface (e.g. `deploy.release`).
- **Expected decisions** — PERMIT / BLOCK / SILENCE for given envelope + policy.
- **Expected receipt structures** — receipts that pass verification with the issuer public key.

Test vectors may be published separately (e.g. in a `conformance/` or `test-vectors/` directory). Implementations that pass the same vectors can claim consistent behavior.

---

## Conformance Statement

An implementation may claim:

**"TrigGuard Protocol Compatible"**

only if it satisfies the requirements in this document. Claims should reference the protocol version (e.g. TrigGuard Protocol v1) and, where applicable, the conformance test set used.

---

## References

- [TRIGGUARD_PROTOCOL_V1.md](TRIGGUARD_PROTOCOL_V1.md) — Core protocol.
- [EXECUTION_RECEIPT_PROTOCOL.md](EXECUTION_RECEIPT_PROTOCOL.md) — Receipt schema and verification.
- [PROTOCOL_LIFECYCLE.md](PROTOCOL_LIFECYCLE.md) — Versioning and compatibility.
- [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md) — Canonical surfaces.
