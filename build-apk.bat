@echo off
REM FamilyDash APK Build Script - Windows
REM Genera APK de producción manualmente

echo ========================================
echo    FamilyDash APK Build Script v1.3.0
echo ========================================

echo.
echo [1/6] Limpiando proyecto...
call gradlew clean

echo.
echo [2/6] Instalando dependencias...
call npm install

echo.
echo [3/6] Generando bundle de JavaScript...
call npx expo export --platform android --output-dir android/app/src/main/assets

echo.
echo [4/6] Compilando APK de debug...
call gradlew assembleDebug

echo.
echo [5/6] Compilando APK de release...
call gradlew assembleRelease

echo.
echo [6/6] Verificando archivos generados...
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo ✅ APK Debug generado: android\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo ❌ Error: APK Debug no encontrado
)

if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo ✅ APK Release generado: android\app\build\outputs\apk\release\app-release.apk
) else (
    echo ❌ Error: APK Release no encontrado
)

echo.
echo ========================================
echo    Build completado!
echo ========================================
pause
