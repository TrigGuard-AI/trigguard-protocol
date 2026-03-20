# TrigGuard Protocol Trust Model

**Purpose:** Explain the trust boundaries of the TrigGuard protocol — who trusts what, and what can be verified independently.

---

## Actors

| Actor | Role |
|-------|------|
| **System initiating irreversible action** | CI pipeline, payment service, AI platform, etc. Sends execution requests to TrigGuard and consumes the decision and receipt. |
| **TrigGuard execution engine** | Evaluates requests against policy, produces decisions, and signs receipts. Must be deterministic and replay-safe. |
| **Verifier systems** | External systems (auditors, regulators, downstream services) that verify receipts using the public key and protocol rules. |
| **Auditors / regulators** | Rely on receipts as evidence of authorized execution; do not need to trust the TrigGuard server. |

---

## Trust assumptions

- **Execution engine** must produce **deterministic** decisions for the same request and policy state.
- **Receipts** must be **cryptographically signed** by the issuer; signature verification is deterministic.
- **Verifiers** must rely only on **protocol rules** and **public keys**; they do not need to trust the TrigGuard server or its current state.

---

## Verification model

Verification does **not** require contacting the TrigGuard server.

**Verification requires:**

1. **Receipt artifact** — The signed receipt (object or serialized).
2. **Public key** — The issuer's public key (e.g. PEM), identified by `issuer` / `publicKeyId` when multiple keys exist.
3. **Protocol specification** — Canonical field order and signature algorithm (ed25519) as defined in [TRIGGUARD_PROTOCOL_V1.md](TRIGGUARD_PROTOCOL_V1.md) and [EXECUTION_RECEIPT_PROTOCOL.md](EXECUTION_RECEIPT_PROTOCOL.md).

Given these, a verifier can compute **valid** or **invalid** without any network call.

---

## Security boundaries

| Component | Trust requirement |
|-----------|--------------------|
| **TrigGuard server (at issue time)** | Requesters must trust that the server correctly evaluates policy and signs receipts. |
| **TrigGuard server (after issue time)** | Verifiers do **not** need to trust the server; verification is offline. |
| **Public key distribution** | Verifiers must obtain the correct public key through a trusted channel (e.g. operator, PKI, or documented key rotation). |
| **Receipt storage/transit** | Receipts are tamper-evident; modification invalidates the signature. |

---

## Long-term auditability

Receipts act as **permanent proof** of authorized execution (for the duration of the compatibility window):

- **What** was authorized: `decision`, `surface`, `requestHash`
- **When**: `timestamp`
- **Under which policy**: `policyVersion`, optional `policySnapshotRef`
- **By whom**: `issuer`, `publicKeyId`
- **Proof**: `signature` (ed25519 over the above)

No dependency on the TrigGuard server remaining available or unchanged. See [POLICY_SNAPSHOT_COMPATIBILITY.md](POLICY_SNAPSHOT_COMPATIBILITY.md) and [PROTOCOL_LIFECYCLE.md](PROTOCOL_LIFECYCLE.md).
