@echo off
REM FamilyDash Keystore Generator
REM Genera el keystore de producción para firmar APKs

echo ========================================
echo   FamilyDash Keystore Generator v1.3.0
echo ========================================

echo.
echo IMPORTANTE: Este script generará un keystore de producción.
echo Guarda una copia de seguridad del archivo generado.
echo.

set /p STORE_PASSWORD="Ingresa la contraseña del keystore: "
set /p KEY_PASSWORD="Ingresa la contraseña de la clave: "

echo.
echo Generando keystore...

keytool -genkey -v -keystore android\app\familydash-release-key.keystore -alias familydash-key-alias -keyalg RSA -keysize 2048 -validity 10000 -storepass %STORE_PASSWORD% -keypass %KEY_PASSWORD%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Keystore generado exitosamente!
    echo.
    echo Ahora agrega estas líneas a android/gradle.properties:
    echo.
    echo MYAPP_RELEASE_STORE_FILE=familydash-release-key.keystore
    echo MYAPP_RELEASE_KEY_ALIAS=familydash-key-alias
    echo MYAPP_RELEASE_STORE_PASSWORD=%STORE_PASSWORD%
    echo MYAPP_RELEASE_KEY_PASSWORD=%KEY_PASSWORD%
    echo.
    echo ⚠️  IMPORTANTE: Nunca subas el keystore al repositorio!
) else (
    echo.
    echo ❌ Error generando keystore
)

echo.
pause
