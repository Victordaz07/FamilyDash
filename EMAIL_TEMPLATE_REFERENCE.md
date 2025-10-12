# FamilyDash Email Templates Reference

## Verification Email Template

### Overview
Professional verification email using the exact FamilyDash brand assets and colors.

### Key Features
- Clickable hero image with logo
- Fallback CTA button for email clients blocking images
- Brand-consistent colors (#FF8A00 primary)
- Responsive design
- WCAG AA compliant contrast ratios

### HTML Template

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu correo - FamilyDash</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Hero Image (Clickable) -->
          <tr>
            <td style="padding: 0;">
              <a href="{{VERIFY_LINK}}" target="_blank" style="display: block; text-decoration: none;">
                <img 
                  src="https://family-dash-15944.web.app/email-assets/hero-verify.png" 
                  alt="Inicia tu viaje a una familia organizada con FamilyDash" 
                  style="width: 100%; max-width: 600px; height: auto; display: block; border-radius: 16px 16px 0 0;"
                />
              </a>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827; text-align: center;">
                ¡Bienvenido a FamilyDash!
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center;">
                Estás a un paso de organizar tu familia de manera inteligente. 
                Haz clic en el botón de abajo para verificar tu correo electrónico y comenzar.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a 
                      href="{{VERIFY_LINK}}" 
                      target="_blank" 
                      style="display: inline-block; background: #FF8A00; color: #0B1220; font-weight: 700; font-size: 16px; padding: 16px 40px; border-radius: 12px; text-decoration: none; text-align: center;"
                    >
                      ✅ Verificar mi correo
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; line-height: 1.6; color: #9ca3af; text-align: center; word-break: break-all;">
                <a href="{{VERIFY_LINK}}" style="color: #FF8A00; text-decoration: underline;">{{VERIFY_LINK}}</a>
              </p>
            </td>
          </tr>

          <!-- Features -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 12px; padding: 24px;">
                <tr>
                  <td style="padding: 0;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #111827; text-align: center;">
                      ¿Qué puedes hacer con FamilyDash?
                    </p>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #4b5563;">
                          🎯 Establecer metas familiares
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #4b5563;">
                          📅 Calendario familiar compartido
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #4b5563;">
                          📝 Gestión de tareas y responsabilidades
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #4b5563;">
                          🛡️ Safe Room para expresar emociones
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 40px 32px 40px; text-align: center;">
              <img 
                src="https://family-dash-15944.web.app/assets/brand/logo-256.png" 
                alt="FamilyDash" 
                style="width: 40px; height: 40px; margin-bottom: 12px;"
              />
              <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">
                FamilyDash
              </p>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
                Dashboard familiar integral
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © 2025 FamilyDash. Todos los derechos reservados.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                <a href="https://family-dash-15944.web.app/privacy" style="color: #FF8A00; text-decoration: none;">Privacidad</a> • 
                <a href="https://family-dash-15944.web.app/terms" style="color: #FF8A00; text-decoration: none;">Términos</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Template Variables

Replace these placeholders when sending:

- `{{VERIFY_LINK}}` - The unique verification URL generated by Firebase Auth or your backend

### Integration with Firebase Functions

If using Firebase Functions with a custom email service (Resend, SendGrid, etc.):

```typescript
import * as functions from 'firebase-functions';
import { Resend } from 'resend';

const resend = new Resend(functions.config().resend.api_key);

export const sendVerificationEmail = functions.auth.user().onCreate(async (user) => {
  const verificationLink = await admin.auth().generateEmailVerificationLink(user.email!);
  
  const htmlTemplate = `
    <!-- Insert the HTML template above -->
  `.replace(/{{VERIFY_LINK}}/g, verificationLink);

  await resend.emails.send({
    from: 'FamilyDash <noreply@familydash.app>',
    to: user.email!,
    subject: 'Verifica tu correo - FamilyDash',
    html: htmlTemplate,
  });
});
```

### Testing Checklist

- [ ] Test on Gmail (web & mobile)
- [ ] Test on Outlook (web & desktop)
- [ ] Test on Apple Mail (macOS & iOS)
- [ ] Test with images blocked
- [ ] Test link clickability (hero image + button)
- [ ] Verify contrast ratios (use WebAIM or similar)
- [ ] Test on dark mode email clients
- [ ] Verify all links use HTTPS
- [ ] Check spam score (use Mail Tester)

### Brand Assets Used

- **Hero Image**: `web/public/email-assets/hero-verify.png`
- **Footer Logo**: `web/public/assets/brand/logo-256.png`
- **Primary Color**: `#FF8A00`
- **Contrast Text**: `#0B1220`

### Accessibility

- Alt text on all images
- WCAG AA compliant contrast (4.5:1 minimum)
- Semantic HTML tables for layout
- Text fallback for image-blocking clients
- Descriptive link text

### Mobile Optimization

- Responsive table layout
- Touch-friendly button size (minimum 44x44 CSS pixels)
- Readable font sizes (minimum 16px for body text)
- Proper viewport meta tag
- No fixed widths that break on small screens

## Other Email Templates

### Welcome Email (Post-Verification)
- Onboarding tips
- Feature highlights
- Quick start guide

### Password Reset
- Security information
- Reset link with expiration notice
- Alternative contact methods

### Family Invitation
- Invitation details
- Family name and admin info
- Accept/Decline actions

### Premium Upgrade (Future)
- Feature comparison
- Pricing details
- CTA to upgrade

---

**Last Updated**: October 12, 2025  
**Version**: 1.0.0

