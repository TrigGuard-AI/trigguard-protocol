# TrigGuard Surface Registry v1 (Authoritative)

**Version:** 1.0.0  
**Status:** Authoritative — single source of truth for execution surfaces  
**Audience:** Integrators, auditors, SDK authors, adopters.

**This registry defines all valid execution surfaces. Any surface not listed here is INVALID.** Requests that use an unlisted surface MUST be rejected (e.g. `400 { "error": "unknown_surface" }`).

---

## Governance vocabulary

Same name implies same semantics, payload schema, risk class, and receipt behavior across the ecosystem. No duplicates, no inconsistent entries.

---

## Registry entries

Each entry defines: **payload schema (min)**, **risk class**, **nonce requirement**, **receipt fields**, **policy hooks**.

| Surface              | Payload schema (min)           | Risk   | Nonce   | Receipt fields              | Policy hooks        |
|----------------------|---------------------------------|--------|---------|-----------------------------|---------------------|
| `deploy.release`     | target, version                  | high   | required| executionId, requestHash, surface, decision, policyVersion, timestamp, signature | policy snapshot, ruleset version |
| `infra.apply`        | planRef or changeId               | high   | required| same                        | same                |
| `database.migrate`   | migrationId, schemaRef           | high   | required| same                        | same                |
| `secrets.access`     | scope, principal                 | high   | required| same                        | same                |
| `artifact.publish`   | artifactId, version              | high   | required| same                        | same                |
| `data.export`        | scope, format                    | medium | required| same                        | same                |
| `payments.charge`    | amount, currency, tenantId      | high   | required| same                        | same                |
| `payments.refund`    | amount, currency, reference     | high   | required| same                        | same                |
| `identity.role_grant`| role, principal                  | high   | required| same                        | same                |
| `model.publish`      | artifactId, version              | high   | required| same                        | same                |
| `example`            | (any)                            | low    | required| same                        | test only           |

Legacy alias: `payments` (maps to payments.charge semantics) is deprecated; use `payments.charge` or `payments.refund`.

---

## Payload schema

- **Minimum:** Every execution MUST carry a normalized payload; hash of that payload is `requestHash`.
- Surface-specific required fields are in the table; additional fields are allowed.

---

## Risk class

- **high** — Irreversible or high-impact; strict policy and audit.
- **medium** — Reversible with effort; standard replay and receipt.
- **low** — Test or low-impact; same replay rules.

---

## Nonce requirement

- **required** for all surfaces in V1. One nonce per (tenant, surface, requestHash); second use is rejected (replay).

---

## Receipt fields

- Every receipt MUST include at least: `executionId`, `requestHash`, `surface`, `decision`, `policyVersion`, `timestamp`, `signature`.
- Optional: `issuer`, `publicKeyId` (or external names `key_id`, `receipt_id` per [API_SCHEMA.md](API_SCHEMA.md)).

---

## Policy hooks

- Execution is gated by policy (ruleset / snapshot). Decision binds to `policyVersion` and optionally `policySnapshotRef` / `policyBundleHash` for audit and compatibility.

---

## Governance

- New surfaces: add to this registry via governance; preserve backwards compatibility.
- Do not rename or remove entries without a compatibility path.
- Canonical protocol: [TRIGGUARD_EXECUTION_PROTOCOL.md](TRIGGUARD_EXECUTION_PROTOCOL.md).
