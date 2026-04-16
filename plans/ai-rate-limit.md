# AI Rate Limiting Implementation Plan

## Overview
This document outlines the technical implementation plan for enforcing AI model usage rate limits based on subscription plans (Starter and Pro) as defined in `src/lib/config.ts`.

## Rate Limit Requirements

### Starter Plan (500 BDT/month)
- **Overall Limits:**
  - 100 chats/day, 1000 chats/month
  - 10 images/day, 50 images/month

- **Per-Model Limits (Chat):**
  - GPT-5.4 Nano: 100/day, 1000/month
  - GPT-5.4 Mini: 50/day, 200/month
  - Gemini 3.1 Flash Lite: 100/day, 1000/month
  - Gemini 3.0 Flash: 50/day, 300/month
  - Claude Haiku 4.5: 50/day, 150/month
  - DeepSeek V3.2: 100/day, 1000/month
  - Kimi K2.5: 100/day, 1000/month

- **Per-Model Limits (Image):**
  - GPT Image 1 Mini: 10/day, 50/month

### Pro Plan (1000 BDT/month)
- **Overall Limits:**
  - 300 chats/day, 3000 chats/month
  - 25 images/day, 100 images/month

- **Per-Model Limits (Chat):**
  - Standard models: 100-500/day
  - Premium models (GPT-5.4, Sonnet 4.6, Gemini 3.1 Pro): 25/day, 50/month
  - Budget models (DeepSeek, Kimi): 500/day, 5000/month

- **Per-Model Limits (Image):**
  - Various limits per model (8-400/month, 10-25/day)

## Technical Architecture

### 1. Database Schema Design

#### Usage Tracking Table/Collection
```typescript
// Convex schema addition to schema.ts
usageTracking: defineTable({
  userId: v.id("users"),
  planType: v.string(), // "starter" | "pro"

  // Period tracking
  currentDay: v.string(), // ISO date format "2026-04-16"
  currentMonth: v.string(), // "2026-04"

  // Overall counters
  dailyChatCount: v.number(),
  monthlyChatCount: v.number(),
  dailyImageCount: v.number(),
  monthlyImageCount: v.number(),

  // Per-model counters (JSON object)
  modelUsage: v.object({
    // Structure: { "modelId": { daily: number, monthly: number } }
    // Example: { "gpt-5.4-nano": { daily: 45, monthly: 320 } }
  }),

  // Timestamps
  lastResetDaily: v.number(),
  lastResetMonthly: v.number(),
  updatedAt: v.number(),
})
.index("by_user", ["userId"])
.index("by_user_and_day", ["userId", "currentDay"])
.index("by_user_and_month", ["userId", "currentMonth"])
```

#### Request Log Table (Optional, for analytics)
```typescript
requestLog: defineTable({
  userId: v.id("users"),
  modelId: v.string(),
  modelType: v.string(), // "chat" | "image"
  planType: v.string(),

  // Token/usage tracking
  inputTokens: v.optional(v.number()),
  outputTokens: v.optional(v.number()),
  imageCount: v.optional(v.number()),

  // Cost tracking
  estimatedCost: v.number(), // in BDT paisa

  // Metadata
  timestamp: v.number(),
  conversationId: v.optional(v.id("conversations")),
  success: v.boolean(),
  errorReason: v.optional(v.string()),
})
.index("by_user", ["userId"])
.index("by_user_and_date", ["userId", "timestamp"])
.index("by_model", ["modelId"])
```

### 2. Rate Limit Enforcement Logic

#### Core Functions (Convex mutations/queries)

```typescript
// convex/rate_limiter.ts

/**
 * Check if user can make a request
 * Returns: { allowed: boolean, reason?: string, remainingDaily?: number, remainingMonthly?: number }
 */
export const checkRateLimit = query({
  args: {
    userId: v.id("users"),
    modelId: v.string(),
    modelType: v.string(), // "chat" | "image"
  },
  handler: async (ctx, args) => {
    // 1. Get user's subscription plan
    // 2. Get current usage tracking record
    // 3. Reset counters if day/month has changed
    // 4. Check overall limits (daily/monthly)
    // 5. Check per-model limits (daily/monthly)
    // 6. Return result
  }
});

/**
 * Increment usage counters after successful request
 */
export const incrementUsage = mutation({
  args: {
    userId: v.id("users"),
    modelId: v.string(),
    modelType: v.string(),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    imageCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Get or create usage tracking record
    // 2. Reset counters if needed (day/month rollover)
    // 3. Increment overall counters
    // 4. Increment per-model counters
    // 5. Optionally log to requestLog
    // 6. Return updated usage stats
  }
});

/**
 * Get current usage statistics for user
 */
export const getUsageStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Return current usage vs limits for display in UI
  }
});

/**
 * Reset daily counters (can be called by cron job)
 */
export const resetDailyCounters = mutation({
  args: {},
  handler: async (ctx) => {
    // Find all records where currentDay != today
    // Reset dailyChatCount, dailyImageCount, modelUsage daily counts
    // Update currentDay, lastResetDaily
  }
});

/**
 * Reset monthly counters (can be called by cron job)
 */
export const resetMonthlyCounters = mutation({
  args: {},
  handler: async (ctx) => {
    // Find all records where currentMonth != current month
    // Reset monthlyChatCount, monthlyImageCount, modelUsage monthly counts
    // Update currentMonth, lastResetMonthly
  }
});
```

### 3. Integration Points

#### A. Chat API Endpoint
```typescript
// src/routes/api/chat/+server.ts (or wherever chat API is)

export async function POST({ request, locals }) {
  const user = locals.user;
  const { modelId, messages } = await request.json();

  // 1. Check rate limit BEFORE making API call
  const rateLimitCheck = await convex.query(api.rate_limiter.checkRateLimit, {
    userId: user._id,
    modelId,
    modelType: "chat"
  });

  if (!rateLimitCheck.allowed) {
    return json({
      error: "Rate limit exceeded",
      reason: rateLimitCheck.reason,
      remainingDaily: rateLimitCheck.remainingDaily,
      remainingMonthly: rateLimitCheck.remainingMonthly
    }, { status: 429 });
  }

  // 2. Make API call to AI provider
  const response = await callAIProvider(modelId, messages);

  // 3. Increment usage counters AFTER successful response
  await convex.mutation(api.rate_limiter.incrementUsage, {
    userId: user._id,
    modelId,
    modelType: "chat",
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens
  });

  // 4. Return response
  return json(response);
}
```

#### B. Image Generation API Endpoint
```typescript
// Similar pattern for image generation endpoint
// Check limit -> Generate image -> Increment counter
```

#### C. Frontend Integration
```typescript
// Before sending chat request, optionally check usage
// Display usage stats in UI (e.g., "45/100 messages today")
// Show upgrade prompts when approaching limits
```

### 4. Counter Reset Strategy

#### Lazy Reset (Recommended)
- Check and reset counters on each request
- Compare `currentDay`/`currentMonth` with actual current date
- Reset if mismatch detected
- **Pros:** Simple, no cron jobs needed, immediate consistency
- **Cons:** Small overhead on each request (minimal)

```typescript
function shouldResetDaily(record: UsageTracking): boolean {
  const today = new Date().toISOString().split('T')[0]; // "2026-04-16"
  return record.currentDay !== today;
}

function shouldResetMonthly(record: UsageTracking): boolean {
  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-04"
  return record.currentMonth !== currentMonth;
}
```

### 5. Plan Configuration Loading

```typescript
// src/lib/utils/rate-limit-config.ts
import { PLANS } from '$lib/config';

export function getPlanLimits(planType: 'starter' | 'pro') {
  return PLANS[planType];
}

export function getModelLimit(
  planType: 'starter' | 'pro',
  modelId: string,
  modelType: 'chat' | 'image'
) {
  const plan = PLANS[planType];
  const model = plan.models[modelType].find(m => m.id === modelId);

  return {
    dailyLimit: model?.dailyLimit,
    monthlyLimit: model?.monthlyLimit,
    exists: !!model
  };
}
```

### 6. Edge Cases & Considerations

#### A. Plan Changes = not needed
#### B. Timezone Handling = not needed
#### C. Concurrent Requests
- Use Convex transactions to prevent race conditions
#### D. Free Tier / Trial Users = not needed
#### E. Cost Tracking
- Track actual token usage for cost analysis
- Compare against plan pricing
- Generate monthly usage reports

### 7. Implementation Steps

#### Phase 1: Schema & Core Logic
1. Add `usageTracking` table to Convex schema
2. Implement `checkRateLimit` query
3. Implement `incrementUsage` mutation
4. Implement lazy reset logic
5. Write unit tests for rate limit logic

#### Phase 2: API Integration
1. Integrate rate limit check in chat API endpoint
2. Integrate rate limit check in image API endpoint
3. Add error handling for rate limit exceeded
4. Test with various scenarios

#### Phase 3: UI Integration
1. Create usage stats display component
2. Show current usage vs limits on account page
3. Display rate limit errors gracefully in chat
4. Add upgrade prompts when approaching limits

#### Phase 4: Monitoring & Analytics
1. Add `requestLog` table for detailed tracking
2. Create admin dashboard for usage monitoring
3. Set up alerts for unusual usage patterns
4. Generate usage reports for billing

#### Phase 5: Testing & Optimization
1. Load testing with concurrent requests
2. Test counter reset at day/month boundaries
3. Test plan upgrade/downgrade scenarios
4. Optimize query performance with proper indexes

## Success Metrics

- Rate limiting blocks requests when limits exceeded
- Counters reset correctly at day/month boundaries
- No race conditions under concurrent load
- API response time impact < 50ms
- Users can view current usage easily
- Analytics show usage patterns per plan

## Future Enhancements

1. **Burst Allowance:** Allow short bursts above limit if monthly quota available
2. **Rollover Credits:** Unused quota rolls over to next period (with cap)
3. **Usage Predictions:** Warn users before hitting limits
4. **Model Recommendations:** Suggest cheaper models when approaching limits
5. **Pay-as-you-go:** Option to pay for extra usage beyond plan limits
6. **Team Plans:** Share quota across team members
7. **Usage Analytics:** Detailed breakdowns by model, time of day, etc.
