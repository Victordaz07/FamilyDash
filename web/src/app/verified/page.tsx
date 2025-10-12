"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function VerifiedPage() {
  const [params, setParams] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Obtener parámetros de la URL para debug
    const urlParams = new URLSearchParams(window.location.search);
    const paramsObj: { [key: string]: string } = {};
    urlParams.forEach((value, key) => {
      paramsObj[key] = value;
    });
    setParams(paramsObj);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">
        <div className="glass rounded-3xl p-8 md:p-12 text-center animate-fadeIn">
          {/* Logo */}
          <div className="text-7xl mb-6">🏠</div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
            ¡Correo Verificado!
          </h1>
          
          {/* Description */}
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Tu dirección de correo electrónico ha sido verificada exitosamente con Firebase. 
            ¡Ya puedes acceder a todas las funciones de FamilyDash!
          </p>

          {/* Steps */}
          <div className="bg-white/10 rounded-2xl p-6 mb-8 text-left">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-white/90">Email verificado en Firebase</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                  📱
                </div>
                <div>
                  <p className="text-white/90">Regresa a la aplicación FamilyDash</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  🔄
                </div>
                <div>
                  <p className="text-white/90">Toca "Ya verifiqué — Comprobar"</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white">
                  🎉
                </div>
                <div>
                  <p className="text-white/90">¡Acceso completo a la app!</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/" 
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              🏠 Ir al Inicio
            </Link>
            <a 
              href="mailto:support@familydash.com" 
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all duration-300"
            >
              📧 Soporte
            </a>
          </div>

          {/* Info */}
          <div className="text-center space-y-2">
            <p className="font-bold text-white">FamilyDash</p>
            <p className="text-sm text-white/70">Dashboard familiar integral</p>
            <p className="text-sm text-white/60">Metas • Calendario • Tareas • Seguridad</p>
          </div>

          {/* Debug Info */}
          {Object.keys(params).length > 0 && (
            <div className="mt-8 bg-black/30 rounded-xl p-4 text-left">
              <p className="text-xs font-bold text-white/90 mb-2">Información de Debug:</p>
              <div className="space-y-1 text-xs text-white/70 font-mono">
                <p>URL: {typeof window !== 'undefined' ? window.location.href : ''}</p>
                {Object.entries(params).map(([key, value]) => (
                  <p key={key}>{key}: {value}</p>
                ))}
              </div>
              <p className="text-xs text-white/50 mt-2">Esta información es útil para el soporte técnico</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
