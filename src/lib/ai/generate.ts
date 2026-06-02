import { generateText, Output, type LanguageModel } from "ai";
import type { z } from "zod";

/**
 * Thin wrapper around the AI SDK v6 structured-output API.
 * Returns the parsed object, or null if the call fails for any reason
 * (missing key, network, schema mismatch) so callers can fall back to
 * deterministic local generation.
 */
export async function generateStructured<T extends z.ZodTypeAny>(args: {
  model: LanguageModel;
  schema: T;
  system: string;
  prompt: string;
}): Promise<z.infer<T> | null> {
  try {
    const { output } = await generateText({
      model: args.model,
      system: args.system,
      prompt: args.prompt,
      output: Output.object({ schema: args.schema }),
    });
    return output as z.infer<T>;
  } catch (err) {
    console.error("[generateStructured] falling back:", err);
    return null;
  }
}
