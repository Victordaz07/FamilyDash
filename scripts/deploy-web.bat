@echo off
echo ========================================
echo FamilyDash Web - Deploy Script (FASE 0)
echo ========================================
echo.
echo Desplegando paginas HTML estaticas desde web/public
echo.

echo 1. Iniciando sesion en Firebase...
firebase login

echo.
echo 2. Configurando proyecto...
firebase use family-dash-15944

echo.
echo 3. Desplegando hosting...
firebase deploy --only hosting

echo.
echo 4. ¡Deploy completado!
echo.
echo URLs disponibles:
echo - Landing: https://family-dash-15944.web.app/
echo - Verificacion: https://family-dash-15944.web.app/verified
echo.
echo NOTA: Para actualizar a Next.js (Fase 1), ejecutar deploy-web-nextjs.bat
echo.
pause
