@echo off
if exist "%AppData%\Antigravity\bin\agy-node.cmd" (
  call "%AppData%\Antigravity\bin\agy-node.cmd" %*
) else if exist "%AppData%\Antigravity\bin\node.cmd" (
  call "%AppData%\Antigravity\bin\node.cmd" %*
) else (
  node %*
)
