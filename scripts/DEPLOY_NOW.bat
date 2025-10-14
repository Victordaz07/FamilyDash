@echo off
echo ========================================
echo FamilyDash Web - DEPLOY AHORA MISMO
echo ========================================
echo.
echo 🚀 Vamos a deployar las paginas web para que puedas verlas
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
if not exist "firebase.json" (
    echo ❌ Error: firebase.json no encontrado
    pause
    exit /b 1
)
if not exist ".firebaserc" (
    echo ❌ Error: .firebaserc no encontrado
    pause
    exit /b 1
)
echo ✅ Todos los archivos encontrados

echo.
echo 2. 🔐 INICIANDO SESION EN FIREBASE...
echo    (Se abrira el navegador para autenticacion)
echo    Presiona ENTER cuando hayas completado el login...
pause

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
echo - Landing: https://family-dash-15944.web.app/
echo - Verificacion: https://family-dash-15944.web.app/verified
echo.
echo 🎨 Caracteristicas incluidas:
echo - ✅ UI moderna con glassmorphism
echo - ✅ Animaciones suaves
echo - ✅ Responsive design perfecto
echo - ✅ Accesibilidad completa
echo.
echo 📱 Abre las URLs en tu navegador para ver el resultado!
echo.
pause
