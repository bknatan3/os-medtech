$ErrorActionPreference = "Stop"

Write-Host "OS MedTech - Geracao do instalador unico"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Action
  )
  Write-Host "==> $Name"
  & $Action
  if ($LASTEXITCODE -ne 0) {
    throw "Falha em: $Name (exit code $LASTEXITCODE)"
  }
}

# Evita lock no .next/trace quando houver next dev aberto.
$line3000 = netstat -ano | findstr :3000 | Select-Object -First 1
if ($line3000) {
  $pid3000 = ($line3000 -split "\s+")[-1]
  if ($pid3000) {
    taskkill /PID $pid3000 /F | Out-Null
  }
}

# Build web estatico para o app desktop.
Invoke-Step "Build web" { pnpm --filter @os-medtech/web build }
if (Test-Path "apps/desktop/web-build") {
  Remove-Item -Recurse -Force "apps/desktop/web-build"
}
Copy-Item -Recurse "apps/web/out" "apps/desktop/web-build"

# Gera o .exe instalador.
Invoke-Step "Build instalador desktop" { pnpm --filter @os-medtech/desktop build:exe }

# Copia artefatos para uma pasta unica de distribuicao.
$releaseDir = Join-Path $root "release"
if (!(Test-Path $releaseDir)) {
  New-Item -ItemType Directory -Path $releaseDir | Out-Null
}
Copy-Item -Force "apps/desktop/dist/*Setup*.exe" $releaseDir
Copy-Item -Force "apps/desktop/dist/latest*.yml" $releaseDir -ErrorAction SilentlyContinue

Write-Host "Instalador pronto em: $releaseDir"
