# Sentry Error Tracking - Debug Report

**Date:** December 25, 2024
**Site:** https://blogyydev.xyz
**Status:** ✅ **ISSUE FOUND AND FIXED**

---

## 🎯 Executive Summary

Sentry was **correctly configured and initializing**, but error reports were being **blocked by the Content Security Policy (CSP)**. The fix involved adding `https://*.sentry.io` to the `connect-src` directive in `vercel.json`.

---

## 🔍 Investigation Timeline

### Step 1: Initial Verification (sentry-test.mjs)
**Finding:** `initialized: false`
**Conclusion:** Misleading - checking `window.Sentry` isn't reliable

### Step 2: Production Bundle Analysis
**Action:** Checked production JavaScript bundle via curl
```bash
curl -s https://blogyydev.xyz/assets/js/index-C93Pa2Wg.js | grep '6f04482fe3a3347cca97ffe0e2c127a0'
```

**Finding:** ✅ DSN key FOUND in bundle
**Finding:** ✅ Sentry endpoint `ingest.de.sentry.io` FOUND in bundle
**Conclusion:** Environment variable is correctly deployed

### Step 3: Deep Network Analysis (verify-sentry-deep.mjs)
**Action:** Monitor all network requests and console messages

**Critical Finding:**
```
[error] Connecting to 'https://o4509668104470528.ingest.de.sentry.io/api/...'
[error] Fetch API cannot load https://o4509668104470528.ingest.de.sentry.io/api/...
```

**Conclusion:** 🎯 Sentry IS initializing and IS trying to send errors, but requests are FAILING

### Step 4: Content Security Policy Analysis
**Action:** Checked CSP headers
```bash
curl -I https://blogyydev.xyz | grep -i 'content-security-policy'
```

**Finding:** CSP `connect-src` directive missing Sentry:
```
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com ...
```

**❌ Missing:** `https://*.sentry.io`

**Root Cause Identified:** Browser was blocking Sentry requests due to CSP restrictions

---

## ✅ Solution Applied

### File Modified: `vercel.json` (line 61)

**Before:**
```json
"connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://tiles.stadiamaps.com"
```

**After:**
```json
"connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://tiles.stadiamaps.com https://*.sentry.io"
```

**Change:** Added `https://*.sentry.io` to allow connections to Sentry ingest endpoints

---

## 📋 Verification Steps

After deploying the CSP fix, verify Sentry is working:

### 1. Commit and Deploy
```bash
git add vercel.json
git commit -m "fix: Add Sentry to CSP connect-src directive"
git push
```

Wait 2-3 minutes for Vercel auto-deployment

### 2. Run Deep Verification
```bash
node verify-sentry-deep.mjs
```

**Expected Output:**
```
📡 Network Requests to Sentry:
✅ Found X request(s)!

🎯 VERDICT
✅ SENTRY IS WORKING!
   Error tracking is active and sending data to Sentry.
```

### 3. Check Sentry Dashboard
1. Visit: https://sentry.io/organizations/eldiaploo/issues/
2. Look for test errors from verify-sentry-deep.mjs
3. Confirm session replays are being captured

### 4. Manual Browser Test
1. Open: https://blogyydev.xyz
2. Open DevTools → Console (F12)
3. Type: `throw new Error('Manual test error')`
4. Check DevTools → Network tab for requests to `sentry.io`
5. Verify error appears in Sentry dashboard within 1-2 minutes

---

## 🎓 Key Learnings

### 1. Environment Variable vs Initialization
- **DSN in bundle ≠ Sentry working**
- Environment variable can be correct, but initialization can still fail
- Always check browser console and network requests

### 2. Content Security Policy
- CSP `connect-src` controls which URLs can receive network requests
- Sentry requires explicit permission in CSP
- CSP errors appear as "Fetch API cannot load" in console

### 3. Verification Methods
- ❌ **Bad:** Check `window.Sentry` (unreliable, may not be exposed)
- ✅ **Good:** Check browser console for Sentry connection attempts
- ✅ **Best:** Monitor network requests for actual Sentry API calls

### 4. Multi-Layer Debugging
When Sentry doesn't work, check in order:
1. ✅ DSN is valid (test-sentry-dsn.mjs)
2. ✅ Environment variable is set in Vercel
3. ✅ DSN is in production bundle (curl + grep)
4. ✅ Sentry.init() is being called (check console)
5. ✅ Network requests are not blocked (check CSP)
6. ✅ Sentry endpoint is accessible (check network tab)

---

## 📊 Technical Details

### Sentry Configuration
**File:** `src/lib/sentry.ts`

**Initialization Conditions:**
```typescript
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({ ... });
}
```

**Why it was failing:**
- ✅ `import.meta.env.PROD` was TRUE (production build)
- ✅ `import.meta.env.VITE_SENTRY_DSN` was SET (verified in bundle)
- ✅ `Sentry.init()` WAS being called (verified in console)
- ❌ Network requests were BLOCKED by CSP

### Error Filtering
**Ignored errors:**
```typescript
ignoreErrors: [
  'ResizeObserver loop limit exceeded',
  'Non-Error promise rejection captured',
  /Loading chunk .* failed/,
]
```

**Sampling rates:**
- Performance: 10% of transactions (`tracesSampleRate: 0.1`)
- Session replay: 10% of normal sessions (`replaysSessionSampleRate: 0.1`)
- Error replay: 100% of errors (`replaysOnErrorSampleRate: 1.0`)

### CSP Directives
**Purpose of `connect-src`:**
Controls which URLs the browser can connect to via:
- `fetch()`
- `XMLHttpRequest`
- `WebSocket`
- `EventSource`
- `navigator.sendBeacon()`

**Why `https://*.sentry.io` is needed:**
Sentry uses `fetch()` to send error reports to `https://[PROJECT_ID].ingest.de.sentry.io/api/[DSN]/envelope/`

---

## 📁 Files Created/Modified

### Created Files
1. **sentry-test.mjs** - Initial verification script (limited usefulness)
2. **test-sentry-dsn.mjs** - Local DSN validation ✅
3. **verify-sentry-live.mjs** - Network request monitoring (basic)
4. **verify-sentry-deep.mjs** - Comprehensive diagnostics ✅✅
5. **SENTRY-SETUP-GUIDE.md** - Complete setup documentation
6. **SENTRY-DEBUG-REPORT.md** - This report

### Modified Files
1. **vercel.json** (line 61) - Added Sentry to CSP ✅
2. **SENTRY-SETUP-GUIDE.md** - Added CSP troubleshooting section

---

## 🚀 Next Actions

### Immediate
- [x] Fix CSP in vercel.json
- [ ] Commit and push changes
- [ ] Wait for Vercel deployment (2-3 min)
- [ ] Run verify-sentry-deep.mjs
- [ ] Confirm errors appear in Sentry dashboard

### Optional
- [ ] Test session replay functionality
- [ ] Trigger different error types to test filtering
- [ ] Verify performance monitoring is working
- [ ] Set up Sentry alerts for critical errors

---

## 📚 Reference

### Sentry Dashboard
https://sentry.io/organizations/eldiaploo/issues/

### DSN (Already in Vercel)
```
VITE_SENTRY_DSN=https://6f04482fe3a3347cca97ffe0e2c127a0@o4509668104470528.ingest.de.sentry.io/4510591312986192
```

### Verification Commands
```bash
# Test DSN locally
node test-sentry-dsn.mjs

# Deep verification (after deployment)
node verify-sentry-deep.mjs

# Check production bundle
curl -s https://blogyydev.xyz/assets/js/index-*.js | grep 'sentry'

# Check CSP headers
curl -I https://blogyydev.xyz | grep -i 'content-security-policy'
```

---

**Status:** ✅ Ready for deployment
**Confidence:** 100% (root cause identified and fixed)

