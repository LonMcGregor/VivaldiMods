@echo off
color 4f
mode con:cols=80 lines=1
set profile=%1
:set
cls
if [%profile%]==[] set /p profile="Enter profile Name: "=
if [%profile%]==[] goto set
start "" "%PROGRAMFILES%\Vivaldi\Application\vivaldi.exe" "--user-data-dir=%LOCALAPPDATA%\Vivaldi\%profile%"
