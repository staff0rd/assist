import { spawnPty } from "./spawnPty";

type SpawnOpts = {
	prompt?: string;
	resumeSessionId?: string;
	cwd?: string;
};

export function spawnClaude(opts: SpawnOpts = {}) {
	return spawnPty(buildArgs(opts), opts.cwd);
}

function buildArgs(opts: SpawnOpts): string[] {
	if (opts.resumeSessionId) return ["claude", "--resume", opts.resumeSessionId];
	if (opts.prompt) return ["claude", opts.prompt];
	return ["claude"];
}
