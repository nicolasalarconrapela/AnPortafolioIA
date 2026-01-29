#!/usr/bin/env bash
set -euo pipefail

IN="public/model.glb"
OUT_DIR="public/_optimized"
OUT="${OUT_DIR}/model.optimized.glb"

mkdir -p "${OUT_DIR}"

echo "== Inspect (original) =="
npx gltf-transform inspect "${IN}"

echo "== Dedup =="
npx gltf-transform dedup "${IN}" "${OUT_DIR}/1.dedup.glb"

echo "== Prune (remove unused) =="
npx gltf-transform prune "${OUT_DIR}/1.dedup.glb" "${OUT_DIR}/2.prune.glb"

echo "== Texture compress (KTX2 / ETC1S) =="
# ETC1S: muy eficiente en tamaño/VRAM, ideal para mobile/web.
npx gltf-transform etc1s "${OUT_DIR}/2.prune.glb" "${OUT_DIR}/3.ktx2.glb"

echo "== Meshopt (faster download + decode) =="
npx gltf-transform meshopt "${OUT_DIR}/3.ktx2.glb" "${OUT}"

echo "== Inspect (optimized) =="
npx gltf-transform inspect "${OUT}"

echo ""
echo "DONE ✅  -> ${OUT}"
