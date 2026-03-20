#!/usr/bin/env bash
# protocol-spec-sync — canonical spec JSON Schema must match the TypeScript SDK copy.
# Used by TG_KERNEL_GATE (.github/workflows/protocol-sync.yml) and preflight_fast.sh.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SPEC="$ROOT/spec/decision_contract.schema.json"
TS="$ROOT/implementations/typescript/src/schema.json"

for f in "$SPEC" "$TS"; do
  if [ ! -f "$f" ]; then
    echo "::error::Protocol schema sync: missing file $f"
    exit 1
  fi
done

if ! diff -u "$SPEC" "$TS"; then
  echo ""
  echo "::error::Protocol schema drift detected — spec/decision_contract.schema.json must byte-match implementations/typescript/src/schema.json"
  echo "Fix: edit the canonical spec, then mirror to the SDK copy (or vice versa) so they stay identical."
  exit 1
fi

echo "✅ protocol spec sync OK ($SPEC ↔ $TS)"
