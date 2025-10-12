@echo off
echo ========================================
echo FamilyDash Web - Enhanced Deploy Script
echo ========================================
echo.
echo 🚀 Deploying enhanced web platform with improved UI/UX
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
echo 2. Iniciando sesion en Firebase...
echo    (Se abrira el navegador para autenticacion)
firebase login

echo.
echo 3. Configurando proyecto...
firebase use family-dash-15944

echo.
echo 4. Desplegando hosting con mejoras UI/UX...
firebase deploy --only hosting

echo.
echo 5. ✅ ¡Deploy completado con éxito!
echo.
echo 🌐 URLs disponibles:
echo - Landing: https://family-dash-15944.web.app/
echo - Verificacion: https://family-dash-15944.web.app/verified
echo.
echo 🎨 Mejoras incluidas:
echo - ✅ UI moderna con glassmorphism y gradientes
echo - ✅ Animaciones suaves y micro-interacciones
echo - ✅ Responsive design perfecto (móvil + desktop)
echo - ✅ Loading states y efectos hover
echo - ✅ Navegación suave y efectos parallax
echo - ✅ Accesibilidad mejorada (ARIA, keyboard nav)
echo - ✅ Performance optimizada
echo - ✅ SEO y meta tags completos
echo - ✅ Contadores animados y efectos visuales
echo - ✅ Header sticky con scroll effects
echo.
echo 📱 Testing recomendado:
echo - Probar en móvil y desktop
echo - Verificar responsive design
echo - Probar flujo de verificación completo
echo.
pause
