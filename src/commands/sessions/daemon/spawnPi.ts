import { piTerminalArgs } from "../../../shared/piTerminalArgs";
import { spawnPty } from "./spawnPty";

type SpawnOpts = {
	prompt?: string;
	cwd?: string;
	sessionId?: string;
	model?: string;
};

export function spawnPi(opts: SpawnOpts = {}) {
	const args = ["pi", ...piTerminalArgs];
	if (opts.model) args.push("--model", opts.model);
	if (opts.prompt) args.push(opts.prompt);
	return spawnPty(args, opts.cwd, opts.sessionId, { ASSIST_HARNESS: "pi" });
}
