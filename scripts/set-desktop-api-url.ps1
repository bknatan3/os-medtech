param(
  [Parameter(Mandatory = $true)]
  [string]$ApiBaseUrl
)

$ErrorActionPreference = "Stop"

$normalized = $ApiBaseUrl.TrimEnd("/")
$settingsDir = Join-Path $env:APPDATA "OS MedTech"
$settingsPath = Join-Path $settingsDir "settings.json"

if (!(Test-Path $settingsDir)) {
  New-Item -ItemType Directory -Path $settingsDir | Out-Null
}

$content = @{ apiBaseUrl = $normalized } | ConvertTo-Json
Set-Content -Path $settingsPath -Value $content -Encoding UTF8

Write-Host "API atualizada para: $normalized"
Write-Host "Arquivo: $settingsPath"
