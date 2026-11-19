import type { BuildOutcome } from "./BuildOutcome";

export function reportBuildFailure(
	entry: string,
	outcome: Extract<BuildOutcome, { kind: "failed" }>,
	suffix = "",
): void {
	if (outcome.output.length > 0) process.stdout.write(outcome.output);
	console.error(
		`build "${entry}" failed with exit code ${outcome.exitCode}${suffix}`,
	);
	if (outcome.missingTool) console.error(outcome.missingTool);
}
