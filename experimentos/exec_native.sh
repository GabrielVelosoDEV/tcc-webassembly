#!/usr/bin/env bash
# exec_native.sh — 30 repetições das bancadas nativas (clang e gcc, -O3 -ffp-contract=off)
set -euo pipefail
REPS=${1:-30}; OUT=${2:-exec_native.jsonl}
for rep in $(seq 0 $((REPS-1))); do
  for impl in native-clang native-gcc; do
    echo "{\"env\":\"native\",\"impl\":\"$impl\",\"rep\":$rep,$(./nbody-$impl 512 200 | sed 's/^{//')" >> "$OUT"
  done
done
