import { z } from "zod";
import type {
	HighLevelManualTesting,
	HighLevelRegroupedNode,
	HighLevelTestRegrouping,
} from "./types";

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

const regroupedNodeSchema: z.ZodType<HighLevelRegroupedNode> = z.lazy(() =>
	z.union([
		z.object({ id: z.string(), it: z.string().min(1) }),
		z.object({
			describe: z.string().min(1),
			children: z.array(regroupedNodeSchema),
		}),
	]),
);

const slicesInputSchema = z.union([
	slicesSchema.transform((slices) => ({ slices })),
	z.object({
		slices: slicesSchema,
		manualTesting: manualTestingSchema,
		tests: z.record(z.string(), z.array(regroupedNodeSchema)).optional(),
	}),
]);

export type HighLevelSliceInput = z.infer<typeof slicesSchema>[number];

type HighLevelSlicesInput = {
	slices: HighLevelSliceInput[];
	manualTesting?: HighLevelManualTesting;
	tests?: HighLevelTestRegrouping;
};

export function parseHighLevelSlicesInput(raw: unknown): HighLevelSlicesInput {
	const parsed = slicesInputSchema.safeParse(raw);
	if (!parsed.success)
		throw new Error(
			`slices must be a JSON array of {title, summary, hunks[]}, or {slices: [...], manualTesting: {setup[], steps[{action, expect}]}, tests?: {"<path>": [{describe, children[]} | {id, it}]}}: ${parsed.error.message}`,
		);
	return parsed.data;
}
