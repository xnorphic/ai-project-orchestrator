import { NextResponse } from "next/server";
import { claude, hasAnthropicKey } from "@/lib/ai/models";
import { generateStructured } from "@/lib/ai/generate";
import { prdSchema } from "@/lib/ai/schemas";
import { fallbackPRD } from "@/lib/logic/prd-fallback";

export const maxDuration = 60;

const SYSTEM = `You are the PRD Agent in an AI Project Orchestrator.
Turn a rough product idea into a crisp, realistic PRD plus a short set of
clarifying questions. Be specific and concrete. Avoid fluff. Each clarifying
question must include 2-4 options and a single recommended answer, and target
decisions that materially change timeline, staffing, or risk.`;

export async function POST(req: Request) {
  const { idea } = (await req.json()) as { idea?: string };
  const cleanIdea = (idea ?? "").trim();

  if (!cleanIdea) {
    return NextResponse.json({ error: "idea is required" }, { status: 400 });
  }

  if (hasAnthropicKey()) {
    const ai = await generateStructured({
      model: claude(),
      schema: prdSchema,
      system: SYSTEM,
      prompt: `Product idea:\n"""${cleanIdea}"""\n\nProduce the PRD and 4-6 clarifying questions.`,
    });
    if (ai) {
      return NextResponse.json({ ...ai, source: "claude" });
    }
  }

  return NextResponse.json({ ...fallbackPRD(cleanIdea), source: "fallback" });
}
