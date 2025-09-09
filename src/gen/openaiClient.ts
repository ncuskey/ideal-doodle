import OpenAI from "openai";
import "dotenv/config"; // <-- loads .env

export const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Quality-first
export const MODEL_FULL = "gpt-5";        // use for full lore (state/burg deep)
export const MODEL_SUMMARY = "gpt-5-nano"; // use for batch summaries
export const MODEL_CHEAP = "gpt-5-mini";   // use for partial regen, cheap hooks
