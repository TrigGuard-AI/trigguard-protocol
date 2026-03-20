# Contributing to TrigGuard

TrigGuard is governance- and safety-oriented: changes should be **small, reviewable, and CI-clean**.

## Before you open a PR

1. **Preflight** (required before push/PR per repo policy):
   ```bash
   bash scripts/preflight_full.sh
   ```
2. **Linear history** — Do **not** merge `main` into your branch. Update with rebase:
   ```bash
   git fetch origin && git rebase origin/main
   git push --force-with-lease
   ```
   Merge commits in `origin/main..HEAD` fail **TG_SECURITY_GATE** (S02).

3. **PR body** — Use the repository PR template; fill every section. For touches to `.github/workflows/**`, `scripts/governance/**`, or `docs/governance/**`, include **`PR_GOVERNANCE_INTENT.md`** or **`PR_SECURITY_INTENT.md`** at the repo root (see `.cursorrules`).

4. **Workflow changes** — If you edit anything under `.github/workflows/`, recompute the workflow-tree baseline:
   ```bash
   git add .github/workflows
   python3 scripts/snapshots/hash_git_tree.py --root ".github/workflows"
   ```
   Set **line 1** of `docs/governance/CI_SURFACE_HASH_workflows_v1.txt` to the printed hash.

## Where things live

- **Protocol prose:** [`docs/protocol/`](docs/protocol/)
- **Public protocol repo:** [github.com/TrigGuard-AI/trigguard-protocol](https://github.com/TrigGuard-AI/trigguard-protocol) — extraction / cutover: [`docs/governance/PROTOCOL_REPO_EXTRACTION.md`](docs/governance/PROTOCOL_REPO_EXTRACTION.md) (controlled sequence; do not ad-hoc move trees).
- **Architecture:** [`docs/architecture/`](docs/architecture/)
- **Security:** [`docs/security/`](docs/security/)
- **Examples:** [`examples/`](examples/)

## Code review expectations

- Prefer **clarity** over cleverness; match existing style in the touched area.
- **Do not** weaken CI guards or governance checks to make a change pass.

## Questions

Open a discussion or issue for design questions; use **private** reporting for security issues ([`SECURITY.md`](SECURITY.md)).
