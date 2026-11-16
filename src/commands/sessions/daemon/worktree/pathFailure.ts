import type { InstallFailure, InstallOutcome } from "./SeedOutcome";

export function pathFailure(
	path: string,
	outcome: InstallOutcome,
): InstallFailure | undefined {
	if (outcome.ok) return undefined;
	return { path, reason: outcome.reason, output: outcome.output };
}
