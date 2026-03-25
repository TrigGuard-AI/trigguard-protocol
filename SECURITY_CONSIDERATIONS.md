# Security Considerations

This document states **what the TrigGuard protocol specification guarantees**, what it does **not** guarantee, and **what must hold** for those guarantees to apply. It is normative for interpreting the contract, schemas, conformance artifacts, and published fingerprints in this repository. For asset- and boundary-oriented detail, see [`THREAT_MODEL.md`](THREAT_MODEL.md). For responsible disclosure, see [`SECURITY.md`](SECURITY.md).

## Protocol Guarantees

The protocol **defines** the following; conforming implementations and tooling **realize** them when deployed correctly:

- **Deterministic authorization semantics** — For a given protocol version, the decision contract prescribes how permit and deny outcomes are represented and recorded. Evaluation is defined so that the same inputs and policy binding yield the same decision under the rules of that version.
- **Protocol fingerprint binding** — Each published protocol version is associated with a fingerprint that identifies the normative contract surface. Artifacts and evidence are intended to bind to that identity so that verification can detect version mismatch.
- **Replayable and verifiable evidence artifacts** — The specification defines shapes and rules for evidence (e.g. decision records, audit bundles, receipts as documented) such that independent verification can be performed without re-running the original execution path.
- **Explicit permit and deny behavior** — The vocabulary and record shape require explicit outcomes; ambiguity at the protocol boundary is treated as a specification or integration failure, not silent behavior.
- **Independent verification through conformance and reference tooling** — Conformance vectors and reference-oriented material exist so that implementations can be checked against the same contract. Verification does not depend on a single vendor runtime.

## Protocol Assumptions

These assumptions must hold for the guarantees above to apply:

- **Execution surfaces enforce protocol decisions** — The protocol defines what must be decided and recorded. Actual enforcement at the execution boundary (gateway, host, sandbox, or other surface) is an implementation and deployment responsibility. If enforcement is bypassed, the protocol cannot prevent the action.
- **Implementations must not bypass authorization at runtime** — Integrations that skip or override the decision gate while still emitting conforming-looking artifacts are outside the protocol’s security model.
- **Artifacts and fingerprints must remain stable for a given version** — Once a version is published, its normative contract and fingerprint identity for that release must not change incompatibly without a new version.
- **Hosted services are implementations, not the source of protocol truth** — Services such as those in the cloud repository may implement the protocol; they do not redefine it. The canonical contract is **`trigguard-protocol`**.

## In-Scope Threats

The protocol and its documentation are designed to address:

- **Unauthorized execution attempts** — Insofar as they are reflected in whether a decision is permitted or denied and recorded under the contract.
- **Protocol drift between implementation and contract** — Schema, vocabulary, conformance, and CI alignment reduce silent divergence.
- **Unverifiable or non-replayable decision artifacts** — The specification defines shapes and verification expectations so evidence can be checked independently.
- **Ambiguous execution authorization behavior** — The decision record and related artifacts are intended to make outcomes explicit.
- **Replay and verification confusion from inconsistent protocol identity** — Fingerprint binding and versioned contracts are intended to tie evidence to a specific protocol identity.

## Out-of-Scope Threats

The following are **not** addressed by this specification alone:

- **Compromised hosts** or operator environments that can alter execution or keys outside the protocol’s view.
- **Compromised developer workstations** or supply-chain compromise of tooling not covered by this repo’s conformance.
- **Prompt injection or model-layer content policy** defenses beyond what the execution protocol defines for boundaries and records.
- **Model quality, truthfulness, or alignment** — The protocol governs execution governance and evidence, not model correctness.
- **Malware, kernel, or OS-level compromise** — Host security is out of scope.
- **Social engineering** outside the execution protocol boundary (e.g. tricking a human operator into approving an action outside the governed path).

## Non-Goals

The protocol does **not** claim to:

- **Guarantee safe model outputs** — Only governed execution and evidence as defined in the contract.
- **Solve general AI safety** — It is an execution governance and evidence contract, not a full safety framework.
- **Replace host security controls** — Firewalls, identity, sandboxing, and OS hardening remain required where appropriate.
- **Replace runtime isolation or sandboxing** — Isolation is a deployment concern; the protocol specifies what must be decided and recorded, not how the host is isolated.
- **Prevent all misuse** if enforcement surfaces are bypassed or if implementations ignore the decision gate.

## Determinism and Verification

Protocol credibility depends on:

- **Deterministic decision contracts** — Same version, same inputs under the rules, same prescribed outcomes and records.
- **Conformance vectors** — Executable checks that implementations and packaged artifacts match the published contract.
- **Independent verification** — Verifiers and consumers can validate evidence without trusting the originating runtime.
- **Protocol fingerprint consistency** — Evidence and tooling agree on which protocol identity applies.
- **Evidence validation** — Validation rules are defined so that invalid or inconsistent artifacts are rejected by conforming verifiers.

## Relationship to Implementations

- **`trigguard-protocol`** — Canonical contract: schemas, normative prose, conformance artifacts, and versioned fingerprints.
- **`trigguard-core-reference`** — Reference implementation and guidance for expected behavior; it does not replace the spec.
- **Hosted services (e.g. cloud)** — Implement the protocol under their deployment model; they are not authoritative over the specification text or artifacts in this repository.
