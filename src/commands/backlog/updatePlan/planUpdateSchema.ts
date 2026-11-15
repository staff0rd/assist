import { z } from "zod";
import { refinePhaseDependsOn } from "../dependsOn/refinePhaseDependsOn";
import { proposedPhaseSchema } from "../propose/proposedItemSchema";

export const planUpdateSchema = z.strictObject({
	phases: z
		.array(proposedPhaseSchema)
		.min(1, "a plan needs at least one phase")
		.superRefine(refinePhaseDependsOn),
});

export type PlanUpdate = z.infer<typeof planUpdateSchema>;
export type PlanUpdatePhase = PlanUpdate["phases"][number];
