/**
 * 🎨 Scroll Animations & Micro-interactions - FamilyDash Web Platform
 * 
 * Este archivo contiene todas las animaciones y efectos visuales
 * que se activan con scroll, hover, y otras interacciones del usuario.
 */

// Configuración global
const ANIMATION_CONFIG = {
  threshold: 0.1, // 10% del elemento visible
  rootMargin: '0px',
  animationDelay: 100, // ms entre elementos
};

/**
 * Inicializar Intersection Observer para animaciones de scroll
 */
function initScrollAnimations() {
  // Crear observer para elementos que aparecen al hacer scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Agregar delay basado en el índice para efecto cascada
        setTimeout(() => {
          entry.target.classList.add('animate-in');
        }, index * ANIMATION_CONFIG.animationDelay);
        
        // Dejar de observar después de animar (one-time animation)
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: ANIMATION_CONFIG.threshold,
    rootMargin: ANIMATION_CONFIG.rootMargin,
  });

  // Observar todos los elementos con clase 'animate-on-scroll'
  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
  });

  console.log('✨ Scroll animations initialized');
}

/**
 * Animación de contadores numéricos
 */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  
  const observerOptions = {
    threshold: 0.5,
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString();
          }
        };

        updateCounter();
        counterObserver.unobserve(counter);
      }
    });
  }, observerOptions);

  counters.forEach((counter) => {
    counterObserver.observe(counter);
  });

  console.log('🔢 Counter animations initialized');
}

/**
 * Parallax effect para elementos específicos
 */
function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  if (parallaxElements.length === 0) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.5;
      const yPos = -(scrolled * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
  });

  console.log('🌊 Parallax effect initialized');
}

/**
 * Efecto de reveal para imágenes
 */
function initImageReveal() {
  const images = document.querySelectorAll('.reveal-image');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        imageObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
  });

  images.forEach((img) => {
    imageObserver.observe(img);
  });

  console.log('🖼️ Image reveal initialized');
}

/**
 * Efecto de typing para texto
 */
function initTypingEffect() {
  const typingElements = document.querySelectorAll('[data-typing]');
  
  typingElements.forEach((element) => {
    const text = element.textContent;
    const speed = parseInt(element.getAttribute('data-typing-speed')) || 50;
    element.textContent = '';
    element.style.opacity = '1';

    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      }
    };

    // Iniciar cuando el elemento sea visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typeWriter();
          observer.unobserve(element);
        }
      });
    });

    observer.observe(element);
  });

  console.log('⌨️ Typing effect initialized');
}

/**
 * Efecto de progress bar animado
 */
function initProgressBars() {
  const progressBars = document.querySelectorAll('.progress-bar[data-progress]');
  
  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const progress = parseInt(bar.getAttribute('data-progress'));
        
        setTimeout(() => {
          bar.style.width = `${progress}%`;
        }, 200);

        progressObserver.unobserve(bar);
      }
    });
  }, {
    threshold: 0.5,
  });

  progressBars.forEach((bar) => {
    progressObserver.observe(bar);
  });

  console.log('📊 Progress bars initialized');
}

/**
 * Smooth scroll para anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      // Ignorar enlaces que no son a secciones
      if (href === '#' || href === '#!') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const headerOffset = 80; // Altura del header fijo
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  console.log('🎯 Smooth scroll initialized');
}

/**
 * Efecto de cursor personalizado (opcional, solo desktop)
 */
function initCustomCursor() {
  if (window.innerWidth < 768) return; // Solo en desktop

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  const cursorFollower = document.createElement('div');
  cursorFollower.className = 'custom-cursor-follower';
  document.body.appendChild(cursorFollower);

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  // Smooth follower con delay
  setInterval(() => {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
  }, 16);

  // Expandir cursor en hover de botones
  document.querySelectorAll('a, button, .btn').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
      cursorFollower.classList.add('cursor-hover');
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
      cursorFollower.classList.remove('cursor-hover');
    });
  });

  console.log('🖱️ Custom cursor initialized');
}

/**
 * Ripple effect en clicks
 */
function initRippleEffect() {
  document.querySelectorAll('.btn, .card, .badge').forEach((element) => {
    element.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });

  console.log('💧 Ripple effect initialized');
}

/**
 * Shake animation para errores
 */
function shakeElement(element) {
  element.classList.add('shake');
  setTimeout(() => {
    element.classList.remove('shake');
  }, 500);
}

/**
 * Pulse animation para llamar atención
 */
function pulseElement(element, times = 3) {
  let count = 0;
  const interval = setInterval(() => {
    element.classList.toggle('pulse');
    count++;
    if (count >= times * 2) {
      clearInterval(interval);
      element.classList.remove('pulse');
    }
  }, 300);
}

/**
 * Stagger animation para listas
 */
function staggerAnimation(parentSelector, childSelector, delay = 100) {
  const parent = document.querySelector(parentSelector);
  if (!parent) return;

  const children = parent.querySelectorAll(childSelector);
  children.forEach((child, index) => {
    setTimeout(() => {
      child.classList.add('animate-in');
    }, index * delay);
  });
}

/**
 * Inicialización automática
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar todas las animaciones
  initScrollAnimations();
  animateCounters();
  initParallax();
  initImageReveal();
  initTypingEffect();
  initProgressBars();
  initSmoothScroll();
  initRippleEffect();
  
  // Custom cursor solo en desktop y si está habilitado
  if (window.innerWidth > 768 && document.body.hasAttribute('data-custom-cursor')) {
    initCustomCursor();
  }

  console.log('✅ All animations initialized');
});

// Exportar funciones útiles
window.FamilyDashAnimations = {
  shakeElement,
  pulseElement,
  staggerAnimation,
  initScrollAnimations,
  animateCounters,
};

// Agregar estilos CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
  /* Animaciones de entrada */
  .animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  /* Reveal de imágenes */
  .reveal-image {
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }

  .reveal-image.revealed {
    opacity: 1;
    transform: scale(1);
  }

  /* Progress bars */
  .progress-bar {
    width: 0;
    transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Shake animation */
  .shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }

  @keyframes shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(4px); }
    30%, 50%, 70% { transform: translateX(-8px); }
    40%, 60% { transform: translateX(8px); }
  }

  /* Pulse animation */
  .pulse {
    animation: pulse 0.6s ease-in-out;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  /* Ripple effect */
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  /* Custom cursor */
  .custom-cursor,
  .custom-cursor-follower {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 10000;
    mix-blend-mode: difference;
  }

  .custom-cursor {
    width: 10px;
    height: 10px;
    background: white;
    transform: translate(-50%, -50%);
  }

  .custom-cursor-follower {
    width: 40px;
    height: 40px;
    border: 2px solid white;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s;
  }

  .custom-cursor.cursor-hover,
  .custom-cursor-follower.cursor-hover {
    width: 60px;
    height: 60px;
  }

  /* Estilos para elementos animados */
  [data-parallax] {
    will-change: transform;
  }

  .btn, .card, .badge {
    position: relative;
    overflow: hidden;
  }
`;
document.head.appendChild(style);

