# Subscription Flow Guide

## Overview

The subscription flow guides users through selecting and subscribing to a plan with bKash payment.

## Flow Structure

### 1. `/select-plan` - Plan Selection Page
- Displays both Basic (৳500) and Pro (৳1,000) plans side-by-side
- Shows all included models for each plan
- Highlights Pro plan as "Most Popular"
- Users click "Select Plan" to proceed

### 2. `/select-plan/[plan]` - Payment Instructions Page
Shows step-by-step bKash payment instructions:

**Step 1:** Open bKash app → "Send Money"
**Step 2:** Send ৳500 (Basic) or ৳1,000 (Pro) to `01309055097`
**Step 3:** Add user's email in reference field
**Step 4:** Wait for manual verification (few hours)

**Support:** WhatsApp contact for delays or questions: `01309055097`

## Components Created

### Pages
- `/routes/select-plan/+page.svelte` - Plan selection
- `/routes/select-plan/[plan]/+page.svelte` - Payment instructions
- `/routes/select-plan/[plan]/+page.ts` - Plan validation

### Components
- `subscription-guard.svelte` - Guard to redirect users without active subscription
- `subscription-status.svelte` - Display current subscription status (updated)
- `upgrade-prompt.svelte` - Prompt to upgrade (updated)

### Updates Made
- **pricing-section.svelte**: Buttons now link to `/select-plan/basic` and `/select-plan/pro`
- **subscription-status.svelte**: "Upgrade" button links to `/select-plan`
- **upgrade-prompt.svelte**: "View Plans" links to `/select-plan`

## Using the Subscription Guard

To protect a route that requires an active subscription:

```svelte
<script>
  import { SubscriptionGuard } from '$lib/components/subscription';
</script>

<SubscriptionGuard>
  <!-- Your protected content here -->
  <YourComponent />
</SubscriptionGuard>
```

For routes requiring a specific plan:

```svelte
<SubscriptionGuard requiredPlan="pro">
  <!-- Only Pro users can see this -->
</SubscriptionGuard>
```

## User Journey

### New User Without Subscription
1. User tries to access premium feature
2. SubscriptionGuard redirects to `/select-plan`
3. User selects a plan (Basic or Pro)
4. Redirected to `/select-plan/[plan]` with payment instructions
5. User pays via bKash with email in reference
6. Admin verifies payment and creates subscription in Convex
7. User receives email confirmation
8. User can now access premium models

### User with Expired Subscription
1. User sees "Expired" status in subscription component
2. Clicks "Renew Subscription"
3. Redirected to `/select-plan`
4. Follows payment flow as above

## Payment Numbers

**bKash Number:** `01309055097`
**WhatsApp Support:** `01309055097`

## Features

- **Copy to clipboard** for bKash number and user email
- **Plan validation** to prevent invalid plan URLs
- **Clear step-by-step** visual guide
- **WhatsApp support** for delays
- **Email notification** mention for activation

## Next Steps

1. **Test the Flow**:
   - Visit `/select-plan`
   - Select a plan
   - Review payment instructions

2. **Add to Protected Routes**:
   ```svelte
   import { SubscriptionGuard } from '$lib/components/subscription';

   <SubscriptionGuard>
     <ChatInterface />
   </SubscriptionGuard>
   ```

3. **Customize if Needed**:
   - Update bKash number in `/select-plan/[plan]/+page.svelte`
   - Modify plan details in `/select-plan/+page.svelte`
   - Adjust styling to match your design

## Files Created/Modified

**New Files:**
- ✅ `src/routes/select-plan/+page.svelte`
- ✅ `src/routes/select-plan/[plan]/+page.svelte`
- ✅ `src/routes/select-plan/[plan]/+page.ts`
- ✅ `src/lib/components/subscription/subscription-guard.svelte`
- ✅ `SUBSCRIPTION_FLOW_GUIDE.md`

**Modified Files:**
- ✅ `src/lib/components/marketing/pricing-section.svelte`
- ✅ `src/lib/components/subscription/subscription-status.svelte`
- ✅ `src/lib/components/subscription/upgrade-prompt.svelte`
- ✅ `src/lib/components/subscription/index.ts`

All ready to use! 🎉
