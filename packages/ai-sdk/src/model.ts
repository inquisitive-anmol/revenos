import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";

const env = process.env.NODE_ENV || "development";

export const getModel = () => {
  if (env === "production") {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    return anthropic("claude-sonnet-4-20250514");
  }

  // Development — Gemini free tier
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });
  return google("gemini-2.5-flash");
};