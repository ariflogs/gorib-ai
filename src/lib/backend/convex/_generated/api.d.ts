/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as ai_generation from "../ai_generation.js";
import type * as betterAuth from "../betterAuth.js";
import type * as chat from "../chat.js";
import type * as conversations from "../conversations.js";
import type * as functions from "../functions.js";
import type * as messages from "../messages.js";
import type * as rate_limiter from "../rate_limiter.js";
import type * as storage from "../storage.js";
import type * as subscriptions from "../subscriptions.js";
import type * as user_enabled_models from "../user_enabled_models.js";
import type * as user_keys from "../user_keys.js";
import type * as user_rules from "../user_rules.js";
import type * as user_settings from "../user_settings.js";
import type * as utils_array from "../utils/array.js";
import type * as utils_config from "../utils/config.js";
import type * as utils_markdown_renderer from "../utils/markdown_renderer.js";
import type * as utils_models from "../utils/models.js";
import type * as utils_rules from "../utils/rules.js";
import type * as utils_types from "../utils/types.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ai_generation: typeof ai_generation;
  betterAuth: typeof betterAuth;
  chat: typeof chat;
  conversations: typeof conversations;
  functions: typeof functions;
  messages: typeof messages;
  rate_limiter: typeof rate_limiter;
  storage: typeof storage;
  subscriptions: typeof subscriptions;
  user_enabled_models: typeof user_enabled_models;
  user_keys: typeof user_keys;
  user_rules: typeof user_rules;
  user_settings: typeof user_settings;
  "utils/array": typeof utils_array;
  "utils/config": typeof utils_config;
  "utils/markdown_renderer": typeof utils_markdown_renderer;
  "utils/models": typeof utils_models;
  "utils/rules": typeof utils_rules;
  "utils/types": typeof utils_types;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
