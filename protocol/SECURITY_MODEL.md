# TrigGuard Protocol Security Model

**Purpose:** Explain the threat model and security guarantees of the TrigGuard protocol.

---

## Security goals

TrigGuard protects **irreversible actions** in digital systems by ensuring execution decisions are:

- **Deterministic** — same request and policy yield the same decision.
- **Verifiable** — anyone with the receipt and public key can verify without trusting the server.
- **Auditable** — receipts bind decision to request and policy context and remain verifiable over time.

---

## Threat model

| Threat | Mitigation |
|--------|-------------|
| **Unauthorized execution** | Execution requires a valid envelope (commit token, nonce); only the gateway issues decisions. |
| **Replay attacks** | Nonce must be unique per (tenant, surface, requestHash); second use is rejected. |
| **Policy tampering** | Receipt binds to policyVersion / policySnapshotRef; verification does not rely on current server state. |
| **Receipt forgery** | Receipts are signed with ed25519; verification requires the issuer's public key. |
| **Signature spoofing** | Verifiers use the correct public key (identified by issuer/publicKeyId); key distribution is out-of-band. |
| **Timestamp manipulation** | Timestamp is inside the signed payload; tampering invalidates the signature. |

---

## Security guarantees

- **Deterministic execution engine** — No nondeterminism in decision path; replay of the same request yields the same decision.
- **Replay protection** — Nonce validation ensures each execution is consumed once.
- **Cryptographic signing** — ed25519 signatures over a canonical payload; forgery without the private key is infeasible.
- **Canonical serialization** — Receipt payload is serialized in a defined order so signature verification is reproducible.
- **Policy snapshot references** — Historical verification can resolve the exact policy state that authorized the action.

---

## Receipt integrity

Receipts contain at least:

- `executionId`, `requestHash`, `decision`, `policyVersion`, `timestamp`, `signature`
- Optional: `policySnapshotRef`, `issuer`, `publicKeyId`

**Verification requires only:**

- Receipt artifact
- Public key (for the issuer)
- Protocol rules (canonical order, signature algorithm)

**No server interaction required.** Offline verification is supported.

---

## Key management

- **Issuer keys** — Gateways use an ed25519 key pair; the public key is shared with verifiers.
- **Receipts** MUST include `issuer` and `publicKeyId` when multiple issuers or key rotation is used.
- **Key rotation** — Old receipts must remain verifiable after rotation; verifiers use `publicKeyId` to select the correct key. Key history must be retained for the audit window.

---

## Independent verification

Verification libraries (Node, Python) allow external systems to validate execution decisions **without trusting the TrigGuard server**. Verifiers need:

- The receipt (object or serialized)
- The issuer's public key (PEM or equivalent)

Verification returns `{ valid: true }` or `{ valid: false, reason }`.

---

## Long-term security

TrigGuard prioritizes:

- **Deterministic verification** — Same inputs always produce the same result.
- **Receipt portability** — Receipts can be stored and verified anywhere.
- **Auditability** — Receipts act as permanent proof of authorized execution for the compatibility window.

Security properties MUST NOT change in a way that invalidates existing receipts across protocol versions. See [PROTOCOL_LIFECYCLE.md](PROTOCOL_LIFECYCLE.md).
