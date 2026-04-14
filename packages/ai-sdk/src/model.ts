import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, streamText, LanguageModel } from "ai";

const env = process.env.NODE_ENV || "development";

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 1000;

export const getModel = (): LanguageModel => {
  if (env === "production") {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    return anthropic("claude-sonnet-4-20250514");
  }

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });
  return google("gemini-2.5-flash");
};

// Retry wrapper — use this instead of calling generateText directly
export async function generateWithRetry(
  params: Parameters<typeof generateText>[0],
  retries = MAX_RETRIES
): Promise<Awaited<ReturnType<typeof generateText>>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await generateText(params);
    } catch (err: any) {
      const status = err?.statusCode ?? err?.status ?? err?.cause?.status;
      const isOverloaded = status === 529 || status === 503;
      const isLastAttempt = attempt === retries;

      if (!isOverloaded || isLastAttempt) throw err;

      const delay = BASE_DELAY_MS * 2 ** attempt + Math.random() * 500;
      console.warn(
        `[ai-sdk] Claude ${status} on attempt ${attempt + 1}. Retrying in ${Math.round(delay)}ms...`
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  // Unreachable, but satisfies TS
  throw new Error("generateWithRetry exhausted");
}