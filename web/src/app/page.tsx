"use client";

import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: "🎯",
      title: "Family Goals",
      description: "Establece y sigue metas familiares con hitos, progreso visual y motivación compartida.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "📅",
      title: "Calendar Hub",
      description: "Calendario familiar completo con eventos, recordatorios y sincronización en tiempo real.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🛡️",
      title: "Safe Room",
      description: "Espacio seguro para expresar emociones, mensajes de voz y reflexiones familiares.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "📝",
      title: "Task Management",
      description: "Gestión inteligente de tareas con roles, recompensas y seguimiento de progreso.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: "👥",
      title: "Family Roles",
      description: "Sistema de roles y permisos para cada miembro de la familia con diferentes niveles de acceso.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: "🏆",
      title: "Achievements",
      description: "Sistema de logros y reconocimientos para motivar y celebrar los éxitos familiares.",
      color: "from-yellow-500 to-orange-500"
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center animate-fadeIn">
          <div className="text-8xl mb-8">🏠</div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
            FamilyDash
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            El dashboard familiar integral que necesitas: metas compartidas, calendario familiar, 
            gestión de tareas, Safe Room emocional y mucho más.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/verified" 
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              ✅ Verificación de Correo
            </Link>
            <a 
              href="#features" 
              className="px-8 py-4 rounded-2xl glass text-white font-bold text-lg hover:bg-white/20 transition-all duration-300"
            >
              🚀 Ver Características
            </a>
          </div>
          <div className="mt-12 flex flex-wrap gap-4 justify-center text-sm text-white/70">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              100% Gratis
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Código Abierto
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Privacidad Total
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Características Principales
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Todo lo que necesitas para organizar y fortalecer tu familia en una sola aplicación
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass rounded-3xl p-8 hover:scale-105 transition-transform duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-6xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.description}</p>
                <div className={`mt-6 h-1 rounded-full bg-gradient-to-r ${feature.color}`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center glass rounded-3xl p-8">
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                100+
              </div>
              <div className="text-white/80">Familias Activas</div>
            </div>
            <div className="text-center glass rounded-3xl p-8">
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                1000+
              </div>
              <div className="text-white/80">Metas Alcanzadas</div>
            </div>
            <div className="text-center glass rounded-3xl p-8">
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                5000+
              </div>
              <div className="text-white/80">Tareas Completadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para organizar tu familia?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Únete a cientos de familias que ya están usando FamilyDash para mejorar su comunicación y organización.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/verified" 
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              🚀 Comenzar Ahora
            </Link>
            <a 
              href="mailto:support@familydash.com" 
              className="px-8 py-4 rounded-2xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all duration-300"
            >
              📧 Contactar Soporte
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">🏠 FamilyDash</h3>
              <p className="text-white/70">
                Dashboard familiar integral para organizar y fortalecer tu familia.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
                <li><Link href="/verified" className="hover:text-white transition-colors">Verificación</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Características</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contacto</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="mailto:support@familydash.com" className="hover:text-white transition-colors">Soporte</a></li>
                <li><a href="mailto:info@familydash.com" className="hover:text-white transition-colors">Info</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-white/60">
            <p>&copy; 2024 FamilyDash. Dashboard familiar integral.</p>
            <p className="mt-2">Metas • Calendario • Tareas • Seguridad • Emociones</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
