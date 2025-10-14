#!/bin/bash
# FamilyDash APK Build Script - Linux/Mac
# Genera APK de producción manualmente

echo "========================================"
echo "   FamilyDash APK Build Script v1.3.0"
echo "========================================"

echo ""
echo "[1/6] Limpiando proyecto..."
./gradlew clean

echo ""
echo "[2/6] Instalando dependencias..."
npm install

echo ""
echo "[3/6] Generando bundle de JavaScript..."
npx expo export --platform android --output-dir android/app/src/main/assets

echo ""
echo "[4/6] Compilando APK de debug..."
./gradlew assembleDebug

echo ""
echo "[5/6] Compilando APK de release..."
./gradlew assembleRelease

echo ""
echo "[6/6] Verificando archivos generados..."
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ APK Debug generado: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Error: APK Debug no encontrado"
fi

if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ APK Release generado: android/app/build/outputs/apk/release/app-release.apk"
else
    echo "❌ Error: APK Release no encontrado"
fi

echo ""
echo "========================================"
echo "   Build completado!"
echo "========================================"
