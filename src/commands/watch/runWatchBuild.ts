import { findRunConfig } from "../run/findRunConfig";
import { resolveParams } from "../run/resolveParams";
import { MissingRunCwdError, resolveRunCwd } from "../run/resolveRunCwd";
import { runCommandToCompletion } from "../run/runCommandToCompletion";
import { runPreCommands } from "../run/runPreCommands";
import type { BuildOutcome } from "./BuildOutcome";
import { toBuildOutcome } from "./toBuildOutcome";

export async function runWatchBuild(entry: string): Promise<BuildOutcome> {
	const config = findRunConfig(entry);
	let cwd: string | undefined;
	try {
		cwd = resolveRunCwd(config);
	} catch (error) {
		if (!(error instanceof MissingRunCwdError)) throw error;
		return { kind: "failed", exitCode: 1, output: error.message };
	}
	if (config.pre) runPreCommands(config.pre, cwd, true);

	return toBuildOutcome(
		await runCommandToCompletion(
			config.command,
			[...(config.args ?? []), ...resolveParams(config.params, [])],
			config.env,
			cwd,
			true,
		),
	);
}
