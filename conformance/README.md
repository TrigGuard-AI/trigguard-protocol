# Conformance

[`protocol-tests.json`](protocol-tests.json) holds **v0.1** example decision records. They are **documentation fixtures**, not an exhaustive test suite.

**Future:** optional CI may validate each `cases[]` entry against [`spec/decision_contract.schema.json`](../spec/decision_contract.schema.json) (see `scripts/validate_conformance.js`).

**Implementations** should match the spec and SDK schema: [`implementations/README.md`](../implementations/README.md).
