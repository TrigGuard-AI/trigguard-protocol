# Request canonicalization

Requests must be normalized to a single canonical form before hashing or signing. Otherwise, the same logical request can produce different bytes (e.g. key order, whitespace) and verification fails.

## Rules

1. **Sort JSON keys** — Alphabetically. Same set of keys must always produce the same key order.
2. **Remove whitespace** — No extra spaces, newlines, or indentation in the canonical string.
3. **Encode UTF-8** — The string to hash is the UTF-8 encoding of the canonical JSON.
4. **Hash with SHA-256** — For `request_hash`, compute SHA-256 of that UTF-8 string; use lowercase hex (64 characters).

## Why it matters

Canonicalization mistakes break verification later. Two verifiers (or the same verifier at different times) must get the same hash from the same request. If one implementation sorts keys and another doesn’t, or one strips whitespace and another doesn’t, signatures and `request_hash` will not match and the protocol fails.

Define this once, implement it once, and use it everywhere (receipt signing, request_hash, verification).

## Reference

- Receipt and request hashing in this repo: see `canonicalHash`, `canonicalizeRequest`, and receipt/commit-token docs in `docs/architecture/`.
- For envelope integrity: `docs/integration/ENVELOPE_SPEC_v1.md` (canonical payload, SHA-256).
