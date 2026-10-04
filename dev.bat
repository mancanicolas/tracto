@echo off
cd /d "%~dp0"
if exist "F:\Rust\.cargo\bin" set "PATH=F:\Rust\.cargo\bin;%PATH%"
call npx pnpm@latest tauri dev
pause
