[CmdletBinding()]
param(
  [ValidateSet('Audit','Prepare','OpenProvider','Download','Install','Serve')][string]$Action = 'Audit',
  [ValidateSet('honeygain','proxyrack','packetstream','bitping','bytelixir','earnfm','repocket','traffmonetizer','usertesting','utest','testio','clickworker','freelance','userlytics','respondent','oneforma','crowdgen','adobe-stock','gumroad')][string]$App,
  [uri]$InstallerUrl,
  [string]$VerifiedPublisher,
  [string]$VerifiedSha256,
  [ValidateSet('Unknown','Broadband','Tethered')][string]$Connection = 'Unknown',
  [string]$OutputDirectory,
  [ValidateRange(1024,65535)][int]$Port = 8769,
  [switch]$OpenBrowser
)
$ErrorActionPreference = 'Stop'
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $PSScriptRoot 'private\pc-setup' }
$catalog = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'pc-catalog.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($Action -eq 'Serve') {
  $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback,$Port)
  $listener.Start()
  $url = "http://127.0.0.1:$Port/dashboard.html"
  Write-Output "Local dashboard: $url . Press Ctrl+C to stop."
  if ($OpenBrowser) { Start-Process $url }
  try {
    while ($true) {
      $client = $listener.AcceptTcpClient()
      try {
        $stream = $client.GetStream(); $stream.ReadTimeout = 5000
        $reader = New-Object System.IO.StreamReader($stream,[System.Text.Encoding]::ASCII,$false,1024,$true)
        $request = $reader.ReadLine()
        if (-not $request) { continue }
        $parts = $request.Split(' ')
        $relative = [uri]::UnescapeDataString(($parts[1].Split('?')[0])).TrimStart('/')
        if (-not $relative) { $relative = 'dashboard.html' }
        $allowed = @('dashboard.html','dashboard.css','dashboard.js','dashboard-core.js','pc-catalog.js','pc-catalog.json','setup-pc.ps1','start.cmd','site.css','pc-agent.html','pc-work-playbooks.html','more-pc-routes.html','internet-income-plan.html','handbook.js','handbook.css','index.html','site.js','android-pilot.html','AGENT-SETUP.md','account-pilot-log.csv','device-pilot-log.csv','downloads/pc-income-kit.zip','downloads/pc-income-kit-manifest.json')
        $status = '200 OK'; $type = 'text/plain; charset=utf-8'
        if ($parts[0] -ne 'GET') { $status = '405 Method Not Allowed'; $body = [Text.Encoding]::UTF8.GetBytes('GET only') }
        elseif ($allowed -notcontains $relative) { $status = '404 Not Found'; $body = [Text.Encoding]::UTF8.GetBytes('Not found') }
        else {
          $file = Join-Path $PSScriptRoot $relative
          $body = [IO.File]::ReadAllBytes($file)
          switch ([IO.Path]::GetExtension($file)) { '.html' { $type='text/html; charset=utf-8' } '.css' { $type='text/css' } '.js' { $type='text/javascript' } '.json' { $type='application/json; charset=utf-8' } '.zip' { $type='application/zip' } }
        }
        $header = [Text.Encoding]::ASCII.GetBytes("HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nX-Content-Type-Options: nosniff`r`nConnection: close`r`n`r`n")
        $stream.Write($header,0,$header.Length); $stream.Write($body,0,$body.Length)
      } catch { Write-Warning 'A local request could not be completed.' } finally { $client.Dispose() }
    }
  } finally { $listener.Stop() }
  return
}
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
if ($Action -eq 'Prepare') {
  $month = Get-Date -Format 'yyyy-MM'
  $decisions = @(); $rows = @()
  foreach ($item in $catalog) {
    $excluded = $Connection -eq 'Tethered' -and $item.id -in @('honeygain','earnfm')
    $status = if ($excluded) { 'excluded' } else { 'candidate' }
    $reason = if ($excluded) { 'Excluded for the declared tethered PC connection under current documented provider rules; native-phone use is a separate route.' } elseif ($item.mode -eq 'active') { 'Prepare browser/work environment; owner completes truthful qualification and real tasks. No paid opportunity guaranteed.' } else { 'Conditional candidate: independently verify country, connection permission, payout and current installer. No eligibility or traffic demand inferred.' }
    $decisions += [ordered]@{id=$item.id;name=$item.name;mode=$item.mode;status=$status;reason=$reason;official_url=$item.setupUrl}
    $rows += [ordered]@{id=$item.id;included=$false;status=$status;basis='measured';days=7;earnedUsd=$null;scenarioUsd=$null;costInr=0;actualCostInr=0;feeUsd=0;loss=0;balanceUsd=$null;minimumUsd=$item.minimumUsd;cashInr=0}
  }
  $state = [ordered]@{version=1;fx=85;target=30000;month=$month;rows=$rows}
  $plan = [ordered]@{prepared_utc=(Get-Date).ToUniversalTime().ToString('o');connection=$Connection;sharing_started=$false;installs_performed=$false;decisions=$decisions}
  $notes = @(
    '# Local PC setup: next steps',
    '',
    "Declared connection: $Connection. This preparation installed no provider client and started no sharing.",
    '1. Run setup-pc.ps1 -Action Audit to record hardware privately.',
    '2. Read setup-plan.json and pc-agent.html. Excluded candidates are not install targets.',
    '3. Start the local dashboard with start.cmd, or setup-pc.ps1 -Action Serve -OpenBrowser.',
    '4. Import dashboard-initial.json. It contains only local starting decisions, not earnings.',
    '5. For an eligible candidate, obtain a current official installer and verify its publisher before interactive installation.',
    '6. Owner completes sign-in, payment/KYC and consent. Record real status and a stable observation window.',
    '7. Keep income unknown until measured. Select only a compatible current configuration. Export privately.',
    '',
    'For a tethered PC, Honeygain and EarnFM are excluded. Other bandwidth apps remain unresolved until their current rules and carrier permission are verified.',
    'Use pc-work-playbooks.html for active-work preparation if wanted. No qualification answers or human work are automated.',
    'Existing files are preserved on repeated Prepare runs. Choose a new OutputDirectory for a new plan rather than replacing personal records.'
  ) -join "`r`n"
  $outputs = @{
    'dashboard-initial.json'=($state | ConvertTo-Json -Depth 6)
    'setup-plan.json'=($plan | ConvertTo-Json -Depth 6)
    'SETUP-NEXT.md'=$notes
  }
  foreach ($name in $outputs.Keys) {
    $targetFile = Join-Path $OutputDirectory $name
    if (Test-Path -LiteralPath $targetFile) { Write-Output "Preserved existing file: $targetFile" }
    else { $outputs[$name] | Set-Content -LiteralPath $targetFile -Encoding UTF8; Write-Output "Prepared: $targetFile" }
  }
  return
}
if ($Action -eq 'Audit') {
  $computer = Get-CimInstance Win32_ComputerSystem
  $os = Get-CimInstance Win32_OperatingSystem
  $gpu = @(Get-CimInstance Win32_VideoController | ForEach-Object { [ordered]@{name=$_.Name;reported_vram_bytes=$_.AdapterRAM} })
  $report = [ordered]@{checked_utc=(Get-Date).ToUniversalTime().ToString('o');windows=$os.Caption;architecture=$os.OSArchitecture;ram_gb=[math]::Round($computer.TotalPhysicalMemory/1GB,1);gpus=$gpu;connection_declared=$Connection;salad_container_ram_eligible=($computer.TotalPhysicalMemory -ge 16GB);network_or_provider_eligibility='Not established by hardware audit';sharing='Not started';accounts='Not signed in by this script'}
  $report | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $OutputDirectory 'inventory.json') -Encoding UTF8
  $report | ConvertTo-Json -Depth 5 | Write-Output
  return
}
if (-not $App) { throw 'Select one -App. There is no install-all mode.' }
$candidate = $catalog | Where-Object { $_.id -eq $App }
if ($Action -eq 'OpenProvider') { Start-Process $candidate.setupUrl; return }
if ($App -in @('honeygain','earnfm') -and $Connection -ne 'Broadband') { throw 'For this PC pilot, Honeygain/EarnFM require declared eligible broadband. Tethered or unknown connection: use provider guidance first.' }
if ($candidate.mode -ne 'passive') { throw 'This route uses browser onboarding. Use -Action OpenProvider, then complete personal qualification locally.' }
if (-not $InstallerUrl -or $InstallerUrl.Scheme -ne 'https' -or $InstallerUrl.UserInfo -or $InstallerUrl.Query) { throw 'Supply a current official HTTPS installer URL without credentials or token query strings, resolved from the provider page. Use the owner browser for authenticated links.' }
$hosts = @{
  honeygain=@('download.honeygain.com','resources.honeygain.com','download-api.honeygain.com');
  proxyrack=@('peer.proxyrack.com','download.proxyrack.com');
  packetstream=@('client-dl.packetstream.io');
  bitping=@('bitping.com','dl.bitping.com','download.bitping.com');
  bytelixir=@('bytelixir.com','dash.bytelixir.com');
  earnfm=@('cdn.earn.fm');
  repocket=@('repocket.com','cdn.repocket.com');
  traffmonetizer=@('data.traffmonetizer.io')
}
if ($hosts[$App] -notcontains $InstallerUrl.DnsSafeHost) { throw 'Installer host is not in the conservative provider allowlist. Reverify current official download; do not weaken this check blindly.' }
$extension = [IO.Path]::GetExtension($InstallerUrl.AbsolutePath).ToLowerInvariant()
if ($extension -notin @('.exe','.msi')) { throw 'Only explicit EXE/MSI installer URLs are supported. Use the official browser flow for other packages.' }
$artifact = Join-Path $OutputDirectory ($App+'-installer'+$extension)
Add-Type -AssemblyName System.Net.Http
$handler = New-Object System.Net.Http.HttpClientHandler
$handler.AllowAutoRedirect = $false
$http = New-Object System.Net.Http.HttpClient($handler)
$http.Timeout = [TimeSpan]::FromSeconds(90)
try {
  $response = $http.GetAsync($InstallerUrl,[System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
  if (-not $response.IsSuccessStatusCode) { throw 'Download failed or redirected. Resolve/reverify the final official URL before retrying.' }
  if ($response.Content.Headers.ContentLength -gt 300MB) { throw 'Installer exceeds the 300 MB limit.' }
  $cancel = New-Object System.Threading.CancellationTokenSource
  $cancel.CancelAfter([TimeSpan]::FromSeconds(90))
  $source = $response.Content.ReadAsStreamAsync().GetAwaiter().GetResult()
  $temporary = $artifact + '.partial'
  $destination = [IO.File]::Open($temporary,[IO.FileMode]::Create,[IO.FileAccess]::Write)
  $complete = $false
  try {
    $buffer = New-Object byte[] 65536; $total = 0
    while (($read = $source.ReadAsync($buffer,0,$buffer.Length,$cancel.Token).GetAwaiter().GetResult()) -gt 0) {
      $total += $read
      if ($total -gt 300MB) { throw 'Installer exceeds the 300 MB limit.' }
      $destination.Write($buffer,0,$read)
    }
    $complete = $true
  } finally {
    $destination.Dispose(); $source.Dispose(); $cancel.Dispose()
    if (-not $complete -and (Test-Path -LiteralPath $temporary)) { Remove-Item -LiteralPath $temporary }
  }
  Move-Item -LiteralPath $temporary -Destination $artifact -Force
} finally { $http.Dispose(); $handler.Dispose() }
$hash = (Get-FileHash -LiteralPath $artifact -Algorithm SHA256).Hash
$signature = Get-AuthenticodeSignature -LiteralPath $artifact
$subject = if ($signature.SignerCertificate) { $signature.SignerCertificate.Subject } else { $null }
$receipt = [ordered]@{app=$App;download_url=$InstallerUrl.AbsoluteUri;sha256=$hash;signature_status=[string]$signature.Status;signer_subject=$subject;installed=$false}
$receipt | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $OutputDirectory ($App+'-receipt.json')) -Encoding UTF8
$receipt | ConvertTo-Json | Write-Output
if ($Action -eq 'Download') { return }
if (-not $VerifiedPublisher -or $signature.Status -ne 'Valid' -or $subject -cne $VerifiedPublisher) { throw 'Installer not launched. Supply an independently verified full publisher subject and require a Valid matching signature. A name copied from an unverified file alone is insufficient.' }
if ($VerifiedSha256 -and $hash -ine $VerifiedSha256) { throw 'Installer not launched: expected SHA256 does not match.' }
Write-Output 'Launching normal interactive installer. Owner handles UAC, license/consent and sign-in; no silent flags supplied.'
if ($extension -eq '.msi') { Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i',('"'+$artifact+'"')) -Wait }
else { Start-Process -FilePath $artifact -Wait }
Write-Output 'Installer closed. Independently verify installed state; sharing and earnings remain unverified.'
