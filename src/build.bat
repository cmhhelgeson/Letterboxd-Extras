@echo off
setlocal enabledelayedexpansion

:: Ask for target if not passed
if "%1"=="" (
    echo Usage: build.bat chrome ^| firefox
    exit /b 1
)

:: TARGET = 'chrome' | 'firefox'
set TARGET=%1
:: %~dp0 d: drive letter + p: path + 0: name of the batch file
:: so C:\wherever\thisbuild.bat
set SOURCE_DIR=%~dp0
set COMMON_DIR=%SOURCE_DIR%common
set TARGET_DIR=%SOURCE_DIR%%TARGET%
set DIST_DIR=%SOURCE_DIR%dist\%TARGET%

:: Clean previous build
if exist "%DIST_DIR%" (
    :: Remove directory
    :: /s => delete subdirectories
    :: /q => delete quietly
    rmdir /s /q "%DIST_DIR%"
)
mkdir "%DIST_DIR%"

:: Copy common files
:: /e specifies subdirectories
:: /i /y overrides interactive prompts
:: xcopy /e /i /y "%COMMON_DIR%" "%DIST_DIR%" /EXCLUDE:%COMMON_DIR%node_modules

ROBOCOPY "%COMMON_DIR%" "%DIST_DIR%" /E /XD "node_modules"

:: Copy manifest
copy /y "%TARGET_DIR%" "%DIST_DIR%"

echo Build complete: %DIST_DIR%