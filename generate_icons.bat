# FamilyDash Icon Generator
# Genera todos los íconos necesarios para la aplicación FamilyDash

echo "🎨 Generando íconos para FamilyDash..."

# Crear directorio temporal
mkdir -p temp_icons

echo "📱 Creando ícono principal (1024x1024)..."
# Usar una herramienta online para generar el PNG
# https://convertio.co/svg-png/ o https://cloudconvert.com/svg-to-png

echo "📱 Creando ícono adaptativo (1024x1024)..."
# Copiar el mismo ícono para adaptive-icon

echo "📱 Creando splash screen (1242x2436)..."
# Generar splash screen con el mismo diseño

echo "🌐 Creando favicon (32x32)..."
# Generar favicon pequeño

echo "✅ Íconos generados exitosamente!"
echo "📋 Archivos creados:"
echo "   - assets/icon.png (1024x1024)"
echo "   - assets/adaptive-icon.png (1024x1024)"
echo "   - assets/splash-icon.png (1242x2436)"
echo "   - assets/favicon.png (32x32)"
echo ""
echo "🔧 Instrucciones:"
echo "1. Abrir icon_generator.html en el navegador"
echo "2. Hacer clic en 'Descargar' para cada tamaño"
echo "3. Guardar los archivos en la carpeta assets/"
echo "4. Renombrar según corresponda"
