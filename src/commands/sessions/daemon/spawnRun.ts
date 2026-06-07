import { spawnPty } from "./spawnPty";

type SpawnRunOpts = {
	name: string;
	args?: string[];
	cwd?: string;
};

export function spawnRun(opts: SpawnRunOpts) {
	return spawnPty(["assist", "run", opts.name, ...(opts.args ?? [])], opts.cwd);
}
