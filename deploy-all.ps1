param(
  [switch]$NoWait = $false,
  [switch]$Force = $false
)

$projects = @(
  @{ Name = "chat";        Id = "prj_bNsHZPWrRvf9kQLaY4AVtKih6rTx" }
  @{ Name = "accounts";    Id = "prj_XCYe3FQg1CV3N01UgXJBXFarLq89" }
  @{ Name = "admin";       Id = "prj_d1tJ0Gn0LlZw3UGTHxl8zyEAdABt" }
  @{ Name = "dashboard";   Id = "prj_woUJL5OjFeK1Sk5nUU719ANLyLiF" }
  @{ Name = "about";       Id = "prj_sgzmwmOZIv8980ugzR0GiL7soW0f" }
  @{ Name = "blog";        Id = "prj_xLxi4oCYUU30fRgfOGQN6IpwjdqG" }
  @{ Name = "chatlanding"; Id = "prj_mA7D6gbsg5DjJX67IIYUyI3ZrRwf" }
  @{ Name = "docs";        Id = "prj_kWkeEaPsAKxExulUEKMFZMbkUpjl" }
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$flags = @("--prod", "--yes")
if ($NoWait) { $flags += "--no-wait" }
if ($Force)  { $flags += "--force" }

Write-Output "===== Deploying all 8 Tirbeo apps to Vercel ====="
Write-Output ""

$results = @()
foreach ($p in $projects) {
  Write-Output ">>> [$($p.Name)] deploying..."
  $output = & "npx" "vercel" "deploy" "--project" $p.Id @flags 2>&1
  $allUrls = $output | Select-String -Pattern "https://[a-z0-9-]+\.vercel\.app" -AllMatches
  $url = if ($allUrls) { $allUrls.Matches[-1].Value } else { $null }
  $result = New-Object PSObject -Property @{ Name = $p.Name; Url = $url; Output = $output -join "`n" }
  $results += $result
  if ($url) {
    Write-Output "    OK -> $url"
  } else {
    Write-Output "    FAILED"
  }
  Write-Output ""
}

Write-Output "===== RESULTS ====="
foreach ($r in $results) {
  if ($r.Url) {
    Write-Output ("{0,-12} OK   {1}" -f $r.Name, $r.Url)
  } else {
    Write-Output ("{0,-12} FAIL" -f $r.Name)
  }
}

Write-Output ""
Write-Output "Done."
