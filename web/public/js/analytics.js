/**
 * 📊 Google Analytics 4 - FamilyDash Web Platform
 * 
 * Este archivo contiene toda la lógica de tracking y eventos personalizados
 * para Google Analytics 4.
 * 
 * Eventos implementados:
 * - verification_landing_view: Usuario llega a página de verificación
 * - cta_click_open_app: Click en botón CTA
 * - signup_start: Usuario inicia registro
 * - signup_complete: Usuario completa registro
 * - app_download_intent: Usuario intenta descargar app
 * - page_view: Vista de página (automático)
 * - scroll: Profundidad de scroll (automático)
 * - click: Clicks salientes (automático)
 */

// ⚠️ REEMPLAZAR con tu ID de medición de GA4
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // TODO: Obtener de GA4 console

/**
 * Inicializar Google Analytics 4
 */
function initGA4() {
  // Verificar si ya está cargado
  if (window.gtag) {
    console.log('✅ GA4 already initialized');
    return;
  }

  // Cargar script de GA4
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Inicializar gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA4_MEASUREMENT_ID, {
    send_page_view: true,
    cookie_flags: 'SameSite=None;Secure',
  });

  console.log('✅ GA4 initialized:', GA4_MEASUREMENT_ID);
}

/**
 * Capturar parámetros UTM de la URL
 */
function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
}

/**
 * Track: Vista de página de verificación
 * Llamar cuando el usuario llega a /verified
 */
function trackVerificationView() {
  if (!window.gtag) return;

  const utmParams = getUTMParams();

  gtag('event', 'verification_landing_view', {
    page_path: window.location.pathname,
    page_location: window.location.href,
    page_title: document.title,
    ...utmParams,
  });

  console.log('📊 Event: verification_landing_view');
}

/**
 * Track: Click en CTA (Call to Action)
 * @param {string} buttonText - Texto del botón clickeado
 * @param {string} destination - A dónde lleva el botón
 */
function trackCTAClick(buttonText, destination = '') {
  if (!window.gtag) return;

  gtag('event', 'cta_click_open_app', {
    button_text: buttonText,
    destination: destination,
    page_location: window.location.href,
    page_path: window.location.pathname,
  });

  console.log('📊 Event: cta_click_open_app', { buttonText, destination });
}

/**
 * Track: Inicio de registro
 * @param {string} method - 'email', 'google', 'apple'
 */
function trackSignupStart(method = 'email') {
  if (!window.gtag) return;

  gtag('event', 'signup_start', {
    method: method,
    page_location: window.location.href,
    page_path: window.location.pathname,
  });

  console.log('📊 Event: signup_start', { method });
}

/**
 * Track: Registro completado
 * @param {string} method - 'email', 'google', 'apple'
 * @param {boolean} emailVerified - Si el email fue verificado
 */
function trackSignupComplete(method = 'email', emailVerified = false) {
  if (!window.gtag) return;

  gtag('event', 'signup_complete', {
    method: method,
    email_verified: emailVerified,
    page_location: window.location.href,
    value: 1, // Valor de conversión
  });

  console.log('📊 Event: signup_complete', { method, emailVerified });
}

/**
 * Track: Intento de descarga de app
 * @param {string} platform - 'ios' or 'android'
 */
function trackAppDownloadIntent(platform) {
  if (!window.gtag) return;

  gtag('event', 'app_download_intent', {
    platform: platform,
    page_location: window.location.href,
    page_path: window.location.pathname,
  });

  console.log('📊 Event: app_download_intent', { platform });
}

/**
 * Track: Click en enlace de navegación
 * @param {string} linkText - Texto del enlace
 * @param {string} destination - URL de destino
 */
function trackNavClick(linkText, destination) {
  if (!window.gtag) return;

  gtag('event', 'navigation_click', {
    link_text: linkText,
    link_url: destination,
    page_location: window.location.href,
  });

  console.log('📊 Event: navigation_click', { linkText, destination });
}

/**
 * Track: Profundidad de scroll
 * Se dispara automáticamente en 25%, 50%, 75%, 90%
 */
function setupScrollTracking() {
  const scrollPercentages = [25, 50, 75, 90];
  const triggered = new Set();

  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    scrollPercentages.forEach((threshold) => {
      if (scrollPercent >= threshold && !triggered.has(threshold)) {
        triggered.add(threshold);

        if (window.gtag) {
          gtag('event', 'scroll', {
            percent_scrolled: threshold,
            page_location: window.location.href,
          });

          console.log(`📊 Event: scroll (${threshold}%)`);
        }
      }
    });
  });
}

/**
 * Track: Tiempo en página
 * Se dispara cuando el usuario sale de la página
 */
function setupTimeOnPageTracking() {
  const startTime = Date.now();

  window.addEventListener('beforeunload', () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000); // segundos

    if (window.gtag && timeSpent > 0) {
      gtag('event', 'time_on_page', {
        value: timeSpent,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });

      console.log('📊 Event: time_on_page', { seconds: timeSpent });
    }
  });
}

/**
 * Track: Error en formulario
 * @param {string} formName - Nombre del formulario
 * @param {string} errorType - Tipo de error
 */
function trackFormError(formName, errorType) {
  if (!window.gtag) return;

  gtag('event', 'form_error', {
    form_name: formName,
    error_type: errorType,
    page_location: window.location.href,
  });

  console.log('📊 Event: form_error', { formName, errorType });
}

/**
 * Track: Búsqueda interna (si se implementa)
 * @param {string} searchTerm - Término de búsqueda
 */
function trackSearch(searchTerm) {
  if (!window.gtag) return;

  gtag('event', 'search', {
    search_term: searchTerm,
    page_location: window.location.href,
  });

  console.log('📊 Event: search', { searchTerm });
}

/**
 * Track: Click en enlace externo
 * @param {string} url - URL del enlace externo
 */
function trackOutboundLink(url) {
  if (!window.gtag) return;

  gtag('event', 'click', {
    event_category: 'outbound',
    event_label: url,
    transport_type: 'beacon',
  });

  console.log('📊 Event: outbound_click', { url });
}

/**
 * Setup automático de tracking de enlaces externos
 */
function setupOutboundLinkTracking() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Detectar enlaces externos
    const isExternal =
      href.startsWith('http') && !href.includes(window.location.hostname);

    if (isExternal) {
      trackOutboundLink(href);
    }
  });
}

/**
 * Inicialización automática cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar GA4
  initGA4();

  // Setup tracking automático
  setupScrollTracking();
  setupTimeOnPageTracking();
  setupOutboundLinkTracking();

  // Track específico para página de verificación
  if (window.location.pathname === '/verified') {
    trackVerificationView();
  }

  // Agregar tracking a todos los botones CTA
  document.querySelectorAll('.btn, .cta-btn, [data-track-cta]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const buttonText = btn.textContent.trim();
      const destination = btn.getAttribute('href') || '';
      trackCTAClick(buttonText, destination);
    });
  });

  console.log('✅ Analytics tracking initialized');
});

// Exportar funciones para uso global
window.FamilyDashAnalytics = {
  trackVerificationView,
  trackCTAClick,
  trackSignupStart,
  trackSignupComplete,
  trackAppDownloadIntent,
  trackNavClick,
  trackFormError,
  trackSearch,
  trackOutboundLink,
};

