$ErrorActionPreference = 'Stop'

$localNode = 'C:\Users\25981\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$node = Get-Command node -ErrorAction SilentlyContinue

if ($node) {
  $nodePath = $node.Source
} elseif (Test-Path -LiteralPath $localNode) {
  $nodePath = $localNode
} else {
  throw 'Node.js was not found. Install Node.js 20 or newer, then run npm install.'
}

& $nodePath "$PSScriptRoot\node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 4173
