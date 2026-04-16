export const PLANS = {
    free: {
        name: "Free",
        price: 0,
        currency: "BDT",
        billing: "monthly",
        totalDailyChatLimit: 10,
        totalMonthlyChatLimit: 100,
        totalDailyImageLimit: 1,
        totalMonthlyImageLimit: 10,
        models: [
            {
                id: "OpenAI: gpt-oss-120b",
                name: "openai/gpt-oss-120b:free",
                type: "chat",
                provider: "OpenAI",
                inputCost: 0.20,
                outputCost: 1.25,
                dailyLimit: 10,
                monthlyLimit: 100,
                tags: ["fast", "free"]
            },
        ]
    },
    basic: {
        name: "Basic",
        price: 500,
        currency: "BDT",
        billing: "monthly",
        totalDailyChatLimit: 100,
        totalMonthlyChatLimit: 1000,
        totalDailyImageLimit: 10,
        totalMonthlyImageLimit: 50,
        models: [
            {
                id: "gpt-5.4-nano",
                name: "GPT-5.4 Nano",
                type: "chat",
                provider: "OpenAI",
                inputCost: 0.20,
                outputCost: 1.25,
                dailyLimit: 100,
                monthlyLimit: 1000,
                tags: ["fastest", "cheapest"]
            },
            {
                id: "gpt-5.4-mini",
                name: "GPT-5.4 Mini",
                type: "chat",
                provider: "OpenAI",
                inputCost: 0.75,
                outputCost: 4.50,
                dailyLimit: 50,
                monthlyLimit: 200,
                tags: ["fast", "balanced"]
            },
            {
                id: "gemini-3.1-flash-lite-preview",
                name: "Gemini 3.1 Flash Lite",
                type: "chat",
                provider: "Google",
                inputCost: 0.25,
                outputCost: 1.50,
                dailyLimit: 100,
                monthlyLimit: 1000,
                tags: ["fast", "low cost"]
            },
            {
                id: "gemini-3.0-flash",
                name: "Gemini 3.0 Flash",
                type: "chat",
                provider: "Google",
                inputCost: 0.50,
                outputCost: 3.00,
                dailyLimit: 50,
                monthlyLimit: 300,
                tags: ["fast", "low cost", "recommended"]
            },
            {
                id: "claude-haiku-4.5",
                name: "Claude Haiku 4.5",
                type: "chat",
                provider: "Anthropic",
                inputCost: 1.00,
                outputCost: 5.00,
                dailyLimit: 50,
                monthlyLimit: 150,
                tags: ["fast", "balanced", "writing"]
            },
            {
                id: "deepseek-v3.2",
                name: "DeepSeek V3.2",
                type: "chat",
                provider: "DeepSeek",
                inputCost: 0.27,
                outputCost: 1.10,
                dailyLimit: 100,
                monthlyLimit: 1000,
                tags: ["low cost", "open source", "recommended"]
            },
            {
                id: "kimi-k2.5",
                name: "Kimi K2.5",
                type: "chat",
                provider: "Moonshot AI",
                inputCost: 0.10,
                outputCost: 0.60,
                dailyLimit: 100,
                monthlyLimit: 1000,
                tags: ["fast", "low cost"]
            },
            {
                id: "gpt-image-1-mini",
                name: "GPT Image 1 Mini",
                type: "image",
                provider: "OpenAI",
                costPerImage: 0.005,
                dailyLimit: 10,
                monthlyLimit: 50,
                tags: ["fast", "image"]
            }
        ],
        features: [
            "Access to 7 fast chat models",
            "Limited access to premium models (10 msgs/day)",
            "Basic image generation (up to 75/day)",
            "Standard response speed",
            "Community support",
            "Chat history for 30 days"
        ]
    },

    pro: {
        name: "Pro",
        price: 1000,
        currency: "BDT",
        billing: "monthly",
        totalDailyChatLimit: 300,
        totalMonthlyChatLimit: 3000,
        totalDailyImageLimit: 25,
        totalMonthlyImageLimit: 100,
        models: [
            {
                id: "gpt-5.4-nano",
                name: "GPT-5.4 Nano",
                type: "chat",
                provider: "OpenAI",
                inputCost: 0.20,
                outputCost: 1.25,
                dailyLimit: 200,
                monthlyLimit: 3000,
                tags: ["fastest", "low cost"]
            },
            {
                id: "gpt-5.4-mini",
                name: "GPT-5.4 Mini",
                type: "chat",
                provider: "OpenAI",
                inputCost: 0.75,
                outputCost: 4.50,
                dailyLimit: 100,
                monthlyLimit: 250,
                tags: ["fast", "balanced"]
            },
            {
                id: "gemini-3.1-flash-lite-preview",
                name: "Gemini 3.1 Flash Lite",
                type: "chat",
                provider: "Google",
                inputCost: 0.25,
                outputCost: 1.50,
                dailyLimit: 200,
                monthlyLimit: 3000,
                tags: ["fastest", "low cost"]
            },
            {
                id: "gemini-3.0-flash",
                name: "Gemini 3.0 Flash",
                type: "chat",
                provider: "Google",
                inputCost: 0.50,
                outputCost: 3.00,
                dailyLimit: 100,
                monthlyLimit: 300,
                tags: ["fast", "balanced"]
            },
            {
                id: "claude-haiku-4.5",
                name: "Claude Haiku 4.5",
                type: "chat",
                provider: "Anthropic",
                inputCost: 1.00,
                outputCost: 5.00,
                dailyLimit: 100,
                monthlyLimit: 200,
                tags: ["fast", "balanced", "writing"]
            },
            {
                id: "deepseek-v3.2",
                name: "DeepSeek V3.2",
                type: "chat",
                provider: "DeepSeek",
                inputCost: 0.28,
                outputCost: 0.42,
                dailyLimit: 300,
                monthlyLimit: 3000,
                tags: ["low cost", "open source", "recommended"]
            },
            {
                id: "kimi-k2.5",
                name: "Kimi K2.5",
                type: "chat",
                provider: "Moonshot AI",
                inputCost: 0.10,
                outputCost: 0.60,
                dailyLimit: 300,
                monthlyLimit: 3000,
                tags: ["fast", "low cost"]
            },
            {
                id: "gpt-5.4",
                name: "GPT-5.4",
                type: "chat",
                provider: "OpenAI",
                inputCost: 2.50,
                outputCost: 15.00,
                dailyLimit: 25,
                monthlyLimit: 50,
                tags: ["premium", "flagship"]
            },
            {
                id: "claude-sonnet-4.6",
                name: "Claude Sonnet 4.6",
                type: "chat",
                provider: "Anthropic",
                inputCost: 3.00,
                outputCost: 15.00,
                dailyLimit: 25,
                monthlyLimit: 50,
                tags: ["premium", "coding", "long context"]
            },
            {
                id: "gemini-3.1-pro",
                name: "Gemini 3.1 Pro",
                type: "chat",
                provider: "Google",
                inputCost: 2.00,
                outputCost: 12.00,
                dailyLimit: 25,
                monthlyLimit: 50,
                tags: ["premium", "flagship", "multimodal"]
            },
            {
                id: "deepseek-v3.2",
                name: "DeepSeek V3.2",
                type: "chat",
                provider: "DeepSeek",
                inputCost: 0.27,
                outputCost: 1.10,
                dailyLimit: 500,
                monthlyLimit: 5000,
                tags: ["low cost", "open source", "recommended"]
            },
            {
                id: "kimi-k2.5",
                name: "Kimi K2.5",
                type: "chat",
                provider: "Moonshot AI",
                inputCost: 0.10,
                outputCost: 0.60,
                dailyLimit: 500,
                monthlyLimit: 5000,
                tags: ["fast", "low cost"]
            },

            {
                id: "gpt-image-1-mini",
                name: "GPT Image 1 Mini",
                type: "image",
                provider: "OpenAI",
                costPerImage: 0.005,
                dailyLimit: 20,
                monthlyLimit: 50,
                tags: ["fast", "image"]
            },
            {
                id: "imagen-4-standard",
                name: "Imagen 4 Standard",
                type: "image",
                provider: "Google",
                costPerImage: 0.04,
                dailyLimit: 10,
                monthlyLimit: 20,
                tags: ["balanced", "image"]
            },
            {
                id: "gpt-image-1.5",
                name: "GPT Image 1.5",
                type: "image",
                provider: "OpenAI",
                costPerImage: 0.045,
                dailyLimit: 10,
                monthlyLimit: 20,
                tags: ["balanced", "image"]
            },
            {
                id: "nano-banana-pro",
                name: "Nano Banana Pro",
                provider: "Google",
                costPerImage: 0.05,
                dailyLimit: 10,
                monthlyLimit: 20,
                tags: ["highest quality", "image"]
            },
        ],
        features: [
            "Unlimited access to 7 fast chat models",
            "50 msgs/day on premium models (GPT-5.4, Sonnet 4.6)",
            "30 msgs/day on Gemini 3.1 Pro",
            "10 msgs/day on Claude Opus 4.6 (most capable)",
            "Reasoning models (o4-mini, DeepSeek R2, o3)",
            "Premium image generation (up to 250/day)",
            "Access to 7 image models including Flux 2 Pro & Nano Banana Pro",
            "Priority response speed",
            "Priority email support",
            "Unlimited chat history",
            "API access (coming soon)"
        ]
    }
};