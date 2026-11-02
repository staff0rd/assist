import { z } from "zod";

const slicesInputSchema = z.array(
	z.object({
		title: z.string().min(1),
		summary: z.string(),
		hunks: z.array(z.string()),
	}),
);

export type HighLevelSliceInput = z.infer<typeof slicesInputSchema>[number];

export function parseHighLevelSlicesInput(raw: unknown): HighLevelSliceInput[] {
	const parsed = slicesInputSchema.safeParse(raw);
	if (!parsed.success)
		throw new Error(
			`slices must be a JSON array of {title, summary, hunks[]}: ${parsed.error.message}`,
		);
	return parsed.data;
}
