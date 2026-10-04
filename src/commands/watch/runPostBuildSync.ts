import { runCommandToCompletion } from "../run/runCommandToCompletion";
import type { BuildOutcome } from "./BuildOutcome";
import { toBuildOutcome } from "./toBuildOutcome";

export async function runPostBuildSync(): Promise<BuildOutcome> {
	return toBuildOutcome(
		await runCommandToCompletion(
			"assist",
			["sync", "--yes"],
			undefined,
			undefined,
			true,
		),
	);
}
