# Script para generar íconos de FamilyDash
# Ejecutar este script para crear todos los tamaños necesarios

echo "🎨 Generando íconos para FamilyDash..."

# Crear directorio temporal
mkdir -p temp_icons

echo "📱 Creando ícono principal (1024x1024)..."
# Nota: Necesitarás una herramienta como Inkscape o ImageMagick para convertir SVG a PNG
# inkscape --export-png=assets/icon.png --export-width=1024 --export-height=1024 assets/icon.svg

echo "📱 Creando ícono adaptativo (1024x1024)..."
# inkscape --export-png=assets/adaptive-icon.png --export-width=1024 --export-height=1024 assets/icon.svg

echo "📱 Creando splash screen (1242x2436)..."
# inkscape --export-png=assets/splash-icon.png --export-width=1242 --export-height=2436 assets/icon.svg

echo "🌐 Creando favicon (32x32)..."
# inkscape --export-png=assets/favicon.png --export-width=32 --export-height=32 assets/icon.svg

echo "✅ Íconos generados exitosamente!"
echo "📋 Archivos creados:"
echo "   - assets/icon.png (1024x1024)"
echo "   - assets/adaptive-icon.png (1024x1024)"
echo "   - assets/splash-icon.png (1242x2436)"
echo "   - assets/favicon.png (32x32)"
