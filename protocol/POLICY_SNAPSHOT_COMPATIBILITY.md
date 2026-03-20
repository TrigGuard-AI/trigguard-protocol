# Policy Snapshot Compatibility Guarantee

**Status:** Binding  
**Purpose:** Formal contract that receipts remain verifiable across policy evolution.  
**Audience:** Auditors, regulators, integrators, downstream verifiers.

---

## Guarantee

**A receipt issued under a given policy snapshot (policySnapshotRef / policyVersion) MUST remain verifiable indefinitely.**

- Verification means: signature valid, receipt fields intact, and (when applicable) the policy snapshot referenced by the receipt can still be resolved for audit/replay.
- TrigGuard MUST NOT invalidate or break verification of existing receipts when:
  - Policy is updated (new policyVersion / ruleset).
  - New surfaces are added.
  - Schema or engine versions are advanced.

---

## What is bound at issue time

Each receipt binds:

| Binding           | Role |
|-------------------|------|
| **policyVersion** | Version of policy at decision time (on receipt). |
| **policySnapshotRef** | Optional reference to the exact snapshot used (for replay/audit). |
| **policyBundleHash** | Optional hash of the policy bundle at decision time. |
| **surface**       | Execution surface (from registry). |
| **requestHash**   | Canonical hash of the request payload. |
| **decision**      | PERMIT / BLOCK / SILENCE |
| **timestamp**     | Issued-at time. |
| **signature**     | Issuer signature over the receipt (ed25519). |

These fields are immutable for the lifetime of the receipt.

---

## Compatibility rules

1. **No re-signing of old receipts** — Receipts are not re-signed when policy changes. The signature covers the fields at issue time.
2. **Snapshot resolution** — If a receipt carries `policySnapshotRef`, the system MUST retain the ability to resolve that reference to the snapshot (or a committed representation) for the duration of the compatibility window (operationally: as long as receipts are required for audit).
3. **Verification key** — The public key identified by `publicKeyId` (or the default issuer key) MUST remain available for verification for the same duration, or key rotation MUST follow a documented scheme (e.g. key versioning) so old receipts still verify with the appropriate key.
4. **Schema evolution** — New optional fields on receipts or on policy snapshots MUST NOT break verification of receipts that omit them. Required fields MUST NOT be removed.

---

## Operational implications

- **Retention:** Policy snapshots and keys referenced by receipts must be retained per compliance/audit requirements.
- **Key rotation:** If the gateway rotates signing keys, `publicKeyId` (and optionally `issuer`) identify which key was used; verifiers must have access to that key for old receipts.
- **Replay:** Historical policy replay (re-evaluating a past decision using the same snapshot) is supported when `policySnapshotRef` is present and the snapshot is still resolvable.

---

## References

- Execution Receipt Protocol: [EXECUTION_RECEIPT_PROTOCOL.md](EXECUTION_RECEIPT_PROTOCOL.md)
- Core protocol: [TRIGGUARD_PROTOCOL_V1.md](TRIGGUARD_PROTOCOL_V1.md)
- Policy replay: `docs/architecture/HISTORICAL_POLICY_REPLAY.md`, `docs/architecture/POLICY_SNAPSHOT_REFERENCES.md`
