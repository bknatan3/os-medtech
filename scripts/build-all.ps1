$ErrorActionPreference = "Stop"

Write-Host "OS MedTech - Build Completo"

Push-Location apps/backend
pnpm install
pnpm build
Pop-Location

Push-Location apps/web
pnpm install
pnpm build
Pop-Location

if (Test-Path apps/desktop/web-build) { Remove-Item -Recurse -Force apps/desktop/web-build }
Copy-Item -Recurse apps/web/out apps/desktop/web-build

Push-Location apps/desktop
pnpm install
pnpm build:exe
Pop-Location

Push-Location apps/mobile
pnpm install
pnpm build:apk
Pop-Location

Write-Host "Build finalizado."
