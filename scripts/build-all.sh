#!/usr/bin/env bash
set -e

echo "======================================"
echo "  OS MedTech - Build Completo"
echo "======================================"

echo "[1/4] Backend"
cd apps/backend
pnpm install
pnpm build
cd ../..

echo "[2/4] Web"
cd apps/web
pnpm install
pnpm build
cd ../..

echo "[3/4] Desktop (.exe)"
rm -rf apps/desktop/web-build
cp -r apps/web/out apps/desktop/web-build
cd apps/desktop
pnpm install
pnpm build:exe
cd ../..

echo "[4/4] APK"
cd apps/mobile
pnpm install
pnpm build:apk
cd ../..

echo "Build completo."
