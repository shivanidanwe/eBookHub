@echo off
echo Starting eBookHub Backend and Frontend...
start "eBookHub Backend" "%~dp0start-backend.bat"
start "eBookHub Frontend" "%~dp0start-frontend.bat"
echo Done! Both servers are starting up.

