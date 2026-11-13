import { z } from "zod";
import { REVIEW_PHASE_NAME } from "../buildPhasePrompt";

const PHASE_DEFINITION = /^\W*phase\s+\d+\s*[:.)\-–—]/i;

export const proposedPhaseSchema = z.strictObject({
	name: z
		.string()
		.trim()
		.min(1, "phase name is required")
		.refine(
			(name) => name.toLowerCase() !== REVIEW_PHASE_NAME.toLowerCase(),
			`"${REVIEW_PHASE_NAME}" is owned by the runner and appended to every plan automatically — remove this phase`,
		),
	tasks: z
		.array(z.string().trim().min(1))
		.min(1, "a phase needs at least one task"),
	manualChecks: z.array(z.string().trim().min(1)).default([]),
});

export const proposedItemSchema = z.strictObject({
	name: z.string().trim().min(1, "name is required"),
	type: z.enum(["story", "bug"]),
	description: z.string().optional(),
	acceptanceCriteria: z
		.array(
			z
				.string()
				.trim()
				.min(1)
				.refine(
					(criterion) => !PHASE_DEFINITION.test(criterion),
					"reads as a phase definition — move it to `phases` as { name, tasks } and keep acceptance criteria to conditions that confirm the item is done",
				),
		)
		.default([]),
	phases: z.array(proposedPhaseSchema).default([]),
});

export type ProposedItem = z.infer<typeof proposedItemSchema>;
