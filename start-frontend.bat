@echo off
title eBookHub Frontend
cd /d "%~dp0frontend"
call npm.cmd run dev
pause

