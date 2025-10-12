# FamilyDash Brand Guidelines

## 🔒 Logo Usage - STRICT RULES

### Master Icon
- **Source**: `assets/icon.png`
- **SHA256**: `ead05b18830ae731e24567f99242384bb8f8e986f5845b06fb82e6c3b26af87e`
- **DO NOT**: Re-draw, reinterpret, convert, or recreate this logo
- **DO**: Use pre-generated PNGs from `web/public/assets/brand/` or `assets/brand/`

### Logo Description
The official FamilyDash logo features:
- Orange gradient background (#FF8A00)
- White shield/house shape in the center
- Three stylized family figures (two adults at top, one child at bottom center)
- Rounded square format with smooth corners
- "FamilyDash" text below the icon (in wordmark version)

### Brand Colors
- **Primary Orange**: `#FF8A00`
- **Contrast Text**: `#041B1B` or `#0B1220` (on orange background)
- **Background White**: `#FFFFFF`
- **Secondary Gradients**: Use sparingly, primary orange is preferred

### File Locations

#### Web (Next.js / Static HTML)
```
web/public/assets/brand/
├── logo-16.png         (favicon, browser tabs)
├── logo-32.png         (favicon, browser tabs)
├── logo-64.png         (small UI elements)
├── logo-128.png        (UI headers)
├── logo-256.png        (main usage, navigation, headers)
├── logo-512.png        (hero sections, large displays)
├── logo-1024.png       (high-res displays, social media)
├── android-chrome-192x192.png
├── android-chrome-512x512.png
├── apple-touch-icon.png (180x180, iOS home screen)
└── favicon.png         (convert to .ico as needed)
```

#### Mobile App (React Native / Expo)
```
assets/brand/
├── icon-1024.png                (iOS/Android app icon)
├── adaptive-foreground-432.png  (Android adaptive icon)
└── logo-256.png                 (in-app UI usage)
```

#### Next.js App Router
```
web/src/app/
└── icon.png            (512x512, Next.js metadata)
```

#### Email Assets
```
web/public/email-assets/
└── hero-verify.png     (verification email hero image)
```

## 🚫 For AI Assistants & Developers

When implementing logo/branding features:

### ✅ DO
1. **ALWAYS** use existing files from `/public/assets/brand/` (web) or `assets/brand/` (app)
2. Reference files by explicit path:
   - Web: `/assets/brand/logo-256.png`
   - React Native: `require('../../assets/brand/logo-256.png')`
3. Use Next.js `<Image>` component for web
4. Use `require()` with Metro bundler for React Native
5. If a new size is needed, scale from existing PNGs using image tools (sharp, Photoshop, etc.)

### ❌ DO NOT
1. **NEVER** generate SVG approximations or recreations
2. **NEVER** ask to "create a logo similar to..."
3. **NEVER** use CSS/Canvas to draw the logo
4. **NEVER** modify colors, proportions, or design elements
5. **NEVER** add effects (shadows, glows, borders) unless explicitly requested
6. **NEVER** use emojis as logo replacements in production code

## 📋 Implementation Checklist

### Web Implementation
- [ ] PWA manifest configured with all icon sizes
- [ ] Next.js metadata includes manifest reference
- [ ] Favicon and apple-touch-icon set in HTML head
- [ ] Navigation uses `/assets/brand/logo-256.png`
- [ ] Hero section uses `/assets/brand/logo-512.png`
- [ ] Footer uses `/assets/brand/logo-256.png`
- [ ] Social media meta tags use `/assets/brand/logo-1024.png`

### Mobile App Implementation
- [ ] `app.json` icon path: `./assets/brand/icon-1024.png`
- [ ] Android adaptiveIcon foregroundImage: `./assets/brand/adaptive-foreground-432.png`
- [ ] Android adaptiveIcon backgroundColor: `#FF8A00`
- [ ] iOS icon path: `./assets/brand/icon-1024.png`
- [ ] All screens use `require('../../assets/brand/logo-256.png')`

### Email Implementation
- [ ] Verification email uses hero image with logo
- [ ] Fallback button uses brand color `#FF8A00`
- [ ] Text contrast meets WCAG AA standards

## 🛠️ Regenerating Brand Assets

If you need to regenerate all brand assets from the master icon:

```bash
node generate-brand-assets.js
```

This script will:
1. Verify the master icon exists at `assets/icon.png`
2. Generate all required sizes for web and mobile
3. Output SHA256 hash for verification
4. Create all directories automatically

**⚠️ Warning**: Only run this if the master icon has been updated. Always verify the SHA256 hash matches.

## 🔐 CI/CD Integration (Optional)

To prevent accidental logo changes, add this to your CI pipeline:

```yaml
name: Brand Guard
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check master icon hash
        run: |
          echo "ead05b18830ae731e24567f99242384bb8f8e986f5845b06fb82e6c3b26af87e  assets/icon.png" > expected.txt
          sha256sum -c expected.txt
```

## 📱 Platform-Specific Notes

### Web (Next.js)
- Use `priority` prop on hero logo for LCP optimization
- Leverage Next.js Image optimization (automatic WebP, sizing)
- PWA manifest should include all icon sizes for add-to-home-screen

### React Native (Expo)
- Use `require()` not URLs for Metro bundler to include assets
- Test Android adaptive icon on different launcher backgrounds
- Ensure iOS icon doesn't have rounded corners (iOS adds them automatically)

### Email
- Always include alt text
- Provide text fallback for image-blocking clients
- Use absolute URLs (e.g., `https://family-dash-15944.web.app/assets/brand/logo-512.png`)

## 🎨 Usage Examples

### Web (Next.js Component)
```tsx
import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="/assets/brand/logo-256.png"
      alt="FamilyDash"
      width={32}
      height={32}
      priority
    />
  );
}
```

### React Native
```tsx
import { Image } from 'react-native';

<Image
  source={require('../../assets/brand/logo-256.png')}
  style={{ width: 32, height: 32 }}
  resizeMode="contain"
/>
```

### Static HTML
```html
<img 
  src="/assets/brand/logo-256.png" 
  alt="FamilyDash" 
  width="32" 
  height="32"
/>
```

## 📞 Questions?

If you need clarification on brand usage, contact the design team or refer to this document.

**Last Updated**: October 12, 2025  
**Version**: 1.0.0

