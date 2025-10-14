#!/bin/bash

echo "========================================"
echo "FamilyDash Web - Deploy Script"
echo "========================================"
echo

echo "1. Iniciando sesión en Firebase..."
firebase login

echo
echo "2. Configurando proyecto..."
firebase use family-dash-15944

echo
echo "3. Desplegando hosting..."
firebase deploy --only hosting

echo
echo "4. ¡Deploy completado!"
echo
echo "URLs disponibles:"
echo "- Landing: https://family-dash-15944.web.app/"
echo "- Verificación: https://family-dash-15944.web.app/verified"
echo
