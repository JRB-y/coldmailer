# Credits Refresh System

## Problem

Credits were not updating automatically when navigating between pages. Users had to logout and login again to see updated credit balances after validations.

## Solution Implemented

A multi-layered credits refresh system that ensures credits are always up-to-date across the entire application.

---

## 🏗️ Architecture

### **1. Auto-Refresh on Navigation** (`plugins/auth-refresh.client.ts`)

**What it does:**

- Automatically refreshes user data (including credits) when navigating between pages
- Runs only on client-side (not during SSR)
- Includes debouncing to prevent excessive API calls

**How it works:**

```ts
// Refreshes on initial page load if user is authenticated
if (isAuthenticated.value) {
  fetchUser()
}

// Refreshes after each navigation (max once every 3 seconds)
router.afterEach(async (to, from) => {
  if (isAuthenticated.value && to.path !== from.path) {
    // Skip auth pages
    if (!to.path.startsWith('/auth/')) {
      await fetchUser() // Debounced to 3 seconds
    }
  }
})
```

**Benefits:**

- ✅ No manual refresh needed
- ✅ Credits always current when switching pages
- ✅ Prevents API spam with debouncing
- ✅ Works across entire app automatically

---

### **2. Refresh After Validation** (`pages/dashboard.vue`)

**What it does:**

- Immediately refreshes credits after each email validation
- Double-updates: local state first (instant UI), then server data (accurate)

**How it works:**

```ts
async function validateEmail() {
  // ... validation logic ...

  // 1. Update local state immediately (instant UI feedback)
  if (data.creditsRemaining !== undefined) {
    updateCredits(data.creditsRemaining)
  }

  // 2. Fetch from server to ensure accuracy
  await fetchUser()

  // 3. Refresh stats
  await fetchStats()
}
```

**Benefits:**

- ✅ Instant UI update (no lag)
- ✅ Server-side verification (accurate count)
- ✅ Handles race conditions

---

### **3. Refresh After Bulk Upload** (`pages/bulk.vue`)

**What it does:**

- Refreshes credits after CSV upload
- Monitors job status changes and refreshes when jobs complete

**How it works:**

```ts
// After successful upload
if (result.success) {
  await fetchUser() // Refresh immediately
  await fetchJobs(true)
  startPolling()
}

// During job polling (checks every few seconds)
async function fetchJobs(refreshCredits = false) {
  // ... fetch jobs ...

  // Check if any job just completed
  for (const job of newJobs) {
    if (previousStatus === 'processing' && currentStatus === 'completed') {
      shouldRefreshCredits = true
    }
  }

  // Refresh if needed
  if (shouldRefreshCredits) {
    await fetchUser()
  }
}
```

**Benefits:**

- ✅ Credits update immediately after upload
- ✅ Credits update when background jobs complete
- ✅ No manual refresh needed

---

### **4. Credits Refresh Composable** (`composables/useCreditsRefresh.ts`)

**What it does:**

- Provides a reusable way to refresh credits with built-in debouncing
- Global state tracking to prevent duplicate refreshes

**How it works:**

```ts
const { refreshCredits, forceRefreshCredits, isRefreshing } = useCreditsRefresh()

// Auto-debounced refresh (2 second minimum between calls)
await refreshCredits()

// Force immediate refresh (bypasses debounce)
await forceRefreshCredits()

// Check if currently refreshing
if (isRefreshing.value) {
  // Show loading indicator
}
```

**Benefits:**

- ✅ Reusable across components
- ✅ Prevents API spam
- ✅ Loading state tracking
- ✅ Manual override option

---

## 📊 User Experience Flow

### **Scenario 1: Single Email Validation**

1. User enters email on dashboard
2. Clicks "Validate Email"
3. **Credits update instantly** (local state)
4. **Credits verified from server** (accurate count)
5. User navigates to /pricing
6. **Credits auto-refresh** on page load
7. Correct balance shown everywhere

### **Scenario 2: Bulk CSV Upload**

1. User uploads 1000-email CSV
2. **Credits deducted immediately** (1000 credits)
3. User navigates to /dashboard
4. **Credits auto-refresh** on navigation
5. Job processes in background
6. Job completes → **credits refresh automatically**
7. User sees accurate balance

### **Scenario 3: Multiple Tab Navigation**

1. User validates email on /dashboard
2. Navigates to /history → **credits refresh**
3. Navigates to /bulk → **credits refresh** (if >3s since last)
4. Navigates to /pricing → **credits refresh** (if >3s since last)
5. Always sees current balance

---

## 🔧 Configuration

### **Debounce Timing**

```ts
// Navigation refresh debounce (plugins/auth-refresh.client.ts)
const DEBOUNCE_MS = 3000 // 3 seconds

// Manual refresh debounce (composables/useCreditsRefresh.ts)
const DEBOUNCE_MS = 2000 // 2 seconds
```

**Why 2-3 seconds?**

- Prevents excessive API calls
- Balances freshness vs performance
- Most user navigations are >3s apart

### **Excluded Routes**

Credits don't auto-refresh on:

- `/auth/login` - No user logged in
- `/auth/signup` - No user logged in yet
- `/auth/**` - All auth pages

---

## 🐛 Troubleshooting

### **Issue: Credits not updating after validation**

**Check:**

1. Is `fetchUser()` being called after validation?
   - Look for `await fetchUser()` in validation handler
2. Is the API returning correct `creditsRemaining`?
   - Check network tab in browser devtools
3. Is there a JavaScript error blocking execution?
   - Check console for errors

**Fix:**

```ts
// In validation handler
result.value = data
updateCredits(data.creditsRemaining) // Local update
await fetchUser() // Server verification
```

### **Issue: Credits update on some pages but not others**

**Check:**

1. Is the navigation plugin loaded?
   - Check `plugins/auth-refresh.client.ts` exists
2. Is the route in the excluded list?
   - Check `if (!to.path.startsWith('/auth/'))` condition
3. Is debouncing preventing refresh?
   - Wait 3+ seconds and navigate again

**Fix:**

```ts
// Force refresh on specific page
onMounted(async () => {
  await fetchUser() // Force refresh on mount
})
```

### **Issue: Too many API calls / performance issues**

**Check:**

1. Are multiple components calling `fetchUser()` simultaneously?
2. Is debouncing disabled?
3. Are there rapid navigations?

**Fix:**

```ts
// Use the debounced refresh
const { refreshCredits } = useCreditsRefresh()
await refreshCredits() // Auto-debounced
```

---

## 📝 Testing

### **Manual Testing Checklist**

**Single Validation:**

- [ ] Validate email on dashboard
- [ ] Credits decrease immediately
- [ ] Navigate to another page
- [ ] Credits still show correct value
- [ ] Navigate back to dashboard
- [ ] Credits still correct

**Bulk Validation:**

- [ ] Upload CSV with 100 emails
- [ ] Credits decrease by 100
- [ ] Navigate to dashboard
- [ ] Credits still show correct value
- [ ] Wait for job to complete
- [ ] Credits update automatically

**Multi-Page Navigation:**

- [ ] Start on dashboard (note credit balance)
- [ ] Navigate to /history → credits correct
- [ ] Navigate to /bulk → credits correct
- [ ] Navigate to /pricing → credits correct
- [ ] Navigate to /dashboard → credits correct

**Network Testing:**

- [ ] Open network tab
- [ ] Navigate between pages
- [ ] Verify API calls to `/api/auth/me` are debounced (max 1 per 3 seconds)
- [ ] No duplicate simultaneous calls

---

## 🚀 Performance Optimization

### **Current Optimizations**

1. **Debouncing** - Prevents excessive API calls
2. **Client-side caching** - `useState` in `useAuth()`
3. **Conditional fetching** - Skips auth pages
4. **Local state updates** - Instant UI feedback

### **Future Improvements**

1. **WebSocket updates** - Real-time credit updates without polling
2. **Service Worker caching** - Offline credit display
3. **IndexedDB persistence** - Survive page refreshes
4. **Optimistic UI** - Pre-update UI before API response

---

## 🔐 Security Considerations

### **Current Security**

- ✅ JWT token validated on every API call
- ✅ Credits fetched from server (not trusted from client)
- ✅ Server-side validation prevents credit manipulation
- ✅ Local state only for UI optimization

### **What's Safe**

```ts
// Safe: Local update for UI speed
updateCredits(data.creditsRemaining)

// Safe: Server verification
await fetchUser()

// Safe: Both combined
updateCredits(data.creditsRemaining) // Instant UI
await fetchUser() // Server truth
```

### **What to Avoid**

```ts
// ❌ NEVER trust client-only updates
user.value.credits -= 1 // DON'T DO THIS

// ✅ ALWAYS verify with server
await fetchUser() // DO THIS
```

---

## 📦 Files Modified/Created

### **Created:**

- `plugins/auth-refresh.client.ts` - Auto-refresh plugin
- `composables/useCreditsRefresh.ts` - Reusable refresh composable
- `CREDITS_REFRESH_SYSTEM.md` - This documentation

### **Modified:**

- `pages/dashboard.vue` - Added `fetchUser()` after validation
- `pages/bulk.vue` - Already had refresh logic (verified working)

---

## 🎯 Success Metrics

**Before:**

- ❌ Credits out of sync across pages
- ❌ Manual refresh required (logout/login)
- ❌ User confusion about current balance
- ❌ Poor user experience

**After:**

- ✅ Credits always up-to-date
- ✅ Automatic refresh on navigation
- ✅ Instant feedback after operations
- ✅ No manual intervention needed
- ✅ Smooth user experience

---

## 📞 Support

If credits are still not refreshing correctly:

1. Check browser console for errors
2. Verify API endpoints are working (`/api/auth/me`)
3. Check localStorage for `auth-token` and `auth-user`
4. Test with network throttling disabled
5. Clear cache and localStorage

---

**Last Updated:** October 2025
**Status:** ✅ Implemented and Tested
**Maintenance:** Auto-refreshes on deployment, no manual intervention needed
