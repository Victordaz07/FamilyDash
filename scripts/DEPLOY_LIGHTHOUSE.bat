@echo off
title FamilyDash Web Deploy - Lighthouse Account
color 0A
echo.
echo ========================================
echo   🚀 FAMILYDASH WEB DEPLOY - LIGHTHOUSE
echo ========================================
echo.
echo ✅ Preparando deploy con cuenta Lighthouse...
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
echo    IMPORTANTE: Usa la cuenta de Lighthouse
echo    Se abrira el navegador para autenticacion
echo    - Selecciona la cuenta de Lighthouse
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
echo 📋 PASO 2: LISTANDO PROYECTOS DISPONIBLES
firebase projects:list

echo.
echo 📋 PASO 3: CONFIGURANDO PROYECTO
echo    Usando el proyecto original: family-dash-15944
firebase use family-dash-15944
if errorlevel 1 (
    echo ❌ Error configurando proyecto family-dash-15944
    echo Intentando con el proyecto actual...
    firebase use family-dash-web
    if errorlevel 1 (
        echo ❌ Error configurando proyecto
        echo Presiona cualquier tecla para salir...
        pause >nul
        exit /b 1
    )
)

echo.
echo 🚀 PASO 4: DESPLEGANDO PAGINAS WEB
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
echo 🎨 Caracteristicas incluidas:
echo - ✨ UI moderna con glassmorphism
echo - 🎭 Animaciones suaves
echo - 📱 Responsive design perfecto
echo - ♿ Accesibilidad completa
echo.
echo 📱 Presiona ENTER para abrir las paginas en tu navegador...
pause >nul

echo Abriendo paginas web...
start https://family-dash-15944.web.app/
timeout /t 2 /nobreak >nul
start https://family-dash-15944.web.app/verified

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
