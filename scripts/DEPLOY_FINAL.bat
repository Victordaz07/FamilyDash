@echo off
title FamilyDash Web Deploy
color 0A
echo.
echo ========================================
echo   🚀 FAMILYDASH WEB DEPLOY AUTOMATICO
echo ========================================
echo.
echo ✅ Preparando deploy de paginas web...
echo.

REM Verificar archivos
if not exist "web\public\index.html" (
    echo ❌ Error: web\public\index.html no encontrado
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)
if not exist "web\public\verified.html" (
    echo ❌ Error: web\public\verified.html no encontrado
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)
echo ✅ Archivos web verificados

REM Verificar Firebase CLI
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Firebase CLI no esta instalado
    echo Instala con: npm install -g firebase-tools
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)
echo ✅ Firebase CLI verificado

echo.
echo 🔐 PASO 1: INICIANDO SESION EN FIREBASE
echo    Se abrira el navegador para autenticacion
echo    - Selecciona tu cuenta de Google
echo    - Autoriza el acceso a Firebase
echo    - Regresa aqui cuando veas "Login successful"
echo.
echo Presiona ENTER para continuar...
pause >nul

firebase login
if errorlevel 1 (
    echo ❌ Error en el login de Firebase
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo.
echo 📋 PASO 2: CONFIGURANDO PROYECTO
firebase use family-dash-15944
if errorlevel 1 (
    echo ❌ Error configurando proyecto
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo.
echo 🚀 PASO 3: DESPLEGANDO PAGINAS WEB
echo    Esto puede tomar 1-2 minutos...
firebase deploy --only hosting
if errorlevel 1 (
    echo ❌ Error en el deploy
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo.
echo ========================================
echo   🎉 ¡DEPLOY COMPLETADO CON EXITO!
echo ========================================
echo.
echo 🌐 TUS PAGINAS YA ESTAN DISPONIBLES:
echo.
echo 🏠 LANDING PAGE:
echo    https://family-dash-15944.web.app/
echo.
echo ✅ PAGINA DE VERIFICACION:
echo    https://family-dash-15944.web.app/verified
echo.
echo 🎨 Paginas desplegadas:
echo - 🏠 Landing page con screenshots
echo - ✨ Caracteristicas completas
echo - 👨‍👩‍👧‍👦 Centro para Padres (COPPA)
echo - 📝 Registro y Login
echo - 📚 Blog (estructura)
echo - 📊 Google Analytics 4
echo - 🛡️ Trust badges y testimonios
echo.
echo 📱 Presiona ENTER para abrir las paginas en tu navegador...
pause >nul

echo Abriendo paginas web...
start https://family-dash-15944.web.app/
timeout /t 2 /nobreak >nul
start https://family-dash-15944.web.app/features
timeout /t 2 /nobreak >nul
start https://family-dash-15944.web.app/parents
timeout /t 2 /nobreak >nul
start https://family-dash-15944.web.app/signup
timeout /t 2 /nobreak >nul
start https://family-dash-15944.web.app/blog

echo.
echo ========================================
echo   ✅ ¡LISTO! PAGINAS DESPLEGADAS
echo ========================================
echo.
echo Las paginas se abrieron en tu navegador
echo Puedes cerrar esta ventana ahora
echo.
echo Presiona cualquier tecla para salir...
pause >nul
