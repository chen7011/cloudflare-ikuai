@echo off
setlocal enabledelayedexpansion

set CONFIG_DIR=.\configs
set DEFAULT_DIR=.\defaults

REM Ensure config directory exists
if not exist "%CONFIG_DIR%" (
    echo [INFO] Creating config directory...
    mkdir "%CONFIG_DIR%"
)

echo [INFO] Checking default config files...

REM Iterate through files in the default directory
for %%F in ("%DEFAULT_DIR%\*") do (
    set "FILE=%%~nxF"
    if not exist "%CONFIG_DIR%\!FILE!" (
        echo [COPY] !FILE! not found, copying...
        copy "%%F" "%CONFIG_DIR%\!FILE!" >nul
    ) else (
        echo [SKIP] !FILE! already exists, skipping
    )
)

REM Start the application
node index.js
