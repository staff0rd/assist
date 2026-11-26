import { z } from "zod";
import type { Verdict } from "./StepVerdict";

const verdictSchema = z.object({
	verdict: z.enum(["pass", "fail", "unsure"]),
	note: z.string().trim().min(1),
});

export function parseStepVerdict(raw: unknown): {
	verdict: Verdict;
	note: string;
} {
	const parsed = verdictSchema.safeParse(raw);
	if (!parsed.success)
		throw new Error(
			`A verdict needs verdict (pass, fail or unsure) and a non-empty note: ${parsed.error.message}`,
		);
	return parsed.data;
}
