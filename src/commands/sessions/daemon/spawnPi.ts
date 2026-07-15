import { spawnPty } from "./spawnPty";

type SpawnOpts = {
	prompt?: string;
	cwd?: string;
	sessionId?: string;
};

export function spawnPi(opts: SpawnOpts = {}) {
	const args = ["pi"];
	if (opts.prompt) args.push(opts.prompt);
	return spawnPty(args, opts.cwd, opts.sessionId);
}
