@echo off
set profile=%1
:set
if [%profile%]==[] set /p profile="Enter profile Name: "=
if [%profile%]==[] goto set
start %LOCALAPPDATA%\Vivaldi\Application\vivaldi.exe --user-data-dir=%LOCALAPPDATA%\Vivaldi\%profile% --flag-switches-begin --debug-packed-apps --silent-debugger-extension-api --flag-switches-end
