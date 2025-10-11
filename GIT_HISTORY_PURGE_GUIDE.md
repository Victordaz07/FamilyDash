# Git History Purge Guide - FamilyDash

**⚠️ WARNING: This is a DESTRUCTIVE operation. Read carefully before proceeding.**

## 🎯 Purpose

Remove all traces of exposed Firebase credentials from Git history to prevent:
- Unauthorized access to Firebase resources
- Data breaches from historical commits
- Security audit findings

## ⚠️ Prerequisites & Warnings

### Before You Start

- [x] **All credentials have been rotated** (Phases 0-1 complete)
- [x] **Team has been notified** of upcoming force push
- [x] **No open PRs** or merge them first
- [x] **Backup created** of current repository
- [x] **Coordination scheduled** with all contributors

### Impact

- ✅ **Removes secrets** from entire Git history
- ❌ **Breaks existing clones** - everyone must re-clone
- ❌ **Invalidates commit hashes** - all SHAs change
- ❌ **Affects all branches** - including feature branches
- ❌ **Breaks links** to specific commits in issues/PRs

## 📋 Files to Purge

Based on security audit, these files contain exposed credentials:

```
src/config/firebase.ts          # Hardcoded Firebase config
firebase-config.env             # Env file with real keys
src/config/firebase.simple.ts   # Simplified config with keys
```

## 🛠️ Method 1: git-filter-repo (Recommended)

### Step 1: Install git-filter-repo

```bash
# macOS
brew install git-filter-repo

# Windows (with Python/pip)
pip install git-filter-repo

# Linux
# Check your package manager or use pip
```

### Step 2: Create Mirror Clone

```bash
# Clone fresh mirror (OUTSIDE your working directory)
cd ~/temp
git clone --mirror https://github.com/Victordaz07/FamilyDash.git FamilyDash-mirror.git
cd FamilyDash-mirror.git
```

### Step 3: Run Filter

```bash
# Remove files from entire history
git filter-repo --invert-paths \
  --path src/config/firebase.ts \
  --path firebase-config.env \
  --path src/config/firebase.simple.ts

# Verify files are gone
git log --all --full-history --oneline -- src/config/firebase.ts
# Should return nothing
```

### Step 4: Force Push

```bash
# ⚠️ POINT OF NO RETURN - This rewrites history on remote
git push --force --all
git push --force --tags

# Verify on GitHub - history should be rewritten
```

### Step 5: Re-clone Everywhere

```bash
# On your machine
cd ~/projects
rm -rf FamilyDash  # Delete old clone
git clone https://github.com/Victordaz07/FamilyDash.git
cd FamilyDash
npm install
```

**Notify all team members to do the same!**

---

## 🛠️ Method 2: BFG Repo-Cleaner (Alternative)

### Step 1: Install BFG

```bash
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
# Or use brew
brew install bfg
```

### Step 2: Create Mirror Clone

```bash
cd ~/temp
git clone --mirror https://github.com/Victordaz07/FamilyDash.git FamilyDash-mirror.git
```

### Step 3: Run BFG

```bash
# Remove specific files
bfg --delete-files firebase.ts FamilyDash-mirror.git
bfg --delete-files firebase-config.env FamilyDash-mirror.git
bfg --delete-files firebase.simple.ts FamilyDash-mirror.git

# Clean up
cd FamilyDash-mirror.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 4: Force Push

```bash
git push --force --all
git push --force --tags
```

---

## 🧪 Verification Steps

### 1. Verify Files Removed from History

```bash
# Search for firebase config in history
git log --all --full-history -- src/config/firebase.ts
# Should return empty

# Search for API keys in entire history
git log --all --full-history -S "AIzaSy"
# Should return empty or only .example files
```

### 2. Verify Current Working Tree

```bash
# These files should still exist (with env vars)
ls src/config/firebase.ts          # ✅ Should exist (new version)
ls .env.example                     # ✅ Should exist

# This file should be gone
ls firebase-config.env              # ❌ Should not exist
```

### 3. Test Build

```bash
# Ensure app still compiles
npm install
npm run build  # or npx tsc --noEmit
```

### 4. GitHub Verification

- Go to: https://github.com/Victordaz07/FamilyDash/commits/main
- Click on oldest commit
- Verify `src/config/firebase.ts` doesn't appear in history

---

## 📋 Post-Purge Checklist

### Immediate (Same Day)

- [ ] Force push completed successfully
- [ ] GitHub history verified clean
- [ ] All credentials rotated (again, for safety)
- [ ] Team notified to re-clone
- [ ] CI/CD pipelines re-triggered and passing

### Team Coordination (24 hours)

- [ ] All developers have re-cloned
- [ ] All CI/CD runners have fresh clones
- [ ] Open PRs recreated from new history
- [ ] Feature branches rebased or recreated

### Verification (1 week)

- [ ] No build issues reported
- [ ] Firebase services operational
- [ ] App Check still enforced
- [ ] No secrets detected in new scans
- [ ] Team confirmed no issues

---

## 🚨 If Something Goes Wrong

### Restore from Backup

If you made a backup before purging:

```bash
# Restore from backup
cd ~/backups
git clone FamilyDash-backup.git FamilyDash-restored
cd FamilyDash-restored

# Force push to restore (only if absolutely necessary)
git push --force --all origin
git push --force --tags origin
```

### Partial Failure

If force push fails:

1. Check remote permissions (need admin)
2. Check protected branches (disable temporarily)
3. Check GitHub Actions (may block force push)

---

## 📊 Expected Results

### Before Purge

```bash
$ git log --all --oneline | wc -l
150  # ~150 commits

$ git grep "AIza" $(git rev-list --all)
# Returns multiple commits with exposed keys
```

### After Purge

```bash
$ git log --all --oneline | wc -l
145  # Fewer commits (some removed)

$ git grep "AIza" $(git rev-list --all)
# Returns only .example files or empty
```

---

## 🔄 Alternative: Fresh Start (Nuclear Option)

If purging is too risky, consider:

1. Create new empty repository
2. Copy current codebase (without .git)
3. Initialize fresh Git history
4. Migrate issues/PRs manually
5. Archive old repository

**This is only recommended if:**
- Repository is relatively new
- Few contributors
- Not many PRs/issues
- Want guaranteed clean slate

---

## 📚 Additional Resources

- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [GitHub: Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Atlassian: Rewriting History](https://www.atlassian.com/git/tutorials/rewriting-history)

---

## ✅ Final Steps After Purge

1. **Update Firebase Console**
   - Verify all old keys are revoked
   - Confirm new keys are active
   - Check App Check metrics

2. **Test Application**
   - Build and run locally
   - Test Firebase connectivity
   - Verify Cloud Functions work
   - Check Analytics/Performance

3. **Documentation**
   - Update this guide with actual results
   - Document any issues encountered
   - Create post-mortem if needed

4. **Security Scan**
   ```bash
   npm run secrets:scan-history
   # Should return clean
   ```

---

**Status:** ⏸️ **READY TO EXECUTE** (requires manual action)  
**Risk Level:** 🔴 **HIGH** (destructive, requires coordination)  
**Estimated Time:** 1-2 hours  
**Coordination Required:** ✅ Yes (all team members)

---

**Last Updated:** October 11, 2025  
**Prepared By:** Security Audit Team  
**Contact:** lighthousestudiolabs@gmail.com

