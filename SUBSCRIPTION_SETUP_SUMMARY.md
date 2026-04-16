# Subscription System Setup Summary

## What Was Created

### 1. Database Schema (`src/lib/backend/convex/schema.ts`)
Added a new `subscriptions` table with:
- `user_id`: User identifier
- `plan`: 'free' | 'basic' | 'pro'
- `status`: 'active' | 'expired' | 'cancelled'
- `start_date`: Subscription start timestamp
- `end_date`: Subscription end timestamp
- `payment_method`: Optional (e.g., 'bkash')
- `transaction_id`: Optional payment reference
- `notes`: Optional admin notes

**Indexes created:**
- `by_user`: Lookup subscriptions by user
- `by_status`: Lookup subscriptions by status
- `by_user_status`: Lookup active subscriptions for a user

### 2. Subscription Functions (`src/lib/backend/convex/subscriptions.ts`)

**Public Queries (callable from frontend):**
- `getCurrentSubscription`: Get user's active subscription
- `getAllSubscriptions`: Get all subscriptions for a user (history)
- `canAccessModel`: Check if user can access a specific model
- `getUserPlanInfo`: Get plan info with allowed models

**Admin Mutations (for manual management):**
- `createOrUpdateSubscription`: Create or update a subscription
- `extendSubscription`: Extend an existing subscription
- `cancelSubscription`: Cancel a subscription

**Internal Helper:**
- `_getActiveSubscriptionByUserId`: Internal helper to get subscription

**Model Access Configuration:**
```typescript
Free Plan: [] (no models, users must use own API keys)
Basic Plan (৳500/month): gpt-5-mini, gemini-2.5-flash, deepseek-v3, claude-haiku-4.5
Pro Plan (৳1,000/month): All basic + gpt-5.4, claude-sonnet-4.6, gemini-3.1-pro, gpt-image-1.5, nano-banana
```

### 3. Frontend Utilities (`src/lib/utils/subscription.ts`)

Helper functions for UI:
- `getPlanDisplayName(plan)`: Get display name
- `getPlanPrice(plan)`: Get price in BDT
- `isModelAvailableInPlan(modelId, plan)`: Check model availability
- `getRequiredPlan(modelId)`: Get minimum plan for a model
- `formatSubscriptionEndDate(endDate)`: Format date
- `getDaysRemaining(endDate)`: Calculate days remaining
- `isExpiringSoon(endDate)`: Check if expiring within 7 days
- `getSubscriptionStatusColor(status)`: Get status color for UI
- `getPlanBadgeColor(plan)`: Get plan badge color

### 4. Documentation (`src/lib/backend/convex/SUBSCRIPTIONS.md`)

Complete guide with:
- Plan details and model access
- Database schema
- Manual subscription management instructions
- Frontend usage examples
- Workflow examples

## Next Steps

### 1. Deploy Schema Changes

Run this to push the schema changes to Convex:
```bash
npx convex dev
```

This will create the `subscriptions` table in your database.

### 2. Test Creating a Subscription

Once deployed, test in the Convex dashboard:

```javascript
// Go to Convex Dashboard > Functions
// Run: api.subscriptions.createOrUpdateSubscription

{
  "user_id": "your_test_user_id",  // Get from users table
  "plan": "basic",
  "duration_days": 30,
  "payment_method": "bkash",
  "transaction_id": "TEST123",
  "notes": "Test subscription"
}
```

### 3. Integrate with Frontend

Example usage in a Svelte component:

```svelte
<script lang="ts">
  import { useQuery } from 'convex/react';
  import { api } from '$lib/backend/convex/_generated/api';
  import { getPlanDisplayName, getDaysRemaining } from '$lib/utils/subscription';

  // Get session token from your auth system
  const sessionToken = $sessionCache?.sessionToken;

  // Get subscription info
  const planInfo = useQuery(api.subscriptions.getUserPlanInfo, {
    session_token: sessionToken
  });

  $: daysLeft = planInfo?.end_date ? getDaysRemaining(planInfo.end_date) : 0;
</script>

{#if planInfo}
  <div>
    <h2>Current Plan: {getPlanDisplayName(planInfo.plan)}</h2>
    {#if planInfo.status === 'active'}
      <p>Days remaining: {daysLeft}</p>
    {:else}
      <p>Status: {planInfo.status}</p>
    {/if}
  </div>
{/if}
```

### 4. Manual Payment Workflow

When a user pays:

1. **User sends payment** via bKash to your account
2. **Verify payment** and get transaction ID
3. **Create subscription** in Convex dashboard:
   ```javascript
   api.subscriptions.createOrUpdateSubscription({
     user_id: "user_abc123",
     plan: "basic",  // or "pro"
     duration_days: 30,
     payment_method: "bkash",
     transaction_id: "BKH123456789",
     notes: "Verified payment on 2026-04-16"
   })
   ```
4. **User immediately gets access** to plan models
5. **Auto-expiration** after 30 days

### 5. Model Access Integration

In your chat/model selection logic, check if user can access a model:

```typescript
const canUse = await convex.query(api.subscriptions.canAccessModel, {
  session_token: sessionToken,
  model_id: 'gpt-5.4'
});

if (!canUse) {
  // Show upgrade prompt
}
```

## Important Notes

- Subscriptions automatically expire when `end_date` passes
- Only one active subscription per user
- Creating a new subscription auto-cancels the previous one
- Free tier users can still use the app with their own API keys
- All admin operations are done manually via Convex dashboard
- No automatic payment processing (as requested)

## Files Created/Modified

1. ✅ `src/lib/backend/convex/schema.ts` - Added subscription schema
2. ✅ `src/lib/backend/convex/subscriptions.ts` - Subscription functions
3. ✅ `src/lib/utils/subscription.ts` - Frontend utilities
4. ✅ `src/lib/backend/convex/SUBSCRIPTIONS.md` - Documentation
5. ✅ `SUBSCRIPTION_SETUP_SUMMARY.md` - This file

## Ready to Use!

The subscription system is now ready. Just deploy with `npx convex dev` and start managing subscriptions via the Convex dashboard.
