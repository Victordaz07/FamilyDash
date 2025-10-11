# Security Policy — FamilyDash

## 🔒 Secret Management

### Principles

- **Never commit `.env` files** - Use `.env.example` with placeholder values only
- **Rotate credentials regularly** - At least every 6 months or immediately upon detection of exposure
- **Environment variables** - Variables prefixed with `EXPO_PUBLIC_` are **exposed in client bundles** and are NOT secrets
- **Real security** - Enforced by **Firebase Security Rules**, **App Check**, and **server-side validation** (Cloud Functions)

### Best Practices

1. **Local Development**
   ```bash
   # Copy template
   cp .env.example .env
   
   # Fill in actual values (never commit this file)
   nano .env
   ```

2. **Check for secrets before committing**
   ```bash
   npm run secrets:scan
   ```

3. **Verify no secrets in specific files**
   ```bash
   npm run secrets:scan-staged
   ```

---

## 🛡️ Security Tools & Pipelines

### Local Protection

- **Pre-commit hook** - Lints and formats code automatically
- **Pre-push hook** - Scans for secrets with Gitleaks before pushing
- **Manual scanning** - Run `npm run secrets:scan` anytime

### CI/CD Pipeline

Our GitHub Actions pipeline runs on every push and PR:

- ✅ **ESLint** - Code quality checks
- ✅ **Prettier** - Format validation
- ✅ **Jest** - Unit tests
- ✅ **npm audit** - Dependency vulnerability scanning (high & critical)
- ✅ **Gitleaks** - Secret detection in commits
- ✅ **TypeScript** - Compilation check

See `.github/workflows/ci.yml` for details.

---

## 🚨 Incident Response

### If a Secret is Exposed

1. **Immediate Action** (within 1 hour)
   - Rotate the affected credential immediately
   - Revoke the old key in the service provider's console
   - Update `.env.example` if needed

2. **Git History Cleanup** (within 24 hours)
   ```bash
   # Clone a fresh mirror
   git clone --mirror <repo-url> repo-mirror.git
   cd repo-mirror.git
   
   # Remove file from history
   git filter-repo --invert-paths --path path/to/secret/file
   
   # Force push (WARNING: requires team coordination)
   git push --force --all
   ```

3. **Post-Incident** (within 1 week)
   - Create brief post-mortem document
   - Update `.gitleaks.toml` if new pattern needed
   - Notify team to re-clone repository
   - Verify all systems operational with new credentials

### If a Vulnerability is Found

1. **Security Advisory** - Open a GitHub Security Advisory (private)
2. **Assess Impact** - Determine severity (CVSS score)
3. **Develop Fix** - Create patch on private branch
4. **Release** - Deploy fix and publish advisory
5. **Notify Users** - If applicable, inform affected users

---

## 🔐 Firebase Security Layers

Our security is multi-layered:

### 1. Environment Variables
- Firebase config loaded from `process.env.EXPO_PUBLIC_*`
- No hardcoded credentials in source code

### 2. Firestore Security Rules
- Membership-based access control
- Role-based permissions (parent/admin/child)
- Default deny-all for undefined collections
- See `firestore.rules` for implementation

### 3. Cloud Functions Validation
- Server-side input validation
- Rate limiting (15-min sliding window)
- Family membership verification
- XSS/injection prevention
- See `functions/src/index.ts`

### 4. Secure Storage
- Encrypted storage with `expo-secure-store` (native)
- Fallback to AsyncStorage (web only)
- PII-free logging in production
- See `src/utils/secureStorage.ts`

### 5. App Check (Phase 8)
- Play Integrity API (Android)
- App Attest / DeviceCheck (iOS)
- Prevents abuse from non-authentic clients
- See `PHASE_8_SETUP_GUIDE.md`

---

## 📊 Security Monitoring

### Metrics We Track

- **Firebase App Check** - Verification success rate
- **Cloud Functions** - Rate limit triggers
- **Firestore** - Denied request count
- **Sentry** - Error rates and crash reports
- **GitHub Actions** - CI pipeline pass/fail rate

### Alerts

- Gitleaks failures in CI (immediate email)
- npm audit critical vulnerabilities (daily digest)
- Sentry error threshold exceeded (real-time)
- Firebase quota approaching limits (weekly)

---

## 🧪 Security Testing

### Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] No linter errors (`npm run lint`)
- [ ] No secrets detected (`npm run secrets:scan`)
- [ ] Security audit clean (`npm audit --audit-level=high`)
- [ ] Firestore rules tested (see `FIRESTORE_RULES_TEST.md`)
- [ ] Cloud Functions deployed and tested

### Manual Security Review

Perform quarterly:

1. Review Firebase Security Rules for overly permissive access
2. Audit Cloud Functions for new vulnerabilities
3. Check for dependency updates with security patches
4. Verify rate limiting effectiveness
5. Test App Check enforcement
6. Review Sentry errors for security-related issues

---

## 📝 Secure Development Guidelines

### For Developers

1. **Never log sensitive data**
   ```typescript
   // ❌ BAD
   console.log('User:', user.email, user.password);
   
   // ✅ GOOD
   secureLog('User login attempt');
   ```

2. **Always sanitize user input**
   ```typescript
   // ✅ GOOD (automatic in RealDatabaseService)
   const sanitized = sanitizeObject(userInput);
   await db.createDocument('collection', sanitized);
   ```

3. **Use secure storage for sensitive data**
   ```typescript
   // ❌ BAD
   AsyncStorage.setItem('token', authToken);
   
   // ✅ GOOD
   SecureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
   ```

4. **Validate on server-side**
   ```typescript
   // ✅ GOOD - Use Cloud Functions for critical operations
   const result = await createTaskServer({ familyId, title });
   ```

### For Code Reviewers

- [ ] No hardcoded credentials or API keys
- [ ] User input sanitized before storage
- [ ] Sensitive operations use Cloud Functions
- [ ] Error messages don't leak system information
- [ ] Proper authentication checks in place

---

## 🆘 Contact & Reporting

### Security Vulnerabilities

- **GitHub Security Advisory** - Preferred method (private disclosure)
  - https://github.com/Victordaz07/FamilyDash/security/advisories
- **Email** - lighthousestudiolabs@gmail.com
- **Response Time** - Within 48 hours for critical issues

### Bug Bounty

Currently, we do not have a formal bug bounty program. However, we greatly appreciate responsible disclosure and will acknowledge contributors in our release notes.

---

## 📚 Additional Resources

- [Firestore Rules Testing Guide](./FIRESTORE_RULES_TEST.md)
- [Phase 8 Setup (App Check)](./PHASE_8_SETUP_GUIDE.md)
- [Security Audit Report](./SECURITY_AUDIT_FINAL_REPORT.md)
- [Cloud Functions README](./functions/README.md)

---

## 📜 Version History

- **v1.4.0** (October 2025) - Comprehensive security audit (Phases 0-9)
  - Environment variable migration
  - Encrypted storage implementation
  - Firestore rules membership model
  - Cloud Functions with rate limiting
  - CI/CD with secret scanning
  - Global error boundary and Sentry
  - Performance optimizations
  - App Check configuration
  - Git history purge policy

---

**Last Updated:** October 11, 2025  
**Security Contact:** lighthousestudiolabs@gmail.com  
**Response SLA:** 48 hours for critical issues

