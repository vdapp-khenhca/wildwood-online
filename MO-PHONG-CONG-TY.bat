@echo off
cd /d "%~dp0"
start "" http://localhost:8787
"%~dp0node.exe" server.js
pause
