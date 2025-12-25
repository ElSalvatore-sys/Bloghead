# Sentry Error Tracking Setup Guide

## ✅ Verification Status

- **DSN Valid:** ✅ Verified and working
- **Code Implementation:** ✅ Correct
- **Test Events Sent:** ✅ Successfully sent to Sentry

---

## 🔑 DSN Information

**Environment Variable Name:**
```
VITE_SENTRY_DSN
```

**DSN Value:**
```
https://6f04482fe3a3347cca97ffe0e2c127a0@o4509668104470528.ingest.de.sentry.io/4510591312986192
```

**Sentry Dashboard:**
```
https://sentry.io/organizations/eldiaploo/issues/
```

---

## 📋 Vercel Setup Checklist

### Step 1: Open Environment Variables
🔗 https://vercel.com/eldiaploo/bloghead/settings/environment-variables

### Step 2: Delete Old Variable (if exists)
- Look for `VITE_SENTRY_DSN`
- If it exists, click **Delete** to start fresh

### Step 3: Add New Environment Variable

Click **"Add New"** and fill in:

| Field | Value |
|-------|-------|
| **Name** | `VITE_SENTRY_DSN` |
| **Value** | `https://6f04482fe3a3347cca97ffe0e2c127a0@o4509668104470528.ingest.de.sentry.io/4510591312986192` |
| **Production** | ✅ Checked |
| **Preview** | ✅ Checked |
| **Development** | ✅ Checked |

**⚠️ Important:**
- **NO** quotes around the DSN value
- **ALL THREE** environments must be checked

### Step 4: Save
Click **"Save"** button

### Step 5: Force Fresh Redeploy

1. Go to: https://vercel.com/eldiaploo/bloghead/deployments
2. Find the **latest** deployment (top of list)
3. Click **"..."** (three dots)
4. Click **"Redeploy"**
5. **⚠️ CRITICAL:** UNCHECK **"Use existing Build Cache"**
6. Click **"Redeploy"**

### Step 6: Wait for Deployment
⏳ Deployment takes 2-3 minutes

### Step 7: Verify Setup

Run verification script:
```bash
node sentry-test.mjs
```

**Expected output:**
```
📊 Sentry Status: {
  "initialized": true,   ← Must be TRUE
  "hasDSN": true         ← Must be TRUE
}
```

---

## 🔍 Troubleshooting

### Problem: Sentry not initialized after deployment

**Solution 1: Check Environment Variable**
- Variable name must be exactly: `VITE_SENTRY_DSN`
- No typos, no extra spaces

**Solution 2: Force Fresh Build**
- Redeploy with "Use existing Build Cache" **UNCHECKED**
- Build cache can prevent env vars from updating

**Solution 3: Verify All Environments Checked**
- Production: ✅
- Preview: ✅
- Development: ✅

**Solution 4: Check DSN Format**
- No quotes around the value
- Full URL starting with `https://`

### Problem: Sentry errors blocked by Content Security Policy (CSP)

**Symptoms:**
- Console shows: `Fetch API cannot load https://...sentry.io/...`
- Sentry initializes but requests fail
- Browser DevTools Network tab shows blocked requests

**Solution: Update CSP in vercel.json**

The Content Security Policy must allow connections to Sentry. In `vercel.json`, the `connect-src` directive needs:

```json
"connect-src ... https://*.sentry.io"
```

**Full CSP Update (vercel.json line 61):**
Make sure `https://*.sentry.io` is included in the `connect-src` directive.

After updating:
1. Commit and push changes to GitHub
2. Wait for Vercel auto-deployment (2-3 minutes)
3. Verify with: `node verify-sentry-deep.mjs`

### Problem: Still showing initialized: false

**Debug Steps:**
1. Check Vercel deployment logs for `VITE_SENTRY_DSN`
2. Verify environment variable is saved
3. Check if redeploy completed successfully
4. Wait 5 minutes and try again (cache refresh)
5. Check browser console for CSP errors
6. Run `node verify-sentry-deep.mjs` for detailed diagnostics

---

## 📊 What Gets Tracked

### Errors
- ✅ All uncaught JavaScript errors
- ✅ Promise rejections
- ✅ React component errors (via ErrorBoundary)
- ❌ ResizeObserver errors (filtered out)
- ❌ Chunk loading errors (filtered out)

### Performance
- ✅ 10% of page loads
- ✅ Page load times
- ✅ API response times
- ✅ Browser metrics

### Session Replay
- ✅ 10% of normal sessions
- ✅ 100% of error sessions
- ✅ Video playback of user actions
- ✅ Console logs and network requests

---

## 🧪 Testing Sentry

### Local Test (Before Vercel Setup)
```bash
node test-sentry-dsn.mjs
```

### Production Test (After Vercel Setup)
```bash
node sentry-test.mjs
```

### Manual Browser Test
1. Open https://blogyydev.xyz
2. Open browser console (F12)
3. Type: `throw new Error('Test Sentry')`
4. Check Sentry dashboard for the error

---

## 📁 Implementation Files

### Configuration
- `src/lib/sentry.ts` - Sentry initialization
- `src/main.tsx` - Calls `initSentry()`
- `.env.example` - Environment variable template

### Error Handling
- `src/components/ErrorBoundary.tsx` - React error boundary
- Reports errors to Sentry with component stack

### Verification Scripts
- `test-sentry-dsn.mjs` - Validate DSN locally
- `sentry-test.mjs` - Check production status

---

## 🎯 Quick Reference

### DSN Location
Vercel → Bloghead → Settings → Environment Variables

### Variable Name
```
VITE_SENTRY_DSN
```

### Force Redeploy
Vercel → Bloghead → Deployments → ... → Redeploy (no cache)

### Sentry Dashboard
https://sentry.io/organizations/eldiaploo/issues/

---

## ✅ Success Indicators

After successful setup, you should see:

1. **Vercel Dashboard:**
   - `VITE_SENTRY_DSN` visible in environment variables
   - All 3 environments checked (Production, Preview, Development)

2. **Deployment Logs:**
   - Build completes without errors
   - Environment variables loaded

3. **Verification Script:**
   ```
   initialized: true
   hasDSN: true
   ```

4. **Sentry Dashboard:**
   - Test errors appear in Issues
   - Session replays available
   - Performance data being collected

---

## 📝 Notes

- Sentry only initializes in **production** mode (`import.meta.env.PROD`)
- Development mode uses local error handling
- Session replay captures 10% of sessions + 100% of errors
- Performance monitoring samples 10% of transactions
- German Sentry region: `ingest.de.sentry.io`

---

**Last Updated:** December 25, 2024
**Status:** DSN Verified ✅ Ready for Deployment
