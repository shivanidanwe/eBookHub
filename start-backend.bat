@echo off
title eBookHub Backend
cd /d "%~dp0backend"
call npm.cmd run dev
pause

