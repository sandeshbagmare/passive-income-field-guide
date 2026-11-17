[CmdletBinding()]
param([string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $PSScriptRoot 'downloads' }
$files = @(
  '.gitignore','README.md','AGENT-SETUP.md','start.cmd','setup-pc.ps1','setup-check.ps1',
  'index.html','page.html','android-pilot.html','pc-agent.html','pc-work-playbooks.html','more-pc-routes.html',
  'internet-income-plan.html','dashboard.html','site.css','site.js','handbook.css','handbook.js',
  'dashboard.css','dashboard.js','dashboard-core.js','pc-catalog.json','pc-catalog.js','apps.json',
  'account-pilot-log.csv','device-pilot-log.csv','pilot-log.csv','build.cjs','check.cjs',
  'handbook-check.cjs','dashboard-check.cjs','package-kit.ps1'
)
foreach ($name in $files) {
  if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot $name) -PathType Leaf)) { throw "Missing kit file: $name" }
}
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$archivePath = Join-Path $OutputDirectory 'pc-income-kit.zip'
$filePaths = @($files | ForEach-Object { Join-Path $PSScriptRoot $_ })
Compress-Archive -LiteralPath $filePaths -DestinationPath $archivePath -CompressionLevel Optimal -Force
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($archivePath)
try {
  $actual = @($zip.Entries | ForEach-Object FullName | Sort-Object)
  $expected = @($files | Sort-Object)
  if (Compare-Object $actual $expected) { throw 'Kit contents do not match the explicit public-file list.' }
} finally { $zip.Dispose() }
$manifest = [ordered]@{
  format_version=1
  archive='pc-income-kit.zip'
  archive_sha256=(Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
  file_count=$files.Count
  files=@($files | ForEach-Object { [ordered]@{path=$_;sha256=(Get-FileHash -LiteralPath (Join-Path $PSScriptRoot $_) -Algorithm SHA256).Hash} })
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $OutputDirectory 'pc-income-kit-manifest.json') -Encoding UTF8
Write-Output "Packaged $($files.Count) public files. No private records, downloaded client binaries or Git history included."
Write-Output "Archive: $archivePath"
Write-Output "SHA256: $($manifest.archive_sha256)"
