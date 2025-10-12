@echo off
echo ========================================
echo FamilyDash Web - DEPLOY AUTOMATICO
echo ========================================
echo.
echo 🚀 Deployando paginas web automaticamente...
echo.

echo 1. Verificando archivos...
if not exist "web\public\index.html" (
    echo ❌ Error: web\public\index.html no encontrado
    pause
    exit /b 1
)
if not exist "web\public\verified.html" (
    echo ❌ Error: web\public\verified.html no encontrado
    pause
    exit /b 1
)
echo ✅ Archivos web encontrados

echo.
echo 2. 🔐 INICIANDO SESION EN FIREBASE...
echo    IMPORTANTE: Se abrira el navegador
echo    - Selecciona tu cuenta de Google
echo    - Autoriza el acceso
echo    - Regresa aqui cuando veas "Login successful"
echo.
firebase login

echo.
echo 3. 📋 CONFIGURANDO PROYECTO...
firebase use family-dash-15944

echo.
echo 4. 🚀 DESPLEGANDO PAGINAS WEB...
firebase deploy --only hosting

echo.
echo 5. ✅ ¡DEPLOY COMPLETADO!
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
echo - ✅ UI moderna con glassmorphism
echo - ✅ Animaciones suaves
echo - ✅ Responsive design perfecto
echo - ✅ Accesibilidad completa
echo.
echo 📱 ¡Abre las URLs en tu navegador para ver el resultado!
echo.
echo Presiona ENTER para abrir las paginas...
pause
start https://family-dash-15944.web.app/
start https://family-dash-15944.web.app/verified
echo.
echo ¡LISTO! Las paginas se abrieron en tu navegador 🎉
pause
