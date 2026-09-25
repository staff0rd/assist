import { buildHarnessCodexArgs } from "../../../shared/buildHarnessCodexArgs";
import { spawnPty } from "./spawnPty";

type SpawnOpts = {
	prompt?: string;
	resumeSessionId?: string;
	cwd?: string;
	sessionId?: string;
};

export function spawnCodex(opts: SpawnOpts = {}) {
	const override = buildHarnessCodexArgs();
	return spawnPty(
		["codex", ...override.args, ...codexArgs(opts)],
		opts.cwd,
		opts.sessionId,
		override.env,
	);
}

function codexArgs(opts: SpawnOpts): string[] {
	const prompt = opts.prompt ? [opts.prompt] : [];
	if (opts.resumeSessionId) return ["resume", opts.resumeSessionId, ...prompt];
	return prompt;
}
