@echo off
setlocal
cd /d %~dp0

if not exist node_modules (
  echo Instalando dependencias...
  npm install
)

echo Abriendo ChessX en el navegador...
start http://localhost:3000

echo Iniciando servidor...
set PORT=3000
node src\server.js
