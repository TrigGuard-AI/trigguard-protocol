# TrigGuard Protocol Lifecycle

**Purpose:** This document defines how the TrigGuard Protocol evolves while preserving compatibility and independent verification.

---

## Protocol versioning

Protocol version format: **MAJOR.MINOR**

Example: `protocolVersion: "1.0"`

| Change type | Rule |
|-------------|------|
| **MAJOR**   | Breaking protocol change (envelope, receipt format, or verification semantics). Requires governance and migration path. |
| **MINOR**   | Backward-compatible additions (new optional fields, new surfaces, new metadata). |

Receipts MUST include `protocolVersion` (or equivalent) so verifiers can apply the correct rules. Verification libraries MUST support at least the current and previous major version.

---

## Compatibility guarantees

- **Historical receipts remain verifiable indefinitely.** Signature verification and field semantics do not change for already-issued receipts.
- **Verification libraries** must support previous major versions for the duration of the compatibility window (operationally: as long as receipts are required for audit).
- **New protocol versions cannot invalidate existing receipts.** No change may make a previously valid receipt become invalid.

---

## Evolution rules

**Allowed (additive):**

- New optional receipt fields
- New execution surfaces (via [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md))
- New metadata fields
- New verifier libraries (languages, SDKs)

**Not allowed without a new MAJOR version:**

- Changing the meaning of existing receipt fields
- Removing required fields from the envelope or receipt
- Changing signature algorithm or canonical serialization in a way that breaks old receipts

---

## Surface registry evolution

See [SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md).

- **New surfaces** can be added via governance.
- **Existing surfaces** must remain stable (same name, same semantics).
- **Breaking changes** to a surface require a new surface identifier (e.g. `deploy.release.v2`).

---

## Reference implementation

- **Protocol specification** lives in **/protocol**.
- **Reference implementation** lives in **/src**.
- **Specification takes precedence** if behavior differs; the implementation is updated to match the spec.

---

## Verification libraries

Independent verification libraries exist for:

- **Node** — `packages/trigguard-receipt-verifier`
- **Python** — `packages/trigguard-receipt-verifier-python`

Verification MUST NOT require contacting the TrigGuard server. Verifiers need only: receipt artifact, public key, and protocol specification.

---

## Governance process

Protocol changes must include:

- Spec update (under /protocol)
- Documentation update
- Reference implementation update (when behavior changes)
- Compatibility review (no invalidation of existing receipts)

---

## Stability principle

TrigGuard prioritizes:

- **Deterministic verification** — same receipt and key always yield the same result.
- **Receipt portability** — receipts can be stored and verified anywhere.
- **Long-term auditability** — receipts remain evidence for the duration of the compatibility window.

Changes that break these guarantees MUST NOT be merged.
