#!/usr/bin/env node
/**
 * Lightweight check: conformance/protocol-tests.json cases match decision vocabulary.
 * Does not require JSON Schema libs; extend to AJV later if desired.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const confPath = path.join(root, "conformance", "protocol-tests.json");

const DECISIONS = new Set(["PERMIT", "DENY", "SILENCE"]);
const ENFORCEMENT = new Set(["EXECUTED", "BLOCKED"]);

function main() {
  const raw = fs.readFileSync(confPath, "utf8");
  const data = JSON.parse(raw);
  if (!data.cases || !Array.isArray(data.cases)) {
    console.error("validate_conformance: expected top-level \"cases\" array");
    process.exit(1);
  }
  let err = 0;
  for (const c of data.cases) {
    const id = c.id || "(missing id)";
    if (!DECISIONS.has(c.decision)) {
      console.error(`validate_conformance: case ${id} invalid decision: ${c.decision}`);
      err++;
    }
    if (!ENFORCEMENT.has(c.enforcement)) {
      console.error(`validate_conformance: case ${id} invalid enforcement: ${c.enforcement}`);
      err++;
    }
    for (const k of ["reason_code", "timestamp"]) {
      if (typeof c[k] !== "string" || c[k].length === 0) {
        console.error(`validate_conformance: case ${id} missing or invalid ${k}`);
        err++;
      }
    }
  }
  if (err > 0) {
    process.exit(1);
  }
  console.log(`validate_conformance: OK (${data.cases.length} cases)`);
}

main();
