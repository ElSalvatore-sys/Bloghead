# Bloghead OAuth & Onboarding Debugging Documentation

**Date:** December 19, 2025
**Duration:** ~6 hours
**Status:** ✅ RESOLVED

---

## 📋 Executive Summary

Fixed Google OAuth authentication flow that was failing on first attempt but working on retry. Root causes were:
1. PKCE code verifier stored on wrong domain (www vs non-www)
2. Double PKCE code exchange (Supabase auto + manual)
3. Vercel deployment configuration issues
4. Database trigger not setting correct user_type

---

## 🔴 Problems Encountered

### Problem 1: OAuth Fails on First Try, Works on Retry

**Symptoms:**
- User clicks "Mit Google anmelden"
- First attempt fails with error: `invalid request: both auth code and code verifier should be non-empty`
- Clicking "Try again" works

**Root Cause:**
- PKCE code verifier was stored in localStorage on `blogyydev.xyz`
- Google OAuth redirected to `www.blogyydev.xyz`
- Different domains = different localStorage = code verifier not found

**Solution:**
- Configured Vercel domain settings:
  - `blogyydev.xyz` → Production (primary)
  - `www.blogyydev.xyz` → 301 redirect to non-www
- Added 4-layer redirect defense in code

---

### Problem 2: Double PKCE Code Exchange

**Symptoms:**
```
POST https://...supabase.co/auth/v1/token?grant_type=pkce 400 (Bad Request)
AuthApiError: invalid request: both auth code and code verifier should be non-empty
```

**Root Cause:**
- Supabase client configured with `detectSessionInUrl: true`
- This auto-exchanges the PKCE code when client initializes
- AuthCallbackPage was ALSO trying to exchange the same code manually
- Second exchange fails because code was already used

**Solution:**
Rewrote `AuthCallbackPage.tsx` to NOT manually exchange:
```typescript
// OLD (broken) - Manual exchange
const { data, error } = await supabase.auth.exchangeCodeForSession(code);

// NEW (fixed) - Just poll for session
const { data: { session } } = await supabase.auth.getSession();
```

---

### Problem 3: New Users Not Getting Onboarding Modal

**Symptoms:**
- New OAuth users created but skip onboarding
- Redirected directly to dashboard
- `user_type` was not `community`

**Root Cause:**
- Database trigger `handle_new_user` was setting wrong `user_type`
- Used English column names (`first_name`) instead of German (`vorname`)

**Solution:**
Updated trigger to:
- ALWAYS set `user_type = 'community'` for new users
- Use correct German column names
- ON CONFLICT does NOT update user_type (only onboarding can change it)

---

### Problem 4: Vercel Not Deploying New Code

**Symptoms:**
- Code pushed to GitHub
- Vercel shows "Ready" deployments
- But old file hashes served (`AuthCallbackPage-DQE9E5Ig.js`)
- New hashes never appeared (`AuthCallbackPage-Wft1chKN.js`)

**Root Causes:**
1. Vercel project not connected to GitHub properly
2. Root Directory not set to `frontend`
3. Node.js version set to 24.x (invalid, max is 22.x)
4. Build cache corrupted

**Solution:**
Fixed Vercel Dashboard settings:
- **Root Directory:** `frontend`
- **Node.js Version:** `22.x`
- **Build Command:** `npm run build`
- Created Deploy Hook for manual triggers
- Redeployed with "Clear Build Cache"

---

## 🔧 All Fixes Applied

### 1. Vercel Domain Configuration

```
Domains:
├── blogyydev.xyz          → Production (Primary)
└── www.blogyydev.xyz      → 301 Redirect to blogyydev.xyz
```

### 2. Vercel Project Settings

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Node.js Version | `22.x` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 3. 4-Layer www→non-www Redirect

| Layer | File | Purpose |
|-------|------|---------|
| 1 | `vercel.json` | Server-side 301 redirect |
| 2 | `index.html` | Immediate JS redirect in `<head>` |
| 3 | `supabase.ts` | Client initialization redirect |
| 4 | `AuthCallbackPage.tsx` | Backup during OAuth callback |

### 4. Database Trigger Fix

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.users (
    id, email, membername, vorname, nachname,
    user_type,  -- ALWAYS 'community' for new users!
    ...
  ) VALUES (
    NEW.id, NEW.email, ...,
    'community',  -- Hardcoded!
    ...
  )
  ON CONFLICT (id) DO UPDATE SET
    -- user_type NOT updated here!
    -- Only onboarding modal can change it
    ...
  ;
  RETURN NEW;
END;
$;
```

### 5. AuthCallbackPage Rewrite

**Key Change:** Don't manually exchange PKCE code

```typescript
// supabase.ts - detectSessionInUrl handles the exchange
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,  // Auto-exchanges PKCE code
    flowType: 'pkce',
    storageKey: 'bloghead-auth',
  },
});

// AuthCallbackPage.tsx - Just poll for session
const handleCallback = async () => {
  console.log('[AuthCallback] Starting... (v2 - no manual exchange)');
  console.log('[AuthCallback] Waiting for Supabase to process session...');

  // Poll for session (Supabase auto-exchanged the code)
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // Check user_type for onboarding
    const { data: profile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', session.user.id)
      .maybeSingle();

    const needsOnboarding = !profile?.user_type ||
                            profile.user_type === 'community';

    if (needsOnboarding) {
      navigate('/?onboarding=true', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }
};
```

---

## 📊 Supabase Configuration

### Authentication → URL Configuration

| Setting | Value |
|---------|-------|
| Site URL | `https://blogyydev.xyz` (NO www!) |

### Redirect URLs (9 total)

```
https://blogyydev.xyz
https://blogyydev.xyz/**
https://blogyydev.xyz/auth/callback
http://localhost:5173
http://localhost:5173/**
http://localhost:5173/auth/callback
http://localhost:5174
http://localhost:5174/**
http://localhost:5174/auth/callback
```

### Google Cloud Console OAuth 2.0

| Setting | Value |
|---------|-------|
| Authorized JavaScript Origins | `https://blogyydev.xyz`, `http://localhost:5173`, `http://localhost:5174` |
| Authorized Redirect URI | `https://yyplbhrqtaeyzmcxpfli.supabase.co/auth/v1/callback` |

**Important:** Only ONE redirect URI pointing to Supabase, NOT to your app directly!

---

## 📁 Files Modified

### Core Auth Files

| File | Changes |
|------|---------|
| `src/pages/AuthCallbackPage.tsx` | Complete rewrite - poll for session, don't exchange |
| `src/lib/supabase.ts` | Added getOAuthRedirectUrl(), environment-aware config |
| `src/pages/HomePage.tsx` | Onboarding modal logic with pendingOnboardingRef |
| `src/contexts/AuthContext.tsx` | Retry logic, timeout protection |
| `src/components/auth/LoginModal.tsx` | Use getOAuthRedirectUrl() |
| `src/components/auth/RegisterModal.tsx` | Use getOAuthRedirectUrl() |
| `src/components/auth/OnboardingModal.tsx` | 4 role selection options |

### Configuration Files

| File | Changes |
|------|---------|
| `frontend/vercel.json` | www→non-www redirect rules |
| `frontend/index.html` | Immediate redirect script |

### Database

| Migration | Purpose |
|-----------|---------|
| `fix_handle_new_user_trigger.sql` | Always set user_type='community' |
| `add_user_delete_cascade_trigger.sql` | Cascade delete from auth.users to public.users |

---

## 🎯 Complete OAuth Flow (After Fix)

```
1. User clicks "Mit Google anmelden" on blogyydev.xyz
                    ↓
2. Supabase initiates OAuth with Google
   - Stores PKCE code verifier in localStorage
                    ↓
3. Google OAuth screen → User signs in
                    ↓
4. Google redirects to:
   https://yyplbhrqtaeyzmcxpfli.supabase.co/auth/v1/callback
                    ↓
5. Supabase processes OAuth, redirects to:
   https://blogyydev.xyz/auth/callback?code=xxx
                    ↓
6. If www.blogyydev.xyz → Instant redirect to non-www
                    ↓
7. Supabase client initializes with detectSessionInUrl:true
   - Auto-exchanges PKCE code (internally)
   - Creates session
                    ↓
8. AuthCallbackPage polls for session
   - Finds session, checks user_type
                    ↓
9. user_type = 'community' → Redirect to /?onboarding=true
                    ↓
10. HomePage detects ?onboarding=true
    - Shows OnboardingModal
                    ↓
11. User selects role (Fan/Künstler/Dienstleister/Veranstalter)
    - Updates user_type in database
                    ↓
12. Redirect to appropriate dashboard
                    ↓
13. Future logins: user_type ≠ 'community' → Direct to dashboard
```

---

## 🐛 Debugging Tips

### Console Logs to Watch

**Good (v2 code):**
```
[AuthCallback] Starting... (v2 - no manual exchange)
[AuthCallback] Waiting for Supabase to process session (detectSessionInUrl: true)...
[AuthCallback] Checking for session (attempt 1)...
[AuthCallback] Session found: user@email.com
[AuthCallback] user_type: community | needsOnboarding: true
[AuthCallback] → Redirecting to onboarding
```

**Bad (old code):**
```
[AuthCallback] Found PKCE code, exchanging...  ← WRONG!
[AuthCallback] Code exchange error: both auth code and code verifier should be non-empty
```

### Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `code verifier should be non-empty` | www/non-www mismatch | Check Vercel domain config |
| `PGRST116` | User in auth.users but not public.users | Trigger failed, check column names |
| Profile fetch timeout | RLS policy blocking or user missing | Check public.users table |
| Old code still running | Vercel caching | Redeploy with "Clear Build Cache" |

---

## 🔑 API Keys Still Needed

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxx
supabase secrets set TWILIO_PHONE_NUMBER=+49xxxxx
```

---

## 📈 Key Commits

| Commit | Description |
|--------|-------------|
| `c2e78d1` | fix: Auth callback email confirmation |
| `8a8ee11` | fix: OAuth callback PKCE handling |
| `b104e06` | feat: OAuth onboarding flow |
| `d4f3316` | fix: Complete OAuth flow overhaul for production |
| `751116d` | fix: Ensure onboarding modal shows for community users |
| `3804238` | fix: OAuth first-try failure - www vs non-www domain issue |
| `4f55ce2` | fix: CRITICAL - Force onboarding modal for community users |
| `4949d5b` | fix: NUCLEAR FORCE DEPLOY - new AuthCallbackPage hash |
| `abb9a83` | fix: add explicit installCommand to vercel.json |

---

## ✅ Verification Checklist

- [x] www.blogyydev.xyz redirects to blogyydev.xyz
- [x] OAuth first attempt works (no retry needed)
- [x] New users get user_type = 'community'
- [x] Onboarding modal shows for new users
- [x] User can select role (Fan/Künstler/Dienstleister/Veranstalter)
- [x] Role saved to database
- [x] Redirect to appropriate dashboard after role selection
- [x] Subsequent logins skip onboarding

---

## 📝 Lessons Learned

1. **Always check domain consistency** - www vs non-www can break OAuth PKCE flow
2. **Don't double-exchange PKCE codes** - Let Supabase handle it with `detectSessionInUrl: true`
3. **Verify Vercel deployments** - Check file hashes in Network tab, not just "Ready" status
4. **Set Root Directory** - Monorepo projects need explicit frontend folder config
5. **Database columns matter** - German vs English column names (`vorname` vs `first_name`)
6. **Build cache can lie** - Always redeploy with "Clear Build Cache" when debugging

---

## 🚀 Ready for Phase 5!

Bloghead Phase 4 OAuth is complete and working. Ready to continue with:
- iOS app with SwiftUI
- Additional features
- Production launch preparation

---

*Documentation created: December 19, 2025*
*Author: Claude + Ali*
