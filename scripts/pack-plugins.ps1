$ErrorActionPreference = 'Stop'

# Repack pchub-pc-quote.zip
$tempQuoteDir = Join-Path $env:TEMP ('quote_' + [System.Guid]::NewGuid().ToString())
$quoteSub = Join-Path $tempQuoteDir 'pchub-pc-quote'
New-Item -ItemType Directory -Force -Path $quoteSub | Out-Null
Copy-Item 'pchub-pc-quote.php' -Destination (Join-Path $quoteSub 'pchub-pc-quote.php')
if (Test-Path 'pchub-pc-quote.zip') { Remove-Item 'pchub-pc-quote.zip' -Force }
Compress-Archive -Path $quoteSub -DestinationPath 'pchub-pc-quote.zip' -Force
Remove-Item $tempQuoteDir -Recurse -Force
Write-Host "Created pchub-pc-quote.zip"

# Repack pchub-plugins.zip
$tempPluginsDir = Join-Path $env:TEMP ('plugins_' + [System.Guid]::NewGuid().ToString())
$pluginsSub = Join-Path $tempPluginsDir 'pchub-plugins'
New-Item -ItemType Directory -Force -Path $pluginsSub | Out-Null
Copy-Item 'nks-contact-buttons.php' -Destination (Join-Path $pluginsSub 'nks-contact-buttons.php')
Copy-Item 'pchub-community-builds.php' -Destination (Join-Path $pluginsSub 'pchub-community-builds.php')
Copy-Item 'pchub-flash-sale.php' -Destination (Join-Path $pluginsSub 'pchub-flash-sale.php')
Copy-Item 'pchub-pc-quote.php' -Destination (Join-Path $pluginsSub 'pchub-pc-quote.php')
if (Test-Path 'pchub-plugins.zip') { Remove-Item 'pchub-plugins.zip' -Force }
Compress-Archive -Path $pluginsSub -DestinationPath 'pchub-plugins.zip' -Force
Remove-Item $tempPluginsDir -Recurse -Force
Write-Host "Created pchub-plugins.zip"

Get-ChildItem -Filter *.zip | Select-Object Name, Length, LastWriteTime
