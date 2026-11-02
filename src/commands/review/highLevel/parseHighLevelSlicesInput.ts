import { z } from "zod";
import type { HighLevelManualTesting } from "./types";

const slicesSchema = z.array(
	z.object({
		title: z.string().min(1),
		summary: z.string(),
		hunks: z.array(z.string()),
	}),
);

const manualTestingSchema = z.object({
	setup: z.array(z.string()),
	steps: z.array(z.object({ action: z.string(), expect: z.string() })),
});

const slicesInputSchema = z.union([
	slicesSchema.transform((slices) => ({ slices })),
	z.object({ slices: slicesSchema, manualTesting: manualTestingSchema }),
]);

export type HighLevelSliceInput = z.infer<typeof slicesSchema>[number];

type HighLevelSlicesInput = {
	slices: HighLevelSliceInput[];
	manualTesting?: HighLevelManualTesting;
};

export function parseHighLevelSlicesInput(raw: unknown): HighLevelSlicesInput {
	const parsed = slicesInputSchema.safeParse(raw);
	if (!parsed.success)
		throw new Error(
			`slices must be a JSON array of {title, summary, hunks[]}, or {slices: [...], manualTesting: {setup[], steps[{action, expect}]}}: ${parsed.error.message}`,
		);
	return parsed.data;
}
