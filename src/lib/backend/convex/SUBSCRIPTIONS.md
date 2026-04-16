# Subscription System Documentation

## Overview

The subscription system manages user access to different AI models based on their subscription plan.

## Subscription Plans

### Free Plan
- No subscription required
- Users must provide their own API keys
- No models included

### Basic Plan (৳500/month)
- GPT-5 mini
- Gemini 2.5 Flash
- DeepSeek V3
- Claude Haiku 4.5

### Pro Plan (৳1,000/month)
- All Basic models
- GPT-5.4
- Claude Sonnet 4.6
- Gemini 3.1 Pro
- GPT Image 1.5
- Nano banana

## Database Schema

### subscriptions table
```typescript
{
  user_id: string;           // User identifier
  plan: 'free' | 'basic' | 'pro';
  status: 'active' | 'expired' | 'cancelled';
  start_date: number;        // Unix timestamp (ms)
  end_date: number;          // Unix timestamp (ms)
  payment_method?: string;   // e.g., 'bkash', 'manual'
  transaction_id?: string;   // Payment transaction ID
  notes?: string;            // Admin notes
}
```

## Manual Subscription Management

Since payments are handled manually, here's how to manage subscriptions via Convex dashboard:

### 1. Create a New Subscription

When a user pays, create a subscription in the Convex dashboard:

```javascript
// In Convex dashboard, run this mutation:
api.subscriptions.createOrUpdateSubscription({
  user_id: "user_123456",        // Get from users table
  plan: "basic",                 // or "pro"
  duration_days: 30,             // 30 days for monthly
  payment_method: "bkash",
  transaction_id: "TXN123456",
  notes: "Manual payment verified"
})
```

### 2. Extend an Existing Subscription

To extend a subscription:

```javascript
api.subscriptions.extendSubscription({
  user_id: "user_123456",
  additional_days: 30,
  payment_method: "bkash",
  transaction_id: "TXN789012",
  notes: "Subscription renewed"
})
```

### 3. Cancel a Subscription

To cancel a subscription:

```javascript
api.subscriptions.cancelSubscription({
  user_id: "user_123456",
  notes: "User requested cancellation"
})
```

## Frontend Usage

### Check User's Current Subscription

```typescript
import { useQuery } from 'convex/react';
import { api } from '$lib/backend/convex/_generated/api';

const subscription = useQuery(api.subscriptions.getCurrentSubscription, {
  session_token: sessionToken
});

// subscription will be null if no active subscription
// or return: { plan: 'basic', status: 'active', start_date: ..., end_date: ... }
```

### Get User Plan Info (with allowed models)

```typescript
const planInfo = useQuery(api.subscriptions.getUserPlanInfo, {
  session_token: sessionToken
});

// Returns:
// {
//   plan: 'basic' | 'pro' | 'free',
//   status: 'active' | 'expired' | 'cancelled',
//   allowed_models: ['gpt-5-mini', 'gemini-2.5-flash', ...],
//   start_date?: number,
//   end_date?: number
// }
```

### Check if User Can Access a Specific Model

```typescript
const canAccess = useQuery(api.subscriptions.canAccessModel, {
  session_token: sessionToken,
  model_id: 'gpt-5.4'
});

// Returns: true or false
```

### View Subscription History

```typescript
const allSubscriptions = useQuery(api.subscriptions.getAllSubscriptions, {
  session_token: sessionToken
});

// Returns array of all subscriptions (active, expired, cancelled)
```

## Automatic Expiration

Subscriptions are automatically marked as expired when:
- `end_date < current time`
- User tries to access their subscription

The system checks expiration on each `getCurrentSubscription` call and updates the status if needed.

## Adding New Models

To add new models to a plan, edit `PLAN_MODELS` in `subscriptions.ts`:

```typescript
const PLAN_MODELS = {
  free: [],
  basic: [
    'gpt-5-mini',
    'gemini-2.5-flash',
    'deepseek-v3',
    'claude-haiku-4.5',
    'new-model-id', // Add here
  ],
  pro: [
    // ... all basic models
    'gpt-5.4',
    'claude-sonnet-4.6',
    // ...
    'new-pro-model', // Add here
  ],
};
```

## Example Workflow

1. **User Pays via bKash**: User transfers ৳500 to your bKash account
2. **Verify Payment**: Check bKash transaction and get transaction ID
3. **Create Subscription**: Run mutation in Convex dashboard:
   ```javascript
   api.subscriptions.createOrUpdateSubscription({
     user_id: "user_abc123",
     plan: "basic",
     duration_days: 30,
     payment_method: "bkash",
     transaction_id: "BKH123456789",
     notes: "Verified payment on 2026-04-16"
   })
   ```
4. **User Gets Access**: User can now use Basic plan models for 30 days
5. **Auto Expiration**: After 30 days, subscription automatically expires
6. **Renewal**: When user pays again, extend or create new subscription

## Notes

- All dates are stored as Unix timestamps in milliseconds
- The system doesn't handle automatic renewals (manual payment only)
- One user can only have one active subscription at a time
- Creating a new subscription automatically cancels the previous active one
- Free tier users can still use the app with their own API keys
