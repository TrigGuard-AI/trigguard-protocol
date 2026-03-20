# TrigGuard Protocol

This directory contains the formal specification for the TrigGuard execution governance protocol.

## Documents

- **Canonical protocol:** **[docs/protocol/TRIGGUARD_EXECUTION_PROTOCOL.md](../docs/protocol/TRIGGUARD_EXECUTION_PROTOCOL.md)** — Single source of truth (execution contract, decision model, rules). All implementations MUST align to it.
- **[TRIGGUARD_PROTOCOL_V1.md](TRIGGUARD_PROTOCOL_V1.md)** — Deprecated; retained for reference. Use canonical protocol above.
- **[EXECUTION_RECEIPT_PROTOCOL.md](EXECUTION_RECEIPT_PROTOCOL.md)** — Receipt generation and verification (ed25519, portable format).
- **[SURFACE_REGISTRY_V1.md](SURFACE_REGISTRY_V1.md)** — Canonical execution surfaces.
- **[POLICY_SNAPSHOT_COMPATIBILITY.md](POLICY_SNAPSHOT_COMPATIBILITY.md)** — Long-term verification guarantees.

## Reference implementation

The TrigGuard reference implementation lives in **/src**.

## Examples

Example integrations are in **/examples**.
