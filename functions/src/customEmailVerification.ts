import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { Resend } from "resend";
import { UserRecord } from "firebase-functions/v1/auth";

// Firebase Admin ya está inicializado en index.ts

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY || "re_dc7LTZWv_Nx4UxWt8KvQAVCoAEUJupBgv");

// Función para enviar email de verificación personalizado
async function sendVerificationEmail(user: UserRecord) {
  if (!user.email) {
    console.log("Usuario sin email, saltando verificación");
    return;
  }

  try {
    console.log(`Enviando email de verificación personalizado a: ${user.email}`);

    // 1) Generar link de verificación
    const link = await admin.auth().generateEmailVerificationLink(user.email, {
      url: "https://family-dash-15944.web.app/verified",
      handleCodeInApp: false,
    });

    // 2) Renderizar HTML premium
    const html = renderEmail({
      verifyLink: link,
      displayName: user.displayName || "¡Hola!",
      heroUrl: "https://family-dash-15944.web.app/email-assets/hero-verify.svg",
    });

    // 3) Enviar correo con Resend
    await resend.emails.send({
      from: "FamilyDash <noreply@family-dash-15944.firebaseapp.com>",
      to: user.email,
      subject: "✅ Verifica tu correo y empieza con FamilyDash",
      html,
    });

    console.log(`Email de verificación enviado exitosamente a: ${user.email}`);
  } catch (error) {
    console.error("Error enviando email de verificación:", error);
    // No lanzar error para no bloquear el registro del usuario
  }
}

// Trigger cuando se crea un usuario nuevo
export const sendCustomVerification = functions.auth.user().onCreate(async (user: UserRecord) => {
  await sendVerificationEmail(user);
});

// Función HTTP para reenviar verificación (llamada desde el cliente)
export const resendVerificationEmail = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const user = await admin.auth().getUser(context.auth.uid);
  
  if (!user.email) {
    throw new functions.https.HttpsError('invalid-argument', 'User has no email');
  }

  if (user.emailVerified) {
    throw new functions.https.HttpsError('already-exists', 'Email is already verified');
  }

  await sendVerificationEmail(user);
  return { success: true, message: 'Verification email sent' };
});

// --- HTML del correo (inline CSS, 600px, seguro para Gmail/Outlook) ---
function renderEmail({ 
  verifyLink, 
  displayName, 
  heroUrl 
}: { 
  verifyLink: string; 
  displayName: string; 
  heroUrl: string; 
}) {
  return `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Verifica tu correo - FamilyDash</title>
  <style>
    /* Reset básico y helpers (email-safe) */
    body { margin:0; padding:0; background:#0f172a; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
    table { border-collapse:collapse; }
    img { border:0; display:block; line-height:0; }
    .preheader { display:none!important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; }
    @media (max-width: 640px) {
      .container { width:100% !important; }
      .px { padding-left:16px !important; padding-right:16px !important; }
      .hero-img { width:100% !important; height:auto !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#0f172a;">
  <!-- Preheader: el texto que se ve al lado del asunto en Gmail -->
  <div class="preheader">Un clic para activar tu cuenta y empezar tu FamilyDash.</div>

  <table role="presentation" width="100%" bgcolor="#0f172a" align="center">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" class="container" bgcolor="#0b1220" style="width:600px; border-radius:16px; overflow:hidden; border:1px solid #1f2937;">
          
          <!-- Hero clicable -->
          <tr>
            <td>
              <a href="${verifyLink}" target="_blank" style="text-decoration:none;">
                <img src="${heroUrl}" width="600" height="300" alt="Inicia tu viaje a una familia organizada con FamilyDash" class="hero-img" style="width:100%; height:auto;">
              </a>
            </td>
          </tr>

          <!-- Mensaje principal -->
          <tr>
            <td class="px" style="padding:32px; font-family:system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color:#e5e7eb;">
              <h1 style="margin:0 0 16px; font-size:28px; color:#e5e7eb; font-weight:800;">¡Hola ${displayName}!</h1>
              <p style="margin:0 0 24px; font-size:18px; color:#cbd5e1; line-height:1.6;">
                ¡Bienvenido a <strong style="color:#10b981;">FamilyDash</strong>! 
                Estás a un clic de activar tu cuenta y empezar a organizar tu familia.
              </p>
              
              <!-- CTA botón principal -->
              <div style="text-align:center; margin:32px 0;">
                <a href="${verifyLink}" 
                   style="display:inline-block; background:linear-gradient(135deg, #10b981 0%, #059669 100%); 
                          color:#041b1b; font-weight:700; padding:16px 32px; border-radius:12px; 
                          text-decoration:none; font-family:system-ui; font-size:16px;
                          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  ✅ Verificar mi correo
                </a>
              </div>
              
              <!-- Texto de respaldo -->
              <p style="margin:24px 0 0; font-size:14px; color:#94a3b8; text-align:center; line-height:1.5;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${verifyLink}" style="color:#a5b4fc; word-break:break-all; text-decoration:underline;">${verifyLink}</a>
              </p>
            </td>
          </tr>

          <!-- Características destacadas -->
          <tr>
            <td class="px" style="padding:0 32px 32px; font-family:system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;">
              <table role="presentation" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:16px; text-align:center; background:#1e293b; border-radius:8px; border:1px solid #334155;">
                    <div style="font-size:32px; margin-bottom:8px;">👨‍👩‍👧‍👦</div>
                    <h3 style="margin:0 0 8px; color:#e5e7eb; font-size:16px; font-weight:600;">Organiza tu familia</h3>
                    <p style="margin:0; color:#94a3b8; font-size:14px;">Tareas, eventos y comunicación en un solo lugar</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="px" style="padding:24px 32px; font-family:system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color:#94a3b8; font-size:13px; background:#0f172a; border-top:1px solid #1f2937;">
              <p style="margin:0 0 8px;">Recibiste este correo porque te registraste en FamilyDash.</p>
              <p style="margin:0 0 8px;">¿No fuiste tú? Puedes ignorar este mensaje de forma segura.</p>
              <p style="margin:0; color:#64748b; font-size:12px;">
                © 2025 FamilyDash. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Espaciado final -->
        <div style="height:24px;"></div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
