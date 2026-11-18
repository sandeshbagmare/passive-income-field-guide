$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$testDirectory = Join-Path (Join-Path $root 'private') ('setup-self-check-' + [guid]::NewGuid().ToString('N').Substring(0,8))
& (Join-Path $root 'setup-pc.ps1') -Action Prepare -Connection Tethered -OutputDirectory $testDirectory | Out-Null
$state = Get-Content -LiteralPath (Join-Path $testDirectory 'dashboard-initial.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$plan = Get-Content -LiteralPath (Join-Path $testDirectory 'setup-plan.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$catalogItems = Get-Content -LiteralPath (Join-Path $root 'pc-catalog.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$catalogCount = $catalogItems.Count
if ($state.rows.Count -ne $catalogCount) { throw 'Expected all catalog rows' }
if ($state.version -ne 3 -or @($state.rows | Where-Object payoutKind -ne 'unconfirmed').Count) { throw 'New plans must require payout-kind confirmation before cash forecasts' }
foreach ($id in @('honeygain','earnfm')) {
  if (($state.rows | Where-Object id -eq $id).status -ne 'excluded') { throw "$id must be excluded for tethered PC" }
}
if (($state.rows | Where-Object id -eq 'proxyrack').status -ne 'candidate') { throw 'Unknown tethering support must remain conditional, not claimed eligible' }
if (@($state.rows | Where-Object { $_.included -or $_.earnedUsd -ne $null -or $_.cashInr -ne 0 }).Count) { throw 'Preparation must not invent earnings or selected plans' }
if ($plan.connection -ne 'Tethered') { throw 'Declared connection not preserved' }
if (-not (Test-Path -LiteralPath (Join-Path $testDirectory 'SETUP-NEXT.md'))) { throw 'Human-readable next steps missing' }
$broadbandDirectory = Join-Path $testDirectory 'broadband'
& (Join-Path $root 'setup-pc.ps1') -Action Prepare -Connection Broadband -OutputDirectory $broadbandDirectory | Out-Null
$broadband = Get-Content -LiteralPath (Join-Path $broadbandDirectory 'dashboard-initial.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if (($broadband.rows | Where-Object id -eq 'honeygain').status -ne 'candidate') { throw 'Broadband fit should remain candidate pending provider and carrier approval' }
$sentinelPath = Join-Path $testDirectory 'SETUP-NEXT.md'
Set-Content -LiteralPath $sentinelPath -Value 'Existing owner notes; preserve me.' -Encoding UTF8
& (Join-Path $root 'setup-pc.ps1') -Action Prepare -Connection Tethered -OutputDirectory $testDirectory | Out-Null
if ((Get-Content -LiteralPath $sentinelPath -Raw) -notlike '*Existing owner notes*') { throw 'Prepare overwrote existing owner file' }
$fileLaunchPath = Join-Path $testDirectory 'file-launch'
New-Item -ItemType Directory -Path $fileLaunchPath -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $root 'setup-pc.ps1'),(Join-Path $root 'pc-catalog.json') -Destination $fileLaunchPath -Force
& powershell.exe -NoProfile -File (Join-Path $fileLaunchPath 'setup-pc.ps1') -Action Prepare -Connection Tethered | Out-Null
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath (Join-Path $fileLaunchPath 'private\pc-setup\dashboard-initial.json'))) { throw 'Windows PowerShell -File launch failed with default output directory' }
Write-Output 'PASS: tethered exclusions, broadband candidates, unknown income, owner-file preservation and Windows PowerShell -File default-directory launch.'
