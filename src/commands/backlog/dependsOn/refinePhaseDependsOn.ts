import type { z } from "zod";
import { dependsOnError } from "./dependsOnError";

/** Zod refinement: every phase's `dependsOn` names only earlier phases. */
export function refinePhaseDependsOn(
	phases: readonly { dependsOn?: number[] }[],
	ctx: z.RefinementCtx,
): void {
	for (const [idx, phase] of phases.entries()) {
		const error = phase.dependsOn && dependsOnError(phase.dependsOn, idx + 1);
		if (error)
			ctx.addIssue({
				code: "custom",
				path: [idx, "dependsOn"],
				message: error,
			});
	}
}
