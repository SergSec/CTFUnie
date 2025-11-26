@echo off
echo ==========================================
echo Instalando todas las dependencias...
echo ==========================================
call npm run install-all
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Hubo un problema instalando las dependencias.
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================
echo Iniciando el servidor de desarrollo...
echo ==========================================
npm run dev
pause
