# How to Create a Subscription

## Quick Start

1. **Get a User ID**
   - Go to Convex Dashboard: https://dashboard.convex.dev/d/fiery-crow-782
   - Navigate to "Data" → "user" table (or your auth users table)
   - Copy a user's `_id` field (something like `"j97abc123def456"`)

2. **Create a Test Subscription**
   - In Convex Dashboard, go to "Functions"
   - Find `subscriptions:createOrUpdateSubscription`
   - Click "Run Function"
   - Use these arguments:

```json
{
  "user_id": "PASTE_USER_ID_HERE",
  "plan": "basic",
  "duration_days": 30,
  "payment_method": "bkash",
  "transaction_id": "TEST123456",
  "notes": "Test subscription created"
}
```

For Pro plan:
```json
{
  "user_id": "PASTE_USER_ID_HERE",
  "plan": "pro",
  "duration_days": 30,
  "payment_method": "bkash",
  "transaction_id": "TEST123456",
  "notes": "Test pro subscription created"
}
```

3. **Verify It Worked**
   - Go to "Data" → "subscriptions" table
   - You should see your new subscription with:
     - `status: "active"`
     - `plan: "basic"` or `"pro"`
     - `end_date` 30 days from now

## Real Payment Workflow

When a user pays via bKash:

1. User sends payment with email in reference
2. You verify the bKash transaction
3. Get the user_id from your auth table (match by email)
4. Create subscription in Convex Dashboard with:
   ```json
   {
     "user_id": "actual_user_id",
     "plan": "basic",
     "duration_days": 30,
     "payment_method": "bkash",
     "transaction_id": "BKASH_TXN_ID",
     "notes": "Verified payment on 2026-04-16 from email@example.com"
   }
   ```

## Testing the Frontend

After creating a test subscription:

1. Log in as that user
2. Go to `/select-plan` - you should NOT see it (active users skip this)
3. Check subscription status in your app
4. Try accessing premium models

## Expiring Subscriptions

Subscriptions auto-expire when `end_date` passes. To manually expire:

1. Wait 30 days (or modify `end_date` in the database to be in the past)
2. Or call `subscriptions:cancelSubscription`:
   ```json
   {
     "user_id": "user_id_here",
     "notes": "Manual cancellation for testing"
   }
   ```

## Common Commands

**Extend subscription by 30 days:**
```json
{
  "user_id": "user_id_here",
  "additional_days": 30,
  "payment_method": "bkash",
  "transaction_id": "RENEWAL_TXN_ID",
  "notes": "Subscription renewed"
}
```

**Check all subscriptions for a user:**
Use `subscriptions:getAllSubscriptions` with their session_token

## Troubleshooting

**"No user found"**: Make sure the user_id exists in your auth table

**"Subscription table is empty"**: This is normal for a new setup - create your first subscription using the steps above

**Frontend not showing subscription**: Clear browser cache and reload, or check browser console for errors
